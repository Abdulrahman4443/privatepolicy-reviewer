document.getElementById('scanBtn').addEventListener('click', async () => {
  const btn = document.getElementById('scanBtn');
  const statusEl = document.getElementById('status');
  const riskListEl = document.getElementById('riskList');
  const verdictBoxEl = document.getElementById('verdictBox');
  const tipsBoxEl = document.getElementById('tipsBox');
  const disclaimerEl = document.getElementById('disclaimer');

  btn.textContent = 'Scanning…';
  btn.disabled = true;
  statusEl.textContent = 'Reading page content…';
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
          statusEl.textContent = 'Could not read this page.';
          return;
        }
        statusEl.textContent = 'Analyzing policy…';
        chrome.runtime.sendMessage({ action: "ANALYZE_POLICY", text: response.text }, (a) => {
          reset();
          if (chrome.runtime.lastError || !a) { statusEl.textContent = 'Analysis failed.'; return; }

          statusEl.textContent = a.methodUsed + ' · ' + a.risks.length + ' issue' + (a.risks.length !== 1 ? 's' : '') + ' found';

          // Verdict
          if (a.verdict) {
            const v = a.verdict;
            verdictBoxEl.innerHTML =
              '<div class="verdict-strip ' + v.cssClass + '">' +
                '<span>' + v.rating + '</span>' +
                '<span class="verdict-sub">' + (v.worthIt ? 'Use with caution' : 'Not recommended') + '</span>' +
              '</div>';
          }

          // Findings
          if (a.risks && a.risks.length > 0) {
            let html = '<div class="sec-head">Findings <span class="sec-count">' + a.risks.length + '</span></div>';
            a.risks.forEach(r => {
              const sev = (r.severity || 'MEDIUM').toLowerCase();
              html +=
                '<div class="finding f-' + sev + '">' +
                  '<div class="f-top">' +
                    '<span class="f-sev s-' + sev + '">' + esc(r.severity) + '</span>' +
                    '<span class="f-name">' + esc(r.title) + '</span>' +
                  '</div>' +
                  (r.impact ? '<div class="f-impact">' + esc(r.impact) + '</div>' : '') +
                  (r.quote ? '<div class="f-quote">"' + esc(r.quote) + '"</div>' : '') +
                '</div>';
            });
            riskListEl.innerHTML = html;
          } else {
            riskListEl.innerHTML = '<div class="safe-msg">✓ No privacy issues detected on this page.</div>';
          }

          // Tips
          if (a.tips && a.tips.length > 0) {
            let t = '<div class="tips-wrap"><div class="sec-head">Recommended Actions</div>';
            a.tips.forEach(tip => { t += '<div class="tip-row">· ' + esc(tip) + '</div>'; });
            t += '</div>';
            tipsBoxEl.innerHTML = t;
          }

          disclaimerEl.innerHTML = '<div class="foot">For informational purposes only. Not legal advice.</div>';

          // Highlight on page
          if (a.matchedPatterns && a.matchedPatterns.length > 0) {
            chrome.tabs.sendMessage(tab.id, { action: "HIGHLIGHT_RISKS", patterns: a.matchedPatterns });
          }
        });
      });
    }, 200);
  });

  function reset() { btn.textContent = 'Scan This Page'; btn.disabled = false; }
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
});
