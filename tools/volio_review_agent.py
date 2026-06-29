import sys
import os
import json
import time
import urllib.request
import urllib.error
import argparse
import hashlib
import re
import unicodedata
from collections import Counter
from pathlib import Path

# Configuration
BRIDGE_URL = "http://127.0.0.1:10086/command"
SESSION_NAME = f"volio-reviews-python-{int(time.time())}"
DEFAULT_REVIEW_URL = "https://apps-publisher.volio.vn/reviews-feed?rating=3%2C2%2C1&reply=noReply&page=1&size=50&app_id=01KKKAC4B08CTFJHG9RFTFPJJ4&fetch=false"
ROOT_DIR = str(Path(str(__file__).replace("\\", "/")).resolve().parents[1])

LOGS_DIR = ""
RULES_PATH = ""
SCRAPED_PATH = ""
CLASSIFIED_PATH = ""
VALIDATED_CLASSIFIED_PATH = ""
VALIDATION_REPORT_PATH = ""
ISSUE_REPORT_PATH = ""

def init_app_paths(app_name):
    global LOGS_DIR, RULES_PATH, SCRAPED_PATH, CLASSIFIED_PATH, VALIDATED_CLASSIFIED_PATH, VALIDATION_REPORT_PATH, ISSUE_REPORT_PATH
    app_dir = os.path.join(ROOT_DIR, "apps", app_name)
    LOGS_DIR = os.path.join(app_dir, "logs")
    os.makedirs(LOGS_DIR, exist_ok=True)
    app_rules = os.path.join(app_dir, "review_rules.json")
    if os.path.exists(app_rules):
        RULES_PATH = app_rules
    else:
        RULES_PATH = os.path.join(ROOT_DIR, "review_rules.json")
    SCRAPED_PATH = os.path.join(LOGS_DIR, "reviews_scraped.json")
    CLASSIFIED_PATH = os.path.join(LOGS_DIR, "reviews_classified.json")
    VALIDATED_CLASSIFIED_PATH = os.path.join(LOGS_DIR, "reviews_classified.validated.json")
    VALIDATION_REPORT_PATH = os.path.join(LOGS_DIR, "reviews_classified_validation.json")
    ISSUE_REPORT_PATH = os.path.join(LOGS_DIR, "review_issue_summary.json")

def send_command(action, args):
    payload = {
        "action": action,
        "args": args,
        "session": SESSION_NAME
    }
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        BRIDGE_URL,
        data=data,
        headers={'Content-Type': 'application/json'}
    )
    try:
        with urllib.request.urlopen(req, timeout=1800) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.URLError as e:
        print(f"Error connecting to Kimi WebBridge: {e}")
        print("Please ensure kimi-webbridge.exe is running on port 10086.")
        sys.exit(1)

def normalize_text(value):
    text = str(value or "")
    text = unicodedata.normalize("NFD", text)
    text = re.sub(r'[\u0300-\u036f]', '', text)
    text = text.replace("đ", "d").replace("Đ", "D").lower()
    return re.sub(r"\s+", " ", text).strip()

def word_count(value):
    return len(re.findall(r"[\w]+", normalize_text(value), flags=re.UNICODE))

def has_skip_risk_signal(value):
    normalized = normalize_text(value)
    raw = str(value or "").lower()
    signals = [
        "bad",
        "worst",
        "unusable",
        "fraud",
        "scam",
        "lixo",
        "horrivel",
        "saçma",
        "sacma",
        "didnt work",
        "didn't work",
        "doesnt work",
        "doesn't work",
        "not working",
        "khong hoat dong",
        "gracias",
        "thank",
        "thanks",
        "love",
        "like",
    ]
    unicode_signals = ["فاشل"]
    return any(signal in normalized for signal in signals) or any(signal in raw for signal in unicode_signals)

def fnv1a_64(text):
    h = 0xcbf29ce484222325
    for char in text.encode('utf-8'):
        h = h ^ char
        h = (h * 0x00000100000001B3) & 0xffffffffffffffff
    return f"{h:016x}"

