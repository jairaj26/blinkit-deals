/**
 * Blinkit Deal Hunter - Modern Setup Wizard
 * Starts a lightweight local web server and opens the configuration form in the user's browser.
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');

const PORT = 4567;
const BOT_DIR = path.resolve(__dirname, '..');
const ENV_FILE = path.join(BOT_DIR, '.env');
const VBS_FILE = path.join(BOT_DIR, 'run_silent.vbs');

// Read existing .env if present
function loadExistingEnv() {
  const config = {
    token: '',
    chatId: '',
    lat: '',
    lon: '',
    minDiscount: '80',
    cookie: ''
  };

  if (fs.existsSync(ENV_FILE)) {
    try {
      const content = fs.readFileSync(ENV_FILE, 'utf8');
      content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let val = (match[2] || '').trim();
          if (key === 'TELEGRAM_BOT_TOKEN') config.token = val;
          if (key === 'TELEGRAM_CHAT_ID') config.chatId = val;
          if (key === 'BLINKIT_LAT') config.lat = val;
          if (key === 'BLINKIT_LON') config.lon = val;
          if (key === 'MIN_DISCOUNT') config.minDiscount = val || '80';
          if (key === 'BLINKIT_COOKIE') config.cookie = val;
        }
      });
    } catch (_) {}
  }
  return config;
}

// Test Telegram bot credentials
function testTelegram(token, chatId) {
  return new Promise((resolve) => {
    if (!token || !chatId) {
      return resolve({ success: false, error: 'Both Bot Token and Chat ID are required.' });
    }

    const payload = JSON.stringify({
      chat_id: chatId,
      text: '⚡ *Blinkit Deal Hunter Connected!*\n\nYour Telegram Bot is successfully linked. You will receive 80%+ clearance alerts here every hour at :10 past the hour!',
      parse_mode: 'Markdown'
    });

    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.ok) {
            resolve({ success: true });
          } else {
            resolve({ success: false, error: json.description || 'Telegram API returned an error.' });
          }
        } catch (e) {
          resolve({ success: false, error: 'Invalid response from Telegram.' });
        }
      });
    });

    req.on('error', (err) => resolve({ success: false, error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ success: false, error: 'Telegram request timed out.' }); });
    req.write(payload);
    req.end();
  });
}

// Save .env file
function saveEnvFile(config) {
  const lines = [
    '# Blinkit Deal Hunter - Configuration',
    `TELEGRAM_BOT_TOKEN=${config.token || ''}`,
    `TELEGRAM_CHAT_ID=${config.chatId || ''}`,
    `BLINKIT_LAT=${config.lat || '13.0388595'}`,
    `BLINKIT_LON=${config.lon || '77.60125099999999'}`,
    `MIN_DISCOUNT=${config.minDiscount || '80'}`
  ];
  if (config.cookie) {
    lines.push(`BLINKIT_COOKIE=${config.cookie}`);
  }
  fs.writeFileSync(ENV_FILE, lines.join('\n') + '\n', 'utf8');
}

// Ensure run_silent.vbs exists
function ensureVbsFile() {
  const vbsContent = [
    'Set WshShell = CreateObject("WScript.Shell")',
    'Set fso = CreateObject("Scripting.FileSystemObject")',
    'strDir = fso.GetParentFolderName(WScript.ScriptFullName)',
    'WshShell.CurrentDirectory = strDir',
    'WshShell.Run "node src/runner.js", 0, True'
  ].join('\r\n');
  fs.writeFileSync(VBS_FILE, vbsContent, 'utf8');
}

// Register Windows Task Scheduler task
function registerScheduledTask() {
  return new Promise((resolve) => {
    ensureVbsFile();
    const cmd = `schtasks.exe /create /tn "BlinkitDealHunter" /tr "wscript.exe \\"${VBS_FILE}\\"" /sc HOURLY /st 00:10 /f`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error('[Scheduler] Error creating task:', stderr || err.message);
        resolve({ success: false, error: stderr || err.message });
      } else {
        console.log('[Scheduler] Task registered successfully:', stdout.trim());
        resolve({ success: true, message: stdout.trim() });
      }
    });
  });
}

// Trigger initial background deal hunt
function triggerInitialHunt() {
  try {
    const child = spawn('node', ['src/runner.js'], {
      cwd: BOT_DIR,
      detached: true,
      stdio: 'ignore'
    });
    child.unref();
  } catch (err) {
    console.error('[Runner] Could not start initial scan:', err.message);
  }
}

// HTML Form Page
const HTML_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>⚡ Blinkit Deal Hunter - Setup Wizard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --card-border: #334155;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --accent-yellow: #f8cb46;
      --accent-green: #0c831f;
      --accent-green-hover: #086317;
      --accent-green-light: #dcfce7;
      --emerald: #10b981;
      --red: #ef4444;
      --input-bg: #0b1120;
      --input-border: #334155;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 30px 16px;
      line-height: 1.5;
    }

    .container {
      max-width: 620px;
      width: 100%;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 32px 28px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }

    .header {
      text-align: center;
      margin-bottom: 26px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(248, 203, 70, 0.15);
      color: var(--accent-yellow);
      border: 1px solid rgba(248, 203, 70, 0.3);
      font-size: 11.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 4px 12px;
      border-radius: 20px;
      margin-bottom: 12px;
    }

    h1 {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 6px;
    }

    .subtitle {
      color: var(--text-muted);
      font-size: 14px;
    }

    .section-card {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 18px 20px;
      margin-bottom: 18px;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 14px;
    }

    .section-num {
      width: 24px;
      height: 24px;
      background: var(--accent-yellow);
      color: #000;
      font-size: 12px;
      font-weight: 800;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .field-group {
      margin-bottom: 14px;
    }

    .field-group:last-child {
      margin-bottom: 0;
    }

    label {
      display: block;
      font-size: 12.5px;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 6px;
    }

    .input-row {
      display: flex;
      gap: 8px;
    }

    input[type="text"], input[type="number"] {
      width: 100%;
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      color: var(--text);
      font-size: 13.5px;
      font-family: inherit;
      padding: 10px 14px;
      border-radius: 8px;
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    input:focus {
      border-color: var(--accent-yellow);
      box-shadow: 0 0 0 2px rgba(248, 203, 70, 0.2);
    }

    .help-link {
      color: var(--accent-yellow);
      text-decoration: none;
      font-size: 11.5px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-top: 4px;
    }

    .help-link:hover {
      text-decoration: underline;
    }

    .btn-action {
      background: #334155;
      color: #fff;
      border: none;
      font-family: inherit;
      font-size: 12.5px;
      font-weight: 600;
      padding: 10px 16px;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      white-space: nowrap;
      transition: all 0.15s ease;
    }

    .btn-action:hover {
      background: #475569;
    }

    .btn-locate {
      background: #059669;
      color: #fff;
    }

    .btn-locate:hover {
      background: #047857;
    }

    .btn-test {
      background: #2563eb;
    }

    .btn-test:hover {
      background: #1d4ed8;
    }

    .coords-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 10px;
    }

    .discount-pills {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }

    .pill {
      flex: 1;
      text-align: center;
      padding: 8px 0;
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      color: var(--text-muted);
      transition: all 0.15s ease;
    }

    .pill.active {
      background: var(--accent-yellow);
      color: #000;
      border-color: var(--accent-yellow);
    }

    .status-msg {
      font-size: 12px;
      font-weight: 600;
      margin-top: 6px;
      display: none;
    }

    .status-msg.success { color: var(--emerald); display: block; }
    .status-msg.error { color: var(--red); display: block; }

    .btn-submit {
      width: 100%;
      background: var(--accent-green);
      color: #fff;
      border: none;
      font-family: inherit;
      font-size: 15px;
      font-weight: 700;
      padding: 14px 20px;
      border-radius: 12px;
      cursor: pointer;
      margin-top: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 16px rgba(12, 131, 31, 0.4);
      transition: all 0.2s ease;
    }

    .btn-submit:hover {
      background: var(--accent-green-hover);
      transform: translateY(-1px);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .schedule-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 12.5px;
      color: #a7f3d0;
      margin-top: 14px;
    }

    /* Success Overlay */
    .overlay {
      display: none;
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(8px);
      justify-content: center;
      align-items: center;
      padding: 20px;
      z-index: 100;
    }

    .overlay-content {
      max-width: 460px;
      width: 100%;
      background: var(--card-bg);
      border: 1px solid var(--emerald);
      border-radius: 20px;
      padding: 32px 24px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }

    .success-icon {
      width: 64px;
      height: 64px;
      background: rgba(16, 185, 129, 0.2);
      border: 2px solid var(--emerald);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      margin: 0 auto 16px;
    }

    .overlay h2 {
      font-size: 22px;
      font-weight: 800;
      margin-bottom: 8px;
    }

    .checklist {
      text-align: left;
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      border-radius: 12px;
      padding: 14px 16px;
      margin: 18px 0;
      font-size: 13px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .check-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #e2e8f0;
    }

    .btn-done {
      width: 100%;
      background: #334155;
      color: #fff;
      border: none;
      font-family: inherit;
      font-size: 14px;
      font-weight: 700;
      padding: 12px;
      border-radius: 10px;
      cursor: pointer;
    }

    .btn-done:hover {
      background: #475569;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">⚡ 1-Click Windows Setup</div>
      <h1>Blinkit Deal Hunter</h1>
      <p class="subtitle">Scout 80%+ clearance discounts and send alerts straight to Telegram.</p>
    </div>

    <!-- 1. Telegram Settings -->
    <div class="section-card">
      <div class="section-header">
        <span class="section-num">1</span>
        <span>Telegram Bot Alerts</span>
      </div>

      <div class="field-group">
        <label>Telegram Bot Token</label>
        <div class="input-row">
          <input type="text" id="token" placeholder="123456789:ABCdefGhIJKlmNoPQRstuvWXyz" autocomplete="off">
        </div>
        <a class="help-link" href="https://t.me/BotFather" target="_blank">👉 Create free bot with @BotFather</a>
      </div>

      <div class="field-group">
        <label>Telegram Chat ID or Channel Username</label>
        <div class="input-row">
          <input type="text" id="chatId" placeholder="e.g. 123456789 or @my_deals" autocomplete="off">
          <button class="btn-action btn-test" type="button" onclick="testTelegramBot()">🔔 Test Ping</button>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <a class="help-link" href="https://t.me/userinfobot" target="_blank">👉 Find your numeric ID with @userinfobot</a>
          <span id="test-status" class="status-msg"></span>
        </div>
      </div>
    </div>

    <!-- 2. Location Settings -->
    <div class="section-card">
      <div class="section-header">
        <span class="section-num">2</span>
        <span>Delivery Location Coordinates</span>
      </div>

      <div class="field-group">
        <label>Auto-Detect Location (Fastest)</label>
        <div class="input-row">
          <button class="btn-action btn-locate" type="button" style="width:100%;" onclick="autoDetectLocation()">
            📍 1-Click Detect My Location
          </button>
        </div>
        <div id="locate-status" class="status-msg"></div>
      </div>

      <div class="field-group" style="margin-top:10px;">
        <label>Or Paste Google Maps Link</label>
        <input type="text" id="mapsLink" placeholder="Paste link (e.g. https://maps.google.com/?q=13.038,77.601)" oninput="parseMapsLink()">
      </div>

      <div class="coords-grid">
        <div>
          <label>Latitude (Lat)</label>
          <input type="text" id="lat" placeholder="13.0388595">
        </div>
        <div>
          <label>Longitude (Lon)</label>
          <input type="text" id="lon" placeholder="77.601251">
        </div>
      </div>
    </div>

    <!-- 3. Preferences -->
    <div class="section-card">
      <div class="section-header">
        <span class="section-num">3</span>
        <span>Discount Threshold</span>
      </div>
      <label>Alert me when discounts are at least:</label>
      <div class="discount-pills">
        <div class="pill" onclick="setDiscount(70)">70% OFF</div>
        <div class="pill" onclick="setDiscount(75)">75% OFF</div>
        <div class="pill active" onclick="setDiscount(80)">80% OFF</div>
        <div class="pill" onclick="setDiscount(85)">85% OFF</div>
        <div class="pill" onclick="setDiscount(90)">90% OFF</div>
      </div>
      <input type="hidden" id="minDiscount" value="80">

      <div class="schedule-badge">
        <span>⏰</span>
        <span><b>Automated Schedule:</b> Runs silently every hour at <b>:10</b> past the hour (e.g. 1:10, 2:10) via Windows Task Scheduler.</span>
      </div>
    </div>

    <!-- Save Button -->
    <button class="btn-submit" id="btn-save" type="button" onclick="saveConfiguration()">
      🚀 Save & Enable Hourly Deal Hunter
    </button>
    <div id="save-status" class="status-msg" style="text-align:center; margin-top:8px;"></div>
  </div>

  <!-- Success Overlay -->
  <div class="overlay" id="success-overlay">
    <div class="overlay-content">
      <div class="success-icon">🎉</div>
      <h2>Deal Hunter is Active!</h2>
      <p style="color:var(--text-muted); font-size:14px;">Your deal hunter is scheduled and running in the background.</p>

      <div class="checklist">
        <div class="check-item">✅ Telegram Bot connected</div>
        <div class="check-item">✅ Delivery coordinates saved</div>
        <div class="check-item">✅ Windows Task Scheduler enabled (Every hour at :10)</div>
        <div class="check-item">✅ Initial live scan triggered in background</div>
      </div>

      <p style="font-size:12.5px; color:#94a3b8; margin-bottom:16px;">
        Check your Telegram chat! If 80%+ clearance deals are available at your location, you'll receive them in a few seconds.
      </p>

      <button class="btn-done" type="button" onclick="closeWizard()">Done & Close Setup</button>
    </div>
  </div>

  <script>
    // Load existing values on launch
    fetch('/api/config')
      .then(res => res.json())
      .then(cfg => {
        if (cfg.token) document.getElementById('token').value = cfg.token;
        if (cfg.chatId) document.getElementById('chatId').value = cfg.chatId;
        if (cfg.lat) document.getElementById('lat').value = cfg.lat;
        if (cfg.lon) document.getElementById('lon').value = cfg.lon;
        if (cfg.minDiscount) setDiscount(parseInt(cfg.minDiscount, 10) || 80);
      })
      .catch(() => {});

    function setDiscount(val) {
      document.getElementById('minDiscount').value = val;
      document.querySelectorAll('.pill').forEach(pill => {
        pill.classList.toggle('active', pill.textContent.includes(val + '%'));
      });
    }

    // 1-Click Browser Geolocation
    function autoDetectLocation() {
      const status = document.getElementById('locate-status');
      status.className = 'status-msg';
      status.style.display = 'block';
      status.textContent = 'Requesting browser GPS location... Please click "Allow".';

      if (!navigator.geolocation) {
        status.className = 'status-msg error';
        status.textContent = 'Geolocation not supported by this browser. Trying IP location...';
        detectViaIp();
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          document.getElementById('lat').value = pos.coords.latitude.toFixed(7);
          document.getElementById('lon').value = pos.coords.longitude.toFixed(7);
          status.className = 'status-msg success';
          status.textContent = '✓ Location detected successfully via GPS!';
        },
        (err) => {
          console.warn('Browser geolocation denied/failed:', err);
          status.className = 'status-msg';
          status.textContent = 'GPS permission denied. Trying IP location fallback...';
          detectViaIp();
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }

    function detectViaIp() {
      const status = document.getElementById('locate-status');
      fetch('https://ipapi.co/json/')
        .then(r => r.json())
        .then(data => {
          if (data.latitude && data.longitude) {
            document.getElementById('lat').value = data.latitude;
            document.getElementById('lon').value = data.longitude;
            status.className = 'status-msg success';
            status.textContent = '✓ Estimated location detected from IP (' + (data.city || 'Your Area') + ')!';
          } else {
            throw new Error('No coords');
          }
        })
        .catch(() => {
          status.className = 'status-msg error';
          status.textContent = 'Could not auto-detect. Please paste your Google Maps link or coordinates below.';
        });
    }

    // Parse Google Maps Link
    function parseMapsLink() {
      const val = document.getElementById('mapsLink').value.trim();
      if (!val) return;

      // Match @13.0388595,77.601251 or ?q=13.0388595,77.601251
      const atMatch = val.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      const qMatch = val.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
      const rawMatch = val.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/);

      const match = atMatch || qMatch || rawMatch;
      if (match) {
        document.getElementById('lat').value = match[1];
        document.getElementById('lon').value = match[2];
        const status = document.getElementById('locate-status');
        status.className = 'status-msg success';
        status.textContent = '✓ Coordinates extracted from Google Maps link!';
      }
    }

    // Test Telegram Bot
    function testTelegramBot() {
      const token = document.getElementById('token').value.trim();
      const chatId = document.getElementById('chatId').value.trim();
      const status = document.getElementById('test-status');

      if (!token || !chatId) {
        status.className = 'status-msg error';
        status.textContent = 'Enter Token and Chat ID first';
        return;
      }

      status.className = 'status-msg';
      status.style.display = 'block';
      status.textContent = 'Sending ping...';

      fetch('/api/test-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, chatId })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          status.className = 'status-msg success';
          status.textContent = '✓ Message delivered!';
        } else {
          status.className = 'status-msg error';
          status.textContent = '✕ Error: ' + (data.error || 'Failed');
        }
      })
      .catch(err => {
        status.className = 'status-msg error';
        status.textContent = '✕ Connection failed';
      });
    }

    // Save and Schedule
    function saveConfiguration() {
      const token = document.getElementById('token').value.trim();
      const chatId = document.getElementById('chatId').value.trim();
      const lat = document.getElementById('lat').value.trim();
      const lon = document.getElementById('lon').value.trim();
      const minDiscount = document.getElementById('minDiscount').value;
      const status = document.getElementById('save-status');
      const btn = document.getElementById('btn-save');

      if (!token || !chatId) {
        status.className = 'status-msg error';
        status.textContent = 'Please provide your Telegram Bot Token and Chat ID.';
        return;
      }

      if (!lat || !lon) {
        status.className = 'status-msg error';
        status.textContent = 'Please provide or auto-detect your delivery coordinates.';
        return;
      }

      btn.disabled = true;
      btn.textContent = '⏳ Registering Scheduled Task & Starting...';
      status.className = 'status-msg';
      status.style.display = 'none';

      fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, chatId, lat, lon, minDiscount })
      })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          document.getElementById('success-overlay').style.display = 'flex';
        } else {
          btn.disabled = false;
          btn.textContent = '🚀 Save & Enable Hourly Deal Hunter';
          status.className = 'status-msg error';
          status.textContent = 'Error: ' + (data.error || 'Failed to register task');
        }
      })
      .catch(err => {
        btn.disabled = false;
        btn.textContent = '🚀 Save & Enable Hourly Deal Hunter';
        status.className = 'status-msg error';
        status.textContent = 'Network error: ' + err.message;
      });
    }

    function closeWizard() {
      fetch('/api/shutdown', { method: 'POST' }).catch(() => {});
      window.close();
      document.body.innerHTML = '<div style="text-align:center; padding:40px; color:#fff; font-family:sans-serif;"><h2>Setup Complete!</h2><p>You can close this tab now. The Deal Hunter is active in the background.</p></div>';
    }
  </script>
