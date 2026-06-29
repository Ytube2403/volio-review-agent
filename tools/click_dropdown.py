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

def inspect_dropdown():
    code = """
    (async function() {
        const inputs = Array.from(document.querySelectorAll("input"));
        const parentOfOption = document.querySelector("[role='menu']");
        
        return {
            inputsCount: inputs.length,
            inputs: inputs.map(el => ({
                tag: el.tagName,
                className: el.className,
                placeholder: el.placeholder,
                outerHTML: el.outerHTML
            })),
            parentScroll: parentOfOption ? {
                scrollHeight: parentOfOption.scrollHeight,
                clientHeight: parentOfOption.clientHeight,
                className: parentOfOption.className
            } : null
        };
    })()
    """
    res = send_command('evaluate', { "code": code })
    print("Dropdown Inspection:", json.dumps(res.get('data', {}).get('value'), indent=2, ensure_ascii=False))

if __name__ == "__main__":
    inspect_dropdown()