def review_identity(item):
    text = item.get("originalText") or item.get("review_original_text") or item.get("text", "")
    raw = "|".join([
        str(item.get("username") or "").strip(),
        str(item.get("rating") or "").strip(),
        str(item.get("reviewDate") or item.get("review_date") or "").strip(),
        str(item.get("reviewLanguage") or item.get("review_language") or "").strip(),
        normalize_text(text),
    ])
    return fnv1a_64(raw)

def original_review_text(item):
    return item.get("originalText") or item.get("review_original_text") or item.get("text", "")

def classified_items_for_page(classified_reviews, page_number, page_url, visible_snapshots=None):
    visible_identities = set()
    if visible_snapshots:
        for s in visible_snapshots:
            ident = s.get("review_identity")
            if ident:
                visible_identities.add(ident)
    
    page_items = []
    for item in classified_reviews:
        ident = review_identity(item)
        item["review_identity"] = ident
        
        if ident in visible_identities:
            page_items.append(item)
            continue
            
        item_url = item.get("pageUrl") or ""
        item_page = item.get("page_number") or item.get("page")
        
        url_match = False
        if item_url and page_url:
            item_page_match = re.search(r'page=(\d+)', item_url)
            curr_page_match = re.search(r'page=(\d+)', page_url)
            item_p = item_page_match.group(1) if item_page_match else None
            curr_p = curr_page_match.group(1) if curr_page_match else str(page_number)
            
            item_app_match = re.search(r'app_id=([^&]+)', item_url)
            curr_app_match = re.search(r'app_id=([^&]+)', page_url)
            item_app = item_app_match.group(1) if item_app_match else None
            curr_app = curr_app_match.group(1) if curr_app_match else None
            
            if item_p == curr_p and (not item_app or not curr_app or item_app == curr_app):
                url_match = True
                
        if url_match or (item_page is not None and str(item_page) == str(page_number)):
            page_items.append(item)
            
    return page_items

