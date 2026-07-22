const { requireAdmin } = require('./_admin-auth');

function setResponseHeaders(res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Vary', 'Authorization');
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
    if (!/^https:\/\/calendar\.google\.com\/calendar\/ical\//i.test(url)) {
      res.status(500).json({ ok: false, error: 'invalid_calendar_url' });
      return;
    }
    const response = await fetch(url, {
      headers: {
        accept: 'text/calendar,text/plain;q=0.9,*/*;q=0.8',
        'user-agent': 'RaK rotation absence calendar importer'
      }
    });
    if (!response.ok) {
      res.status(502).json({ ok: false, error: 'calendar_fetch_failed', status: response.status });
      return;
    }
    const text = await response.text();
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.status(200).send(text);
  } catch (err) {
    res.status(502).json({ ok: false, error: 'calendar_fetch_failed', message: err && err.message ? err.message : String(err || '') });
  }
};
