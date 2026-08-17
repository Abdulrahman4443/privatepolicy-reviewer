document.getElementById('scanBtn').addEventListener('click', async () => {
  const btn = document.getElementById('scanBtn');
  const statusEl = document.getElementById('status');
  const riskListEl = document.getElementById('riskList');
  const verdictBoxEl = document.getElementById('verdictBox');
  const tipsBoxEl = document.getElementById('tipsBox');
  const disclaimerEl = document.getElementById('disclaimer');

  btn.disabled = true;
  statusEl.textContent = 'Analyzing page text…';
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
          statusEl.textContent = 'Unable to read page text.';
          return;
        }
        statusEl.textContent = 'Auditing policy terms…';
        chrome.runtime.sendMessage({ action: "ANALYZE_POLICY", text: response.text }, (a) => {
          reset();
          if (chrome.runtime.lastError || !a) { statusEl.textContent = 'Audit failed.'; return; }

          statusEl.textContent = a.methodUsed + ' · ' + a.risks.length + ' threat' + (a.risks.length !== 1 ? 's' : '') + ' cataloged';

          // Verdict Banner
          if (a.verdict) {
            const v = a.verdict;
            verdictBoxEl.innerHTML =
              '<div class="verdict-card ' + v.cssClass + '">' +
                '<span class="verdict-rating">' + v.rating + '</span>' +
                '<span class="verdict-tag">' + (v.worthIt ? 'Acceptable with Caution' : 'High Concern') + '</span>' +
              '</div>';
          }

          // Findings
          if (a.risks && a.risks.length > 0) {
            let html = '<div class="section-title"><span>Identified Concerns</span> <span class="section-count">' + a.risks.length + '</span></div>';
            a.risks.forEach(r => {
              const sev = (r.severity || 'MEDIUM').toLowerCase();
              html +=
                '<div class="finding-card">' +
                  '<div class="finding-head">' +
                    '<span class="badge-stamp ' + sev + '">' + esc(r.severity) + '</span>' +
                    '<span class="finding-title">' + esc(r.title) + '</span>' +
                  '</div>' +
                  (r.impact ? '<div class="finding-impact">' + esc(r.impact) + '</div>' : '') +
                  (r.quote ? '<div class="finding-quote">"' + esc(r.quote) + '"</div>' : '') +
                '</div>';
            });
            riskListEl.innerHTML = html;
          } else {
            riskListEl.innerHTML = '<div style="color: #86efac; font-size: 12px; font-weight: 600; text-align: center; padding: 10px 0;">🛡️ No privacy threats detected on this page.</div>';
          }

          // Tips
          if (a.tips && a.tips.length > 0) {
            let t = '<div class="measures-box"><div class="section-title" style="margin-bottom: 6px;">Recommended Measures</div>';
            a.tips.forEach(tip => { t += '<div class="measure-item">🛡️ ' + esc(tip) + '</div>'; });
            t += '</div>';
            tipsBoxEl.innerHTML = t;
          }

          disclaimerEl.innerHTML = '<div class="footer-note">Informational Local Audit · Not Legal Advice</div>';

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
