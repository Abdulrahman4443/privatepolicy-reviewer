// =============================================================
// Privacy Auditor — Background Analyzer
// Only flags genuinely threatening clauses. Quotes policy text
// directly to stay factually accurate and legally defensible.
// =============================================================

// Each entry: severity, regex to detect, title, factual impact,
// and a highlight pattern to mark on the webpage.
const regexRisks = [

  // ===== CRITICAL: Direct legal or financial threats =====

  {
    severity: "CRITICAL",
    regex: /sell (your )?(personal )?(data|information)/i,
    title: "Data Selling",
    impact: "This policy states your personal data may be sold commercially to other entities.",
    highlight: "sell (your )?(personal )?(data|information)"
  },
  {
    severity: "CRITICAL",
    regex: /(binding|mandatory) arbitration/i,
    title: "Forced Arbitration",
    impact: "You agree to resolve all disputes through private arbitration, waiving your right to go to court.",
    highlight: "(binding|mandatory) arbitration"
  },
  {
    severity: "CRITICAL",
    regex: /(waive|surrender|give up) (your )?right to (a )?class.action/i,
    title: "Class Action Waiver",
    impact: "You surrender the right to join or bring class-action lawsuits against this company.",
    highlight: "(waive|surrender|give up) (your )?right to (a )?class.action"
  },

  // ===== HIGH: Significant privacy threats =====

  {
    severity: "HIGH",
    regex: /(train(ing)? (our |the )?models?|improve (our )?(models?|services?).{0,30}train|content.{0,40}(train|improve).{0,20}(our |the )?(models?|ai))/i,
    title: "AI Model Training with Your Data",
    impact: "Your inputs, prompts, or uploaded content may be used to train AI or machine learning models.",
    highlight: "(train(ing)? (our |the )?models?|improve (our )?(models?|services?).{0,30}train|content.{0,40}(train|improve).{0,20}(our |the )?(models?|ai))"
  },
  {
    severity: "HIGH",
    regex: /(targeted advertising|cross-context behavioral advertising|share.{0,60}marketing partners|vendors.{0,40}marketing partners|direct marketing.{0,40}third.party)/i,
    title: "Targeted Advertising & Data Sharing",
    impact: "Your data may be shared with advertising or marketing partners for profiling and ad targeting.",
    highlight: "(targeted advertising|cross-context behavioral advertising|marketing partners|direct marketing)"
  },
  {
    severity: "HIGH",
    regex: /(retain.{0,60}(even )?after.{0,25}delet|retain.{0,25}(indefinitely|forever|permanently)|keep.{0,25}data.{0,25}(forever|indefinitely)|need to retain.{0,40}longer)/i,
    title: "Data Retained After Deletion",
    impact: "Your data may be kept even after you delete your account or request removal.",
    highlight: "(retain.{0,60}after.{0,25}delet|retain.{0,25}(indefinitely|forever|permanently))"
  },
  {
    severity: "HIGH",
    regex: /(device address books?|upload.{0,25}(from )?(your )?(device )?(address|contacts?)|connect.{0,20}(device )?contacts)/i,
    title: "Contact Book Upload",
    impact: "This service can access and upload your phone or device contact list to their servers.",
    highlight: "(device address books?|upload.{0,25}(from )?(your )?(device )?(address|contacts?)|connect.{0,20}(device )?contacts)"
  },
  {
    severity: "HIGH",
    regex: /(precise location|device.s gps|gps location|exact (physical )?location)/i,
    title: "Precise GPS Location Tracking",
    impact: "This service can track your exact physical location using your device's GPS sensor.",
    highlight: "(precise location|device.s gps|gps location|exact (physical )?location)"
  },

  // ===== MEDIUM: Notable concerns worth knowing =====

  {
    severity: "MEDIUM",
    regex: /(business transfers?|merger|acquisition|bankruptcy|reorganization).{0,100}(personal|data|information|transferred|disclosed)/i,
    title: "Data Transfer on Ownership Change",
    impact: "If this company is acquired, merges, or goes bankrupt, your data may be transferred to new owners.",
    highlight: "(business transfers?|merger|acquisition|bankruptcy|reorganization)"
  },
  {
    severity: "MEDIUM",
    regex: /(share|disclose).{0,120}government authorit/i,
    title: "Government Data Disclosure",
    impact: "Your data may be disclosed to government authorities or law enforcement agencies upon request.",
    highlight: "government authorit(ies|y)"
  },
  {
    severity: "MEDIUM",
    regex: /(servers? (located |)in (the )?United States|transfer.{0,40}(other |various )jurisdictions|process.{0,30}servers.{0,30}United States)/i,
    title: "Cross-Border Data Transfer",
    impact: "Your data may be transferred to and stored on servers in other countries (e.g., United States).",
    highlight: "(servers?.{0,10}(located )?in (the )?United States|transfer.{0,40}(other |various )jurisdictions)"
  },
];


/**
 * Scans policy text with all regex patterns. Returns matched risks
 * with exact quoted excerpts and highlight patterns.
 */
