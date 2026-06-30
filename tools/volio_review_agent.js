/* eslint-disable no-console */
(function initVolioReviewAgent(root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(typeof globalThis !== "undefined" ? globalThis : this);
    return;
  }
  root.VolioReviewAgent = factory(root);
})(typeof globalThis !== "undefined" ? globalThis : this, function createFactory(root) {
  "use strict";

  const DEFAULT_RULES = {
      "version": 2,
      "defaults": {
          "mode": "select_then_send",
          "maxReviews": 50,
          "minConfidence": 0.62,
          "sendDelayMs": 15000,
          "skipUncertain": true
      },
      "templates": {
          "general_1_star": {
              "template": "General 1 star",
              "folder": "User chê app",
              "aliases": [
                  "General 1 star"
              ]
          },
          "need_details": {
              "template": "Need Details",
              "folder": "Review không liên quan",
              "aliases": [
                  "Need Details"
              ]
          },
          "technical_issue": {
              "template": "Technical Issue",
              "folder": "Technical Issue Response",
              "aliases": [
                  "Technical Issue",
                  "Technical Issue Response",
                  "Technical Issue Thanks",
                  "Technical Issue Fixed",
                  "Content Error"
              ]
          },
          "remove_ads": {
              "template": "Remove Ads 3",
              "folder": "Remove Ads",
              "aliases": [
                  "Remove Ads 3",
                  "Ads - Improvement",
                  "Ads - Angry",
                  "Ads - Positive",
                  "Ads - Good App",
                  "Remove Ads - Unskippable",
                  "Remove Ads 4",
                  "remove ads 2",
                  "Quảng cáo - Remove ad"
              ]
          },
          "positive_ads_feedback": {
              "template": "Reply_4Star_Ads_Option3",
              "folder": "Remove Ads",
              "aliases": [
                  "Reply_4Star_Ads_Option3",
                  "Ads - Positive",
                  "Ads - Good App",
                  "Positive but Ads Feedback"
              ]
          },
          "permission_concern": {
              "template": "Privacy",
              "folder": "Technical Issue Response",
              "aliases": [
                  "Privacy",
                  "Permission Concern"
              ]
          },
          "virus_problem": {
              "template": "Virus Problem",
              "folder": "Technical Issue Response",
              "aliases": [
                  "Virus Problem"
              ]
          },
          "usage_help": {
              "template": "Usage Help",
              "folder": "Review không liên quan",
              "aliases": [
                  "Usage Help"
              ]
          },
          "missing_content": {
              "template": "Missing Content",
              "folder": "User góp ý",
              "aliases": [
                  "Missing Content"
              ]
          },
          "feature_request": {
              "template": "Feature Request",
              "folder": "User góp ý",
              "aliases": [
                  "Feature Request",
                  "Content Suggestion"
              ]
          },
          "performance_issue": {
              "template": "Performance Issue",
              "folder": "Technical Issue Response",
              "aliases": [
                  "Performance Issue"
              ]
          },
          "rating_mismatch": {
              "template": "Positive Low Rating",
              "folder": "User khen app",
              "aliases": [
                  "Positive Low Rating",
                  "Rating Mismatch"
              ]
          },
          "paywall": {
              "template": "Paywall",
              "folder": "User góp ý",
              "aliases": [
                  "Paywall"
              ]
          },
          "five_star": {
              "template": "Phản hồi 5 sao - Nhiều Icon (2)",
              "folder": "5 sao",
              "aliases": [
                  "Phản hồi 5 sao - Nhiều Icon (2)",
                  "cảm ơn sâu sắc",
                  "mời quay lại dùng tiếp",
                  "ghi nhận góp ý (nếu có)",
                  "5 sao (2)",
                  "Phản hồi 5 sao 1",
                  "Short Thanks",
                  "Feature Love",
                  "Positive With Issue",
                  "User Love",
                  "User Love - Warm",
                  "User Love - Share",
                  "User Love - Engage",
                  "Great App 2",
                  "Great user taste",
                  "Great App",
                  "Khen ngợi - Phản hồi nhiệt tình",
                  "Phản hồi thân thiện",
                  "Phản hồi đáng yêu 1",
                  "Phản hồi đáng yêu 2"
              ]
          },
          "four_star": {
              "template": "Great App 2",
              "folder": "User khen app",
              "aliases": [
                  "Great App 2",
                  "User Love",
                  "User Love - Warm",
                  "User Love - Share",
                  "User Love - Engage",
                  "cảm ơn sâu sắc",
                  "mời quay lại dùng tiếp",
                  "Phản hồi 5 sao 1",
                  "Short Thanks",
                  "Feature Love",
                  "Positive With Issue",
                  "Great user taste",
                  "Great App",
                  "Khen ngợi - Phản hồi nhiệt tình",
                  "Phản hồi thân thiện",
                  "Phản hồi đáng yêu 1",
                  "Phản hồi đáng yêu 2"
              ]
          }
      },
      "templateFolders": {
          "Review không liên quan": [
              "Usage Help",
              "Improve Note",
              "Need Details",
              "Rating Mismatch",
              "Not Good",
              "Không liên quan 1"
          ],
          "Technical Issue Response": [
              "Virus Problem",
              "Technical Issue",
              "Privacy",
              "Permission Concern",
              "Technical Issue Thanks",
              "Technical Issue Fixed",
              "Performance Issue",
              "Content Error"
          ],
          "User chê app": [
              "General 1 star",
              "Xin lỗi & Cam kết cải thiện",
              "Xin lỗi và Hỗ trợ kỹ thuật",
              "Xin lỗi và cam kết cập nhật"
          ],
          "User góp ý": [
              "Feature Request",
              "Missing Content",
              "Paywall",
              "Setup Feedback",
              "Star Upgrade",
              "Positive but Ads Feedback",
              "Content Suggestion"
          ],
          "User khen app": [
              "Positive With Issue",
              "Feature Love",
              "Short Thanks",
              "Positive Low Rating",
              "User Love",
              "User Love - Warm",
              "User Love - Share",
              "User Love - Engage",
              "Great App 2",
              "Great user taste",
              "Great App",
              "Khen ngợi - Phản hồi nhiệt tình",
              "Phản hồi thân thiện",
              "Phản hồi đáng yêu 1",
              "Phản hồi đáng yêu 2"
          ],
          "Remove Ads": [
              "Remove Ads - Unskippable",
              "Ads - Good App",
              "Remove Ads 4",
              "Ads - Improvement",
              "Ads - Angry",
              "Ads - Positive",
              "Remove Ads 3",
              "remove ads 2",
              "Quảng cáo - Remove ad",
              "Reply_4Star_Ads_Option3"
          ],
          "5 sao": [
              "Phản hồi 5 sao - Nhiều Icon (2)",
              "cảm ơn sâu sắc",
              "mời quay lại dùng tiếp",
              "ghi nhận góp ý (nếu có)",
              "5 sao (2)",
              "Phản hồi 5 sao 1"
          ]
      },
      "templateRotation": {
          "positive_user_love": [
              "User Love",
              "User Love - Warm",
              "User Love - Share",
              "User Love - Engage"
          ]
      },
      "intents": [
          {
              "id": "virus_problem",
              "templateKey": "virus_problem",
              "keywords": [
                  "virus",
                  "malware",
                  "trojan",
                  "unsafe",
                  "security",
                  "hack",
                  "scam",
                  "lừa đảo",
                  "doc hai",
                  "độc hại",
                  "bao mat",
                  "bảo mật"
              ]
          },
          {
              "id": "positive_ads_feedback",
              "templateKey": "positive_ads_feedback",
              "keywords": [
                  "ad",
                  "ads",
                  "advert",
                  "advertisement",
                  "quang cao",
                  "quảng cáo",
                  "remove ads",
                  "too many ads",
                  "popup ad",
                  "publicité",
                  "publicidad",
                  "publicidade",
                  "реклама",
                  "โฆษณา",
                  "iklan",
                  "iklannya",
                  "reklama",
                  "reklamie",
                  "광고",
                  "광고가",
                  "광고는",
                  "광고를"
              ],
              "exclude": [
                  "hate",
                  "angry",
                  "terrible",
                  "worst",
                  "bad",
                  "unusable",
                  "cannot use",
                  "can't use",
                  "cant use",
                  "not usable",
                  "doesn't work",
                  "not working"
              ]
          },
          {
              "id": "remove_ads",
              "templateKey": "remove_ads",
              "keywords": [
                  "ad",
                  "ads",
                  "add",
                  "adds",
                  "advert",
                  "adverts",
                  "advertisement",
                  "advertisements",
                  "quang cao",
                  "quảng cáo",
                  "quảng cqso",
                  "qc",
                  "qcáo",
                  "q.cáo",
                  "q cáo",
                  "quảng cáp",
                  "remove ads",
                  "too many ads",
                  "full screen ad",
                  "popup ad",
                  "pub",
                  "pubs",
                  "publicite",
                  "publicité",
                  "publicites",
                  "publicités",
                  "annonce",
                  "annonces",
                  "werbung",
                  "reklame",
                  "propaganda",
                  "propagandas",
                  "anuncio",
                  "anuncios",
                  "anúncio",
                  "anúncios",
                  "reklam",
                  "reklamlar",
                  "reklama",
                  "reklamie",
                  "pubblicita",
                  "pubblicità",
                  "publicidad",
                  "publicidades",
                  "publicidade",
                  "реклама",
                  "рекламы",
                  "рекламу",
                  "рекламе",
                  "реклам",
                  "реклами",
                  "โฆษณา",
                  "โฆษณ",
                  "iklan",
                  "iklannya",
                  "reclame",
                  "광고",
                  "광고가",
                  "광고는",
                  "광고를"
              ],
              "exclude": [
                  "add feature",
                  "add features",
                  "please add",
                  "can you add",
                  "could you add",
                  "to add",
                  "add a",
                  "add more",
                  "add new",
                  "add button",
                  "add option",
                  "add options",
                  "adds a",
                  "adds more",
                  "adds new"
              ]
          },
          {
              "id": "permission_concern",
              "templateKey": "permission_concern",
              "keywords": [
                  "permission",
                  "permissions",
                  "privacy",
                  "private",
                  "data",
                  "collect",
                  "tracking",
                  "camera",
                  "microphone",
                  "location",
                  "quyen",
                  "quyền",
                  "du lieu",
                  "dữ liệu",
                  "rieng tu",
                  "riêng tư",
                  "thông báo",
                  "thong bao",
                  "notification",
                  "notifications",
                  "bildirim",
                  "bildirimler"
              ]
          },
          {
              "id": "paywall",
              "templateKey": "paywall",
              "keywords": [
                  "pay",
                  "paid",
                  "payment",
                  "purchase",
                  "buy",
                  "money",
                  "subscription",
                  "premium",
                  "locked",
                  "unlock",
                  "charge",
                  "cost",
                  "fee",
                  "tra tien",
                  "trả tiền",
                  "mat tien",
                  "mất tiền",
                  "bat tra tien",
                  "bắt trả tiền",
                  "mua",
                  "tinh phi",
                  "tính phí",
                  "فلوس",
                  "مال",
                  "اشتراك",
                  "مدفوع"
              ]
          },
          {
              "id": "technical_issue",
              "templateKey": "technical_issue",
              "keywords": [
                  "bug",
                  "error",
                  "crash",
                  "crashed",
                  "crashes",
                  "not working",
                  "doesn't work",
                  "dont work",
                  "can't open",
                  "cannot open",
                  "freeze",
                  "stuck",
                  "lag",
                  "black screen",
                  "failed",
                  "fix",
                  "broken",
                  "loi",
                  "lỗi",
                  "khong hoat dong",
                  "không hoạt động",
                  "bi treo",
                  "bị treo",
                  "văng",
                  "sập",
                  "connect",
                  "connection",
                  "connecting",
                  "disconnect",
                  "disconnected",
                  "reconnect",
                  "reconnecting",
                  "cannot connect",
                  "cant connect",
                  "can't connect",
                  "won't connect",
                  "wont connect",
                  "no connect",
                  "fail to connect",
                  "failed to connect",
                  "ket noi",
                  "kết nối",
                  "không kết nối",
                  "khong ket noi",
                  "khó kết nối",
                  "kho ket noi",
                  "conectar",
                  "conexion",
                  "conexión",
                  "connexion",
                  "connecter",
                  "conexao",
                  "conexão",
                  "comectar",
                  "conectat",
                  "conetar",
                  "conetarse",
                  "conctar",
                  "concta",
                  "verbinden",
                  "verbindung",
                  "collegare",
                  "collegamento",
                  "wifi",
                  "wi-fi",
                  "wi fi",
                  "wireless",
                  "не работает",
                  "не працює",
                  "работает",
                  "подключение",
                  "подключить",
                  "підключення",
                  "з'єднання",
                  "коннект",
                  "خراب",
                  "اتصال",
                  "وصل",
                  "نمی‌شه",
                  "نمیشه",
                  "çalışmıyor",
                  "baglanti",
                  "лагает",
                  "баг",
                  "баги",
                  "tidak berfungsi",
                  "tidak fungsi",
                  "gak fungsi",
                  "ga fungsi",
                  "nggak fungsi",
                  "tak boleh pakai",
                  "tidak bisa dipakai"
              ]
          },
          {
              "id": "performance_issue",
              "templateKey": "performance_issue",
              "keywords": [
                  "slow",
                  "laggy",
                  "lag",
                  "battery",
                  "heat",
                  "hot",
                  "ram",
                  "storage",
                  "performance",
                  "data usage",
                  "cham",
                  "chậm",
                  "nong may",
                  "nóng máy",
                  "hao pin",
                  "tốn pin",
                  "giật"
              ]
          },
          {
              "id": "missing_content",
              "templateKey": "missing_content",
              "keywords": [
                  "missing",
                  "no content",
                  "not enough",
                  "need more",
                  "where is",
                  "not available",
                  "khong co",
                  "không có",
                  "thieu",
                  "thiếu",
                  "them",
                  "thêm"
              ]
          },
          {
              "id": "feature_request",
              "templateKey": "feature_request",
              "keywords": [
                  "feature request",
                  "suggestion",
                  "please add",
                  "can you add",
                  "could you add",
                  "would like",
                  "i wish",
                  "wish it had",
                  "hope it's offline",
                  "offline mode",
                  "should be offline",
                  "need offline",
                  "more options",
                  "new feature",
                  "add more",
                  "bổ sung",
                  "bo sung",
                  "thêm tính năng",
                  "them tinh nang",
                  "ngoại tuyến",
                  "ngoai tuyen"
              ]
          },
          {
              "id": "usage_help",
              "templateKey": "usage_help",
              "keywords": [
                  "how to",
                  "how do i",
                  "how does",
                  "how does it",
                  "how dose",
                  "how work",
                  "how it work",
                  "how use",
                  "how to use",
                  "how to connect",
                  "how connect",
                  "help",
                  "setup",
                  "set up",
                  "install",
                  "connect",
                  "can't use",
                  "cannot use",
                  "guide",
                  "huong dan",
                  "hướng dẫn",
                  "cai dat",
                  "cài đặt",
                  "su dung",
                  "sử dụng",
                  "como funciona",
                  "como usar",
                  "comment ca marche",
                  "wie funktioniert",
                  "nasil calisir"
              ]
          },
          {
              "id": "rating_mismatch",
              "templateKey": "rating_mismatch",
              "keywords": [
                  "good",
                  "great",
                  "nice",
                  "love",
                  "like",
                  "best",
                  "excellent",
                  "awesome",
                  "hay",
                  "tot",
                  "tốt",
                  "thich",
                  "thích",
                  "tuyet",
                  "tuyệt",
                  "đẹp",
                  "dep",
                  "tuyệt vời",
                  "tuyet voi",
                  "ok",
                  "okay",
                  "tiện lợi",
                  "tien loi",
                  "hữu ích",
                  "huu ich",
                  "hoàn hảo",
                  "hoan hao",
                  "bon",
                  "bonne",
                  "super",
                  "bien",
                  "adore",
                  "adoré",
                  "adore",
                  "bueno",
                  "buena",
                  "excelente",
                  "me encanta",
                  "encanta",
                  "gusto",
                  "gusta",
                  "bom",
                  "boa",
                  "otimo",
                  "ótimo",
                  "legal",
                  "gostei",
                  "gosto",
                  "adoro",
                  "adorado",
                  "bello",
                  "bella",
                  "buono",
                  "buona",
                  "ottimo",
                  "ottima",
                  "bene",
                  "bagus",
                  "baik",
                  "mantap",
                  "keren",
                  "iyi",
                  "guzel",
                  "güzel",
                  "harika",
                  "cok guzel",
                  "خوب",
                  "عالی",
                  "ممتاز",
                  "جميل",
                  "حلو",
                  "хорошо",
                  "отлично",
                  "класс",
                  "нормально",
                  "hermoso",
                  "hermosa"
              ],
              "exclude": [
                  "don't like",
                  "dont like",
                  "do not like",
                  "khong thich",
                  "không thích",
                  "bad",
                  "tệ",
                  "not working",
                  "doesn't work"
              ]
          },
          {
              "id": "general_1_star",
              "templateKey": "general_1_star",
              "keywords": [
                  "bad",
                  "worst",
                  "terrible",
                  "hate",
                  "useless",
                  "poor",
                  "awful",
                  "not good",
                  "te",
                  "tệ",
                  "qua te",
                  "quá tệ",
                  "chan",
                  "chán",
                  "kém"
              ]
          }
      ]
  };

  const DEFAULT_OPTIONS = {
    maxReviews: DEFAULT_RULES.defaults.maxReviews,
    minConfidence: DEFAULT_RULES.defaults.minConfidence,
    sendDelayMs: DEFAULT_RULES.defaults.sendDelayMs,
    skipUncertain: DEFAULT_RULES.defaults.skipUncertain,
    openReplyTimeoutMs: 12000,
    templateTimeoutMs: 15000,
    sendTimeoutMs: 30000
  };

  let rotateCounters = {};
  if (typeof localStorage !== "undefined") {
    try {
      const saved = localStorage.getItem("volio_rotate_counters");
      if (saved) rotateCounters = JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load rotateCounters:", e);
    }
  }

  const debugLogs = [];
  const originalLog = console.log;
  console.log = function(...args) {
    debugLogs.push(args.map(a => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" "));
    originalLog.apply(console, args);
  };

  const state = {
    batchId: makeBatchId(),
    rules: DEFAULT_RULES,
    options: DEFAULT_OPTIONS,
    rows: [],
    lastSummary: null,
    selectedCards: [],
    debugLogs: debugLogs
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

  function fnv1a_64(text) {
    let h = 0xcbf29ce484222325n;
    const bytes = new TextEncoder().encode(text);
    for (let i = 0; i < bytes.length; i++) {
      h ^= BigInt(bytes[i]);
      h = (h * 0x00000100000001B3n) & 0xffffffffffffffffn;
    }
    return h.toString(16).padStart(16, "0");
  }

  function stableRotationIndex(seed, length) {
    if (!length) return 0;
    const source = String(seed || "");
    const hashed = /^[0-9a-f]{1,16}$/i.test(source) ? source.padStart(16, "0") : fnv1a_64(source);
    return Number(BigInt(`0x${hashed.slice(0, 16)}`) % BigInt(length));
  }

  function rebalancePositiveUserLove(templateKey, selectedTemplate, allowedNames, rules, seed) {
    if ((templateKey !== "five_star" && templateKey !== "four_star") || selectedTemplate !== "User Love") {
      return selectedTemplate;
    }
    const rotation = (((rules || DEFAULT_RULES).templateRotation || {}).positive_user_love) || [];
    const pool = rotation.filter((name) => allowedNames.includes(name));
    if (pool.length <= 1) return selectedTemplate;
    return pool[stableRotationIndex(seed, pool.length)];
  }

  function getReviewCardIdentity(card) {
    const username = extractUserName(card);
    const rating = extractRating(card);
    const reviewDate = extractReviewDate(card);
    const reviewLanguage = extractReviewLanguage(card);
    const text = extractReviewText(card);
    const raw = [
      String(username || "").trim(),
      String(rating || "").trim(),
      String(reviewDate || "").trim(),
      String(reviewLanguage || "").trim(),
      normalizeText(text)
    ].join("|");
    return fnv1a_64(raw);
  }

  function isAlreadyRepliedCard(card) {
    const text = card.innerText || "";
    if (!text.includes("@volio.group") && !text.includes("@volio.vn") && !text.includes("Reply from")) {
      return false;
    }
    const signatures = Array.from(card.querySelectorAll("*")).filter(el => {
      if (el.children.length > 0) return false;
      const elText = el.innerText || el.textContent || "";
      return elText.includes("@volio.group") || elText.includes("@volio.vn") || elText.includes("Reply from");
    });
    for (const sig of signatures) {
      if (findClosestReviewCard(sig) === card) {
        return true;
      }
    }
    return false;
  }

  function getVisibleReviewSnapshot(options) {
    assertBrowser();
    const activeOptions = mergeOptions(options);
    const replyButtons = getClickableElements(root.document).filter((button) => {
      if (button.tagName !== "BUTTON" && button.tagName !== "A") return false;
      const text = normalizeText(getElementText(button));
      return text.includes("reply to review") || text.includes("send message");
    });
    const uniqueCards = [];
    const seen = new Set();
    for (const button of replyButtons) {
      const card = findClosestReviewCard(button);
      if (!card || seen.has(card)) continue;
      seen.add(card);
      uniqueCards.push(card);
    }
    const cardsByClass = Array.from(root.document.querySelectorAll("div[class*='rounded-[8px]']"));
    for (const card of cardsByClass) {
      if (seen.has(card)) continue;
      const text = card.innerText || "";
      if (/\d{2}\/\d{2}\/\d{4}/.test(text) && extractUserName(card)) {
        seen.add(card);
        uniqueCards.push(card);
      }
    }
    return uniqueCards.map((card, index) => {
      const alreadyReplied = isAlreadyRepliedCard(card);
      return {
        index: index + 1,
        username: extractUserName(card),
        rating: extractRating(card),
        reviewDate: extractReviewDate(card),
        text: extractReviewText(card),
        originalText: extractReviewText(card),
        translatedText: extractTranslatedReviewText(card),
        reviewLanguage: extractReviewLanguage(card),
        pageUrl: root.location.href,
        review_identity: getReviewCardIdentity(card),
        alreadyReplied: alreadyReplied,
        status: alreadyReplied ? "already_replied" : "replyable"
      };
    });
  }

  function getVisibleReplyableReviews(options) {
    assertBrowser();
    const activeOptions = mergeOptions(options);
    const replyButtons = getClickableElements(root.document).filter((button) => {
      if (button.tagName !== "BUTTON" && button.tagName !== "A") return false;
      const text = normalizeText(getElementText(button));
      return text.includes("reply to review");
    });
    const unique = [];
    const seen = new Set();
    for (const button of replyButtons) {
      const card = findClosestReviewCard(button);
      if (!card || seen.has(card)) continue;
      seen.add(card);
      if (isAlreadyRepliedCard(card)) {
        console.log(`[getVisibleReplyableReviews] Skipping already replied card for user: ${extractUserName(card)}`);
        continue;
      }
      unique.push(card);
      if (unique.length >= activeOptions.maxReviews) break;
    }
    return unique;
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

  function matchKeywordScore(text, keywords, excludes) {
    const normalized = normalizeText(text);
    for (const exclude of excludes || []) {
      const normalizedExclude = normalizeText(exclude);
      if (normalizedExclude && matchesKeyword(normalized, normalizedExclude)) {
        return { score: 0, hits: [] };
      }
    }
    let score = 0;
    const hits = [];
    const seenNormalized = new Set();
    for (const keyword of keywords || []) {
      const normalizedKeyword = normalizeText(keyword);
      if (!normalizedKeyword || seenNormalized.has(normalizedKeyword)) continue;
      seenNormalized.add(normalizedKeyword);
      if (matchesKeyword(normalized, normalizedKeyword)) {
        score += normalizedKeyword.includes(" ") ? 2 : 1;
        hits.push(keyword);
      }
    }
    return { score, hits };
  }

  function matchesKeyword(normalizedText, normalizedKeyword) {
    if (/[\u0e00-\u0e7f\u4e00-\u9fff]/.test(normalizedKeyword)) {
      return normalizedText.includes(normalizedKeyword);
    }
    const escaped = normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = escaped.replace(/ /g, "[^\\p{L}\\p{N}]+");
    return new RegExp(`(^|[^\\p{L}\\p{N}])${pattern}([^\\p{L}\\p{N}]|$)`, "u").test(normalizedText);
  }

  function auditCandidates(scored) {
    return (scored || []).map((item) => ({
      intent: item.intent,
      template: item.template,
      folder: item.folder || "",
      confidence: item.confidence,
      reason: item.reason || ""
    }));
  }

  function withAudit(decision, scored) {
    decision.candidates = auditCandidates(scored);
    decision.candidateCount = decision.candidates.length;
    return decision;
  }

  function classifyReview(review, rules, options) {
    const activeRules = rules || DEFAULT_RULES;
    const activeOptions = mergeOptions(options);
    const rating = Number(review && review.rating);
    const classificationTextSource = review && (review.originalText || review.review_original_text) ? "original" : "text";
    const text = displayText(review && (review.originalText || review.review_original_text || review.text));
    const normalized = normalizeText(text);
    const wordCount = getWordCount(text);
    const minConfidence = activeOptions.minConfidence;

    if (wordCount === 0 && rating < 4) {
      return withAudit(skipped("empty_review", rating, text), []);
    }

    let best = null;
    const scored = [];
    for (const intent of activeRules.intents) {
      const result = matchKeywordScore(text, intent.keywords, intent.exclude);
      if (result.score <= 0) continue;
      let confidence = Math.min(0.98, 0.54 + result.score * 0.13);
      if (intent.id === "rating_mismatch" && rating > 3) confidence -= 0.35;
      if (intent.id === "rating_mismatch" && wordCount <= 1 && (normalized.includes("ok") || normalized.includes("okay"))) confidence -= 0.35;
      if (intent.id === "positive_ads_feedback" && rating < 4) confidence -= 0.5;
      if (intent.id === "positive_ads_feedback" && rating >= 4) confidence += 0.04;
      if (intent.id === "general_1_star" && rating >= 4) confidence -= 0.3;
      if (intent.id !== "rating_mismatch" && intent.id !== "general_1_star" && rating <= 2) confidence += 0.04;
      const template = activeRules.templates[intent.templateKey];
      const candidate = {
        status: "selected",
        intent: intent.id,
        templateKey: intent.templateKey,
        template: template.template,
        folder: template.folder || "",
        aliases: template.aliases,
        confidence: roundConfidence(confidence),
        reason: result.hits.join(", "),
        classification_text_source: classificationTextSource,
        rating,
        text
      };
      scored.push(candidate);
      if (!best || candidate.confidence > best.confidence) best = candidate;
    }

    let decision = null;
    const hasIssueIntent = scored.some((item) => item.intent !== "rating_mismatch" && item.confidence >= minConfidence);
    const positiveCandidate = scored.find((item) => item.intent === "rating_mismatch");
    
    if (positiveCandidate && rating <= 3 && !hasIssueIntent && positiveCandidate.confidence >= minConfidence) {
      decision = positiveCandidate;
    } else {
      const issueCandidate = scored.find((item) => item.intent !== "rating_mismatch" && item.confidence >= minConfidence);
      if (issueCandidate) {
        decision = issueCandidate;
      } else if (best && best.intent !== "rating_mismatch" && best.confidence >= minConfidence) {
        decision = best;
      } else if (rating === 1 && wordCount >= 1) {
        const template = activeRules.templates.general_1_star;
        decision = {
          status: "selected",
          intent: "general_1_star",
          templateKey: "general_1_star",
          template: template.template,
          folder: template.folder || "",
          aliases: template.aliases,
          confidence: 0.66,
          reason: "fallback: 1-star review without a stronger intent",
          classification_text_source: classificationTextSource,
          rating,
          text
        };
      } else if (rating <= 2 && wordCount >= 4) {
        const template = activeRules.templates.need_details;
        decision = {
          status: "selected",
          intent: "need_details",
          templateKey: "need_details",
          template: template.template,
          folder: template.folder || "",
          aliases: template.aliases,
          confidence: 0.63,
          reason: "fallback: low-rating review needs details",
          classification_text_source: classificationTextSource,
          rating,
          text
        };
      } else if (rating === 5) {
        const template = activeRules.templates.five_star;
        decision = {
          status: "selected",
          intent: "five_star",
          templateKey: "five_star",
          template: template.template,
          folder: template.folder || "",
          aliases: template.aliases,
          confidence: 0.85,
          reason: "fallback: 5-star review",
          classification_text_source: classificationTextSource,
          rating,
          text
        };
      } else if (rating === 4) {
        const template = activeRules.templates.four_star;
        decision = {
          status: "selected",
          intent: "four_star",
          templateKey: "four_star",
          template: template.template,
          folder: template.folder || "",
          aliases: template.aliases,
          confidence: 0.85,
          reason: "fallback: 4-star review",
          classification_text_source: classificationTextSource,
          rating,
          text
        };
      } else {
        decision = skipped("uncertain_or_too_short", rating, text);
      }
    }

    // Apply folder-to-rating guardrails to ensure selected templates are visible in the Volio UI
    if (decision && decision.status === "selected") {
      const origIntent = decision.intent;
      if (rating === 5) {
        const allowed = ["5 sao", "User khen app", "User góp ý", "Remove Ads", "Technical Issue Response", "Review không liên quan"];
        if (!allowed.includes(decision.folder)) {
          const fallback = activeRules.templates.five_star;
          decision.intent = "five_star";
          decision.templateKey = "five_star";
          decision.template = fallback.template;
          decision.folder = fallback.folder || "5 sao";
          decision.aliases = fallback.aliases;
          decision.reason = (decision.reason || "") + ` (fallback from ${origIntent} for 5-star review)`;
        }
      } else if (rating === 4) {
        const allowed = ["5 sao", "User khen app", "User góp ý", "Remove Ads", "Technical Issue Response", "Review không liên quan"];
        if (!allowed.includes(decision.folder)) {
          const fallback = activeRules.templates.four_star;
          decision.intent = "four_star";
          decision.templateKey = "four_star";
          decision.template = fallback.template;
          decision.folder = fallback.folder || "User khen app";
          decision.aliases = fallback.aliases;
          decision.reason = (decision.reason || "") + ` (fallback from ${origIntent} for 4-star review)`;
        }
      }
    }

    decision.classification_text_source = decision.classification_text_source || classificationTextSource;
    return withAudit(decision, scored);
  }

  function getTemplateAliasIndex(rules) {
    const aliases = {};
    const aliasFolders = {};
    for (const [folder, names] of Object.entries((rules || DEFAULT_RULES).templateFolders || {})) {
      for (const name of names || []) {
        if (name) aliasFolders[normalizeText(name)] = folder;
      }
    }
    for (const [key, template] of Object.entries((rules || DEFAULT_RULES).templates || {})) {
      const names = [template.template, ...(template.aliases || [])];
      for (const name of names) {
        if (name) {
          const normalized = normalizeText(name);
          aliases[normalized] = {
            key,
            template: name,
            folder: aliasFolders[normalized] || template.folder || ""
          };
        }
      }
    }
    return aliases;
  }

  function validateDecision(decision, rules) {
    const activeRules = rules || DEFAULT_RULES;
    const activeDecision = Object.assign({}, decision || {});
    const warnings = Array.from(activeDecision.validation_warnings || activeDecision.validationWarnings || []);
    const errors = Array.from(activeDecision.validation_errors || activeDecision.validationErrors || []);

    if (!activeDecision.intent || activeDecision.intent === "skipped_uncertain" || activeDecision.status === "skipped") {
      return Object.assign(activeDecision, {
        status: "skipped_uncertain",
        intent: "skipped_uncertain",
        template: "",
        folder: "",
        validation_status: "skipped"
      });
    }

    const aliasIndex = getTemplateAliasIndex(activeRules);
    const aliasMatch = aliasIndex[normalizeText(activeDecision.template || "")];
    const templateKey = activeRules.templates[activeDecision.intent]
      ? activeDecision.intent
      : aliasMatch && aliasMatch.key;
    if (!templateKey || !activeRules.templates[templateKey]) {
      errors.push(`unknown_template_or_intent:${activeDecision.intent || activeDecision.template || ""}`);
      return Object.assign(activeDecision, {
        status: "skipped_uncertain",
        intent: "skipped_uncertain",
        template: "",
        folder: "",
        validation_status: "blocked",
        validation_errors: errors,
        validation_warnings: warnings
      });
    }

    const template = activeRules.templates[templateKey];
    const allowedNames = [template.template, ...(template.aliases || [])].filter(Boolean);
    let selectedTemplate = allowedNames.includes(activeDecision.template) ? activeDecision.template : template.template;
    const rotationSeed = activeDecision.review_identity || activeDecision.reviewIdentity || activeDecision.text || activeDecision.originalText || activeDecision.template || templateKey;
    const rebalancedTemplate = rebalancePositiveUserLove(templateKey, selectedTemplate, allowedNames, activeRules, rotationSeed);
    if (rebalancedTemplate !== selectedTemplate) {
      warnings.push(`rebalance_template:${selectedTemplate}->${rebalancedTemplate}`);
      selectedTemplate = rebalancedTemplate;
    }
    let selectedAlias = aliasIndex[normalizeText(selectedTemplate)] || { template: selectedTemplate, folder: template.folder || "" };
    let selectedFolder = activeDecision.folder || selectedAlias.folder || template.folder || "";
    const folderTemplates = ((activeRules.templateFolders || {})[selectedFolder]) || [];

    if (!folderTemplates.includes(selectedTemplate)) {
      const correctedFolder = selectedAlias.folder || template.folder || "";
      if (correctedFolder !== selectedFolder) warnings.push(`normalized_folder:${selectedFolder}->${correctedFolder}`);
      selectedFolder = correctedFolder;
    }
    if (activeDecision.template && !allowedNames.includes(activeDecision.template)) {
      warnings.push(`unknown_family_template:${activeDecision.template}->${template.template}`);
    }
    if (selectedTemplate !== template.template) {
      warnings.push(`parallel_template:${template.template}|${selectedTemplate}`);
    }
    return Object.assign(activeDecision, {
      status: "selected",
      intent: templateKey,
      templateKey,
      template: selectedTemplate,
      folder: selectedFolder,
      aliases: [selectedTemplate, ...allowedNames.filter((name) => name !== selectedTemplate)],
      validation_status: errors.length ? "blocked" : "valid",
      validation_errors: errors,
      validation_warnings: warnings,
      rulesVersion: activeRules.version
    });
  }


  function skipped(reason, rating, text) {
    return {
      status: "skipped_uncertain",
      intent: "",
      templateKey: "",
      template: "",
      folder: "",
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
        (element.classList && element.classList.contains("disabled"))
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
    for (let depth = 0; current && depth < 12; depth += 1) {
      const text = normalizeText(getElementText(current));
      const rect = current.getBoundingClientRect ? current.getBoundingClientRect() : { height: 0, width: 0 };
      const hasReviewActions =
        text.includes("google translate") ||
        text.includes("retranslate") ||
        text.includes("reply to review") ||
        text.includes("send message");
      if (hasReviewActions && rect.height >= 90 && rect.width >= 500) {
        return current.closest("div[class*='rounded-[8px]']") || current;
      }
      current = current.parentElement;
    }
    return element.closest("div[class*='rounded-[8px]']") || element.closest("[class*='review'], [class*='card'], [class*='item']") || element.parentElement;
  }

  function getReviewCardsFromPage(options) {
    return getVisibleReplyableReviews(options);
  }

  function extractRating(card) {
    const stars = Array.from(card.querySelectorAll(".lucide-star"));
    if (stars.length > 0) {
      return stars.filter(s => s.classList.contains("fill-current")).length;
    }
    const labelled = Array.from(card.querySelectorAll("[aria-label], [title]"));
    for (const element of labelled) {
      const label = `${element.getAttribute("aria-label") || ""} ${element.getAttribute("title") || ""}`;
      const match = label.match(/([1-5])\s*(star|sao)/i);
      if (match) return Number(match[1]);
    }

    const fullStars = Array.from(card.querySelectorAll("[class*='star-full'], [class*='rate-star-full'], .ant-rate-star-full"));
    if (fullStars.length >= 1 && fullStars.length <= 5) return fullStars.length;

    const text = card.innerText || card.textContent || "";
    const dateMatch = text.match(/\b([1-5])\s*(?:star|sao)\b/i);
    if (dateMatch) return Number(dateMatch[1]);
    return "";
  }

  function extractUserName(card) {
    const userEl = card.querySelector(".font-semibold") || card.querySelector(".font-bold");
    if (userEl) return displayText(userEl.innerText);

    const text = card.innerText || card.textContent || "";
    const parts = text.split(/\s{2,}|\n/).map(displayText).filter(Boolean);
    const banned = /google translate|retranslate|reply to review|like \(|dislike \(|device language|review language/i;
    for (const part of parts) {
      if (banned.test(part)) continue;
      if (part.length > 1 && part.length < 80) return part.replace(/[?ⓘ]+$/g, "").trim();
    }
    return "";
  }

  function extractReviewText(card) {
    const textDiv = card.querySelector(".my-2.mb-4");
    if (textDiv) {
      const clone = textDiv.cloneNode(true);
      const translationDiv = clone.querySelector("div");
      if (translationDiv) {
        translationDiv.remove();
      }
      return displayText(clone.textContent);
    }

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
    const lines = (clone.textContent || "")
      .split(/\n+/)
      .map(displayText)
      .filter(Boolean)
      .filter((line) => !/device language|review language|like \(|dislike \(|google translate|retranslate/i.test(line))
      .filter((line) => !/^\d{2}\/\d{2}\/\d{4}/.test(line))
      .filter((line) => !/^[★☆\s]+$/.test(line));

    const originalLines = lines.filter((line) => !/^\(.+\)$/.test(line));
    return originalLines.slice(1, 4).join(" ").slice(0, 1000);
  }

  function extractTranslatedReviewText(card) {
    const textDiv = card.querySelector(".my-2.mb-4");
    if (textDiv) {
      const translationDiv = textDiv.querySelector("div");
      if (translationDiv) {
        return displayText(translationDiv.textContent).replace(/^\((.*)\)$/s, "$1");
      }
    }

    const text = card.innerText || card.textContent || "";
    const lines = text
      .split(/\n+/)
      .map(displayText)
      .filter(Boolean);
    const translated = lines.find((line) => /^\(.+\)$/.test(line));
    return translated ? translated.replace(/^\((.*)\)$/s, "$1") : "";
  }

  function extractReviewLanguage(card) {
    const text = card.innerText || card.textContent || "";
    const match = text.match(/Review language:\s*([^\s]+)/i);
    return match ? match[1] : "";
  }

  function extractReviewDate(card) {
    const text = card.innerText || card.textContent || "";
    const match = text.match(/(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})|(\d{2}\/\d{2}\/\d{4})/);
    return match ? match[0] : "";
  }

  function collectReviewData(options) {
    assertBrowser();
    const activeRules = getRules(options);
    const cards = getReviewCardsFromPage(options);
    let adMatchCount = 0;
    return cards.map((card, index) => {
      const review = {
        index: index + 1,
        card,
        username: extractUserName(card),
        rating: extractRating(card),
        reviewDate: extractReviewDate(card),
        text: extractReviewText(card),
        originalText: extractReviewText(card),
        translatedText: extractTranslatedReviewText(card),
        reviewLanguage: extractReviewLanguage(card),
        pageUrl: root.location.href
      };
      const decision = classifyReview(review, activeRules, options);
      
      // Rotate ads templates sequentially
      if (decision.intent === "remove_ads" && decision.aliases && decision.aliases.length) {
        const idx = adMatchCount % decision.aliases.length;
        decision.template = decision.aliases[idx];
        decision.aliases = [decision.template, ...decision.aliases.filter(a => a !== decision.template)];
        adMatchCount++;
      }
      
      return Object.assign(review, { decision });
    });
  }

  function getReplyTextContent(card) {
    const textareas = Array.from(card.querySelectorAll("textarea"));
    for (const ta of textareas) {
      const v = displayText(ta.value);
      if (v.length > 5) return v;
    }
    const editables = Array.from(card.querySelectorAll("[contenteditable='true']"));
    for (const ed of editables) {
      const v = getElementText(ed);
      if (v.length > 5) return v;
    }
    return "";
  }

  function toLogRow(item, status, error) {
    const decision = item.decision || {};
    return {
      batch_id: state.batchId,
      app: item.app || "",
      page_number: item.page_number || "",
      loop_index: item.loop_index || 1,
      attempt: item.attempt || 1,
      status: status || "",
      error: error || "",
      skip_reason: (status === "skipped_uncertain" || status === "skipped" || status === "blocked") ? (decision.reason || error || "uncertain") : "",
      review_identity: item.review_identity || "",
      review_index: item.index || "",
      username: item.username || "",
      rating: item.rating || "",
      review_date: item.reviewDate || "",
      review_language: item.reviewLanguage || "",
      review_original_text: item.originalText || item.text || "",
      review_translated_text: item.translatedText || "",
      classification_text_source: decision.classification_text_source || "original",
      detected_intent: decision.intent || "",
      template: decision.template || "",
      folder: decision.folder || "",
      template_aliases: decision.aliases ? decision.aliases.join("|") : (decision.template || ""),
      aliases_tried: item.aliases_tried ? item.aliases_tried.join("|") : "",
      selected_template_button_text: item.selected_template_button_text || "",
      selected_reply_text: item.selected_reply_text || "",
      matched_card_identity: item.review_identity || "",
      matched_card_text: item.text || "",
      match_score: item.match_score || "",
      validation_status: decision.validation_status || "",
      validation_warnings: decision.validation_warnings ? decision.validation_warnings.join("|") : "",
      validation_errors: decision.validation_errors ? decision.validation_errors.join("|") : "",
      guardrail_flags: decision.guardrail_flags ? decision.guardrail_flags.join("|") : ""
    };
  }

  function addLog(row) {
    state.rows.push(row);
    console.log("[VolioReviewAgent]", row.status, row.review_index, row.template || row.reason, row.error || "");
  }

  function delay(ms) {
    try {
      const workerCode = `
        self.onmessage = function(e) {
          setTimeout(function() {
            self.postMessage(true);
          }, e.data);
        };
      `;
      const blob = new Blob([workerCode], { type: "application/javascript" });
      const worker = new Worker(URL.createObjectURL(blob));
      return new Promise((resolve) => {
        worker.onmessage = function() {
          worker.terminate();
          resolve();
        };
        worker.onerror = function() {
          worker.terminate();
          root.setTimeout(resolve, ms);
        };
        worker.postMessage(ms);
      });
    } catch (e) {
      return new Promise((resolve) => root.setTimeout(resolve, ms));
    }
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
    console.log("[openReplyEditor] Start. Card className:", card.className);
    const existing = findClickableByText(card, ["Send Message"], { enabledOnly: false });
    console.log("[openReplyEditor] Existing editor found:", !!existing);
    if (existing) return true;
    const replyButton = findClickableByText(card, ["Reply to Review"], { enabledOnly: true });
    console.log("[openReplyEditor] Reply button found:", !!replyButton);
    if (!replyButton) return false;
    replyButton.scrollIntoView({ block: "center", inline: "nearest" });
    await delay(100);
    replyButton.click();
    console.log("[openReplyEditor] Clicked reply button");
    const timeoutMs = options.openReplyTimeoutMs;
    console.log("[openReplyEditor] Waiting for editor with timeout:", timeoutMs);
    const result = Boolean(await waitFor(() => {
      const found = findClickableByText(card, ["Send Message"], { enabledOnly: false });
      console.log("[openReplyEditor] waitFor check. Send button found:", !!found);
      return found;
    }, timeoutMs, 250));
    console.log("[openReplyEditor] waitFor result:", result);
    return result;
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
      const className = normalizeText(button.className || "");
      
      // Exclude settings/management buttons to prevent navigation
      if (aria.includes("setting") || aria.includes("manage") || className.includes("setting") || className.includes("manage")) {
        return false;
      }
      
      if (text === "..." || text === "more" || aria.includes("more") || aria.includes("ellipsis")) return true;
      
      // Fallback for icon-only button (typically size-9 h-8 w-8 with an SVG and empty text)
      if (text === "" && button.querySelector("svg") && (button.className.includes("w-8") || button.className.includes("size-"))) {
        const svgHtml = button.querySelector("svg").innerHTML.toLowerCase();
        if (svgHtml.includes("gear") || svgHtml.includes("setting") || svgHtml.includes("cog") || svgHtml.includes("manage")) {
          return false;
        }
        return true;
      }
      return false;
    });
    return candidates[candidates.length - 1] || null;
  }

  function getOpenDialog() {
    return root.document.querySelector("div[role='dialog']");
  }

  function findDialogElementByText(dialog, texts, exact, excludeFolders) {
    if (!dialog) return null;
    const elements = Array.from(dialog.querySelectorAll("button, [role='button'], a, [type='button'], [data-slot='collapsible-trigger'], .cursor-pointer, span"));
    const normalizedLabels = texts.map(normalizeText).filter(Boolean);
    
    for (const label of normalizedLabels) {
      const candidates = [];
      for (const element of elements) {
        if (excludeFolders && element.closest("[data-slot='collapsible-trigger']")) {
          continue;
        }
        const text = normalizeText(element.innerText || element.textContent || "");
        if (exact ? (text === label) : text.includes(label)) {
          candidates.push(element);
        }
      }
      if (candidates.length > 0) {
        return sortAndPickBest(candidates);
      }
    }
    
    if (exact) {
      for (const label of normalizedLabels) {
        const candidates = [];
        for (const element of elements) {
          if (excludeFolders && element.closest("[data-slot='collapsible-trigger']")) {
            continue;
          }
          const text = normalizeText(element.innerText || element.textContent || "");
          if (text.includes(label)) {
            candidates.push(element);
          }
        }
        if (candidates.length > 0) {
          return sortAndPickBest(candidates);
        }
      }
    }
    
    return null;

    function sortAndPickBest(candidates) {
      const mapped = candidates.map(el => el.closest("button, [role='button'], [type='button'], [data-slot='collapsible-trigger'], .cursor-pointer, a, .ant-btn") || el);
      mapped.sort((a, b) => {
        const aScore = (a.tagName === "BUTTON" || a.tagName === "A" || a.getAttribute("role") === "button" || a.classList.contains("cursor-pointer")) ? 0 : 1;
        const bScore = (b.tagName === "BUTTON" || b.tagName === "A" || b.getAttribute("role") === "button" || b.classList.contains("cursor-pointer")) ? 0 : 1;
        if (aScore !== bScore) return aScore - bScore;
        return a.querySelectorAll("*").length - b.querySelectorAll("*").length;
      });
      return mapped[0];
    }
  }

  async function openTemplateFolder(dialog, decision, options) {
    if (!decision.folder) return false;
    const folderButton = await waitFor(() => findDialogElementByText(dialog, [decision.folder], true), options.templateTimeoutMs, 250);
    if (!folderButton) return false;
    
    // Check if folder is already open
    const isOpen = folderButton.getAttribute("aria-expanded") === "true" || folderButton.getAttribute("data-state") === "open";
    if (isOpen) {
      console.log(`[openTemplateFolder] Folder "${decision.folder}" is already open.`);
      return true;
    }
    
    folderButton.scrollIntoView({ block: "center", inline: "nearest" });
    await delay(300);
    folderButton.click();
    await delay(400);
    return true;
  }

  async function selectTemplate(card, decision, options) {
    const intentKey = decision.intent || "";
    let labels = decision.aliases && decision.aliases.length ? [...decision.aliases] : [decision.template];
    
    if (labels.length > 1 && intentKey) {
      if (rotateCounters[intentKey] === undefined) {
        rotateCounters[intentKey] = 0;
      }
      const rotationOffset = rotateCounters[intentKey] % labels.length;
      labels = [
        ...labels.slice(rotationOffset),
        ...labels.slice(0, rotationOffset)
      ];
      rotateCounters[intentKey]++;
      if (typeof localStorage !== "undefined") {
        try {
          localStorage.setItem("volio_rotate_counters", JSON.stringify(rotateCounters));
        } catch (e) {}
      }
      console.log(`[selectTemplate] Rotating aliases for ${intentKey}. Offset: ${rotationOffset}. Trying order:`, labels);
    }
    
    const aliasesTried = [];
    for (let i = 0; i < labels.length; i++) {
      const currentLabel = labels[i];
      aliasesTried.push(currentLabel);
      let templateButton = findTemplateButton(card, [currentLabel]);
      if (!templateButton) {
        const moreButton = findMoreTemplatesButton(card);
        if (moreButton) {
          moreButton.scrollIntoView({ block: "center", inline: "nearest" });
          await delay(350);
          moreButton.click();
          
          const dialog = await waitFor(getOpenDialog, options.templateTimeoutMs, 250);
          if (!dialog) {
            console.log("[selectTemplate] Saved replies dialog not opened for label:", currentLabel);
            continue;
          }
          
          const activeRules = state.rules || DEFAULT_RULES;
          const aliasIndex = getTemplateAliasIndex(activeRules);
          const aliasInfo = aliasIndex[normalizeText(currentLabel)];
          const targetFolder = aliasInfo ? aliasInfo.folder : decision.folder;
          
          console.log(`[selectTemplate] Opening folder "${targetFolder}" for template "${currentLabel}"`);
          const folderOpened = await openTemplateFolder(getOpenDialog(), { folder: targetFolder }, options);
          if (!folderOpened) {
            console.log(`[selectTemplate] Folder not opened: ${targetFolder} for label:`, currentLabel);
            continue;
          }
          
          templateButton = await waitFor(() => findDialogElementByText(getOpenDialog(), [currentLabel], true, true), options.templateTimeoutMs, 250);
        } else {
          templateButton = findTemplateButton(card, [currentLabel]);
        }
      }
      
      if (!templateButton) {
        console.log("[selectTemplate] Template not found in UI for label:", currentLabel);
        continue;
      }

      console.log("[selectTemplate] Clicked template button tag:", templateButton.tagName, "text:", getElementText(templateButton).slice(0, 50));
      templateButton.scrollIntoView({ block: "center", inline: "nearest" });
      await delay(400);
      templateButton.click();
      
      const confirmed = await waitFor(() => hasReplyContent(card), options.templateTimeoutMs, 250);
      if (confirmed) {
        console.log(`[selectTemplate] Successfully applied template: ${currentLabel}`);
        return {
          ok: true,
          selected_template_button_text: currentLabel,
          selected_reply_text: getReplyTextContent(card),
          aliases_tried: aliasesTried
        };
      }
      
      console.log(`[selectTemplate] Template confirmation failed or empty for label: ${currentLabel}. Trying next alias...`);
      const openDialog = getOpenDialog();
      if (openDialog) {
        const closeBtn = openDialog.querySelector("button[class*='close']");
        if (closeBtn) {
          closeBtn.click();
          await delay(200);
        }
      }
    }
    return {
      ok: false,
      error: "reply_content_not_confirmed_after_all_aliases",
      aliases_tried: aliasesTried
    };
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
    console.log("[dryRun] Waiting for review cards to load on page...");
    const cardsLoaded = await waitFor(() => {
      const cards = root.document.querySelectorAll("div[class*='rounded-[8px]']");
      return cards.length > 0 ? cards : null;
    }, 15000, 500);
    
    if (!cardsLoaded) {
      console.log("[dryRun] Timeout waiting for review cards to load.");
      return { items: [], summary: summarize() };
    }
    
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
          review_original_text: beforeText,
          review_translated_text: "",
          classification_text_source: "original",
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
        review_original_text: beforeText,
        review_translated_text: "",
        classification_text_source: "original",
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

  async function sendOneSelected(options) {
    assertBrowser();
    const activeOptions = mergeOptions(options);
    const card = findSendableCards()[0];
    if (!card) return null;

    const sendButton = findClickableByText(card, ["Send Message"], { enabledOnly: true });
    if (!sendButton) return null;

    const row = state.rows.find(r => r.status === "selected");
    const beforeText = getElementText(card).slice(0, 200);

    sendButton.scrollIntoView({ block: "center", inline: "nearest" });
    await delay(100);
    sendButton.click();
    await delay(activeOptions.sendDelayMs);

    const stillSendable = root.document.body.contains(card) && findClickableByText(card, ["Send Message"], { enabledOnly: true });
    if (stillSendable && getElementText(card).slice(0, 200) === beforeText) {
      if (row) {
        row.status = "failed";
        row.reason = "send did not complete";
        row.error = "send_button_still_enabled_after_delay";
      }
      return row || { status: "failed", error: "send_button_still_enabled_after_delay" };
    }

    if (row) {
      row.status = "sent";
      row.reason = `waited ${activeOptions.sendDelayMs}ms`;
      row.error = "";
    }
    return row || { status: "sent" };
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
      "review_original_text",
      "review_translated_text",
      "classification_text_source",
      "detected_intent",
      "template",
      "folder",
      "confidence",
      "status",
      "reason",
      "error"
    ];
    const escape = (value) => `"${String(value == null ? "" : value).replace(/"/g, '""')}"`;
    return [columns.join(","), ...rows.map((row) => columns.map((column) => escape(row[column])).join(","))].join("\r\n");
  }

  async function replyOneByOne(options) {
    assertBrowser();
    const activeOptions = mergeOptions(options);
    
    console.log("[replyOneByOne] Waiting for review cards to load on page...");
    const cardsLoaded = await waitFor(() => {
      const cards = root.document.querySelectorAll("div[class*='rounded-[8px]']");
      return cards.length > 0 ? cards : null;
    }, 15000, 500);
    
    if (!cardsLoaded) {
      console.log("[replyOneByOne] Timeout waiting for review cards to load.");
      return summarize();
    }
    
    const activeRules = getRules(activeOptions);
    const items = collectReviewData(activeOptions);
    let processed = 0;
    let selectedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;
    let sentCount = 0;
    
    state.rows = [];
    
    for (const item of items) {
      if (item.decision.status !== "selected") {
        addLog(toLogRow(item, "skipped_uncertain", ""));
        skippedCount++;
        continue;
      }
      
      try {
        console.log(`[replyOneByOne] Processing review ${item.index} for user: ${item.username}`);
        const freshCards = getReviewCardsFromPage(activeOptions);
        const freshCard = freshCards.find(c => extractUserName(c) === item.username);
        if (!freshCard) {
          console.log(`[replyOneByOne] Card element lost for user: ${item.username}`);
          addLog(toLogRow(item, "failed", "card_element_lost_after_re_render"));
          failedCount++;
          continue;
        }
        
        freshCard.scrollIntoView({ block: "center", inline: "nearest" });
        await delay(200);
        
        console.log(`[replyOneByOne] Opening editor for user: ${item.username}`);
        const opened = await openReplyEditor(freshCard, activeOptions);
        if (!opened) {
          console.log(`[replyOneByOne] Reply editor not opened for user: ${item.username}`);
          addLog(toLogRow(item, "failed", "reply_editor_not_opened"));
          failedCount++;
          continue;
        }
        
        console.log(`[replyOneByOne] Selecting template for user: ${item.username}`);
        const selected = await selectTemplate(freshCard, item.decision, activeOptions);
        if (!selected.ok) {
          console.log(`[replyOneByOne] Template selection failed: ${selected.error}`);
          addLog(toLogRow(item, "failed", selected.error));
          failedCount++;
          continue;
        }
        
        selectedCount++;
        
        console.log(`[replyOneByOne] Sending message for user: ${item.username}`);
        const sendButton = findClickableByText(freshCard, ["Send Message"], { enabledOnly: true });
        if (!sendButton) {
          console.log(`[replyOneByOne] Send button not found for user: ${item.username}`);
          addLog(toLogRow(item, "failed", "send_button_not_found_or_disabled"));
          failedCount++;
          continue;
        }
        
        const beforeText = getElementText(freshCard).slice(0, 200);
        sendButton.scrollIntoView({ block: "center", inline: "nearest" });
        await delay(100);
        sendButton.click();
        
        console.log(`[replyOneByOne] Clicked send. Waiting ${activeOptions.sendDelayMs}ms...`);
        await delay(activeOptions.sendDelayMs);
        
        const stillSendable = root.document.body.contains(freshCard) && findClickableByText(freshCard, ["Send Message"], { enabledOnly: true });
        if (stillSendable && getElementText(freshCard).slice(0, 200) === beforeText) {
          console.log(`[replyOneByOne] Send button still enabled after delay for user: ${item.username}`);
          addLog(toLogRow(item, "failed", "send_button_still_enabled_after_delay"));
          failedCount++;
        } else {
          console.log(`[replyOneByOne] Successfully sent reply for user: ${item.username}`);
          addLog(toLogRow(item, "sent", ""));
          sentCount++;
        }
        
      } catch (error) {
        console.log(`[replyOneByOne] Error processing user: ${item.username}. Error: ${error.message}`);
        addLog(toLogRow(item, "failed", error && error.message ? error.message : String(error)));
        failedCount++;
      }
    }
    
    state.lastSummary = summarize();
    return state.lastSummary;
  }

  async function scrapeReviews() {
    assertBrowser();
    let cards = getReviewCardsFromPage(DEFAULT_OPTIONS);
    let waitCount = 0;
    while (cards.length === 0 && waitCount < 30) {
      console.log("[scrapeReviews] Waiting for cards to render...");
      await delay(500);
      cards = getReviewCardsFromPage(DEFAULT_OPTIONS);
      waitCount++;
    }
    return cards.map((card, index) => {
      return {
        index: index + 1,
        username: extractUserName(card),
        rating: extractRating(card),
        reviewDate: extractReviewDate(card),
        text: extractReviewText(card),
        originalText: extractReviewText(card),
        translatedText: extractTranslatedReviewText(card),
        reviewLanguage: extractReviewLanguage(card),
        pageUrl: root.location.href
      };
    });
  }

  async function replySingleCard(card, item, options, loopIndex, attempt) {
    const decision = item.decision || {};
    const username = item.username;
    const cardIdent = getReviewCardIdentity(card);
    
    async function cancelEditor(card) {
      if (!card) return;
      try {
        const cancelButton = findClickableByText(card, ["Cancel"], { enabledOnly: true });
        if (cancelButton) {
          console.log("[replySingleCard] Clicking Cancel to close failed editor");
          cancelButton.click();
          await delay(300);
        }
      } catch (e) {
        console.log("[replySingleCard] Error calling cancelEditor:", e.message);
      }
    }
    
    try {
      card.scrollIntoView({ block: "center", inline: "nearest" });
      await delay(200);
      
      console.log(`[replySingleCard] Opening editor for user: ${username}`);
      const opened = await openReplyEditor(card, options);
      if (!opened) {
        console.log(`[replySingleCard] Reply editor not opened for user: ${username}`);
        addLog(Object.assign(toLogRow(item, "failed", "reply_editor_not_opened"), {
          loop_index: loopIndex,
          attempt: attempt,
          review_identity: cardIdent
        }));
        return { ok: false, error: "reply_editor_not_opened" };
      }
      
      console.log(`[replySingleCard] Selecting template for user: ${username}`);
      const selected = await selectTemplate(card, decision, options);
      if (!selected.ok) {
        console.log(`[replySingleCard] Template selection failed: ${selected.error}`);
        addLog(Object.assign(toLogRow(item, "failed", selected.error), {
          loop_index: loopIndex,
          attempt: attempt,
          review_identity: cardIdent
        }));
        await cancelEditor(card);
        return { ok: false, error: selected.error };
      }
      
      console.log(`[replySingleCard] Sending message for user: ${username}`);
      const sendButton = findClickableByText(card, ["Send Message"], { enabledOnly: true });
      if (!sendButton) {
        console.log(`[replySingleCard] Send button not found for user: ${username}`);
        addLog(Object.assign(toLogRow(item, "failed", "send_button_not_found_or_disabled"), {
          loop_index: loopIndex,
          attempt: attempt,
          review_identity: cardIdent
        }));
        await cancelEditor(card);
        return { ok: false, error: "send_button_not_found_or_disabled" };
      }
      
      const beforeText = getElementText(card).slice(0, 200);
      sendButton.scrollIntoView({ block: "center", inline: "nearest" });
      await delay(100);
      sendButton.click();
      
      console.log(`[replySingleCard] Clicked send. Waiting 15s...`);
      await delay(options.sendDelayMs);
      
      const stillSendable = root.document.body.contains(card) && findClickableByText(card, ["Send Message"], { enabledOnly: true });
      if (stillSendable && getElementText(card).slice(0, 200) === beforeText) {
        console.log(`[replySingleCard] Send button still enabled after delay for user: ${username}`);
        addLog(Object.assign(toLogRow(item, "failed", "send_button_still_enabled_after_delay"), {
          loop_index: loopIndex,
          attempt: attempt,
          review_identity: cardIdent
        }));
        await cancelEditor(card);
        return { ok: false, error: "send_button_still_enabled_after_delay" };
      } else {
        console.log(`[replySingleCard] Successfully sent reply for user: ${username}`);
        addLog(Object.assign(toLogRow(item, "sent", ""), {
          loop_index: loopIndex,
          attempt: attempt,
          review_identity: cardIdent
        }));
        return { ok: true };
      }
      
    } catch (error) {
      console.log(`[replySingleCard] Error processing user: ${username}. Error: ${error.message}`);
      addLog(Object.assign(toLogRow(item, "failed", error && error.message ? error.message : String(error)), {
        loop_index: loopIndex,
        attempt: attempt,
        review_identity: cardIdent
      }));
      if (card) {
        await cancelEditor(card);
      }
      return { ok: false, error: error && error.message ? error.message : String(error) };
    }
  }

  function reconcileCurrentPage(executionRows, classifiedReviews, options) {
    const agentRef = (root && root.VolioReviewAgent) || null;
    const visibleSnapshot = (agentRef && agentRef.getVisibleReviewSnapshot)
      ? agentRef.getVisibleReviewSnapshot(options)
      : getVisibleReviewSnapshot(options);
    const pageReport = {
      page_url: (root && root.location ? root.location.href : ""),
      timestamp: new Date().toISOString(),
      visible_no_reply_count: 0,
      leftover_count: 0,
      retryable_leftover_count: 0,
      silent_skip_count: 0,
      already_replied_detected_count: 0,
      leftovers: [],
      already_replied: []
    };
    
    const retryableErrors = [
      "reply_content_not_confirmed_after_all_aliases",
      "reply_editor_not_opened",
      "send_button_not_found_or_disabled",
      "send_button_still_enabled_after_delay",
      "transient_dialog_not_opened",
      "template_dialog_timeout"
    ];
    
    for (const card of visibleSnapshot) {
      const cardIdent = card.review_identity;
      if (card.alreadyReplied) {
        pageReport.already_replied_detected_count++;
        pageReport.already_replied.push({
          username: card.username,
          rating: card.rating,
          review_identity: cardIdent,
          review_original_text: card.originalText
        });
        continue;
      }
      
      pageReport.visible_no_reply_count++;
      
      const sentRow = executionRows.find(r => r.review_identity === cardIdent && r.status === "sent");
      if (sentRow) continue;
      
      const cardRows = executionRows.filter(r => r.review_identity === cardIdent);
      const lastRow = cardRows.length > 0 ? cardRows[cardRows.length - 1] : null;
      
      const classifiedItem = classifiedReviews.find(item => {
        const itemIdent = item.review_identity || (item.decision && item.decision.review_identity);
        return itemIdent === cardIdent;
      });
      
      let reason = "unknown";
      let retryable = false;
      let suggestedAction = "investigate";
      
      if (!classifiedItem) {
        reason = "not_in_classified";
        retryable = true;
        suggestedAction = "classify_and_retry";
      } else if (lastRow) {
        if (lastRow.status === "failed") {
          reason = `failed_with:${lastRow.error}`;
          if (retryableErrors.includes(lastRow.error)) {
            retryable = true;
            suggestedAction = "retry_execution";
          } else {
            suggestedAction = "manual_intervention";
          }
        } else if (lastRow.status === "skipped_uncertain") {
          reason = "skipped_uncertain";
          suggestedAction = "manual_review";
        } else if (lastRow.status === "blocked") {
          reason = "validation_blocked";
          suggestedAction = "fix_classification_or_rules";
        }
      } else {
        reason = "silent_skip";
        retryable = true;
        suggestedAction = "force_retry";
        pageReport.silent_skip_count++;
      }
      
      pageReport.leftover_count++;
      if (retryable) {
        pageReport.retryable_leftover_count++;
      }
      pageReport.leftovers.push({
        page_number: options.pageNumber || 1,
        review_identity: cardIdent,
        username: card.username,
        rating: card.rating,
        review_original_text: card.originalText,
        reason: reason,
        retryable: retryable,
        suggested_action: suggestedAction
      });
    }
    return pageReport;
  }

  function summarizePageRows(rows) {
    const summary = {
      totalRows: rows.length,
      sent: 0,
      failed: 0,
      skipped: 0
    };
    for (const r of rows) {
      if (r.status === "sent") summary.sent++;
      else if (r.status === "failed") summary.failed++;
      else if (r.status === "skipped_uncertain" || r.status === "skipped" || r.status === "blocked") summary.skipped++;
    }
    return summary;
  }

  async function replyFromClassifiedLoop(classifiedReviews, options) {
    assertBrowser();
    const activeOptions = mergeOptions(options);
    const maxLoops = activeOptions.maxLoops || 2;
    const maxAttempts = activeOptions.maxAttemptsPerReview || 2;
    
    state.rows = [];
    
    let loopIndex = 1;
    let hasRetryable = true;
    const attemptCounters = {};
    
    for (const item of classifiedReviews) {
      if (!item.review_identity) {
        item.review_identity = item.decision && item.decision.review_identity;
      }
    }
    
    while (loopIndex <= maxLoops && hasRetryable) {
      console.log(`[replyFromClassifiedLoop] Starting Loop ${loopIndex}/${maxLoops}`);
      
      let cards = getReviewCardsFromPage(activeOptions);
      let waitCount = 0;
      while (cards.length === 0 && waitCount < 10) {
        console.log("[replyFromClassifiedLoop] Waiting for cards to render...");
        await delay(500);
        cards = getReviewCardsFromPage(activeOptions);
        waitCount++;
      }
      
      if (cards.length === 0) {
        console.log("[replyFromClassifiedLoop] No replyable cards left on page.");
        break;
      }
      
      const targets = [];
      for (const card of cards) {
        const cardIdent = getReviewCardIdentity(card);
        const attempts = attemptCounters[cardIdent] || 0;
        if (attempts >= maxAttempts) {
          console.log(`[replyFromClassifiedLoop] Card for ${extractUserName(card)} reached max attempts. Skipping retry.`);
          continue;
        }
        
        let matchedItem = classifiedReviews.find(item => {
          const itemIdent = item.review_identity || (item.decision && item.decision.review_identity);
          return itemIdent === cardIdent;
        });
        
        if (!matchedItem) {
          matchedItem = classifiedReviews.find(item => {
            return item.username === extractUserName(card) && item.rating === extractRating(card);
          });
        }
        
        if (matchedItem) {
          const decision = matchedItem.decision || {};
          const isBlocked = decision.validation_status === "blocked";
          const isSkipped = decision.status === "skipped" || decision.status === "skipped_uncertain" || decision.intent === "skipped_uncertain";
          
          if (isBlocked) {
            const alreadyLogged = state.rows.some(r => r.review_identity === cardIdent && r.status === "blocked");
            if (!alreadyLogged) {
              addLog(Object.assign(toLogRow(matchedItem, "blocked", "validation_blocked"), {
                loop_index: loopIndex,
                attempt: attempts + 1,
                review_identity: cardIdent
              }));
            }
            continue;
          }
          
          if (isSkipped) {
            const alreadyLogged = state.rows.some(r => r.review_identity === cardIdent && r.status === "skipped_uncertain");
            if (!alreadyLogged) {
              addLog(Object.assign(toLogRow(matchedItem, "skipped_uncertain", ""), {
                loop_index: loopIndex,
                attempt: attempts + 1,
                review_identity: cardIdent
              }));
            }
            continue;
          }
          
          targets.push({
            card: card,
            item: matchedItem,
            identity: cardIdent,
            attempt: attempts + 1
          });
        } else {
          const username = extractUserName(card);
          const alreadyLogged = state.rows.some(r => r.review_identity === cardIdent);
          if (!alreadyLogged) {
            console.log(`[replyFromClassifiedLoop] Card for ${username} is not in classified reviews list!`);
            addLog({
              batch_id: state.batchId,
              page_url: root.location.href,
              review_index: "",
              username: username,
              rating: extractRating(card),
              review_language: extractReviewLanguage(card),
              review_text: extractReviewText(card),
              review_original_text: extractReviewText(card),
              review_translated_text: extractTranslatedReviewText(card),
              classification_text_source: "original",
              detected_intent: "",
              template: "",
              confidence: "",
              status: "failed",
              reason: "not_in_classified",
              error: "not_in_classified",
              review_identity: cardIdent,
              loop_index: loopIndex,
              attempt: 1
            });
          }
        }
      }
      
      if (targets.length === 0) {
        console.log("[replyFromClassifiedLoop] No targets left to process in this loop.");
        break;
      }
      
      for (const target of targets) {
        const { card, item, identity, attempt } = target;
        attemptCounters[identity] = attempt;
        
        console.log(`[replyFromClassifiedLoop] Processing target user: ${item.username}, attempt: ${attempt}`);
        await replySingleCard(card, item, activeOptions, loopIndex, attempt);
        await delay(1000);
      }
      
      const retryableErrors = [
        "reply_content_not_confirmed_after_all_aliases",
        "reply_editor_not_opened",
        "send_button_not_found_or_disabled",
        "send_button_still_enabled_after_delay",
        "transient_dialog_not_opened",
        "template_dialog_timeout"
      ];
      
      const freshReplyable = getVisibleReplyableReviews(activeOptions);
      hasRetryable = false;
      for (const card of freshReplyable) {
        const cardIdent = getReviewCardIdentity(card);
        const attempts = attemptCounters[cardIdent] || 0;
        if (attempts < maxAttempts) {
          const cardRows = state.rows.filter(r => r.review_identity === cardIdent);
          if (cardRows.length > 0) {
            const lastRow = cardRows[cardRows.length - 1];
            if (lastRow.status === "failed" && retryableErrors.includes(lastRow.error)) {
              hasRetryable = true;
              break;
            }
          } else {
            hasRetryable = true;
            break;
          }
        }
      }
      
      loopIndex++;
    }
    
    const pageReport = reconcileCurrentPage(state.rows, classifiedReviews, activeOptions);
    state.lastSummary = summarizePageRows(state.rows);
    return {
      summary: state.lastSummary,
      reconciliation: pageReport,
      rows: state.rows
    };
  }

  async function replyFromClassified(classifiedReviews) {
    assertBrowser();
    console.log(`[replyFromClassified] Starting live replies for ${classifiedReviews.length} items`);
    
    let cards = getReviewCardsFromPage(DEFAULT_OPTIONS);
    let waitCount = 0;
    while (cards.length === 0 && waitCount < 30) {
      console.log("[replyFromClassified] Waiting for cards to render...");
      await delay(500);
      cards = getReviewCardsFromPage(DEFAULT_OPTIONS);
      waitCount++;
    }
    
    let sentCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    
    state.rows = [];
    const activeOptions = mergeOptions(DEFAULT_OPTIONS);
    
    async function cancelEditor(card) {
      if (!card) return;
      try {
        const cancelButton = findClickableByText(card, ["Cancel"], { enabledOnly: true });
        if (cancelButton) {
          console.log("[replyFromClassified] Clicking Cancel to close failed editor");
          cancelButton.click();
          await delay(300);
        }
      } catch (e) {
        console.log("[replyFromClassified] Error calling cancelEditor:", e.message);
      }
    }
    
    for (const item of classifiedReviews) {
      const decision = item.decision || {};
      if (!decision.intent || decision.intent === "skipped_uncertain" || decision.status === "skipped") {
        console.log(`[replyFromClassified] Skipping unclassified/uncertain user: ${item.username}`);
        addLog(toLogRow(item, "skipped_uncertain", ""));
        skippedCount++;
        continue;
      }
      
      try {
        console.log(`[replyFromClassified] Processing user: ${item.username}`);
        
        let freshCard = null;
        const currentCards = getReviewCardsFromPage(DEFAULT_OPTIONS);
        for (const card of currentCards) {
          const u = extractUserName(card);
          const r = extractRating(card);
          if (u === item.username && r === item.rating) {
            freshCard = card;
            break;
          }
        }
        
        if (!freshCard) {
          console.log(`[replyFromClassified] Card not found on page for user: ${item.username}`);
          addLog(toLogRow(item, "failed", "card_not_found"));
          failedCount++;
          continue;
        }
        
        freshCard.scrollIntoView({ block: "center", inline: "nearest" });
        await delay(200);
        
        console.log(`[replyFromClassified] Opening editor for user: ${item.username}`);
        const opened = await openReplyEditor(freshCard, activeOptions);
        if (!opened) {
          console.log(`[replyFromClassified] Reply editor not opened for user: ${item.username}`);
          addLog(toLogRow(item, "failed", "reply_editor_not_opened"));
          failedCount++;
          continue;
        }
        
        console.log(`[replyFromClassified] Selecting template for user: ${item.username}`);
        const selected = await selectTemplate(freshCard, decision, activeOptions);
        if (!selected.ok) {
          console.log(`[replyFromClassified] Template selection failed: ${selected.error}`);
          addLog(toLogRow(item, "failed", selected.error));
          failedCount++;
          await cancelEditor(freshCard);
          continue;
        }
        
        console.log(`[replyFromClassified] Sending message for user: ${item.username}`);
        const sendButton = findClickableByText(freshCard, ["Send Message"], { enabledOnly: true });
        if (!sendButton) {
          console.log(`[replyFromClassified] Send button not found for user: ${item.username}`);
          addLog(toLogRow(item, "failed", "send_button_not_found_or_disabled"));
          failedCount++;
          await cancelEditor(freshCard);
          continue;
        }
        
        const beforeText = getElementText(freshCard).slice(0, 200);
        sendButton.scrollIntoView({ block: "center", inline: "nearest" });
        await delay(100);
        sendButton.click();
        
        console.log(`[replyFromClassified] Clicked send. Waiting 15s...`);
        await delay(activeOptions.sendDelayMs);
        
        const stillSendable = root.document.body.contains(freshCard) && findClickableByText(freshCard, ["Send Message"], { enabledOnly: true });
        if (stillSendable && getElementText(freshCard).slice(0, 200) === beforeText) {
          console.log(`[replyFromClassified] Send button still enabled after delay for user: ${item.username}`);
          addLog(toLogRow(item, "failed", "send_button_still_enabled_after_delay"));
          failedCount++;
          await cancelEditor(freshCard);
        } else {
          console.log(`[replyFromClassified] Successfully sent reply for user: ${item.username}`);
          addLog(toLogRow(item, "sent", ""));
          sentCount++;
        }
        
      } catch (error) {
        console.log(`[replyFromClassified] Error processing user: ${item.username}. Error: ${error.message}`);
        addLog(toLogRow(item, "failed", error && error.message ? error.message : String(error)));
        failedCount++;
        if (freshCard) {
          await cancelEditor(freshCard);
        }
      }
    }
    
    state.lastSummary = summarize();
    return state.lastSummary;
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

  async function navigateToPage(pageNumber) {
    assertBrowser();
    const pageStr = String(pageNumber);
    const elements = Array.from(root.document.querySelectorAll("button, a, div, span"));
    const target = elements.find(el => {
      const text = (el.innerText || el.textContent || "").trim();
      if (text !== pageStr) return false;
      return el.classList.contains("cursor-pointer") || el.tagName === "BUTTON" || el.tagName === "A" || el.closest(".mt-4") || el.closest("[class*='pagination']");
    });
    
    if (!target) {
      console.log(`[navigateToPage] Page button for page ${pageNumber} not found.`);
      return false;
    }
    
    console.log(`[navigateToPage] Clicking page button for page ${pageNumber}...`);
    target.scrollIntoView({ block: "center" });
    await delay(100);
    target.click();
    await delay(2500); // Wait for client-side load
    return true;
  }

  return {
    DEFAULT_RULES,
    DEFAULT_OPTIONS,
    state,
    configure,
    normalizeText,
    navigateToPage,
    classifyReview,
    collectReviewData,
    dryRun,
    selectOnly,
    sendSelected,
    sendOneSelected,
    replyOneByOne,
    selectThenSend,
    summarize,
    toCsv,
    downloadLog,
    copyLog,
    scrapeReviews,
    replyFromClassified,
    validateDecision,
    fnv1a_64,
    getReviewCardIdentity,
    isAlreadyRepliedCard,
    getVisibleReviewSnapshot,
    getVisibleReplyableReviews,
    replyFromClassifiedLoop,
    reconcileCurrentPage
  };
});
