module.exports = function retiredRotationAbsenceCalendar(_req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.status(410).json({ ok: false, error: 'calendar_endpoint_moved' });
};
