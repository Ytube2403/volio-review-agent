# App Runtime Folders

The controller writes app-scoped runtime state under:

```text
apps/<app>/logs/
```

These logs are intentionally ignored by Git because they can contain review
content, URLs, execution traces, and local investigation data.

Use a stable app folder name for each Volio app, for example:

```text
apps/control_widget/logs/
apps/vpn/logs/
apps/bugzz/logs/
```

The folders are created automatically by `tools/volio_review_agent.py`,
`tools/agent_classify.py`, and `tools/classify_reviews.js` when you run the
pipeline.

For Control Widget, classification normally uses the LLM subagents mechanism:

```text
tools/agent_classify.py
scratch/classify_request.json
apps/control_widget/logs/reviews_classified.json
```

`tools/classify_reviews.js` is kept as a rule-based fallback and comparison
tool.

If an app needs custom classification rules, add:

```text
apps/<app>/review_rules.json
```

Otherwise the project uses the root `review_rules.json`.
