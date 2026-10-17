/**
 * Telegram Bot Notifier for Blinkit Deals
 * Sends rich deal cards with photo and direct product link.
 */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

🔗 <a href="${item.url}"><b>Buy on Blinkit ⚡</b></a>`;
}

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Sends a single deal to Telegram.
 */
async function sendSingleDeal(token, chatId, item) {
  const text = formatDealMessage(item);
  const telegramBase = `https://api.telegram.org/bot${token}`;

  // Try sending as Photo first if image URL is available
  if (item.image && item.image.startsWith('https://')) {
    try {
      const photoUrl = `${telegramBase}/sendPhoto`;
      const res = await fetch(photoUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          photo: item.image,
          caption: text,
          parse_mode: 'HTML'
        })
      });
      const data = await res.json();
      if (data.ok) return true;
      console.warn(`[Notifier] sendPhoto returned false (${data.description}), falling back to sendMessage.`);
    } catch (err) {
      console.warn(`[Notifier] sendPhoto network error (${err.message}), falling back to text.`);
    }
  }

  // Fallback to text message
  const msgUrl = `${telegramBase}/sendMessage`;
  const res = await fetch(msgUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      disable_web_page_preview: false
    })
  });
  const data = await res.json();
  if (!data.ok) {
    throw new Error(`Telegram error: ${data.description}`);
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
