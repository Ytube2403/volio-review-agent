# Volio Review Agent

Browser-side helper for selecting and sending Volio App Publisher review reply templates.

## Files

- `review_rules.json`: editable intent-to-template rules, including verified template folder mappings from `D:\Kimi\Review`.
- `tools/volio_review_agent.js`: self-contained script to run inside the Volio browser page.
- `tests/review_classifier.test.js`: classifier coverage for the risky template choices.
- `docs/volio_review_agent_sop.md`: operational SOP for AI agents running the recurring task.

## Browser Usage

Open the Volio Review Feed page with the target app/filter already selected:

- tab: `No replies`
- rating filter: `1`, `2`, `3`
- page size: `50`

Load the agent script in the page context through Kimi Bridge, Chrome DevTools Console, or any DOM-injection flow:

```js
// Paste the contents of tools/volio_review_agent.js first.
await VolioReviewAgent.dryRun({ maxReviews: 5 });
```

Convenience helper on Windows:

```powershell
.\tools\copy_agent_to_clipboard.ps1
```

Then paste the clipboard content into the Volio page console or inject it through Kimi Bridge.

Recommended staged run for script-only use:

```js
// 1. Classify only. No clicks.
await VolioReviewAgent.dryRun({ maxReviews: 5 });

// 2. Select templates for the current page, but do not send.
await VolioReviewAgent.selectOnly({ maxReviews: 50 });

// 3. Send every selected reply with a 15 second gap.
await VolioReviewAgent.sendSelected({ sendDelayMs: 15000 });
```

For live Chrome/Codex operation, prefer the SOP in `docs/volio_review_agent_sop.md`: process one review at a time, send it, wait for the reply box to disappear, then continue. Do not keep multiple reply boxes open.

One-shot mode:

```js
await VolioReviewAgent.selectThenSend({
  maxReviews: 50,
  sendDelayMs: 15000,
  minConfidence: 0.62
});
```

Export the batch log:

```js
VolioReviewAgent.downloadLog();
// or
await VolioReviewAgent.copyLog();
```

To save a copied log under `D:\Kimi\logs`:

```powershell
.\tools\save_clipboard_log.ps1
```

## Safety Rules

- The script does not click `Rewrite with AI`.
- The script does not type custom reply text.
- Reviews with low confidence are skipped.
- The selected decision includes a `folder` field so hidden templates can be picked from the correct `Saved Replies` folder.
- Sending stops if a send action does not appear to complete after the delay.
- When controlling Chrome directly, cancel any open reply box before switching to another review.

## Test

```powershell
npm.cmd test
```
