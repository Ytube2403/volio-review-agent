$ErrorActionPreference = "Stop"

$scriptPath = Join-Path $PSScriptRoot "volio_review_agent.js"
if (-not (Test-Path -LiteralPath $scriptPath)) {
  throw "Cannot find $scriptPath"
}

$content = Get-Content -Raw -LiteralPath $scriptPath -Encoding UTF8
Set-Clipboard -Value $content
Write-Host "Copied VolioReviewAgent script to clipboard."
Write-Host "Paste it into the Volio page console or inject it through Kimi Bridge."
