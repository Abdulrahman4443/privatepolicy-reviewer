document.getElementById('scanBtn').addEventListener('click', async () => {
  const btn = document.getElementById('scanBtn');
  const statusEl = document.getElementById('status');
  const riskListEl = document.getElementById('riskList');
  const verdictBoxEl = document.getElementById('verdictBox');
  const tipsBoxEl = document.getElementById('tipsBox');
  const disclaimerEl = document.getElementById('disclaimer');

  // Reset & Loading
  btn.textContent = 'Scanning…';
  btn.disabled = true;
  statusEl.textContent = 'Extracting page content…';
  riskListEl.innerHTML = '';
  verdictBoxEl.innerHTML = '';
  tipsBoxEl.innerHTML = '';
  disclaimerEl.innerHTML = '';

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  }, () => {
    setTimeout(() => {
      chrome.tabs.sendMessage(tab.id, { action: "EXTRACT_TEXT" }, (response) => {
        if (chrome.runtime.lastError || !response || !response.text) {
          resetButton();
          statusEl.textContent = 'Unable to read page content.';
          return;
        }

        statusEl.textContent = 'Analyzing privacy terms…';

        chrome.runtime.sendMessage({ action: "ANALYZE_POLICY", text: response.text }, (analysis) => {
          resetButton();

          if (chrome.runtime.lastError || !analysis) {
            statusEl.textContent = 'Analysis failed.';
            return;
          }

          statusEl.textContent = `${analysis.methodUsed} · ${analysis.risks.length} threats found`;

          // --- Minimal Verdict Banner ---
          if (analysis.verdict) {
            const v = analysis.verdict;
            verdictBoxEl.innerHTML = `
              <div class="verdict-banner ${v.cssClass}">
                <span>${v.rating}</span>
                <span>${v.worthIt ? 'Acceptable with caution' : 'High concern'}</span>
              </div>
            `;
          }

          // --- Minimal Threat Rows ---
          if (analysis.risks && analysis.risks.length > 0) {
            const header = document.createElement('div');
            header.className = 'threats-header';
            header.textContent = `Identified Concerns (${analysis.risks.length})`;
            riskListEl.appendChild(header);

            analysis.risks.forEach((risk) => {
              const sevLower = (risk.severity || 'medium').toLowerCase();
              const row = document.createElement('div');
              row.className = 'threat-row';

              let html = `
                <div class="threat-meta">
                  <span class="threat-badge ${sevLower}">${risk.severity}</span>
                  <span class="threat-name">${escapeHtml(risk.title)}</span>
                </div>
              `;

              if (risk.impact) {
                html += `<div class="threat-desc">${escapeHtml(risk.impact)}</div>`;
              }
              if (risk.quote) {
                html += `<div class="threat-quote">"${escapeHtml(risk.quote)}"</div>`;
              }

              row.innerHTML = html;
              riskListEl.appendChild(row);
            });
          } else {
            riskListEl.innerHTML = `<div class="threat-row" style="color: #166534; font-size: 12px;">✓ No privacy threats detected.</div>`;
          }

          // --- Minimal Tips ---
          if (analysis.tips && analysis.tips.length > 0) {
            let tipsHtml = `<div class="tips-box"><div class="tips-title">Recommended Actions</div>`;
            analysis.tips.forEach(tip => {
              tipsHtml += `<div class="tip-line">• ${escapeHtml(tip)}</div>`;
            });
            tipsHtml += `</div>`;
            tipsBoxEl.innerHTML = tipsHtml;
          }

          // --- Minimal Disclaimer ---
          disclaimerEl.innerHTML = `<div class="disclaimer">Quoted text is for informational reference.</div>`;

          // --- Webpage Highlighting ---
          if (analysis.matchedPatterns && analysis.matchedPatterns.length > 0) {
            chrome.tabs.sendMessage(tab.id, {
              action: "HIGHLIGHT_RISKS",
              patterns: analysis.matchedPatterns
            });
          }
        });
      });
    }, 200);
  });

  function resetButton() {
    btn.textContent = 'Scan Policy';
    btn.disabled = false;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
