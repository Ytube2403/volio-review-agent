import argparse
import csv
import json
from collections import Counter
from pathlib import Path


ROOT = Path(str(__file__).replace("\\", "/")).resolve().parents[1]
LOGS = ROOT / "apps" / "control_widget" / "logs"


def read_csv_rows(paths):
    rows = []
    for path in paths:
        with path.open("r", encoding="utf-8-sig", newline="") as f:
            for row in csv.DictReader(f):
                row["_source"] = path.name
                rows.append(row)
    return rows


def latest_batch():
    batches = list(LOGS.glob("review-batch-*.csv"))
    if not batches:
        return []
    batches.sort(key=lambda p: p.stat().st_mtime)
    latest_file = batches[-1]
    latest_mtime = latest_file.stat().st_mtime
    # Group all files modified within 10 minutes (600s) of the latest file
    return [b for b in batches if abs(b.stat().st_mtime - latest_mtime) < 600]


def split_flags(value):
    return [item for item in str(value or "").split("|") if item]


def summarize_rows(rows):
    status = Counter(row.get("status") for row in rows)
    intents = Counter(row.get("detected_intent") for row in rows if row.get("detected_intent"))
    templates = Counter(row.get("template") for row in rows if row.get("template"))
    folders = Counter(row.get("folder") for row in rows if row.get("folder"))
    errors = Counter(row.get("error") for row in rows if row.get("error"))
    flags = Counter(flag for row in rows for flag in split_flags(row.get("guardrail_flags")))

    sent_rows = [row for row in rows if row.get("status") == "sent"]
    failed_rows = [row for row in rows if row.get("status") == "failed"]
    risky_sent = [
        {
            "source": row.get("_source"),
            "review_index": row.get("review_index"),
            "username": row.get("username"),
            "rating": row.get("rating"),
            "intent": row.get("detected_intent"),
            "template": row.get("template"),
            "guardrail_flags": row.get("guardrail_flags"),
            "review_text": row.get("review_text"),
        }
        for row in sent_rows
        if row.get("guardrail_flags")
    ]

    return {
        "total_rows": len(rows),
        "status_counts": dict(status),
        "sent_count": len(sent_rows),
        "failed_count": len(failed_rows),
        "intent_counts": dict(intents),
        "template_counts": dict(templates),
        "folder_counts": dict(folders),
        "error_counts": dict(errors),
        "guardrail_flag_counts": dict(flags),
        "risky_sent": risky_sent,
    }


def summarize_classified():
    path = LOGS / "reviews_classified.validated.json"
    if not path.exists():
        path = LOGS / "reviews_classified.json"
    if not path.exists():
        return {}

    data = json.loads(path.read_text(encoding="utf-8"))
    issue_counts = Counter()
    skipped = 0
    blocked = 0
    warnings = Counter()
    for item in data:
        decision = item.get("decision") or {}
        status = decision.get("status")
        validation_status = decision.get("validation_status")
        intent = decision.get("intent")
        if validation_status == "blocked":
            blocked += 1
        elif status in ("skipped", "skipped_uncertain") or intent == "skipped_uncertain":
            skipped += 1
        elif intent:
            issue_counts[intent] += 1
        for warning in decision.get("validation_warnings") or []:
            warnings[warning] += 1

    return {
        "source": path.name,
        "total_items": len(data),
        "issue_counts": dict(issue_counts),
        "skipped_count": skipped,
        "blocked_count": blocked,
        "validation_warning_counts": dict(warnings),
    }


def summarize_reconciliation():
    path = LOGS / "leftover_visible_reviews.json"
    if not path.exists():
        return {}
    
    try:
        with path.open("r", encoding="utf-8") as f:
            data = json.load(f)
        
        items = data.get("items") or []
        reasons = Counter(item.get("reason") for item in items if item.get("reason"))
        
        return {
            "source": path.name,
            "generated_at": data.get("generated_at"),
            "pages_checked": data.get("pages_checked"),
            "visible_no_reply_count": data.get("summary", {}).get("visible_no_reply_count", 0),
            "leftover_count": data.get("summary", {}).get("leftover_count", 0),
            "retryable_leftover_count": data.get("summary", {}).get("retryable_leftover_count", 0),
            "silent_skip_count": data.get("summary", {}).get("silent_skip_count", 0),
            "leftover_by_reason": dict(reasons)
        }
    except Exception as e:
        print(f"Error reading leftover file: {e}")
        return {}

def main():
    global LOGS
    parser = argparse.ArgumentParser(description="Analyze Volio review reply logs")
    parser.add_argument("--all", action="store_true", help="Analyze all review-batch CSV files")
    parser.add_argument("--app", default="control_widget", help="App folder name under apps/")
    parser.add_argument("--output", help="Output JSON report path")
    args = parser.parse_args()

    LOGS = ROOT / "apps" / args.app / "logs"
    output_path = Path(args.output) if args.output else LOGS / "review_log_analysis.json"

    paths = sorted(LOGS.glob("review-batch-*.csv")) if args.all else latest_batch()
    report = {
        "mode": "all" if args.all else "latest",
        "batch_files": [path.name for path in paths],
        "execution_summary": summarize_rows(read_csv_rows(paths)) if paths else {},
        "classified_summary": summarize_classified(),
        "reconciliation_summary": summarize_reconciliation(),
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(report, indent=2, ensure_ascii=False))
    print(f"Saved analysis report to: {output_path}")


if __name__ == "__main__":
    main()
