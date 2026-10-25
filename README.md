# ⚡ Blinkit Deal Hunter & Scout Suite (v3.6)

> **Scout hidden clearance deals (60% to 90%+ OFF), search any grocery item by highest discount, or run an automated 24/7 Telegram deal alert bot right from your computer!**

This repository contains two complete tools:
1. **🌐 1-Click Browser Bookmarklet**: Works directly inside your browser on [blinkit.com](https://blinkit.com) (Desktop & Mobile) — no extensions or app downloads required!
2. **🤖 Automated Telegram Deal Bot**: Automatically checks Blinkit every hour at 10 minutes past the hour (`:10`), scans 50 major categories for $\ge 80\%$ OFF clearance deals, and sends clean, batched alerts directly to your Telegram chat or channel.

---

## 📑 Table of Contents
- [🌐 Part 1: 1-Click Bookmarklet (for Browsers)](#-part-1-1-click-bookmarklet-for-browsers)
  - [What is a Bookmarklet?](#what-is-a-bookmarklet)
  - [💻 Desktop Setup (PC & Mac)](#-desktop-setup-pc--mac)
  - [📱 Mobile Setup (Android Chrome & iOS Safari)](#-mobile-setup-android-chrome--ios-safari)
  - [How to Use the Deal Hunter](#how-to-use-the-deal-hunter)
  - [Bookmarklet Features at a Glance](#bookmarklet-features-at-a-glance)
- [🤖 Part 2: Automated Telegram Deal Bot (80%+ Clearance)](#-part-2-automated-telegram-deal-bot-80-clearance)
  - [⚡ Option A: 1-Click Windows Setup Wizard (Recommended)](#-option-a-1-click-windows-setup-wizard-recommended)
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

### How the Bot Works
* **Batched Deal Alerts**: Combines deals into clean, compact messages (up to 12 items per message) separated by double line breaks—no photo clutter or notification spam:
  ```text
  🛍️ ReeQ Refillable Soap Dispenser (Plastic, Black)
  💰 ₹299 (MRP: ₹1,499) || 80% OFF
  🔗 Buy on Blinkit ⚡️ (https://blinkit.com/prn/.../prid/740968)
  ```
* **50 Categories Scanned**: Scans all major grocery, personal care, home, electronics, and baby care categories.
* **Smart Deduplication**: If an item is already reported at the same price, it will not be sent again. If an item remains at the same clearance price for 24 hours, alerts are silenced for **7 days** to avoid repeated noise.
* **Lighting Fast Execution**: Runs in under **35 seconds**.

---

### ⚡ Option A: 1-Click Windows Setup Wizard (Recommended)

No complicated developer setups, GitHub tokens, or cron-jobs needed! A visual setup wizard runs right in your browser.

#### 3-Step Setup:
1. **Download the repository**:  
   Click the green **Code** button $\to$ **Download ZIP**, and extract it anywhere on your Windows PC.
2. **Double-click `setup.bat`**:  
   This automatically installs requirements and opens the visual Setup Wizard in your browser (`http://localhost:4567`).
3. **Fill in the visual form**:
   - **Telegram Bot**: Enter your Token (link provided to `@BotFather`) and Chat ID (link provided to `@userinfobot`), then click **🔔 Test Ping** to verify!
   - **Location**: Click **📍 1-Click Detect My Location** to auto-fill your exact coordinates via browser GPS (or paste any Google Maps link of your home).
   - **Discount**: Choose your threshold (e.g., 80% OFF).
   - Click **🚀 Save & Enable Hourly Deal Hunter**.

#### What Happens Automatically:
* **Windows Task Scheduler**: Windows automatically registers a background task named `BlinkitDealHunter` to trigger punctually at **`:10`** past every hour.
* **100% Silent Execution**: Uses a background launcher (`run_silent.vbs`) so **no black command window ever pops up**.
* **Zero RAM Wasted**: Between hourly runs, the bot uses **0 MB RAM**. It wakes up at `:10`, checks 50 categories in 30 seconds, alerts your Telegram, and exits.
* **Survives PC Restarts**: Windows automatically keeps the schedule active across reboots.

#### Handy Helper Scripts:
* **`run-now.bat`**: Double-click anytime to run an instant live scan and watch deals roll in.
* **`uninstall.bat`**: Double-click anytime to completely remove the scheduled background task in 1 second.

---

### ⚙️ Option B: Advanced GitHub Actions Setup

For developers who prefer running the hunter workflow via GitHub Actions orchestration with a self-hosted runner and external webhook triggers:

#### 1. Setup Telegram Credentials & Coordinates
- Get your bot token from `@BotFather` and your chat ID from `@userinfobot`.
- Get your coordinates from Google Maps (`BLINKIT_LAT`, `BLINKIT_LON`).

#### 2. Add GitHub Repository Secrets
Under your GitHub repo: **Settings** $\to$ **Secrets and variables** $\to$ **Actions** $\to$ **New repository secret**:
* `TELEGRAM_BOT_TOKEN`
* `TELEGRAM_CHAT_ID`
* `BLINKIT_LAT`
* `BLINKIT_LON`
* `MIN_DISCOUNT` *(Optional, default: 80)*

#### 3. Connect Self-Hosted Windows Runner
Under **Settings** $\to$ **Actions** $\to$ **Runners** $\to$ **New runner**, follow the commands:
```powershell
mkdir C:\actions-runner; cd C:\actions-runner
# Download and extract runner
./config.cmd --url https://github.com/<your-username>/blinkit-deals --token <TOKEN> --runasservice
```

#### 4. Schedule with cron-job.org
Create a POST cron-job at `10 * * * *` targeting:
`https://api.github.com/repos/<your-username>/blinkit-deals/actions/workflows/blinkit-deal-bot.yml/dispatches` with header `Authorization: Bearer <GITHUB_PAT>` and body `{"ref": "main"}`.

---

## 🛡️ Anti-Rate-Limit & Performance Architecture

* **500ms Sequential Pacing**: The browser bookmarklet pauses 500ms between page requests, perfectly matching natural browsing speeds and avoiding IP blocks.
* **In-Memory Caching (`searchCache` & `catDealsCache`)**: Searching the same keyword or subcategory multiple times in one session retrieves results instantly from memory with **zero network requests**.
* **Dual-Layer Cache Persistence**: The Telegram bot saves deal history in `data/deals_cache.json` as well as a local backup (`%LOCALAPPDATA%\blinkit_deals_cache.json`) to guarantee no duplicate deal alerts even across cleanups.
* **Early Cancel Recovery**: Cancelling a search or multi-category scan midway preserves all items collected so far with a clear summary badge.

---

## 📄 License
MIT © [jairaj26](https://github.com/jairaj26)
