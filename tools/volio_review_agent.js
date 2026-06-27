/* eslint-disable no-console */
(function initVolioReviewAgent(root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
    return;
  }
  root.VolioReviewAgent = factory(root);
})(typeof globalThis !== "undefined" ? globalThis : this, function createFactory(root) {
  "use strict";

  const DEFAULT_RULES = {
    version: 1,
    defaults: {
      mode: "select_then_send",
      maxReviews: 50,
      minConfidence: 0.62,
      sendDelayMs: 15000,
      skipUncertain: true
    },
    templates: {
      general_1_star: { template: "General 1 star", aliases: ["General 1 star", "Not Good"] },
      need_details: { template: "Need Details", aliases: ["Need Details"] },
      technical_issue: {
        template: "Technical Issue",
        aliases: ["Technical Issue", "Technical Issue Response", "Technical Issue Thanks"]
      },
      remove_ads: {
        template: "Remove Ads 3",
        aliases: ["Remove Ads 3", "Remove ads 2", "Quảng cáo - Remove ad", "Remove Ads"]
      },
      permission_concern: { template: "Permission Concern", aliases: ["Permission Concern"] },
      virus_problem: { template: "Virus Problem", aliases: ["Virus Problem"] },
      usage_help: { template: "Usage Help", aliases: ["Usage Help"] },
      missing_content: { template: "Missing Content", aliases: ["Missing Content"] },
      performance_issue: { template: "Performance Issue", aliases: ["Performance Issue"] },
      rating_mismatch: { template: "Rating Mismatch", aliases: ["Rating Mismatch"] }
    },
    intents: [
      {
        id: "virus_problem",
        templateKey: "virus_problem",
        keywords: ["virus", "malware", "trojan", "unsafe", "security", "hack", "scam", "lừa đảo", "doc hai", "độc hại", "bao mat", "bảo mật"]
      },
      {
        id: "remove_ads",
        templateKey: "remove_ads",
        keywords: ["ad", "ads", "advert", "advertisement", "quang cao", "quảng cáo", "remove ads", "too many ads", "full screen ad", "popup ad"]
      },
      {
        id: "permission_concern",
        templateKey: "permission_concern",
        keywords: ["permission", "permissions", "privacy", "private", "data", "collect", "tracking", "camera", "microphone", "location", "quyen", "quyền", "du lieu", "dữ liệu", "rieng tu", "riêng tư"]
      },
      {
        id: "technical_issue",
        templateKey: "technical_issue",
        keywords: ["bug", "error", "crash", "crashed", "not working", "doesn't work", "dont work", "can't open", "cannot open", "freeze", "stuck", "lag", "black screen", "failed", "fix", "broken", "loi", "lỗi", "khong hoat dong", "không hoạt động", "bi treo", "bị treo", "văng", "sập"]
      },
      {
        id: "performance_issue",
        templateKey: "performance_issue",
        keywords: ["slow", "laggy", "lag", "battery", "heat", "hot", "ram", "storage", "performance", "data usage", "cham", "chậm", "nong may", "nóng máy", "hao pin", "tốn pin", "giật"]
      },
      {
        id: "missing_content",
        templateKey: "missing_content",
        keywords: ["missing", "no content", "not enough", "need more", "where is", "not available", "khong co", "không có", "thieu", "thiếu", "them", "thêm"]
      },
      {
        id: "usage_help",
        templateKey: "usage_help",
        keywords: ["how to", "how do i", "help", "setup", "set up", "install", "connect", "can't use", "cannot use", "guide", "huong dan", "hướng dẫn", "cai dat", "cài đặt", "su dung", "sử dụng"]
      },
      {
        id: "rating_mismatch",
        templateKey: "rating_mismatch",
        keywords: ["good", "great", "nice", "love", "like", "best", "excellent", "awesome", "hay", "tot", "tốt", "thich", "thích", "tuyet", "tuyệt"]
      },
      {
        id: "general_1_star",
        templateKey: "general_1_star",
        keywords: ["bad", "worst", "terrible", "hate", "useless", "poor", "awful", "not good", "te", "tệ", "qua te", "quá tệ", "chan", "chán", "kém"]
      }
    ]
  };

  const DEFAULT_OPTIONS = {
    maxReviews: DEFAULT_RULES.defaults.maxReviews,
    minConfidence: DEFAULT_RULES.defaults.minConfidence,
    sendDelayMs: DEFAULT_RULES.defaults.sendDelayMs,
    skipUncertain: DEFAULT_RULES.defaults.skipUncertain,
    openReplyTimeoutMs: 6000,
    templateTimeoutMs: 8000,
    sendTimeoutMs: 30000
  };

  const state = {
    batchId: makeBatchId(),
    rules: DEFAULT_RULES,
    options: DEFAULT_OPTIONS,
    rows: [],
    lastSummary: null,
    selectedCards: []
  };

  function mergeOptions(options) {
    return Object.assign({}, DEFAULT_OPTIONS, state.options || {}, options || {});
  }

  function getRules(options) {
    return (options && options.rules) || state.rules || DEFAULT_RULES;
  }

  function configure(config) {
    const activeConfig = config || {};
    if (activeConfig.rules) state.rules = activeConfig.rules;
    if (activeConfig.options) state.options = mergeOptions(activeConfig.options);
    return {
      rulesVersion: state.rules.version,
      options: state.options
    };
  }

  function makeBatchId() {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, "0");
    return [
      now.getFullYear(),
      pad(now.getMonth() + 1),
      pad(now.getDate()),
      "-",
      pad(now.getHours()),
      pad(now.getMinutes()),
      pad(now.getSeconds())
    ].join("");
  }

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function displayText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function getWordCount(text) {
    const normalized = normalizeText(text);
    if (!normalized) return 0;
    const words = normalized.match(/[\p{L}\p{N}]+/gu);
    return words ? words.length : 0;
  }

  function matchKeywordScore(text, keywords) {
    const normalized = normalizeText(text);
    let score = 0;
    const hits = [];
    for (const keyword of keywords || []) {
      const normalizedKeyword = normalizeText(keyword);
      if (!normalizedKeyword) continue;
      if (matchesKeyword(normalized, normalizedKeyword)) {
        score += normalizedKeyword.includes(" ") ? 2 : 1;
        hits.push(keyword);
      }
    }
    return { score, hits };
  }

  function matchesKeyword(normalizedText, normalizedKeyword) {
    if (normalizedKeyword.includes(" ")) {
      return normalizedText.includes(normalizedKeyword);
    }
    const escaped = normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}([^\\p{L}\\p{N}]|$)`, "u").test(normalizedText);
  }

  function classifyReview(review, rules, options) {
    const activeRules = rules || DEFAULT_RULES;
    const activeOptions = mergeOptions(options);
    const rating = Number(review && review.rating);
    const text = displayText(review && review.text);
    const wordCount = getWordCount(text);
    const minConfidence = activeOptions.minConfidence;

    if (wordCount === 0) {
      return skipped("empty_review", rating, text);
    }

    let best = null;
    const scored = [];
    for (const intent of activeRules.intents) {
      const result = matchKeywordScore(text, intent.keywords);
      if (result.score <= 0) continue;
      let confidence = Math.min(0.98, 0.54 + result.score * 0.13);
      if (intent.id === "rating_mismatch" && rating > 3) confidence -= 0.35;
      if (intent.id === "general_1_star" && rating >= 4) confidence -= 0.3;
      if (intent.id !== "rating_mismatch" && intent.id !== "general_1_star" && rating <= 2) confidence += 0.04;
      const template = activeRules.templates[intent.templateKey];
      const candidate = {
        status: "selected",
        intent: intent.id,
        templateKey: intent.templateKey,
        template: template.template,
        aliases: template.aliases,
        confidence: roundConfidence(confidence),
        reason: result.hits.join(", "),
        rating,
        text
      };
      scored.push(candidate);
      if (!best || candidate.confidence > best.confidence) best = candidate;
    }

    const hasIssueIntent = scored.some((item) => item.intent !== "rating_mismatch" && item.confidence >= minConfidence);
    const positiveCandidate = scored.find((item) => item.intent === "rating_mismatch");
    if (positiveCandidate && rating <= 3 && !hasIssueIntent && positiveCandidate.confidence >= minConfidence) {
      return positiveCandidate;
    }

    if (best && best.intent !== "rating_mismatch" && best.confidence >= minConfidence) {
      return best;
    }

    if (rating === 1 && wordCount >= 2) {
      const template = activeRules.templates.general_1_star;
      return {
        status: "selected",
        intent: "general_1_star",
        templateKey: "general_1_star",
        template: template.template,
        aliases: template.aliases,
        confidence: 0.66,
        reason: "fallback: 1-star review without a stronger intent",
        rating,
        text
      };
    }

    if (rating <= 2 && wordCount >= 4) {
      const template = activeRules.templates.need_details;
      return {
        status: "selected",
        intent: "need_details",
        templateKey: "need_details",
        template: template.template,
        aliases: template.aliases,
        confidence: 0.63,
        reason: "fallback: low-rating review needs details",
        rating,
        text
      };
    }

    return skipped("uncertain_or_too_short", rating, text);
  }

  function skipped(reason, rating, text) {
    return {
      status: "skipped_uncertain",
      intent: "",
      templateKey: "",
      template: "",
      aliases: [],
      confidence: 0,
      reason,
      rating: Number.isFinite(rating) ? rating : "",
      text: displayText(text)
    };
  }

  function roundConfidence(value) {
    return Math.max(0, Math.min(1, Math.round(value * 100) / 100));
  }

  function assertBrowser() {
    if (!root || !root.document) {
      throw new Error("This action must run in the Volio browser page. The classifier can still run in Node tests.");
    }
  }

  function isVisible(element) {
    if (!element || !element.getBoundingClientRect) return false;
    const style = root.getComputedStyle(element);
    if (style.visibility === "hidden" || style.display === "none" || Number(style.opacity) === 0) return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function isDisabled(element) {
    return Boolean(
      element.disabled ||
        element.getAttribute("aria-disabled") === "true" ||
        /\bdisabled\b/i.test(element.className || "")
    );
  }

  function getElementText(element) {
    if (!element) return "";
    const value = element.value || element.innerText || element.textContent || element.getAttribute("aria-label") || "";
    return displayText(value);
  }

  function getClickableElements(scope) {
    const searchRoot = scope || root.document;
    return Array.from(searchRoot.querySelectorAll("button, [role='button'], a, .ant-btn, [tabindex]")).filter(isVisible);
  }

  function findClickableByText(scope, labels, options) {
    const activeOptions = Object.assign({ exact: false, enabledOnly: false }, options || {});
    const normalizedLabels = labels.map(normalizeText).filter(Boolean);
    const elements = getClickableElements(scope);
    for (const element of elements) {
      if (activeOptions.enabledOnly && isDisabled(element)) continue;
      const text = normalizeText(getElementText(element));
      const aria = normalizeText(element.getAttribute("aria-label") || "");
      for (const label of normalizedLabels) {
        if (activeOptions.exact) {
          if (text === label || aria === label) return element;
        } else if (text.includes(label) || aria.includes(label)) {
          return element;
        }
      }
    }
    return null;
  }

  function findClosestReviewCard(element) {
    let current = element;
    let best = null;
    for (let depth = 0; current && depth < 12; depth += 1) {
      const text = normalizeText(getElementText(current));
      const rect = current.getBoundingClientRect ? current.getBoundingClientRect() : { height: 0, width: 0 };
      const hasReviewActions =
        text.includes("google translate") ||
        text.includes("retranslate") ||
        text.includes("reply to review") ||
        text.includes("send message");
      if (hasReviewActions && rect.height >= 90 && rect.width >= 500) {
        best = current;
      }
      current = current.parentElement;
    }
    return best || element.closest("[class*='review'], [class*='card'], [class*='item']") || element.parentElement;
  }

  function getReviewCardsFromPage(options) {
    assertBrowser();
    const activeOptions = mergeOptions(options);
    const replyButtons = getClickableElements(root.document).filter((button) => {
      const text = normalizeText(getElementText(button));
      return text.includes("reply to review");
    });
    const unique = [];
    const seen = new Set();
    for (const button of replyButtons) {
      const card = findClosestReviewCard(button);
      if (!card || seen.has(card)) continue;
      seen.add(card);
      unique.push(card);
      if (unique.length >= activeOptions.maxReviews) break;
    }
    return unique;
  }

  function extractRating(card) {
    const labelled = Array.from(card.querySelectorAll("[aria-label], [title]"));
    for (const element of labelled) {
      const label = `${element.getAttribute("aria-label") || ""} ${element.getAttribute("title") || ""}`;
      const match = label.match(/([1-5])\s*(star|sao)/i);
      if (match) return Number(match[1]);
    }

    const fullStars = Array.from(card.querySelectorAll("[class*='star-full'], [class*='rate-star-full'], .ant-rate-star-full"));
    if (fullStars.length >= 1 && fullStars.length <= 5) return fullStars.length;

    const text = getElementText(card);
    const dateMatch = text.match(/\b([1-5])\s*(?:star|sao)\b/i);
    if (dateMatch) return Number(dateMatch[1]);
    return "";
  }

  function extractUserName(card) {
    const text = getElementText(card);
    const parts = text.split(/\s{2,}|\n/).map(displayText).filter(Boolean);
    const banned = /google translate|retranslate|reply to review|like \(|dislike \(|device language|review language/i;
    for (const part of parts) {
      if (banned.test(part)) continue;
      if (part.length > 1 && part.length < 80) return part.replace(/[?ⓘ]+$/g, "").trim();
    }
    return "";
  }

  function extractReviewText(card) {
    const clone = card.cloneNode(true);
    const selectorsToRemove = [
      "button",
      "[role='button']",
      "textarea",
      "input",
      ".ant-btn",
      ".ant-tag",
      "[class*='tag']",
      "[class*='translate']"
    ];
    for (const selector of selectorsToRemove) {
      clone.querySelectorAll(selector).forEach((element) => element.remove());
    }
    const lines = (clone.innerText || clone.textContent || "")
      .split(/\n+/)
      .map(displayText)
      .filter(Boolean)
      .filter((line) => !/device language|review language|like \(|dislike \(|google translate|retranslate/i.test(line))
      .filter((line) => !/^\d{2}\/\d{2}\/\d{4}/.test(line))
      .filter((line) => !/^[★☆\s]+$/.test(line));

    const translated = lines.find((line) => /^\(.+\)$/.test(line) && line.length > 5);
    if (translated) return translated.replace(/^\(|\)$/g, "");

    return lines.slice(1, 4).join(" ").slice(0, 1000);
  }

  function extractReviewLanguage(card) {
    const text = getElementText(card);
    const match = text.match(/Review language:\s*([^\s]+)/i);
    return match ? match[1] : "";
  }

  function collectReviewData(options) {
    assertBrowser();
    const activeRules = getRules(options);
    const cards = getReviewCardsFromPage(options);
    return cards.map((card, index) => {
      const review = {
        index: index + 1,
        card,
        username: extractUserName(card),
        rating: extractRating(card),
        text: extractReviewText(card),
        reviewLanguage: extractReviewLanguage(card),
        pageUrl: root.location.href
      };
      const decision = classifyReview(review, activeRules, options);
      return Object.assign(review, { decision });
    });
  }

  function toLogRow(item, status, error) {
    return {
      batch_id: state.batchId,
      page_url: item.pageUrl || (root && root.location ? root.location.href : ""),
      review_index: item.index,
      username: item.username || "",
      rating: item.rating || "",
      review_language: item.reviewLanguage || "",
      review_text: item.text || "",
      detected_intent: item.decision.intent || "",
      template: item.decision.template || "",
      confidence: item.decision.confidence,
      status,
      reason: item.decision.reason || "",
      error: error || ""
    };
  }

  function addLog(row) {
    state.rows.push(row);
    console.log("[VolioReviewAgent]", row.status, row.review_index, row.template || row.reason, row.error || "");
  }

  function delay(ms) {
    return new Promise((resolve) => root.setTimeout(resolve, ms));
  }

  async function waitFor(predicate, timeoutMs, intervalMs) {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      const value = predicate();
      if (value) return value;
      await delay(intervalMs || 200);
    }
    return null;
  }

  async function openReplyEditor(card, options) {
    const existing = findClickableByText(card, ["Send Message"], { enabledOnly: false });
    if (existing) return true;
    const replyButton = findClickableByText(card, ["Reply to Review"], { enabledOnly: true });
    if (!replyButton) return false;
    replyButton.scrollIntoView({ block: "center", inline: "nearest" });
    await delay(100);
    replyButton.click();
    return Boolean(await waitFor(() => findClickableByText(card, ["Send Message"], { enabledOnly: false }), options.openReplyTimeoutMs, 250));
  }

  function findTemplateButton(scope, labels) {
    for (const label of labels) {
      const exact = findClickableByText(scope, [label], { exact: true, enabledOnly: true });
      if (exact) return exact;
    }
    return findClickableByText(scope, labels, { enabledOnly: true });
  }

  function findMoreTemplatesButton(card) {
    const candidates = getClickableElements(card).filter((button) => {
      const text = normalizeText(getElementText(button));
      const aria = normalizeText(button.getAttribute("aria-label") || "");
      return text === "..." || text === "more" || aria.includes("more") || aria.includes("ellipsis");
    });
    return candidates[candidates.length - 1] || null;
  }

  async function selectTemplate(card, decision, options) {
    const labels = decision.aliases && decision.aliases.length ? decision.aliases : [decision.template];
    let templateButton = findTemplateButton(card, labels);
    if (!templateButton) {
      const moreButton = findMoreTemplatesButton(card);
      if (!moreButton) return { ok: false, error: "template_not_visible_and_more_button_missing" };
      moreButton.scrollIntoView({ block: "center", inline: "nearest" });
      await delay(100);
      moreButton.click();
      templateButton = await waitFor(() => findTemplateButton(root.document, labels), options.templateTimeoutMs, 250);
    }
    if (!templateButton) return { ok: false, error: `template_not_found: ${decision.template}` };

    templateButton.scrollIntoView({ block: "center", inline: "nearest" });
    await delay(100);
    templateButton.click();
    const confirmed = await waitFor(() => hasReplyContent(card), options.templateTimeoutMs, 250);
    if (!confirmed) return { ok: false, error: "reply_content_not_confirmed_after_template_click" };
    return { ok: true };
  }

  function hasReplyContent(card) {
    const textareas = Array.from(card.querySelectorAll("textarea"));
    if (textareas.some((item) => displayText(item.value).length > 10)) return true;
    const editables = Array.from(card.querySelectorAll("[contenteditable='true']"));
    if (editables.some((item) => getElementText(item).length > 10)) return true;
    const sendButton = findClickableByText(card, ["Send Message"], { enabledOnly: false });
    return Boolean(sendButton && !isDisabled(sendButton));
  }

  async function dryRun(options) {
    const items = collectReviewData(options || { maxReviews: 5 });
    for (const item of items) {
      addLog(toLogRow(item, item.decision.status, ""));
    }
    state.lastSummary = summarize();
    return { items: items.map(stripDom), summary: state.lastSummary };
  }

  async function selectOnly(options) {
    const activeOptions = mergeOptions(options);
    const items = collectReviewData(activeOptions);
    state.selectedCards = [];

    for (const item of items) {
      if (item.decision.status !== "selected") {
        addLog(toLogRow(item, "skipped_uncertain", ""));
        continue;
      }

      try {
        item.card.scrollIntoView({ block: "center", inline: "nearest" });
        const opened = await openReplyEditor(item.card, activeOptions);
        if (!opened) {
          addLog(toLogRow(item, "failed", "reply_editor_not_opened"));
          continue;
        }
        const selected = await selectTemplate(item.card, item.decision, activeOptions);
        if (!selected.ok) {
          addLog(toLogRow(item, "failed", selected.error));
          continue;
        }
        state.selectedCards.push(item.card);
        addLog(toLogRow(item, "selected", ""));
      } catch (error) {
        addLog(toLogRow(item, "failed", error && error.message ? error.message : String(error)));
      }
    }

    state.lastSummary = summarize();
    return state.lastSummary;
  }

  function findSendableCards() {
    const sendButtons = getClickableElements(root.document).filter((button) => {
      const text = normalizeText(getElementText(button));
      return text.includes("send message") && !isDisabled(button);
    });
    const cards = [];
    const seen = new Set();
    for (const button of sendButtons) {
      const card = findClosestReviewCard(button);
      if (card && !seen.has(card) && hasReplyContent(card)) {
        seen.add(card);
        cards.push(card);
      }
    }
    return cards;
  }

  async function sendSelected(options) {
    assertBrowser();
    const activeOptions = mergeOptions(options);
    let sent = 0;
    let failed = 0;

    while (true) {
      const card = findSendableCards()[0];
      if (!card) break;
      const sendButton = findClickableByText(card, ["Send Message"], { enabledOnly: true });
      if (!sendButton) break;
      const beforeText = getElementText(card).slice(0, 200);
      sendButton.scrollIntoView({ block: "center", inline: "nearest" });
      await delay(100);
      sendButton.click();
      await delay(activeOptions.sendDelayMs);

      const stillSendable = root.document.body.contains(card) && findClickableByText(card, ["Send Message"], { enabledOnly: true });
      if (stillSendable && getElementText(card).slice(0, 200) === beforeText) {
        failed += 1;
        addLog({
          batch_id: state.batchId,
          page_url: root.location.href,
          review_index: "",
          username: "",
          rating: "",
          review_language: "",
          review_text: beforeText,
          detected_intent: "",
          template: "",
          confidence: "",
          status: "failed",
          reason: "send did not complete",
          error: "send_button_still_enabled_after_delay"
        });
        break;
      }
      sent += 1;
      addLog({
        batch_id: state.batchId,
        page_url: root.location.href,
        review_index: "",
        username: "",
        rating: "",
        review_language: "",
        review_text: beforeText,
        detected_intent: "",
        template: "",
        confidence: "",
        status: "sent",
        reason: `waited ${activeOptions.sendDelayMs}ms`,
        error: ""
      });
    }

    state.lastSummary = Object.assign(summarize(), { sent, failedDuringSend: failed });
    return state.lastSummary;
  }

  async function selectThenSend(options) {
    const selectionSummary = await selectOnly(options);
    if (selectionSummary.failed > 0) {
      console.warn("[VolioReviewAgent] Selection had failures. Sending will continue only for currently sendable selected replies.");
    }
    const sendSummary = await sendSelected(options);
    return { selectionSummary, sendSummary, log: state.rows };
  }

  function stripDom(item) {
    const copy = Object.assign({}, item);
    delete copy.card;
    return copy;
  }

  function summarize() {
    const counts = {};
    for (const row of state.rows) {
      counts[row.status] = (counts[row.status] || 0) + 1;
    }
    return {
      batchId: state.batchId,
      totalRows: state.rows.length,
      selected: counts.selected || 0,
      sent: counts.sent || 0,
      skipped: counts.skipped_uncertain || 0,
      failed: counts.failed || 0,
      counts
    };
  }

  function toCsv(rows) {
    const columns = [
      "batch_id",
      "page_url",
      "review_index",
      "username",
      "rating",
      "review_language",
      "review_text",
      "detected_intent",
      "template",
      "confidence",
      "status",
      "reason",
      "error"
    ];
    const escape = (value) => `"${String(value == null ? "" : value).replace(/"/g, '""')}"`;
    return [columns.join(","), ...rows.map((row) => columns.map((column) => escape(row[column])).join(","))].join("\r\n");
  }

  function downloadLog() {
    assertBrowser();
    const csv = toCsv(state.rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = root.document.createElement("a");
    link.href = url;
    link.download = `review-batch-${state.batchId}.csv`;
    root.document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    return csv;
  }

  async function copyLog() {
    assertBrowser();
    const csv = toCsv(state.rows);
    await root.navigator.clipboard.writeText(csv);
    return csv;
  }

  return {
    DEFAULT_RULES,
    DEFAULT_OPTIONS,
    state,
    configure,
    normalizeText,
    classifyReview,
    collectReviewData,
    dryRun,
    selectOnly,
    sendSelected,
    selectThenSend,
    summarize,
    toCsv,
    downloadLog,
    copyLog
  };
});
