/**
 * Blinkit Deal Hunter API Fetcher
 * Strictly fetches Page 1 of 36 essential categories sorted by discount descending.
 * Supports dual fetch modes:
 *  1. Direct REST Fetch (fast, uses headers + cookies).
 *  2. Headless Browser (Puppeteer-core) fallback if Cloudflare blocks datacenter IPs.
 */

const fs = require('fs');
const puppeteer = require('puppeteer-core');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const toNum = (s) => {
  const n = parseFloat(String(s).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};
const round2 = (n) => Math.round(n * 100) / 100;
const cap = (s) =>
  String(s || '')
    .split(' ')
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ''))
    .join(' ');

const ALL_KEYWORDS = [
  'atta', 'rice', 'dal', 'ghee', 'sweets', 'chocolate', 'cake', 'snacks',
  'dry fruits', 'coffee', 'dairy', 'fruits', 'vegetables', 'grocery', 'oil',
  'masala', 'instant', 'ice cream', 'munchies', 'beverages', 'tea', 'eggs',
  'meat', 'skincare', 'haircare', 'bath', 'oral', 'makeup', 'kitchen',
  'bed', 'home', 'appliances', 'detergents', 'protein', 'stationery', 'premium'
];

function findBrowserExecutable() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function getProductUrl(it) {
  if (!it) return 'https://blinkit.com';
  const slug = (it.name || 'item').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item';
  return it.productId ? `https://blinkit.com/prn/${slug}/prid/${it.productId}` : `https://blinkit.com/s/?q=${encodeURIComponent(it.name)}`;
}

function toItem(d) {
  const ci = (d.atc_action && d.atc_action.add_to_cart && d.atc_action.add_to_cart.cart_item) || null;
  const name = (d.name && d.name.text) || d.name || (ci && (ci.display_name || ci.product_name)) || '';
  const price = toNum((d.normal_price && d.normal_price.text) || d.normal_price) || Number(ci && ci.price) || 0;
  let mrp = toNum((d.mrp && d.mrp.text) || d.mrp) || Number(ci && ci.mrp) || 0;
  if (!name || !price) return null;
  if (!mrp || mrp < price) mrp = price;

  const discountPct = round2(((mrp - price) / mrp) * 100);
  const savings = round2(mrp - price);
  const img = (d.image && (d.image.url || d.image)) || (ci && ci.image_url) || '';
  const pid = String(d.product_id != null ? d.product_id : (ci && ci.product_id) || '');

  const item = {
    productId: pid,
    name: String(name).trim(),
    variant: String((d.variant && d.variant.text) || d.variant || (ci && ci.unit) || '').trim(),
    brand: String((d.brand_name && d.brand_name.text) || d.brand || (ci && ci.brand) || '').trim(),
    mrp,
    price,
    discountPct,
    savings,
    soldOut: d.is_sold_out === true || (ci && ci.inventory === 0) || d.inventory === 0,
    image: typeof img === 'string' && img.startsWith('https://') ? img : '',
    category: '',
    categories: []
  };
  item.url = getProductUrl(item);
  return item;
}

function parseItems(json) {
  const out = [];
  (function walk(node, depth = 0) {
    if (!node || typeof node !== 'object' || depth > 14) return;
    if (Array.isArray(node)) {
      node.forEach((n) => walk(n, depth + 1));
      return;
    }
    const d = node.data;
    if (d && typeof d === 'object' && !Array.isArray(d)) {
      const item = toItem(d);
      if (item) {
        out.push(item);
        return;
      }
    }
    for (const k in node) walk(node[k], depth + 1);
  })(json && json.response ? json.response : json, 0);
  return out;
}

async function fetchKeywordPage0(keyword, config) {
  const searchUrl = `https://blinkit.com/v1/layout/search?q=${encodeURIComponent(keyword)}&search_type=type_to_search&page_index=0&offset=0&limit=15&oos_visibility=true&sort=discount_desc`;

  const headers = {
    'content-type': 'application/json',
    accept: '*/*',
    'accept-language': 'en-US,en;q=0.9',
    app_client: 'consumer_web',
    lat: String(config.lat || '13.0388595'),
    lon: String(config.lon || '77.60125099999999'),
    origin: 'https://blinkit.com',
    referrer: 'https://blinkit.com/',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
  };

  if (config.cookie) {
    headers.cookie = config.cookie;
  }

  const res = await fetch(searchUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: keyword,
      q: keyword,
      search_query: keyword,
      page_index: 0,
      offset: 0,
      limit: 15,
      oos_visibility: 'true',
      sort: 'discount_desc'
    })
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  const json = await res.json();
  return parseItems(json);
}

/**
 * Headless browser runner when Cloudflare blocks direct REST fetches.
 */
