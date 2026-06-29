# Kimi Bridge Troubleshooting

Use this guide when Antigravity or another agent cannot control the browser
through Kimi WebBridge.

## Important Model

Kimi WebBridge has two layers:

1. Daemon layer: `kimi-webbridge.exe` listens on `127.0.0.1:10086`.
2. Browser layer: the Chrome extension connects to the daemon and exposes tabs.

The daemon can be healthy while the current session has no tab. In that case
`evaluate` fails even though the bridge is reachable.

## Known Good State

Healthy evidence:

- `Test-NetConnection 127.0.0.1 -Port 10086` succeeds.
- `kimi-webbridge.exe` is running.
- `list_tabs` returns JSON.
- Daemon log shows extension connected.
- `find_tab` can bind the intended Volio tab.
- `snapshot` or `evaluate` can read the page after binding.

## Common Failure Signatures

### Session Has No Tab

Response:

```text
HTTP 502 Bad Gateway
session "<name>" has no tab - navigate or find_tab first
```

Meaning:

- The daemon is reachable.
- The session is not bound to a tab.
- The fix is to call `find_tab` or `navigate` in the same session, then retry.

### Stale Tab

Daemon log:

```text
[session] <session>: stale tab <id> in payload, removing from session
```

Meaning:

- The tab ID stored by the bridge is no longer valid.
- Chrome may have restored, suspended, reloaded, or closed the tab.

Fix:

1. Activate the intended Chrome tab.
2. Call `find_tab` again with `active:true`.
3. Confirm the `app_id`.
4. Retry the operation.

### Extension Disconnects

Daemon log:

```text
[ws] extension disconnected
[ws] extension connected
```

Meaning:

- The Chrome extension reconnected.
- Existing session/tab bindings may be stale.

Fix:

- Re-bind the tab.
- Do not continue with old `tabId` assumptions.

### Wrong App ID

Symptom:

- Bridge reads a Volio tab, but the URL contains a different `app_id` than expected.

Fix:

- Stop.
- Navigate or activate the correct tab.
- Re-run `find_tab`.
- Confirm `location.href` before scrape or send.

## Diagnostic Commands

Run from PowerShell.

Check port:

```powershell
Test-NetConnection -ComputerName 127.0.0.1 -Port 10086 | Format-List ComputerName,RemotePort,TcpTestSucceeded
```

Check process:

```powershell
Get-Process | Where-Object { $_.ProcessName -match 'kimi|chrome|Antigravity' } | Select-Object Id,ProcessName,Path
```

Check listener:

```powershell
Get-NetTCPConnection -LocalPort 10086
```

List bridge tabs:

```powershell
python tools\list_tabs.py
```

Bind visible Volio tab:

```powershell
python tools\check_url.py
```

Read current page after binding:

```powershell
python tools\check_bridge.py
```

If `check_bridge.py` cannot bind a tab, activate the intended Chrome tab or
navigate to the Volio reviews feed, then rerun it.

## Correct Request Pattern

Every bridge command must include the same session for one task:

```json
{
  "action": "find_tab",
  "args": {
    "url": "https://apps-publisher.volio.vn/reviews-feed",
    "active": true
  },
  "session": "volio-reviews-control-widget"
}
```

Then use the same session for `evaluate`:

```json
{
  "action": "evaluate",
  "args": {
    "code": "(() => ({ href: location.href, title: document.title, ready: document.readyState }))()"
  },
  "session": "volio-reviews-control-widget"
}
```

## Do Not Misdiagnose

Do not say "Antigravity cannot connect to Kimi Bridge" when:

- `list_tabs` works.
- The daemon log shows command calls.
- The error says `session has no tab`.

Say instead:

```text
Kimi Bridge is reachable, but the agent session is not bound to a live tab.
```

## Recovery Procedure

1. Keep the intended Volio tab visible and active.
2. Run `python tools\check_url.py`.
3. Confirm the returned `url` has the intended `app_id`.
4. Run `python tools\list_tabs.py`.
5. If the tab is correct, rerun the original pipeline command.
6. If the tab is wrong, navigate the visible Chrome tab to the correct URL and repeat.

Only restart the bridge manually if the port is not listening or the process is
missing.
