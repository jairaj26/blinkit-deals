/**
 * Telegram Bot Notifier for Blinkit Deals
 * Sends combined deal batches (no images, concise 3-line format).
 */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatSingleDeal(item) {
  const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');
  const discount = Math.round(item.discountPct);

  return `🛍️ ${escapeHtml(item.name)}
💰 ${inr(item.price)} (MRP: ${inr(item.mrp)}) || ${discount}% OFF
🔗 <a href="${escapeHtml(item.url)}">Buy on Blinkit ⚡️</a>`;
}

/**
 * Packs deals into batch messages separated by \n\n without exceeding Telegram's 4096 char limit.
 */
function buildDealBatches(deals, maxCharsPerBatch = 3500) {
  const batches = [];
  let currentBatch = [];
  let currentLen = 0;

  for (const item of deals) {
    const card = formatSingleDeal(item);
    const cardLen = card.length + 2; // +2 for \n\n separator

    if (currentBatch.length > 0 && currentLen + cardLen > maxCharsPerBatch) {
      batches.push(currentBatch.join('\n\n'));
      currentBatch = [card];
      currentLen = card.length;
    } else {
      currentBatch.push(card);
      currentLen += cardLen;
    }
  }

  if (currentBatch.length > 0) {
    batches.push(currentBatch.join('\n\n'));
  }

  return batches;
}

/**
 * Calls Telegram Bot API with automatic HTTP 429 rate limit backoff.
 */
async function callTelegramApi(endpointUrl, body, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(endpointUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json().catch(() => ({ ok: false, description: `HTTP ${res.status}: ${res.statusText}` }));

      if (data.ok) return data;

      // Handle HTTP 429 Too Many Requests
      if (res.status === 429 || data.error_code === 429) {
        const waitSec = (data.parameters && data.parameters.retry_after) || 5;
        console.warn(`[Notifier] Telegram 429 Rate Limit hit. Backing off for ${waitSec}s (attempt ${attempt + 1}/${maxRetries})...`);
        await sleep((waitSec + 1) * 1000);
        continue;
      }

      // Non-retryable error
      return data;
    } catch (err) {
      if (attempt === maxRetries) {
        return { ok: false, description: err.message };
      }
      console.warn(`[Notifier] Telegram network attempt ${attempt + 1} failed (${err.message}). Retrying in 2s...`);
      await sleep(2000);
    }
  }
  return { ok: false, description: 'Max Telegram retries exceeded' };
}

/**
 * Dispatches deals in batched text messages (separated by \n\n, no images).
 */
async function sendDeals(token, chatId, deals, isDryRun = false) {
  if (!deals || !deals.length) {
    console.log('[Notifier] No new deals to send.');
    return { sent: 0, failed: 0 };
  }

  const batches = buildDealBatches(deals);

  if (isDryRun) {
    console.log(`[Notifier] DRY-RUN MODE: Would have sent ${deals.length} deals in ${batches.length} batch message(s) to Telegram.`);
    batches.forEach((msg, idx) => {
      console.log(`\n--- Telegram Message Batch #${idx + 1} (${msg.split('\n\n').length} deals) ---`);
      console.log(msg);
    });
    return { sent: deals.length, batches: batches.length, dryRun: true };
  }

  if (!token || !chatId) {
    throw new Error('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing!');
  }

  console.log(`[Notifier] Sending ${deals.length} deals across ${batches.length} batch message(s) to Telegram...`);
  let sentBatches = 0;
  let failedBatches = 0;

  for (let i = 0; i < batches.length; i++) {
    const batchText = batches[i];
    try {
      const res = await callTelegramApi(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id: chatId,
        text: batchText,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      });

      if (!res.ok) {
        throw new Error(res.description || 'Unknown Telegram error');
      }

      sentBatches++;
      console.log(`[Notifier] [${i + 1}/${batches.length}] Batch delivered successfully.`);
    } catch (err) {
      failedBatches++;
      console.error(`[Notifier] [${i + 1}/${batches.length}] Failed to deliver batch: ${err.message}`);
    }

    if (i < batches.length - 1) {
      await sleep(1000); // 1-second pause between batches
    }
  }

  console.log(`[Notifier] Finished dispatching. Sent: ${sentBatches} batch(es), Failed: ${failedBatches}.`);
  return { sent: deals.length, sentBatches, failedBatches };
}

module.exports = {
  formatSingleDeal,
  buildDealBatches,
  sendDeals
};
