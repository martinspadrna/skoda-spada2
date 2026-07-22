const SUPABASE_URL = String(
  process.env.RAK_SUPABASE_URL
  || process.env.SUPABASE_URL
  || process.env.NEXT_PUBLIC_SUPABASE_URL
  || ''
).replace(/\/$/, '');
const PUBLISHABLE_KEY = String(
  process.env.RAK_SUPABASE_PUBLISHABLE_KEY
  || process.env.SUPABASE_PUBLISHABLE_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  || process.env.SUPABASE_ANON_KEY
  || ''
);

function sendJson(res, status, payload) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(status).json(payload);
}

function sameOriginRequest(req) {
  const origin = String(req.headers.origin || '').trim();
  if (!origin) return true;
  const configured = String(process.env.RAK_ALLOWED_ORIGIN || '').replace(/\/$/, '');
  if (configured) return origin === configured;
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').trim();
  const protocol = String(req.headers['x-forwarded-proto'] || 'https').trim();
  return !!host && origin === `${protocol}://${host}`;
}

function bearerToken(req) {
  const value = String(req.headers.authorization || '').trim();
  return /^Bearer\s+\S+$/i.test(value) ? value.replace(/^Bearer\s+/i, '') : '';
}

async function supabaseRequest(path, options = {}) {
  if (!SUPABASE_URL || !PUBLISHABLE_KEY) throw new Error('server_auth_not_configured');
  return fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: PUBLISHABLE_KEY,
      ...(options.headers || {})
    }
  });
}

async function requireAdmin(req, options = {}) {
  if (!sameOriginRequest(req)) return { ok: false, status: 403, error: 'origin_not_allowed' };
  const token = bearerToken(req);
  if (!token) return { ok: false, status: 401, error: 'authentication_required' };

  const userResponse = await supabaseRequest('/auth/v1/user', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!userResponse.ok) return { ok: false, status: 401, error: 'invalid_session' };
  const user = await userResponse.json();
  if (!user || !user.id) return { ok: false, status: 401, error: 'invalid_session' };

  const profileResponse = await supabaseRequest('/rest/v1/rpc/rak_admin_context', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: '{}'
  });
  if (!profileResponse.ok) return { ok: false, status: 403, error: 'admin_permission_required' };
  const context = await profileResponse.json();
  const profile = context && typeof context === 'object' ? {
    user_id: context.user_id,
    account_id: context.account_id,
    display_name: context.display_name,
    role: context.role,
    enabled: true
  } : null;
  if (!profile || String(profile.user_id || '') !== String(user.id) || (profile.role !== 'owner' && profile.role !== 'admin')) {
    return { ok: false, status: 403, error: 'admin_permission_required' };
  }
  if (options.ownerOnly && profile.role !== 'owner') {
    return { ok: false, status: 403, error: 'owner_permission_required' };
  }
  return { ok: true, token, user, profile };
}

module.exports = {
  SUPABASE_URL,
  PUBLISHABLE_KEY,
  bearerToken,
  requireAdmin,
  sameOriginRequest,
  sendJson,
  supabaseRequest
};
