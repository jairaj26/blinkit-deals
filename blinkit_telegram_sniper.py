"""
Blinkit Deal Sniper - Headless Telegram Bot Automation
=========================================================
Runs completely in the background without opening any visible window or browser.
Scans Blinkit for steep clearance discounts (>=80% OFF) and alerts via Telegram Bot.

Features:
- Permanently Saved in Windows Task Scheduler: Registers directly via PowerShell.
- Missed Runs Catch-Up (StartWhenAvailable): If your PC was turned off during
  any scan time, Windows will automatically execute the missed scan as soon as powered on.
- Battery / Laptop Safe: Configured with AllowStartIfOnBatteries & DontStopIfGoingOnBatteries.
- 100% Silent (pythonw.exe): No command prompt window or terminal will ever pop up.
- Deduplication & 7-Day Cooloff Rule:
    * Sends new deals on Day 1.
    * If an item remains at the same discount, suppresses it for 7 days.
    * If the discount increases or price drops, alerts immediately.
- Clean 3-line format per deal, combined into batched Telegram messages.
- Scans all 50 essential categories in ~18 seconds.

Usage:
    python blinkit_telegram_sniper.py --now             # Run scan & send deals to Telegram now
    python blinkit_telegram_sniper.py --test-telegram   # Send a test message to your Telegram bot
    python blinkit_telegram_sniper.py --install-task    # Register hourly background schedule in Windows (:10)
    python blinkit_telegram_sniper.py --status-task     # Check Windows Task Scheduler status
    python blinkit_telegram_sniper.py --remove-task     # Remove scheduled task
    python blinkit_telegram_sniper.py --reset-history   # Reset deals history tracking database
"""

import sys
import os
import time
import json
import re
import argparse
import subprocess
import urllib.request
import urllib.parse
from datetime import datetime, date, timedelta

# Safely handle Windows console encoding
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

# ==============================================================================
# Configuration & Environment
# ==============================================================================

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_FILE = os.path.join(SCRIPT_DIR, ".env")
# Also check blinkit-bot/.env if present
BOT_DIR_ENV = os.path.join(SCRIPT_DIR, "blinkit-bot", ".env")
HISTORY_FILE = os.path.join(SCRIPT_DIR, "blinkit_deals_history.json")
TASK_NAME = "BlinkitTelegramSniper"

