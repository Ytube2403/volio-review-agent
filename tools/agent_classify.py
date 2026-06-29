import json
import os
import time
import sys

ROOT_DIR = "d:/Kimi"
SCRAPED_PATH = os.path.join(ROOT_DIR, "apps/control_widget/logs/reviews_scraped.json")
CLASSIFIED_PATH = os.path.join(ROOT_DIR, "apps/control_widget/logs/reviews_classified.json")
SIGNAL_PATH = os.path.join(ROOT_DIR, "scratch/classify_request.json")
TIMEOUT_SECONDS = 300
POLL_INTERVAL = 3

def main():
    print("--- Starting Agentic Classification Orchestration ---")
    if not os.path.exists(SCRAPED_PATH):
        print(f"Error: Scraped file not found at {SCRAPED_PATH}")
        sys.exit(1)
        
    with open(SCRAPED_PATH, "r", encoding="utf-8") as f:
        scraped_data = json.load(f)
        
    print(f"Read {len(scraped_data)} reviews from scraped JSON.")
    
    # Write signal file for Antigravity
    signal_data = {
        "status": "pending",
        "timestamp": time.time(),
        "items": scraped_data
    }
    
    # Ensure scratch directory exists
    os.makedirs(os.path.dirname(SIGNAL_PATH), exist_ok=True)
    
    with open(SIGNAL_PATH, "w", encoding="utf-8") as f:
        json.dump(signal_data, f, indent=2, ensure_ascii=False)
        
    print(f"Signal file written to {SIGNAL_PATH}.")
    print("[AGENT_CLASSIFY_REQUEST_CREATED] Waiting for Antigravity to run Classifier subagents...")
    
    # Start polling loop
    start_time = time.time()
    while time.time() - start_time < TIMEOUT_SECONDS:
        # Check if output is written AND signal file is deleted by Antigravity
        if os.path.exists(CLASSIFIED_PATH) and not os.path.exists(SIGNAL_PATH):
            print("\nSuccess: Classification output detected!")
            
            # Double check output validity
            try:
                with open(CLASSIFIED_PATH, "r", encoding="utf-8") as f:
                    classified_data = json.load(f)
                print(f"Successfully classified {len(classified_data)} reviews using 2 subagents!")
                sys.exit(0)
            except Exception as e:
                print(f"Warning: Classified file detected but failed to parse: {e}")
                
        time.sleep(POLL_INTERVAL)
        print(".", end="", flush=True)
        
    print("\nError: Polling timed out waiting for Antigravity to classify reviews.")
    sys.exit(1)

if __name__ == "__main__":
    main()
