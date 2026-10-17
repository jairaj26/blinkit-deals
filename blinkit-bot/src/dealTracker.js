/**
 * Blinkit Deal Tracker & Deduplication Engine
 * - Suppresses duplicate alerts if an item has the same discount across hourly runs.
 * - Suppresses items for 1 week if their price remains unchanged for a full day (24h).
 * - Restores and persists deal state via data/deals_cache.json.
 */

const fs = require('fs');
const path = require('path');

const CACHE_FILE = path.join(__dirname, '..', 'data', 'deals_cache.json');

function ensureDataDir() {
  const dir = path.dirname(CACHE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadCache() {
  ensureDataDir();
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const content = fs.readFileSync(CACHE_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn(`[DealTracker] Could not load cache (${err.message}). Starting with fresh state.`);
  }
  return {
    lastRunAt: null,
    items: {}
  };
}

function saveCache(cache) {
  ensureDataDir();
  try {
    // Purge stale items not seen in over 30 days to keep cache fast
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    for (const key of Object.keys(cache.items || {})) {
      const item = cache.items[key];
      const lastSeen = new Date(item.lastSeenAt || 0).getTime();
      if (lastSeen < thirtyDaysAgo) {
        delete cache.items[key];
      }
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
  } catch (err) {
    console.error(`[DealTracker] Error saving cache: ${err.message}`);
  }
}

function getItemKey(item) {
  if (item.productId && item.productId !== '0') {
    return `pid_${item.productId}`;
  }
  const cleanName = (item.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanVar = (item.variant || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return `key_${cleanName}_${cleanVar}`;
}

/**
 * Evaluates scanned items against previous deal history.
 * @param {Array} scannedItems - List of items returned by blinkitApi.
 * @param {Object} options - { forceSend: boolean }
 * @returns {Object} { toSend: Array, cache: Object, stats: Object }
 */
function processAndFilterDeals(scannedItems, options = {}) {
  const cache = loadCache();
  const now = new Date();
  const nowMs = now.getTime();

  const toSend = [];
  const stats = {
    totalScanned: scannedItems.length,
    newDeals: 0,
    priceDrops: 0,
    ignoredSameDiscount: 0,
    suppressedWeek: 0,
    forceSent: 0
  };

  for (const item of scannedItems) {
    const key = getItemKey(item);
    const existing = cache.items[key];

    // 1. Check if item is in 1-week suppression cooldown
    if (existing && existing.suppressedUntil) {
      const suppressionEnd = new Date(existing.suppressedUntil).getTime();
      if (nowMs < suppressionEnd) {
        existing.lastSeenAt = now.toISOString();
        stats.suppressedWeek++;
        continue;
      } else {
        // Cooldown expired, clear suppression flag
        existing.suppressedUntil = null;
        existing.firstSeenPriceAt = now.toISOString();
        existing.consecutiveHoursSamePrice = 1;
      }
    }

    // 2. Case: Brand New Deal (Never seen before)
    if (!existing) {
      cache.items[key] = {
        productId: item.productId,
        name: item.name,
        variant: item.variant,
        brand: item.brand,
        category: item.category,
        categories: item.categories,
        mrp: item.mrp,
        price: item.price,
        discountPct: item.discountPct,
        savings: item.savings,
        url: item.url,
        image: item.image,
        firstSeenAt: now.toISOString(),
        lastSeenAt: now.toISOString(),
        firstSeenPriceAt: now.toISOString(),
        consecutiveHoursSamePrice: 1,
        lastNotifiedPrice: item.price,
        lastNotifiedDiscount: item.discountPct,
        notifiedAt: now.toISOString(),
        suppressedUntil: null
      };

      toSend.push(item);
      stats.newDeals++;
      continue;
    }

    // 3. Case: Forced Send override (e.g. manual GitHub Action trigger)
    if (options.forceSend) {
      existing.lastSeenAt = now.toISOString();
      existing.lastNotifiedPrice = item.price;
      existing.lastNotifiedDiscount = item.discountPct;
      existing.notifiedAt = now.toISOString();
      toSend.push(item);
      stats.forceSent++;
      continue;
    }

    // 4. Case: Price dropped further or discount increased!
    if (item.price < existing.lastNotifiedPrice || item.discountPct > existing.lastNotifiedDiscount) {
      existing.mrp = item.mrp;
      existing.price = item.price;
      existing.discountPct = item.discountPct;
      existing.savings = item.savings;
      existing.url = item.url;
      existing.image = item.image || existing.image;
      existing.lastSeenAt = now.toISOString();
      existing.firstSeenPriceAt = now.toISOString(); // Reset 24-hour same-price counter
      existing.consecutiveHoursSamePrice = 1;
      existing.lastNotifiedPrice = item.price;
      existing.lastNotifiedDiscount = item.discountPct;
      existing.notifiedAt = now.toISOString();
      existing.suppressedUntil = null;

      toSend.push(item);
      stats.priceDrops++;
      continue;
    }

    // 5. Case: Identical Price / Discount on second+ fetch
    existing.lastSeenAt = now.toISOString();
    existing.consecutiveHoursSamePrice = (existing.consecutiveHoursSamePrice || 1) + 1;

    // Check if it has remained at the same price for a whole day (>= 23.5 hours)
    const firstPriceTime = new Date(existing.firstSeenPriceAt || existing.firstSeenAt).getTime();
    const hoursAtSamePrice = (nowMs - firstPriceTime) / (1000 * 60 * 60);

    if (hoursAtSamePrice >= 23.5) {
      // Mute this item for 7 days
      const sevenDaysLater = new Date(nowMs + 7 * 24 * 60 * 60 * 1000).toISOString();
      existing.suppressedUntil = sevenDaysLater;
      stats.suppressedWeek++;
      console.log(`[DealTracker] '${item.name}' remained at ₹${item.price} for >= 24h. Suppressed for 7 days until ${sevenDaysLater}.`);
    } else {
      stats.ignoredSameDiscount++;
    }
  }

  cache.lastRunAt = now.toISOString();
  return { toSend, cache, stats };
}

module.exports = {
  loadCache,
  saveCache,
  processAndFilterDeals,
  getItemKey
};
