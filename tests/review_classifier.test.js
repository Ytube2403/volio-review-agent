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
  assert.equal(result.folder, "Remove Ads");
});

test("keeps four-star ads template away from one-star ads complaints", () => {
  const result = classify("Too many ads, I cannot use this app", 1);
  assert.equal(result.intent, "remove_ads");
  assert.notEqual(result.template, "Reply_4Star_Ads_Option3");
  assert.ok(!result.aliases.includes("Reply_4Star_Ads_Option3"));
});

test("uses positive ads feedback only for high-rating ads feedback", () => {
  const result = classify("Good app but there are too many ads", 4);
  assert.equal(result.status, "selected");
  assert.equal(result.intent, "positive_ads_feedback");
  assert.equal(result.template, "Reply_4Star_Ads_Option3");
  assert.equal(result.folder, "Remove Ads");
});

test("keeps angry high-rating ads feedback in generic remove ads", () => {
  const result = classify("Too many ads, I cannot use this app", 4);
  assert.equal(result.status, "selected");
  assert.equal(result.intent, "remove_ads");
  assert.equal(result.template, "Remove Ads 3");
});

test("uses original review text instead of translated text for intent", () => {
  const result = agent.classifyReview({
    rating: 1,
    text: "Chỉ là lãng phí thời gian",
    originalText: "faltu khali ad hi ata he",
    translatedText: "Chỉ là lãng phí thời gian"
  }, agent.DEFAULT_RULES, { minConfidence: 0.62 });
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
  assert.equal(result.template, "Privacy");
  assert.equal(result.folder, "Technical Issue Response");
});

test("classifies notification privacy concerns", () => {
  const result = classify("Nice app but I do not trust it because it can read notifications", 1);
  assert.equal(result.intent, "permission_concern");
  assert.equal(result.template, "Privacy");
});

test("classifies virus concerns ahead of generic negative fallback", () => {
  const result = classify("This app looks like malware virus unsafe", 1);
  assert.equal(result.intent, "virus_problem");
  assert.equal(result.template, "Virus Problem");
});

test("uses rating mismatch for positive text with low rating", () => {
  const result = classify("It's a nice app, very good and useful", 3);
  assert.equal(result.intent, "rating_mismatch");
  assert.equal(result.template, "Positive Low Rating");
  assert.equal(result.folder, "User khen app");
});

test("classifies paywall complaints", () => {
  const result = classify("It forces me to pay money to unlock the theme", 1);
  assert.equal(result.intent, "paywall");
  assert.equal(result.template, "Paywall");
  assert.equal(result.folder, "User góp ý");
});

test("classifies feature requests separately from missing content", () => {
  const result = classify("I hope it's offline too and please add more options", 3);
  assert.equal(result.intent, "feature_request");
  assert.equal(result.template, "Feature Request");
  assert.equal(result.folder, "User góp ý");
});

test("keeps valid parallel templates instead of forcing the primary template", () => {
  const ratingMismatch = agent.validateDecision({
    status: "selected",
    intent: "rating_mismatch",
    template: "Rating Mismatch",
    folder: "Review không liên quan"
  }, agent.DEFAULT_RULES);
  assert.equal(ratingMismatch.template, "Rating Mismatch");
  assert.equal(ratingMismatch.folder, "Review không liên quan");
  assert.equal(ratingMismatch.validation_status, "valid");

  const permissionConcern = agent.validateDecision({
    status: "selected",
    intent: "permission_concern",
    template: "Permission Concern",
    folder: "Technical Issue Response"
  }, agent.DEFAULT_RULES);
  assert.equal(permissionConcern.template, "Permission Concern");
  assert.equal(permissionConcern.folder, "Technical Issue Response");
  assert.equal(permissionConcern.validation_status, "valid");

  const adsAngry = agent.validateDecision({
    status: "selected",
    intent: "remove_ads",
    template: "Ads - Angry",
    folder: "Remove Ads"
  }, agent.DEFAULT_RULES);
  assert.equal(adsAngry.template, "Ads - Angry");
  assert.equal(adsAngry.folder, "Remove Ads");
  assert.equal(adsAngry.validation_status, "valid");
});