def load_rules():
    with open(RULES_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def build_rule_indexes(rules):
    templates = rules.get("templates", {})
    by_alias = {}
    alias_folders = {}
    for folder, names in (rules.get("templateFolders") or {}).items():
        for name in names or []:
            alias_folders[normalize_text(name)] = folder
    for key, template in templates.items():
        names = [template.get("template", ""), *(template.get("aliases") or [])]
        for name in names:
            if name:
                normalized = normalize_text(name)
                by_alias[normalized] = {
                    "key": key,
                    "template": name,
                    "folder": alias_folders.get(normalized, template.get("folder", "")),
                }
    return templates, by_alias

def validate_classified_items(items, rules):
    templates, by_alias = build_rule_indexes(rules)
    validated = []
    errors = []
    warnings = []
    issue_counts = Counter()
    status_counts = Counter()

    for index, item in enumerate(items, start=1):
        copy = dict(item)
        copy["text"] = original_review_text(copy)
        copy.setdefault("originalText", copy["text"])
        copy.setdefault("translatedText", copy.get("review_translated_text", ""))
        decision = dict(copy.get("decision") or {})
        copy["decision"] = decision
        copy["review_identity"] = review_identity(copy)
        copy["validation_source"] = os.path.basename(CLASSIFIED_PATH)

        item_warnings = []
        item_errors = []
        status = decision.get("status", "")
        intent = decision.get("intent", "")
        template_name = decision.get("template", "")

        if not copy.get("username") or not copy.get("rating") or copy.get("text") is None:
            item_errors.append("missing_review_identity_fields")

        if not intent or intent == "skipped_uncertain" or status in ("skipped", "skipped_uncertain"):
            rating_number = int(copy.get("rating") or 0)
            text_words = word_count(original_review_text(copy))
            if rating_number >= 4 and text_words >= 0:
                item_warnings.append("skipped_high_rating_review")
            elif has_skip_risk_signal(original_review_text(copy)):
                item_warnings.append("skipped_clear_replyable_signal")
            elif rating_number == 3 and text_words >= 3:
                item_warnings.append("skipped_mid_rating_text_review")
            decision.update({
                "status": "skipped_uncertain",
                "intent": "skipped_uncertain",
                "template": "",
                "folder": "",
                "validation_status": "skipped",
                "validation_warnings": item_warnings,
                "validation_errors": item_errors,
                "rulesVersion": rules.get("version"),
            })
            status_counts["skipped_uncertain"] += 1
            warnings.extend({"index": copy.get("index", index), "username": copy.get("username"), "warning": warning} for warning in item_warnings)
            errors.extend({"index": copy.get("index", index), "username": copy.get("username"), "errors": [error]} for error in item_errors)
            validated.append(copy)
            continue

        alias_match = by_alias.get(normalize_text(template_name))
        template_key = intent if intent in templates else (alias_match or {}).get("key")
        if not template_key:
            item_errors.append(f"unknown_intent_or_template:{intent or template_name}")
        else:
            canonical = templates[template_key]
            allowed_names = [canonical.get("template", ""), *(canonical.get("aliases") or [])]
            selected_template = template_name if template_name in allowed_names else canonical.get("template", "")
            selected_alias = by_alias.get(normalize_text(selected_template)) or {
                "template": selected_template,
                "folder": canonical.get("folder", ""),
            }
            selected_folder = decision.get("folder") or selected_alias.get("folder") or canonical.get("folder", "")
            folder_templates = rules.get("templateFolders", {}).get(selected_folder, [])
            if selected_template not in folder_templates:
                corrected_folder = selected_alias.get("folder") or canonical.get("folder", "")
                if corrected_folder != selected_folder:
                    item_warnings.append(f"normalized_folder:{selected_folder}->{corrected_folder}")
                selected_folder = corrected_folder
            if selected_template not in allowed_names:
                item_warnings.append(f"unknown_family_template:{template_name}->{canonical.get('template','')}")
            if selected_template != canonical.get("template"):
                item_warnings.append(f"parallel_template:{canonical.get('template','')}|{selected_template}")
            decision.update({
                "status": "selected",
                "intent": template_key,
                "templateKey": template_key,
                "template": selected_template,
                "folder": selected_folder,
                "aliases": [selected_template, *[name for name in allowed_names if name and name != selected_template]],
                "rulesVersion": rules.get("version"),
            })
            issue_counts[template_key] += 1

        text_words = word_count(original_review_text(copy))
        normalized = normalize_text(original_review_text(copy))
        if text_words == 0 and str(copy.get("text", "")).strip():
            item_warnings.append("emoji_or_symbol_only")
        if text_words <= 1 and decision.get("intent") == "general_1_star":
            item_warnings.append("very_short_general_negative")
        if "offline" in normalized or "wifi" in normalized:
            item_warnings.append("offline_or_wifi_request")
        if "pay" in normalized or "tra tien" in normalized or "money" in normalized:
            item_warnings.append("pricing_or_paywall_signal")
        if "notification" in normalized or "thong bao" in normalized:
            item_warnings.append("notification_or_privacy_signal")

        if item_errors:
            decision["status"] = "skipped_uncertain"
            decision["intent"] = "skipped_uncertain"
            decision["template"] = ""
            decision["folder"] = ""
            decision["validation_status"] = "blocked"
            errors.append({"index": copy.get("index", index), "username": copy.get("username"), "errors": item_errors})
            status_counts["blocked"] += 1
        else:
            decision["validation_status"] = "valid"
            status_counts["selected"] += 1

        decision["validation_warnings"] = item_warnings
        decision["validation_errors"] = item_errors
        warnings.extend({"index": copy.get("index", index), "username": copy.get("username"), "warning": warning} for warning in item_warnings)
        validated.append(copy)

    report = {
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "rules_version": rules.get("version"),
        "total_items": len(items),
        "status_counts": dict(status_counts),
        "issue_counts": dict(issue_counts),
        "warning_count": len(warnings),
        "error_count": len(errors),
        "warnings": warnings,
        "errors": errors,
    }
    return validated, report

def write_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def validate_classified_file(input_path=CLASSIFIED_PATH):
    if not os.path.exists(input_path):
        print(f"Classified reviews file not found at: {input_path}")
        sys.exit(1)
    with open(input_path, "r", encoding="utf-8") as f:
        classified_reviews = json.load(f)
    rules = load_rules()
    validated, report = validate_classified_items(classified_reviews, rules)
    write_json(VALIDATED_CLASSIFIED_PATH, validated)
    write_json(VALIDATION_REPORT_PATH, report)
    write_json(ISSUE_REPORT_PATH, {
        "generated_at": report["generated_at"],
        "rules_version": report["rules_version"],
        "total_reviews": report["total_items"],
        "issue_counts": report["issue_counts"],
        "status_counts": report["status_counts"],
        "warning_count": report["warning_count"],
        "error_count": report["error_count"],
    })
    print(f"Validated {report['total_items']} classified reviews.")
    print(f"  Selected: {report['status_counts'].get('selected', 0)}")
    print(f"  Skipped: {report['status_counts'].get('skipped_uncertain', 0)}")
    print(f"  Blocked: {report['status_counts'].get('blocked', 0)}")
    print(f"  Warnings: {report['warning_count']}")
    print(f"  Errors: {report['error_count']}")
    print(f"Saved validated classified reviews to: {VALIDATED_CLASSIFIED_PATH}")
    print(f"Saved validation report to: {VALIDATION_REPORT_PATH}")
    print(f"Saved issue summary to: {ISSUE_REPORT_PATH}")
    return validated, report

def wait_for_page_load(target_url, timeout=30):
    print(f"Waiting for page load completion of {target_url}...")
    page_match = re.search(r'page=(\d+)', target_url)
    page_num = page_match.group(1) if page_match else None
    
    # Phase 1: Wait for navigation to start (marker attribute becomes missing or evaluate throws)
    print("Waiting for navigation to start...")
    for _ in range(20):
        try:
            res = send_command('evaluate', { "code": "document.body ? document.body.getAttribute('data-volio-navigating') : null" })
            if not res.get('ok') or res['data'].get('value') is None:
                print("Navigation started.")
                break
        except Exception:
            print("Navigation started (evaluate exception).")
            break
        time.sleep(0.2)
    
    # Phase 2: Wait for navigation to finish (readyState complete, URL matches, and cards count > 0)
    print("Waiting for page load and review cards to render...")
    for i in range(timeout):
        try:
            code = """
            (function() {
                const cards = document.querySelectorAll("div[class*='rounded-[8px]']");
                return JSON.stringify({
                    url: window.location.href,
                    readyState: document.readyState,
                    cardsCount: cards.length
                });
            })()
            """
            res = send_command('evaluate', { "code": code })
            if res.get('ok'):
                info = json.loads(res['data']['value'])
                current_url = info.get('url', '')
                ready_state = info.get('readyState', '')
                cards_count = info.get('cardsCount', 0)
                
                url_ok = True
                target_app_match = re.search(r'app_id=([^&]+)', target_url)
                target_app = target_app_match.group(1) if target_app_match else None
                
                if page_num:
                    url_ok = url_ok and (f"page={page_num}" in current_url)
                if target_app:
                    url_ok = url_ok and (target_app in current_url)
                
                marker_res = send_command('evaluate', { "code": "document.body ? document.body.hasAttribute('data-volio-navigating') : false" })
                has_marker = marker_res.get('ok') and marker_res['data']['value']
                
                if url_ok and ready_state == 'complete' and cards_count > 0 and not has_marker:
                    print(f"Page fully loaded and settled with {cards_count} cards after {i}s.")
                    time.sleep(4) # Wait for React hydration stability
                    return True
        except Exception:
            pass
        time.sleep(1)
    print("Warning: Page did not load completely within timeout.")
    return False

def inject_agent(js_file_path, target_url=DEFAULT_REVIEW_URL):
    print(f"Reading agent code from {js_file_path}...")
    with open(js_file_path, 'r', encoding='utf-8') as f:
        agent_code = f.read()
    
    app_id_match = re.search(r'app_id=([^&]+)', target_url)
    app_id = app_id_match.group(1) if app_id_match else None
    find_url = "https://apps-publisher.volio.vn/reviews-feed"
    if app_id:
        find_url += f"?app_id={app_id}"
        
    print(f"Finding the Volio reviews tab matching: {find_url}...")
    find_res = send_command('find_tab', {
        "url": find_url,
        "active": True
    })
    
    if not find_res.get('ok') or not find_res.get('data', {}).get('success'):
        print("Tab not found. Opening a new tab for Volio Publisher...")
        navigate_res = send_command('navigate', {
            "url": target_url,
            "newTab": True,
            "group_title": "Volio Reviews"
        })
        if not navigate_res.get('ok') or not navigate_res.get('data', {}).get('success'):
            print(f"Failed to navigate to Volio Publisher: {navigate_res}")
            sys.exit(1)
        url = navigate_res['data']['url']
        time.sleep(5) # Let navigation start
    else:
        current_url = find_res['data'].get('url', '')
        current_app = re.search(r'app_id=([^&]+)', current_url)
        target_app = re.search(r'app_id=([^&]+)', target_url)
        current_page = re.search(r'page=([^&]+)', current_url)
        target_page = re.search(r'page=([^&]+)', target_url)
        current_reply = re.search(r'reply=([^&]+)', current_url)
        target_reply = re.search(r'reply=([^&]+)', target_url)
        
        current_app_id = current_app.group(1) if current_app else None
        target_app_id = target_app.group(1) if target_app else None
        current_page_num = current_page.group(1) if current_page else "1"
        target_page_num = target_page.group(1) if target_page else "1"
        current_reply_val = current_reply.group(1) if current_reply else None
        target_reply_val = target_reply.group(1) if target_reply else None
        
        if current_app_id == target_app_id and current_page_num == target_page_num and current_reply_val == target_reply_val:
            print("Tab is already on target app, page, and reply filter. Skipping navigation.")
            url = current_url
        else:
            print("Setting navigation marker on body...")
            send_command('evaluate', { "code": "if (document.body) document.body.setAttribute('data-volio-navigating', 'true');" })
            print("Navigating existing tab to size=50 reviews feed...")
            navigate_res = send_command('navigate', {
                "url": target_url,
                "newTab": False
            })
            if not navigate_res.get('ok') or not navigate_res.get('data', {}).get('success'):
                print(f"Failed to navigate existing tab: {navigate_res}")
                sys.exit(1)
            url = navigate_res['data']['url']
            time.sleep(5) # Let navigation start
        
    print(f"Active Volio Publisher tab: {url}")
    wait_for_page_load(target_url)
    
    print("Injecting agent script into tab...")
    inject_res = send_command('evaluate', {
        "code": agent_code
    })
    
    if not inject_res.get('ok'):
        print(f"Failed to inject agent: {inject_res}")
        sys.exit(1)
    print("Agent injected successfully.")

def run_dry_run(max_reviews):
    print(f"\n--- Running Dry Run (max reviews: {max_reviews}) ---")
    code = f"VolioReviewAgent.dryRun({{ maxReviews: {max_reviews} }})"
    res = send_command('evaluate', { "code": code })
    
    if not res.get('ok'):
        print(f"Dry run failed: {res}")
        return
        
    value = res['data']['value']
    items = value.get('items', [])
    summary = value.get('summary', {})
    
    print("\nDry Run Summary:")
    print(f"  Total Processed: {summary.get('totalRows', 0)}")
    print(f"  Selected (Ready to Send): {summary.get('selected', 0)}")
    print(f"  Skipped (Uncertain/Short): {summary.get('skipped', 0)}")
    
    print("\nDetailed Review Classifications:")
    for item in items:
        decision = item.get('decision', {})
        print(f"  [{item['index']}] User: {item['username']} | Rating: {item['rating']}* | Lang: {item['reviewLanguage']}")
        print(f"      Text: {item['text']}")
        print(f"      Intent: {decision.get('intent', 'N/A')} | Template: {decision.get('template', 'N/A')} | Folder: {decision.get('folder', 'N/A')}")
        print(f"      Status: {decision.get('status')} | Reason: {decision.get('reason')}")
        print("-" * 50)
        
    # Save dry run output
    output_dir = LOGS_DIR
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "dry_run_last.json")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(value, f, indent=2, ensure_ascii=False)
    print(f"Saved detailed dry run logs to {output_path}")

