// aiModel.js
export function analyzeNews(text) {
  text = text.toLowerCase();

  // Mock logic (replace this later with ML model)
  let label, confidence, reason;

  if (text.includes("miracle") || text.includes("shocking") || text.includes("rumor")) {
    label = "Fake";
    confidence = "87%";
    reason = "Contains emotionally charged or misleading keywords.";
  } else if (
    text.includes("official report") ||
    text.includes("government statement") ||
    text.includes("research shows")
  ) {
    label = "Real";
    confidence = "93%";
    reason = "References verified sources or government data.";
  } else {
    label = "Partially True";
    confidence = "70%";
    reason = "Unclear or unverifiable claims detected.";
  }

  return { label, confidence, reason };
}
