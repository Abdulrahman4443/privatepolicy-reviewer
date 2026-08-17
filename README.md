# Local Privacy Auditor 🛡️

A local, privacy-first Chrome Extension (Manifest V3) that scans privacy policies in real-time for data threats using **Chrome's built-in AI (Gemini Nano)** with a fallback **smart regex engine**.

It highlights red-flag clauses directly on the webpage, quotes the exact policy text for legal accuracy, evaluates risk levels, and suggests actionable protection steps. **100% of the analysis runs locally on your computer—zero data leaves your browser.**

---

## ✨ Features

- **🤖 Built-in Chrome AI (Gemini Nano)**: Runs local on-device AI analysis when enabled in Chrome flags.
- **⚡ Smart Regex Scanner**: Fallback scanner covering 11 critical privacy threat categories (data selling, AI model training, targeted ads, class action waivers, forced arbitration, contact book syncing, GPS tracking, and data retention).
- **🖍️ On-Page Highlight Marks**: Underlines flagged threat sentences directly on the live webpage in red.
- **📜 Direct Policy Quoting**: Displays exact 60-character quoted excerpts from the policy to ensure 100% factual accuracy and legal defensibility.
- **📊 Weighted Severity Rating**: Assigns `CRITICAL`, `HIGH`, `MODERATE`, `LOW`, or `SAFE` scores based on weighted risk metrics.
- **🛡️ Actionable Protection Tips**: Gives tailored, practical steps (e.g., how to opt out of AI training or disable location tracking).
- **🌙 Modern Dark UI**: Sleek, glassmorphism popup interface with severity badge indicators.

---

## 📸 Screenshots

| Extension Audit Overview | On-Page Red Flag Highlighting |
| :---: | :---: |
| ![Privacy Auditor UI](docs/screenshots/popup_ui.png) | ![Webpage Red Flag Highlights](docs/screenshots/page_highlight.png) |

---

## 🚀 Installation & Usage Guide

### Step 1: Clone or Download this Repository
```bash
git clone https://github.com/Abdulrahman4443/privatepolicy-reviewer.git
```
*(Or click **Code** -> **Download ZIP** and extract it on your computer).*

### Step 2: Load the Extension into Google Chrome
1. Open Google Chrome and navigate to `chrome://extensions/` in the URL bar.
2. In the top-right corner, turn **ON** **Developer mode**.
3. Click the **Load unpacked** button in the top-left corner.
4. Select the `PrivacyAuditor` folder (or the repository root folder).
5. The **Local Privacy Auditor 🛡️** icon will appear in your Chrome toolbar!

### Step 3: (Optional) Enable Chrome's On-Device AI (Gemini Nano)
If you want to enable Chrome's local AI engine instead of using the Regex fallback:
1. Open `chrome://flags/` in your Chrome URL bar.
2. Search for **Prompt API for Gemini Nano** $\rightarrow$ Set to **Enabled**.
3. Search for **Enables optimization guide on device** $\rightarrow$ Set to **Enabled BypassPrefRequirement**.
4. Click **Relaunch** to restart Chrome.

### Step 4: Scan Any Privacy Policy!
1. Navigate to any website's Privacy Policy page (e.g., OpenAI, Google, Facebook, etc.).
2. Click the **Privacy Auditor 🛡️** extension icon in your toolbar.
3. Click **Scan This Page**.
4. View your threat score, quoted red flags, and actionable protection tips, while highlighted text appears directly on the webpage!

---

## 🛠️ Project Structure

```
PrivacyAuditor/
├── manifest.json       # Chrome Manifest V3 extension configuration
├── popup.html          # Extension UI layout (Dark theme & Glassmorphism)
├── popup.js            # UI controller & background messaging logic
├── content.js          # Webpage text scraper & DOM red-flag highlighter
├── background.js       # Core scanning engine (Chrome AI + Regex engine)
└── docs/               # Documentation assets and screenshots
```

---

## 🔒 Privacy Guarantee

This extension process all web page text **100% locally** within Chrome's sandbox environment. It does NOT contain `fetch()` or `XMLHttpRequest` logic and sends zero data to external servers or third-party APIs.

---

## 📜 Legal Disclaimer

*Local Privacy Auditor quotes privacy policy text for informational and educational purposes only. It does not constitute legal advice. Users should consult a qualified attorney for legal determinations.*
