/**
 * Blinkit Deal Hunter API Fetcher
 * Strictly fetches Page 1 of 36 essential categories sorted by discount descending.
 * Supports dual fetch modes:
 *  1. Direct REST Fetch (fast, uses headers + cookies + optional PROXY_URL).
 *  2. Headless Browser (Puppeteer) fallback with native Linux fingerprint & Turnstile wait.
 */

const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

let ProxyAgent = null;
try {
  ({ ProxyAgent } = require('undici'));
} catch (_) {}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const tx = (v) => (v && typeof v === 'object' ? v.text || '' : v == null ? '' : String(v));
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
  'bed', 'home', 'appliances', 'detergents', 'protein', 'stationery', 'premium',
  'biscuits', 'noodles', 'pasta', 'sauces', 'cereal', 'perfume', 'deodorant',
  'cleaning', 'baby', 'pet', 'electronics', 'cookware', 'wellness', 'beauty'
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
  const name = tx(d.name) || (ci && (ci.display_name || ci.product_name)) || '';
  const price = toNum(tx(d.normal_price)) || Number(ci && ci.price) || 0;
  let mrp = toNum(tx(d.mrp)) || Number(ci && ci.mrp) || 0;
  if (!name || !price) return null;
  if (!mrp || mrp < price) mrp = price;

  const discountPct = round2(((mrp - price) / mrp) * 100);
  const savings = round2(mrp - price);
  const img = (d.image && (d.image.url || d.image)) || (ci && ci.image_url) || '';
  const pid = String(d.product_id != null ? d.product_id : (ci && ci.product_id) || '');

  const item = {
    productId: pid,
    name: String(name).trim(),
    variant: String(tx(d.variant) || (ci && ci.unit) || '').trim(),
    brand: String(tx(d.brand_name) || d.brand || (ci && ci.brand) || '').trim(),
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

function parseCookieString(raw) {
  if (!raw || typeof raw !== 'string') return [];
  let cleaned = raw.trim();
  if (cleaned.toLowerCase().startsWith('cookie:')) {
    cleaned = cleaned.slice(7).trim();
  }
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  const pairs = cleaned.split(';').map((s) => s.trim()).filter(Boolean);
  const cookies = [];
  for (const pair of pairs) {
    const eq = pair.indexOf('=');
    if (eq > 0) {
      const name = pair.slice(0, eq).trim();
      const value = pair.slice(eq + 1).trim();
      if (name) {
        cookies.push({ name, value });
      }
    }
  }
  return cookies;
}

async function fetchKeywordPage0(keyword, config) {
  const searchUrl = `https://blinkit.com/v1/layout/search?q=${encodeURIComponent(keyword)}&search_type=type_to_search&page_index=0&offset=0&limit=15&oos_visibility=true&sort=discount_desc`;

  const headers = {
    'content-type': 'application/json',
    accept: '*/*',
    'accept-language': 'en-IN,en-US;q=0.9,en;q=0.8',
    app_client: 'consumer_web',
    lat: String(config.lat || '13.0388595'),
    lon: String(config.lon || '77.60125099999999'),
    origin: 'https://blinkit.com',
    referer: 'https://blinkit.com/',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  };

  if (config.cookie) {
    const parsed = parseCookieString(config.cookie);
    if (parsed.length) {
      headers.cookie = parsed.map((c) => `${c.name}=${c.value}`).join('; ');
    } else {
      headers.cookie = config.cookie;
    }
  }

  const fetchOpts = {
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
  };

  if (config.proxyUrl && ProxyAgent) {
    fetchOpts.dispatcher = new ProxyAgent(config.proxyUrl);
  }

  const res = await fetch(searchUrl, fetchOpts);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  const json = await res.json();
  return parseItems(json);
}

function isCloudflareChallengeOrBlock(title, url) {
  const t = String(title || '').toLowerCase();
  const u = String(url || '').toLowerCase();
  return (
    t.includes('just a moment') ||
    t.includes('attention required') ||
    t.includes('error page') ||
    t.includes('security check') ||
    u.includes('__cf_chl_')
  );
}

/**
 * Headless browser runner when Cloudflare blocks direct REST fetches.
 */
async function fetchViaBrowser(config = {}) {
  const executablePath = findBrowserExecutable();
  if (!executablePath) {
    throw new Error('No Chrome or Chromium browser executable found on this machine for browser mode.');
  }

  const isHeadless = process.env.HEADLESS !== 'false';
  const launchArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-blink-features=AutomationControlled',
    '--window-size=1280,960',
    '--lang=en-IN,en'
  ];

  let proxyAuth = null;
  if (config.proxyUrl) {
    try {
      const parsedProxy = new URL(config.proxyUrl);
      launchArgs.push(`--proxy-server=${parsedProxy.protocol}//${parsedProxy.host}`);
      if (parsedProxy.username || parsedProxy.password) {
        proxyAuth = {
          username: decodeURIComponent(parsedProxy.username),
          password: decodeURIComponent(parsedProxy.password)
        };
      }
      console.log(`[BlinkitApi] Routing browser through proxy: ${parsedProxy.protocol}//${parsedProxy.host}`);
    } catch (e) {
      console.warn(`[BlinkitApi] Invalid PROXY_URL format: ${e.message}`);
    }
  }

  console.log(`[BlinkitApi] Launching browser (headless: ${isHeadless}, path: ${executablePath})...`);
  const browser = await puppeteer.launch({
    executablePath,
    headless: isHeadless ? 'new' : false,
    args: launchArgs
  });

  try {
    const page = await browser.newPage();
    if (proxyAuth) {
      await page.authenticate(proxyAuth);
    }

    // Preserve native OS/Chrome version fingerprint, only strip HeadlessChrome token if present
    const nativeUA = await browser.userAgent();
    const cleanUA = nativeUA.replace('HeadlessChrome/', 'Chrome/');
    await page.setUserAgent(cleanUA);
    await page.setViewport({ width: 1280, height: 960 });

    const lat = parseFloat(config.lat || '13.0388595');
    const lon = parseFloat(config.lon || '77.60125099999999');

    // Set geolocation permissions
    const context = browser.defaultBrowserContext();
    await context.overridePermissions('https://blinkit.com', ['geolocation']);
    await page.setGeolocation({ latitude: lat, longitude: lon });

    // Inject user cookies into browser context if provided
    // Note: Do NOT inject stale cf_clearance from another IP as it triggers Cloudflare 403
    const parsedCookies = parseCookieString(config.cookie).filter(
      (c) => c.name !== 'cf_clearance' && c.name !== '__cf_bm'
    );
    const cookiesToSet = parsedCookies.map((c) => ({
      name: c.name,
      value: c.value,
      domain: '.blinkit.com',
      path: '/'
    }));

    if (!cookiesToSet.some((c) => c.name === 'gr_1_lat')) {
      cookiesToSet.push({ name: 'gr_1_lat', value: String(lat), domain: '.blinkit.com', path: '/' });
    }
    if (!cookiesToSet.some((c) => c.name === 'gr_1_lon')) {
      cookiesToSet.push({ name: 'gr_1_lon', value: String(lon), domain: '.blinkit.com', path: '/' });
    }

    if (cookiesToSet.length > 0) {
      console.log(`[BlinkitApi] Injected ${cookiesToSet.length} location/session cookies into browser.`);
      await page.setCookie(...cookiesToSet);
    }

    console.log('[BlinkitApi] Initializing Blinkit session in browser...');
    try {
      await page.goto('https://blinkit.com/', { waitUntil: 'domcontentloaded', timeout: 45000 });
    } catch (e) {
      console.warn(`[BlinkitApi] Initial page load warning: ${e.message}`);
    }

    let pageTitle = await page.title().catch(() => 'unknown');
    let pageUrl = page.url();

    if (isCloudflareChallengeOrBlock(pageTitle, pageUrl)) {
      console.log(`[BlinkitApi] Cloudflare challenge/interstitial detected ("${pageTitle}" at ${pageUrl}). Waiting up to 30s...`);
      for (let attempt = 0; attempt < 6; attempt++) {
        await sleep(3000);
        try {
          const frames = page.frames();
          for (const frame of frames) {
            if (frame.url().includes('challenges.cloudflare.com')) {
              const box = await frame.$('input[type="checkbox"], .ctp-checkbox-label, #challenge-stage');
              if (box) {
                console.log('[BlinkitApi] Clicking Turnstile challenge box...');
                await box.click().catch(() => {});
              }
            }
          }
        } catch (_) {}

        pageTitle = await page.title().catch(() => 'unknown');
        pageUrl = page.url();
        if (!isCloudflareChallengeOrBlock(pageTitle, pageUrl)) {
          console.log(`[BlinkitApi] Challenge cleared! Page title: "${pageTitle}"`);
          break;
        }
      }
    }

    pageTitle = await page.title().catch(() => 'unknown');
    pageUrl = page.url();
    console.log(`[BlinkitApi] Browser session at "${pageTitle}" (${pageUrl})`);

    await sleep(2000);

    console.log(`[BlinkitApi] Scanning ${ALL_KEYWORDS.length} categories inside browser session...`);
    const { allResults, sampleError } = await page.evaluate(async (keywords, latStr, lonStr) => {
      const allResults = [];
      let sampleError = null;
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
          } else {
            if (res.status === 429) {
              await new Promise((r) => setTimeout(r, 2500));
            }
            if (!sampleError) {
              const text = await res.text().catch(() => '');
              sampleError = `Keyword "${kw}" returned HTTP ${res.status}: ${text.slice(0, 200)}`;
            }
            // Abort early if browser session itself is returning 403 WAF block
            if (res.status === 403 && i === 0) break;
          }
        } catch (err) {
          if (!sampleError) {
            sampleError = `Keyword "${kw}" fetch threw: ${err.message || String(err)}`;
          }
        }
        await new Promise((r) => setTimeout(r, 400));
      }
      return { allResults, sampleError };
    }, ALL_KEYWORDS, String(lat), String(lon));

    if (sampleError) {
      console.warn(`[BlinkitApi] Browser evaluation note: ${sampleError}`);
    }

    return allResults;
  } finally {
    await browser.close();
  }
}

