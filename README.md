# ⚡ Blinkit Deal Hunter & Scout Suite

A high-performance in-browser tool to scout hidden clearance deals, bulk discounts, and high-savings offers across **Blinkit**:

1. **⚡ Deal Hunter (Floating Launcher & Drawer)**: Discreet floating launcher button at bottom-right that opens an interactive drawer to scout deals by **Keyword** (e.g. `sweets`, `snacks`, `butter`, `amul`, `dry fruits`) or by **Category** across 28 super-categories.
2. **📱 Responsive Deals Tab**: Clean 5-column desktop and 3-column mobile grid with clickable product cards, stacked 2-line discount badges (`54%` / `Off`), instant filters (25%+, 40%+, In stock), multi-column sorting, and 1-click CSV export on desktop.

---

## 🌟 Features at a Glance

| Feature | Details |
| :--- | :--- |
| **Floating Launcher** | Discreet green circle button floating above the checkout button with Minimize & Close actions |
| **Search by Keyword** | Crawls all pages of any search term with a courtesy sequential 500ms pause |
| **Search by Category** | Full subcategory crawler across 28 pre-mapped super-categories |
| **Clickable Cards** | Every product card and list item links directly to its product page on Blinkit |
| **Stacked Discount Badges** | Clean 2-line badges (`54%` / `Off`) with color-coded discount tiers |
| **Mobile Layout** | Responsive 3-column grid (`<= 640px`) with edge-to-edge images and a clean 2-row toolbar |
| **Fit-to-Screen Table** | Mobile list view displays Product (60%), Price (22%), and Off (18%) with zero horizontal overflow |
| **Rate-Limit Safety** | 500ms pacing + in-memory session cache (`searchCache`) keeps your IP 100% safe |
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
* **In-Memory Session Cache**: Searching the same keyword or subcategory multiple times in one session retrieves results instantly from cache with **zero network calls**.
* **Clean Tab Management**: Results open strictly after data collection finishes.

---

## 📄 License
MIT © [jairaj26](https://github.com/jairaj26)
