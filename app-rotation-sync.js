// RaK 1.2 (1.155) – online synchronizace rozpisů oddělená ze startovacích vazeb aplikace.
function applyRakRotationState(payload, options) {
  const next = typeof normalizeRotationData === 'function' ? normalizeRotationData(payload) : payload;
  if (!next || !next.months) return null;

  const nextText = JSON.stringify(next);
  const currentText = JSON.stringify(typeof app !== 'undefined' && app.rotation ? app.rotation : null);
  if (!options?.force && nextText === currentText) return next;

  if (typeof app !== 'undefined') {
    app.rotation = next;
    if (!app.selectedYear || !getAvailableYears(app.rotation).includes(parseInt(app.selectedYear, 10))) {
      app.selectedYear = getInitialSelectedYear(app.rotation);
    }
  }

  if (typeof saveRotationData === 'function') saveRotationData();
  if (typeof renderRotace === 'function') renderRotace();
  if (typeof renderStatsPanel === 'function') renderStatsPanel();
  if (typeof app !== 'undefined' && app.selectedMonth && typeof renderMonth === 'function') renderMonth(app.selectedMonth);
  if (typeof app !== 'undefined' && app.selectedName && typeof renderPerson === 'function') renderPerson(app.selectedName);
  if (typeof updateImportBoxVisibility === 'function') updateImportBoxVisibility();
  return next;
}

function refreshRakMachineSettingsInBackground(bridge) {
  if (!bridge || typeof bridge.loadMachineSettings !== 'function' || typeof app === 'undefined') return;
  void bridge.loadMachineSettings()
    .then((rows) => {
      if (Array.isArray(rows) && rows.length) app.machineSettingsRows = rows;
    })
    .catch((settingsErr) => console.warn('Machine settings sync failed', settingsErr));
}

async function syncRotationFromSupabase(force) {
  const bridge = window.RotationSupabaseBridge;
  if (!bridge || typeof bridge.loadRotationState !== 'function') return null;
  if (force !== 'discard-draft' && typeof app !== 'undefined' && app && app.adminRotationDirty === true && document.getElementById('adminRotationEditor')) return null;
  try {
    if (typeof bridge.loadCachedRotationState === 'function') {
      const cached = bridge.loadCachedRotationState();
      if (cached && cached.payload) applyRakRotationState(cached.payload, { force: false });
    }
    refreshRakMachineSettingsInBackground(bridge);
    const remote = await bridge.loadRotationState();
    if (!remote || !remote.payload) return null;
    return applyRakRotationState(remote.payload, { force: !!force });
  } catch (err) {
    console.warn('Supabase rotation sync failed', err);
    return null;
  }
}

function getRakAdminPinForWrite() {
  if (typeof app === 'undefined' || !app.adminUnlocked) return '';
  if (app.adminPin) return String(app.adminPin);
  try {
    return String(sessionStorage.getItem('adminPinSession') || '');
  } catch (err) {
    return '';
  }
}

function isRakAdminRotationWrite(meta) {
  if (typeof app === 'undefined' || !app.adminUnlocked) return false;
  const source = String(meta && meta.source ? meta.source : '').trim();
  return source === 'admin-menu'
    || source === 'admin-daymod'
    || source === 'excel-import'
    || source === 'admin-excel-import';
}

async function saveRotationToSupabase(rotation, meta) {
  const bridge = window.RotationSupabaseBridge;
  if (!bridge || typeof bridge.saveRotationState !== 'function') return { ok: false, reason: 'missing-bridge' };
  if (!isRakAdminRotationWrite(meta || {})) return { ok: false, reason: 'admin-required' };
  const adminPin = getRakAdminPinForWrite();
  if (!adminPin && !(typeof app !== 'undefined' && app && app.adminAuthVersion === 2)) return { ok: false, reason: 'admin-auth-required' };
  try {
    return await bridge.saveRotationState(rotation, meta || {}, { adminPin });
  } catch (err) {
    console.warn('Supabase rotation save helper failed', err);
    return { ok: false, error: err };
  }
}

window.syncRotationFromSupabase = syncRotationFromSupabase;
window.saveRotationToSupabase = saveRotationToSupabase;
