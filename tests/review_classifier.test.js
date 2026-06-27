const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const agent = require("../tools/volio_review_agent.js");

function classify(text, rating = 1) {
  return agent.classifyReview({ text, rating }, agent.DEFAULT_RULES, { minConfidence: 0.62 });
}

test("classifies ads complaints", () => {
  const result = classify("Too many ads, full screen advertisement every minute", 1);
  assert.equal(result.status, "selected");
  assert.equal(result.intent, "remove_ads");
  assert.equal(result.template, "Remove Ads 3");
});

test("classifies technical issues", () => {
  const result = classify("The app crashes and shows a black screen", 1);
  assert.equal(result.intent, "technical_issue");
  assert.equal(result.template, "Technical Issue");
});

test("classifies permission and privacy concerns", () => {
  const result = classify("Why does it need camera permission and collect my data?", 2);
  assert.equal(result.intent, "permission_concern");
  assert.equal(result.template, "Permission Concern");
});

test("classifies virus concerns ahead of generic negative fallback", () => {
  const result = classify("This app looks like malware virus unsafe", 1);
  assert.equal(result.intent, "virus_problem");
  assert.equal(result.template, "Virus Problem");
});

test("uses rating mismatch for positive text with low rating", () => {
  const result = classify("It's a nice app, very good and useful", 3);
  assert.equal(result.intent, "rating_mismatch");
  assert.equal(result.template, "Rating Mismatch");
});

test("uses general one-star fallback for low-rating generic complaint", () => {
  const result = classify("Very bad experience", 1);
  assert.equal(result.intent, "general_1_star");
  assert.equal(result.template, "General 1 star");
});

test("skips empty and very uncertain reviews", () => {
  const empty = classify("", 1);
  const uncertain = classify("ok", 2);
  assert.equal(empty.status, "skipped_uncertain");
  assert.equal(uncertain.status, "skipped_uncertain");
});

test("rule file has the same template keys as the embedded browser rules", () => {
  const rulePath = path.join(__dirname, "..", "review_rules.json");
  const fileRules = JSON.parse(fs.readFileSync(rulePath, "utf8"));
  assert.deepEqual(
    Object.keys(fileRules.templates).sort(),
    Object.keys(agent.DEFAULT_RULES.templates).sort()
  );
});
