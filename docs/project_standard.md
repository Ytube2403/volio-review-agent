# Project Standard

This document defines the standard operating shape of the Volio Review Agent
project.

## Purpose

The project helps an agent reply to app reviews in Volio Apps Publisher by using
existing saved templates. It is not a free-text reply generator.

The system must:

- Scrape visible reviews from the intended Volio app/filter.
- Classify each review into a known intent.
- Validate intent, template, folder, and guardrail rules before sending.
- Drive the browser through Kimi WebBridge.
- Log every decision and every live UI action.
- Reconcile the final UI state against execution logs.

## Non-Goals

- No generated custom reply text.
- No editing saved template contents.
- No bypassing the Volio UI.
- No bulk sending without validation.
- No claiming success from tool exit status alone.

## Main Components

### Python Controller

File: `tools/volio_review_agent.py`

Responsibilities:

- App-scoped paths under `apps\<app>\logs`.
- Kimi WebBridge calls.
- Browser tab binding through `find_tab` and `navigate`.
- Injection of `tools/volio_review_agent.js`.
- Scrape, validate, reply, export, and reconciliation orchestration.

### Browser Agent

File: `tools/volio_review_agent.js`

Responsibilities:

- Inspect visible review cards.
- Match classified rows to cards.
- Open reply UI.
- Select saved templates.
- Confirm selected reply text.
- Send messages.
- Export execution rows and reconciliation state.

### Rules

File: `review_rules.json`

Responsibilities:

- Intent definitions.
- Template aliases.
- Template folder mapping.
- Guardrail and validation policy.

### Analysis

File: `tools/analyze_log.py`

Responsibilities:

- Read batch CSV files.
- Summarize sent, skipped, failed, and blocked rows.
- Read validation outputs.
- Read reconciliation outputs.
- Write `review_log_analysis.json`.

## Required Documentation

Canonical agent-facing documentation is written in English.

- `README.md`: entrypoint and command index.
- `docs/project_standard.md`: project standard and architecture.
- `docs/setup.md`: setup, bridge verification, first run, and detailed usage.
- `docs/home_server.md`: clone, verify, schedule, and continuously operate the project on a home server.
- `docs/volio_review_agent_sop.md`: daily workflow.
- `docs/kimi_bridge_troubleshooting.md`: bridge and tab binding diagnostics.
- `docs/data_contract.md`: file and field contracts.
- `docs/agent_checklist.md`: short checklist for each run.
- `docs/reconciliation_loop_plan.md`: detailed implementation plan and historical context.
- `docs/vi/`: short Vietnamese summaries for design/product readers only.

Vietnamese files under `docs/vi/` are explanatory companion documents. They are
not the source of truth for agent behavior.

Current Vietnamese companion documents:

- `docs/vi/project_overview.md`
- `docs/vi/workflow_summary.md`

## Directory Standard

Use app-scoped logs:

```text
apps\<app>\logs
```

Do not use root-level `logs` as the main pipeline output location.

Common app names:

- `control_widget`
- `bugzz`
- `fake_call`
- `smart_view`
- `ar_filter`
- `charging_animation`
- `compass`
- `vpn`

Runtime logs under `apps\<app>\logs` are local state and must not be committed.
They can contain review content, URLs, and execution traces.

## Command Standard

Use PowerShell from `D:\Kimi`.

Prefer:

```powershell
npm.cmd test
python tools\volio_review_agent.py --app <app> ...
```

Avoid assuming that another shell uses the same path rules.

## Kimi WebBridge Standard

The daemon endpoint is:

```text
http://127.0.0.1:10086/command
```

Each command body must include:

- `action`
- `args`
- `session`

Session rules:

- One task uses one stable session name.
- Before `evaluate`, bind a tab using `find_tab` or `navigate`.
- Use `active:true` when the user says the visible Chrome tab is the target.
- Treat HTTP 502 response bodies as diagnostic information.
- `session has no tab` means the session is unbound, not that the daemon is down.

## Safety Standard

Live sending is allowed only after:

- Scrape output exists.
- Classification output exists.
- Validation output exists.
- Human gate passes.
- Browser tab is confirmed to be the intended app/filter.

Stop immediately if:

- The browser tab is wrong.
- The app ID is wrong.
- The page has no cards when cards are expected.
- Template selection is ambiguous.
- Send completion is not confirmed.
- Reconciliation shows unapproved leftovers.

## Quality Gates

Before shipping code or docs changes:

```powershell
npm.cmd test
node --check tools/volio_review_agent.js
node --check tools/classify_reviews.js
python -B -m py_compile tools/check_bridge.py tools/volio_review_agent.py tools/analyze_log.py
```

For docs-only changes, at least verify:

- Markdown files are readable.
- Commands point to existing files.
- Links point to existing docs.
- No mojibake is introduced.

## Definition Of Done For A Live Batch

A live batch is done only when:

- `reviews_scraped.json` reflects the intended app/filter.
- `reviews_classified.json` exists.
- `reviews_classified_validation.json` is clean or approved.
- Execution CSV exists for each processed page.
- `final_execution_log.json` exists.
- `leftover_visible_reviews.json` exists.
- `review_log_analysis.json` exists.
- The final status reports sent, skipped, failed, blocked, and leftover counts.