</body>
</html>`;

// Start Server
const server = http.createServer((req, res) => {
  // CORS & standard headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Serve Main UI
  if (req.url === '/' || req.url === '/setup') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML_PAGE);
    return;
  }

  // Get current config
  if (req.url === '/api/config' && req.method === 'GET') {
    const config = loadExistingEnv();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(config));
    return;
  }

  // Test Telegram Bot
  if (req.url === '/api/test-telegram' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { token, chatId } = JSON.parse(body);
        const result = await testTelegram(token, chatId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Save & Register
  if (req.url === '/api/save' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const config = JSON.parse(body);
        saveEnvFile(config);
        const taskResult = await registerScheduledTask();

        if (taskResult.success) {
          triggerInitialHunt();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: taskResult.error }));
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Shutdown server
  if (req.url === '/api/shutdown' && req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    setTimeout(() => {
      console.log('[SetupWizard] Setup completed. Shutting down setup server.');
      process.exit(0);
    }, 1000);
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n======================================================`);
  console.log(`⚡ Blinkit Deal Hunter - Setup Wizard`);
  console.log(`🌐 Server running at: http://localhost:${PORT}`);
  console.log(`======================================================\n`);

  // Open browser automatically on Windows
  exec(`start http://localhost:${PORT}`);
});
