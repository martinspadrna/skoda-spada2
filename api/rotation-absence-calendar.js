const { requireAdmin } = require('./_admin-auth');
const https = require('node:https');

const CALENDAR_HOST = 'calendar.google.com';
const MAX_ICS_BYTES = 2 * 1024 * 1024;
const DNS_CACHE_MS = 10 * 60 * 1000;
const CALENDAR_HEADERS = {
  accept: 'text/calendar,text/plain;q=0.9,*/*;q=0.8',
  'user-agent': 'RaK rotation absence calendar importer'
};
let cachedCalendarAddress = '';
let cachedCalendarAddressAt = 0;

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

function validIpv4(value) {
  const parts = String(value || '').split('.');
  return parts.length === 4 && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) >= 0 && Number(part) <= 255);
}

async function resolveCalendarIpv4() {
  if (cachedCalendarAddress && Date.now() - cachedCalendarAddressAt < DNS_CACHE_MS) return cachedCalendarAddress;
  const response = await fetch(`https://1.1.1.1/dns-query?name=${encodeURIComponent(CALENDAR_HOST)}&type=A`, {
    headers: { accept: 'application/dns-json' },
    signal: AbortSignal.timeout(7000)
  });
  if (!response.ok) throw new Error(`calendar_dns_failed:${response.status}`);
  const payload = await response.json();
  const address = (Array.isArray(payload && payload.Answer) ? payload.Answer : [])
    .filter((answer) => Number(answer && answer.type) === 1)
    .map((answer) => String(answer && answer.data || '').trim())
    .find(validIpv4);
  if (!address) throw new Error('calendar_dns_no_address');
  cachedCalendarAddress = address;
  cachedCalendarAddressAt = Date.now();
  return address;
}

function fetchCalendarViaHttps(url, redirectCount = 0, resolvedAddress = '') {
  return new Promise((resolve, reject) => {
    const target = new URL(url);
    const requestOptions = {
      family: 4,
      hostname: validIpv4(resolvedAddress) ? resolvedAddress : target.hostname,
      port: 443,
      path: target.pathname + target.search,
      servername: target.hostname,
      rejectUnauthorized: true,
      headers: Object.assign({ host: target.host }, CALENDAR_HEADERS),
      timeout: 15000
    };
    const request = https.get(requestOptions, (response) => {
      const status = Number(response.statusCode || 0);
      const location = String(response.headers.location || '').trim();
      if (status >= 300 && status < 400 && location && redirectCount < 3) {
        response.resume();
        const nextUrl = new URL(location, url).toString();
        if (!validCalendarUrl(nextUrl)) {
          reject(new Error('calendar_redirect_not_allowed'));
          return;
        }
        fetchCalendarViaHttps(nextUrl, redirectCount + 1, resolvedAddress).then(resolve, reject);
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
    try {
      return await fetchCalendarViaHttps(url);
    } catch (httpsError) {
      if (calendarErrorReason(httpsError) !== 'ENOTFOUND') throw httpsError;
      const resolvedAddress = await resolveCalendarIpv4();
      return fetchCalendarViaHttps(url, 0, resolvedAddress);
    }
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