test("uses general one-star fallback for low-rating generic complaint", () => {
  const result = classify("Very bad experience", 1);
  assert.equal(result.intent, "general_1_star");
  assert.equal(result.template, "General 1 star");
  assert.equal(result.folder, "User chê app");
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

test("rule file has verified folder mappings from the Review screenshots", () => {
  const rulePath = path.join(__dirname, "..", "review_rules.json");
  const fileRules = JSON.parse(fs.readFileSync(rulePath, "utf8"));
  const expectedFolders = {
    rating_mismatch: "User khen app",
    need_details: "Review không liên quan",
    usage_help: "Review không liên quan",
    general_1_star: "User chê app",
    missing_content: "User góp ý",
    feature_request: "User góp ý",
    paywall: "User góp ý",
    positive_ads_feedback: "Remove Ads",
    remove_ads: "Remove Ads",
    permission_concern: "Technical Issue Response",
    virus_problem: "Technical Issue Response",
    technical_issue: "Technical Issue Response",
    performance_issue: "Technical Issue Response",
    five_star: "5 sao",
    four_star: "User khen app"
  };

  for (const [key, folder] of Object.entries(expectedFolders)) {
    assert.equal(fileRules.templates[key].folder, folder, key);
    assert.equal(agent.DEFAULT_RULES.templates[key].folder, folder, key);
    assert.ok(fileRules.templateFolders[folder].includes(fileRules.templates[key].template), key);
  }
});

test("User Love variants are documented in rules and rotation config", () => {
  const rulePath = path.join(__dirname, "..", "review_rules.json");
  const fileRules = JSON.parse(fs.readFileSync(rulePath, "utf8"));
  const expectedUserLoveRotation = [
    "User Love",
    "User Love - Warm",
    "User Love - Share",
    "User Love - Engage"
  ];

  assert.deepEqual(fileRules.templateRotation.positive_user_love, expectedUserLoveRotation);
  assert.deepEqual(agent.DEFAULT_RULES.templateRotation.positive_user_love, expectedUserLoveRotation);
  for (const name of expectedUserLoveRotation) {
    assert.ok(fileRules.templates.five_star.aliases.includes(name), name);
    assert.ok(fileRules.templates.four_star.aliases.includes(name), name);
    assert.ok(fileRules.templateFolders["User khen app"].includes(name), name);
    assert.ok(agent.DEFAULT_RULES.templates.five_star.aliases.includes(name), name);
    assert.ok(agent.DEFAULT_RULES.templates.four_star.aliases.includes(name), name);
    assert.ok(agent.DEFAULT_RULES.templateFolders["User khen app"].includes(name), name);
  }
});

test("remove ads templates can rotate across approved alternatives", () => {
  const rulePath = path.join(__dirname, "..", "review_rules.json");
  const fileRules = JSON.parse(fs.readFileSync(rulePath, "utf8"));
  const expectedAdsAliases = [
    "Remove Ads 3",
    "Ads - Improvement",
    "Ads - Angry",
    "Ads - Positive",
    "Ads - Good App",
    "Remove Ads - Unskippable",
    "Remove Ads 4",
    "remove ads 2",
    "Quảng cáo - Remove ad"
  ];

  assert.deepEqual(fileRules.templates.remove_ads.aliases, expectedAdsAliases);
  assert.deepEqual(agent.DEFAULT_RULES.templates.remove_ads.aliases, expectedAdsAliases);
  for (const name of expectedAdsAliases) {
    assert.ok(fileRules.templateFolders["Remove Ads"].includes(name), name);
    assert.ok(agent.DEFAULT_RULES.templateFolders["Remove Ads"].includes(name), name);
  }
});

test("positive ads feedback templates can rotate only across approved positive alternatives", () => {
  const rulePath = path.join(__dirname, "..", "review_rules.json");
  const fileRules = JSON.parse(fs.readFileSync(rulePath, "utf8"));
  const expectedPositiveAdsAliases = [
    "Reply_4Star_Ads_Option3",
    "Ads - Positive",
    "Ads - Good App",
    "Positive but Ads Feedback"
  ];

  assert.deepEqual(fileRules.templates.positive_ads_feedback.aliases, expectedPositiveAdsAliases);
  assert.deepEqual(agent.DEFAULT_RULES.templates.positive_ads_feedback.aliases, expectedPositiveAdsAliases);

  const positiveAdsTemplate = agent.validateDecision({
    status: "selected",
    intent: "positive_ads_feedback",
    template: "Reply_4Star_Ads_Option3",
    folder: "Remove Ads"
  }, agent.DEFAULT_RULES);
  assert.equal(positiveAdsTemplate.validation_status, "valid");

  const userSuggestionTemplate = agent.validateDecision({
    status: "selected",
    intent: "positive_ads_feedback",
    template: "Positive but Ads Feedback",
    folder: "User góp ý"
  }, agent.DEFAULT_RULES);
  assert.equal(userSuggestionTemplate.validation_status, "valid");
});

test("positive praise templates can be reused across approved five-star and four-star aliases", () => {
  const fiveStarUserLove = agent.validateDecision({
    status: "selected",
    intent: "five_star",
    template: "User Love",
    folder: "User khen app",
    review_identity: "0000000000000000"
  }, agent.DEFAULT_RULES);
  assert.equal(fiveStarUserLove.template, "User Love");
  assert.equal(fiveStarUserLove.folder, "User khen app");
  assert.equal(fiveStarUserLove.validation_status, "valid");

  const fiveStarThanks = agent.validateDecision({
    status: "selected",
    intent: "five_star",
    template: "cảm ơn sâu sắc",
    folder: "5 sao"
  }, agent.DEFAULT_RULES);
  assert.equal(fiveStarThanks.template, "cảm ơn sâu sắc");
  assert.equal(fiveStarThanks.folder, "5 sao");
  assert.equal(fiveStarThanks.validation_status, "valid");

  const fourStarThanks = agent.validateDecision({
    status: "selected",
    intent: "four_star",
    template: "cảm ơn sâu sắc",
    folder: "5 sao"
  }, agent.DEFAULT_RULES);
  assert.equal(fourStarThanks.template, "cảm ơn sâu sắc");
  assert.equal(fourStarThanks.folder, "5 sao");
  assert.equal(fourStarThanks.validation_status, "valid");

  const shortThanks = agent.validateDecision({
    status: "selected",
    intent: "five_star",
    template: "Short Thanks",
    folder: "User khen app"
  }, agent.DEFAULT_RULES);
  assert.equal(shortThanks.template, "Short Thanks");
  assert.equal(shortThanks.folder, "User khen app");
  assert.equal(shortThanks.validation_status, "valid");

  const positiveWithIssue = agent.validateDecision({
    status: "selected",
    intent: "four_star",
    template: "Positive With Issue",
    folder: "User khen app"
  }, agent.DEFAULT_RULES);
  assert.equal(positiveWithIssue.template, "Positive With Issue");
  assert.equal(positiveWithIssue.folder, "User khen app");
  assert.equal(positiveWithIssue.validation_status, "valid");
});

test("generic User Love is rebalanced across approved variants by review identity", () => {
  const expectedByIdentity = [
    ["0000000000000000", "User Love"],
    ["0000000000000001", "User Love - Warm"],
    ["0000000000000002", "User Love - Share"],
    ["0000000000000003", "User Love - Engage"]
  ];

  for (const [reviewIdentity, expectedTemplate] of expectedByIdentity) {
    const result = agent.validateDecision({
      status: "selected",
      intent: "five_star",
      template: "User Love",
      folder: "User khen app",
      review_identity: reviewIdentity
    }, agent.DEFAULT_RULES);
    assert.equal(result.template, expectedTemplate);
    assert.equal(result.folder, "User khen app");
    assert.equal(result.validation_status, "valid");
    assert.equal(result.aliases[0], expectedTemplate);
  }

  const explicitVariant = agent.validateDecision({
    status: "selected",
    intent: "four_star",
    template: "User Love - Engage",
    folder: "User khen app",
    review_identity: "0000000000000001"
  }, agent.DEFAULT_RULES);
  assert.equal(explicitVariant.template, "User Love - Engage");
  assert.equal(explicitVariant.validation_status, "valid");
});

test("classifies general 5-star reviews as five_star", () => {
  const result = classify("Excellent app!", 5);
  assert.equal(result.intent, "five_star");
  assert.equal(result.template, "Phản hồi 5 sao - Nhiều Icon (2)");
  assert.equal(result.folder, "5 sao");
});

test("classifies general 4-star reviews as four_star", () => {
  const result = classify("Pretty good app!", 4);
  assert.equal(result.intent, "four_star");
  assert.equal(result.template, "Great App 2");
  assert.equal(result.folder, "User khen app");
});

test("classifies misspelled usage questions as usage_help", () => {
  const result = classify("how dose it work 🙄", 1);
  assert.equal(result.intent, "usage_help");
  assert.equal(result.template, "Usage Help");
});

test("classifies international ads and connection insights", () => {
  // Ukrainian ads
  const uaAds = classify("лише для перегляду реклами аналогічних застосунків", 1);
  assert.equal(uaAds.intent, "remove_ads");

  // Vietnamese typo ads
  const viTypoAds = classify("quảng cqso quá nhiều", 1);
  assert.equal(viTypoAds.intent, "remove_ads");

  // Spanish ads
  const esAds = classify("publicidad por todos lados", 1);
  // Thai ads
  const thAds = classify("โฆษณารกชิบหาย", 1);
  assert.equal(thAds.intent, "remove_ads");

  const idAdsSuffix = classify("Gak fungsi...apalagi iklannya luar biasa...uninstal", 1);
  assert.equal(idAdsSuffix.intent, "remove_ads");

  const plAds = classify("reklama na reklamie...", 1);
  assert.equal(plAds.intent, "remove_ads");

  const koAds = classify("광고가 너무 너무 많아요.ㅠㅠ", 1);
  assert.equal(koAds.intent, "remove_ads");
});

test("classifies international rating mismatches", () => {
  // French "bonne"
  const frMismatch = classify("bonne", 1);
  assert.equal(frMismatch.intent, "rating_mismatch");

  // Farsi "خوب"
  const faMismatch = classify("خوب", 1);
  assert.equal(faMismatch.intent, "rating_mismatch");

  // Indonesian "bagus"
  const idMismatch = classify("bagus", 1);
  assert.equal(idMismatch.intent, "rating_mismatch");

  // Spanish "beautiful"
  const esMismatch = classify("hermoso", 1);
  assert.equal(esMismatch.intent, "rating_mismatch");
});

test("classifies international paywall complaints", () => {
  const arPaywall = classify("كل شوي يبغى فلوس كل شويه يبغى فلوس", 1);
  assert.equal(arPaywall.intent, "paywall");
});

test("classifies 4-star reviews with technical issues as technical_issue", () => {
  const result = classify("It crashes sometimes", 4);
  assert.equal(result.intent, "technical_issue");
  assert.equal(result.template, "Technical Issue");
});
