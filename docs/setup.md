# Setup Guide

This guide explains how to prepare a machine, verify the browser bridge, and run
the Volio Review Agent pipeline safely.

Canonical agent-facing documentation is written in English. Vietnamese files in
`docs/vi/` are human summaries only.

## 1. Prerequisites

Required:

- Windows with PowerShell.
- Google Chrome with access to Volio Apps Publisher.
- Kimi WebBridge daemon and Chrome extension.
- Python available from PowerShell.
- Node.js and npm.
- Project checkout at `D:\Kimi`.

Recommended:

- Keep one visible Chrome window for Volio work.
- Keep only the intended Volio `Reviews Feed` tab active during live reply runs.
- Use one app at a time for live replies.

## 2. First Health Check

Open PowerShell in the project root:

```powershell
cd D:\Kimi
```

Check project files:

```powershell
Get-ChildItem
```

Expected important files:

```text
README.md
package.json
review_rules.json
tools\volio_review_agent.py
tools\volio_review_agent.js
docs\volio_review_agent_sop.md
```

Install Node dependencies if needed:

```powershell
npm.cmd install
```

Run tests:

```powershell
npm.cmd test
```

Run syntax checks:

```powershell
node --check tools\volio_review_agent.js
node --check tools\classify_reviews.js
python -B -m py_compile tools/check_bridge.py tools/volio_review_agent.py tools/analyze_log.py tools/agent_classify.py
```

## 3. Kimi WebBridge Setup

The bridge endpoint is:

```text
http://127.0.0.1:10086/command
```

Check whether the port is listening:

```powershell
Test-NetConnection -ComputerName 127.0.0.1 -Port 10086 | Format-List ComputerName,RemotePort,TcpTestSucceeded
```

Check processes:

```powershell
Get-Process | Where-Object { $_.ProcessName -match 'kimi|chrome|Antigravity' } | Select-Object Id,ProcessName,Path
```

Start the daemon if it is not running:

```powershell
& "$env:USERPROFILE\.kimi-webbridge\bin\kimi-webbridge.exe" start
```

Do not restart or stop the daemon during a live send unless you intentionally
want to interrupt browser automation.

## 4. Browser And Volio Setup

In Chrome:

1. Open Volio Apps Publisher.
2. Log in if needed.
3. Open `Reviews Feed`.
4. Select the target app.
5. Use the intended filter, usually `No replies`.
6. Use the intended rating filter and page size.
7. Keep this tab visible and active.

Copy the full URL from the address bar. It should look like:

```text
https://apps-publisher.volio.vn/reviews-feed?app_id=<APP_ID>&sort_by=newestFirst&reply=noReply&page=1&size=50
```

Important:

- Confirm the `app_id`.
- Confirm `reply=noReply` when running no-reply batches.
- Confirm the page number before scrape or reply.

## 5. Bind And Verify The Browser Tab

Before any browser automation, bind the bridge session to the intended tab.

Quick URL inspection:

```powershell
python tools\check_url.py
```

Full bridge health check:

```powershell
python tools\check_bridge.py
```

Expected result:

- `find_tab` returns `success: true`.
- `href` is the intended Volio URL.
- `ready` is `complete`.
- `hasAgent` is `true` after injection has happened, or can be `false` before
  the page agent is injected.

If you see:

```text
session "<name>" has no tab
```

the daemon is reachable, but the session is not bound to a tab. Activate the
intended Chrome tab and run the check again.

## 6. App Folder Setup

Logs are app-scoped:

```text
apps\<app>\logs
```

Examples:

```text
apps\control_widget\logs
apps\bugzz\logs
apps\fake_call\logs
```

The app folder is selected with:

```powershell
--app <app_folder_name>
```

If an app has custom rules, place them at:

```text
apps\<app>\review_rules.json
```

Otherwise the pipeline uses:

```text
review_rules.json
```

## 7. Standard Pipeline

Set variables in PowerShell for readability:

```powershell
$APP = "control_widget"
$URL = "https://apps-publisher.volio.vn/reviews-feed?app_id=<APP_ID>&sort_by=newestFirst&reply=noReply&page=1&size=50"
```

### Step 1: Scrape

```powershell
python tools\volio_review_agent.py --app $APP --scrape --scrape-pages 1 --url $URL
```

Expected output:

```text
apps\<app>\logs\reviews_scraped.json
```

Check the scraped file before classification. It should contain the intended
reviews from the intended app/filter.

When a `reviews-feed` URL includes `start_date` or `end_date`, treat that date
range as part of the batch identity. The controller should navigate again if
the visible tab has a different date range, even when `app_id`, page, and reply
filter already match.

### Step 2: Classify

For Control Widget, use the LLM subagents classification orchestrator:

```powershell
python tools\agent_classify.py
```

Input:

```text
apps\control_widget\logs\reviews_scraped.json
review_rules.json
review_templates.md
```

Output:

```text
apps\control_widget\logs\reviews_classified.json
```

Mechanism:

1. `tools\agent_classify.py` writes `scratch\classify_request.json`.
2. Antigravity detects the pending signal.
3. Antigravity splits reviews into chunks and runs parallel `ReviewClassifier`
   subagents.
4. Subagents classify by semantic intent using original text, translated text,
   `review_rules.json`, and `review_templates.md`.