def load_env():
    """Load settings from .env file without external dependencies."""
    config = {
        "TELEGRAM_BOT_TOKEN": "",
        "TELEGRAM_CHAT_ID": "",
        "MIN_DISCOUNT": 80,
        "BLINKIT_LAT": "13.0388595",
        "BLINKIT_LON": "77.60125099999999",
        "BLINKIT_COOKIE": ""
    }

    target_env = ENV_FILE if os.path.exists(ENV_FILE) else (BOT_DIR_ENV if os.path.exists(BOT_DIR_ENV) else None)
    if target_env:
        try:
            with open(target_env, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip('"').strip("'")
                    if k in config:
                        if k == "MIN_DISCOUNT":
                            try:
                                config[k] = int(v)
                            except ValueError:
                                pass
                        else:
                            config[k] = v
        except Exception as e:
            print(f"[!] Warning reading .env: {e}")
    return config

CFG = load_env()

def ensure_env_configured():
    """If .env is missing or credentials empty, prompt user interactively when running in a console."""
    global CFG
    if CFG.get("TELEGRAM_BOT_TOKEN") and CFG.get("TELEGRAM_CHAT_ID"):
        return True

    # If running silently or without an interactive terminal, do not prompt
    if not sys.stdin or not sys.stdin.isatty():
        return False

    print("\n" + "=" * 65)
    print("  ⚡ Blinkit Deal Sniper - Quick Configuration (.env)")
    print("=" * 65)
    print("Enter your Telegram credentials (only needed once):\n")

    token = input("1. Enter Telegram Bot Token: ").strip()
    chat_id = input("2. Enter Telegram Chat ID: ").strip()
    lat = input("3. Enter Delivery Latitude [default: 13.0388595]: ").strip() or "13.0388595"
    lon = input("4. Enter Delivery Longitude [default: 77.601251]: ").strip() or "77.60125099999999"
    min_disc = input("5. Enter Minimum Discount % [default: 80]: ").strip() or "80"

    env_content = f"""# Blinkit Deal Sniper Configuration
TELEGRAM_BOT_TOKEN={token}
TELEGRAM_CHAT_ID={chat_id}
BLINKIT_LAT={lat}
BLINKIT_LON={lon}
MIN_DISCOUNT={min_disc}
"""
    with open(ENV_FILE, "w", encoding="utf-8") as f:
        f.write(env_content)

    print(f"\n[OK] Configuration saved to: {ENV_FILE}\n")
    CFG = load_env()
    return bool(token and chat_id)

# 50 Essential Blinkit Categories for high-discount clearance scan
ALL_CATEGORIES = [
    'atta', 'rice', 'dal', 'ghee', 'sweets', 'chocolate', 'cake', 'snacks',
    'dry fruits', 'coffee', 'dairy', 'fruits', 'vegetables', 'grocery', 'oil',
    'masala', 'instant', 'ice cream', 'munchies', 'beverages', 'tea', 'eggs',
    'meat', 'skincare', 'haircare', 'bath', 'oral', 'makeup', 'kitchen',
    'bed', 'home', 'appliances', 'detergents', 'protein', 'stationery', 'premium',
    'biscuits', 'noodles', 'pasta', 'sauces', 'cereal', 'perfume', 'deodorant',
    'cleaning', 'baby', 'pet', 'electronics', 'cookware', 'wellness', 'beauty'
]

# ==============================================================================
# Telegram Delivery
# ==============================================================================

def send_telegram_message(text: str, bot_token: str = None, chat_id: str = None) -> bool:
    """Send a formatted message to Telegram Bot via HTTP API."""
    token = bot_token or CFG["TELEGRAM_BOT_TOKEN"]
    cid = chat_id or CFG["TELEGRAM_CHAT_ID"]

    if not token or not cid:
        print("[!] Telegram credentials missing! Please configure TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env")
        return False

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": cid,
        "text": text,
        "parse_mode": "Markdown",
        "disable_web_page_preview": True
    }

    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            res_json = json.loads(resp.read().decode())
            return res_json.get("ok", False)
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode()
        print(f"[!] Telegram API error ({e.code}): {err_msg}")
        if "can't parse entities" in err_msg.lower():
            try:
                payload.pop("parse_mode", None)
                data = json.dumps(payload).encode("utf-8")
                req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
                with urllib.request.urlopen(req, timeout=15) as resp:
                    return json.loads(resp.read().decode()).get("ok", False)
            except Exception:
                pass
        return False
    except Exception as e:
        print(f"[!] Network error sending to Telegram: {e}")
        return False


def chunk_and_send_deals(deal_items: list, bot_token: str = None, chat_id: str = None) -> int:
    """
    Format deals into exact 3-line blocks separated by \\n\\n,
    chunk them safely within Telegram's 4096 char limit, and send.
    """
    if not deal_items:
        return 0

    deal_blocks = []
    for d in deal_items:
        title = d["name"]
        sp_str = str(int(d["sp"])) if float(d["sp"]).is_integer() else f"{d['sp']:.2f}"
        mrp_str = str(int(d["mrp"])) if float(d["mrp"]).is_integer() else f"{d['mrp']:.2f}"
        disc_str = str(int(d["disc"]))

        block = (
            f"🛍️ {title}\n"
            f"💰 ₹{sp_str} (MRP: ₹{mrp_str}) || {disc_str}% OFF\n"
            f"🔗 [Buy on Blinkit ⚡️]({d['url']})"
        )
        deal_blocks.append(block)

    # Chunk into combined messages <= 3800 chars
    messages = []
    curr_chunk = []
    curr_len = 0
    for block in deal_blocks:
        add_len = len(block) + (2 if curr_chunk else 0)
        if curr_len + add_len > 3800 and curr_chunk:
            messages.append("\n\n".join(curr_chunk))
            curr_chunk = [block]
            curr_len = len(block)
        else:
            curr_chunk.append(block)
            curr_len += add_len
    if curr_chunk:
        messages.append("\n\n".join(curr_chunk))

    sent_count = 0
    for idx, msg in enumerate(messages):
        ok = send_telegram_message(msg, bot_token, chat_id)
        if ok:
            sent_count += 1
            print(f"[OK] Sent Telegram message batch [{idx + 1}/{len(messages)}]")
        else:
            print(f"[!] Failed to send Telegram message batch [{idx + 1}/{len(messages)}]")
        time.sleep(1)

    return sent_count

