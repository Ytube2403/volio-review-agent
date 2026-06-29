import os
import glob
import csv
import json
import argparse
from datetime import datetime
from pathlib import Path

ROOT_DIR = str(Path(str(__file__).replace("\\", "/")).resolve().parents[1])

def generate_report(app_name):
    app_dir = os.path.join(ROOT_DIR, "apps", app_name)
    logs_dir = os.path.join(app_dir, "logs")
    
    # Find all batch CSV files
    csv_files = glob.glob(os.path.join(logs_dir, "review-batch-*.csv"))
    # Sort files by creation/modified time or timestamp in name to process oldest first
    csv_files.sort(key=os.path.getmtime)
    
    unique_reviews = {}
    
    for filepath in csv_files:
        with open(filepath, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                review_id = row.get('review_identity') or f"{row.get('username')}|{row.get('review_text')}"
                if not review_id or review_id == "|":
                    continue
                
                # If we already have a record for this review
                if review_id in unique_reviews:
                    existing = unique_reviews[review_id]
                    # If existing is already 'sent', we keep it as 'sent'
                    if existing.get('status') == 'sent':
                        # Keep existing sent status but update other fields if this row is newer and also sent
                        if row.get('status') == 'sent':
                            unique_reviews[review_id] = row
                        continue
                
                unique_reviews[review_id] = row

    # Now write the final unique reviews list
    output_csv = os.path.join(logs_dir, "final_execution_log.csv")
    output_json = os.path.join(logs_dir, "final_execution_log.json")
    
    if not unique_reviews:
        print(f"No execution logs found under {logs_dir} to merge.")
        return
        
    # Get headers from the first record
    headers = list(next(iter(unique_reviews.values())).keys())
    
    with open(output_csv, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        for row in unique_reviews.values():
            writer.writerow(row)
            
    # Also save as JSON for easy reading
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(list(unique_reviews.values()), f, indent=2, ensure_ascii=False)
        
    # Print summary statistics
    sent_count = sum(1 for r in unique_reviews.values() if r.get('status') == 'sent')
    skipped_count = sum(1 for r in unique_reviews.values() if r.get('status') == 'skipped_uncertain' or r.get('status') == 'skipped')
    failed_count = sum(1 for r in unique_reviews.values() if r.get('status') == 'failed')
    
    print(f"Total Unique Reviews Processed: {len(unique_reviews)}")
    print(f"  Sent: {sent_count}")
    print(f"  Skipped (Uncertain/Emoji): {skipped_count}")
    print(f"  Failed/Unresolved: {failed_count}")
    
    # Detail on failures
    failures = {}
    for r in unique_reviews.values():
        if r.get('status') == 'failed':
            err = r.get('error') or 'unknown_error'
            failures[err] = failures.get(err, 0) + 1
            
    print("\nFailure Reason Breakdown:")
    for err, count in failures.items():
        print(f"  - {err}: {count}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate final review reply report")
    parser.add_argument("--app", default="control_widget", help="App folder name under apps/")
    args = parser.parse_args()
    generate_report(args.app)
