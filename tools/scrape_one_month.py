import json
import urllib.request
import urllib.error
import time
import re
import os
import hashlib
from datetime import datetime

BRIDGE_URL = "http://127.0.0.1:10086/command"
SESSION_NAME = "volio-reviews-python-inspector"
APP_NAME = "control_widget"
APP_ID = "01KKKAC4B08CTFJHG9RFTFPJJ4"
DEFAULT_URL_TEMPLATE = "https://apps-publisher.volio.vn/reviews-feed?rating=5%2C4%2C3%2C2%2C1&reply=noReply&page={page}&size=50&app_id=" + APP_ID + "&fetch=false"

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGS_DIR = os.path.join(ROOT_DIR, "apps", APP_NAME, "logs")
SCRAPED_PATH = os.path.join(LOGS_DIR, "reviews_scraped.json")

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
    with urllib.request.urlopen(req, timeout=30) as response:
        return json.loads(response.read().decode('utf-8'))

def normalize_text(value):
    import unicodedata
    text = str(value or "")
    text = unicodedata.normalize("NFD", text)
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    text = text.replace("đ", "d").replace("Đ", "D").lower()
    return re.sub(r"\s+", " ", text).strip()

def review_identity(item):
    raw = "|".join([
        str(item.get("username", "")),
        str(item.get("rating", "")),
        normalize_text(item.get("text", "")),
    ])
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]

def is_within_one_month(date_str):
    if not date_str:
        return False
    try:
        # Date format can be "DD/MM/YYYY HH:mm:ss" or "DD/MM/YYYY"
        clean_date = date_str.split()[0]
        dt = datetime.strptime(clean_date, "%d/%m/%Y")
        # 1 month before 28/06/2026 is 28/05/2026
        limit = datetime(2026, 5, 28)
        return dt >= limit
    except Exception as e:
        print(f"Error parsing date {date_str}: {e}")
        return False

def inject_agent(js_file_path, target_url):
    print(f"Reading agent code from {js_file_path}...")
    with open(js_file_path, 'r', encoding='utf-8') as f:
        agent_code = f.read()
        
    print("Finding the Volio reviews tab...")
    find_res = send_command('find_tab', {
        "url": "https://apps-publisher.volio.vn/reviews-feed",
        "active": True
    })
    
    if not find_res.get('ok') or not find_res.get('data', {}).get('success'):
        print("Tab not found. Opening a new tab for Volio Publisher...")
        navigate_res = send_command('navigate', {
            "url": target_url,
            "newTab": True,
            "group_title": "Volio Reviews"
        })
    else:
        print("Navigating existing tab to target reviews feed...")
        navigate_res = send_command('navigate', {
            "url": target_url,
            "newTab": False
        })
        if not navigate_res.get('ok') or not navigate_res.get('data', {}).get('success'):
            print("Failed to navigate. Retrying with active tab...")
            
    time.sleep(6)  # Wait for page load stability
    
    print("Injecting agent script into tab...")
    inject_res = send_command('evaluate', { "code": agent_code })
    if not inject_res.get('ok'):
        print(f"Injection failed: {inject_res}")
        sys.exit(1)
    print("Agent injected successfully.")

def run_scrape():
    print("\n--- Scraping Reviews from Last 1 Month ---")
    js_path = os.path.join(ROOT_DIR, "tools", "volio_review_agent.js")
    
    all_reviews = []
    page = 1
    max_pages = 25  # Safety threshold to prevent infinite loops
    
    while page <= max_pages:
        page_url = DEFAULT_URL_TEMPLATE.format(page=page)
        print(f"\n--- Scraping Page {page}: {page_url} ---")
        inject_agent(js_path, page_url)
        time.sleep(2)
        
        code = "VolioReviewAgent.scrapeReviews()"
        res = send_command('evaluate', { "code": code })
        if not res.get('ok'):
            print(f"Scrape failed on page {page}: {res}")
            break
            
        page_reviews = res['data']['value']
        print(f"Scraped {len(page_reviews)} reviews from page {page}")
        if not page_reviews:
            print("No reviews returned from this page. Stopping.")
            break
            
        # Check dates
        valid_page_reviews = []
        has_older_reviews = False
        
        for review in page_reviews:
            date_str = review.get("reviewDate", "")
            if is_within_one_month(date_str):
                valid_page_reviews.append(review)
            else:
                print(f"Found review older than 1 month: {review.get('username')} date={date_str}")
                has_older_reviews = True
                
        all_reviews.extend(valid_page_reviews)
        print(f"Page {page} has {len(valid_page_reviews)} reviews within 1 month.")
        
        if has_older_reviews:
            print("Hit 1-month date boundary. Stopping pagination.")
            break
            
        page += 1
        time.sleep(1)

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
        
    os.makedirs(LOGS_DIR, exist_ok=True)
    with open(SCRAPED_PATH, "w", encoding="utf-8") as f:
        json.dump(unique_reviews, f, indent=2, ensure_ascii=False)
        
    print(f"\nSuccessfully scraped total {len(unique_reviews)} reviews in the last 1 month and saved to {SCRAPED_PATH}")

if __name__ == "__main__":
    run_scrape()