# ==============================================================================
# Deals History & 7-Day Cooloff State Management
# ==============================================================================

def load_deals_history() -> dict:
    """Load tracking history database."""
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


def save_deals_history(history: dict):
    """Save tracking history database atomically."""
    temp_file = HISTORY_FILE + ".tmp"
    try:
        with open(temp_file, "w", encoding="utf-8") as f:
            json.dump(history, f, indent=2, ensure_ascii=False)
        if os.path.exists(HISTORY_FILE):
            os.remove(HISTORY_FILE)
        os.rename(temp_file, HISTORY_FILE)
    except Exception as e:
        print(f"[!] Failed to save history: {e}")


def filter_deals_with_cooloff(scanned_deals: list, today_str: str = None) -> tuple:
    """
    Applies deduplication and cooloff rules:
    1. Send deals when first seen.
    2. If an item stays at the exact same discount on subsequent scans, suppress it for 7 days.
    3. If the discount increases or price drops, send immediately.
    4. Do not repeat identical sends on the same calendar day.
    """
    if today_str is None:
        today_str = date.today().isoformat()
    today_dt = date.fromisoformat(today_str)

    history = load_deals_history()
    deals_to_send = []

    for item in scanned_deals:
        pid = str(item["id"])
        curr_disc = round(float(item["disc"]))
        curr_price = float(item["sp"])

        record = history.get(pid)

        if not record:
            # Brand new deal discovered
            history[pid] = {
                "first_seen": today_str,
                "last_seen": today_str,
                "last_sent": today_str,
                "last_disc": curr_disc,
                "last_price": curr_price,
                "suppressed_until": None,
                "consecutive_days": 1,
                "title": item["name"]
            }
            deals_to_send.append(item)
            continue

        last_sent = record.get("last_sent")
        last_disc = record.get("last_disc", 0)
        last_price = record.get("last_price", float('inf'))
        suppressed_until = record.get("suppressed_until")

        # Check if discount increased or price dropped
        if curr_disc > last_disc or curr_price < last_price:
            record["last_sent"] = today_str
            record["last_disc"] = curr_disc
            record["last_price"] = curr_price
            record["last_seen"] = today_str
            record["suppressed_until"] = None
            history[pid] = record
            deals_to_send.append(item)
            continue

        # Check if under 7-day suppression
        if suppressed_until:
            try:
                supp_dt = date.fromisoformat(suppressed_until)
                if today_dt < supp_dt:
                    record["last_seen"] = today_str
                    history[pid] = record
                    continue
            except Exception:
                pass

        # If already sent today at this exact price, don't spam
        if last_sent == today_str:
            record["last_seen"] = today_str
            history[pid] = record
            continue

        # If seen on consecutive days at same discount, trigger 7-day suppression
        last_seen = record.get("last_seen")
        if last_seen and last_seen != today_str:
            try:
                last_seen_dt = date.fromisoformat(last_seen)
                if (today_dt - last_seen_dt).days == 1:
                    record["consecutive_days"] = record.get("consecutive_days", 1) + 1
                    if record["consecutive_days"] >= 2:
                        supp_end = today_dt + timedelta(days=7)
                        record["suppressed_until"] = supp_end.isoformat()
                else:
                    record["consecutive_days"] = 1
            except Exception:
                record["consecutive_days"] = 1

        record["last_seen"] = today_str
        history[pid] = record

    save_deals_history(history)
    return deals_to_send, history

