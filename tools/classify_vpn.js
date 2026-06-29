const fs = require('fs');
const path = require('path');
const agent = require('./volio_review_agent.js');

const appDir = path.join(__dirname, '..', 'apps', 'vpn');
const scrapedPath = path.join(appDir, 'logs', 'reviews_scraped.json');
const classifiedPath = path.join(appDir, 'logs', 'reviews_classified.json');
const rulesPath = path.join(__dirname, '..', 'review_rules.json');

console.log(`Loading scraped reviews from ${scrapedPath}...`);
if (!fs.existsSync(scrapedPath)) {
  console.error(`Scraped file not found: ${scrapedPath}`);
  process.exit(1);
}

const reviews = JSON.parse(fs.readFileSync(scrapedPath, 'utf8'));
console.log(`Loading rules from ${rulesPath}...`);
const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));

// Rotation list for remove_ads must follow review_rules.json to avoid stale aliases.
const adsTemplates = rules.templates.remove_ads.aliases;
let adsCounter = 0;

const classifiedReviews = reviews.map((review) => {
  const decision = agent.classifyReview(review, rules, { minConfidence: 0.62 });
  
  let formattedDecision = {};
  
  if (!decision || decision.status !== "selected" || !decision.intent || decision.intent === "skipped_uncertain") {
    formattedDecision = {
      status: "skipped",
      intent: "skipped_uncertain",
      template: "",
      folder: ""
    };
  } else {
    let template = decision.template;
    let folder = decision.folder;
    let intent = decision.intent;

    if (intent === "remove_ads") {
      template = adsTemplates[adsCounter % adsTemplates.length];
      adsCounter++;
    }

    formattedDecision = {
      status: "selected",
      intent: intent,
      template: template,
      folder: folder
    };
  }

  return {
    ...review,
    decision: formattedDecision
  };
});

fs.writeFileSync(classifiedPath, JSON.stringify(classifiedReviews, null, 2), 'utf8');
console.log(`Successfully classified ${classifiedReviews.length} reviews and saved to ${classifiedPath}`);
console.log(`Number of remove_ads reviews: ${adsCounter}`);
