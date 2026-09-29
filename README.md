# ⚡ Blinkit Deal Hunter & Scout Suite

A high-performance in-browser tool to scout hidden clearance deals, bulk discounts, and high-savings offers across **Blinkit**:

1. **⚡ Deal Hunter (Browser Bookmarklet & Web Portal)**: Interactive client-side drawer to scout deals by **Keyword** (e.g. `sweets`, `snacks`, `amul`, `electronics`) or by **Category** across 28 super-categories.
2. **📱 Responsive Deals Tab**: Clean 2-column mobile and desktop grid with enlarged product images, instant filters (25%+, 40%+, In stock), multi-column sorting, and 1-click CSV export.

---

## 🌟 Features at a Glance

| Feature | Details |
| :--- | :--- |
| **Interface** | Native Blinkit light-theme drawer (`Search by Keyword` / `Search by Category` tabs) |
| **Search by Keyword** | Crawls all pages of any search term with a courtesy sequential 500ms pause |
| **Search by Category** | Full subcategory crawler across 28 pre-mapped super-categories |
| **Tab Timing** | Result tab opens **only after** all items are completely fetched and sorted |
| **Mobile Layout** | Responsive 2-column grid (`<= 640px`) with edge-to-edge square images |
| **Rate-Limit Safety** | 500ms pacing + in-memory session cache (`searchCache`) keeps your IP 100% safe |
| **Export Options** | 1-Click CSV export with clean RFC-4180 escaping for spreadsheet analysis |

---

## 🚀 Desktop Installation (Chrome, Edge, Brave, Safari, Firefox)

### Option A: Drag & Drop via Web Portal (Recommended)
1. Open the installation portal:  
   👉 **[https://jairaj26.github.io/blinkit-deals/](https://jairaj26.github.io/blinkit-deals/)**
2. Show your bookmarks bar (<kbd>Ctrl+Shift+B</kbd> on Windows or <kbd>Cmd+Shift+B</kbd> on Mac).
3. Drag the green **"⚡ Blinkit Deals"** button directly to your Bookmarks bar.
4. Navigate to **[blinkit.com](https://blinkit.com)** with your delivery location set.
5. Click the bookmark anytime to open Deal Hunter!

---

### Option B: Manual Bookmark Creation (Short Link)
Create a new bookmark in your browser with the following URL:

```javascript
javascript:(function(){const s=document.createElement('script');s.src='https://tinyurl.com/26ouwf7p';document.head.appendChild(s);})();
```

> **Short link target:** Maps directly to `https://raw.githubusercontent.com/jairaj26/blinkit-deals/main/blinkit-deals.js`.

---

## 📱 Mobile Installation (Android Chrome & iOS Safari)

Mobile browsers do not support drag-and-drop, but setup takes under 30 seconds using the ultra-short (117 chars) loader:

1. **Copy the code**:
   ```javascript
   javascript:(function(){const s=document.createElement('script');s.src='https://tinyurl.com/26ouwf7p';document.head.appendChild(s);})();
   ```
2. **Bookmark any page**: In your mobile browser, tap menu (<kbd>⋮</kbd> or Share) and create a bookmark. Name it `Blinkit Deals`.
3. **Edit the bookmark**: Open your bookmarks list, edit the bookmark you just created, delete the URL, and **paste** the JavaScript code above. Save changes.
4. **How to run on Mobile**:
   - Open **[blinkit.com](https://blinkit.com)**.
   - Tap the browser **address bar**, type `Blinkit Deals`, and tap the bookmark suggestion.
   - The Deal Hunter drawer will slide open immediately!

---

## 🛡️ Anti-Rate-Limit & Performance Architecture

* **500ms Sequential Pacing**: Every page request waits for `sleep(500)` before requesting the next page. A 25-page crawl takes ~14 seconds (~1.7 req/sec), indistinguishable from human scrolling.
* **In-Memory Session Cache**: Searching the same keyword or subcategory multiple times in one session retrieves results instantly from cache with **zero network calls**.
* **Clean Async Pop-Up Management**: Avoids blank precursor tabs; results open strictly after data collection finishes.

---

## 📄 License
MIT © [jairaj26](https://github.com/jairaj26)