def run_live(max_reviews, delay_ms):
    print(f"\n--- Starting Live Run One-By-One (max reviews: {max_reviews}, delay: {delay_ms}ms) ---")
    print("Executing sequential reply flow...")
    code = f"VolioReviewAgent.replyOneByOne({{ maxReviews: {max_reviews}, sendDelayMs: {delay_ms} }})"
    res = send_command('evaluate', { "code": code })
    if not res.get('ok'):
        print(f"Sequential reply flow failed: {res}")
        sys.exit(1)
        
    summary = res['data']['value']
    print("\nLive Run Summary:")
    print(f"  Total Processed: {summary.get('totalRows', 0)}")
    print(f"  Sent: {summary.get('sent', 0)}")
    print(f"  Skipped: {summary.get('skipped', 0)}")
    print(f"  Failed: {summary.get('failed', 0)}")
    
    # 2. Export CSV logs
    print("\nExporting final logs...")
    csv_res = send_command('evaluate', {
        "code": "VolioReviewAgent.toCsv(VolioReviewAgent.state.rows)"
    })
    
    if csv_res.get('ok'):
        csv_content = csv_res['data']['value']
        logs_dir = LOGS_DIR
        os.makedirs(logs_dir, exist_ok=True)
        batch_id = time.strftime("%Y%m%d-%H%M%S")
        log_path = os.path.join(logs_dir, f"review-batch-{batch_id}.csv")
        with open(log_path, 'w', encoding='utf-8') as f:
            f.write(csv_content)
        print(f"Saved execution log to: {log_path}")
        
    print(f"\nLive Execution Completed. Sent: {summary.get('sent', 0)}, Failed: {summary.get('failed', 0)}.")

