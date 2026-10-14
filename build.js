const fs = require('fs');
const path = require('path');
const terser = require('d:/Projects/Swiggy/swiggy-telegram-bot/node_modules/terser');

async function build() {
  console.log('Reading blinkit-deals.js...');
  const src = fs.readFileSync('blinkit-deals.js', 'utf8');

  // 1. Sync to blinkit_deal_hunter_v3.js
  fs.writeFileSync('blinkit_deal_hunter_v3.js', src, 'utf8');
  console.log('✓ Synced blinkit_deal_hunter_v3.js');

  // 2. Minify with Terser
  console.log('Minifying with Terser...');
  const minResult = await terser.minify(src, {
    compress: {
      drop_console: false,
      passes: 2,
    },
    mangle: {
      toplevel: false,
    },
  });

  if (minResult.error) {
    throw minResult.error;
  }

  const minCode = minResult.code;
  fs.writeFileSync('blinkit-deals.min.js', minCode, 'utf8');
  console.log('✓ Wrote blinkit-deals.min.js (' + minCode.length + ' bytes)');

  // 3. Standalone Bookmarklet
  const standaloneBookmarklet = 'javascript:' + minCode;
  fs.writeFileSync('bookmarklet.txt', standaloneBookmarklet, 'utf8');
  console.log('✓ Wrote bookmarklet.txt (' + standaloneBookmarklet.length + ' bytes)');

  // 4. Official Mobile Loader Bookmarklet
  const mobileLoader = "javascript:(function(){const s=document.createElement('script');s.src='https://jairaj26.github.io/blinkit-deals/blinkit-deals.min.js?t='+Date.now();document.head.appendChild(s);})();";

  // 5. Build index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  <title>⚡ Blinkit Deal Hunter & Scout — 1-Click Bookmarklet</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bk-yellow: #f8cb46;
      --bk-yellow-dark: #e5b935;
      --bk-yellow-light: #fff9e6;
      --bk-green: #0c831f;
      --bk-green-dark: #086317;
      --bk-green-light: #dcfce7;
      --emerald: #10b981;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --bg: #f8fafc;
      --white: #ffffff;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text-main);
      display: flex;
      justify-content: center;
      padding: 36px 16px 60px;
      line-height: 1.5;
    }

    .container {
      max-width: 720px;
      width: 100%;
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 32px 28px;
      box-shadow: 0 12px 36px rgba(15, 23, 42, 0.05);
    }

    .header {
      text-align: center;
      margin-bottom: 24px;
    }

    .badge {
      display: inline-block;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: var(--bk-green-light);
      color: var(--bk-green);
      padding: 4px 12px;
      border-radius: 20px;
      margin-bottom: 12px;
    }

    h1 {
      font-size: 26px;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 8px;
      letter-spacing: -0.02em;
    }

    .subtitle {
      color: var(--text-muted);
      font-size: 15px;
    }

    .tag-row {
      margin-top: 10px;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 6px;
    }

    .tag-pill {
      font-size: 11.5px;
      font-weight: 600;
      color: #065f46;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      padding: 3px 10px;
      border-radius: 12px;
    }

    .card {
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 22px;
      margin-bottom: 20px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.03);
    }

    .card-highlight {
      border: 2px solid var(--emerald);
      background: #f0fdf4;
    }

    .install-box {
      background: var(--bk-yellow-light);
      border: 2px dashed var(--bk-yellow);
      border-radius: 16px;
      padding: 24px 16px;
      text-align: center;
      margin-bottom: 20px;
    }

    .btn-drag {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      background: var(--bk-green);
      color: var(--white) !important;
      font-size: 16px;
      font-weight: 700;
      padding: 13px 28px;
      border-radius: 12px;
      text-decoration: none;
      cursor: grab;
      box-shadow: 0 4px 14px rgba(12, 131, 31, 0.3);
      transition: all 0.2s ease;
      user-select: none;
    }

    .btn-drag:hover {
      background: var(--bk-green-dark);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(12, 131, 31, 0.4);
    }

    .drag-hint {
      margin-top: 12px;
      font-size: 13px;
      color: #7a4b00;
      font-weight: 600;
    }

    .btn-mobile {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: #059669;
      color: var(--white);
      border: none;
      font-size: 15px;
      font-weight: 700;
      padding: 12px 24px;
      border-radius: 10px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      transition: all 0.15s ease;
      font-family: inherit;
    }

    .btn-mobile:hover {
      background: #047857;
      transform: translateY(-1px);
    }

    .btn-mobile.copied {
      background: var(--bk-green-dark);
    }

    .section-title {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .code-container {
      position: relative;
      margin-top: 10px;
      margin-bottom: 6px;
    }

    .code-box {
      width: 100%;
      height: 80px;
      background: #0f172a;
      color: #94a3b8;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      line-height: 1.5;
      padding: 12px 14px;
      padding-right: 90px;
      border-radius: 10px;
      border: 1px solid #1e293b;
      resize: none;
      outline: none;
      word-break: break-all;
      display: block;
      box-sizing: border-box;
    }

    .copy-btn {
      position: absolute;
      right: 10px;
      top: 10px;
      background: #334155;
      color: var(--white);
      border: none;
      font-family: inherit;
      font-size: 12px;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.15s ease;
      z-index: 2;
    }

    .copy-btn:hover { background: #475569; }
    .copy-btn.copied { background: var(--bk-green); }

    .steps {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 12px;
    }

    .step-item {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      background: #f8fafc;
      padding: 12px 14px;
      border-radius: 10px;
      border: 1px solid #f1f5f9;
      font-size: 13.5px;
    }

    .card-highlight .step-item {
      background: #ffffff;
      border-color: #d1fae5;
    }

    .step-num {
      background: var(--emerald);
      color: #ffffff;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 800;
      flex-shrink: 0;
      margin-top: 1px;
    }

    kbd {
      background: #e2e8f0;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
      font-family: inherit;
      font-weight: 600;
    }

    .features-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 20px;
    }

    .feature-card {
      padding: 14px;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: #fff;
    }

    .feature-card h4 {
      font-size: 13.5px;
      font-weight: 700;
      margin-bottom: 4px;
      color: var(--text-main);
    }

    .feature-card p {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.4;
    }

    .footer {
      text-align: center;
      font-size: 12.5px;
      color: var(--text-muted);
      padding-top: 20px;
      border-top: 1px solid var(--border);
    }

    .footer a {
      color: var(--bk-green);
      text-decoration: none;
      font-weight: 600;
    }

    @media (max-width: 600px) {
      .container { padding: 22px 16px; }
      .features-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">⚡ Official Release · v3.5</div>
      <h1>Blinkit Deal Hunter</h1>
      <p class="subtitle">Scout clearance discounts, search any keyword & sort products by highest real discount.</p>
      <div class="tag-row">
        <span class="tag-pill">🟢 Light-Green Launcher</span>
        <span class="tag-pill">⚡ Server-Side Sort</span>
        <span class="tag-pill">🛑 59% Early-Exit Cutoff</span>
        <span class="tag-pill">📱 Official Mobile Loader</span>
        <span class="tag-pill">🖼️ 5/3 Col Responsive Grid</span>
        <span class="tag-pill">🔗 Clickable Product Cards</span>
      </div>
    </div>

    <!-- Official Mobile Loader Section -->
    <div class="card card-highlight">
      <div class="section-title">📱 Official Mobile Bookmarklet (Android & iOS)</div>
      <p style="font-size: 13.5px; color: #065f46; margin-bottom: 12px;">
        Designed specifically for mobile browsers where bookmark URLs have length limits. Loads directly via GitHub Pages in just 160 characters:
      </p>

      <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-bottom:14px;">
        <button class="btn-mobile" id="btn-copy-mobile" onclick="copyMobileCode()">📋 Copy Mobile Bookmarklet</button>
        <span id="mobile-copy-toast" style="font-size:13px; font-weight:600; color:var(--emerald); display:none;">✓ Copied to clipboard!</span>
      </div>

      <div class="code-container">
        <textarea class="code-box" id="code-mobile" readonly spellcheck="false" style="height:60px;"></textarea>
      </div>

      <div class="steps">
        <div class="step-item">
          <div class="step-num">1</div>
          <div>Tap <b>Copy Mobile Bookmarklet</b> above.</div>
        </div>
        <div class="step-item">
          <div class="step-num">2</div>
          <div>Bookmark this page in Chrome or Safari and name it <b>Blinkit Deals</b>.</div>
        </div>
        <div class="step-item">
          <div class="step-num">3</div>
          <div>Go to your browser Bookmarks, tap Edit on <b>Blinkit Deals</b>, delete the URL, and <b>paste</b> the copied code.</div>
        </div>
        <div class="step-item">
          <div class="step-num">4</div>
          <div>Open <b><a href="https://blinkit.com" target="_blank" style="color:var(--bk-green);font-weight:600;">blinkit.com</a></b>, tap the address bar, type <b>Blinkit Deals</b>, and tap the bookmark suggestion! Tap the floating green circle icon anytime to open the drawer.</div>
        </div>
      </div>
    </div>

    <!-- Desktop Drag & Drop Section -->
    <div class="install-box">
      <div class="section-title" style="justify-content:center;">💻 PC & Mac (1-Click Drag & Drop)</div>
      <p style="font-size: 13px; color: #7a4b00; margin-bottom: 14px;">
        Show your bookmarks bar (<kbd>Ctrl+Shift+B</kbd> or <kbd>Cmd+Shift+B</kbd>), then drag this button:
      </p>
      <a class="btn-drag" id="btn-drag" href="#">⚡ Blinkit Deals</a>
      <div class="drag-hint">👆 Drag & drop the button above directly onto your Bookmarks Bar</div>
    </div>

    <!-- Feature Highlights -->
    <div class="features-grid">
      <div class="feature-card">
        <h4>🟢 Floating Launcher & Minimize</h4>
        <p>Discreet launcher positioned safely above the checkout button. Minimize or close anytime.</p>
      </div>
      <div class="feature-card">
        <h4>⚡ Server-Side Sort & 59% Cutoff</h4>
        <p>Fast backend discount sorting (<code>discount_desc</code>) with automatic early exit below 59% discount.</p>
      </div>
      <div class="feature-card">
        <h4>🛍️ Clickable Cards with 2-Line Badges</h4>
        <p>Tap any card to open the product directly on Blinkit. Clear stacked <code>54% Off</code> discount pills.</p>
      </div>
      <div class="feature-card">
        <h4>📱 Streamlined Mobile Experience</h4>
        <p>3-column mobile grid, 2-row toolbar, and fit-to-screen list view with no horizontal overflow.</p>
      </div>
    </div>

    <!-- Standalone Self-Contained Code (Works on ALL browsers) -->
    <div class="card">
      <div class="section-title">📋 Standalone Self-Contained Code (Offline / Zero Requests)</div>
      <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 10px;">
        For desktop users who want the entire script inlined without any external network fetches:
      </p>
      <div class="code-container">
        <button class="copy-btn" id="copy-btn-main" onclick="copyFullCode()">Copy Code</button>
        <textarea class="code-box" id="code-main" readonly spellcheck="false"></textarea>
      </div>
    </div>

    <div class="footer">
      Built with ⚡ for the Quick-Commerce Deals Community · <a href="https://github.com/jairaj26/blinkit-deals" target="_blank">View on GitHub</a>
    </div>
  </div>

  <script>
    const MOBILE_CODE = ${JSON.stringify(mobileLoader)};
    const STANDALONE_CODE = ${JSON.stringify(standaloneBookmarklet)};

    document.getElementById("code-mobile").value = MOBILE_CODE;
    document.getElementById("code-main").value = STANDALONE_CODE;
    document.getElementById("btn-drag").setAttribute("href", MOBILE_CODE);

    function copyMobileCode() {
      navigator.clipboard.writeText(MOBILE_CODE).then(() => {
        const btn = document.getElementById("btn-copy-mobile");
        const toast = document.getElementById("mobile-copy-toast");
        btn.classList.add("copied");
        btn.textContent = "✓ Copied!";
        toast.style.display = "inline";
        setTimeout(() => {
          btn.classList.remove("copied");
          btn.textContent = "📋 Copy Mobile Bookmarklet";
          toast.style.display = "none";
        }, 2500);
      }).catch(() => {
        const box = document.getElementById("code-mobile");
        box.select();
        document.execCommand("copy");
      });
    }

    function copyFullCode() {
      navigator.clipboard.writeText(STANDALONE_CODE).then(() => {
        const btn = document.getElementById("copy-btn-main");
        btn.classList.add("copied");
        btn.textContent = "✓ Copied!";
        setTimeout(() => {
          btn.classList.remove("copied");
          btn.textContent = "Copy Code";
        }, 2000);
      }).catch(() => {
        const box = document.getElementById("code-main");
        box.select();
        document.execCommand("copy");
      });
    }
  </script>
</body>
</html>`;

  fs.writeFileSync('index.html', indexHtml, 'utf8');
  console.log('✓ Wrote index.html (' + indexHtml.length + ' bytes)');
}

build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
