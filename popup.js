document.getElementById('scanBtn').addEventListener('click', async () => {
  const btn = document.getElementById('scanBtn');
  const statusEl = document.getElementById('status');
  const riskListEl = document.getElementById('riskList');
  const verdictBoxEl = document.getElementById('verdictBox');
  const tipsBoxEl = document.getElementById('tipsBox');
  const disclaimerEl = document.getElementById('disclaimer');

  btn.disabled = true;
  statusEl.textContent = 'Unrolling page scroll…';
  riskListEl.innerHTML = '';
  verdictBoxEl.innerHTML = '';
  tipsBoxEl.innerHTML = '';
  disclaimerEl.innerHTML = '';

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] }, () => {
    setTimeout(() => {
      chrome.tabs.sendMessage(tab.id, { action: "EXTRACT_TEXT" }, (response) => {
        if (chrome.runtime.lastError || !response || !response.text) {
          reset();
          statusEl.textContent = 'Could not inspect page text.';
          return;
        }
        statusEl.textContent = 'Auditing scroll entries…';
        chrome.runtime.sendMessage({ action: "ANALYZE_POLICY", text: response.text }, (a) => {
          reset();
          if (chrome.runtime.lastError || !a) { statusEl.textContent = 'Audit interrupted.'; return; }

          statusEl.textContent = a.methodUsed + ' · ' + a.risks.length + ' threat' + (a.risks.length !== 1 ? 's' : '') + ' cataloged';

          // Verdict Plaque
          if (a.verdict) {
            const v = a.verdict;
            verdictBoxEl.innerHTML =
              '<div class="verdict-plaque ' + v.cssClass + '">' +
                '<div class="verdict-title">' + v.rating + '</div>' +
                '<div class="verdict-sub">' + (v.worthIt ? 'Acceptable with Caution' : 'High Concern / Not Recommended') + '</div>' +
              '</div>';
          }

          // Findings
          if (a.risks && a.risks.length > 0) {
            let html = '<div class="ledger-section-title"><span>Cataloged Threats</span> <span>' + a.risks.length + '</span></div>';
            a.risks.forEach(r => {
              const sev = (r.severity || 'MEDIUM').toLowerCase();
              const badgeLetter = sev === 'critical' ? 'CR' : (sev === 'high' ? 'HI' : 'MD');
              html +=
                '<div class="finding-entry">' +
                  '<div class="finding-entry-top">' +
                    '<div class="wax-badge ' + sev + '">' + badgeLetter + '</div>' +
                    '<div class="finding-title">' + esc(r.title) + '</div>' +
                  '</div>' +
                  (r.impact ? '<div class="finding-impact">' + esc(r.impact) + '</div>' : '') +
                  (r.quote ? '<div class="finding-quote">"' + esc(r.quote) + '"</div>' : '') +
                '</div>';
            });
            riskListEl.innerHTML = html;
          } else {
            riskListEl.innerHTML = '<div style="color: #15803d; font-family: \'Cinzel\', serif; font-size: 12px; font-weight: 700; text-align: center; padding: 10px 0;">📜 No Privacy Red Flags Discovered.</div>';
          }

          // Tips
          if (a.tips && a.tips.length > 0) {
            let t = '<div class="tips-block"><div class="ledger-section-title" style="border:none; margin-bottom: 4px;">Recommended Measures</div>';
            a.tips.forEach(tip => { t += '<div class="tip-item">✒️ ' + esc(tip) + '</div>'; });
            t += '</div>';
            tipsBoxEl.innerHTML = t;
          }

          disclaimerEl.innerHTML = '<div class="footer-stamp">Authentic Local Ledger Audit · Informational Purpose Only</div>';

          // Highlight on page
          if (a.matchedPatterns && a.matchedPatterns.length > 0) {
            chrome.tabs.sendMessage(tab.id, { action: "HIGHLIGHT_RISKS", patterns: a.matchedPatterns });
          }
        });
      });
    }, 200);
  });

  function reset() { btn.disabled = false; }
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
});
