document.getElementById('scanBtn').addEventListener('click', async () => {
  const btn = document.getElementById('scanBtn');
  const statusEl = document.getElementById('status');
  const riskListEl = document.getElementById('riskList');
  const verdictBoxEl = document.getElementById('verdictBox');
  const tipsBoxEl = document.getElementById('tipsBox');
  const disclaimerEl = document.getElementById('disclaimer');

  // Reset UI & show scanning state
  btn.classList.add('scanning');
  btn.textContent = '\u23F3 Scanning\u2026';
  btn.disabled = true;
  statusEl.textContent = "Extracting page text\u2026";
  riskListEl.innerHTML = "";
  verdictBoxEl.innerHTML = "";
  tipsBoxEl.innerHTML = "";
  disclaimerEl.innerHTML = "";

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Inject content script
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  }, () => {
    // Small delay to let content script register its listener
    setTimeout(() => {
      chrome.tabs.sendMessage(tab.id, { action: "EXTRACT_TEXT" }, (response) => {
        if (chrome.runtime.lastError || !response || !response.text) {
          resetButton();
          statusEl.textContent = "\u26A0 Could not read page text. Try refreshing the page first.";
          return;
        }

        statusEl.textContent = "Analyzing policy text locally\u2026";

        chrome.runtime.sendMessage({ action: "ANALYZE_POLICY", text: response.text }, (analysis) => {
          resetButton();

          if (chrome.runtime.lastError || !analysis) {
            statusEl.textContent = "\u26A0 Analysis failed. Please try again.";
            return;
          }

          statusEl.textContent = `Scan complete \u00B7 ${analysis.methodUsed} \u00B7 ${analysis.risks.length} issue${analysis.risks.length !== 1 ? 's' : ''} found`;

          // ---- Verdict Card ----
          if (analysis.verdict) {
            const v = analysis.verdict;
            const worthIcon = v.worthIt ? '\u2705' : '\u274C';
            const worthLabel = v.worthIt ? 'Yes, with precautions' : 'Not recommended for privacy-conscious users';

            verdictBoxEl.innerHTML = `
              <div class="verdict-card ${v.cssClass}">
                <div class="verdict-title">${v.rating}</div>
                <div class="verdict-worth"><strong>Worth using?</strong> ${worthIcon} ${worthLabel}</div>
                <div class="verdict-desc">${v.description}</div>
              </div>
            `;
          }

          // ---- Risk List ----
          if (analysis.risks && analysis.risks.length > 0) {
            const header = document.createElement('div');
            header.className = 'risk-header';
            header.innerHTML = `Threats Found <span class="risk-count">${analysis.risks.length}</span>`;
            riskListEl.appendChild(header);

            analysis.risks.forEach((risk, i) => {
              const sevLower = (risk.severity || 'medium').toLowerCase();
              const div = document.createElement('div');
              div.className = `risk-item ${sevLower}-risk`;
              div.style.animationDelay = `${i * 0.06}s`;

              let html = `<span class="severity-badge ${sevLower}">${risk.severity}</span>`;
              html += `<div class="risk-title">${escapeHtml(risk.title)}</div>`;
              if (risk.impact) {
                html += `<div class="risk-impact">${escapeHtml(risk.impact)}</div>`;
              }
              if (risk.quote) {
                html += `<div class="risk-quote">${escapeHtml(risk.quote)}</div>`;
              }

              div.innerHTML = html;
              riskListEl.appendChild(div);
            });
          } else {
            riskListEl.innerHTML = `<div class="risk-item safe-item"><strong>\u2705 No privacy threats detected on this page.</strong></div>`;
          }

          // ---- Actionable Tips ----
          if (analysis.tips && analysis.tips.length > 0) {
            let tipsHtml = `<div class="tips-section"><h4>\u{1F6E1}\uFE0F Recommended Actions</h4>`;
            analysis.tips.forEach(tip => {
              tipsHtml += `<div class="tip-item">${escapeHtml(tip)}</div>`;
            });
            tipsHtml += `</div>`;
            tipsBoxEl.innerHTML = tipsHtml;
          }

          // ---- Disclaimer ----
          disclaimerEl.innerHTML = `<div class="disclaimer">This tool quotes policy text for informational purposes only. It does not constitute legal advice. Consult a qualified attorney for legal questions.</div>`;

          // ---- Highlight red flags on the actual webpage ----
          if (analysis.matchedPatterns && analysis.matchedPatterns.length > 0) {
            chrome.tabs.sendMessage(tab.id, {
              action: "HIGHLIGHT_RISKS",
              patterns: analysis.matchedPatterns
            });
          }
        });
      });
    }, 250);
  });

  function resetButton() {
    btn.classList.remove('scanning');
    btn.textContent = '\uD83D\uDD0D Scan This Page';
    btn.disabled = false;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