async function fetchViaBrowser(config = {}) {
  const executablePath = findBrowserExecutable();
  if (!executablePath) {
    throw new Error('No Chrome or Chromium browser executable found on this machine for headless mode.');
  }

  console.log(`[BlinkitApi] Launching headless browser (${executablePath})...`);
  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1280,800'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });

    const lat = parseFloat(config.lat || '13.0388595');
    const lon = parseFloat(config.lon || '77.60125099999999');

    // Set geolocation permissions
    const context = browser.defaultBrowserContext();
    await context.overridePermissions('https://blinkit.com', ['geolocation']);
    await page.setGeolocation({ latitude: lat, longitude: lon });

    // Navigate to initialize session and bypass Cloudflare challenge
    console.log('[BlinkitApi] Initializing Blinkit session in browser...');
    await page.goto('https://blinkit.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(2000);

    console.log(`[BlinkitApi] Scanning ${ALL_KEYWORDS.length} categories inside browser session...`);
    const results = await page.evaluate(async (keywords, latStr, lonStr) => {
      const allResults = [];
      for (let i = 0; i < keywords.length; i++) {
        const kw = keywords[i];
        const searchUrl = `https://blinkit.com/v1/layout/search?q=${encodeURIComponent(kw)}&search_type=type_to_search&page_index=0&offset=0&limit=15&oos_visibility=true&sort=discount_desc`;
        try {
          const res = await fetch(searchUrl, {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              accept: '*/*',
              app_client: 'consumer_web',
              lat: latStr,
              lon: lonStr
            },
            body: JSON.stringify({
              query: kw,
              q: kw,
              search_query: kw,
              page_index: 0,
              offset: 0,
              limit: 15,
              oos_visibility: 'true',
              sort: 'discount_desc'
            }),
            credentials: 'include'
          });
          if (res.ok) {
            const json = await res.json();
            allResults.push({ keyword: kw, json });
          }
        } catch (_) {}
        await new Promise((r) => setTimeout(r, 120));
      }
      return allResults;
    }, ALL_KEYWORDS, String(lat), String(lon));

    return results;
  } finally {
    await browser.close();
  }
}

/**
 * Scans all 36 categories, deduplicating products and filtering for high discounts.
 * @param {Object} config - { lat, lon, cookie, minDiscount, useBrowser }
 * @returns {Promise<Array>} List of qualifying deals sorted by discount descending.
 */
async function fetchHighDiscountDeals(config = {}) {
  const minDiscount = typeof config.minDiscount === 'number' ? config.minDiscount : 80;
  const seen = new Set();
  const items = [];
  const useBrowserExplicit = config.useBrowser || process.env.USE_BROWSER === 'true';

  let rawCategoryOutputs = [];

  if (useBrowserExplicit) {
    console.log('[BlinkitApi] Explicit browser mode enabled.');
    rawCategoryOutputs = await fetchViaBrowser(config);
  } else {
    // Try fast direct REST API first
    console.log(`[BlinkitApi] Scanning ${ALL_KEYWORDS.length} categories via direct API...`);
    let firstError = null;

    for (let i = 0; i < ALL_KEYWORDS.length; i++) {
      const kw = ALL_KEYWORDS[i];
      try {
        const list = await fetchKeywordPage0(kw, config);
        rawCategoryOutputs.push({ keyword: kw, list });
      } catch (err) {
        if (!firstError) firstError = err;
        // If first attempt is 403 Forbidden, Cloudflare blocked direct REST -> switch immediately to headless browser!
        if (i === 0 && String(err.message).includes('403')) {
          console.warn('[BlinkitApi] Direct REST fetch blocked by Cloudflare (HTTP 403). Falling back to headless browser...');
          break;
        }
      }
      if (i < ALL_KEYWORDS.length - 1) {
        await sleep(120);
      }
    }

    // If direct fetch failed on 403, run headless browser fallback
    if (!rawCategoryOutputs.length && firstError && String(firstError.message).includes('403')) {
      rawCategoryOutputs = await fetchViaBrowser(config);
    }
  }

  // Parse and aggregate deals
  for (const entry of rawCategoryOutputs) {
    const kw = entry.keyword;
    const catName = cap(kw);
    const list = entry.list || parseItems(entry.json);

    if (list && list.length) {
      for (const it of list) {
        if (it.discountPct >= minDiscount && !it.soldOut) {
          const key = it.productId || `${it.name}|${it.variant}`;
          if (!seen.has(key)) {
            seen.add(key);
            it.category = catName;
            it.categories = [catName];
            items.push(it);
          } else {
            const existing = items.find((x) => (x.productId || `${x.name}|${x.variant}`) === key);
            if (existing) {
              if (!existing.categories) existing.categories = [existing.category || catName];
              if (!existing.categories.includes(catName)) existing.categories.push(catName);
            }
          }
        }
      }
    }
  }

  // Sort by highest discount, then biggest savings
  items.sort((a, b) => b.discountPct - a.discountPct || b.savings - a.savings);

  console.log(`[BlinkitApi] Finished. Scanned ${rawCategoryOutputs.length}/${ALL_KEYWORDS.length} categories. Found ${items.length} deals >= ${minDiscount}% off.`);
  return items;
}

module.exports = {
  ALL_KEYWORDS,
  fetchKeywordPage0,
  fetchViaBrowser,
  fetchHighDiscountDeals
};
