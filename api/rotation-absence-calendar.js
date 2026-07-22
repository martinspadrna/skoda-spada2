const { requireAdmin, SUPABASE_URL } = require('./_admin-auth');

const MAX_ICS_BYTES = 2 * 1024 * 1024;
const PROXY_TOKEN = String(process.env.RAK_CALENDAR_PROXY_TOKEN || '').trim();

function setResponseHeaders(res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Vary', 'Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}

async function loadCalendarText() {
  if (!SUPABASE_URL || !PROXY_TOKEN) throw new Error('calendar_service_not_configured');
  const response = await fetch(`${SUPABASE_URL}/functions/v1/rak-absence-calendar`, {
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
  } catch {
    res.status(502).json({ ok: false, error: 'calendar_fetch_failed' });
  }
};