def run_scrape(pages=1, base_url=DEFAULT_REVIEW_URL):
    print(f"\n--- Scraping Reviews from {pages} Pages ---")
    all_reviews = []
    js_path = os.path.join(ROOT_DIR, "tools", "volio_review_agent.js")
    
    for page in range(1, pages + 1):
        if "page=" in base_url:
            page_url = re.sub(r"page=\d+", f"page={page}", base_url)
        else:
            page_url = base_url + f"&page={page}"
            
        print(f"\n--- Scraping Page {page}: {page_url} ---")
        inject_agent(js_path, page_url)
        time.sleep(2)  # Wait for page load stability
        
        code = "VolioReviewAgent.scrapeReviews()"
        res = send_command('evaluate', { "code": code })
        if not res.get('ok'):
            print(f"Scrape failed on page {page}: {res}")
            sys.exit(1)
            
        page_reviews = res['data']['value']
        print(f"Scraped {len(page_reviews)} reviews from page {page}")
        all_reviews.extend(page_reviews)
        
    # Deduplicate reviews by their unique identity
    seen_ids = set()
    unique_reviews = []
    for review in all_reviews:
        ident = review_identity(review)
        if ident not in seen_ids:
            seen_ids.add(ident)
            unique_reviews.append(review)
            
    # Re-index all scraped reviews to be continuous
    for idx, review in enumerate(unique_reviews, start=1):
        review["index"] = idx
        
    write_json(SCRAPED_PATH, unique_reviews)
    print(f"\nSuccessfully scraped total {len(unique_reviews)} reviews and saved to {SCRAPED_PATH}")

