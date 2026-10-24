/**
 * Main Runner Script for Blinkit Hourly Deal Bot
 * Can be executed locally or via GitHub Actions.
 */

try {
  require('dotenv').config();
} catch (_) {}

const { fetchHighDiscountDeals, ALL_KEYWORDS } = require('./blinkitApi');
const { processAndFilterDeals, saveCache } = require('./dealTracker');
const { sendDeals } = require('./notifier');

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run') || process.env.DRY_RUN === 'true';
  const forceSend = args.includes('--force-send') || process.env.FORCE_SEND === 'true';

  let minDiscount = 80;
  const minDiscArg = args.find((a) => a.startsWith('--min-discount='));
  if (minDiscArg) {
    minDiscount = parseFloat(minDiscArg.split('=')[1]) || 80;
  } else if (process.env.MIN_DISCOUNT) {
    minDiscount = parseFloat(process.env.MIN_DISCOUNT) || 80;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const lat = process.env.BLINKIT_LAT || '13.0388595';
  const lon = process.env.BLINKIT_LON || '77.60125099999999';
  const cookie = process.env.BLINKIT_COOKIE || '';
  const proxyUrl = process.env.PROXY_URL || '';

  console.log('====================================================');
  console.log('⚡ Blinkit Deal Hunter Bot - Hourly Execution');
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  console.log(`🎯 Minimum Discount: ${minDiscount}% OFF`);
  console.log(`📍 Location: ${lat}, ${lon}`);
  console.log(`🍪 Cookie Provided: ${cookie ? 'YES' : 'NO'}`);
  console.log(`🌐 Proxy Provided: ${proxyUrl ? 'YES' : 'NO'}`);
  console.log(`🤖 Dry Run: ${isDryRun ? 'YES (No messages sent)' : 'NO'}`);
  console.log(`⚡ Force Send: ${forceSend ? 'YES' : 'NO'}`);
  console.log('====================================================\n');

  if (!isDryRun && (!token || !chatId)) {
    console.warn('[Runner] WARNING: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing.');
    console.warn('[Runner] Running in DRY-RUN mode automatically to prevent crashes.\n');
  }

  // 1. Fetch Page 1 across all 36 categories with discount_desc
  const { items: scannedItems, categoriesScanned } = await fetchHighDiscountDeals({
    lat,
    lon,
    cookie,
    proxyUrl,
    minDiscount
  });

  if (categoriesScanned === 0) {
    throw new Error(
      `Cloudflare blocked all ${ALL_KEYWORDS.length} category requests (HTTP 403). ` +
      `Use a self-hosted runner on an Indian IP or configure Secrets.PROXY_URL.`
    );
  }

  // 2. Filter through dealTracker state machine
  const { toSend, cache, stats } = processAndFilterDeals(scannedItems, {
    forceSend,
    minDiscount
  });

  console.log('\n--- Deal Tracker Evaluation Summary ---');
  console.log(`📂 Categories Scanned: ${categoriesScanned}/${ALL_KEYWORDS.length}`);
  console.log(`📦 Total Scanned (>= ${minDiscount}%): ${stats.totalScanned}`);
  console.log(`✨ Brand New Deals: ${stats.newDeals}`);
  console.log(`📉 Price Drops: ${stats.priceDrops}`);
  if (stats.forceSent > 0) console.log(`⚡ Force Sent: ${stats.forceSent}`);
  console.log(`⏭️ Ignored (Same Discount as last run): ${stats.ignoredSameDiscount}`);
  console.log(`⏸️ Suppressed (Remained same price for 24h, muted for 1 week): ${stats.suppressedWeek}`);
  console.log(`🚀 Final Deals to Alert: ${toSend.length}`);
  console.log('----------------------------------------\n');

  // 3. Dispatch to Telegram
  const shouldDryRun = isDryRun || !token || !chatId;
  await sendDeals(token, chatId, toSend, shouldDryRun);

  // 4. Save updated deal cache state
  saveCache(cache);
  console.log('\n✓ Deal cache updated in data/deals_cache.json.');
  console.log('✓ Run completed successfully.\n');
}

main().catch((err) => {
  console.error('\n❌ Fatal error in deal bot runner:', err.message || err);
  process.exit(1);
});
