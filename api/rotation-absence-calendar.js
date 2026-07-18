const DEFAULT_ABSENCE_ICS_URL = 'https://calendar.google.com/calendar/ical/31eea99edff1771be15ba877f7c2f5b1371e0a742ad9d54fca526d41eafa5995%40group.calendar.google.com/private-20207b8c912744f47f557dbde95c6815/basic.ics';

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
}

module.exports = async function rotationAbsenceCalendar(req, res) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.status(405).json({ ok: false, error: 'method_not_allowed' });
    return;
  }

  try {
    const url = String(process.env.RAK_ABSENCE_ICS_URL || DEFAULT_ABSENCE_ICS_URL).trim();
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
