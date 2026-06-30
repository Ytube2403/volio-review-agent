# Volio Review Agent

Automation toolkit for scraping, classifying, validating, and replying to
reviews in Volio Apps Publisher with saved reply templates.

This project is intentionally conservative: it uses existing templates, logs
each decision, and requires validation before any live reply run.

## Start Here

Read these files in order:

1. [Project Standard](docs/project_standard.md) - scope, architecture, rules, and definitions of done.
2. [Setup Guide](docs/setup.md) - machine setup, bridge verification, first run, and usage details.
3. [Home Server Operations](docs/home_server.md) - clone, verify, schedule, and run continuous review work safely.
4. [Operating SOP](docs/volio_review_agent_sop.md) - the daily scrape/classify/validate/reply/analyze workflow.
5. [Kimi Bridge Troubleshooting](docs/kimi_bridge_troubleshooting.md) - how to diagnose Antigravity/Kimi WebBridge tab issues.
6. [Data Contract](docs/data_contract.md) - expected files, JSON fields, log fields, and pass/fail gates.
7. [Agent Checklist](docs/agent_checklist.md) - short checklist for each Antigravity or Codex run.

The older implementation plan is kept at
[Reconciliation Loop Plan](docs/reconciliation_loop_plan.md).

Agent-facing documentation is canonical in English. Human-facing Vietnamese
summaries for design/product readers live under `docs/vi/` and must not be used
as the source of truth for automation behavior.

Vietnamese summaries:

- [Project Overview](docs/vi/project_overview.md)
- [Workflow Summary](docs/vi/workflow_summary.md)

## Repository Layout

- `tools/volio_review_agent.py` - Python controller for browser orchestration and file outputs.
- `tools/volio_review_agent.js` - browser-side helper injected into the Volio page.
- `tools/agent_classify.py` - LLM subagents classification orchestrator for Control Widget.
- `tools/classify_reviews.js` - rule-based fallback classifier from scraped reviews to classified JSON.
- `tools/analyze_log.py` - summarizes batch, validation, and reconciliation logs.
- `review_rules.json` - intent, template, alias, and folder rules.
- `apps/README.md` - explains app-scoped runtime folders and local logs.
- `apps/<app>/logs/` - local-only scrape, classification, validation, execution, and analysis outputs.
- `tests/*.test.js` - classifier and reconciliation unit tests.

## Standard Pipeline

Run from `D:\Kimi` in PowerShell.

```powershell
python tools\volio_review_agent.py --app control_widget --scrape --scrape-pages 1 --url "<volio-reviews-feed-url>"
```

Then classify `apps\control_widget\logs\reviews_scraped.json` into
`reviews_classified.json` with the LLM subagents mechanism:

```powershell
python tools\agent_classify.py
```

This writes `scratch\classify_request.json`, waits for Antigravity
`ReviewClassifier` subagents to classify chunks semantically against
`review_rules.json` and `review_templates.md`, then expects the merged
`apps\control_widget\logs\reviews_classified.json` output. Use
`node tools\classify_reviews.js control_widget` only as an offline fallback or
for regression comparison.

Generic positive `User Love` replies are distributed across the approved
`User Love`, `User Love - Warm`, `User Love - Share`, and
`User Love - Engage` variants during validation to avoid excessive repetition.

Validate before any live reply:

```powershell
python tools\volio_review_agent.py --app control_widget --validate-classified
```

Only execute after validation is clean:

```powershell
python tools\volio_review_agent.py --app control_widget --reply-from-classified --reply-pages 1 --url "<volio-reviews-feed-url>"
python tools\analyze_log.py --app control_widget --all
```

## Safety Rules

- Do not click `Rewrite with AI`.
- Do not type custom reply text.
- Do not send rows with validation errors, warnings, or guardrail flags unless explicitly approved.
- Do not treat a successful template match as a successful send. Wait for real UI completion.
- Do not declare a batch complete until `tools/analyze_log.py` has been run and reconciliation is clean.
- If Kimi Bridge returns HTTP 502, read the response body before assuming the daemon is down.

## Kimi WebBridge Rule

The bridge daemon can be healthy while a session has no browser tab. Before any
`evaluate`, the controller or agent must bind a tab with `find_tab` or
`navigate` in the same session.

Healthy bridge evidence:

- Port `127.0.0.1:10086` is listening.
- `list_tabs` returns JSON.
- The daemon log shows extension connection, for example `hello from extension v1.10.0`.

Common failure:

```text
HTTP 502: session "<name>" has no tab - navigate or find_tab first
```

This is a stale or unbound session, not a dead daemon.

See [Kimi Bridge Troubleshooting](docs/kimi_bridge_troubleshooting.md) for the
full diagnostic flow.

## Verification

```powershell
npm.cmd test
node --check tools/volio_review_agent.js
node --check tools/classify_reviews.js
python -B -m py_compile tools/check_bridge.py tools/volio_review_agent.py tools/analyze_log.py tools/agent_classify.py
```
