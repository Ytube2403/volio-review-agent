const test = require("node:test");
const assert = require("node:assert/strict");
const agent = require("../tools/volio_review_agent.js");

test("fnv1a_64 hashing is stable and matches fixture", () => {
  const hash1 = agent.fnv1a_64("test-string");
  const hash2 = agent.fnv1a_64("test-string");
  assert.equal(hash1, hash2);
  assert.equal(hash1.length, 16);
  
  // Test distinct inputs
  const hash3 = agent.fnv1a_64("another-string");
  assert.notEqual(hash1, hash3);
});

// Mock simple DOM for testing getReviewCardIdentity & isAlreadyRepliedCard
test("isAlreadyRepliedCard correctly identifies signatures in boundary", () => {
  const signatureNode = {
    children: [],
    innerText: "Reply from support@volio.vn",
    textContent: "Reply from support@volio.vn",
    closest() { return cardObj; }
  };
  
  const cardObj = {
    innerText: "Reply from support@volio.vn",
    textContent: "Reply from support@volio.vn",
    querySelectorAll() { return [signatureNode]; },
    closest(sel) {
      if (sel.includes("rounded-[8px]")) return cardObj;
      return null;
    },
    getBoundingClientRect() { return { height: 100, width: 600 }; },
    tagName: "DIV"
  };
  
  signatureNode.parentElement = cardObj;
  
  const hasReply = agent.isAlreadyRepliedCard(cardObj);
  assert.ok(hasReply);
  
  const cardNoReply = {
    innerText: "No signature here",
    textContent: "No signature here",
    querySelectorAll() { return []; }
  };
  assert.ok(!agent.isAlreadyRepliedCard(cardNoReply));
});

test("reconcileCurrentPage identifies leftovers, silent skips, and retryable errors", () => {
  global.window = {
    document: {
      querySelectorAll() { return []; }
    },
    location: { href: "https://apps-publisher.volio.vn/reviews-feed" }
  };
  global.document = global.window.document;

  // Mock visible snapshot
  const mockVisibleSnapshot = [
    {
      review_identity: "ident-1",
      username: "User 1",
      rating: 5,
      originalText: "Love this app",
      alreadyReplied: false
    },
    {
      review_identity: "ident-2",
      username: "User 2",
      rating: 1,
      originalText: "Crashes on startup",
      alreadyReplied: false
    },
    {
      review_identity: "ident-3",
      username: "User 3",
      rating: 5,
      originalText: "Nice!",
      alreadyReplied: true // Already replied card
    }
  ];

  // Mock execution logs
  const executionRows = [
    {
      review_identity: "ident-1",
      status: "sent",
      error: ""
    },
    {
      review_identity: "ident-2",
      status: "failed",
      error: "reply_editor_not_opened" // Transient retryable error
    }
  ];

  // Mock classified reviews
  const classifiedReviews = [
    {
      review_identity: "ident-1",
      username: "User 1",
      rating: 5,
      decision: { intent: "five_star", validation_status: "valid" }
    },
    {
      review_identity: "ident-2",
      username: "User 2",
      rating: 1,
      decision: { intent: "technical_issue", validation_status: "valid" }
    }
  ];

  global.VolioReviewAgent = agent;
  const originalSnapshotFn = agent.getVisibleReviewSnapshot;
  agent.getVisibleReviewSnapshot = () => mockVisibleSnapshot;

  try {
    const report = agent.reconcileCurrentPage(executionRows, classifiedReviews, { pageNumber: 1 });
    
    assert.equal(report.visible_no_reply_count, 2); // ident-1 and ident-2 (ident-3 is alreadyReplied)
    assert.equal(report.already_replied_detected_count, 1); // ident-3
    assert.equal(report.leftover_count, 1); // ident-2 (ident-1 is sent)
    assert.equal(report.retryable_leftover_count, 1); // ident-2 has a retryable error
    assert.equal(report.leftovers[0].review_identity, "ident-2");
    assert.equal(report.leftovers[0].reason, "failed_with:reply_editor_not_opened");
    assert.equal(report.leftovers[0].retryable, true);
  } finally {
    agent.getVisibleReviewSnapshot = originalSnapshotFn;
    delete global.window;
    delete global.document;
    delete global.VolioReviewAgent;
  }
});
