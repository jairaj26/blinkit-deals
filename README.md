# ⚡ Blinkit Deal Hunter & Scout Suite (v3.6)

A high-performance in-browser tool to scout hidden clearance deals, bulk discounts, and high-savings offers across **Blinkit**:

1. **⚡ Deal Hunter (Floating Launcher & Drawer)**: Discreet floating launcher button at bottom-right that opens an interactive drawer to scout deals by **Keyword** (with 15 1-click popular deal chips), by **Category** across 28 categories with subcategory multi-select and 1-click Select/Clear All, or via the **⚡ Scan All Deals (36 Categories)** Mega Scout.
2. **📱 Responsive Deals Tab**: Clean 5-column desktop and 3-column mobile grid with clickable product cards, stacked 2-line discount badges (`54%` / `Off`), instant quick-filters (25%+, 40%+, 60%+, In stock), multi-column sorting, and 1-click CSV export on desktop.

---

## 🌟 Features at a Glance

| Feature | Details |
| :--- | :--- |
| **Floating Launcher** | Discreet green circle button floating above the checkout button with Minimize & Close actions |
| **⚡ 36-Category Mega Scout** | 1-Click scout strictly fetching Page 1 of 36 essential categories, deduplicating and sorting all top deals |
| **Category Multi-Select** | Select a Category to auto-select all subcategories (e.g. Baby Care ~11 subcategories); easily toggle, Select All or Clear All |
| **Page 1 Subcategory Deals** | Fetches Page 1 sorted by discount of all selected subcategories, deduplicating and aggregating deals |
| **Category Filter** | Dynamic dropdown filter in the results toolbar to isolate deals by category with item counts |
| **1-Click Popular Chips** | 15 quick deal pills (`Atta`, `Rice`, `Dal`, `Ghee`, `Sweets`, `Chocolate`, etc.) for instant 1-click search |
| **Search by Keyword** | Server-side `discount_desc` sorting with early exit once discounts drop below 59% |
| **Search by Category** | Server-side `discount_desc` sorting across 28 categories with 59% early-exit cutoff |
| **60%+ Clearance Chip** | Dedicated 60%+ filter chip in the results toolbar targeting deep clearance items |
| **Early Cancel Recovery** | Stopping mid-scan gracefully preserves and displays all deals collected so far instead of discarding them |
| **Clickable Cards** | Every product card and list item links directly to its product page on Blinkit |
| **Stacked Discount Badges** | Clean 2-line badges (`54%` / `Off`) with color-coded discount tiers |
| **Mobile Layout** | Responsive 3-column grid (`<= 640px`) with edge-to-edge images and a clean 2-row toolbar |
| **Fit-to-Screen Table** | Mobile list view displays Product (60%), Price (22%), and Off (18%) with zero horizontal overflow |
| **Rate-Limit Safety & Caching** | Sequential pacing + dual session caches (`searchCache` & `catDealsCache`) for instant reload and zero wasted calls |
| **Export Options** | 1-Click CSV export on desktop with RFC-4180 escaping for spreadsheet analysis |

---

## 📱 Mobile Installation (Android Chrome & iOS Safari) — Official Loader

Mobile browsers enforce strict URL length limits on bookmarks. Deal Hunter provides an official ultra-compact (160 characters) GitHub Pages loader:

```javascript
javascript:(function(){const s=document.createElement('script');s.src='https://jairaj26.github.io/blinkit-deals/blinkit-deals.min.js?t='+Date.now();document.head.appendChild(s);})();
```

