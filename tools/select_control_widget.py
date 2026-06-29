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

def select_control_widget():
    # Find existing tab
    find_res = send_command('find_tab', {
        "url": "https://apps-publisher.volio.vn/reviews-feed",
        "active": True
    })
    print("Found tab:", find_res)
    
    code = """
    (async function() {
        function simulateClick(el) {
            el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
            el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
            el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            el.click();
        }

        // Close any open dialogs first
        const cancelBtn = Array.from(document.querySelectorAll("button")).find(el => (el.innerText || "").trim() === "Cancel");
        if (cancelBtn) {
            console.log("Found open dialog. Clicking Cancel...");
            simulateClick(cancelBtn);
            await new Promise(r => setTimeout(r, 1000));
        }

        // Find APP trigger button specifically (has class w-80)
        const trigger = document.querySelector("button.w-80[data-slot='dropdown-menu-trigger']") || 
                        Array.from(document.querySelectorAll("button[data-slot='dropdown-menu-trigger']")).find(el => {
                            const text = el.innerText || "";
                            return text.includes("Fake Call") || text.includes("Control Widget") || el.classList.contains("w-80");
                        });
        if (!trigger) return { success: false, error: "App dropdown trigger button not found" };
        
        // Find search input, click trigger if not found
        let searchInput = document.querySelector("input[placeholder='Search app...']");
        if (!searchInput) {
            console.log("Search input not found. Clicking trigger...");
            simulateClick(trigger);
            await new Promise(r => setTimeout(r, 1000));
            searchInput = document.querySelector("input[placeholder='Search app...']");
        }
        
        if (!searchInput) return { success: false, error: "Search input not found even after click" };
        
        // Typing simulator for React inputs
        async function typeIntoReactInput(inputEl, text) {
            inputEl.focus();
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                inputEl.value = text.slice(0, i + 1);
                
                const keydown = new KeyboardEvent('keydown', { key: char, bubbles: true });
                inputEl.dispatchEvent(keydown);
                
                const input = new Event('input', { bubbles: true });
                const tracker = inputEl._valueTracker;
                if (tracker) {
                    tracker.setValue(text.slice(0, i));
                }
                inputEl.dispatchEvent(input);
                
                const keyup = new KeyboardEvent('keyup', { key: char, bubbles: true });
                inputEl.dispatchEvent(keyup);
                
                await new Promise(r => setTimeout(r, 50));
            }
            const change = new Event('change', { bubbles: true });
            inputEl.dispatchEvent(change);
        }
        
        await typeIntoReactInput(searchInput, "Control Widget");
        await new Promise(r => setTimeout(r, 2000));
        
        // Find options matching "Control Widget"
        const options = Array.from(document.querySelectorAll("[role='menuitem'], [role='option'], .ant-select-item-option")).filter(el => {
            const text = (el.innerText || el.textContent || "").trim();
            return text.includes("Control Widget");
        });
        
        if (options.length === 0) {
            return {
                success: false,
                error: "Control Widget option not found after full typing simulation",
                currentOptions: Array.from(document.querySelectorAll("[role='menuitem']")).map(el => el.innerText)
            };
        }
        
        // Click the option
        const targetOption = options[0];
        console.log("Clicking option:", targetOption.innerText);
        simulateClick(targetOption);
        
        await new Promise(r => setTimeout(r, 3000));
        return { success: true, newUrl: window.location.href, app: document.querySelector("button.w-80[data-slot='dropdown-menu-trigger']").innerText };
    })()
    """
    res = send_command('evaluate', { "code": code })
    print("Result:", json.dumps(res.get('data', {}).get('value'), indent=2, ensure_ascii=False))

if __name__ == "__main__":
    select_control_widget()
