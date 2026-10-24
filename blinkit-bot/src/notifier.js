/**
 * Telegram Bot Notifier for Blinkit Deals
 * Sends rich deal cards with photo and direct product link.
 */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDealMessage(item) {
  const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');
  const catText = item.categories && item.categories.length ? item.categories.join(' · ') : (item.category || 'Deals');
  const variantText = item.variant ? `📦 <b>Variant:</b> ${escapeHtml(item.variant)}\n` : '';
  const brandText = item.brand ? `🏷️ <b>Brand:</b> ${escapeHtml(item.brand)}\n` : '';

  return `🔥 <b>${Math.round(item.discountPct)}% OFF BLINKIT DEAL!</b>

🛍️ <b>${escapeHtml(item.name)}</b>
${variantText}${brandText}📂 <b>Category:</b> ${escapeHtml(catText)}

💰 <b>Deal Price:</b> ${inr(item.price)}  (MRP: <s>${inr(item.mrp)}</s>)
💸 <b>You Save:</b> ${inr(item.savings)} (${Math.round(item.discountPct)}% OFF)

🔗 <a href="${escapeHtml(item.url)}"><b>Buy on Blinkit ⚡</b></a>`;
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
 * Sends a single deal to Telegram.
 */
async function sendSingleDeal(token, chatId, item) {
  const text = formatDealMessage(item);
  const telegramBase = `https://api.telegram.org/bot${token}`;

  // Try sending as Photo first if image URL is available
  if (item.image && item.image.startsWith('https://')) {
    const photoData = await callTelegramApi(`${telegramBase}/sendPhoto`, {
      chat_id: chatId,
      photo: item.image,
      caption: text,
      parse_mode: 'HTML'
    });

    if (photoData.ok) return true;
    console.warn(`[Notifier] sendPhoto returned false (${photoData.description}), falling back to sendMessage.`);
  }

  // Fallback to text message
  const msgData = await callTelegramApi(`${telegramBase}/sendMessage`, {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    disable_web_page_preview: false
  });

  if (!msgData.ok) {
    throw new Error(`Telegram error: ${msgData.description}`);
  }
  return true;
}

/**
 * Dispatches all qualifying deals sequentially with a 1-second polite pause.
 */
async function sendDeals(token, chatId, deals, isDryRun = false) {
  if (!deals || !deals.length) {
    console.log('[Notifier] No new deals to send.');
    return { sent: 0, failed: 0 };
  }

  if (isDryRun) {
    console.log(`[Notifier] DRY-RUN MODE: Would have sent ${deals.length} deals to Telegram.`);
    deals.forEach((it, idx) => {
      console.log(`\n--- Deal #${idx + 1} Preview ---`);
      console.log(formatDealMessage(it));
    });
    return { sent: deals.length, failed: 0, dryRun: true };
  }

  if (!token || !chatId) {
    throw new Error('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing!');
  }

  console.log(`[Notifier] Sending ${deals.length} deals to Telegram (chat_id: ${chatId})...`);
  let sentCount = 0;
  let failedCount = 0;

  for (let i = 0; i < deals.length; i++) {
    const item = deals[i];
    try {
      await sendSingleDeal(token, chatId, item);
      sentCount++;
      console.log(`[Notifier] [${i + 1}/${deals.length}] Sent: ${item.name} (${Math.round(item.discountPct)}% OFF)`);
    } catch (err) {
      failedCount++;
      console.error(`[Notifier] [${i + 1}/${deals.length}] Failed to send '${item.name}': ${err.message}`);
    }

    if (i < deals.length - 1) {
      await sleep(1000); // 1-second pause to prevent Telegram 429 rate limit
    }
  }

  console.log(`[Notifier] Finished dispatching. Sent: ${sentCount}, Failed: ${failedCount}.`);
  return { sent: sentCount, failed: failedCount };
}

module.exports = {
  formatDealMessage,
  sendDeals
};