/**
 * Scans all 36 categories, deduplicating products and filtering for high discounts.
 * @param {Object} config - { lat, lon, cookie, proxyUrl, minDiscount, useBrowser }
 * @returns {Promise<{ items: Array, categoriesScanned: number }>}
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
    console.log(`[BlinkitApi] Scanning ${ALL_KEYWORDS.length} categories via direct API...`);
    let blockedError = null;

    for (let i = 0; i < ALL_KEYWORDS.length; i++) {
      const kw = ALL_KEYWORDS[i];
      try {
        const list = await fetchKeywordPage0(kw, config);
        rawCategoryOutputs.push({ keyword: kw, list });
      } catch (err) {
        if (String(err.message).includes('403') || String(err.message).includes('503')) {
          blockedError = err;
          console.warn(`[BlinkitApi] Direct REST fetch blocked by Cloudflare (${err.message}). Falling back to browser...`);
          break;
        }
      }
      if (i < ALL_KEYWORDS.length - 1) {
        await sleep(400);
      }
    }

    if (!rawCategoryOutputs.length && blockedError) {
      rawCategoryOutputs = await fetchViaBrowser(config);
    }
  }

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

  items.sort((a, b) => b.discountPct - a.discountPct || b.savings - a.savings);

  console.log(`[BlinkitApi] Finished. Scanned ${rawCategoryOutputs.length}/${ALL_KEYWORDS.length} categories. Found ${items.length} deals >= ${minDiscount}% off.`);
  return { items, categoriesScanned: rawCategoryOutputs.length };
}

module.exports = {
  ALL_KEYWORDS,
  fetchKeywordPage0,
  fetchViaBrowser,
  fetchHighDiscountDeals
};
