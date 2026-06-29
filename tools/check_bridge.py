import urllib.request
import json
import urllib.error

BRIDGE_URL = "http://127.0.0.1:10086/command"

def send_command(action, args):
    payload = {
        "action": action,
        "args": args,
        "session": "check-bridge-session"
    }
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        BRIDGE_URL,
        data=data,
        headers={'Content-Type': 'application/json'}
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')
        print(f"HTTP error from Kimi WebBridge: {e.code} {e.reason}")
        print(body)
        return None
    except Exception as e:
        print(f"Error connecting to Kimi WebBridge: {e}")
        return None

find_res = send_command('find_tab', {
    "url": "https://apps-publisher.volio.vn/reviews-feed",
    "active": True
})
print("Find tab result:")
print(json.dumps(find_res, indent=2))

if not find_res or not find_res.get("ok") or not find_res.get("data", {}).get("success"):
    print("No active Volio tab is bound. Activate the intended Chrome tab or navigate to the Volio reviews feed first.")
    raise SystemExit(1)

res = send_command('evaluate', {
    "code": "(() => ({ href: location.href, title: document.title, ready: document.readyState, hasAgent: !!window.VolioReviewAgent }))()"
})
print("Result:")
print(json.dumps(res, indent=2))
