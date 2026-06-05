// RaK 1.2 (1.133) – online synchronizace rozpisů oddělená ze startovacích vazeb aplikace.
async function syncRotationFromSupabase(force) {
  const bridge = window.RotationSupabaseBridge;
  if (!bridge || typeof bridge.loadRotationState !== 'function') return null;
  try {
    let remote = await bridge.loadRotationState();
    if ((!remote || !remote.payload) && typeof bridge.seedFromLocalSnapshot === 'function' && typeof app !== 'undefined' && app.rotation && app.rotation.months && Object.keys(app.rotation.months).length) {
      await bridge.seedFromLocalSnapshot(app.rotation, app.machineSettingsRows || []);
      remote = await bridge.loadRotationState();
    }
    if (!remote || !remote.payload) return null;
    const next = typeof normalizeRotationData === 'function' ? normalizeRotationData(remote.payload) : remote.payload;
    if (!next || !next.months) return null;

    const nextText = JSON.stringify(next);
    const currentText = JSON.stringify(typeof app !== 'undefined' && app.rotation ? app.rotation : null);
    if (!force && nextText === currentText) return next;

    if (typeof app !== 'undefined') {
      app.rotation = next;
      if (!app.selectedYear || !getAvailableYears(app.rotation).includes(parseInt(app.selectedYear, 10))) {
        app.selectedYear = getInitialSelectedYear(app.rotation);
      }
    }

    if (typeof bridge.loadMachineSettings === 'function' && typeof app !== 'undefined') {
      try {
        app.machineSettingsRows = await bridge.loadMachineSettings();
      } catch (settingsErr) {
        console.warn('Machine settings sync failed', settingsErr);
      }
    }

    if (typeof saveRotationData === 'function') saveRotationData();
    if (typeof renderRotace === 'function') renderRotace();
    if (typeof renderStatsPanel === 'function') renderStatsPanel();
    if (typeof app !== 'undefined' && app.selectedMonth && typeof renderMonth === 'function') {
      renderMonth(app.selectedMonth);
    }
    if (typeof app !== 'undefined' && app.selectedName && typeof renderPerson === 'function') {
      renderPerson(app.selectedName);
    }
    if (typeof updateImportBoxVisibility === 'function') updateImportBoxVisibility();
    return next;
  } catch (err) {
    console.warn('Supabase rotation sync failed', err);
    return null;
  }
}

async function saveRotationToSupabase(rotation, meta) {
  const bridge = window.RotationSupabaseBridge;
  if (!bridge || typeof bridge.saveRotationState !== 'function') return { ok: false, reason: 'missing-bridge' };
  try {
    return await bridge.saveRotationState(rotation, meta || {});
  } catch (err) {
    console.warn('Supabase rotation save helper failed', err);
    return { ok: false, error: err };
  }
}

window.syncRotationFromSupabase = syncRotationFromSupabase;
window.saveRotationToSupabase = saveRotationToSupabase;
