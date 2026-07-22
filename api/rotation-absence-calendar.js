const { requireAdmin } = require('./_admin-auth');
const https = require('node:https');

const CALENDAR_HOST = 'calendar.google.com';
const MAX_ICS_BYTES = 2 * 1024 * 1024;
const CALENDAR_HEADERS = {
  accept: 'text/calendar,text/plain;q=0.9,*/*;q=0.8',
  'user-agent': 'RaK rotation absence calendar importer'
};

function setResponseHeaders(res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Vary', 'Authorization');
}

function validCalendarUrl(value) {
  try {
    const parsed = new URL(String(value || ''));
    return parsed.protocol === 'https:'
      && parsed.hostname === CALENDAR_HOST
      && parsed.pathname.startsWith('/calendar/ical/');
  } catch (error) {
    return false;
  }
}

function fetchCalendarViaHttps(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      family: 4,
      headers: CALENDAR_HEADERS,
      timeout: 15000
    }, (response) => {
      const status = Number(response.statusCode || 0);
      const location = String(response.headers.location || '').trim();
      if (status >= 300 && status < 400 && location && redirectCount < 3) {
        response.resume();
        const nextUrl = new URL(location, url).toString();
        if (!validCalendarUrl(nextUrl)) {
          reject(new Error('calendar_redirect_not_allowed'));
          return;
        }
        fetchCalendarViaHttps(nextUrl, redirectCount + 1).then(resolve, reject);
        return;
      }
      if (status < 200 || status >= 300) {
        response.resume();
        const error = new Error(`calendar_fetch_failed:${status}`);
        error.status = status;
        reject(error);
        return;
      }
      const chunks = [];
      let totalBytes = 0;
      response.on('data', (chunk) => {
        totalBytes += chunk.length;
        if (totalBytes > MAX_ICS_BYTES) {
          request.destroy(new Error('calendar_response_too_large'));
          return;
        }
        chunks.push(chunk);
      });
      response.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
    request.on('timeout', () => request.destroy(new Error('calendar_fetch_timeout')));
    request.on('error', reject);
  });
}

async function loadCalendarText(url) {
  try {
    const response = await fetch(url, {
      headers: CALENDAR_HEADERS,
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) {
      const error = new Error(`calendar_fetch_failed:${response.status}`);
      error.status = response.status;
      throw error;
    }
    const text = await response.text();
    if (Buffer.byteLength(text, 'utf8') > MAX_ICS_BYTES) throw new Error('calendar_response_too_large');
    return text;
  } catch (fetchError) {
    return fetchCalendarViaHttps(url);
  }
}

function calendarErrorReason(error) {
  const values = [
    error && error.code,
    error && error.cause && error.cause.code,
    error && error.message,
    error && error.cause && error.cause.message
  ].map((value) => String(value || '')).filter(Boolean);
  const safeCodes = [
    'ENOTFOUND', 'EAI_AGAIN', 'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT',
    'UND_ERR_CONNECT_TIMEOUT', 'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
    'ERR_TLS_CERT_ALTNAME_INVALID', 'calendar_fetch_timeout',
    'calendar_response_too_large', 'calendar_redirect_not_allowed'
  ];
  const matched = safeCodes.find((code) => values.some((value) => value.includes(code)));
  if (matched) return matched;
  const statusMatch = values.join(' ').match(/calendar_fetch_failed:(\d{3})/);
  return statusMatch ? `http_${statusMatch[1]}` : 'network_error';
}

module.exports = async function rotationAbsenceCalendar(req, res) {
  setResponseHeaders(res);
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.status(405).json({ ok: false, error: 'method_not_allowed' });
    return;
  }

  try {
    const admin = await requireAdmin(req);
    if (!admin.ok) {
      res.status(admin.status).json({ ok: false, error: admin.error });
      return;
    }
    const url = String(process.env.RAK_ABSENCE_ICS_URL || '').trim();
    if (!validCalendarUrl(url)) {
      res.status(500).json({ ok: false, error: 'invalid_calendar_url' });
      return;
    }
    const text = await loadCalendarText(url);
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.status(200).send(text);
  } catch (err) {
    const status = Number(err && err.status || 0) || undefined;
    res.status(502).json({ ok: false, error: 'calendar_fetch_failed', status, reason: calendarErrorReason(err) });
  }
};
