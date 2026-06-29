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

def inspect_trigger():
    code = """
    (function() {
        const trigger = document.querySelector("button[data-slot='dropdown-menu-trigger']");
        if (!trigger) return { error: "Trigger not found" };
        
        const rect = trigger.getBoundingClientRect();
        return {
            tagName: trigger.tagName,
            className: trigger.className,
            disabled: trigger.disabled,
            rect: {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height
            },
            outerHTML: trigger.outerHTML
        };
    })()
    """
    res = send_command('evaluate', { "code": code })
    print("Trigger details:", json.dumps(res.get('data', {}).get('value'), indent=2, ensure_ascii=False))

if __name__ == "__main__":
    inspect_trigger()