# ==============================================================================
# Blinkit API Scraping Engine
# ==============================================================================

def tx(v):
    if isinstance(v, dict):
        return v.get("text", "") or ""
    return str(v) if v is not None else ""

def to_num(s):
    val = tx(s).replace(",", "")
    m = re.search(r"(\d+(?:\.\d+)?)", val)
    return float(m.group(1)) if m else 0.0

def extract_items_from_json(node, out):
    """Recursively traverse Blinkit's layout tree and extract product items."""
    if not node:
        return
    if isinstance(node, list):
        for n in node:
            extract_items_from_json(n, out)
        return
    if isinstance(node, dict):
        d = node.get("data")
        if isinstance(d, dict) and not isinstance(d, list):
            ci = (d.get("atc_action") or {}).get("add_to_cart", {}).get("cart_item") or {}
            name = tx(d.get("name")) or tx(ci.get("display_name")) or tx(ci.get("product_name"))
            price = to_num(d.get("normal_price")) or to_num(ci.get("price"))
            mrp = to_num(d.get("mrp")) or to_num(ci.get("mrp"))

            if name and price:
                if not mrp or mrp < price:
                    mrp = price
                disc = round(((mrp - price) / mrp) * 100) if mrp > 0 else 0
                pid = str(d.get("product_id") or ci.get("product_id") or "")
                slug = re.sub(r"[^a-z0-9]+", "-", str(name).lower()).strip("-") or "item"
                url = f"https://blinkit.com/prn/{slug}/prid/{pid}" if pid else f"https://blinkit.com/s/?q={urllib.parse.quote(name)}"
                brand = tx(d.get("brand_name") or d.get("brand") or ci.get("brand"))

                out.append({
                    "id": pid,
                    "name": str(name).strip(),
                    "brand": brand,
                    "mrp": mrp,
                    "sp": price,
                    "disc": disc,
                    "url": url,
                    "sold_out": d.get("is_sold_out") is True or ci.get("inventory") == 0 or d.get("inventory") == 0
                })
        for k in node:
            extract_items_from_json(node[k], out)


