# Home Server Operations

This guide describes how to run the Volio Review Agent continuously on a home
server while keeping live browser replies safe and sequential.

## Operating Model

The project is source-controlled, but review data is local runtime state.

Commit and push:

- source code under `tools/`
- tests under `tests/`
- canonical docs under `docs/`
- root rules in `review_rules.json`

Do not commit:

- `apps/<app>/logs/`
- screenshots
- scratch scripts
- copied review text dumps

The home server should clone the repository, create its own app logs, and keep
those logs local.

## Clone And Verify

```powershell
git clone https://github.com/<owner>/volio-review-agent.git D:\Kimi
cd D:\Kimi
npm.cmd install
npm.cmd run verify
```

If `npm.cmd run verify` is not available, run the checks directly:

```powershell
npm.cmd test
node --check tools\volio_review_agent.js
node --check tools\classify_reviews.js
python -B -m py_compile tools\check_bridge.py tools\volio_review_agent.py tools\analyze_log.py
```

## Required Long-Running Services

Keep these running on the home server:

- Chrome, logged into Volio Apps Publisher.
- Kimi WebBridge daemon on `127.0.0.1:10086`.
- Kimi WebBridge Chrome extension connected to the same Chrome profile.
- A visible Volio `Reviews Feed` tab for the app currently being processed.

Check the bridge:

```powershell
python tools\check_bridge.py
```

## Per-App Pipeline

Set app and URL variables:

```powershell
$APP = "control_widget"
$URL = "https://apps-publisher.volio.vn/reviews-feed?app_id=<APP_ID>&sort_by=newestFirst&reply=noReply&page=1&size=50"
```

Scrape:

```powershell
python tools\volio_review_agent.py --app $APP --scrape --scrape-pages 1 --url $URL
```

Classify with the local rule-based classifier:

```powershell
node tools\classify_reviews.js $APP
```

Validate:

```powershell
python tools\volio_review_agent.py --app $APP --validate-classified
```

Reply:

```powershell
python tools\volio_review_agent.py --app $APP --reply-from-classified --reply-pages 1 --url $URL
```

Analyze:

```powershell
python tools\analyze_log.py --app $APP --all
```

## Continuous Loop Policy

Safe to run concurrently:

- scrape planning for different apps,
- rule-based classification,
- validation,
- log analysis.

Run live reply sequentially. Do not run two live reply processes against the
same Chrome profile, Volio login, Kimi WebBridge daemon, or visible browser tab.

Recommended loop:

1. Pick one app.
2. Open its Volio `Reviews Feed` tab.
3. Run scrape.
4. Run classification.
5. Run validation.
6. If validation is clean, run live reply.
7. Run analysis.
8. Move to the next app.

## Windows Task Scheduler

Use Task Scheduler only for non-live or supervised loops unless the browser is
kept visible and stable.

Recommended task settings:

- Run only when the operator account is logged on.
- Start in `D:\Kimi`.
- Stop the task if it runs longer than the expected batch window.
- Do not start a new instance if the previous instance is still running.

Example action:

```text
Program/script: powershell.exe
Arguments: -NoProfile -ExecutionPolicy Bypass -File D:\Kimi\tools\run_one_app.ps1
Start in: D:\Kimi
```

Create `tools\run_one_app.ps1` locally on the home server when you know the
exact app URL and schedule. Keep local scheduler scripts out of Git if they
contain private app IDs or operational timing.

## Failure Handling

Stop the loop immediately if:

- `check_bridge.py` cannot bind the intended tab,
- the visible URL has the wrong `app_id`,
- validation reports errors or guardrail flags,
- live reply reports ambiguous template selection,
- reconciliation reports unapproved leftovers.

After a failure, inspect:

```text
apps/<app>/logs/reviews_classified_validation.json
apps/<app>/logs/review_issue_summary.json
apps/<app>/logs/final_execution_log.json
apps/<app>/logs/leftover_visible_reviews.json
apps/<app>/logs/review_log_analysis.json
```
