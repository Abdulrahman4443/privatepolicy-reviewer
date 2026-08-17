// Guard against multiple injections from repeated executeScript calls
if (!window._privacyAuditorInjected) {
  window._privacyAuditorInjected = true;

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "EXTRACT_TEXT") {
      const pageText = document.body.innerText.substring(0, 50000);
      sendResponse({ text: pageText });
    }

    if (message.action === "RUN_CHROME_AI") {
      runLocalChromeAI(message.text).then(sendResponse);
      return true;
    }

    if (message.action === "HIGHLIGHT_RISKS") {
      highlightPatterns(message.patterns);
      sendResponse({ done: true });
    }

    return true;
  });
}

async function runLocalChromeAI(policyText) {
  try {
    const aiApi = typeof ai !== 'undefined' ? ai : (typeof window !== 'undefined' && window.ai) ? window.ai : null;
    if (!aiApi || !aiApi.languageModel) return null;

    const capabilities = await aiApi.languageModel.capabilities();
    if (capabilities && capabilities.available !== "no") {
      const session = await aiApi.languageModel.create({
        systemPrompt: "You are a privacy policy auditor. List ONLY red flag clauses (data selling, AI training, forced arbitration, ad tracking). Format each line: SEVERITY | Title | Description."
      });
      const response = await session.prompt(policyText.substring(0, 15000));
      if (session.destroy) session.destroy();
      return response;
    }
  } catch (err) {
    console.warn("Content script Chrome AI error:", err);
  }
  return null;
}

function highlightPatterns(patterns) {
  if (!patterns || patterns.length === 0) return;

  // Remove any previous highlights first
  document.querySelectorAll('mark.privacy-auditor-hl').forEach(el => {
    const parent = el.parentNode;
    parent.replaceChild(document.createTextNode(el.textContent), el);
    parent.normalize();
  });

  // Inject highlight style once
  if (!document.getElementById('privacy-auditor-style')) {
    const style = document.createElement('style');
    style.id = 'privacy-auditor-style';
    style.textContent = `
      mark.privacy-auditor-hl {
        background: linear-gradient(180deg, transparent 55%, #fecaca 55%);
        border-bottom: 2px solid #dc2626;
        padding: 1px 3px;
        border-radius: 2px;
        cursor: help;
        transition: background 0.2s;
      }
      mark.privacy-auditor-hl:hover {
        background: #fecaca !important;
      }
    `;
    document.head.appendChild(style);
  }

  // For each pattern, walk the DOM and highlight matches
  patterns.forEach(patternStr => {
    try {
      const regex = new RegExp(patternStr, 'gi');

      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            const tag = parent.tagName;
            if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
            if (parent.classList.contains('privacy-auditor-hl')) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );

      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);

      nodes.forEach(node => {
        const text = node.textContent;
        regex.lastIndex = 0;
        if (!regex.test(text)) return;
        regex.lastIndex = 0;

        const fragment = document.createDocumentFragment();
        let lastIdx = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
          if (match[0].length === 0) break; // prevent infinite loop
          if (match.index > lastIdx) {
            fragment.appendChild(document.createTextNode(text.slice(lastIdx, match.index)));
          }
          const mark = document.createElement('mark');
          mark.className = 'privacy-auditor-hl';
          mark.title = '⚠️ Privacy red flag detected by Privacy Auditor';
          mark.textContent = match[0];
          fragment.appendChild(mark);
          lastIdx = regex.lastIndex;
        }

        if (lastIdx > 0) {
          if (lastIdx < text.length) {
            fragment.appendChild(document.createTextNode(text.slice(lastIdx)));
          }
          node.parentNode.replaceChild(fragment, node);
        }
      });
    } catch (e) {
      console.error('Privacy Auditor highlight error:', e);
    }
  });

  // Scroll to the first highlight
  const first = document.querySelector('mark.privacy-auditor-hl');
  if (first) {
    first.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
