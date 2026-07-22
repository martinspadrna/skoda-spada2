const { SUPABASE_URL, requireAdmin, sendJson } = require('./_admin-auth');

const SECRET_KEY = String(
  process.env.RAK_SUPABASE_SERVICE_ROLE_KEY
  || process.env.RAK_SUPABASE_SECRET_KEY
  || process.env.SUPABASE_SERVICE_ROLE_KEY
  || process.env.SUPABASE_SECRET_KEY
  || ''
);

async function secretRequest(path, options = {}) {
  if (!SUPABASE_URL || !SECRET_KEY) throw new Error('server_admin_not_configured');
  return fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SECRET_KEY,
      Authorization: `Bearer ${SECRET_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
}

function validAccountId(value) {
  const accountId = String(value || '').trim();
  return /^\d{4,12}$/.test(accountId) && accountId !== '9811' ? accountId : '';
}

async function readProfile(accountId) {
  const response = await secretRequest(`/rest/v1/rak_admin_profiles?select=user_id,account_id,display_name,role,enabled&account_id=eq.${encodeURIComponent(accountId)}&limit=1`);
  if (!response.ok) throw new Error(`profile_lookup_failed:${response.status}`);
  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] : null;
}

async function createAuthUser(accountId, password, displayName) {
  const response = await secretRequest('/auth/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify({
      email: `${accountId}@admin.rak.local`,
      password,
      email_confirm: true,
      app_metadata: { rak_account_id: accountId, rak_role: 'admin' },
      user_metadata: { display_name: displayName }
    })
  });
  if (!response.ok) throw new Error(`auth_user_create_failed:${response.status}:${await response.text()}`);
  return response.json();
}

async function updateAuthUser(userId, attributes) {
  const response = await secretRequest(`/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    body: JSON.stringify(attributes)
  });
  if (!response.ok) throw new Error(`auth_user_update_failed:${response.status}:${await response.text()}`);
  return response.json();
}

async function saveProfile(userId, accountId, displayName, enabled, ownerUserId) {
  const response = await secretRequest('/rest/v1/rak_admin_profiles?on_conflict=account_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify({
      user_id: userId,
      account_id: accountId,
      display_name: displayName,
      role: 'admin',
      enabled,
      created_by: ownerUserId,
      updated_at: new Date().toISOString()
    })
  });
  if (!response.ok) throw new Error(`profile_save_failed:${response.status}:${await response.text()}`);
  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] : null;
}

module.exports = async function adminUsers(req, res) {
  res.setHeader('Allow', 'POST');
  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, error: 'method_not_allowed' });
    return;
  }
  try {
    const admin = await requireAdmin(req, { ownerOnly: true });
    if (!admin.ok) {
      sendJson(res, admin.status, { ok: false, error: admin.error });
      return;
    }
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const accountId = validAccountId(body.accountId);
    const displayName = String(body.displayName || '').trim().slice(0, 120);
    const password = String(body.password || '');
    const enabled = body.enabled !== false;
    if (!accountId || !displayName) {
      sendJson(res, 400, { ok: false, error: 'invalid_admin_profile' });
      return;
    }
    if (password && (password.length < 8 || password.length > 128)) {
      sendJson(res, 400, { ok: false, error: 'invalid_password_length' });
      return;
    }

    let profile = await readProfile(accountId);
    let userId = profile && profile.user_id ? profile.user_id : '';
    if (!userId) {
      if (!password) {
        sendJson(res, 400, { ok: false, error: 'password_required_for_new_admin' });
        return;
      }
      const created = await createAuthUser(accountId, password, displayName);
      const user = created && created.user ? created.user : created;
      userId = String(user && user.id || '');
      if (!userId) throw new Error('auth_user_create_missing_id');
    } else if (password) {
      await updateAuthUser(userId, {
        password,
        app_metadata: { rak_account_id: accountId, rak_role: 'admin' },
        user_metadata: { display_name: displayName }
      });
    }

    profile = await saveProfile(userId, accountId, displayName, enabled, admin.user.id);
    sendJson(res, 200, {
      ok: true,
      profile: {
        accountId: profile.account_id,
        displayName: profile.display_name,
        role: profile.role,
        enabled: profile.enabled
      }
    });
  } catch (error) {
    const configurationError = /server_(auth|admin)_not_configured/.test(String(error && error.message || error));
    sendJson(res, configurationError ? 503 : 500, {
      ok: false,
      error: configurationError ? 'server_not_configured' : 'admin_user_save_failed'
    });
  }
};