def run_reply_from_classified(pages=1, base_url=DEFAULT_REVIEW_URL):
    print(f"\n--- Executing replies from classified JSON file across {pages} pages ---")
    classified_reviews, validation_report = validate_classified_file(CLASSIFIED_PATH)
    fatal_errors = [
        error for error in validation_report.get("errors", [])
        if any(not str(item).startswith(("emoji_or_symbol_only", "too_short_for_positive")) for item in error.get("errors", []))
    ]
    if fatal_errors:
        print("Validation found fatal errors. Refusing to execute live replies.")
        print(f"Inspect: {VALIDATION_REPORT_PATH}")
        sys.exit(1)

    fatal_skip_warnings = [
        warning for warning in validation_report.get("warnings", [])
        if warning.get("warning") in {
            "skipped_clear_replyable_signal",
            "skipped_high_rating_review",
            "skipped_mid_rating_text_review",
        }
    ]
    if fatal_skip_warnings:
        print("Validation found skipped reviews that look replyable. Refusing to execute live replies.")
        print(f"Inspect: {VALIDATION_REPORT_PATH}")
        sys.exit(1)
        
    js_path = os.path.join(ROOT_DIR, "tools", "volio_review_agent.js")
    app_name = os.path.basename(os.path.dirname(LOGS_DIR))
    
    all_leftovers = []
    pages_checked = []
    final_execution_rows = []
    batch_timestamp = time.strftime("%Y%m%d-%H%M%S")
    
    total_sent = 0
    total_failed = 0
    total_skipped = 0
    total_visible_no_reply = 0
    
    for page in range(1, pages + 1):
        if "page=" in base_url:
            page_url = re.sub(r"page=\d+", f"page={page}", base_url)
        else:
            page_url = base_url + f"&page={page}"
            
        print(f"\n--- Executing replies on Page {page}: {page_url} ---")
        inject_agent(js_path, page_url)
        time.sleep(2)  # Wait for stability
        
        snapshot_res = send_command('evaluate', { "code": "VolioReviewAgent.getVisibleReviewSnapshot()" })
        visible_snapshots = snapshot_res['data']['value'] if snapshot_res.get('ok') else []
        print(f"Visible reviews on page: {len(visible_snapshots)}")
        
        page_classified = classified_items_for_page(classified_reviews, page, page_url, visible_snapshots)
        print(f"Loaded {len(page_classified)} page-scoped classified reviews out of {len(classified_reviews)} total.")
        
        for item in page_classified:
            item["app"] = app_name
            item["page_number"] = page
            
        print("Executing page-scoped reply loop in browser...")
        code = f"VolioReviewAgent.replyFromClassifiedLoop({json.dumps(page_classified, ensure_ascii=False)}, {{ pageNumber: {page} }})"
        res = send_command('evaluate', { "code": code })
        
        logs_res = send_command('evaluate', { "code": "VolioReviewAgent.state.debugLogs" })
        if logs_res.get('ok'):
            print("\n--- Browser Injected Agent Debug Logs ---")
            for log_line in logs_res['data']['value'] or []:
                print(f"  {log_line}")
            print("------------------------------------------\n")
            
        if not res.get('ok'):
            print(f"Live execution loop failed on page {page}: {res}")
            sys.exit(1)
            
        result_val = res['data']['value']
        summary = result_val.get('summary', {})
        reconciliation = result_val.get('reconciliation', {})
        page_rows = result_val.get('rows', [])
        
        print(f"\nExecution Summary for Page {page}:")
        print(f"  Total Processed: {summary.get('totalRows', 0)}")
        print(f"  Sent: {summary.get('sent', 0)}")
        print(f"  Skipped: {summary.get('skipped', 0)}")
        print(f"  Failed: {summary.get('failed', 0)}")
        
        total_sent += summary.get('sent', 0)
        total_failed += summary.get('failed', 0)
        total_skipped += summary.get('skipped', 0)
        total_visible_no_reply += reconciliation.get('visible_no_reply_count', 0)
        
        print("\nExporting page CSV logs...")
        csv_res = send_command('evaluate', {
            "code": "VolioReviewAgent.toCsv(VolioReviewAgent.state.rows)"
        })
        if csv_res.get('ok'):
            csv_content = csv_res['data']['value']
            log_path = os.path.join(LOGS_DIR, f"review-batch-page{page}-{batch_timestamp}.csv")
            with open(log_path, 'w', encoding='utf-8') as f:
                f.write(csv_content)
            print(f"Saved page execution log to: {log_path}")
            
        recon_path = os.path.join(LOGS_DIR, f"reconciliation-page{page}-{batch_timestamp}.json")
        write_json(recon_path, reconciliation)
        print(f"Saved page reconciliation report to: {recon_path}")
        
        all_leftovers.extend(reconciliation.get("leftovers", []))
        pages_checked.append(page)
        final_execution_rows.extend(page_rows)
        
        print(f"Page {page} Execution Completed. Leftovers: {reconciliation.get('leftover_count', 0)} (Retryable: {reconciliation.get('retryable_leftover_count', 0)})")

    final_log_path = os.path.join(LOGS_DIR, "final_execution_log.json")
    write_json(final_log_path, final_execution_rows)
    print(f"\nSaved final execution log to: {final_log_path}")
    
    leftover_path = os.path.join(LOGS_DIR, "leftover_visible_reviews.json")
    leftover_report = {
        "app": app_name,
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "pages_checked": pages_checked,
        "summary": {
            "visible_no_reply_count": total_visible_no_reply,
            "leftover_count": len(all_leftovers),
            "retryable_leftover_count": sum(1 for l in all_leftovers if l.get("retryable")),
            "silent_skip_count": sum(1 for l in all_leftovers if l.get("reason") == "silent_skip")
        },
        "items": all_leftovers
    }
    write_json(leftover_path, leftover_report)
    print(f"Saved leftovers summary report to: {leftover_path}")
    
    print(f"\nBatch Execution Completed. Total Sent: {total_sent}, Total Failed: {total_failed}, Total Skipped: {total_skipped}.")
    print(f"Leftover replyable cards remaining: {len(all_leftovers)}")
    
    if len(all_leftovers) > 0:
        print("\n[WARNING] BATCH_INCOMPLETE: There are leftover replyable reviews on the UI.")
        # Non-zero exit code or warning print as requested by SOP/Plan
        # In a real environment, we return non-zero exit if there are retryable leftovers, or print BATCH_INCOMPLETE.
        # Let's print BATCH_INCOMPLETE clearly.
        print("BATCH_INCOMPLETE")
        sys.exit(2)  # Return exit code 2 to indicate incomplete batch with leftovers.

