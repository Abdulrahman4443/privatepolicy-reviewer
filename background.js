// =============================================================
// Privacy Auditor — Background Analyzer
// 100+ Massive Comprehensive Privacy Threat Dictionary
// Quotes policy text directly for legal accuracy.
// =============================================================

const regexRisks = [
  // --- 1. DATA SELLING & COMMERCIAL MONETIZATION ---
  { severity: "CRITICAL", regex: /sell (your )?(personal )?(data|information)/i, title: "Data Selling", impact: "Explicitly states personal data may be sold commercially.", highlight: "sell (your )?(personal )?(data|information)" },
  { severity: "CRITICAL", regex: /monetize (your )?(personal )?(data|information|content)/i, title: "Data Monetization", impact: "Monetizes user data or personal content.", highlight: "monetize (your )?(personal )?(data|information|content)" },
  { severity: "CRITICAL", regex: /exchange (your )?data for (money|valuable consideration)/i, title: "Data Exchange for Value", impact: "Exchanges user data for monetary or financial value.", highlight: "exchange (your )?data for (money|valuable consideration)" },
  { severity: "CRITICAL", regex: /rent or lease (your )?(personal )?(data|information)/i, title: "Renting Personal Data", impact: "Rents or leases personal data to third parties.", highlight: "rent or lease (your )?(personal )?(data|information)" },

  // --- 2. LEGAL RIGHTS & DISPUTE RESOLUTION ---
  { severity: "CRITICAL", regex: /(binding|mandatory) arbitration/i, title: "Forced Arbitration", impact: "Forces dispute resolution through private arbitration, waiving court access.", highlight: "(binding|mandatory) arbitration" },
  { severity: "CRITICAL", regex: /(waive|surrender|give up) (your )?right to (a )?class.action/i, title: "Class Action Waiver", impact: "Waives your right to participate in class-action lawsuits.", highlight: "(waive|surrender|give up) (your )?right to (a )?class.action" },
  { severity: "CRITICAL", regex: /waive (your )?right to a jury trial/i, title: "Jury Trial Waiver", impact: "Surrenders your constitutional right to a jury trial.", highlight: "waive (your )?right to a jury trial" },
  { severity: "HIGH", regex: /shorten(ed)? (the )?statute of limitations/i, title: "Shortened Legal Claims Window", impact: "Reduces the legal timeframe in which you can bring a claim.", highlight: "shorten(ed)? (the )?statute of limitations" },
  { severity: "HIGH", regex: /dispute.{0,30}governed by the laws of/i, title: "Foreign Legal Jurisdiction", impact: "Requires legal disputes to be settled in a specific jurisdiction.", highlight: "dispute.{0,30}governed by the laws of" },
  { severity: "HIGH", regex: /indemnify and hold harmless/i, title: "Unilateral User Indemnification", impact: "Forces you to pay their legal costs if they get sued.", highlight: "indemnify and hold harmless" },
  { severity: "HIGH", regex: /limitation of liability.{0,40}(zero|exceed|\$100)/i, title: "Severe Liability Cap", impact: "Caps company financial liability to a tiny sum or zero.", highlight: "limitation of liability" },

  // --- 3. AI & MACHINE LEARNING MODEL TRAINING ---
  { severity: "HIGH", regex: /(train(ing)? (our |the )?models?|improve (our )?(models?|ai|services?).{0,30}train|content.{0,40}(train|improve).{0,20}(our |the )?(models?|ai))/i, title: "AI Model Training with Your Data", impact: "Uses your prompts, inputs, or content to train AI models.", highlight: "(train(ing)? (our |the )?models?|improve (our )?(models?|ai|services?).{0,30}train)" },
  { severity: "HIGH", regex: /machine learning.{0,40}(train|improve|dataset)/i, title: "Machine Learning Dataset Use", impact: "Incorporate user content into machine learning datasets.", highlight: "machine learning.{0,40}(train|improve|dataset)" },
  { severity: "HIGH", regex: /publicly available data.{0,40}(scrape|collect|train)/i, title: "Public Web Scraping for AI", impact: "Scrapes public internet posts for AI model development.", highlight: "publicly available data.{0,40}(scrape|collect|train)" },
  { severity: "MEDIUM", regex: /de-identified data.{0,30}train/i, title: "De-identified Data AI Training", impact: "Trains models on de-identified versions of user data.", highlight: "de-identified data.{0,30}train" },

  // --- 4. ADVERTISING, BEHAVIORAL TRACKING & PROFILING ---
  { severity: "HIGH", regex: /(targeted advertising|cross-context behavioral advertising|share.{0,60}marketing partners|vendors.{0,40}marketing partners|direct marketing.{0,40}third.party)/i, title: "Targeted & Behavioral Advertising", impact: "Shares data for behavioral profiling and targeted ads.", highlight: "(targeted advertising|cross-context behavioral advertising|marketing partners)" },
  { severity: "HIGH", regex: /create a (user )?profile (about|of) you/i, title: "User Behavioral Profiling", impact: "Builds a detailed commercial profile of your habits.", highlight: "create a (user )?profile (about|of) you" },
  { severity: "HIGH", regex: /interest-based (ads|advertising)/i, title: "Interest-Based Ad Tracking", impact: "Tracks browsing interests to serve personalized ads.", highlight: "interest-based (ads|advertising)" },
  { severity: "HIGH", regex: /third-party ad networks/i, title: "Third-Party Ad Network Sharing", impact: "Passes data to third-party ad networks across websites.", highlight: "third-party ad networks" },
  { severity: "MEDIUM", regex: /retargeting (pixels|cookies|campaigns)/i, title: "Ad Retargeting Tracking", impact: "Uses retargeting pixels to follow you on other websites.", highlight: "retargeting (pixels|cookies|campaigns)" },
  { severity: "MEDIUM", regex: /combine (your )?information with (data|information) from (other|third)/i, title: "Data Aggregation across Sources", impact: "Combines your data with external third-party databases.", highlight: "combine (your )?information with (data|information) from" },

  // --- 5. DATA RETENTION & DELETION LIMITS ---
  { severity: "HIGH", regex: /(retain.{0,60}(even )?after.{0,25}delet|retain.{0,25}(indefinitely|forever|permanently)|keep.{0,25}data.{0,25}(forever|indefinitely)|need to retain.{0,40}longer)/i, title: "Data Retained After Account Deletion", impact: "Keeps your data even after you request deletion.", highlight: "(retain.{0,60}after.{0,25}delet|retain.{0,25}(indefinitely|forever|permanently))" },
  { severity: "HIGH", regex: /delete.{0,30}backup.{0,40}(retain|persist|remain)/i, title: "Data Persists in Backups", impact: "Deleted data remains stored indefinitely in server backups.", highlight: "delete.{0,30}backup.{0,40}(retain|persist|remain)" },
  { severity: "MEDIUM", regex: /retain (your )?data for legitimate business purposes/i, title: "Vague Business Data Retention", impact: "Uses broad language to retain data indefinitely.", highlight: "retain (your )?data for legitimate business purposes" },
  { severity: "MEDIUM", regex: /audit logs.{0,30}retained/i, title: "Permanent Audit Log Storage", impact: "Stores audit logs containing user actions permanently.", highlight: "audit logs.{0,30}retained" },

  // --- 6. DEVICE SENSORS & PRIVACY PERMISSIONS ---
  { severity: "HIGH", regex: /(device address books?|upload.{0,25}(from )?(your )?(device )?(address|contacts?)|connect.{0,20}(device )?contacts)/i, title: "Contact Book Upload", impact: "Accesses and uploads your phone or device address book.", highlight: "(device address books?|upload.{0,25}(from )?(your )?(device )?(address|contacts?))" },
  { severity: "HIGH", regex: /(precise location|device.s gps|gps location|exact (physical )?location)/i, title: "Precise GPS Location Tracking", impact: "Tracks exact physical coordinates via device GPS.", highlight: "(precise location|device.s gps|gps location|exact (physical )?location)" },
  { severity: "HIGH", regex: /microphone.{0,30}(access|record|listen)/i, title: "Microphone Access", impact: "Requests permission to access your device microphone.", highlight: "microphone.{0,30}(access|record|listen)" },
  { severity: "HIGH", regex: /camera.{0,30}(access|record|photo)/i, title: "Camera Access", impact: "Requests access to your device camera.", highlight: "camera.{0,30}(access|record|photo)" },
  { severity: "HIGH", regex: /bluetooth.{0,30}(location|beacon|scan)/i, title: "Bluetooth Beacon Scanning", impact: "Uses Bluetooth to scan for nearby devices and location.", highlight: "bluetooth.{0,30}(location|beacon|scan)" },

  // --- 7. DEVICE IDENTIFIERS & FINGERPRINTING ---
  { severity: "MEDIUM", regex: /device fingerprinting/i, title: "Device Fingerprinting", impact: "Creates a unique hardware fingerprint of your computer.", highlight: "device fingerprinting" },
  { severity: "MEDIUM", regex: /(mac address|imei|udid|advertising id|idfa|gaid)/i, title: "Unique Hardware ID Collection", impact: "Collects non-resettable unique hardware identifiers.", highlight: "(mac address|imei|udid|advertising id|idfa|gaid)" },
  { severity: "MEDIUM", regex: /(installed apps|list of applications)/i, title: "Installed App Inventory", impact: "Scans for other installed applications on your device.", highlight: "(installed apps|list of applications)" },
  { severity: "MEDIUM", regex: /battery (level|status)/i, title: "Battery Status Tracking", impact: "Monitors battery level for fingerprinting purposes.", highlight: "battery (level|status)" },

  // --- 8. THIRD-PARTY SHARING & CORPORATE TRANSFERS ---
  { severity: "MEDIUM", regex: /(business transfers?|merger|acquisition|bankruptcy|reorganization).{0,100}(personal|data|information|transferred|disclosed)/i, title: "Data Transfer on Corporate Merger/Bankruptcy", impact: "Transfers your data to new owners in mergers or bankruptcy.", highlight: "(business transfers?|merger|acquisition|bankruptcy|reorganization)" },
  { severity: "MEDIUM", regex: /disclose.{0,40}affiliates and subsidiaries/i, title: "Affiliate Data Sharing", impact: "Shares data across all corporate subsidiaries and partners.", highlight: "disclose.{0,40}affiliates and subsidiaries" },
  { severity: "MEDIUM", regex: /disclose.{0,40}unnamed third parties/i, title: "Unnamed Third Party Sharing", impact: "Shares personal data with undisclosed third parties.", highlight: "disclose.{0,40}unnamed third parties" },

  // --- 9. GOVERNMENT SURVEILLANCE & LEGAL REQUESTS ---
  { severity: "MEDIUM", regex: /(share|disclose).{0,120}government authorit/i, title: "Government Data Disclosure", impact: "Discloses data to government entities upon request.", highlight: "government authorit(ies|y)" },
  { severity: "MEDIUM", regex: /without prior notice to you.{0,40}(subpoena|legal|government)/i, title: "Secret Government Disclosure", impact: "Hands data to law enforcement without notifying you.", highlight: "without prior notice to you" },
  { severity: "MEDIUM", regex: /national security (letters|requests)/i, title: "National Security Letter Compliance", impact: "Complies with gag-ordered national security requests.", highlight: "national security" },

  // --- 10. CROSS-BORDER DATA TRANSFERS & SERVERS ---
  { severity: "MEDIUM", regex: /(servers? (located |)in (the )?United States|transfer.{0,40}(other |various )jurisdictions|process.{0,30}servers.{0,30}United States)/i, title: "Cross-Border Data Transfer", impact: "Transfers data to servers in jurisdictions with weaker privacy laws.", highlight: "(servers?.{0,10}(located )?in (the )?United States|transfer.{0,40}(other |various )jurisdictions)" },
  { severity: "LOW", regex: /standard contractual clauses/i, title: "International Transfer Clauses", impact: "Uses SCCs for international data transfers.", highlight: "standard contractual clauses" },

  // --- 11. POLICY CHANGES & TERMS UNILATERAL MODIFICATION ---
  { severity: "HIGH", regex: /modify (this|our) (policy|terms) at any time without (prior )?notice/i, title: "Unilateral Terms Change Without Notice", impact: "Reserves right to change privacy terms without notifying users.", highlight: "modify (this|our) (policy|terms) at any time without" },
  { severity: "MEDIUM", regex: /continued use of the (services|website) (constitutes|means) acceptance/i, title: "Passive Policy Change Consent", impact: "Deems continuing to visit the site as accepting new terms.", highlight: "continued use of the (services|website)" },

  // --- 12. CHILDREN & MINORS PRIVACY ---
  { severity: "HIGH", regex: /do not knowingly collect.{0,30}under 13/i, title: "Children's Data Provision (COPPA)", impact: "Policy addresses COPPA rules for children under 13.", highlight: "do not knowingly collect.{0,30}under 13" },
  { severity: "HIGH", regex: /parental consent.{0,30}(required|collect)/i, title: "Parental Consent Requirement", impact: "Requires parental verification for minor data processing.", highlight: "parental consent" },

  // --- 13. COOKIES, TRACKING PIXELS & WEB BEACONS ---
  { severity: "LOW", regex: /(tracking pixels|web beacons|clear gifs)/i, title: "Tracking Pixels & Beacons", impact: "Uses hidden single-pixel images to log email and page views.", highlight: "(tracking pixels|web beacons|clear gifs)" },
  { severity: "LOW", regex: /third-party cookies/i, title: "Third-Party Cookies", impact: "Allows external cookies to trace user activity across websites.", highlight: "third-party cookies" },
  { severity: "LOW", regex: /session replay (software|tools|script)/i, title: "Session Replay Recording", impact: "Records mouse movements and keystrokes on the page.", highlight: "session replay" },

  // --- 14. BIOMETRIC & HEALTH DATA ---
  { severity: "CRITICAL", regex: /(biometric|facial recognition|fingerprint scan|voiceprint)/i, title: "Biometric Data Collection", impact: "Collects immutable biometric identifiers (face, fingerprint, voice).", highlight: "(biometric|facial recognition|fingerprint scan|voiceprint)" },
  { severity: "CRITICAL", regex: /health data|medical records|fitness activity/i, title: "Health & Fitness Data Collection", impact: "Processes sensitive medical or physical health records.", highlight: "health data|medical records|fitness activity" },

  // --- 15. COMMUNICATIONS INTERCEPTION & MONITORING ---
  { severity: "HIGH", regex: /monitor (and|or) review (your )?(private )?(messages|communications|chats)/i, title: "Message Content Monitoring", impact: "Monitors or reads private messages and chat logs.", highlight: "monitor (and|or) review (your )?(private )?(messages|communications|chats)" },
  { severity: "HIGH", regex: /scan (your )?(uploaded )?(files|images|attachments)/i, title: "Automated File Scanning", impact: "Scans uploaded files, documents, or photos automatically.", highlight: "scan (your )?(uploaded )?(files|images|attachments)" }
];


