# Agent Checklist

Use this checklist at the start and end of every Antigravity or Codex run.

## Start

- [ ] I am in `D:\Kimi`.
- [ ] I know the target app folder, for example `control_widget`.
- [ ] I know the exact Volio `reviews-feed` URL.
- [ ] The visible Chrome tab is the intended app/filter.
- [ ] The page is on `No replies`.
- [ ] The page size and rating filters are intentional.
- [ ] Kimi WebBridge is running on `127.0.0.1:10086`.
- [ ] I have called `find_tab` or `navigate` before any `evaluate`.
- [ ] The bridge-visible `app_id` matches the intended app.

## Before Sending

- [ ] `reviews_scraped.json` exists.
- [ ] Classification used the intended path: LLM subagents for Control Widget, or explicitly reported fallback.
- [ ] If LLM subagents were used, `scratch\classify_request.json` was deleted after merge.
- [ ] `reviews_classified.json` exists.
- [ ] `reviews_classified_validation.json` exists.
- [ ] Validation error count is zero.
- [ ] Validation warning count is zero or explicitly approved.
- [ ] No selected row has guardrail flags.
- [ ] Ambiguous reviews are skipped, blocked, or approved.
- [ ] The browser tab is still the intended Volio page.

## During Sending

- [ ] Only one reply box is open.
- [ ] I do not click `Rewrite with AI`.
- [ ] I do not type custom text.
- [ ] I cancel before switching away from a bad dialog or wrong card.
- [ ] I verify selected reply text before sending.
- [ ] I wait for real UI completion after sending.
- [ ] I stop on wrong app, wrong filter, empty card list, or stale tab.

## After Sending

- [ ] Page CSV log exists.
- [ ] Reconciliation JSON exists.
- [ ] `final_execution_log.json` exists.
- [ ] `leftover_visible_reviews.json` exists.
- [ ] `python tools\analyze_log.py --app <app> --all` has been run.
- [ ] `review_log_analysis.json` exists.
- [ ] Sent, skipped, failed, blocked, and leftover counts are reported.
- [ ] Batch is not called complete unless leftovers are zero or approved.

## If Bridge Fails

- [ ] Read the HTTP response body.
- [ ] If it says `session has no tab`, bind the tab again.
- [ ] If it says stale tab, activate the intended Chrome tab and bind again.
- [ ] If port 10086 is down, start Kimi WebBridge.
- [ ] If the wrong app ID appears, stop and correct the URL/tab.
