import json
import urllib.request
import urllib.error

BRIDGE_URL = "http://127.0.0.1:10086/command"
SESSION_NAME = "volio-reviews-python-inspector"

def send_command(action, args):
    payload = {
        "action": action,
        "args": args,
        "session": SESSION_NAME
    }
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        BRIDGE_URL,
        data=data,
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req, timeout=10) as response:
        return json.loads(response.read().decode('utf-8'))

def inspect():
    find_res = send_command('find_tab', {
        "url": "https://apps-publisher.volio.vn/reviews-feed",
        "active": True
    })
    print("Inspection:")
    print(json.dumps(find_res, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    inspect()
