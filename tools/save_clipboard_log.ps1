$ErrorActionPreference = "Stop"

$logDir = Join-Path (Split-Path -Parent $PSScriptRoot) "logs"
if (-not (Test-Path -LiteralPath $logDir)) {
  New-Item -ItemType Directory -Path $logDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$target = Join-Path $logDir "review-batch-$timestamp.csv"
$content = Get-Clipboard -Raw

if ([string]::IsNullOrWhiteSpace($content)) {
  throw "Clipboard is empty. Run await VolioReviewAgent.copyLog() in the browser first."
}

Set-Content -LiteralPath $target -Value $content -Encoding UTF8
Write-Host "Saved review batch log to $target"
