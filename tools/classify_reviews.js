const fs = require('fs');
const path = require('path');
const agent = require('./volio_review_agent.js');

const app = process.argv[2] || 'compass';
const rootDir = path.join(__dirname, '..');
const appDir = path.join(rootDir, 'apps', app);
const logsDir = path.join(appDir, 'logs');

const scrapedPath = path.join(logsDir, 'reviews_scraped.json');
const classifiedPath = path.join(logsDir, 'reviews_classified.json');

const rulesPath = fs.existsSync(path.join(appDir, 'review_rules.json'))
  ? path.join(appDir, 'review_rules.json')
  : path.join(rootDir, 'review_rules.json');

console.log(`Loading scraped reviews from ${scrapedPath}...`);
if (!fs.existsSync(scrapedPath)) {
  console.error(`Scraped file not found: ${scrapedPath}`);
  process.exit(1);
}

const reviews = JSON.parse(fs.readFileSync(scrapedPath, 'utf8'));
console.log(`Loading rules from ${rulesPath}...`);
const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));

function getOriginalReviewText(review) {
  return review.originalText || review.review_original_text || review.text || "";
}

const classifiedReviews = reviews.map((review) => {
  const reviewForClassification = {
    ...review,
    text: getOriginalReviewText(review)
  };
  const decision = agent.classifyReview(reviewForClassification, rules, { minConfidence: 0.62 });
  return {
    ...review,
    text: reviewForClassification.text,
    originalText: review.originalText || review.review_original_text || reviewForClassification.text,
    translatedText: review.translatedText || review.review_translated_text || "",
    decision: {
      status: decision.status,
      intent: decision.intent,
      template: decision.template,
      folder: decision.folder,
      classification_text_source: "original"
    }
  };
});

fs.writeFileSync(classifiedPath, JSON.stringify(classifiedReviews, null, 2), 'utf8');
console.log(`Successfully classified ${classifiedReviews.length} reviews and saved to ${classifiedPath}`);
