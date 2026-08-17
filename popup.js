document.getElementById('scanBtn').addEventListener('click', async () => {
  const btn = document.getElementById('scanBtn');
  const statusEl = document.getElementById('status');
  const riskListEl = document.getElementById('riskList');
  const verdictBoxEl = document.getElementById('verdictBox');
  const tipsBoxEl = document.getElementById('tipsBox');
  const disclaimerEl = document.getElementById('disclaimer');

  btn.textContent = 'Scanning…';
  btn.disabled = true;
  statusEl.textContent = 'Reading page…';
  riskListEl.innerHTML = '';
  verdictBoxEl.innerHTML = '';
  tipsBoxEl.innerHTML = '';
  disclaimerEl.innerHTML = '';

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] }, () => {
    setTimeout(() => {
      chrome.tabs.sendMessage(tab.id, { action: "EXTRACT_TEXT" }, (response) => {
        if (chrome.runtime.lastError || !response || !response.text) {
          done();
          statusEl.textContent = 'Could not read page.';
          return;
        }
        statusEl.textContent = 'Analyzing…';
        chrome.runtime.sendMessage({ action: "ANALYZE_POLICY", text: response.text }, (a) => {
          done();
          if (chrome.runtime.lastError || !a) { statusEl.textContent = 'Failed.'; return; }

          statusEl.textContent = a.methodUsed + ' — ' + a.risks.length + ' issue' + (a.risks.length !== 1 ? 's' : '');

          if (a.verdict) {
            verdictBoxEl.innerHTML = '<div class="v ' + a.verdict.cssClass + '">' +
              '<b>' + a.verdict.rating + '</b> — ' +
              (a.verdict.worthIt ? 'Acceptable with caution' : 'Not recommended') +
              '</div>';
          }

          if (a.risks.length > 0) {
            let h = '<div class="section-label">Findings (' + a.risks.length + ')</div>';
            a.risks.forEach(r => {
              const s = (r.severity || 'MEDIUM').charAt(0).toLowerCase();
              h += '<div class="item">' +
                '<span class="sev ' + s + '">' + esc(r.severity) + '</span>' +
                '<span class="item-title">' + esc(r.title) + '</span>' +
                (r.impact ? '<div class="item-desc">' + esc(r.impact) + '</div>' : '') +
                (r.quote ? '<div class="item-quote">"' + esc(r.quote) + '"</div>' : '') +
                '</div>';
            });
            riskListEl.innerHTML = h;
          } else {
            riskListEl.innerHTML = '<div class="item" style="color:#080">No issues found.</div>';
          }

          if (a.tips && a.tips.length > 0) {
            let t = '<div class="section-label">Actions</div>';
            a.tips.forEach(tip => { t += '<div class="tip">· ' + esc(tip) + '</div>'; });
            tipsBoxEl.innerHTML = t;
          }

          disclaimerEl.innerHTML = '<div class="foot">Informational only. Not legal advice.</div>';

          if (a.matchedPatterns && a.matchedPatterns.length > 0) {
            chrome.tabs.sendMessage(tab.id, { action: "HIGHLIGHT_RISKS", patterns: a.matchedPatterns });
          }
        });
      });
    }, 200);
  });

  function done() { btn.textContent = 'Scan'; btn.disabled = false; }
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
});
