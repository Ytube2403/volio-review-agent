# Volio Review Agent SOP

This is the operating procedure for agents that process reviews in Volio Apps
Publisher. It is the main runbook for day-to-day work.

## Core Rules

- Work only on the Volio `Reviews Feed` tab for the target app.
- Default scope: `No replies`, ratings `1`, `2`, `3`, page size `50`.
- Use saved reply templates only.
- Never click `Rewrite with AI`.
- Never type or edit custom reply content.
- Never send a row that has validation errors, unresolved warnings, or guardrail flags.
- Stop the batch if UI state is ambiguous.
- Every run must leave enough logs for audit.

## Preflight

1. Confirm the visible Chrome tab is the intended Volio app/filter.
2. Confirm Kimi WebBridge is reachable.
3. Bind the bridge session to the current tab with `find_tab` before `evaluate`.
4. Confirm the page URL contains the intended `app_id`.
5. Confirm the app log folder is correct, for example `apps\control_widget\logs`.

Quick tab check:

```powershell
python tools\check_url.py
python tools\list_tabs.py
```

If the bridge fails, use
[Kimi Bridge Troubleshooting](kimi_bridge_troubleshooting.md) before continuing.

## Workflow

### 1. Scrape

```powershell
python tools\volio_review_agent.py --app control_widget --scrape --scrape-pages 1 --url "<volio-reviews-feed-url>"
```

Required output:

```text
apps\control_widget\logs\reviews_scraped.json
```

Check before continuing:

- URL is the intended app.
- `reply=noReply` or the UI filter is `No replies`.
- Page count is intentional.
- Scraped rows match the visible review feed.

### 2. Classify

Classify from:

```text
apps\control_widget\logs\reviews_scraped.json
```

Write:

```text
apps\control_widget\logs\reviews_classified.json
```

#### LLM Subagents Classification Mechanism:
1. **Signal File Creation**: Script local `tools/agent_classify.py` reads `reviews_scraped.json`, writes a signal file `scratch/classify_request.json`, and polls.
2. **Parallel Subagents**: Antigravity detects the signal, splits the reviews list into chunks (e.g., Part 1 and Part 2), and spawns **2 parallel `ReviewClassifier` subagents** to perform semantic LLM classification against `review_rules.json` and `review_templates.md`.
3. **Semantic LLM Rules**:
   - LLM reads original text and translation to understand the real intent of the user.
   - For example, a 5-star review requesting content (e.g. "Messi widget") is correctly classified as `feature_request` (Content Suggestion template) rather than generic `five_star` templates.
4. **Merger & Identity Hashing**: Antigravity merges the chunks, hashes each review with **FNV-1a 64-bit** (`username + rating + reviewDate + reviewLanguage + normalizedText`) to generate `review_identity` for Chrome extension synchronization, writes to `reviews_classified.json`, and deletes the signal file.

Run:

```powershell
python tools\agent_classify.py
```

Use `node tools\classify_reviews.js control_widget` only as an offline fallback
or comparison tool. If fallback classification is used for a live batch, report
that explicitly before validation and in the final status.

Classification rules:

- Use original review text as the main signal.
- Use translated text only as supporting evidence.
- Prefer specific intent over general sentiment.
- Skip uncertain, very short, or ambiguous reviews.
- Do not force a template just to reduce leftovers.
- Do not generate custom reply text. LLM subagents only choose known intents and
  saved templates from `review_rules.json`.

High-priority intent order:

1. Privacy or permission concern.
2. Virus, scam, malware, or security warning.
3. Paywall, premium, purchase, subscription, or locked feature.
4. Ads complaint.
5. Technical issue.
6. Performance issue.
7. Usage help.
8. Feature request.
9. Missing content.
10. Positive low rating.
11. General negative.
12. Need details or skipped uncertain.

### 3. Validate

```powershell
python tools\volio_review_agent.py --app control_widget --validate-classified
```

Required outputs:

```text
apps\control_widget\logs\reviews_classified.validated.json
apps\control_widget\logs\reviews_classified_validation.json
apps\control_widget\logs\review_issue_summary.json
```

Hard stop conditions:

- Any validation error.
- Any unresolved validation warning.
- Any selected row with guardrail flags.
- Any selected row whose intent does not match the review text.
- Any row where the selected template is outside the allowed alias group.

### 4. Human Gate

Before live execution, inspect:

```text
apps\control_widget\logs\reviews_classified_validation.json
apps\control_widget\logs\review_issue_summary.json
```

Proceed only when:

- `error_count` is `0`.
- `warning_count` is `0`, unless each warning has explicit approval.
- No selected row has guardrail flags.
- Skipped rows have clear reasons.

### 5. Execute

```powershell
python tools\volio_review_agent.py --app control_widget --reply-from-classified --reply-pages 1 --url "<volio-reviews-feed-url>"
```

Execution rules:

- Process only the current page scope.
- Keep only one reply box open at a time.
- If a reply box or template dialog is wrong, cancel before continuing.
- After `Send Message`, wait for real UI completion.
- Stop if the send state cannot be confirmed.
- Stop if the current tab changes to the wrong app/filter.

Expected outputs:

```text
apps\control_widget\logs\review-batch-page<N>-<timestamp>.csv
apps\control_widget\logs\reconciliation-page<N>-<timestamp>.json
apps\control_widget\logs\final_execution_log.json
apps\control_widget\logs\leftover_visible_reviews.json
```

### 6. Analyze

```powershell
python tools\analyze_log.py --app control_widget --all
```

Required output:

```text
apps\control_widget\logs\review_log_analysis.json
```

A batch is complete only when:

- Sent rows have selected reply text.
- Failed rows have actionable reasons.
- `leftover_count == 0`, or every leftover is explicitly approved as blocked/skipped.
- There are no silent skips.

## Template Selection Rules

- A template must be allowed by `review_rules.json`.
- A template must exist in the expected UI folder.
- Alias rotation is allowed only inside the same intent family.
- Ads templates must not be used for privacy, virus, paywall, or crash reports.
- Positive ads templates are only for high-rating or clearly positive reviews that mention ads.
- Technical issue templates must not be replaced by positive templates.
- `Positive Low Rating` is only for low-rating reviews that are clearly positive and do not report a problem.

## Failure Handling

- `session has no tab`: bind with `find_tab` or `navigate`, then retry once.
- `stale tab`: click or activate the intended Chrome tab, then run `find_tab` again.
- Wrong `app_id`: stop and use the correct URL.
- Empty visible cards: stop and confirm the tab is awake and the filter is correct.
- Template dialog fails: cancel, log failure, and do not keep clicking.
- Send confirmation fails: stop the batch and inspect the UI.
- High `card_not_found`: treat as page-scope or DOM-boundary failure, not as individual review failure.

## Definition Of Done

The run is done only when:

- Scrape, classification, validation, execution, and analysis outputs exist.
- Validation is clean or approved.
- Reconciliation is clean or approved.
- The final answer reports sent, skipped, failed, blocked, and leftover counts.
