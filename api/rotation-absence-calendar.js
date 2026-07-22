const { fetchWithRetry, requireAdmin, SUPABASE_URL } = require('./_admin-auth');

const MAX_ICS_BYTES = 2 * 1024 * 1024;
const PROXY_TOKEN = String(process.env.RAK_CALENDAR_PROXY_TOKEN || '').trim();

function setResponseHeaders(res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Vary', 'Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}

async function loadCalendarText() {
  if (!SUPABASE_URL || !PROXY_TOKEN) throw new Error('calendar_service_not_configured');
  const response = await fetchWithRetry(`${SUPABASE_URL}/functions/v1/rak-absence-calendar`, {
    headers: {
      apikey: PROXY_TOKEN,
      accept: 'text/calendar'
    },
    signal: AbortSignal.timeout(20000)
  });
  if (!response.ok) throw new Error(`calendar_service_failed:${response.status}`);
  const declaredLength = Number(response.headers.get('content-length') || 0);
  if (declaredLength > MAX_ICS_BYTES) throw new Error('calendar_response_too_large');
  const text = await response.text();
  if (Buffer.byteLength(text, 'utf8') > MAX_ICS_BYTES) throw new Error('calendar_response_too_large');
  if (!text.includes('BEGIN:VCALENDAR')) throw new Error('calendar_invalid_response');
  return text;
}

function safeCalendarError(error) {
  const message = String(error && error.message || error || '');
  const code = String(error && (error.code || (error.cause && error.cause.code)) || '');
  if (message === 'calendar_service_not_configured') return 'server_not_configured';
  const status = message.match(/^calendar_service_failed:(\d{3})$/)?.[1];
  if (status) return `edge_http_${status}`;
  if (message === 'calendar_response_too_large') return 'response_too_large';
  if (message === 'calendar_invalid_response') return 'invalid_response';
  if (/timeout/i.test(message)) return 'timeout';
  if (/^(ENOTFOUND|EAI_AGAIN|ECONNRESET|ECONNREFUSED|ETIMEDOUT|UND_ERR_CONNECT_TIMEOUT)$/.test(code)) {
    return code.toLowerCase();
  }
  return 'network_error';
}

module.exports = async function rotationAbsenceCalendar(req, res) {
  setResponseHeaders(res);
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    res.status(405).json({ ok: false, error: 'method_not_allowed' });
    return;
  }

  try {
    const admin = await requireAdmin(req);
    if (!admin.ok) {
      res.status(admin.status).json({ ok: false, error: admin.error });
      return;
    }
    const text = await loadCalendarText();
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.status(200).send(req.method === 'HEAD' ? '' : text);
  } catch (error) {
    res.status(502).json({ ok: false, error: 'calendar_fetch_failed', reason: safeCalendarError(error) });
  }
};
