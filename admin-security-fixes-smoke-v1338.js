const fs = require('node:fs');

const configSource = fs.readFileSync('supabase-config.js', 'utf8');
const projectUrl = (configSource.match(/url:\s*"([^"]+)"/) || [])[1] || '';
const publishableKey = (configSource.match(/publishableKey:\s*"([^"]+)"/) || [])[1] || '';
const ownerPassword = String(process.env.RAK_TEST_OWNER_PASSWORD || '');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function jsonRequest(path, options = {}) {
  const response = await fetch(projectUrl + path, options);
  const payload = await response.json().catch(() => ({}));
  return { response, payload };
}

async function run() {
  assert(projectUrl && publishableKey, 'Chybí veřejná Supabase konfigurace.');
  assert(ownerPassword.length >= 6, 'Nastav RAK_TEST_OWNER_PASSWORD pro živý smoke test.');

  const auth = await jsonRequest('/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { apikey: publishableKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: '9811@admin.rak.local', password: ownerPassword })
  });
  assert(auth.response.ok && auth.payload.access_token, 'Přihlášení hlavního admina selhalo.');
  const accessToken = auth.payload.access_token;
  const headers = {
    apikey: publishableKey,
    Authorization: 'Bearer ' + accessToken,
    'Content-Type': 'application/json'
  };

  const settings = await jsonRequest('/rest/v1/machine_settings?select=machine_key,machine_code,machine_index,label,category,speed,cycle_time,dress_time,dress_count,settings_json&limit=1', { headers });
  assert(settings.response.ok && Array.isArray(settings.payload) && settings.payload[0], 'Nelze načíst testovací nastavení.');
  const settingsSave = await jsonRequest('/rest/v1/rpc/rak_admin_save_machine_settings_v2', {
    method: 'POST',
    headers,
    body: JSON.stringify({ p_rows: [settings.payload[0]], p_reason: 'live-smoke-v1338' })
  });
  assert(settingsSave.response.ok && settingsSave.payload.ok, 'Uložení nastavení stále selhá: ' + JSON.stringify(settingsSave.payload));

  const rotation = await jsonRequest('/rest/v1/rotation_state?select=key,payload,meta,revision&key=eq.main', { headers });
  assert(rotation.response.ok && Array.isArray(rotation.payload) && rotation.payload[0], 'Nelze načíst online rozpis.');
  const current = rotation.payload[0];
  const rotationSave = await jsonRequest('/rest/v1/rpc/rak_admin_save_rotation_v2', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      p_key: current.key,
      p_payload: current.payload,
      p_meta: Object.assign({}, current.meta || {}, { source: 'live-smoke-v1338' }),
      p_expected_revision: current.revision
    })
  });
  assert(rotationSave.response.ok && rotationSave.payload.ok, 'Revizní uložení rozpisu selhá: ' + JSON.stringify(rotationSave.payload));

  const backupCreate = await jsonRequest('/rest/v1/rpc/rak_owner_create_settings_backup_v2', {
    method: 'POST',
    headers,
    body: JSON.stringify({ p_snapshot: { rows: [settings.payload[0]] }, p_source: 'live-smoke-v1338', p_app_version: '1.2 (1.338)' })
  });
  assert(backupCreate.response.ok && backupCreate.payload.id, 'Vytvoření dočasné zálohy selhalo.');
  const backupDelete = await jsonRequest('/rest/v1/rpc/rak_owner_delete_settings_backup_v2', {
    method: 'POST',
    headers,
    body: JSON.stringify({ p_backup_id: backupCreate.payload.id })
  });
  assert(backupDelete.response.ok && backupDelete.payload.ok, 'Smazání dočasné zálohy selhalo.');

  const wrongPasswordCheck = await jsonRequest('/functions/v1/rak-admin-users', {
    method: 'POST',
    headers: Object.assign({}, headers, { Origin: 'https://skoda-spada.vercel.app' }),
    body: JSON.stringify({
      action: 'change-owner-password',
      currentPassword: ownerPassword + '-wrong',
      newPassword: 'RaK-live-smoke-password-not-applied'
    })
  });
  assert(wrongPasswordCheck.response.status === 403 && wrongPasswordCheck.payload.error === 'invalid_current_password', 'Změna hesla neověřila současné heslo.');

  console.log(JSON.stringify({
    ok: true,
    settingsSaved: settingsSave.payload.saved_count,
    rotationRevision: rotationSave.payload.revision,
    temporaryBackupDeleted: backupDelete.payload.id,
    passwordGuard: wrongPasswordCheck.payload.error
  }));
}

run().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});