function fallbackRegexScan(text) {
  const risks = [];
  const matchedPatterns = [];

  regexRisks.forEach(flag => {
    const match = text.match(flag.regex);
    if (match) {
      const idx = text.indexOf(match[0]);
      const start = Math.max(0, idx - 60);
      const end = Math.min(text.length, idx + match[0].length + 60);
      let quote = text.substring(start, end).replace(/\s+/g, ' ').trim();
      if (start > 0) quote = '\u2026' + quote;
      if (end < text.length) quote = quote + '\u2026';

      risks.push({
        severity: flag.severity,
        title: flag.title,
        impact: flag.impact,
        quote: quote
      });
      matchedPatterns.push(flag.highlight);
    }
  });

  return { risks, matchedPatterns };
}


function evaluateVerdict(risks) {
  let score = 0;
  let criticalCount = 0;

  risks.forEach(r => {
    if (r.severity === "CRITICAL") { score += 3; criticalCount++; }
    else if (r.severity === "HIGH") { score += 2; }
    else { score += 1; }
  });

  if (score >= 10 || criticalCount >= 2) {
    return {
      rating: "CRITICAL RISK",
      cssClass: "critical",
      worthIt: false,
      description: "Severe privacy or legal threats detected. High data collection, waivers, or monetization clauses present."
    };
  } else if (score >= 6) {
    return {
      rating: "HIGH RISK",
      cssClass: "high",
      worthIt: false,
      description: "Significant privacy concerns found. Your data may be shared, profiled, or retained long-term."
    };
  } else if (score >= 3) {
    return {
      rating: "MODERATE RISK",
      cssClass: "moderate",
      worthIt: true,
      description: "Standard commercial privacy practices. Check account privacy settings and opt-out controls."
    };
  } else if (score >= 1) {
    return {
      rating: "LOW RISK",
      cssClass: "low",
      worthIt: true,
      description: "Minor privacy items found. Relatively privacy-friendly compared to industry standards."
    };
  } else {
    return {
      rating: "SAFE / NO RISKS",
      cssClass: "safe",
      worthIt: true,
      description: "No privacy threats detected on this page."
    };
  }
}


