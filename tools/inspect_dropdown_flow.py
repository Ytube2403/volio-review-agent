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

def inspect_flow():
    code = """
    (async function() {
        const trigger = document.querySelector("button.w-80[data-slot='dropdown-menu-trigger']");
        if (!trigger) return { error: "Trigger not found" };
        
        function simulateClick(el) {
            el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
            el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
            el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            el.click();
        }
        
        // Open
        simulateClick(trigger);
        await new Promise(r => setTimeout(r, 1000));
        
        const input = document.querySelector("input[placeholder='Search app...']");
        if (!input) return { error: "Input not found after click", ariaExpanded: trigger.getAttribute("aria-expanded") };
        
        // Type with React tracker hack
        function setReactInputValue(inputEl, value) {
            const lastValue = inputEl.value;
            inputEl.value = value;
            const event = new Event('input', { bubbles: true });
            const tracker = inputEl._valueTracker;
            if (tracker) {
                tracker.setValue(lastValue);
            }
            inputEl.dispatchEvent(event);
        }
        
        setReactInputValue(input, "Control Widget");
        await new Promise(r => setTimeout(r, 1500));
        
        const options = Array.from(document.querySelectorAll("[role='menuitem'], [role='option']")).map(el => el.innerText);
        return {
            inputVal: input.value,
            optionsCount: options.length,
            options: options
        };
    })()
    """
    res = send_command('evaluate', { "code": code })
    print("Flow details:", json.dumps(res.get('data', {}).get('value'), indent=2, ensure_ascii=False))

if __name__ == "__main__":
    inspect_flow()