def main():
    parser = argparse.ArgumentParser(description="Volio Review Agent CLI Controller")
    parser.add_argument('--dry-run', action='store_true', help="Run in dry run classification mode")
    parser.add_argument('--run', action='store_true', help="Run template selection and send replies")
    parser.add_argument('--scrape', action='store_true', help="Scrape reviews to json file")
    parser.add_argument('--validate-classified', action='store_true', help="Validate classified reviews and preserve valid parallel templates before live execution")
    parser.add_argument('--reply-from-classified', action='store_true', help="Reply to reviews using classified JSON file")
    parser.add_argument('--max-reviews', type=int, default=50, help="Max number of reviews to process")
    parser.add_argument('--delay', type=int, default=15, help="Delay in seconds between sending messages")
    parser.add_argument('--url', default=DEFAULT_REVIEW_URL, help="Volio reviews-feed URL to process")
    parser.add_argument('--scrape-pages', type=int, default=1, help="Number of pages to scrape")
    parser.add_argument('--reply-pages', type=int, default=1, help="Number of pages to reply to")
    parser.add_argument('--app', default='control_widget', help="App name/folder under apps/")
    
    args = parser.parse_args()
    init_app_paths(args.app)
        
    # Let's check correctly
    has_action = args.dry_run or args.run or args.scrape or args.validate_classified or args.reply_from_classified
    if not has_action:
        print("Please specify an action: --dry-run, --run, --scrape, --validate-classified, or --reply-from-classified.")
        parser.print_help()
        sys.exit(1)
        
    if args.validate_classified:
        validate_classified_file(CLASSIFIED_PATH)
        return

    if args.scrape:
        run_scrape(args.scrape_pages, args.url)
    elif args.reply_from_classified:
        run_reply_from_classified(args.reply_pages, args.url)
    else:
        js_path = os.path.join(ROOT_DIR, "tools", "volio_review_agent.js")
        inject_agent(js_path, args.url)
        if args.dry_run:
            run_dry_run(args.max_reviews)
        elif args.run:
            run_live(args.max_reviews, args.delay * 1000)

if __name__ == "__main__":
    main()