def fetch_category_deals(category: str, lat: str, lon: str, cookie: str = "") -> list:
    """Fetch Page 1 of a keyword/category sorted by discount descending."""
    search_url = f"https://blinkit.com/v1/layout/search?q={urllib.parse.quote(category)}&search_type=type_to_search&page_index=0&offset=0&limit=15&oos_visibility=true&sort=discount_desc"
    headers = {
        "content-type": "application/json",
        "accept": "*/*",
        "accept-language": "en-IN,en-US;q=0.9,en;q=0.8",
        "app_client": "consumer_web",
        "lat": str(lat),
        "lon": str(lon),
        "origin": "https://blinkit.com",
        "referer": "https://blinkit.com/",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    }
    if cookie:
        headers["cookie"] = cookie

    body = json.dumps({
        "query": category,
        "q": category,
        "search_query": category,
        "page_index": 0,
        "offset": 0,
        "limit": 15,
        "oos_visibility": "true",
        "sort": "discount_desc"
    }).encode("utf-8")

    req = urllib.request.Request(search_url, data=body, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            items = []
            extract_items_from_json(data.get("response", data), items)
            return items
    except Exception as e:
        print(f"[!] Warning fetching '{category}': {e}")
        return []


def scan_all_categories() -> list:
    """Scan across all 50 categories and filter by minimum discount."""
    min_disc = int(CFG.get("MIN_DISCOUNT", 80))
    lat = str(CFG.get("BLINKIT_LAT", "13.0388595"))
    lon = str(CFG.get("BLINKIT_LON", "77.60125099999999"))
    cookie = CFG.get("BLINKIT_COOKIE", "")

    all_deals = []
    print(f"[*] Scanning 50 categories at location ({lat}, {lon}) for >={min_disc}% OFF...")

    for idx, cat in enumerate(ALL_CATEGORIES):
        items = fetch_category_deals(cat, lat, lon, cookie)
        cat_deals = 0
        for it in items:
            if it.get("sold_out"):
                continue
            if it["disc"] >= min_disc:
                all_deals.append(it)
                cat_deals += 1

        if cat_deals > 0:
            print(f"    [+] {cat.capitalize()}: {cat_deals} deal(s) found")

        time.sleep(0.3)  # Polite pacing (entire scan ~15-18 seconds)

    # Deduplicate deals across categories by Product ID
    unique_deals = []
    seen_ids = set()
    for d in all_deals:
        if d["id"] and d["id"] not in seen_ids:
            seen_ids.add(d["id"])
            unique_deals.append(d)
        elif not d["id"]:
            unique_deals.append(d)

    unique_deals.sort(key=lambda x: x["disc"], reverse=True)
    return unique_deals

# ==============================================================================
# Windows Task Scheduler Integration
# ==============================================================================

def install_task():
    """Register hourly background schedule in Windows Task Scheduler (:10)."""
    ensure_env_configured()
    script_path = os.path.abspath(__file__)
    python_dir = os.path.dirname(sys.executable)
    pythonw_path = os.path.join(python_dir, "pythonw.exe")
    if not os.path.exists(pythonw_path):
        pythonw_path = sys.executable

    print(f"[*] Registering background scheduled task: {TASK_NAME}")
    print("[*] Schedule: Every 1 Hour at :10 past the hour (e.g. 1:10, 2:10, 3:10)")
    print(f"[*] Executable: {pythonw_path} (100% silent, 0 popups)")

    ps_script = f"""
    $ErrorActionPreference = 'Stop'
    $action = New-ScheduledTaskAction -Execute '{pythonw_path}' -Argument '"{script_path}" --run-now'
    $trigger = New-ScheduledTaskTrigger -Once -At '00:10' -RepetitionInterval (New-TimeSpan -Hours 1) -RepetitionDuration (New-TimeSpan -Days 9999)
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
    Register-ScheduledTask -TaskName '{TASK_NAME}' -Action $action -Trigger $trigger -Settings $settings -Force
    """

    try:
        res = subprocess.run(
            ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", ps_script],
            capture_output=True, text=True, check=False
        )
        if res.returncode == 0:
            print(f"\n[OK] SUCCESS: Background task '{TASK_NAME}' registered successfully!")
            print("    Permanently active in Windows Task Scheduler:")
            print("      • Runs completely hidden via pythonw.exe (0 popups, 0 browser windows)")
            print("      • Executes every hour at :10 (1:10, 2:10, 3:10...)")
            print("      • Missed runs catch-up: Enabled (StartWhenAvailable)")
            print("      • Battery / Laptop safe: Enabled (AllowStartIfOnBatteries)")
            print("\n    - Test immediately with : python blinkit_telegram_sniper.py --now")
            print("    - Test Telegram alert   : python blinkit_telegram_sniper.py --test-telegram")
            print("    - Check status with     : python blinkit_telegram_sniper.py --status-task")
            print("    - Remove anytime with   : python blinkit_telegram_sniper.py --remove-task\n")
        else:
            print(f"[X] Error creating task:\n{res.stderr.strip() or res.stdout.strip()}")
    except Exception as e:
        print(f"[!] Execution failed: {e}")


def remove_task():
    """Remove background scheduled task from Windows Task Scheduler."""
    cmd = ["schtasks", "/delete", "/tn", TASK_NAME, "/f"]
    res = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if res.returncode == 0:
        print(f"[OK] Scheduled task '{TASK_NAME}' removed.")
    else:
        print(f"[!] Task '{TASK_NAME}' was not found or could not be removed.")


def status_task():
    """Query scheduled task status."""
    cmd = ["schtasks", "/query", "/tn", TASK_NAME, "/fo", "LIST", "/v"]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, check=False)
        if res.returncode == 0:
            print(f"[OK] Task '{TASK_NAME}' is currently ACTIVE.\n")
            print("  Schedule: Hourly at :10 past every hour\n")
            for line in res.stdout.splitlines():
                line_str = line.strip()
                if any(line_str.startswith(k) for k in [
                    "TaskName:", "Status:", "Next Run Time:", "Last Run Time:", "Last Result:", "Schedule Type:", "Start Time:"
                ]):
                    print(f"  {line_str}")
        else:
            print(f"[!] Task '{TASK_NAME}' is NOT registered.")
    except Exception as e:
        print(f"[!] Error querying status: {e}")