5. Antigravity merges the chunks, writes `reviews_classified.json`, and deletes
   `scratch\classify_request.json`.

Ads classification handles common `ad`/`add` typo noise, but feature-add
phrases such as `please add`, `can you add`, or `add more` are explicitly
excluded from ads matching so they can remain feature requests.

For generic positive praise, subagents may choose `User Love`,
`User Love - Warm`, `User Love - Share`, or `User Love - Engage`. Validation also
deterministically rebalances generic `User Love` selections across this group
by `review_identity` so a batch does not repeat the same positive reply too
often.

The rule-based classifier remains available only as an offline fallback or
comparison tool:

```powershell
node tools\classify_reviews.js $APP
```

If the fallback is used, explicitly mention that in the final run report. A
human or agent may review or refine `reviews_classified.json`, but it must
preserve the data contract before validation.

Each classified item should preserve the scraped review fields and include a
`decision` object with:

- `intent`
- `template`
- `folder`
- `confidence`
- `status`
- `reason`
- `evidence_terms`
- `guardrail_flags`
- `classification_text_source`
- `classification_method`

Each classified item should also include or preserve top-level
`review_identity` when available. For LLM subagents, the merger generates
`review_identity` with the same identity algorithm used by the browser agent.

### Step 3: Validate

```powershell
python tools\volio_review_agent.py --app $APP --validate-classified
```

Expected outputs:

```text
apps\<app>\logs\reviews_classified.validated.json
apps\<app>\logs\reviews_classified_validation.json
apps\<app>\logs\review_issue_summary.json
```

Do not continue to live reply if validation has unapproved errors, warnings, or
guardrail flags.

### Step 4: Live Reply

Run only after validation is clean or explicitly approved.

```powershell
python tools\volio_review_agent.py --app $APP --reply-from-classified --reply-pages 1 --url $URL
```

Expected outputs:

```text
apps\<app>\logs\review-batch-page<N>-<timestamp>.csv
apps\<app>\logs\reconciliation-page<N>-<timestamp>.json
apps\<app>\logs\final_execution_log.json
apps\<app>\logs\leftover_visible_reviews.json
```

Rules during live reply:

- Process one app at a time.
- Do not run multiple live reply agents against the same Chrome session.
- Keep the intended Volio tab active.
- Stop if the app ID, filter, or visible page changes unexpectedly.

### Step 5: Analyze

```powershell
python tools\analyze_log.py --app $APP --all
```

Expected output:

```text
apps\<app>\logs\review_log_analysis.json
```

A batch is complete only when:

- validation is clean or approved,
- sent rows have selected reply text,
- failed rows have actionable errors,
- reconciliation has no unapproved leftovers.

## 8. Dry Run And Smoke Checks

Browser-side dry run:

```powershell
python tools\volio_review_agent.py --app $APP --dry-run --max-reviews 5 --url $URL
```

This injects the browser agent and classifies visible reviews without sending.

Bridge-only check:

```powershell
python tools\check_bridge.py
```

List known bridge tabs:

```powershell
python tools\list_tabs.py
```

## 9. Parallel Work Policy

Safe to run in parallel:

- classification for multiple apps,
- validation for multiple apps,
- analysis for multiple apps,
- log auditing.

Do not run live reply in parallel with the current setup. Live reply shares:

- one Chrome session,
- one Kimi WebBridge daemon,
- one Chrome extension connection,
- one Volio login session.

Run live reply sequentially by app.

For a home-server loop, see [Home Server Operations](home_server.md).

## 10. Common Setup Failures

### Port 10086 Is Closed

Start Kimi WebBridge:

```powershell
& "$env:USERPROFILE\.kimi-webbridge\bin\kimi-webbridge.exe" start
```

Then verify:

```powershell
Test-NetConnection -ComputerName 127.0.0.1 -Port 10086
```

### HTTP 502: Session Has No Tab

Meaning:

- The daemon is reachable.
- The current session is not bound to a browser tab.

Fix:

```powershell
python tools\check_url.py
python tools\check_bridge.py
```

Make sure the intended Chrome tab is visible and active.

### Wrong App ID

Stop immediately. Copy the correct Volio URL and rerun from scrape or from the
last safe checkpoint.

### Empty Visible Reviews

Check:

- Volio tab is active and awake.
- Filter is correct.
- Page has loaded.
- Chrome extension is connected.
- `find_tab` returns the expected URL.

### Validation Blocks Live Reply

Open:

```text
apps\<app>\logs\reviews_classified_validation.json
apps\<app>\logs\review_issue_summary.json
```

Fix classification or rules, then validate again.

### Analyze Shows Leftovers

Open:

```text
apps\<app>\logs\leftover_visible_reviews.json
apps\<app>\logs\review_log_analysis.json
```

Do not report the batch as complete until leftovers are resolved, skipped with
approved reasons, or explicitly accepted.

## 11. Setup Definition Of Done

Setup is complete when:

- `npm.cmd test` passes.
- Python compile check passes.
- Kimi WebBridge listens on `127.0.0.1:10086`.
- `python tools\check_bridge.py` can bind and read the intended Volio tab.
- Scrape can write `reviews_scraped.json` for one page.
- Validate can read a classified file and write validation outputs.
- The operator understands that live reply must run sequentially by app.
