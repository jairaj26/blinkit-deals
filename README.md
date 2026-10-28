# ⚡ Blinkit Deal Hunter & Scout Suite (v3.6)

> **Scout hidden clearance deals (60% to 90%+ OFF), search any grocery item by highest discount, or run an automated 24/7 background Telegram deal bot right from your PC!**

This repository contains two complete tools:
1. **🌐 1-Click Browser Bookmarklet**: Works directly inside your browser on [blinkit.com](https://blinkit.com) (Desktop & Mobile) — no extensions or app downloads required!
2. **🤖 Blinkit Deal Sniper (Python Windows Tasker & Telegram Bot)**: Permanently registered in Windows Task Scheduler, runs 100% silently in the background via `pythonw.exe` every hour at `:10`, catches up missed runs on boot, and alerts your Telegram chat or channel.

---

## 📑 Table of Contents
- [🌐 Part 1: 1-Click Bookmarklet (for Browsers)](#-part-1-1-click-bookmarklet-for-browsers)
  - [What is a Bookmarklet?](#what-is-a-bookmarklet)
  - [💻 Desktop Setup (PC & Mac)](#-desktop-setup-pc--mac)
  - [📱 Mobile Setup (Android Chrome & iOS Safari)](#-mobile-setup-android-chrome--ios-safari)
  - [How to Use the Deal Hunter](#how-to-use-the-deal-hunter)
  - [Bookmarklet Features at a Glance](#bookmarklet-features-at-a-glance)
- [🤖 Part 2: Automated Telegram Deal Bot (80%+ Clearance)](#-part-2-automated-telegram-deal-bot-80-clearance)
  - [⚡ Option A: Windows Background Tasker (Recommended - Same as BigBasket)](#-option-a-windows-background-tasker-recommended)
  - [⚙️ Option B: Advanced GitHub Actions Setup](#️-option-b-advanced-github-actions-setup)
- [🛡️ Anti-Rate-Limit & Performance Architecture](#️-anti-rate-limit--performance-architecture)
- [📄 License](#-license)

---

## 🌐 Part 1: 1-Click Bookmarklet (for Browsers)

### What is a Bookmarklet?
A bookmarklet is a simple browser bookmark that contains a lightweight script instead of a web link. When you click it while browsing [blinkit.com](https://blinkit.com), it opens an interactive Deal Hunter drawer right inside your page.

---

### 💻 Desktop Setup (PC & Mac)

#### Option A: 1-Click Drag & Drop (Easiest)
1. Open the installation portal:  
   👉 **[https://jairaj26.github.io/blinkit-deals/](https://jairaj26.github.io/blinkit-deals/)**
2. Show your browser bookmarks bar:
   - **Windows / Linux**: Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd>
   - **Mac**: Press <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd>
3. Click and drag the green **"⚡ Blinkit Deals"** button directly up onto your bookmarks bar.
4. Go to **[blinkit.com](https://blinkit.com)** and make sure your delivery address/location is set.
5. Click your new **"⚡ Blinkit Deals"** bookmark. The floating launcher circle appears immediately at the bottom-right!

#### Option B: Manual Bookmark Creation (Zero External Requests)
If you prefer an offline self-contained bookmark without external network calls:
1. Copy the full code from **[bookmarklet.txt](bookmarklet.txt)** (or click "Copy Code" under the Standalone section on the [Web Portal](https://jairaj26.github.io/blinkit-deals/)).
2. In your browser, create a new bookmark and name it `Blinkit Deals`.
3. Paste the copied code into the **URL** (or Location) field and save it.

---

### 📱 Mobile Setup (Android Chrome & iOS Safari)

Mobile browsers do not allow dragging bookmarks, but you can set it up in 60 seconds using the official ultra-compact mobile loader:

```javascript
javascript:(function(){const s=document.createElement('script');s.src='https://jairaj26.github.io/blinkit-deals/blinkit-deals.min.js?t='+Date.now();document.head.appendChild(s);})();
```

#### Step-by-Step Mobile Instructions:
1. Open **[https://jairaj26.github.io/blinkit-deals/](https://jairaj26.github.io/blinkit-deals/)** on your phone's browser.
2. Tap the **📋 Copy Mobile Bookmarklet** button.
3. Bookmark *any* web page on your phone (e.g. tap the Chrome 3-dots menu $\to$ ⭐ Star, or Safari Share $\to$ Add Bookmark) and name it **`Blinkit Deals`**.
4. Open your browser's **Bookmarks** list, tap **Edit** on `Blinkit Deals`, delete the existing website address, and **paste** the code you copied in Step 2. Save it.
5. Open **[blinkit.com](https://blinkit.com)**.
6. Tap the browser address bar, type `Blinkit Deals`, and tap the bookmark suggestion that appears. The floating green deal button will appear on your screen!

---

### How to Use the Deal Hunter

1. **Open the Drawer**: Click or tap the floating green button at the bottom-right of the Blinkit screen.
2. **⚡ Mega Scout (50 Categories)**: Click **"Scan All Deals"** to fetch Page 1 across 50 core product categories sorted strictly by highest discount.
3. **🎯 1-Click Popular Chips**: Tap any chip (`Atta`, `Rice`, `Dal`, `Ghee`, `Sweets`, `Chocolate`, `Snacks`, `Dry Fruits`, etc.) to instantly find the biggest discounts for that keyword.
4. **Category Multi-Select**: Pick any category to automatically select its subcategories (or customize your selection) and view all top deals aggregated together.
5. **Quick Filters**: Use the top filter pills to isolate items with **25%+**, **40%+**, or deep **60%+** clearance discounts, or hide out-of-stock products.
6. **Export**: On desktop, click **Export CSV** to download all scraped deals into a spreadsheet.

---

### Bookmarklet Features at a Glance

| Feature | Details |
| :--- | :--- |
| **Floating Launcher** | Discreet green circle button floating above the cart button with minimize and close controls |
| **⚡ 50-Category Mega Scout** | 1-Click scan fetching Page 1 of 50 essential categories, deduplicating and sorting all top deals |
| **Category Multi-Select** | Select a category to auto-select all subcategories; easily toggle individual subcategories |
| **1-Click Popular Chips** | 15 instant search pills (`Atta`, `Rice`, `Dal`, `Ghee`, `Sweets`, `Chocolate`, `Dry Fruits`, etc.) |
| **Server-Side Sort & Cutoff** | Fetches backend results sorted by `discount_desc` with an automatic 59% early-exit cutoff |
| **60%+ Clearance Chip** | Dedicated 60%+ filter chip in the results toolbar targeting deep clearance bargains |
| **Early Cancel Recovery** | Stopping mid-scan gracefully preserves and displays all deals collected so far |
| **Clickable Cards** | Every product card and list item links directly to its product page on Blinkit |
| **Stacked Discount Badges** | Clean 2-line badges (`54%` / `Off`) with color-coded discount tiers |
| **Responsive Grid & Table** | 5-column desktop grid, 3-column mobile grid, and zero-overflow mobile list table |
| **Dual Session Cache** | Zero wasted network calls when revisiting previous searches or categories |

---

## 🤖 Part 2: Automated Telegram Deal Bot (80%+ Clearance)

An automated background worker that scans Blinkit every hour, hunts down steep clearance bargains ($\ge 80\%$ OFF), and sends clean, batched alerts directly to your Telegram chat or channel.

### Deal Format
Combines deals into clean, compact messages (up to 12 items per message) separated by double line breaks—no photo clutter or notification spam:
```text
🛍️ ReeQ Refillable Soap Dispenser (Plastic, Black)
💰 ₹299 (MRP: ₹1,499) || 80% OFF
🔗 [Buy on Blinkit ⚡️](https://blinkit.com/prn/reeq-refillable-soap-dispenser-plastic-black/prid/740968)
```

---

### ⚡ Option A: Windows Background Tasker (Recommended)

Just like the BigBasket automation, this runs completely natively on your Windows PC with **zero external webhooks, zero runner daemons, and zero open command windows**.

#### Key Advantages:
* **Permanently Saved in Windows Task Scheduler**: Registers directly via PowerShell. Windows manages the schedule across reboots, sleep mode, and shutdowns.
* **Missed Runs Catch-Up (`StartWhenAvailable`)**: If your PC was turned off during any scheduled scan time (e.g. PC off at 1:10 PM, turned on at 1:35 PM), Windows automatically executes the missed scan as soon as your PC powers on.
* **Battery / Laptop Safe**: Configured with `AllowStartIfOnBatteries` and `DontStopIfGoingOnBatteries` so it runs reliably even if your laptop is unplugged.
* **100% Silent (`pythonw.exe`)**: Executes via the background Python worker (`pythonw.exe`). No command prompt window, no terminal, and no browser window ever pops up or disrupts your screen.
* **Zero RAM Wasted**: Between hourly runs, the bot uses **0 MB RAM**. It wakes up at `:10`, checks 50 categories in ~18 seconds, sends Telegram alerts, and immediately closes.
* **Smart Deduplication & 7-Day Cooloff**: Won't spam you with duplicate alerts.

#### 1-Click Quick Setup:
1. Configure your `.env` (or copy `.env.example` to `.env`):
   ```ini
   TELEGRAM_BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRstuvWXyz
   TELEGRAM_CHAT_ID=1234567890
   BLINKIT_LAT=13.0388595
   BLINKIT_LON=77.60125099999999
   MIN_DISCOUNT=80
   ```
2. Double-click **`install_task.bat`** (or run `python blinkit_telegram_sniper.py --install-task`).  
   *(If `.env` is not set yet, it will prompt you once right in the terminal to fill in your bot details!)*

That's it! Windows Task Scheduler is now configured and active.

#### Handy Batch Shortcuts:
* **`install_task.bat`**: Registers the permanent hourly schedule in Windows Task Scheduler.
* **`run_now.bat`**: Runs an immediate live deal scan right now in the console so you can see live scraping output.
* **`test_telegram.bat`**: Sends a test ping to verify your Telegram Bot connection.
* **`uninstall_task.bat`**: Removes the background scheduled task with 1 click.

#### Command-Line Options:
```bash
python blinkit_telegram_sniper.py --now             # Run scan & send deals to Telegram now
python blinkit_telegram_sniper.py --test-telegram   # Send a test message to your Telegram bot
python blinkit_telegram_sniper.py --install-task    # Register hourly schedule in Windows (:10)
python blinkit_telegram_sniper.py --status-task     # Check Windows Task Scheduler status
python blinkit_telegram_sniper.py --remove-task     # Remove scheduled task
python blinkit_telegram_sniper.py --reset-history   # Reset deals tracking database
```

---

### ⚙️ Option B: Advanced GitHub Actions Setup

For developers who prefer running the hunter workflow via GitHub Actions orchestration with a self-hosted runner and external webhook triggers:

#### 1. Add GitHub Repository Secrets
Under your GitHub repo: **Settings** $\to$ **Secrets and variables** $\to$ **Actions** $\to$ **New repository secret**:
* `TELEGRAM_BOT_TOKEN`
* `TELEGRAM_CHAT_ID`
* `BLINKIT_LAT`
* `BLINKIT_LON`
* `MIN_DISCOUNT` *(Optional, default: 80)*

#### 2. Connect Self-Hosted Windows Runner
Under **Settings** $\to$ **Actions** $\to$ **Runners** $\to$ **New runner**, follow the commands:
```powershell
mkdir C:\actions-runner; cd C:\actions-runner
# Download and extract runner
./config.cmd --url https://github.com/<your-username>/blinkit-deals --token <TOKEN> --runasservice
```

#### 3. Schedule with cron-job.org
Create a POST cron-job at `10 * * * *` targeting:
`https://api.github.com/repos/<your-username>/blinkit-deals/actions/workflows/blinkit-deal-bot.yml/dispatches` with header `Authorization: Bearer <GITHUB_PAT>` and body `{"ref": "main"}`.

---

## 🛡️ Anti-Rate-Limit & Performance Architecture

* **500ms Sequential Pacing**: The browser bookmarklet pauses 500ms between page requests, perfectly matching natural browsing speeds and avoiding IP blocks.
* **In-Memory Caching (`searchCache` & `catDealsCache`)**: Searching the same keyword or subcategory multiple times in one session retrieves results instantly from memory with **zero network requests**.
* **Dual-Layer Cache Persistence**: Saves deal history in `blinkit_deals_history.json` to guarantee no duplicate deal alerts.
* **Early Cancel Recovery**: Cancelling a search or multi-category scan midway preserves all items collected so far with a clear summary badge.

---

## 📄 License
MIT © [jairaj26](https://github.com/jairaj26)
