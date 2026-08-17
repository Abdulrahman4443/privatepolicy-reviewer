// Guard against multiple injections from repeated executeScript calls
if (!window._privacyAuditorInjected) {
  window._privacyAuditorInjected = true;

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "EXTRACT_TEXT") {
      // Increased limit to 50,000 chars so we don't miss content deep in long policies
      const pageText = document.body.innerText.substring(0, 50000);
      sendResponse({ text: pageText });
    }

    if (message.action === "HIGHLIGHT_RISKS") {
      highlightPatterns(message.patterns);
      sendResponse({ done: true });
    }

    return true;
  });
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