# ==============================================================================
# Main Workflows
# ==============================================================================

def execute_scan_and_alert():
    """Perform full background scan across 50 categories, apply cooloff, and send to Telegram."""
    print("=" * 65)
    print("  ⚡ Blinkit Deal Sniper - Headless Background Execution")
    print("=" * 65)
    print(f"[*] Execution time: {datetime.now().strftime('%Y-%m-%d %I:%M:%S %p')}")

    scanned_deals = scan_all_categories()
    print(f"\n[*] Total matching clearance deals found: {len(scanned_deals)}")

    if not scanned_deals:
        print("[*] No deals found matching filter threshold currently.")
        return

    deals_to_send, _ = filter_deals_with_cooloff(scanned_deals)
    print(f"[*] Deals eligible to alert (after cooloff/dedup): {len(deals_to_send)}")

    if not deals_to_send:
        print("[*] All deals are either already alerted today or suppressed by the 7-day rule.")
        return

    print("\n[*] Sending deals to Telegram...")
    batches = chunk_and_send_deals(deals_to_send)
    print(f"[OK] Done! Delivered {len(deals_to_send)} deals across {batches} Telegram message(s).")


def test_telegram_alert():
    """Send a test deal to verify Telegram bot setup."""
    ensure_env_configured()
    print("[*] Testing Telegram bot credentials...")
    sample_deal = [{
        "name": "ReeQ Refillable Soap Dispenser (Plastic, Black)",
        "sp": 299,
        "mrp": 1499,
        "disc": 80,
        "url": "https://blinkit.com"
    }]
    count = chunk_and_send_deals(sample_deal)
    if count > 0:
        print("[OK] Test message delivered successfully to your Telegram chat!")
    else:
        print("[!] Test failed. Please check your TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env")


def reset_history():
    """Clear deal history database."""
    if os.path.exists(HISTORY_FILE):
        try:
            os.remove(HISTORY_FILE)
            print("[OK] Deals history reset. All deals will be treated as fresh on next scan.")
        except Exception as e:
            print(f"[!] Could not reset history: {e}")
    else:
        print("[*] Deals history is already empty.")


def main():
    parser = argparse.ArgumentParser(description="Blinkit 80%+ Clearance Deal Sniper")
    parser.add_argument("--now", "--run-now", action="store_true", help="Execute live deal scan and send alerts immediately")
    parser.add_argument("--test-telegram", action="store_true", help="Send a test message to verify Telegram bot setup")
    parser.add_argument("--install-task", action="store_true", help="Register hourly schedule in Windows Task Scheduler")
    parser.add_argument("--status-task", action="store_true", help="Check Windows Task Scheduler status")
    parser.add_argument("--remove-task", action="store_true", help="Remove Windows scheduled task")
    parser.add_argument("--reset-history", action="store_true", help="Reset deals tracking database")

    args = parser.parse_args()

    if args.install_task:
        install_task()
    elif args.remove_task:
        remove_task()
    elif args.status_task:
        status_task()
    elif args.test_telegram:
        test_telegram_alert()
    elif args.reset_history:
        reset_history()
    elif args.now:
        execute_scan_and_alert()
    else:
        # Default behavior when run without arguments: execute scan
        execute_scan_and_alert()

if __name__ == "__main__":
    main()
