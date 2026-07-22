module.exports = function retiredAdminUsers(_req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.status(410).json({ ok: false, error: 'admin_users_endpoint_moved' });
};