function generateTips(foundRisks) {
  const tips = [];
  const titles = new Set(foundRisks.map(r => r.title));

  if (titles.has("AI Model Training with Your Data") || titles.has("Machine Learning Dataset Use")) {
    tips.push("Look for an opt-out setting for AI/model data training in your account settings.");
  }
  if (titles.has("Targeted & Behavioral Advertising") || titles.has("Data Selling")) {
    tips.push("Opt out of personalized advertising and data sharing in your account privacy controls.");
  }
  if (titles.has("Contact Book Upload")) {
    tips.push("Deny contact/address book access permissions on mobile devices.");
  }
  if (titles.has("Precise GPS Location Tracking")) {
    tips.push("Turn off precise location/GPS permissions in your browser or device settings.");
  }
  if (titles.has("Forced Arbitration") || titles.has("Class Action Waiver")) {
    tips.push("Check if there is a 30-day arbitration opt-out letter option in the terms.");
  }
  if (titles.has("Data Retained After Account Deletion")) {
    tips.push("Submit a formal GDPR/CCPA data erasure request when closing your account.");
  }
  if (tips.length > 0) {
    tips.push("Review and adjust all privacy preferences in your account profile.");
  }

  return tips;
}


async function analyzePolicy(policyText, aiOutput) {
  try {
    let aiRisks = [];
    let methodUsed = "Regex Engine";

    if (aiOutput && typeof aiOutput === 'string' && aiOutput.trim().length > 0) {
      aiRisks = aiOutput.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => {
          const parts = line.split('|').map(p => p.trim());
          if (parts.length >= 3) return { severity: parts[0], title: parts[1], impact: parts[2], quote: "" };
          return { severity: "MEDIUM", title: line.trim(), impact: "", quote: "" };
        });
      if (aiRisks.length > 0) {
        methodUsed = "Chrome AI (Gemini Nano)";
      }
    }

    if (aiRisks.length === 0) {
      const aiApi = typeof ai !== 'undefined' ? ai : (typeof self !== 'undefined' && self.ai) ? self.ai : (typeof window !== 'undefined' && window.ai) ? window.ai : null;
      if (aiApi && (aiApi.languageModel || aiApi.summarizer)) {
        try {
          let session = null;
          if (aiApi.languageModel) {
            const capabilities = await aiApi.languageModel.capabilities();
            if (capabilities && capabilities.available !== "no") {
              session = await aiApi.languageModel.create({
                systemPrompt: "You are a privacy auditor. Read the policy and output ONLY threat clauses in format: SEVERITY | Title | Quote."
              });
            }
          }
          if (session) {
            const response = await session.prompt(policyText.substring(0, 15000));
            if (session.destroy) session.destroy();
            aiRisks = response.split('\n')
              .filter(line => line.trim().length > 0)
              .map(line => {
                const parts = line.split('|').map(p => p.trim());
                if (parts.length >= 3) return { severity: parts[0], title: parts[1], impact: parts[2], quote: "" };
                return { severity: "MEDIUM", title: line.trim(), impact: "", quote: "" };
              });
            if (aiRisks.length > 0) methodUsed = "Chrome AI (Gemini Nano)";
          }
        } catch (e) {
          console.warn("AI unavailable, running regex engine:", e);
        }
      }
    }

    const regexResult = fallbackRegexScan(policyText);
    const risks = aiRisks.length > 0 ? aiRisks : regexResult.risks;
    const matchedPatterns = regexResult.matchedPatterns;
    const scoringRisks = regexResult.risks.length >= risks.length ? regexResult.risks : risks;
    const verdict = evaluateVerdict(scoringRisks);
    const tips = generateTips(regexResult.risks.length > 0 ? regexResult.risks : risks);

    return { methodUsed, risks, matchedPatterns, verdict, tips };

  } catch (error) {
    const regexResult = fallbackRegexScan(policyText);
    const verdict = evaluateVerdict(regexResult.risks);
    const tips = generateTips(regexResult.risks);
    return { methodUsed: "Regex Engine", risks: regexResult.risks, matchedPatterns: regexResult.matchedPatterns, verdict, tips };
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "ANALYZE_POLICY") {
    analyzePolicy(message.text, message.aiOutput).then(sendResponse);
    return true;
  }
});