### 3-Step Mobile Setup:
1. Open **[https://jairaj26.github.io/blinkit-deals/](https://jairaj26.github.io/blinkit-deals/)** on your phone and tap **📋 Copy Mobile Bookmarklet**.
2. Bookmark any webpage in your mobile browser and name it `Blinkit Deals`.
3. Open your browser's Bookmarks list, tap **Edit** on `Blinkit Deals`, delete the existing URL, and **paste** the copied loader code.
4. Navigate to **[blinkit.com](https://blinkit.com)**. Tap the address bar, type `Blinkit Deals`, and tap the bookmark suggestion. The floating launcher circle appears immediately!

---

## 💻 Desktop Installation (Chrome, Edge, Brave, Safari, Firefox)

### Option A: 1-Click Drag & Drop (Recommended)
1. Open the installation portal:  
   👉 **[https://jairaj26.github.io/blinkit-deals/](https://jairaj26.github.io/blinkit-deals/)**
2. Show your bookmarks bar (<kbd>Ctrl+Shift+B</kbd> on Windows or <kbd>Cmd+Shift+B</kbd> on Mac).
3. Drag the green **"⚡ Blinkit Deals"** button directly to your Bookmarks bar.
4. Navigate to **[blinkit.com](https://blinkit.com)** with your delivery location set.
5. Click the bookmark anytime to open Deal Hunter!

---

### Option B: Standalone Self-Contained Code (Zero External Requests)
For desktop users who prefer the entire script inlined into their bookmark without any external network fetches:
1. Copy the code from **[bookmarklet.txt](bookmarklet.txt)** (or tap "Copy Code" under the Standalone section on the [Web Portal](https://jairaj26.github.io/blinkit-deals/)).
2. Create a new bookmark named `Blinkit Deals`.
3. Paste the code into the **URL** / **Location** field and save.

---

## 🛡️ Anti-Rate-Limit & Performance Architecture

* **500ms Sequential Pacing**: Every page request waits for `sleep(500)` before requesting the next page. A 25-page crawl takes ~14 seconds (~1.7 req/sec), indistinguishable from human scrolling.
* **In-Memory Session Caches (`searchCache` & `catDealsCache`)**: Searching the same keyword or subcategory multiple times in one session retrieves results instantly from memory with **zero network calls**.
* **Early Cancel Recovery**: Cancelling a search or multi-category scan midway preserves all items collected so far with a clear summary badge.
* **Clean Tab Management**: Results open strictly after data collection finishes.

## 🤖 GitHub Actions Hourly Telegram Bot (80%+ Clearance Deals)

An automated background worker that runs every hour via GitHub Actions, scans all 36 Blinkit categories, deduplicates items against previous alerts, and notifies your Telegram channel/chat with rich product cards.

### Features
* **Hourly Cron Schedule**: Runs every hour at `:01` past the hour IST (`cron: '31 * * * *'`).
* **High-Discount Filter**: Scrapes strictly deals with **$\ge 80\%$ OFF** (configurable).
* **Smart Deduplication**: If an item has the same discount on the second fetch, it is ignored so you are never spammed.
* **24-Hour $\to$ 7-Day Suppression**: If an item remains at the exact same price for 24 hours (a full day), alerts for that item are silenced for **7 days**.
* **Dual-Mode Engine**: Fast direct REST queries with automatic headless browser (Puppeteer) fallback to bypass Cloudflare protection on GitHub Actions datacenter IPs.
* **Persistent Cache**: Uses `actions/cache` to preserve deal state across runs.

### GitHub Repository Secrets Setup
Navigate to **GitHub > Settings > Secrets and variables > Actions** and add:

| Secret Name | Description | Example / Details |
| :--- | :--- | :--- |
| `TELEGRAM_BOT_TOKEN` | BotFather token | `123456789:ABCdefGhIJKlmNoPQRstuvWXyz` |
| `TELEGRAM_CHAT_ID` | Your Chat ID or Channel Username | `@my_deals_channel` or `1234567890` |
| `BLINKIT_LAT` | Delivery location latitude | `13.0388595` |
| `BLINKIT_LON` | Delivery location longitude | `77.60125099999999` |
| `BLINKIT_COOKIE` | *(Optional)* Browser cookie string | `gr_1_lat=13.038...; gr_1_lon=77.601...;` |
| `MIN_DISCOUNT` | *(Optional, default: 80)* | `80` |

### Manual Execution & Testing
Go to **GitHub > Actions > Blinkit Hourly 80%+ Deal Hunter > Run workflow**:
* You can test anytime with custom discount thresholds (e.g. `70%`), enable `dry_run: true` to test without sending Telegram alerts, or set `force_send: true` to bypass deduplication.

---

## 📄 License
MIT © [jairaj26](https://github.com/jairaj26)