function fallbackRegexScan(text) {
  const risks = [];
  const matchedPatterns = [];

  regexRisks.forEach(flag => {
    const match = text.match(flag.regex);
    if (match) {
      // Extract a surrounding text snippet as a direct quote
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


/**
 * Weighted severity scoring to produce a verdict.
 * CRITICAL = 3pts, HIGH = 2pts, MEDIUM = 1pt.
 */
function evaluateVerdict(risks) {
  let score = 0;
  let criticalCount = 0;
  let highCount = 0;

  risks.forEach(r => {
    if (r.severity === "CRITICAL") { score += 3; criticalCount++; }
    else if (r.severity === "HIGH") { score += 2; highCount++; }
    else { score += 1; }
  });

  if (score >= 10 || criticalCount >= 2) {
    return {
      rating: "CRITICAL RISK",
      cssClass: "critical",
      worthIt: false,
      description: "This policy contains serious threats to your privacy and legal rights. Multiple critical or high-severity clauses detected. Use extreme caution or avoid this service."
    };
  } else if (score >= 6) {
    return {
      rating: "HIGH RISK",
      cssClass: "high",
      worthIt: false,
      description: "Significant privacy concerns found. Your data may be shared, retained, or used in ways that could affect your rights. Review all opt-out settings carefully before using."
    };
  } else if (score >= 3) {
    return {
      rating: "MODERATE RISK",
      cssClass: "moderate",
      worthIt: true,
      description: "Some privacy concerns detected. Common for commercial services. Check your account privacy settings and opt out of data sharing where possible."
    };
  } else if (score >= 1) {
    return {
      rating: "LOW RISK",
      cssClass: "low",
      worthIt: true,
      description: "Minor concerns found. This policy is relatively privacy-friendly compared to industry norms."
    };
  } else {
    return {
      rating: "SAFE",
      cssClass: "safe",
      worthIt: true,
      description: "No privacy threats detected on this page. This may not be a privacy policy page."
    };
  }
}


/**
 * Generates actionable, accurate protection tips based on the
 * specific threats found. No generic service suggestions.
 */
function generateTips(foundRisks) {
  const tips = [];
  const titles = new Set(foundRisks.map(r => r.title));

  if (titles.has("AI Model Training with Your Data")) {
    tips.push("Look for a setting to opt out of AI model training in your account privacy settings.");
  }
  if (titles.has("Targeted Advertising & Data Sharing") || titles.has("Data Selling")) {
    tips.push("Check for ad personalization and marketing opt-out controls in your account settings.");
  }
  if (titles.has("Contact Book Upload")) {
    tips.push("Deny contact or address book permissions when prompted by this service's apps.");
  }
  if (titles.has("Precise GPS Location Tracking")) {
    tips.push("Disable location and GPS permissions for this service in your device settings.");
  }
  if (titles.has("Forced Arbitration") || titles.has("Class Action Waiver")) {
    tips.push("Check if there is a time-limited opt-out period for arbitration (often 30 days after signup).");
  }
  if (titles.has("Data Retained After Deletion")) {
    tips.push("Periodically review stored data and use the formal data deletion request option if available.");
  }
  if (titles.has("Cross-Border Data Transfer")) {
    tips.push("Consider using a VPN for an extra layer of protection when using this service.");
  }
  if (titles.has("Data Transfer on Ownership Change")) {
    tips.push("Monitor news about this company for any mergers or acquisitions that could affect your data.");
  }

  if (tips.length > 0) {
    tips.push("Review your full account privacy settings and adjust data sharing controls.");
  }

  return tips;
}


/**
 * Main analysis function. Tries Chrome's built-in AI first,
 * always runs regex scan for highlighting and precision.
 */
async function analyzePolicy(policyText) {
  try {
    let aiRisks = [];
    let methodUsed = "Regex Scanner";

    // 1. Try Chrome's Built-in AI Prompt API
    if (self.ai && self.ai.languageModel) {
      const capabilities = await self.ai.languageModel.capabilities();

      if (capabilities.available !== "no") {
        const session = await self.ai.languageModel.create({
          systemPrompt: "You are a privacy policy auditor. Read the policy text and list ONLY clauses that directly threaten the user's privacy or legal rights (data selling, forced arbitration, class action waivers, AI training, ad tracking, data retention after deletion, contact book access, GPS tracking, government disclosure, ownership transfer). For each, output one line: SEVERITY | Title | Quote from text. Severity is CRITICAL, HIGH, or MEDIUM."
        });

        const response = await session.prompt(policyText);
        session.destroy();

        aiRisks = response.split('\n')
          .filter(line => line.trim().length > 0)
          .map(line => {
            const parts = line.split('|').map(p => p.trim());
            if (parts.length >= 3) {
              return { severity: parts[0], title: parts[1], impact: parts[2], quote: "" };
            }
            return { severity: "MEDIUM", title: line.trim(), impact: "", quote: "" };
          });
        methodUsed = "Chrome AI (Gemini Nano)";
      }
    }

    // 2. Always run regex scan (for highlighting + if AI unavailable)
    const regexResult = fallbackRegexScan(policyText);

    const risks = aiRisks.length > 0 ? aiRisks : regexResult.risks;
    const matchedPatterns = regexResult.matchedPatterns;

    // Use whichever found more risks for verdict scoring
    const scoringRisks = regexResult.risks.length >= risks.length ? regexResult.risks : risks;
    const verdict = evaluateVerdict(scoringRisks);
    const tips = generateTips(regexResult.risks.length > 0 ? regexResult.risks : risks);

    return { methodUsed, risks, matchedPatterns, verdict, tips };

  } catch (error) {
    console.error("Privacy Auditor analysis failed:", error);
    const regexResult = fallbackRegexScan(policyText);
    const verdict = evaluateVerdict(regexResult.risks);
    const tips = generateTips(regexResult.risks);
    return {
      methodUsed: "Regex Scanner (AI unavailable)",
      risks: regexResult.risks,
      matchedPatterns: regexResult.matchedPatterns,
      verdict,
      tips
    };
  }
}


// Listen for requests from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "ANALYZE_POLICY") {
    analyzePolicy(message.text).then(sendResponse);
    return true;
  }
});
