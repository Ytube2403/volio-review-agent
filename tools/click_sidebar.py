import json
import urllib.request
import urllib.error
import time

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

def click_sidebar():
    code = """
    (async function() {
        // Find Review Feed link in sidebar
        const link = Array.from(document.querySelectorAll("li")).find(el => {
            const text = (el.innerText || el.textContent || "").trim();
            return text === "Review Feed";
        });
        
        if (!link) return { error: "Review Feed link not found" };
        
        link.click();
        await new Promise(r => setTimeout(r, 3000));
        return { success: true, urlAfterClick: window.location.href };
    })()
    """
    res = send_command('evaluate', { "code": code })
    print("Click result:", json.dumps(res.get('data', {}).get('value'), indent=2, ensure_ascii=False))

if __name__ == "__main__":
    click_sidebar()
