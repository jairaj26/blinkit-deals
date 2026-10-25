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
  - [How the Bot Works](#how-the-bot-works)
  - [Step 1: Create a Free Telegram Bot](#step-1-create-a-free-telegram-bot)
  - [Step 2: Get Your Delivery Coordinates](#step-2-get-your-delivery-coordinates)
  - [Step 3: Setup GitHub Secrets](#step-3-setup-github-secrets)
  - [Step 4: Connect Your PC as a Self-Hosted Runner](#step-4-connect-your-pc-as-a-self-hosted-runner-recommended)
  - [Step 5: Schedule Exact Runs with cron-job.org](#step-5-schedule-exact-runs-with-cron-joborg-at-10-past-every-hour)
  - [Alternative: Running Locally on Your PC](#alternative-running-locally-on-your-pc-without-github)
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
* **Lighting Fast Execution**: Runs in under **35 seconds** on a self-hosted runner.

---

### Step 1: Create a Free Telegram Bot

1. Open the **Telegram** app and search for `@BotFather`.
2. Send `/newbot` and follow the instructions:
   - Enter a friendly name for your bot (e.g. `My Blinkit Deal Hunter`).
   - Enter a username ending in `bot` (e.g. `my_blinkit_hunter_bot`).
3. BotFather will provide an **HTTP API Token** (e.g. `7123456789:ABCdefGhIJKlmNoPQRstuvWXyz`).  
   👉 *Save this — this is your `TELEGRAM_BOT_TOKEN`.*
4. Open your new bot's chat in Telegram and press **Start**.
5. Find your numeric Telegram ID:
   - Search for `@userinfobot` in Telegram and press **Start**.
   - It will reply with your numeric `Id` (e.g. `123456789`).  
   👉 *Save this — this is your `TELEGRAM_CHAT_ID`.*
   > **Note for Channels**: If you want to post deals to a private or public Telegram channel, add your bot as an **Administrator** of that channel. You can then use your channel username (e.g. `@my_deals_channel`) or the channel's numeric ID as your `TELEGRAM_CHAT_ID`.

---

### Step 2: Get Your Delivery Coordinates

Blinkit's inventory and prices depend strictly on your local dark store location.

1. Open **[Google Maps](https://maps.google.com)** on your computer or phone.
2. Click or long-press on your apartment or delivery address.
3. Look at the coordinates displayed (for example: `13.0388595, 77.601251`):
   - First number is Latitude $\to$ `13.0388595` (`BLINKIT_LAT`)
   - Second number is Longitude $\to$ `77.601251` (`BLINKIT_LON`)

---

### Step 3: Setup GitHub Secrets

1. **Fork** or **Clone** this repository to your GitHub account:
   - Click the **Fork** button at the top-right of [https://github.com/jairaj26/blinkit-deals](https://github.com/jairaj26/blinkit-deals).
2. In your GitHub repository, navigate to:  
   **Settings** $\to$ **Secrets and variables** $\to$ **Actions** $\to$ **New repository secret**.
3. Add the following secrets:

| Secret Name | Required? | Example Value | Description |
| :--- | :---: | :--- | :--- |
| `TELEGRAM_BOT_TOKEN` | **Yes** | `7123456789:ABCdefGhI...` | Token from @BotFather |
| `TELEGRAM_CHAT_ID` | **Yes** | `123456789` or `@my_deals` | Your chat ID or channel username |
| `BLINKIT_LAT` | **Yes** | `13.0388595` | Delivery location latitude |
| `BLINKIT_LON` | **Yes** | `77.601251` | Delivery location longitude |
| `MIN_DISCOUNT` | No | `80` | Minimum discount percentage (default: `80`) |
| `BLINKIT_COOKIE` | No | `gr_1_lat=13...;` | Browser cookie for store pinning |

---

### Step 4: Connect Your PC as a Self-Hosted Runner (Recommended)

> **Why Self-Hosted?**  
> GitHub Actions cloud servers run inside US datacenter IP ranges that Cloudflare frequently blocks with bot challenges. Running the bot via your home PC runner uses your residential Indian IP, bypassing all Cloudflare blocks effortlessly and scanning 50 categories in under **35 seconds**.

#### Setting up the runner on Windows:
1. In your GitHub repository, go to **Settings** $\to$ **Actions** $\to$ **Runners** $\to$ **New runner**.
2. Select **Windows** and **x64**.
3. Open **PowerShell** as Administrator on your PC and run the commands provided on your GitHub screen:
   ```powershell
   # 1. Create a folder for the runner
   mkdir C:\actions-runner; cd C:\actions-runner

   # 2. Download and extract the runner package (copy exact version from GitHub)
   Invoke-WebRequest -Uri <DOWNLOAD_URL> -OutFile actions-runner.zip
   Expand-Archive -Path actions-runner.zip -DestinationPath .

   # 3. Configure the runner:
   # To run as an automatic Windows Service (starts on boot, runs in background):
   ./config.cmd --url https://github.com/<your-username>/blinkit-deals --token <TOKEN_FROM_GITHUB> --runasservice

   # OR to run interactively (terminal window):
   # ./config.cmd --url https://github.com/<your-username>/blinkit-deals --token <TOKEN_FROM_GITHUB>
   # ./run.cmd
   ```
4. **Managing the Windows Service (if configured with `--runasservice`)**:  
   The runner will automatically run in the background. You can check its status anytime in PowerShell (Admin):
   ```powershell
   Get-Service actions.runner.*
   Start-Service actions.runner.*
   Stop-Service actions.runner.*
   ```

---

### Step 5: Schedule Exact Runs with cron-job.org (at :10 Past Every Hour)

> **Why cron-job.org?**  
> GitHub Actions' built-in `schedule:` timer can be delayed by 20 to 45 minutes during busy hours. Blinkit updates clearance stock near the 10-minute mark of every hour. Using the free service [cron-job.org](https://cron-job.org) triggers your runner punctually at minute `:10` (e.g. `1:10`, `2:10`, `3:10`...).

#### 1. Create a GitHub Personal Access Token (PAT)
1. In GitHub, click your profile icon (top right) $\to$ **Settings** $\to$ **Developer settings** $\to$ **Personal access tokens** $\to$ **Tokens (classic)**.
2. Click **Generate new token (classic)**.
3. Name it `cronjob-trigger` and check the **`workflow`** (or `repo`) scope.
4. Click **Generate token** and copy the token string (`ghp_...`).

#### 2. Create the Job on cron-job.org
1. Register a free account at **[cron-job.org](https://cron-job.org)**.
2. Click **Create Cronjob**:
   - **Title**: `Blinkit Deal Hunter`
   - **URL**: `https://api.github.com/repos/<your-username>/blinkit-deals/actions/workflows/blinkit-deal-bot.yml/dispatches`
   - **Request Method**: `POST`
   - **Schedule**: User-defined / Hourly at minute `10` (`10 * * * *`)
   - **Timezone**: `Asia/Kolkata` (or your local timezone)
   - **Headers**:
     - `Authorization`: `Bearer YOUR_GITHUB_PERSONAL_ACCESS_TOKEN`
     - `Accept`: `application/vnd.github+json`
     - `User-Agent`: `cronjob-blinkit`
   - **Request Body**:
     ```json
     {"ref": "main"}
     ```
3. Click **Create**.  
   *Your bot will now trigger punctually at 10 minutes past every hour, scout 50 categories in 35 seconds, and notify you instantly!*

---

### Alternative: Running Locally on Your PC (Without GitHub)

If you don't want to use GitHub Actions and prefer running the bot manually from your computer:

1. Clone your repository:
   ```bash
   git clone https://github.com/<your-username>/blinkit-deals.git
   cd blinkit-deals/blinkit-bot
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Open `.env` in any text editor and fill in your `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `BLINKIT_LAT`, and `BLINKIT_LON`.
4. Run the hunter:
   ```bash
   npm start
   ```

---

## 🛡️ Anti-Rate-Limit & Performance Architecture

* **500ms Sequential Pacing**: The browser bookmarklet pauses 500ms between page requests, perfectly matching natural browsing speeds and avoiding IP blocks.
* **In-Memory Caching (`searchCache` & `catDealsCache`)**: Searching the same keyword or subcategory multiple times in one session retrieves results instantly from memory with **zero network requests**.
* **Dual-Layer Cache Persistence**: The Telegram bot saves deal history in `data/deals_cache.json` as well as a local backup (`%LOCALAPPDATA%\blinkit_deals_cache.json`) to guarantee no duplicate deal alerts even across runner updates or cleanups.
* **Early Cancel Recovery**: Cancelling a search or multi-category scan midway preserves all items collected so far with a clear summary badge.

---

## 📄 License
MIT © [jairaj26](https://github.com/jairaj26)
