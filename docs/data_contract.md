# Data Contract

This document defines the files and fields that the Volio Review Agent expects.

## App Log Folder

All pipeline outputs must be app-scoped:

```text
apps\<app>\logs
```

Example:

```text
apps\control_widget\logs
```

## Pipeline Files

### Scrape Output

```text
reviews_scraped.json
```

Expected item fields:

- `username`
- `rating`
- `reviewDate`
- `reviewLanguage`
- `originalText`
- `translatedText`
- `pageUrl`
- `pageNumber`

### Classification Output

```text
reviews_classified.json
```

Each item should preserve the scrape fields and add a `decision` object.

Expected `decision` fields:

- `intent`
- `template`
- `folder`
- `confidence`
- `status`
- `reason`
- `evidence_terms`
- `needs_human_review`
- `guardrail_flags`

### Validation Outputs

```text
reviews_classified.validated.json
reviews_classified_validation.json
review_issue_summary.json
```

Expected validation fields:

- `validation_status`
- `validation_warnings`
- `validation_errors`
- `template_aliases`
- `selected_template_button_text`

### Execution Outputs

```text
review-batch-page<N>-<timestamp>.csv
reconciliation-page<N>-<timestamp>.json
final_execution_log.json
leftover_visible_reviews.json
```

Required execution row fields:

- `batch_id`
- `timestamp`
- `page_url`
- `review_identity`
- `review_index`
- `username`
- `rating`
- `review_language`
- `review_text`
- `review_original_text`
- `review_translated_text`
- `classification_text_source`
- `detected_intent`
- `template`
- `folder`
- `template_aliases`
- `confidence`
- `status`
- `reason`
- `guardrail_flags`
- `validation_status`
- `validation_warnings`
- `validation_errors`
- `selected_reply_text`
- `selected_template_button_text`
- `matched_card_username`
- `matched_card_rating`
- `matched_card_text`
- `match_score`
- `error`

Allowed execution statuses:

- `sent`
- `skipped_uncertain`
- `skipped_already_replied`
- `blocked`
- `failed`

### Analysis Output

```text
review_log_analysis.json
```

Required summary fields:

- `execution_summary`
- `classified_summary`
- `reconciliation_summary`

## Leftover Contract

`leftover_visible_reviews.json` should follow this shape:

```json
{
  "app": "control_widget",
  "generated_at": "2026-06-29T00:00:00+07:00",
  "pages_checked": [1],
  "summary": {
    "visible_no_reply_count": 0,
    "leftover_count": 0,
    "retryable_leftover_count": 0,
    "silent_skip_count": 0
  },
  "items": []
}
```

If `leftover_count` is greater than zero, each item must explain:

- `page_number`
- `review_identity`
- `username`
- `rating`
- `review_original_text`
- `reason`
- `retryable`
- `suggested_action`

## Pass/Fail Gates

Validation passes only when:

- No validation errors.
- No unresolved warnings.
- No selected row has guardrail flags.

Execution passes only when:

- Every sent row has `selected_reply_text`.
- Every failed row has `error`.
- Reconciliation is clean or explicitly approved.

Analysis passes only when:

- `review_log_analysis.json` exists.
- `leftover_count` is zero or approved.
- There are no silent skips.
