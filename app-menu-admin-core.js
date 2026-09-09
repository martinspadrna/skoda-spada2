// RaK – admin data, zálohy, servis/handover a admin renderer oddělené od menu shellu.
try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('app-menu-admin-core.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}

function ensureExcelFileInput() {
  let input = document.getElementById('excelFile');
  if (input) return input;
  input = document.createElement('input');
  input.type = 'file';
  input.id = 'excelFile';
  input.accept = '.xlsx,.xls';
  input.hidden = true;
  input.style.display = 'none';
  document.body.appendChild(input);
  return input;
}

function ensureFullSettingsBackupFileInput() {
  let input = document.getElementById('rakFullSettingsBackupFile');
  if (input && input.dataset.rakFullSettingsBackupBound !== '1') {
    input.dataset.rakFullSettingsBackupBound = '1';
    input.addEventListener('change', (event) => {
      void handleFullSettingsBackupFileSelection(event.target, document.querySelector('#appMenuBody'));
    });
  }
  if (input) return input;
  input = document.createElement('input');
  input.type = 'file';
  input.id = 'rakFullSettingsBackupFile';
  input.accept = '.json,application/json';
  input.hidden = true;
  input.style.display = 'none';
  input.dataset.rakFullSettingsBackupBound = '1';
  input.addEventListener('change', (event) => {
    void handleFullSettingsBackupFileSelection(event.target, document.querySelector('#appMenuBody'));
  });
  document.body.appendChild(input);
  return input;
}

function startMenuImport() {
  const input = ensureExcelFileInput();
  if (!input) {
    alert('Import není připravený.');
    return;
  }
  input.value = '';
  app.pendingMenuImport = true;
  input.click();
}

function startFullSettingsBackupImport() {
  if (!(typeof rakAdminCanManageAdmins === 'function' && rakAdminCanManageAdmins())) return;
  const input = ensureFullSettingsBackupFileInput();
  if (!input) {
    alert('Import zálohy nastavení není připravený.');
    return;
  }
  input.value = '';
  input.click();
}

function adminFullSettingsBackupImportErrorMessage(reason) {
  const safe = String(reason || '').trim();
  if (safe === 'invalid-json') return 'Soubor není platný JSON.';
  if (safe === 'invalid-backup') return 'Soubor nevypadá jako záloha nastavení z této aplikace.';
  if (safe === 'missing-bridge') return 'Online úložiště teď není připravené.';
  if (safe === 'not-allowed') return 'Tuhle zálohu může nahrát jen hlavní admin.';
  if (safe === 'missing-file') return 'Nebyl vybraný žádný soubor.';
  return 'Nahrání zálohy nastavení selhalo.';
}

async function handleFullSettingsBackupFileSelection(input, body) {
  const target = input && input.files ? input : null;
  const file = target && target.files && target.files[0] ? target.files[0] : null;
  if (!file) return;
  if (target.dataset.rakFullSettingsBackupImporting === '1') return;
  target.dataset.rakFullSettingsBackupImporting = '1';
  const autoRestore = !!(typeof app !== 'undefined' && app && app.pendingFullSettingsBackupAutoRestore);
  if (typeof app !== 'undefined' && app) app.pendingFullSettingsBackupAutoRestore = false;
  const statusEl = document.getElementById('adminOnlineSaveStatus');
  try {
    if (statusEl) statusEl.textContent = 'Nahrávám zálohu nastavení…';
    const result = await importAdminFullSettingsBackupFile(file);
    if (!result || result.ok === false) throw new Error(adminFullSettingsBackupImportErrorMessage(result && result.reason));
    let restoreResult = null;
    if (autoRestore) {
      const backupId = result.backup && result.backup.machine_key ? result.backup.machine_key : '';
      const restoreStatus = document.getElementById('adminOnlineSaveStatus');
      if (restoreStatus) restoreStatus.textContent = 'Záloha nahraná, obnovuji nastavení…';
      restoreResult = backupId ? await restoreAdminFullSettingsBackupOnline(backupId) : { ok: false };
      if (!restoreResult || restoreResult.ok === false) throw new Error('Záloha se nahrála, ale obnovení nastavení selhalo.');
    }
    const menuBody = body || document.querySelector('#appMenuBody');
    if (menuBody && typeof renderAdminMenuBody === 'function') renderAdminMenuBody(menuBody, 'settings-backups');
    const nextStatus = document.getElementById('adminOnlineSaveStatus');
    if (nextStatus) nextStatus.textContent = autoRestore ? 'Záloha nahraná ze souboru a nastavení obnovené ✓' : 'Záloha nastavení nahraná online ✓';
  } catch (err) {
    if (statusEl) statusEl.textContent = 'Nahrání zálohy nastavení selhalo.';
    try { alert(err && err.message ? err.message : 'Nahrání zálohy nastavení selhalo.'); } catch (alertErr) {}
  } finally {
    try { delete target.dataset.rakFullSettingsBackupImporting; } catch (err) {}
    try { target.value = ''; } catch (err) {}
  }
}

function formatAdminRotationBackupDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return String(value);
  try {
    return date.toLocaleString('cs-CZ', { dateStyle: 'short', timeStyle: 'short' });
  } catch (err) {
    return date.toLocaleString('cs-CZ');
  }
}

function adminRotationBackupStatusItemHtml(item) {
  const state = String(item && item.state || 'info').trim() || 'info';
  return [
    '<div class="adminRotationBackupStatusItem is' + escapeHtml(state.charAt(0).toUpperCase() + state.slice(1)) + '">',
    '  <span>' + escapeHtml(item && item.title || '') + '</span>',
    '  <b>' + escapeHtml(item && item.value || '') + '</b>',
    item && item.detail ? '  <small>' + escapeHtml(item.detail) + '</small>' : '',
    '</div>'
  ].join('');
}

function buildAdminRotationBackupStatusHtml() {
  const snapshot = app && app.adminRotationBackupsSnapshot ? app.adminRotationBackupsSnapshot : null;
  const backups = snapshot && Array.isArray(snapshot.backups) ? snapshot.backups : [];
  const latest = backups.slice().sort((a, b) => {
    const ad = new Date(a && a.replaced_at || 0).getTime();
    const bd = new Date(b && b.replaced_at || 0).getTime();
    return (Number.isFinite(bd) ? bd : 0) - (Number.isFinite(ad) ? ad : 0);
  })[0] || null;
  const latestMonth = String(latest && latest.month_key || '').trim();
  const latestMonthsCount = Number(latest && latest.month_count) || 0;
  const latestDaymodCount = Number(latest && latest.daymod_count) || 0;
  const loadedAt = snapshot && snapshot.at ? formatAdminRotationBackupDate(snapshot.at) : '';
  const errorMessage = snapshot && snapshot.ok === false
    ? (snapshot.error && snapshot.error.message ? snapshot.error.message : (snapshot.reason || 'Zálohy se nepodařilo načíst.'))
    : '';
  const items = [
    {
      state: snapshot && snapshot.loading ? 'info' : (snapshot && snapshot.ok === false ? 'warn' : (backups.length ? 'ok' : 'warn')),
      title: 'Stav',
      value: snapshot && snapshot.loading ? 'načítám' : (snapshot && snapshot.ok === false ? 'chyba' : (backups.length ? 'načteno' : 'nenačteno')),
      detail: errorMessage || (loadedAt ? ('Poslední načtení: ' + loadedAt + '.') : 'Klikni na Načíst zálohy před obnovou.')
    },
    {
      state: backups.length ? 'ok' : 'info',
      title: 'Počet záloh',
      value: String(backups.length),
      detail: backups.length ? 'Zobrazuje se posledních online záloh.' : 'Po načtení se tady ukáže dostupný seznam.'
    },
    {
      state: latest ? 'ok' : 'info',
      title: 'Nejnovější',
      value: latest ? formatAdminRotationBackupDate(latest.replaced_at) : '—',
      detail: latest ? ([latestMonth ? ('měsíc ' + latestMonth) : '', latestMonthsCount ? (String(latestMonthsCount) + ' měsíců') : '', latestDaymodCount ? (String(latestDaymodCount) + ' výjimek') : ''].filter(Boolean).join(' · ') || 'Online záloha rozpisu.') : 'Zatím není načtená žádná záloha.'
    },
    {
      state: 'info',
      title: 'Obnova',
      value: 'přepíše rozpis',
      detail: 'Před obnovou se současný stav uloží jako další záloha.'
    }
  ];
  return [
    '<details class="appMenuFoldSection adminRotationBackupStatus">',
    '  <summary class="appMenuSubTitle">Stav záloh</summary>',
    '  <div class="smallText uMb10">Rychlá kontrola před obnovou. Tahle část sama nic neobnovuje ani neukládá.</div>',
    '  <div class="adminRotationBackupStatusGrid">',
    items.map(adminRotationBackupStatusItemHtml).join(''),
    '  </div>',
    '</details>'
  ].join('');
}

const RAK_ROTATION_SAVE_BACKUP_CATEGORY = 'rotation_save_backup';
const RAK_ROTATION_SAVE_BACKUP_KEY_PREFIX = 'ROTATION_SAVE_BACKUP_';
const RAK_ROTATION_SAVE_BACKUP_MAX = 8;

function isRotationSaveBackupRow(row) {
  return String(row && row.category || '').trim() === RAK_ROTATION_SAVE_BACKUP_CATEGORY
    || String(row && row.machine_key || '').trim().indexOf(RAK_ROTATION_SAVE_BACKUP_KEY_PREFIX) === 0;
}

function makeRotationSaveBackupRow(rotationSnapshot, monthKey) {
  const nowIso = new Date().toISOString();
  const key = RAK_ROTATION_SAVE_BACKUP_KEY_PREFIX + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  return {
    machine_key: key,
    machine_code: 'ROTBK',
    machine_index: 'save',
    label: 'Auto záloha rozpisu ' + String(monthKey || ''),
    category: RAK_ROTATION_SAVE_BACKUP_CATEGORY,
    cycle_time: '',
    speed: '',
    dress_time: '',
    dress_count: '',
    settings_json: {
      type: RAK_ROTATION_SAVE_BACKUP_CATEGORY,
      monthKey: String(monthKey || ''),
      createdAt: nowIso,
      createdBy: (typeof rakAdminGetActiveAccountId === 'function' ? rakAdminGetActiveAccountId() : '') || '',
      rotation: rotationSnapshot
    }
  };
}

function getRotationSaveBackupRows() {
  const rows = Array.isArray(app && app.machineSettingsRows) ? app.machineSettingsRows : [];
  return rows.filter(isRotationSaveBackupRow).sort((a, b) => {
    const aAt = String(a && a.settings_json && a.settings_json.createdAt || '');
    const bAt = String(b && b.settings_json && b.settings_json.createdAt || '');
    return bAt.localeCompare(aAt);
  });
}

async function createRotationSaveBackup(rotationSnapshot, monthKey) {
  if (!rotationSnapshot || !window.RotationSupabaseBridge || typeof window.RotationSupabaseBridge.saveMachineSettings !== 'function') return { ok: false };
  const current = Array.isArray(app.machineSettingsRows) ? app.machineSettingsRows : [];
  const keepBackups = getRotationSaveBackupRows().slice(0, RAK_ROTATION_SAVE_BACKUP_MAX - 1);
  const newRow = makeRotationSaveBackupRow(rotationSnapshot, monthKey);
  const rows = current.filter((row) => !isRotationSaveBackupRow(row)).concat(keepBackups).concat([newRow]);
  const result = await window.RotationSupabaseBridge.saveMachineSettings(rows);
  if (result && result.ok !== false) app.machineSettingsRows = rows;
  return result;
}

async function restoreRotationSaveBackup(machineKey) {
  const key = String(machineKey || '').trim();
  if (!key) return { ok: false, reason: 'missing-key' };
  const backup = getRotationSaveBackupRows().find((row) => String(row.machine_key || '') === key);
  const rotationSnapshot = backup && backup.settings_json ? backup.settings_json.rotation : null;
  if (!rotationSnapshot) return { ok: false, reason: 'missing-backup' };
  app.rotation = typeof normalizeRotationData === 'function' ? normalizeRotationData(rotationSnapshot) : rotationSnapshot;
  if (typeof saveRotationData === 'function') saveRotationData();
  if (typeof renderRotace === 'function') renderRotace();
  if (typeof renderStatsPanel === 'function') renderStatsPanel();
  if (app.selectedMonth && typeof renderMonth === 'function') renderMonth(app.selectedMonth);
  if (app.selectedName && typeof renderPerson === 'function') renderPerson(app.selectedName);
  if (typeof updateDashboard === 'function') updateDashboard();
  if (typeof saveRotationToSupabase === 'function') {
    return await saveRotationToSupabase(app.rotation, { source: 'admin-rotation-save-backup-restore' });
  }
  return { ok: true };
}

function buildRotationSaveBackupsHtml() {
  const backups = getRotationSaveBackupRows();
  if (!backups.length) {
    return '<div class="smallText uMt8">Zatím žádná automatická záloha. Vytvoří se sama po prvním uložení rozpisu.</div>';
  }
  const rows = backups.map((backup) => {
    const key = String(backup.machine_key || '');
    const settings = backup.settings_json || {};
    const label = [
      formatAdminRotationBackupDate(settings.createdAt),
      settings.monthKey ? ('měsíc ' + settings.monthKey) : '',
      settings.createdBy ? ('účet ' + settings.createdBy) : ''
    ].filter(Boolean).join(' · ');
    return [
      '<tr>',
      '  <td>' + escapeHtml(label || 'Automatická záloha') + '<div class="smallText">stav před posledním uložením</div></td>',
      '  <td><button type="button" class="appMenuAction" data-admin-action="restore-rotation-save-backup" data-save-backup-key="' + escapeHtml(key) + '">Obnovit</button></td>',
      '</tr>'
    ].join('');
  }).join('');
  return [
    '<div class="tableWrap appMenuTableWrap uMt8">',
    '  <div class="smallText uMb10">Automatická záloha vzniká sama při každém uložení rozpisu (drží se posledních ' + String(RAK_ROTATION_SAVE_BACKUP_MAX) + '). Ruční zálohy výše řeší delší historii.</div>',
    '  <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense">',
    '    <thead><tr><th>Automatická záloha</th><th>Akce</th></tr></thead>',
    '    <tbody>' + rows + '</tbody>',
    '  </table>',
    '</div>'
  ].join('');
}

const RAK_ADMIN_CHANGE_LOG_KEY = 'ADMIN_CHANGE_LOG';
const RAK_ADMIN_CHANGE_LOG_CATEGORY = 'admin_change_log';
const RAK_ADMIN_CHANGE_LOG_MAX = 200;

function isRakChangeLogRow(row) {
  return String(row && row.category || '').trim() === RAK_ADMIN_CHANGE_LOG_CATEGORY
    || String(row && row.machine_key || '').trim() === RAK_ADMIN_CHANGE_LOG_KEY;
}

function getRakChangeLogEntries() {
  if (Array.isArray(app && app.adminAuditRows)) {
    return app.adminAuditRows.map((row) => {
      const details = row && row.details && typeof row.details === 'object' ? row.details : {};
      const action = String(row && row.action || '');
      return {
        id: String(row && row.id || ''),
        area: String(details.area || (action === 'rotation.save' ? 'Rozpis' : action === 'settings.save' ? 'Nastaveni' : row && row.target_type || action)),
        summary: String(details.summary || (action === 'rotation.save' ? 'Ulozen rozpis' : action === 'settings.save' ? 'Ulozeno nastaveni' : action)),
        accountId: String(row && row.account_id || ''),
        at: row && row.created_at || ''
      };
    });
  }
  const rows = Array.isArray(app && app.machineSettingsRows) ? app.machineSettingsRows : [];
  const row = rows.find(isRakChangeLogRow);
  const settings = row && row.settings_json && typeof row.settings_json === 'object' ? row.settings_json : {};
  return Array.isArray(settings.entries) ? settings.entries : [];
}

function makeRakChangeLogRow(entries) {
  return {
    machine_key: RAK_ADMIN_CHANGE_LOG_KEY,
    machine_code: 'ADMIN',
    machine_index: 'change-log',
    label: 'Historie změn',
    category: RAK_ADMIN_CHANGE_LOG_CATEGORY,
    cycle_time: '',
    speed: '',
    dress_time: '',
    dress_count: '',
    settings_json: {
      type: RAK_ADMIN_CHANGE_LOG_CATEGORY,
      entries: (Array.isArray(entries) ? entries : []).slice(0, RAK_ADMIN_CHANGE_LOG_MAX)
    }
  };
}

async function rakAdminLogChange(area, summary) {
  try {
    if (!window.RotationSupabaseBridge || typeof window.RotationSupabaseBridge.saveMachineSettings !== 'function') return { ok: false, reason: 'missing-bridge' };
    if (app && Number(app.adminAuthVersion) === 2 && typeof window.RotationSupabaseBridge.writeAdminAudit === 'function') {
      const secureResult = await window.RotationSupabaseBridge.writeAdminAudit(area, summary);
      if (secureResult && secureResult.ok !== false && Array.isArray(app.adminAuditRows)) {
        app.adminAuditRows.unshift({
          id: 'local-' + Date.now().toString(36),
          account_id: (typeof rakAdminGetActiveAccountId === 'function' ? rakAdminGetActiveAccountId() : '') || '',
          action: 'admin.change',
          target_type: 'admin_setting',
          details: { area: String(area || ''), summary: String(summary || '') },
          created_at: secureResult.created_at || new Date().toISOString()
        });
      }
      return secureResult;
    }
    const accountId = (typeof rakAdminGetActiveAccountId === 'function' ? rakAdminGetActiveAccountId() : '') || '';
    const entry = {
      id: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
      area: String(area || '').trim(),
      summary: String(summary || '').trim(),
      accountId,
      at: new Date().toISOString()
    };
    const current = Array.isArray(app.machineSettingsRows) ? app.machineSettingsRows : [];
    const entries = [entry].concat(getRakChangeLogEntries()).slice(0, RAK_ADMIN_CHANGE_LOG_MAX);
    const rows = current.filter((row) => !isRakChangeLogRow(row)).concat([makeRakChangeLogRow(entries)]);
    const result = await window.RotationSupabaseBridge.saveMachineSettings(rows);
    if (result && result.ok !== false) app.machineSettingsRows = rows;
    return result;
  } catch (err) {
    return { ok: false, error: err };
  }
}

async function rakAdminLoadChangeLog() {
  if (app && Number(app.adminAuthVersion) === 2 && window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.listAdminAudit === 'function') {
    const result = await window.RotationSupabaseBridge.listAdminAudit(RAK_ADMIN_CHANGE_LOG_MAX);
    if (result && result.ok !== false) app.adminAuditRows = Array.isArray(result.rows) ? result.rows : [];
    return result;
  }
  return await loadAdminMachineSettingsFromSupabase();
}

function rakChangeLogDateLabel(value) {
  const text = String(value || '').trim();
  if (!text) return 'neznámé';
  try {
    const date = new Date(text);
    if (!Number.isFinite(date.getTime())) return text;
    return date.toLocaleString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (err) {
    return text;
  }
}

function buildAdminChangeLogHtml() {
  const entries = getRakChangeLogEntries();
  if (!entries.length) {
    return '<div class="smallText uMt8">Zatím žádné zaznamenané změny. Starší úpravy před opravou ukládání historie nejde zpětně dopočítat; nové záznamy se začnou plnit při dalším uložení dovolené, přesčasů nebo rozpisu.</div>';
  }
  const rows = entries.slice(0, 100).map((entry) => [
    '<tr>',
    '  <td>' + escapeHtml(rakChangeLogDateLabel(entry && entry.at)) + '</td>',
    '  <td>' + escapeHtml(String(entry && entry.accountId || '?')) + '</td>',
    '  <td>' + escapeHtml(String(entry && entry.area || '')) + '</td>',
    '  <td>' + escapeHtml(String(entry && entry.summary || '')) + '</td>',
    '</tr>'
  ].join('')).join('');
  return [
    '<div class="tableWrap appMenuTableWrap uMt8">',
    '  <div class="smallText uMb10">Posledních ' + String(Math.min(entries.length, 100)) + ' změn z ' + String(entries.length) + ' zaznamenaných (max ' + String(RAK_ADMIN_CHANGE_LOG_MAX) + '). Bez možnosti obnovit jen tuhle jednu změnu – na to slouží zálohy.</div>',
    '  <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense">',
    '    <thead><tr><th>Kdy</th><th>Účet</th><th>Oblast</th><th>Co</th></tr></thead>',
    '    <tbody>' + rows + '</tbody>',
    '  </table>',
    '</div>'
  ].join('');
}

function buildAdminRotationBackupsHtml() {
  const snapshot = app && app.adminRotationBackupsSnapshot ? app.adminRotationBackupsSnapshot : null;
  const backups = snapshot && Array.isArray(snapshot.backups) ? snapshot.backups : [];
  if (snapshot && snapshot.loading) {
    return '<div class="smallText uMt8">Načítám zálohy…</div>';
  }
  if (snapshot && snapshot.ok === false) {
    const message = snapshot.error && snapshot.error.message ? snapshot.error.message : (snapshot.reason || 'Zálohy se nepodařilo načíst.');
    return '<div class="smallText uMt8">Zálohy se nepodařilo načíst: ' + escapeHtml(message) + '</div>';
  }
  if (!backups.length) {
    return '<div class="smallText uMt8">Zatím nejsou načtené žádné zálohy. Klikni na Načíst zálohy.</div>';
  }
  const monthNames = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'];
  const rowHtml = (backup) => {
    const id = String(backup && backup.id || '');
    const source = String(backup && backup.source || '').trim() || 'uložení rozpisu';
    const monthKey = String(backup && backup.month_key || '').trim();
    const monthCount = Number(backup && backup.month_count) || 0;
    const daymodCount = Number(backup && backup.daymod_count) || 0;
    const label = [
      formatAdminRotationBackupDate(backup && backup.replaced_at),
      monthKey ? ('měsíc ' + monthKey) : '',
      monthCount ? (String(monthCount) + ' měsíců') : '',
      daymodCount ? (String(daymodCount) + ' výjimek') : ''
    ].filter(Boolean).join(' · ');
    return [
      '<tr>',
      '  <td class="adminRotationBackupLabelCell">' + escapeHtml(label || 'Záloha') + '<div class="smallText">' + escapeHtml(source) + '</div></td>',
      '  <td class="adminRotationBackupActionCell"><button type="button" class="appMenuAction" data-admin-action="restore-rotation-backup" data-backup-id="' + escapeHtml(id) + '">Obnovit</button></td>',
      '</tr>'
    ].join('');
  };
  const sorted = backups.slice().sort((a, b) => {
    const ad = new Date(a && a.replaced_at || 0).getTime();
    const bd = new Date(b && b.replaced_at || 0).getTime();
    return (Number.isFinite(bd) ? bd : 0) - (Number.isFinite(ad) ? ad : 0);
  });
  const groupOrder = [];
  const groups = new Map();
  sorted.forEach((backup) => {
    const date = new Date(backup && backup.replaced_at || 0);
    const hasDate = Number.isFinite(date.getTime()) && date.getTime() > 0;
    const groupKey = hasDate ? (date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0')) : 'neznamo';
    if (!groups.has(groupKey)) {
      const label = hasDate ? (monthNames[date.getMonth()] + ' ' + date.getFullYear()) : 'Neznámé datum';
      groups.set(groupKey, { label: label.charAt(0).toUpperCase() + label.slice(1), items: [] });
      groupOrder.push(groupKey);
    }
    groups.get(groupKey).items.push(backup);
  });
  const groupsHtml = groupOrder.map((key, idx) => {
    const group = groups.get(key);
    return [
      '<details class="appMenuFoldSection adminRotationBackupMonthGroup"' + (idx === 0 ? ' open' : '') + '>',
      '  <summary>' + escapeHtml(group.label) + ' <span class="smallText">' + String(group.items.length) + '×</span></summary>',
      '  <div class="tableWrap appMenuTableWrap">',
      '    <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense adminRotationBackupsTable">',
      '      <colgroup><col class="adminRotationBackupsLabelCol"><col class="adminRotationBackupsActionCol"></colgroup>',
      '      <thead><tr><th>Záloha</th><th>Akce</th></tr></thead>',
      '      <tbody>' + group.items.map(rowHtml).join('') + '</tbody>',
      '    </table>',
      '  </div>',
      '</details>'
    ].join('');
  }).join('');
  return '<div class="uMt8">' + groupsHtml + '</div>';
}

async function loadAdminRotationBackupsFromSupabase() {
  if (typeof app === 'undefined' || !app) return { ok: false, reason: 'missing-app', backups: [] };
  app.adminRotationBackupsSnapshot = { loading: true, backups: [] };
  const bridge = window.RotationSupabaseBridge;
  if (!bridge || typeof bridge.listRotationBackups !== 'function') {
    app.adminRotationBackupsSnapshot = { ok: false, reason: 'missing-bridge', backups: [] };
    return app.adminRotationBackupsSnapshot;
  }
  const result = await bridge.listRotationBackups({ limit: 50 });
  app.adminRotationBackupsSnapshot = Object.assign({}, result || {}, {
    backups: result && Array.isArray(result.backups) ? result.backups : [],
    loading: false
  });
  return app.adminRotationBackupsSnapshot;
}

async function restoreAdminRotationBackupFromSupabase(backupId) {
  const bridge = window.RotationSupabaseBridge;
  if (!bridge || typeof bridge.restoreRotationBackup !== 'function') {
    return { ok: false, reason: 'missing-bridge' };
  }
  const result = await bridge.restoreRotationBackup(backupId, {
    meta: { adminSource: 'admin-menu-backups' }
  });
  if (!result || result.ok === false) return result || { ok: false, reason: 'restore-failed' };
  const row = result.row || (result.data && result.data.row) || null;
  const payload = row && row.payload ? row.payload : null;
  if (payload && typeof app !== 'undefined') {
    app.rotation = typeof normalizeRotationData === 'function' ? normalizeRotationData(payload) : payload;
    if (typeof getAvailableYears === 'function' && typeof getInitialSelectedYear === 'function' && (!app.selectedYear || !getAvailableYears(app.rotation).includes(parseInt(app.selectedYear, 10)))) {
      app.selectedYear = getInitialSelectedYear(app.rotation);
    }
    if (typeof saveRotationData === 'function') saveRotationData();
    if (typeof renderRotace === 'function') renderRotace();
    if (typeof renderStatsPanel === 'function') renderStatsPanel();
    if (app.selectedMonth && typeof renderMonth === 'function') renderMonth(app.selectedMonth);
    if (app.selectedName && typeof renderPerson === 'function') renderPerson(app.selectedName);
    if (typeof updateDashboard === 'function') updateDashboard();
  }
  return result;
}

const RAK_FULL_SETTINGS_BACKUP_CATEGORY = 'admin_full_settings_backup';
const RAK_FULL_SETTINGS_BACKUP_KEY_PREFIX = 'ADMIN_FULL_SETTINGS_BACKUP_';
const RAK_DELETED_MACHINE_SETTINGS_CATEGORY = 'admin_settings_deleted';

function adminFullSettingsBackupJson(row) {
  if (row && row.settings_json && typeof row.settings_json === 'object') return row.settings_json;
  try {
    return row && row.settings_json ? JSON.parse(String(row.settings_json)) : {};
  } catch (err) {
    return {};
  }
}

function adminIsFullSettingsBackupRow(row) {
  const settings = adminFullSettingsBackupJson(row);
  const category = String(row && row.category || '').trim();
  const key = String(row && row.machine_key || '').trim();
  return category === RAK_FULL_SETTINGS_BACKUP_CATEGORY
    || key.indexOf(RAK_FULL_SETTINGS_BACKUP_KEY_PREFIX) === 0
    || String(settings && settings.stored_category || '').trim() === RAK_FULL_SETTINGS_BACKUP_CATEGORY
    || String(settings && settings.type || '').trim() === RAK_FULL_SETTINGS_BACKUP_CATEGORY
    || String(settings && settings.admin_settings_key || '').trim().indexOf(RAK_FULL_SETTINGS_BACKUP_KEY_PREFIX) === 0;
}

function adminIsDeletedMachineSettingsRow(row) {
  const settings = adminFullSettingsBackupJson(row);
  const category = String(row && row.category || '').trim();
  return category === RAK_DELETED_MACHINE_SETTINGS_CATEGORY
    || String(settings && settings.stored_category || '').trim() === RAK_DELETED_MACHINE_SETTINGS_CATEGORY
    || settings.deleted === true
    || String(settings && settings.type || '').trim() === RAK_DELETED_MACHINE_SETTINGS_CATEGORY;
}

function adminCloneFullSettingsRow(row) {
  const source = row && typeof row === 'object' ? row : {};
  const clone = {
    machine_key: String(source.machine_key || '').trim(),
    machine_code: String(source.machine_code || '').trim(),
    machine_index: String(source.machine_index || '').trim(),
    label: String(source.label || '').trim(),
    category: String(source.category || '').trim(),
    cycle_time: source.cycle_time ?? '',
    speed: source.speed ?? '',
    dress_time: source.dress_time ?? '',
    dress_count: source.dress_count ?? '',
    settings_json: adminFullSettingsBackupJson(source)
  };
  return clone.machine_key ? clone : null;
}

function adminFullSettingsBackupRows() {
  const rows = Array.isArray(app && app.machineSettingsRows) ? app.machineSettingsRows : [];
  return rows.filter(adminIsFullSettingsBackupRow);
}

function adminFullSettingsSourceRows(rows) {
  return (Array.isArray(rows) ? rows : [])
    .filter((row) => !adminIsFullSettingsBackupRow(row))
    .filter((row) => !adminIsDeletedMachineSettingsRow(row))
    .filter((row) => !(typeof rakAdminIsAccountsSettingsRow === 'function' && rakAdminIsAccountsSettingsRow(row)))
    .map(adminCloneFullSettingsRow)
    .filter(Boolean);
}

function makeDeletedMachineSettingsRow(row) {
  const source = row && typeof row === 'object' ? row : {};
  const machineKey = String(source.machine_key || '').trim();
  if (!machineKey) return null;
  const now = new Date().toISOString();
  return {
    machine_key: machineKey,
    machine_code: String(source.machine_code || source.machine || 'DELETED').trim() || 'DELETED',
    machine_index: String(source.machine_index || source.index || '').trim(),
    label: String(source.label || machineKey || 'Smazané nastavení').trim(),
    category: RAK_DELETED_MACHINE_SETTINGS_CATEGORY,
    cycle_time: '',
    speed: '',
    dress_time: '',
    dress_count: '',
    settings_json: {
      type: RAK_DELETED_MACHINE_SETTINGS_CATEGORY,
      stored_category: RAK_DELETED_MACHINE_SETTINGS_CATEGORY,
      admin_settings_key: machineKey,
      machine: String(source.machine_code || source.machine || 'DELETED').trim() || 'DELETED',
      index: String(source.machine_index || source.index || '').trim(),
      deleted: true,
      deletedAt: now,
      deletedBy: typeof rakAdminGetActiveAccountId === 'function' ? rakAdminGetActiveAccountId() : '',
      reason: 'full-settings-backup-restore'
    }
  };
}

function adminFullSettingsBackupTimestampKey(value) {
  return String(value || new Date().toISOString()).replace(/[^0-9A-Za-z]/g, '').slice(0, 32);
}

function makeAdminFullSettingsBackupRow(sourceRows, options) {
  const opts = options && typeof options === 'object' ? options : {};
  const now = new Date();
  const createdAt = now.toISOString();
  const key = RAK_FULL_SETTINGS_BACKUP_KEY_PREFIX + adminFullSettingsBackupTimestampKey(createdAt);
  const activeAccount = typeof rakAdminGetActiveAccountId === 'function' ? rakAdminGetActiveAccountId() : '';
  const rows = adminFullSettingsSourceRows(sourceRows);
  const source = String(opts.source || 'manual').trim() || 'manual';
  const labelPrefix = source === 'before-restore' ? 'Před obnovou nastavení ' : 'Úplná záloha nastavení ';
  return {
    machine_key: key,
    machine_code: 'ADMIN',
    machine_index: adminFullSettingsBackupTimestampKey(createdAt),
    label: String(opts.label || (labelPrefix + now.toLocaleString('cs-CZ'))),
    category: RAK_FULL_SETTINGS_BACKUP_CATEGORY,
    cycle_time: '',
    speed: '',
    dress_time: '',
    dress_count: '',
    settings_json: {
      type: RAK_FULL_SETTINGS_BACKUP_CATEGORY,
      createdAt,
      createdBy: activeAccount,
      source,
      restoredBackupId: String(opts.restoredBackupId || '').trim(),
      appVersion: getRakCurrentAppVersion(),
      rowCount: rows.length,
      rows
    }
  };
}

function adminFullSettingsBackupDateLabel(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return String(value);
  try {
    return date.toLocaleString('cs-CZ', { dateStyle: 'short', timeStyle: 'short' });
  } catch (err) {
    return date.toLocaleString('cs-CZ');
  }
}

function adminFullSettingsBackupList() {
  if (typeof app !== 'undefined' && app && app.adminAuthVersion === 2 && Array.isArray(app.adminSettingsBackupsV2)) {
    return app.adminSettingsBackupsV2.map((backup) => ({
      row: null,
      id: String(backup && backup.id || ''),
      label: 'Úplná záloha nastavení',
      createdAt: String(backup && backup.created_at || ''),
      createdBy: String(backup && backup.created_by_account_id || ''),
      source: String(backup && backup.source || 'manual'),
      sourceLabel: String(backup && backup.source || '') === 'before-restore' ? 'před obnovou' : (String(backup && backup.source || '') === 'imported' ? 'importovaná' : 'ruční'),
      restoredBackupId: String(backup && backup.restored_backup_id || ''),
      rowCount: Number(backup && backup.row_count || 0),
      appVersion: String(backup && backup.app_version || '')
    })).filter((item) => item.id).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }
  return adminFullSettingsBackupRows().map((row) => {
    const settings = adminFullSettingsBackupJson(row);
    const rows = Array.isArray(settings && settings.rows) ? settings.rows : [];
    const source = String(settings && settings.source || 'manual').trim() || 'manual';
    return {
      row,
      id: String(row && row.machine_key || settings && settings.admin_settings_key || '').trim(),
      label: String(row && row.label || '').trim() || 'Úplná záloha nastavení',
      createdAt: String(settings && settings.createdAt || '').trim(),
      createdBy: String(settings && settings.createdBy || '').trim(),
      source,
      sourceLabel: source === 'before-restore' ? 'před obnovou' : (source === 'imported' ? 'importovaná' : 'ruční'),
      restoredBackupId: String(settings && settings.restoredBackupId || '').trim(),
      rowCount: Number(settings && (settings.rowCount || rows.length)) || rows.length,
      appVersion: String(settings && settings.appVersion || '').trim()
    };
  }).filter((item) => item.id).sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
}

function buildAdminFullSettingsBackupStatusHtml() {
  const canManage = typeof rakAdminCanManageAdmins === 'function' && rakAdminCanManageAdmins();
  const backups = adminFullSettingsBackupList();
  const manualCount = backups.filter((backup) => String(backup.source || '') !== 'before-restore').length;
  const beforeRestoreCount = backups.filter((backup) => String(backup.source || '') === 'before-restore').length;
  const latest = backups[0] || null;
  const sourceCount = adminFullSettingsSourceRows(Array.isArray(app && app.machineSettingsRows) ? app.machineSettingsRows : []).length;
  const items = [
    { state: canManage ? 'ok' : 'warn', title: 'Přístup', value: canManage ? 'hlavní admin' : 'zamčeno', detail: canManage ? 'Vytvořit a obnovit může jen účet 9811.' : 'Nižší admin tuhle obnovu nespustí.' },
    { state: backups.length ? 'ok' : 'info', title: 'Zálohy', value: String(backups.length), detail: backups.length ? 'Online zálohy nastavení jsou načtené.' : 'Zatím není načtená žádná úplná záloha nastavení.' },
    { state: manualCount ? 'ok' : 'info', title: 'Ruční / auto', value: String(manualCount) + ' / ' + String(beforeRestoreCount), detail: 'Ruční body jsou hlavní jistota; automatické vznikají před obnovou.' },
    { state: latest ? 'ok' : 'info', title: 'Nejnovější', value: latest ? adminFullSettingsBackupDateLabel(latest.createdAt) : '—', detail: latest ? (String(latest.rowCount) + ' řádků nastavení.') : 'Po vytvoření se tady ukáže poslední bod obnovy.' },
    { state: sourceCount ? 'info' : 'warn', title: 'Aktuální stav', value: String(sourceCount) + ' řádků', detail: 'Do nové zálohy se vezmou všechna aktuálně načtená nastavení.' }
  ];
  return [
    '<details class="appMenuFoldSection adminRotationBackupStatus adminFullSettingsBackupStatus">',
    '  <summary class="appMenuSubTitle">Stav záloh nastavení</summary>',
    '  <div class="smallText uMb10">Úplná záloha je pojistka pro hlavního admina, kdyby jiný admin rozbil provozní nastavení.</div>',
    '  <div class="adminRotationBackupStatusGrid">',
    items.map(adminRotationBackupStatusItemHtml).join(''),
    '  </div>',
    '</details>'
  ].join('');
}

function buildAdminFullSettingsBackupsHtml() {
  const backups = adminFullSettingsBackupList();
  if (!(typeof rakAdminCanManageAdmins === 'function' && rakAdminCanManageAdmins())) {
    return '<div class="adminAccountsReadonlyNotice"><b>Úplné zálohy nastavení může měnit jen hlavní admin.</b><span>Nižší admin může spravovat pracovní části aplikace, ale nemůže vracet celé nastavení.</span></div>';
  }
  if (!backups.length) {
    return '<div class="smallText uMt8">Zatím není načtená žádná úplná záloha nastavení. Nejdřív klikni na Načíst online nebo Vytvořit zálohu.</div>';
  }
  const rows = backups.map((backup) => [
    '<tr>',
    '  <td class="adminFullSettingsBackupLabelCell">' + escapeHtml(adminFullSettingsBackupDateLabel(backup.createdAt)) + '<div class="smallText">' + escapeHtml(String(backup.sourceLabel || 'ruční') + ' · ' + String(backup.rowCount) + ' řádků' + (backup.appVersion ? (' · ' + backup.appVersion) : '') + (backup.createdBy ? (' · účet ' + backup.createdBy) : '') + (backup.restoredBackupId ? (' · obnova ' + backup.restoredBackupId.slice(0, 16)) : '')) + '</div></td>',
    '  <td class="adminFullSettingsBackupActionCell"><button type="button" class="appMenuAction" data-admin-action="download-full-settings-backup" data-settings-backup-id="' + escapeHtml(backup.id) + '">Stáhnout</button><button type="button" class="appMenuAction" data-admin-action="restore-full-settings-backup" data-settings-backup-id="' + escapeHtml(backup.id) + '">Obnovit</button><button type="button" class="appMenuAction appMenuDangerBtn" data-admin-action="delete-full-settings-backup" data-settings-backup-id="' + escapeHtml(backup.id) + '">Smazat</button></td>',
    '</tr>'
  ].join('')).join('');
  return [
    '<div class="tableWrap appMenuTableWrap uMt8">',
    '  <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense adminFullSettingsBackupsTable">',
    '    <colgroup><col class="adminFullSettingsBackupLabelCol"><col class="adminFullSettingsBackupActionCol"></colgroup>',
    '    <thead><tr><th>Záloha nastavení</th><th>Akce</th></tr></thead>',
    '    <tbody>' + rows + '</tbody>',
    '  </table>',
    '</div>'
  ].join('');
}

async function downloadAdminFullSettingsBackup(backupId) {
  if (!(typeof rakAdminCanManageAdmins === 'function' && rakAdminCanManageAdmins())) return { ok: false, reason: 'not-allowed' };
  let backup = adminFullSettingsBackupList().find((item) => item.id === String(backupId || '').trim());
  if (!backup) return { ok: false, reason: 'missing-backup' };
  if (typeof app !== 'undefined' && app && app.adminAuthVersion === 2) {
    const bridge = window.RotationSupabaseBridge;
    if (!bridge || typeof bridge.getAdminSettingsBackup !== 'function') return { ok: false, reason: 'missing-bridge' };
    const remote = await bridge.getAdminSettingsBackup(backup.id);
    if (!remote.ok || !remote.backup) return remote;
    backup = Object.assign({}, backup, { remote: remote.backup });
  }
  const payload = {
    type: 'rak-full-settings-backup-export',
    exportedAt: new Date().toISOString(),
    appVersion: getRakCurrentAppVersion(),
    backupId: backup.id,
    backup: backup.remote
      ? {
          machine_key: 'ADMIN_FULL_SETTINGS_BACKUP_' + String(backup.id),
          machine_code: 'ADMIN',
          machine_index: String(backup.id),
          label: 'Úplná záloha nastavení',
          category: RAK_FULL_SETTINGS_BACKUP_CATEGORY,
          settings_json: Object.assign({}, backup.remote.snapshot || {}, {
            type: RAK_FULL_SETTINGS_BACKUP_CATEGORY,
            createdAt: backup.remote.created_at,
            createdBy: backup.remote.created_by_account_id,
            source: backup.remote.source,
            appVersion: backup.remote.app_version,
            rowCount: backup.remote.row_count
          })
        }
      : adminCloneFullSettingsRow(backup.row)
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateKey = String(backup.createdAt || new Date().toISOString()).slice(0, 10) || new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = 'RaK_zaloha_nastaveni_' + dateKey + '_' + String(backup.source || 'manual') + '.json';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    try { URL.revokeObjectURL(url); } catch (err) {}
    try { a.remove(); } catch (err) {}
  }, 0);
  const status = document.getElementById('adminOnlineSaveStatus');
  if (status) status.textContent = 'Záloha nastavení stažena jako JSON soubor.';
  return { ok: true, backup };
}

async function deleteAdminFullSettingsBackup(backupId) {
  if (!(typeof rakAdminCanManageAdmins === 'function' && rakAdminCanManageAdmins())) return { ok: false, reason: 'not-allowed' };
  const bridge = window.RotationSupabaseBridge;
  const id = String(backupId || '').trim();
  if (!id || !bridge || typeof bridge.deleteAdminSettingsBackup !== 'function') return { ok: false, reason: 'missing-bridge' };
  const result = await bridge.deleteAdminSettingsBackup(id);
  if (!result || result.ok === false) return result || { ok: false, reason: 'delete-failed' };
  await loadAdminFullSettingsBackupsFromSupabase();
  return { ok: true, id };
}

function normalizeImportedFullSettingsBackupRow(payload) {
  const source = payload && typeof payload === 'object' ? payload : {};
  const exportType = String(source.type || '').trim();
  const row = source.backup && typeof source.backup === 'object' ? source.backup : source;
  if (exportType && exportType !== 'rak-full-settings-backup-export') return null;
  const clone = adminCloneFullSettingsRow(row);
  if (!clone || !adminIsFullSettingsBackupRow(clone)) return null;
  const settings = adminFullSettingsBackupJson(clone);
  const rows = Array.isArray(settings && settings.rows) ? settings.rows : [];
  if (!rows.length) return null;
  const importedAt = new Date().toISOString();
  const importedKey = RAK_FULL_SETTINGS_BACKUP_KEY_PREFIX + 'IMPORT_' + adminFullSettingsBackupTimestampKey(importedAt);
  clone.machine_key = importedKey;
  clone.machine_code = 'ADMIN';
  clone.machine_index = 'import-' + adminFullSettingsBackupTimestampKey(importedAt).slice(0, 20);
  clone.label = 'Importovaná záloha nastavení ' + new Date(importedAt).toLocaleString('cs-CZ');
  clone.category = RAK_FULL_SETTINGS_BACKUP_CATEGORY;
  clone.settings_json = Object.assign({}, settings, {
    type: RAK_FULL_SETTINGS_BACKUP_CATEGORY,
    importedAt,
    importedBy: typeof rakAdminGetActiveAccountId === 'function' ? rakAdminGetActiveAccountId() : '',
    originalBackupId: String(source.backupId || row.machine_key || settings.admin_settings_key || '').trim(),
    originalSource: String(settings.source || '').trim(),
    source: 'imported',
    rowCount: rows.length
  });
  return clone;
}

function readTextFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || Number(file.size || 0) > 3 * 1024 * 1024) {
      reject(new Error('Soubor zálohy je příliš velký. Maximum jsou 3 MB.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Soubor se nepodařilo načíst.'));
    reader.readAsText(file, 'utf-8');
  });
}

async function importAdminFullSettingsBackupFile(file) {
  if (!(typeof rakAdminCanManageAdmins === 'function' && rakAdminCanManageAdmins())) return { ok: false, reason: 'not-allowed' };
  if (!file) return { ok: false, reason: 'missing-file' };
  if (!(window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.loadMachineSettings === 'function' && typeof window.RotationSupabaseBridge.saveMachineSettings === 'function')) return { ok: false, reason: 'missing-bridge' };
  const text = await readTextFile(file);
  let parsed = null;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    return { ok: false, reason: 'invalid-json', error: err };
  }
  const backupRow = normalizeImportedFullSettingsBackupRow(parsed);
  if (!backupRow) return { ok: false, reason: 'invalid-backup' };
  if (typeof app !== 'undefined' && app && app.adminAuthVersion === 2) {
    const bridge = window.RotationSupabaseBridge;
    if (!bridge || typeof bridge.createAdminSettingsBackup !== 'function') return { ok: false, reason: 'missing-bridge' };
    const settings = adminFullSettingsBackupJson(backupRow);
    const rows = Array.isArray(settings.rows) ? settings.rows.map(adminCloneFullSettingsRow).filter(Boolean) : [];
    if (!rows.length || rows.length > 500) return { ok: false, reason: 'invalid-backup' };
    const created = await bridge.createAdminSettingsBackup({ rows }, {
      source: 'imported',
      appVersion: String(settings.appVersion || app.version || ''),
      legacyKey: String(backupRow.machine_key || '')
    });
    if (!created.ok) return created;
    await loadAdminFullSettingsBackupsFromSupabase();
    return { ok: true, backup: { machine_key: String(created.id || ''), settings_json: { rows } }, result: created };
  }
  const loadedRows = await window.RotationSupabaseBridge.loadMachineSettings();
  const currentRows = Array.isArray(loadedRows) ? loadedRows : [];
  app.machineSettingsRows = currentRows;
  const nextRows = currentRows.concat([backupRow]);
  const result = await window.RotationSupabaseBridge.saveMachineSettings(nextRows);
  if (result && result.ok === false) return result;
  app.machineSettingsRows = nextRows;
  return { ok: true, backup: backupRow, result };
}

async function loadAdminFullSettingsBackupsFromSupabase() {
  if (typeof app !== 'undefined' && app && app.adminAuthVersion === 2) {
    const bridge = window.RotationSupabaseBridge;
    if (!bridge || typeof bridge.listAdminSettingsBackups !== 'function') return { ok: false, reason: 'missing-bridge' };
    const result = await bridge.listAdminSettingsBackups(100);
    if (!result.ok) return result;
    app.adminSettingsBackupsV2 = result.rows;
    return { ok: true, backups: adminFullSettingsBackupList() };
  }
  if (!(window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.loadMachineSettings === 'function')) return { ok: false, reason: 'missing-bridge' };
  app.machineSettingsRows = await window.RotationSupabaseBridge.loadMachineSettings();
  return { ok: true, backups: adminFullSettingsBackupList() };
}

async function createAdminFullSettingsBackupOnline() {
  if (!(typeof rakAdminCanManageAdmins === 'function' && rakAdminCanManageAdmins())) return { ok: false, reason: 'not-allowed' };
  if (!(window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.loadMachineSettings === 'function' && typeof window.RotationSupabaseBridge.saveMachineSettings === 'function')) return { ok: false, reason: 'missing-bridge' };
  const loadedRows = await window.RotationSupabaseBridge.loadMachineSettings();
  const currentRows = Array.isArray(loadedRows) ? loadedRows : [];
  app.machineSettingsRows = currentRows;
  if (typeof app !== 'undefined' && app && app.adminAuthVersion === 2) {
    const sourceRows = adminFullSettingsSourceRows(currentRows);
    const bridge = window.RotationSupabaseBridge;
    if (!bridge || typeof bridge.createAdminSettingsBackup !== 'function') return { ok: false, reason: 'missing-bridge' };
    const result = await bridge.createAdminSettingsBackup({ rows: sourceRows }, {
      source: 'manual',
      appVersion: getRakCurrentAppVersion()
    });
    if (!result.ok) return result;
    await loadAdminFullSettingsBackupsFromSupabase();
    return {
      ok: true,
      backup: { machine_key: String(result.id || ''), settings_json: { rows: sourceRows } },
      result
    };
  }
  const backupRow = makeAdminFullSettingsBackupRow(currentRows);
  const nextRows = currentRows.concat([backupRow]);
  const result = await window.RotationSupabaseBridge.saveMachineSettings(nextRows);
  if (result && result.ok === false) return result;
  app.machineSettingsRows = nextRows;
  return { ok: true, backup: backupRow, result };
}

async function restoreAdminFullSettingsBackupOnline(backupId) {
  if (!(typeof rakAdminCanManageAdmins === 'function' && rakAdminCanManageAdmins())) return { ok: false, reason: 'not-allowed' };
  if (!(window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.loadMachineSettings === 'function' && typeof window.RotationSupabaseBridge.saveMachineSettings === 'function')) return { ok: false, reason: 'missing-bridge' };
  const loadedRows = await window.RotationSupabaseBridge.loadMachineSettings();
  const currentRows = Array.isArray(loadedRows) ? loadedRows : [];
  app.machineSettingsRows = currentRows;
  if (typeof app !== 'undefined' && app && app.adminAuthVersion === 2) {
    const bridge = window.RotationSupabaseBridge;
    if (!bridge || typeof bridge.getAdminSettingsBackup !== 'function' || typeof bridge.createAdminSettingsBackup !== 'function') return { ok: false, reason: 'missing-bridge' };
    const loadedBackup = await bridge.getAdminSettingsBackup(String(backupId || ''));
    const snapshot = loadedBackup && loadedBackup.backup && loadedBackup.backup.snapshot;
    const restoredRows = snapshot && Array.isArray(snapshot.rows) ? snapshot.rows.map(adminCloneFullSettingsRow).filter(Boolean) : [];
    if (!loadedBackup.ok || !restoredRows.length) return loadedBackup.ok ? { ok: false, reason: 'missing-backup' } : loadedBackup;
    const currentSourceRows = adminFullSettingsSourceRows(currentRows);
    const preRestore = await bridge.createAdminSettingsBackup({ rows: currentSourceRows }, {
      source: 'before-restore',
      appVersion: getRakCurrentAppVersion(),
      restoredBackupId: String(backupId || '')
    });
    if (!preRestore.ok) return preRestore;
    const restoredKeys = new Set(restoredRows.map((row) => String(row.machine_key || '')));
    const deletedRows = currentSourceRows
      .filter((row) => !restoredKeys.has(String(row.machine_key || '')))
      .map(makeDeletedMachineSettingsRow)
      .filter(Boolean);
    const result = await bridge.saveMachineSettings(restoredRows.concat(deletedRows));
    if (result && result.ok === false) return result;
    app.machineSettingsRows = restoredRows;
    await loadAdminFullSettingsBackupsFromSupabase();
    try { if (typeof updateDashboard === 'function') updateDashboard(); } catch (err) {}
    return { ok: true, backup: loadedBackup.backup, preRestoreBackup: preRestore, result, deletedCount: deletedRows.length };
  }
  const backup = adminFullSettingsBackupList().find((item) => item.id === String(backupId || '').trim());
  const backupSettings = backup ? adminFullSettingsBackupJson(backup.row) : null;
  const restoredRows = backupSettings && Array.isArray(backupSettings.rows)
    ? backupSettings.rows.map(adminCloneFullSettingsRow).filter(Boolean)
    : [];
  if (!backup || !restoredRows.length) return { ok: false, reason: 'missing-backup' };
  const preRestoreBackup = makeAdminFullSettingsBackupRow(currentRows, {
    source: 'before-restore',
    restoredBackupId: backup.id
  });
  const backupRows = adminFullSettingsBackupRows().map(adminCloneFullSettingsRow).filter(Boolean);
  if (preRestoreBackup) backupRows.push(preRestoreBackup);
  const restoredKeys = new Set(restoredRows.map((row) => String(row && row.machine_key || '')).filter(Boolean));
  const preservedBackupKeys = new Set(backupRows.map((row) => String(row && row.machine_key || '')).filter(Boolean));
  const deletedRows = currentRows
    .filter((row) => row && row.machine_key)
    .filter((row) => !adminIsFullSettingsBackupRow(row))
    .filter((row) => !adminIsDeletedMachineSettingsRow(row))
    .filter((row) => !restoredKeys.has(String(row.machine_key || '')))
    .filter((row) => !preservedBackupKeys.has(String(row.machine_key || '')))
    .map(makeDeletedMachineSettingsRow)
    .filter(Boolean);
  const merged = new Map();
  restoredRows.concat(backupRows, deletedRows).forEach((row) => {
    if (row && row.machine_key) merged.set(String(row.machine_key), row);
  });
  const persistedRows = Array.from(merged.values());
  const result = await window.RotationSupabaseBridge.saveMachineSettings(persistedRows);
  if (result && result.ok === false) return result;
  app.machineSettingsRows = restoredRows.concat(backupRows);
  try { if (typeof updateDashboard === 'function') updateDashboard(); } catch (err) {}
  try { if (typeof updateFoodTile === 'function') updateFoodTile(); } catch (err) {}
  try { if (typeof renderFoodSchedulePage === 'function') renderFoodSchedulePage(); } catch (err) {}
  try { if (typeof renderStatsPanel === 'function') renderStatsPanel(); } catch (err) {}
  return { ok: true, backup, preRestoreBackup, result, deletedCount: deletedRows.length };
}

function adminGuideHasMonthRows(month) {
  const hardRows = Array.isArray(month && month.hard && month.hard.rows) ? month.hard.rows : [];
  const softRows = Array.isArray(month && month.soft && month.soft.rows) ? month.soft.rows : [];
  return hardRows.concat(softRows).some((row) => {
    const cells = Array.isArray(row && row.cells) ? row.cells : [];
    return cells.some((cell) => String(cell || '').trim());
  });
}

function adminGuideUpcomingVacationCount() {
  try {
    const periods = typeof getVacationCountdownPeriods === 'function' ? getVacationCountdownPeriods() : [];
    const now = Date.now();
    return (Array.isArray(periods) ? periods : []).filter((period) => {
      const end = period && period.end instanceof Date ? period.end.getTime() : Date.parse(String(period && period.end || ''));
      return Number.isFinite(end) && end >= now;
    }).length;
  } catch (err) {
    return 0;
  }
}

function adminGuideUpcomingSpecialDaysCount() {
  try {
    const settings = typeof getRakSpecialDaysSettings === 'function' ? getRakSpecialDaysSettings() : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    return (Array.isArray(settings && settings.days) ? settings.days : []).filter((entry) => String(entry && entry.date || '') >= todayKey).length;
  } catch (err) {
    return 0;
  }
}

function adminGuideOvertimeCount() {
  try {
    const settings = typeof getRotationOvertimeSettings === 'function' ? getRotationOvertimeSettings() : null;
    return Array.isArray(settings && settings.entries) ? settings.entries.length : 0;
  } catch (err) {
    return 0;
  }
}

function adminGuideItemHtml(item) {
  const ok = !!(item && item.ok);
  const action = String(item && item.action || '').trim();
  const button = action
    ? '<button type="button" class="appMenuAction adminGuideAction" data-admin-action="' + escapeHtml(action) + '">' + escapeHtml(item.actionLabel || 'Otevřít') + '</button>'
    : '';
  return [
    '<div class="adminGuideItem ' + (ok ? 'isOk' : 'needsAction') + '">',
    '  <div class="adminGuideState">' + (ok ? 'OK' : '!') + '</div>',
    '  <div class="adminGuideText">',
    '    <div class="adminGuideTitle">' + escapeHtml(item.title || '') + '</div>',
    '    <div class="smallText">' + escapeHtml(item.detail || '') + '</div>',
    '  </div>',
    button,
    '</div>'
  ].join('');
}

function adminHandoverAuditItemHtml(item) {
  const state = String(item && item.state || 'info').trim() || 'info';
  const action = String(item && item.action || '').trim();
  const button = action
    ? '<button type="button" class="appMenuAction adminHandoverAuditAction" data-admin-action="' + escapeHtml(action) + '">' + escapeHtml(item.actionLabel || 'Otevřít') + '</button>'
    : '';
  return [
    '<div class="adminHandoverAuditItem is' + escapeHtml(state.charAt(0).toUpperCase() + state.slice(1)) + '">',
    '  <div class="adminHandoverAuditHead">',
    '    <span>' + escapeHtml(item.title || '') + '</span>',
    '    <b>' + escapeHtml(item.value || '') + '</b>',
    '  </div>',
    '  <div class="smallText">' + escapeHtml(item.detail || '') + '</div>',
    button,
    '</div>'
  ].join('');
}

function adminHandoverMachineSettingsRows(rows) {
  return (Array.isArray(rows) ? rows : []).filter((row) => {
    const cat = String(row && row.category || '').trim();
    const key = String(row && row.machine_key || '').trim();
    return cat !== 'admin_accounts_settings'
      && cat !== 'admin_full_settings_backup'
      && cat !== 'admin_settings_deleted'
      && cat !== 'rotation_overtime_settings'
      && cat !== 'rotation_generator_settings'
      && cat !== 'external_links_settings'
      && cat !== 'app_contact_settings'
      && cat !== 'payroll_settings'
      && cat !== 'vacation_countdown_settings'
      && cat !== 'special_days_settings'
      && key !== 'ADMIN_ACCOUNTS_SETTINGS'
      && key.indexOf('ADMIN_FULL_SETTINGS_BACKUP_') !== 0
      && key !== 'ROTATION_OVERTIME_SETTINGS'
      && key !== 'ROTATION_GENERATOR_SETTINGS'
      && key !== 'EXTERNAL_LINKS_SETTINGS'
      && key !== 'APP_CONTACT_SETTINGS'
      && key !== 'PAYROLL_SETTINGS'
      && key !== 'VACATION_COUNTDOWN_SETTINGS'
      && key !== 'SPECIAL_DAYS_SETTINGS';
  });
}

function adminHandoverMachineSettingsSnapshot() {
  const rows = Array.isArray(app && app.machineSettingsRows) ? app.machineSettingsRows : [];
  const machineRows = adminHandoverMachineSettingsRows(rows);
  const brusRows = machineRows.filter((row) => String(row && row.category || '').trim() === 'brus');
  const fhbRows = machineRows.filter((row) => String(row && row.category || '').trim() === 'fhb_target');
  const baseRows = machineRows.filter((row) => {
    const cat = String(row && row.category || '').trim();
    return cat !== 'brus' && cat !== 'fhb_target';
  });
  let summary = null;
  try {
    summary = typeof adminMachineBuildInitialStatus === 'function'
      ? adminMachineBuildInitialStatus(baseRows, brusRows, rows)
      : null;
  } catch (err) {
    summary = null;
  }
  const machines = Number(summary && summary.machines || baseRows.length || 0) || 0;
  const brus = Number(summary && summary.brus || brusRows.length || 0) || 0;
  const fhb = Number(summary && summary.fhb || fhbRows.length || 0) || 0;
  const incomplete = Number(summary && summary.incomplete || 0) || 0;
  const duplicates = Number(summary && summary.duplicates || 0) || 0;
  const total = machines + brus + fhb;
  const issues = incomplete + duplicates;
  return {
    total,
    machines,
    brus,
    fhb,
    incomplete,
    duplicates,
    state: !rows.length ? 'warn' : (issues ? 'warn' : (total ? 'ok' : 'info')),
    label: total ? (String(total) + ' řádků') : 'nenačteno',
    detail: !rows.length
      ? 'Před předáním načti online nastavení, ať jsou stroje a kalkulačky aktuální.'
      : (issues
        ? ('Stroje mají ' + String(issues) + ' položek ke kontrole: neúplné ' + String(incomplete) + ', duplicity ' + String(duplicates) + '.')
        : ('Frezky/pračka ' + String(machines) + ', brusy ' + String(brus) + ', FHB středy ' + String(fhb) + '.'))
  };
}

function adminHandoverActiveAdminCount() {
  let activeAdmins = 1;
  try {
    const adminSettings = typeof rakAdminGetAccountsSettings === 'function' ? rakAdminGetAccountsSettings() : null;
    activeAdmins += (Array.isArray(adminSettings && adminSettings.admins) ? adminSettings.admins : []).filter((entry) => entry && entry.enabled !== false).length;
  } catch (err) {}
  return activeAdmins;
}

function adminHandoverAdminSessionSnapshot() {
  let sessions = [];
  try {
    const adminSettings = typeof rakAdminGetAccountsSettings === 'function' ? rakAdminGetAccountsSettings() : null;
    sessions = (Array.isArray(adminSettings && adminSettings.sessions) ? adminSettings.sessions : []).filter((entry) => entry && !entry.revokedAt);
  } catch (err) {
    sessions = [];
  }
  return {
    count: sessions.length,
    label: sessions.length ? (String(sessions.length) + ' zařízení') : 'žádné',
    detail: sessions.length
      ? 'V sekci Správci jde zkontrolovat a odhlásit uložené admin relace.'
      : 'Po ověření admin heslem se tady ukážou zařízení s uloženou relací.'
  };
}

function adminHandoverReportsSnapshot() {
  let rows = [];
  try {
    rows = typeof getAdminReportsCache === 'function' ? getAdminReportsCache() : (Array.isArray(app && app.adminBugReports) ? app.adminBugReports : []);
  } catch (err) {
    rows = [];
  }
  let summary = null;
  try {
    summary = typeof buildAdminReportsStatusSummary === 'function'
      ? buildAdminReportsStatusSummary(rows)
      : null;
  } catch (err) {
    summary = null;
  }
  const total = Number(summary && summary.total || rows.length || 0) || 0;
  const openCount = Number(summary && summary.newCount || 0) + Number(summary && summary.seenCount || 0);
  const handledCount = Number(summary && summary.doneCount || 0) + Number(summary && summary.ignoredCount || 0);
  return {
    total,
    openCount,
    handledCount,
    loaded: Array.isArray(rows),
    label: total ? (openCount ? String(openCount) + ' otevřené' : String(total) + ' vyřešené') : 'žádné načtené',
    detail: total
      ? (openCount ? 'Před předáním otevři Reporty chyb a dořeš nové nebo viděné reporty.' : 'Načtené reporty jsou označené jako hotové nebo ignorované.')
      : 'Před předáním načti reporty chyb, ať nový správce nepřebírá skryté problémy.'
  };
}

function adminHandoverAppContactSnapshot() {
  let contact = {};
  try {
    contact = typeof getRakAppContactSettings === 'function' ? getRakAppContactSettings() : {};
  } catch (err) {
    contact = {};
  }
  const safe = {
    name: String(contact && contact.name || '').trim(),
    phone: String(contact && contact.phone || '').trim(),
    email: String(contact && contact.email || '').trim()
  };
  const filled = ['name', 'phone', 'email'].filter((key) => safe[key]).length;
  let emailOk = !!safe.email;
  try {
    emailOk = typeof isRakAppContactEmailValid === 'function' ? isRakAppContactEmailValid(safe.email) : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safe.email);
  } catch (err) {
    emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safe.email);
  }
  let stored = false;
  try {
    const rows = Array.isArray(app && app.machineSettingsRows) ? app.machineSettingsRows : [];
    stored = rows.some((row) => {
      const category = String(row && row.category || '').trim();
      const key = String(row && row.machine_key || '').trim();
      let settings = row && row.settings_json && typeof row.settings_json === 'object' ? row.settings_json : null;
      if (!settings && row && row.settings_json) {
        try { settings = JSON.parse(String(row.settings_json)); } catch (err) { settings = null; }
      }
      return category === 'app_contact_settings'
        || key === 'APP_CONTACT_SETTINGS'
        || String(settings && settings.stored_category || '').trim() === 'app_contact_settings'
        || String(settings && settings.admin_settings_key || '').trim() === 'APP_CONTACT_SETTINGS';
    });
  } catch (err) {
    stored = false;
  }
  const complete = filled === 3 && emailOk;
  return {
    stored,
    filled,
    complete,
    label: complete ? (stored ? 'vyplněn' : 'výchozí') : (String(filled) + '/3 údajů'),
    state: complete ? (stored ? 'ok' : 'info') : 'warn',
    detail: complete
      ? (stored ? 'Kontakt pro běžné menu je uložený v administraci.' : 'Kontakt používá výchozí údaje, před předáním ověř, že stále platí.')
      : 'Doplň jméno, telefon a platný e-mail v administraci / Kontakt aplikace.'
  };
}

function adminHandoverExternalLinksSnapshot() {
  let settings = null;
  try {
    settings = typeof getRakExternalLinksSettings === 'function' ? getRakExternalLinksSettings() : null;
  } catch (err) {
    settings = null;
  }
  const links = settings && settings.links && typeof settings.links === 'object' ? settings.links : {};
  const keys = ['food', 'eportal', 'payroll', 'calendar'];
  let urls = 0;
  let labels = 0;
  let invalid = 0;
  let emptyText = 0;
  keys.forEach((key) => {
    const link = links[key] && typeof links[key] === 'object' ? links[key] : {};
    const url = String(link.url || '').trim();
    const label = String(link.label || '').trim();
    const value = String(link.value || '').trim();
    const meta = String(link.meta || '').trim();
    if (url) urls += 1;
    if (label) labels += 1;
    if (!value && !meta) emptyText += 1;
    if (url) {
      let valid = false;
      try {
        valid = typeof isRakExternalLinkUrlValid === 'function' ? isRakExternalLinkUrlValid(url) : /^(https?:)\/\//i.test(url);
      } catch (err) {
        valid = /^(https?:)\/\//i.test(url);
      }
      if (!valid) invalid += 1;
    }
  });
  let stored = false;
  try {
    const rows = Array.isArray(app && app.machineSettingsRows) ? app.machineSettingsRows : [];
    stored = rows.some((row) => {
      const category = String(row && row.category || '').trim();
      const key = String(row && row.machine_key || '').trim();
      let rowSettings = row && row.settings_json && typeof row.settings_json === 'object' ? row.settings_json : null;
      if (!rowSettings && row && row.settings_json) {
        try { rowSettings = JSON.parse(String(row.settings_json)); } catch (err) { rowSettings = null; }
      }
      return category === 'external_links_settings'
        || key === 'EXTERNAL_LINKS_SETTINGS'
        || String(rowSettings && rowSettings.stored_category || '').trim() === 'external_links_settings'
        || String(rowSettings && rowSettings.admin_settings_key || '').trim() === 'EXTERNAL_LINKS_SETTINGS';
    });
  } catch (err) {
    stored = false;
  }
  const total = keys.length;
  const complete = urls === total && labels === total && invalid === 0;
  const state = complete ? (stored ? 'ok' : 'info') : 'warn';
  return {
    stored,
    total,
    urls,
    labels,
    invalid,
    emptyText,
    complete,
    state,
    label: complete ? (stored ? '4/4 OK' : 'výchozí') : (String(urls) + '/' + String(total) + ' URL'),
    detail: complete
      ? (stored ? 'Veřejné odkazy jsou uložené a mají platný formát.' : 'Odkazy používají výchozí adresy, před předáním ověř, že stále platí.')
      : 'Doplň nebo oprav odkazy v administraci / Odkazy.'
  };
}

function adminHandoverAnnouncementSnapshot() {
  let announcement = null;
  let active = null;
  let health = null;
  try {
    announcement = typeof readRakDashboardAdminAnnouncement === 'function' ? readRakDashboardAdminAnnouncement() : null;
  } catch (err) {
    announcement = null;
  }
  try {
    active = typeof getRakActiveDashboardAnnouncement === 'function' ? getRakActiveDashboardAnnouncement(new Date()) : null;
  } catch (err) {
    active = null;
  }
  try {
    health = typeof getRakDashboardAnnouncementHealth === 'function' ? getRakDashboardAnnouncementHealth() : null;
  } catch (err) {
    health = null;
  }
  const item = announcement && typeof announcement === 'object' ? announcement : {};
  const message = String(item.message || '').trim();
  const title = String(item.title || '').trim();
  const startAt = String(item.startAt || '').trim();
  const endAt = String(item.endAt || '').trim();
  const activeNow = !!(active && active.message);
  const hasWindow = !!(startAt || endAt);
  const source = String((active && active.source) || item.source || health && health.activeSource || '').trim();
  return {
    exists: !!message,
    activeNow,
    hasWindow,
    title,
    messageLength: message.length,
    source,
    state: !message ? 'info' : (activeNow ? 'warn' : 'info'),
    label: !message ? 'vypnuto' : (activeNow ? 'aktivní na home' : 'naplánováno / mimo čas'),
    detail: !message
      ? 'Na home není aktivní žádné oznámení.'
      : (activeNow
        ? 'Oznámení je veřejně viditelné na home, před předáním ověř text a čas.'
        : 'Oznámení existuje, ale teď není aktivní; zkontroluj čas Od/Do v administraci.')
  };
}

function adminHandoverPayrollSnapshot() {
  let settings = null;
  try {
    settings = typeof getRakPayrollSettings === 'function' ? getRakPayrollSettings() : null;
  } catch (err) {
    settings = null;
  }
  const safe = settings && typeof settings === 'object' ? settings : {};
  const workdayOrdinal = Math.max(1, Math.min(15, Number(safe.workdayOrdinal || 4) || 4));
  const overrides = Array.isArray(safe.overrides) ? safe.overrides : [];
  let nextDate = null;
  try {
    nextDate = typeof getNextPayrollDateWithSettings === 'function'
      ? getNextPayrollDateWithSettings({ workdayOrdinal, overrides }, new Date())
      : null;
  } catch (err) {
    nextDate = null;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = nextDate ? Math.max(0, Math.round((nextDate.getTime() - today.getTime()) / 86400000)) : null;
  let stored = false;
  try {
    const rows = Array.isArray(app && app.machineSettingsRows) ? app.machineSettingsRows : [];
    stored = rows.some((row) => {
      const category = String(row && row.category || '').trim();
      const key = String(row && row.machine_key || '').trim();
      let rowSettings = row && row.settings_json && typeof row.settings_json === 'object' ? row.settings_json : null;
      if (!rowSettings && row && row.settings_json) {
        try { rowSettings = JSON.parse(String(row.settings_json)); } catch (err) { rowSettings = null; }
      }
      return category === 'payroll_settings'
        || key === 'PAYROLL_SETTINGS'
        || String(rowSettings && rowSettings.stored_category || '').trim() === 'payroll_settings'
        || String(rowSettings && rowSettings.admin_settings_key || '').trim() === 'PAYROLL_SETTINGS';
    });
  } catch (err) {
    stored = false;
  }
  const nextLabel = nextDate
    ? nextDate.toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';
  const diffUnit = (typeof pluralizeDays === 'function') ? pluralizeDays(Number(diffDays || 0)) : (Number(diffDays) === 1 ? 'den' : 'dní');
  return {
    stored,
    workdayOrdinal,
    overridesCount: overrides.length,
    nextDate,
    diffDays,
    label: nextDate ? (nextLabel + (stored ? '' : ' výchozí')) : 'zkontrolovat',
    state: nextDate ? (stored ? 'ok' : 'info') : 'warn',
    detail: nextDate
      ? ((stored ? 'Výplata je nastavená v administraci.' : 'Výplata používá výchozí pravidlo, před předáním ověř, že stále platí.') + ' Pravidlo: ' + String(workdayOrdinal) + '. pracovní den' + (diffDays !== null ? ', nejbližší za ' + String(diffDays) + ' ' + diffUnit + '.' : '.'))
      : 'Zkontroluj pravidlo výplaty v administraci / Výplata.'
  };
}

function adminHandoverFullSettingsBackupSnapshot() {
  let backups = [];
  try {
    backups = typeof adminFullSettingsBackupList === 'function' ? adminFullSettingsBackupList() : [];
  } catch (err) {
    backups = [];
  }
  const latest = Array.isArray(backups) && backups.length ? backups[0] : null;
  const latestLabel = latest && latest.createdAt && typeof adminFullSettingsBackupDateLabel === 'function'
    ? adminFullSettingsBackupDateLabel(latest.createdAt)
    : '';
  return {
    count: Array.isArray(backups) ? backups.length : 0,
    latest,
    state: backups.length ? 'ok' : 'warn',
    label: backups.length ? (String(backups.length) + ' bodů') : 'chybí',
    detail: backups.length
      ? ('Nejnovější úplná záloha nastavení: ' + latestLabel + '.')
      : 'Hlavní admin má před předáním vytvořit první úplnou zálohu nastavení.'
  };
}

function adminHandoverSyncReadinessSnapshot() {
  let syncStatus = null;
  let hardening = null;
  try {
    syncStatus = typeof window !== 'undefined' && typeof window.getSupabaseSyncStatus === 'function' ? window.getSupabaseSyncStatus() : null;
  } catch (err) {
    syncStatus = null;
  }
  try {
    hardening = typeof window !== 'undefined' && typeof window.getSupabaseHardeningStatus === 'function' ? window.getSupabaseHardeningStatus() : null;
  } catch (err) {
    hardening = null;
  }
  const queueLength = Number((syncStatus && syncStatus.queued) || (hardening && hardening.queueLength) || 0);
  const queueHealth = hardening && hardening.queueHealth ? hardening.queueHealth : null;
  const syncKind = String(syncStatus && syncStatus.kind || '').trim();
  const online = typeof navigator !== 'undefined' ? navigator.onLine !== false : true;
  const critical = !!(queueHealth && queueHealth.critical);
  const staleCount = Number(queueHealth && queueHealth.staleTaskCount || 0);
  const missingDiag = !syncStatus && !hardening;
  const hasProblem = !online || queueLength > 0 || critical || staleCount > 0 || /^(offline|pending|error)$/i.test(syncKind);
  return {
    state: hasProblem ? 'warn' : (missingDiag ? 'info' : 'ok'),
    title: 'Synchronizace',
    value: missingDiag ? 'nezjištěno' : (!online ? 'offline' : (queueLength > 0 ? String(queueLength) + ' ve frontě' : (critical || staleCount > 0 ? 'zkontrolovat' : 'bez fronty'))),
    detail: missingDiag
      ? 'Diagnostika synchronizace zatím není dostupná.'
      : !online
        ? 'Zařízení je offline, před předáním zkontroluj servis a opakuj synchronizaci.'
        : queueLength > 0
          ? 'Před předáním nech frontu odeslat nebo otevři servis synchronizace.'
          : critical || staleCount > 0
            ? 'Offline fronta hlásí staré nebo rizikové položky.'
            : 'Online fronta je prázdná, pokračuj běžnou kontrolou.'
  };
}

function adminHandoverReadinessItemHtml(item) {
  const state = String(item && item.state || 'info').trim() || 'info';
  return [
    '<div class="adminHandoverReadinessItem is' + escapeHtml(state.charAt(0).toUpperCase() + state.slice(1)) + '">',
    '  <span>' + escapeHtml(item && item.title || '') + '</span>',
    '  <b>' + escapeHtml(item && item.value || '') + '</b>',
    '  <small>' + escapeHtml(item && item.detail || '') + '</small>',
    '</div>'
  ].join('');
}

function adminHandoverReadinessActionForTitle(title) {
  const safeTitle = String(title || '').trim().toLowerCase();
  if (safeTitle.indexOf('synchroniz') !== -1) return { action: 'open-service', label: 'Servis' };
  if (safeTitle.indexOf('online') !== -1) return { action: 'load-machines', label: 'Načíst' };
  if (safeTitle.indexOf('stroj') !== -1 || safeTitle.indexOf('kalkula') !== -1) return { action: 'open-machines', label: 'Stroje' };
  if (safeTitle.indexOf('rozpis') !== -1) return { action: 'open-rotation', label: 'Rozpis' };
  if (safeTitle.indexOf('provoz') !== -1) return { action: 'open-food', label: 'Provoz' };
  if (safeTitle.indexOf('volno') !== -1) return { action: 'open-vacation', label: 'Dovolená' };
  if ((safeTitle.indexOf('záloh') !== -1 || safeTitle.indexOf('zaloh') !== -1) && safeTitle.indexOf('nastaven') !== -1) return { action: 'open-settings-backups', label: 'Zálohy nastavení' };
  if (safeTitle.indexOf('záloh') !== -1 || safeTitle.indexOf('zaloh') !== -1) return { action: 'open-backups', label: 'Zálohy' };
  if (safeTitle.indexOf('správc') !== -1 || safeTitle.indexOf('spravc') !== -1) return { action: 'open-admin-accounts', label: 'Správci' };
  if (safeTitle.indexOf('report') !== -1 || safeTitle.indexOf('chyb') !== -1) return { action: 'open-reports', label: 'Reporty' };
  if (safeTitle.indexOf('oznámen') !== -1 || safeTitle.indexOf('oznamen') !== -1 || safeTitle.indexOf('dashboard') !== -1) return { action: 'open-announcement', label: 'Oznámení' };
  if (safeTitle.indexOf('kontakt') !== -1) return { action: 'open-app-contact', label: 'Kontakt' };
  if (safeTitle.indexOf('odkaz') !== -1) return { action: 'open-external-links', label: 'Odkazy' };
  if (safeTitle.indexOf('výplat') !== -1 || safeTitle.indexOf('vyplat') !== -1) return { action: 'open-payroll-settings', label: 'Výplata' };
  return { action: 'open-handover', label: 'Předání' };
}

function adminHandoverTodoItemHtml(item) {
  const state = String(item && item.state || 'info').trim() || 'info';
  const action = adminHandoverReadinessActionForTitle(item && item.title);
  return [
    '<div class="adminHandoverTodoItem is' + escapeHtml(state.charAt(0).toUpperCase() + state.slice(1)) + '">',
    '  <div class="adminHandoverTodoText">',
    '    <div class="adminHandoverTodoTitle">' + escapeHtml(item && item.title || '') + '</div>',
    '    <div class="smallText">' + escapeHtml(item && item.detail || '') + '</div>',
    '  </div>',
    '  <button type="button" class="appMenuAction adminHandoverTodoAction" data-admin-action="' + escapeHtml(action.action) + '">' + escapeHtml(action.label) + '</button>',
    '</div>'
  ].join('');
}

function buildAdminHandoverTodoHtml(monthKey) {
  const snapshot = buildAdminHandoverReadinessSnapshot(monthKey);
  const warnings = snapshot.checks.filter((item) => item && item.state === 'warn');
  const infos = snapshot.checks.filter((item) => item && item.state === 'info');
  const selected = (warnings.length ? warnings : infos).slice(0, 4);
  const ready = !selected.length;
  return [
    '<div class="adminHandoverTodo">',
    '  <div class="appMenuSubTitle">Co ještě vyřešit před předáním</div>',
    '  <div class="smallText uMb10">' + escapeHtml(ready ? 'Nejsou tu žádná varování. Před stažením podkladů stačí projít informační body v připravenosti.' : 'Krátký seznam podle aktuálních varování v připravenosti předání. Tlačítka jen otevírají administraci.') + '</div>',
    ready ? '  <div class="adminHandoverTodoDone">Všechna blokující varování jsou vyřešená.</div>' : selected.map(adminHandoverTodoItemHtml).join(''),
    '</div>'
  ].join('');
}

function buildAdminHandoverTodoText(monthKey) {
  const snapshot = buildAdminHandoverReadinessSnapshot(monthKey);
  const warnings = snapshot.checks.filter((item) => item && item.state === 'warn');
  const infos = snapshot.checks.filter((item) => item && item.state === 'info');
  const selected = warnings.length ? warnings : infos;
  const lines = buildRakAdminExportMetadataLines('RaK - Ukoly pred predanim', {
    monthKey: snapshot.selectedMonth,
    extraLines: ['Mesic: ' + (snapshot.selectedMonth || 'nevybran')]
  });
  lines.push('', 'Co jeste vyresit pred predanim');
  if (!selected.length) {
    lines.push('- Bez blokujicich varovani.');
  } else {
    selected.forEach((item) => {
      lines.push('- ' + String(item.title || 'Kontrola') + ': ' + String(item.detail || ''));
    });
  }
  lines.push('');
  return lines.join('\n');
}

function downloadAdminHandoverTodoText() {
  const monthKey = getAdminSelectedMonthKey();
  const text = buildAdminHandoverTodoText(monthKey);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateKey = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = 'RaK_ukoly_pred_predanim_' + dateKey + '.txt';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    try { URL.revokeObjectURL(url); } catch (err) {}
    try { a.remove(); } catch (err) {}
  }, 0);
  const status = document.getElementById('adminOnlineSaveStatus');
  if (status) status.textContent = 'Úkoly před předáním staženy jako textový soubor.';
}

function buildAdminHandoverReadinessSnapshot(monthKey) {
  const selectedMonth = String(monthKey || getAdminSelectedMonthKey() || '').trim();
  const rows = Array.isArray(app && app.machineSettingsRows) ? app.machineSettingsRows : [];
  const machineRows = adminHandoverMachineSettingsRows(rows);
  const month = app && app.rotation && app.rotation.months ? app.rotation.months[selectedMonth] : null;
  const hasMonthRows = !!(month && adminGuideHasMonthRows(month));
  const foodSnapshot = (typeof getFoodAdminSettingsSnapshot === 'function') ? getFoodAdminSettingsSnapshot() : null;
  const foodLocations = Array.isArray(foodSnapshot && foodSnapshot.locations) ? foodSnapshot.locations.length : 0;
  const overtimeCount = adminGuideOvertimeCount();
  const vacationCount = adminGuideUpcomingVacationCount();
  const specialDaysCount = adminGuideUpcomingSpecialDaysCount();
  const backupsSnapshot = app && app.adminRotationBackupsSnapshot && typeof app.adminRotationBackupsSnapshot === 'object' ? app.adminRotationBackupsSnapshot : null;
  const backups = backupsSnapshot && Array.isArray(backupsSnapshot.backups) ? backupsSnapshot.backups : [];
  const permissionStatus = adminPermissionStatusSnapshot();
  const activeAdmins = adminHandoverActiveAdminCount();
  const adminSessions = adminHandoverAdminSessionSnapshot();
  const reportsSnapshot = adminHandoverReportsSnapshot();
  const announcementSnapshot = adminHandoverAnnouncementSnapshot();
  const machineSettingsSnapshot = adminHandoverMachineSettingsSnapshot();
  const contactSnapshot = adminHandoverAppContactSnapshot();
  const linksSnapshot = adminHandoverExternalLinksSnapshot();
  const payrollSnapshot = adminHandoverPayrollSnapshot();
  const fullSettingsBackupSnapshot = adminHandoverFullSettingsBackupSnapshot();
  const syncReadiness = adminHandoverSyncReadinessSnapshot();
  const checks = [
    {
      state: permissionStatus.unlocked ? 'ok' : 'warn',
      title: 'Přístup',
      value: permissionStatus.unlocked ? permissionStatus.roleLabel : 'zamčeno',
      detail: permissionStatus.unlocked ? 'Administrace je odemčená pro ověřený účet.' : 'Nejdřív ověř admin účet heslem.'
    },
    {
      state: rows.length ? 'ok' : 'warn',
      title: 'Online data',
      value: rows.length ? String(rows.length) + ' řádků' : 'nenačteno',
      detail: rows.length ? ('Běžných strojů v nastavení: ' + String(machineRows.length) + '.') : 'Načti online data, ať nový správce nepracuje se starým stavem.'
    },
    syncReadiness,
    {
      state: machineSettingsSnapshot.state,
      title: 'Stroje / kalkulačky',
      value: machineSettingsSnapshot.label,
      detail: machineSettingsSnapshot.detail
    },
    {
      state: hasMonthRows ? 'ok' : 'warn',
      title: 'Rozpis',
      value: hasMonthRows ? (selectedMonth || 'vyplněn') : 'zkontrolovat',
      detail: hasMonthRows ? 'Vybraný měsíc má vyplněné směny.' : 'Vybraný měsíc chybí nebo vypadá prázdně.'
    },
    {
      state: foodLocations ? 'ok' : 'warn',
      title: 'Provoz',
      value: foodLocations ? String(foodLocations) + ' míst' : 'chybí',
      detail: overtimeCount ? ('Přesčasových termínů: ' + String(overtimeCount) + '.') : 'Zkontroluj kantýnu, jídelnu a podle potřeby přesčasy.'
    },
    {
      state: (vacationCount || specialDaysCount) ? 'ok' : 'info',
      title: 'Volno',
      value: vacationCount ? String(vacationCount) + ' období' : (specialDaysCount ? String(specialDaysCount) + ' dnů' : 'ověřit'),
      detail: specialDaysCount ? ('Mimořádné volné dny: ' + String(specialDaysCount) + '.') : 'Pokud je dovolená, odstávka nebo svátek, doplň ji před rozpisem.'
    },
    {
      state: backups.length ? 'ok' : 'info',
      title: 'Zálohy',
      value: backups.length ? String(backups.length) + ' záloh' : 'ověřit',
      detail: backups.length ? 'Zálohy jsou načtené v administraci.' : 'Před větší úpravou načti a zkontroluj zálohy.'
    },
    {
      state: fullSettingsBackupSnapshot.state,
      title: 'Zálohy nastavení',
      value: fullSettingsBackupSnapshot.label,
      detail: fullSettingsBackupSnapshot.detail
    },
    {
      state: activeAdmins > 1 ? 'ok' : 'info',
      title: 'Správci',
      value: activeAdmins > 1 ? String(activeAdmins) + ' účty' : 'jen hlavní',
      detail: activeAdmins > 1 ? 'Je připravený další správce.' : 'Dalšího správce může doplnit hlavní admin.'
    },
    {
      state: adminSessions.count ? 'ok' : 'info',
      title: 'Admin zařízení',
      value: adminSessions.label,
      detail: adminSessions.detail
    },
    {
      state: reportsSnapshot.openCount ? 'warn' : (reportsSnapshot.total ? 'ok' : 'info'),
      title: 'Reporty chyb',
      value: reportsSnapshot.label,
      detail: reportsSnapshot.detail
    },
    {
      state: announcementSnapshot.state,
      title: 'Oznámení Dashboard',
      value: announcementSnapshot.label,
      detail: announcementSnapshot.detail
    },
    {
      state: contactSnapshot.state,
      title: 'Kontakt',
      value: contactSnapshot.label,
      detail: contactSnapshot.detail
    },
    {
      state: linksSnapshot.state,
      title: 'Odkazy',
      value: linksSnapshot.label,
      detail: linksSnapshot.detail
    },
    {
      state: payrollSnapshot.state,
      title: 'Výplata',
      value: payrollSnapshot.label,
      detail: payrollSnapshot.detail
    }
  ];
  const okCount = checks.filter((item) => item.state === 'ok').length;
  const warnCount = checks.filter((item) => item.state === 'warn').length;
  const infoCount = checks.filter((item) => item.state === 'info').length;
  return {
    checks,
    okCount,
    warnCount,
    infoCount,
    totalCount: checks.length,
    ready: warnCount === 0,
    selectedMonth
  };
}

function buildAdminHandoverReadinessHtml(monthKey) {
  const snapshot = buildAdminHandoverReadinessSnapshot(monthKey);
  const summary = snapshot.ready
    ? 'Předání nevypadá blokované. Projdi ještě informační body a potom stáhni předávací podklady.'
    : 'Před předáním zkontroluj varování. Tenhle panel jen čte aktuální stav a nic sám neukládá.';
  return [
    '<div class="adminHandoverReadiness">',
    '  <div class="appMenuSubTitle">Připravenost předání</div>',
    '  <div class="adminHandoverReadinessSummary is' + (snapshot.ready ? 'Ok' : 'Warn') + '">',
    '    <span>' + escapeHtml(snapshot.ready ? 'Připraveno ke kontrole' : 'Ještě zkontrolovat') + '</span>',
    '    <b>' + escapeHtml(String(snapshot.okCount) + '/' + String(snapshot.totalCount) + ' OK') + '</b>',
    '    <small>' + escapeHtml(summary) + '</small>',
    '  </div>',
    '  <div class="adminHandoverReadinessGrid">',
    snapshot.checks.map(adminHandoverReadinessItemHtml).join(''),
    '  </div>',
    '</div>'
  ].join('');
}

function buildAdminHandoverReadinessText(monthKey) {
  const snapshot = buildAdminHandoverReadinessSnapshot(monthKey);
  const lines = buildRakAdminExportMetadataLines('RaK - Pripravenost predani', {
    monthKey: snapshot.selectedMonth,
    extraLines: ['Mesic: ' + (snapshot.selectedMonth || 'nevybran')]
  });
  lines.push(
    '',
    'Pripravenost predani',
    '- Stav: ' + (snapshot.ready ? 'bez blokujicich varovani' : 'zkontrolovat varovani'),
    '- Souhrn: ' + String(snapshot.okCount) + '/' + String(snapshot.totalCount) + ' OK, varovani ' + String(snapshot.warnCount) + ', info ' + String(snapshot.infoCount)
  );
  snapshot.checks.forEach((item) => {
    lines.push('- ' + String(item.title || 'Kontrola') + ': ' + String(item.value || '') + ' - ' + String(item.detail || ''));
  });
  lines.push('');
  return lines.join('\n');
}

function adminPermissionStatusSnapshot() {
  let activeAccountId = '';
  try {
    activeAccountId = typeof rakAdminGetActiveAccountId === 'function' ? String(rakAdminGetActiveAccountId() || '').trim() : '';
  } catch (err) {}
  if (!activeAccountId) {
    try {
      const profile = app && app.gamesProfile;
      activeAccountId = String(profile && profile.activeAccountId || '').trim();
    } catch (err) {}
  }
  const adminAccountId = String(app && app.adminAccountId || '').trim();
  let unlocked = false;
  try {
    unlocked = typeof rakAdminCanOpenAdmin === 'function'
      ? !!rakAdminCanOpenAdmin()
      : !!(app && app.adminUnlocked === true && adminAccountId && adminAccountId === activeAccountId);
  } catch (err) {
    unlocked = false;
  }
  let owner = false;
  try {
    owner = typeof rakAdminCanManageAdmins === 'function' ? !!rakAdminCanManageAdmins() : !!(app && app.adminIsOwner === true);
  } catch (err) {
    owner = false;
  }
  const roleLabel = unlocked ? (owner ? 'Hlavní admin' : 'Nižší admin') : 'Zamčeno';
  const stateLabel = unlocked ? 'Odemčeno' : 'Zamčeno';
  const detail = unlocked
    ? (owner ? 'Můžeš měnit správce a všechny admin sekce.' : 'Můžeš spravovat provoz, rozpisy a nastavení a změnit své heslo, ale ne hesla dalších správců ani hlavního admina.')
    : 'Admin akce jsou vypnuté, dokud se účet neověří heslem.';
  return {
    activeAccountId,
    adminAccountId,
    unlocked,
    owner,
    roleLabel,
    stateLabel,
    detail
  };
}

function adminPermissionStatusItemHtml(label, value, detail, state) {
  const stateClass = state ? ' is' + String(state).charAt(0).toUpperCase() + String(state).slice(1) : '';
  return [
    '<div class="adminPermissionStatusItem' + escapeHtml(stateClass) + '">',
    '  <span>' + escapeHtml(label || '') + '</span>',
    '  <b>' + escapeHtml(value || '—') + '</b>',
    detail ? '  <small>' + escapeHtml(detail) + '</small>' : '',
    '</div>'
  ].join('');
}

function buildAdminPermissionStatusHtml() {
  const status = adminPermissionStatusSnapshot();
  const action = status.owner
    ? '<button type="button" class="appMenuAction adminPermissionStatusAction" data-admin-action="open-admin-accounts">Správci</button>'
    : '';
  return [
    '<div class="adminPermissionStatus">',
    '  <div class="appMenuSubTitle">Oprávnění správce</div>',
    '  <div class="smallText uMb10">Rychlá kontrola, pod jakým účtem je administrace odemčená. Běžná aplikace odsud žádné změny nepozná.</div>',
    '  <div class="adminPermissionStatusGrid">',
    adminPermissionStatusItemHtml('Aktivní účet', status.activeAccountId || 'nezjištěn', 'Účet, pod kterým je aplikace otevřená.', status.activeAccountId ? 'ok' : 'warn'),
    adminPermissionStatusItemHtml('Role', status.roleLabel, status.detail, status.unlocked ? 'ok' : 'warn'),
    adminPermissionStatusItemHtml('Admin odemčen', status.stateLabel, status.adminAccountId ? ('Ověřeno pro účet ' + status.adminAccountId + '.') : 'Bez ověřeného admin účtu.', status.unlocked ? 'ok' : 'warn'),
    '  </div>',
    action,
    '</div>'
  ].join('');
}

function adminAccessRuleItemHtml(role, allowed, blocked, state) {
  const stateClass = state ? ' is' + String(state).charAt(0).toUpperCase() + String(state).slice(1) : '';
  return [
    '<div class="adminAccessRuleItem' + escapeHtml(stateClass) + '">',
    '  <span>' + escapeHtml(role || '') + '</span>',
    '  <b>' + escapeHtml(allowed || '') + '</b>',
    '  <small>' + escapeHtml(blocked || '') + '</small>',
    '</div>'
  ].join('');
}

function buildAdminAccessRulesHtml() {
  return [
    '<div class="adminAccessRules">',
    '  <div class="appMenuSubTitle">Kdo smí co měnit</div>',
    '  <div class="smallText uMb10">Předávací přehled rolí. Běžný uživatel odsud nic neuvidí a žádná změna se tady sama neukládá.</div>',
    '  <div class="adminAccessRulesGrid">',
    adminAccessRuleItemHtml('Hlavní admin', 'Správci, hesla, provoz i rozpisy.', 'Jediný smí určit další správce.', 'owner'),
    adminAccessRuleItemHtml('Nižší admin', 'Provoz, rozpisy, absence, zálohy, exporty a nastavení aplikace.', 'Nesmí měnit seznam správců ani jejich hesla.', 'admin'),
    adminAccessRuleItemHtml('Běžný účet', 'Používá jen běžnou aplikaci.', 'Nesmí měnit rozpis, provoz ani online nastavení.', 'user'),
    '  </div>',
    '</div>'
  ].join('');
}

function buildAdminAccessRulesText() {
  const activeAdmins = adminHandoverActiveAdminCount();
  const adminSessions = adminHandoverAdminSessionSnapshot();
  const reportsSnapshot = adminHandoverReportsSnapshot();
  const announcementSnapshot = adminHandoverAnnouncementSnapshot();
  const machineSettingsSnapshot = adminHandoverMachineSettingsSnapshot();
  const contactSnapshot = adminHandoverAppContactSnapshot();
  const linksSnapshot = adminHandoverExternalLinksSnapshot();
  const payrollSnapshot = adminHandoverPayrollSnapshot();
  const fullSettingsBackupSnapshot = adminHandoverFullSettingsBackupSnapshot();
  const permissionStatus = adminPermissionStatusSnapshot();
  return [
    'Pristup a hesla',
    '- Aktivni admin ucty: ' + String(activeAdmins),
    '- Prihlasena admin zarizeni: ' + adminSessions.label,
    '- Reporty chyb pred predanim: ' + reportsSnapshot.label,
    '- Oznameni Dashboard pred predanim: ' + announcementSnapshot.label,
    '- Stroje a kalkulacky pred predanim: ' + machineSettingsSnapshot.label,
    '- Kontakt aplikace pred predanim: ' + contactSnapshot.label,
    '- Verejne odkazy pred predanim: ' + linksSnapshot.label,
    '- Vyplata pred predanim: ' + payrollSnapshot.label,
    '- Uplne zalohy nastaveni pred predanim: ' + fullSettingsBackupSnapshot.label,
    '- Aktualni role: ' + String(permissionStatus.roleLabel || 'nezjisteno'),
    '- Hlavni admin muze menit spravce, hesla, provoz i rozpisy.',
    '- Nizsi admin muze menit provoz, rozpisy, absence, zalohy, exporty a nastaveni aplikace, ale ne seznam spravcu ani hesla.',
    '- Bezny ucet nesmi menit rozpis, provoz ani online nastaveni.',
    '- Predavaci exporty nestahuji hesla. Hesla se nastavuji jen v administraci / Spravci.',
    ''
  ].join('\n');
}

function adminPostSaveCheckItemHtml(item) {
  const action = String(item && item.action || '').trim();
  const button = action
    ? '<button type="button" class="appMenuAction adminPostSaveCheckAction" data-admin-action="' + escapeHtml(action) + '">' + escapeHtml(item.actionLabel || 'Otevřít') + '</button>'
    : '';
  return [
    '<div class="adminPostSaveCheckItem">',
    '  <div class="adminPostSaveCheckIndex">' + escapeHtml(item && item.index || '') + '</div>',
    '  <div class="adminPostSaveCheckText">',
    '    <div class="adminPostSaveCheckTitle">' + escapeHtml(item && item.title || '') + '</div>',
    '    <div class="smallText">' + escapeHtml(item && item.detail || '') + '</div>',
    '  </div>',
    button,
    '</div>'
  ].join('');
}

function getAdminPostSaveCheckItems() {
  return [
    {
      index: '1',
      title: 'Zelená synchronizace',
      detail: 'Po každém uložení zkontroluj home nebo servis, že změna nezůstala jen lokálně.',
      action: 'open-service',
      actionLabel: 'Servis'
    },
    {
      index: '2',
      title: 'Veřejný dopad',
      detail: 'U změn pro lidi otevři mapu, kde přesně vidíš, co se má projevit v běžné aplikaci nebo exportu.',
      action: 'open-settings-map',
      actionLabel: 'Mapa'
    },
    {
      index: '3',
      title: 'Reporty chyb',
      detail: 'Když po uložení něco nesedí, nejdřív zkontroluj reporty a připojení zařízení.',
      action: 'open-reports',
      actionLabel: 'Reporty'
    },
    {
      index: '4',
      title: 'Export až nakonec',
      detail: 'Excel, ZIP nebo předávací podklady dělej až po ruční kontrole uloženého stavu.',
      action: 'open-export',
      actionLabel: 'Export'
    }
  ];
}

function buildAdminPostSaveCheckHtml() {
  return [
    '<div class="adminPostSaveCheck">',
    '  <div class="appMenuSubTitle">Kontrola po uložení</div>',
    '  <div class="smallText uMb10">Krátký admin-only postup po každé změně. Tlačítka jen otevírají kontrolní sekce, nic sama neukládají.</div>',
    '  <div class="adminPostSaveCheckList">',
    getAdminPostSaveCheckItems().map(adminPostSaveCheckItemHtml).join(''),
    '  </div>',
    '</div>'
  ].join('');
}

function buildAdminPostSaveCheckText() {
  const lines = [
    'Kontrola po ulozeni',
    '- Tenhle seznam je kontrola pro spravce, ne automaticka zmena dat.'
  ];
  getAdminPostSaveCheckItems().forEach((item) => {
    lines.push(String(item.index || '-') + '. ' + String(item.title || 'Kontrola') + ': ' + String(item.detail || ''));
  });
  lines.push('');
  return lines.join('\n');
}

function buildAdminHandoverAuditHtml(monthKey) {
  const rows = Array.isArray(app && app.machineSettingsRows) ? app.machineSettingsRows : [];
  const machineRows = adminHandoverMachineSettingsRows(rows);
  const month = app && app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
  const hasMonthRows = !!(month && adminGuideHasMonthRows(month));
  const foodSnapshot = (typeof getFoodAdminSettingsSnapshot === 'function') ? getFoodAdminSettingsSnapshot() : null;
  const foodOk = !!(foodSnapshot && Array.isArray(foodSnapshot.locations) && foodSnapshot.locations.length);
  const overtimeCount = adminGuideOvertimeCount();
  const vacationCount = adminGuideUpcomingVacationCount();
  const specialDaysCount = adminGuideUpcomingSpecialDaysCount();
  const backupsSnapshot = app && app.adminRotationBackupsSnapshot && typeof app.adminRotationBackupsSnapshot === 'object' ? app.adminRotationBackupsSnapshot : null;
  const backups = backupsSnapshot && Array.isArray(backupsSnapshot.backups) ? backupsSnapshot.backups : [];
  const activeAdmins = adminHandoverActiveAdminCount();
  const adminSessions = adminHandoverAdminSessionSnapshot();
  const reportsSnapshot = adminHandoverReportsSnapshot();
  const announcementSnapshot = adminHandoverAnnouncementSnapshot();
  const machineSettingsSnapshot = adminHandoverMachineSettingsSnapshot();
  const contactSnapshot = adminHandoverAppContactSnapshot();
  const linksSnapshot = adminHandoverExternalLinksSnapshot();
  const payrollSnapshot = adminHandoverPayrollSnapshot();
  const fullSettingsBackupSnapshot = adminHandoverFullSettingsBackupSnapshot();
  const items = [
    {
      state: rows.length ? 'ok' : 'warn',
      title: 'Online nastavení',
      value: rows.length ? (String(rows.length) + ' řádků') : 'nenačteno',
      detail: rows.length ? ('Strojů v běžném nastavení: ' + String(machineRows.length) + '.') : 'Před předáním načti online data, ať správce nekouká na starý lokální stav.',
      action: rows.length ? 'open-service' : 'load-machines',
      actionLabel: rows.length ? 'Servis' : 'Načíst'
    },
    {
      state: activeAdmins > 1 ? 'ok' : 'info',
      title: 'Správci',
      value: activeAdmins > 1 ? (String(activeAdmins) + ' účty') : 'jen hlavní',
      detail: activeAdmins > 1 ? 'Je připravený aspoň jeden další admin účet.' : 'Hlavní admin funguje, dalšího správce může doplnit jen owner účet.',
      action: (typeof rakAdminCanManageAdmins === 'function' && rakAdminCanManageAdmins()) ? 'open-admin-accounts' : '',
      actionLabel: 'Správci'
    },
    {
      state: adminSessions.count ? 'ok' : 'info',
      title: 'Admin zařízení',
      value: adminSessions.label,
      detail: adminSessions.detail,
      action: (typeof rakAdminCanManageAdmins === 'function' && rakAdminCanManageAdmins()) ? 'open-admin-accounts' : '',
      actionLabel: 'Správci'
    },
    {
      state: reportsSnapshot.openCount ? 'warn' : (reportsSnapshot.total ? 'ok' : 'info'),
      title: 'Reporty chyb',
      value: reportsSnapshot.label,
      detail: reportsSnapshot.detail,
      action: 'open-reports',
      actionLabel: 'Reporty'
    },
    {
      state: machineSettingsSnapshot.state,
      title: 'Stroje / kalkulačky',
      value: machineSettingsSnapshot.label,
      detail: machineSettingsSnapshot.detail,
      action: 'open-machines',
      actionLabel: 'Stroje'
    },
    {
      state: announcementSnapshot.state,
      title: 'Oznámení Dashboard',
      value: announcementSnapshot.label,
      detail: announcementSnapshot.detail,
      action: 'open-announcement',
      actionLabel: 'Oznámení'
    },
    {
      state: contactSnapshot.state,
      title: 'Kontakt',
      value: contactSnapshot.label,
      detail: contactSnapshot.detail,
      action: 'open-app-contact',
      actionLabel: 'Kontakt'
    },
    {
      state: linksSnapshot.state,
      title: 'Odkazy',
      value: linksSnapshot.label,
      detail: linksSnapshot.detail,
      action: 'open-external-links',
      actionLabel: 'Odkazy'
    },
    {
      state: payrollSnapshot.state,
      title: 'Výplata',
      value: payrollSnapshot.label,
      detail: payrollSnapshot.detail,
      action: 'open-payroll-settings',
      actionLabel: 'Výplata'
    },
    {
      state: foodOk && overtimeCount ? 'ok' : 'warn',
      title: 'Provoz',
      value: foodOk ? (overtimeCount ? 'připraveno' : 'bez přesčasů') : 'zkontrolovat',
      detail: foodOk ? ('Kantýna/jídelna dostupná, přesčasů evidováno ' + String(overtimeCount) + '.') : 'Zkontroluj kantýnu, jídelnu a přesčasové neděle.',
      action: foodOk && !overtimeCount ? 'open-overtime' : 'open-food',
      actionLabel: foodOk && !overtimeCount ? 'Přesčasy' : 'Časy'
    },
    {
      state: vacationCount ? 'ok' : 'warn',
      title: 'Dovolená / volno',
      value: vacationCount ? (String(vacationCount) + ' období') : 'chybí',
      detail: specialDaysCount ? ('Mimořádné volné dny navíc: ' + String(specialDaysCount) + '.') : 'Doplň nejbližší dovolenou, odstávku nebo mimořádné volno podle potřeby.',
      action: vacationCount ? 'open-special-days' : 'open-vacation',
      actionLabel: vacationCount ? 'Volné dny' : 'Dovolená'
    },
    {
      state: hasMonthRows ? 'ok' : 'warn',
      title: 'Rozpis',
      value: hasMonthRows ? String(monthKey || 'hotovo') : 'nevyplněno',
      detail: hasMonthRows ? 'Vybraný měsíc má vyplněné směny.' : 'Před předáním zkontroluj, že navazující měsíc existuje a není prázdný.',
      action: 'open-rotation',
      actionLabel: 'Rozpis'
    },
    {
      state: backups.length ? 'ok' : 'info',
      title: 'Zálohy',
      value: backups.length ? (String(backups.length) + ' záloh') : 'ověřit',
      detail: backups.length ? 'Online zálohy jsou načtené a připravené k obnově.' : 'Načti zálohy a ověř, že se dá vrátit starší stav rozpisu.',
      action: 'open-backups',
      actionLabel: 'Zálohy'
    },
    {
      state: fullSettingsBackupSnapshot.state,
      title: 'Zálohy nastavení',
      value: fullSettingsBackupSnapshot.label,
      detail: fullSettingsBackupSnapshot.detail,
      action: 'open-settings-backups',
      actionLabel: 'Zálohy nastavení'
    }
  ];
  return [
    '<div class="adminHandoverAudit">',
    '  <div class="appMenuSubTitle">Kontrola předání</div>',
    '  <div class="smallText uMb10">Rychlý stav věcí, které má nový správce zkontrolovat. Tohle nic samo nemění, jen vede do správné admin sekce.</div>',
    '  <div class="adminHandoverAuditGrid">',
    items.map(adminHandoverAuditItemHtml).join(''),
    '  </div>',
    '</div>'
  ].join('');
}

function buildAdminHandoverStatusText(monthKey) {
  const selectedMonth = String(monthKey || getAdminSelectedMonthKey() || '').trim();
  const rows = Array.isArray(app && app.machineSettingsRows) ? app.machineSettingsRows : [];
  const machineRows = adminHandoverMachineSettingsRows(rows);
  const month = app && app.rotation && app.rotation.months ? app.rotation.months[selectedMonth] : null;
  const hasMonthRows = !!(month && adminGuideHasMonthRows(month));
  const foodSnapshot = (typeof getFoodAdminSettingsSnapshot === 'function') ? getFoodAdminSettingsSnapshot() : null;
  const foodLocations = Array.isArray(foodSnapshot && foodSnapshot.locations) ? foodSnapshot.locations.length : 0;
  const overtimeCount = adminGuideOvertimeCount();
  const vacationCount = adminGuideUpcomingVacationCount();
  const specialDaysCount = adminGuideUpcomingSpecialDaysCount();
  const backupsSnapshot = app && app.adminRotationBackupsSnapshot && typeof app.adminRotationBackupsSnapshot === 'object' ? app.adminRotationBackupsSnapshot : null;
  const backups = backupsSnapshot && Array.isArray(backupsSnapshot.backups) ? backupsSnapshot.backups : [];
  const activeAdmins = adminHandoverActiveAdminCount();
  const adminSessions = adminHandoverAdminSessionSnapshot();
  const reportsSnapshot = adminHandoverReportsSnapshot();
  const announcementSnapshot = adminHandoverAnnouncementSnapshot();
  const machineSettingsSnapshot = adminHandoverMachineSettingsSnapshot();
  const contactSnapshot = adminHandoverAppContactSnapshot();
  const linksSnapshot = adminHandoverExternalLinksSnapshot();
  const payrollSnapshot = adminHandoverPayrollSnapshot();
  const fullSettingsBackupSnapshot = adminHandoverFullSettingsBackupSnapshot();
  const permissionStatus = adminPermissionStatusSnapshot();
  return buildRakAdminExportMetadataLines('RaK - Stav předání správy', {
    monthKey: selectedMonth,
    extraLines: ['Měsíc: ' + (selectedMonth || 'nevybrán')]
  }).concat([
    '',
    'Souhrn',
    buildAdminHandoverTodoText(selectedMonth).trim(),
    buildAdminHandoverReadinessText(selectedMonth).trim(),
    '- Online nastavení: ' + (rows.length ? ('načteno ' + rows.length + ' řádků') : 'nenačteno'),
    '- Běžné stroje v nastavení: ' + String(machineRows.length),
    '- Stroje a kalkulačky: ' + machineSettingsSnapshot.label + ' - ' + machineSettingsSnapshot.detail,
    '- Aktivní admin účet: ' + (permissionStatus.activeAccountId || 'nezjištěn'),
    '- Role administrace: ' + permissionStatus.roleLabel,
    '- Admin odemčen: ' + (permissionStatus.unlocked ? 'ano' : 'ne'),
    '- Přihlášená admin zařízení: ' + adminSessions.label,
    '- Reporty chyb před předáním: ' + reportsSnapshot.label,
    '- Oznámení Dashboard před předáním: ' + announcementSnapshot.label,
    '- Kontakt aplikace před předáním: ' + contactSnapshot.label,
    '- Veřejné odkazy před předáním: ' + linksSnapshot.label,
    '- Výplata před předáním: ' + payrollSnapshot.label,
    '- Úplné zálohy nastavení před předáním: ' + fullSettingsBackupSnapshot.label,
    '- Pravidlo hlavního admina: hlavní admin smí měnit správce a hesla.',
    '- Pravidlo nižšího admina: smí měnit provoz, rozpisy, absence, zálohy, exporty a nastavení aplikace, ale ne správce a hesla.',
    '- Pravidlo běžného účtu: nesmí měnit rozpis, provoz ani online nastavení.',
    buildAdminAccessRulesText().trim(),
    '- Admin účty: ' + String(activeAdmins),
    '- Admin zařízení: ' + adminSessions.label,
    '- Reporty chyb: ' + reportsSnapshot.label,
    '- Stroje a kalkulačky: ' + machineSettingsSnapshot.label,
    '- Oznámení Dashboard: ' + announcementSnapshot.label,
    '- Kontakt aplikace: ' + contactSnapshot.label,
    '- Veřejné odkazy: ' + linksSnapshot.label,
    '- Výplata: ' + payrollSnapshot.label,
    '- Úplné zálohy nastavení: ' + fullSettingsBackupSnapshot.label,
    '- Kantýna / jídelna: ' + (foodLocations ? ('nastaveno ' + foodLocations + ' míst') : 'zkontrolovat'),
    '- Přesčasové termíny: ' + String(overtimeCount),
    '- Dovolené / odstávky: ' + String(vacationCount),
    '- Mimořádné volné dny: ' + String(specialDaysCount),
    '- Vybraný rozpis: ' + (selectedMonth || 'nevybrán'),
    '- Rozpis má vyplněné směny: ' + (hasMonthRows ? 'ano' : 'ne / zkontrolovat'),
    '- Načtené zálohy: ' + String(backups.length),
    '',
    'Doporučená kontrola',
    buildAdminPostSaveCheckText().trim(),
    '- Po načtení online dat projít Předání správy a Příručku správce.',
    '- Před úpravou rozpisu ověřit zálohy.',
    '- Po uložení zkontrolovat zelený stav synchronizace na hlavní stránce.',
    '- Běžný uživatel nemá mít možnost měnit rozpis ani nastavení mimo administraci.',
    ''
  ]).join('\n');
}

function downloadAdminHandoverStatusText() {
  const monthKey = getAdminSelectedMonthKey();
  const text = buildAdminHandoverStatusText(monthKey);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateKey = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = 'RaK_stav_predani_' + dateKey + '.txt';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    try { URL.revokeObjectURL(url); } catch (err) {}
    try { a.remove(); } catch (err) {}
  }, 0);
  const status = document.getElementById('adminOnlineSaveStatus');
  if (status) status.textContent = 'Stav předání stažen jako textový soubor.';
}

function buildAdminHandoverPackageText(monthKey) {
  const selectedMonth = String(monthKey || getAdminSelectedMonthKey() || '').trim();
  return buildRakAdminExportMetadataLines('RaK - Balicek predani spravy', {
    monthKey: selectedMonth,
    extraLines: ['Mesic: ' + (selectedMonth || 'nevybran')]
  }).concat([
    '',
    'Pravidlo',
    '- Tenhle soubor je jen predavaci podklad. Nic sam nemeni ani neuklada.',
    '- Zmeny delat jen v administraci a vzdy ulozit v konkretni sekci.',
    '- Bezni uzivatele nemaji mit moznost menit rozpis, provoz ani nastaveni.',
    buildAdminAccessRulesText().trim(),
    '',
    '============================================================',
    buildAdminHandoverTodoText(selectedMonth),
    '============================================================',
    buildAdminHandoverReadinessText(selectedMonth),
    '============================================================',
    buildAdminPostSaveCheckText(),
    '============================================================',
    buildAdminHandoverStatusText(selectedMonth),
    '============================================================',
    buildAdminMonthlyWorkflowText(selectedMonth),
    '============================================================',
    buildAdminManualText(selectedMonth),
    '============================================================',
    buildAdminSettingsMapText()
  ]).join('\n');
}

function downloadAdminHandoverPackageText() {
  const monthKey = getAdminSelectedMonthKey();
  const text = buildAdminHandoverPackageText(monthKey);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateKey = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = 'RaK_balicek_predani_' + dateKey + '.txt';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    try { URL.revokeObjectURL(url); } catch (err) {}
    try { a.remove(); } catch (err) {}
  }, 0);
  const status = document.getElementById('adminOnlineSaveStatus');
  if (status) status.textContent = 'Balíček předání stažen jako textový soubor.';
}

function buildAdminMenuSectionHtml(title, detail, actions, options = {}) {
  const safeActions = (Array.isArray(actions) ? actions : []).filter((item) => item && item.action && item.label);
  if (!safeActions.length) return '';
  const openAttr = options.open === false ? '' : ' open';
  return [
    '<details class="adminMenuSection"' + openAttr + '>',
    '  <summary>',
    '    <span>' + escapeHtml(title || '') + '</span>',
    detail ? '    <small>' + escapeHtml(detail) + '</small>' : '',
    '  </summary>',
    '  <div class="adminMenuActionGrid">',
    safeActions.map((item) => '<button type="button" class="appMenuAction" data-admin-action="' + escapeHtml(item.action) + '">' + escapeHtml(item.label) + '</button>').join(''),
    '  </div>',
    '</details>'
  ].join('');
}

function buildAdminHandoverChecklistHtml(monthKey) {
  const rows = Array.isArray(app && app.machineSettingsRows) ? app.machineSettingsRows : [];
  const month = app && app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
  const foodSnapshot = (typeof getFoodAdminSettingsSnapshot === 'function') ? getFoodAdminSettingsSnapshot() : null;
  const overtimeCount = adminGuideOvertimeCount();
  const vacationCount = adminGuideUpcomingVacationCount();
  const specialDaysCount = adminGuideUpcomingSpecialDaysCount();
  const backups = app && app.adminRotationBackupsSnapshot && Array.isArray(app.adminRotationBackupsSnapshot.backups)
    ? app.adminRotationBackupsSnapshot.backups
    : [];
  const items = [
    {
      ok: rows.length > 0,
      title: 'Online nastavení',
      detail: rows.length ? ('Načteno ' + String(rows.length) + ' řádků nastavení.') : 'Nejdřív načti online nastavení.',
      action: 'open-service',
      actionLabel: 'Servis'
    },
    {
      ok: !!(foodSnapshot && Array.isArray(foodSnapshot.locations) && foodSnapshot.locations.length),
      title: 'Kantýna / jídelna',
      detail: foodSnapshot && foodSnapshot.locations ? 'Provozní časy jsou dostupné.' : 'Zkontroluj provozní časy.',
      action: 'open-food',
      actionLabel: 'Časy'
    },
    {
      ok: overtimeCount > 0,
      title: 'Přesčasy',
      detail: overtimeCount ? ('Evidováno ' + String(overtimeCount) + ' přesčasových termínů.') : 'Doplň přesčasové neděle.',
      action: 'open-overtime',
      actionLabel: 'Přesčasy'
    },
    {
      ok: vacationCount > 0,
      title: 'Dovolená / odstávky',
      detail: vacationCount ? ('Nadcházejících období: ' + String(vacationCount) + '.') : 'Doplň nejbližší dovolenou nebo odstávku.',
      action: 'open-vacation',
      actionLabel: 'Dovolená'
    },
    {
      ok: specialDaysCount > 0,
      title: 'Mimořádné volné dny',
      detail: specialDaysCount ? ('Budoucích dnů: ' + String(specialDaysCount) + '.') : 'Jednorázové svátky nebo odstávky lze doplnit podle potřeby.',
      action: 'open-special-days',
      actionLabel: 'Volné dny'
    },
    {
      ok: !!(month && adminGuideHasMonthRows(month)),
      title: 'Rozpis ' + String(monthKey || ''),
      detail: month ? (adminGuideHasMonthRows(month) ? 'Vybraný měsíc má vyplněné směny.' : 'Měsíc existuje, ale vypadá prázdně.') : 'Vybraný měsíc zatím není vytvořený.',
      action: 'open-rotation',
      actionLabel: 'Rozpis'
    },
    {
      ok: (typeof getRakWorkerRosterSettings === 'function' ? getRakWorkerRosterSettings().workers.length : 0) > 0,
      title: 'Pracovníci',
      detail: 'Seznam lidí, kteří se počítají v rozpisu a statistikách.',
      action: 'open-workers',
      actionLabel: 'Pracovníci'
    },
    {
      ok: true,
      title: 'Pravidla generátoru',
      detail: 'Pořadí lidí a strojů lze zkontrolovat před vytvořením návrhu.',
      action: 'open-generator-settings',
      actionLabel: 'Pravidla'
    },
    {
      ok: true,
      title: 'Externí odkazy',
      detail: 'Jídelní lístek, Eportal, Výplata a Kalendář se dají upravit bez zásahu do souborů.',
      action: 'open-external-links',
      actionLabel: 'Odkazy'
    },
    {
      ok: true,
      title: 'Kontakt aplikace',
      detail: 'Jméno, telefon a e-mail v menu Kontakt lze změnit bez úpravy souborů.',
      action: 'open-app-contact',
      actionLabel: 'Kontakt'
    },
    {
      ok: true,
      title: 'Výplata',
      detail: 'Datum výplaty lze řídit pravidlem pracovního dne a ručními měsíčními výjimkami.',
      action: 'open-payroll-settings',
      actionLabel: 'Výplata'
    },
    {
      ok: backups.length > 0,
      title: 'Zálohy',
      detail: backups.length ? ('Načtených záloh: ' + String(backups.length) + '.') : 'Před předáním si ověř, že jsou zálohy dostupné.',
      action: 'open-backups',
      actionLabel: 'Zálohy'
    },
    {
      ok: !!(month && adminGuideHasMonthRows(month)),
      title: 'Export / předání',
      detail: month && adminGuideHasMonthRows(month) ? 'Rozpis je připravený k exportu.' : 'Export dělej až po kontrole rozpisu.',
      action: 'open-export',
      actionLabel: 'Export'
    }
  ];
  if (typeof rakAdminCanManageAdmins === 'function' && rakAdminCanManageAdmins()) {
    items.push({
      ok: true,
      title: 'Správci',
      detail: 'Hlavní admin může přidat nebo vypnout další správce.',
      action: 'open-admin-accounts',
      actionLabel: 'Správci'
    });
    items.push({
      ok: true,
      title: 'Admin zařízení',
      detail: 'Hlavní admin zkontroluje přihlášená zařízení a odhlásí ta, která už nemají mít přístup.',
      action: 'open-admin-accounts',
      actionLabel: 'Zařízení'
    });
  }
  const done = items.filter((item) => item.ok).length;
  return [
    '<div class="adminGuideBox">',
    '  <div class="appMenuSubTitle">Průvodce správou</div>',
    '  <div class="smallText uMb10">Postup pro předání aplikace: provozní nastavení, přesčasy, dovolené, rozpis, zálohy a export. Hotovo ' + String(done) + '/' + String(items.length) + '.</div>',
    items.map(adminGuideItemHtml).join(''),
    '</div>'
  ].join('');
}

function adminMonthlyWorkflowItemHtml(item, index) {
  const state = String(item && item.state || 'todo').trim() || 'todo';
  const action = String(item && item.action || '').trim();
  const button = action
    ? '<button type="button" class="appMenuAction adminMonthlyWorkflowAction" data-admin-action="' + escapeHtml(action) + '">' + escapeHtml(item.actionLabel || 'Otevřít') + '</button>'
    : '';
  return [
    '<div class="adminMonthlyWorkflowItem is' + escapeHtml(state.charAt(0).toUpperCase() + state.slice(1)) + '">',
    '  <div class="adminMonthlyWorkflowIndex">' + String(index + 1) + '</div>',
    '  <div class="adminMonthlyWorkflowText">',
    '    <div class="adminMonthlyWorkflowTitle">' + escapeHtml(item.title || '') + '</div>',
    '    <div class="smallText">' + escapeHtml(item.detail || '') + '</div>',
    '  </div>',
    button,
    '</div>'
  ].join('');
}

function getAdminMonthlyWorkflowItems(monthKey) {
  const rows = Array.isArray(app && app.machineSettingsRows) ? app.machineSettingsRows : [];
  const month = app && app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
  const monthReady = !!(month && adminGuideHasMonthRows(month));
  const foodSnapshot = (typeof getFoodAdminSettingsSnapshot === 'function') ? getFoodAdminSettingsSnapshot() : null;
  const foodOk = !!(foodSnapshot && Array.isArray(foodSnapshot.locations) && foodSnapshot.locations.length);
  const overtimeCount = adminGuideOvertimeCount();
  const vacationCount = adminGuideUpcomingVacationCount();
  const specialDaysCount = adminGuideUpcomingSpecialDaysCount();
  const backups = app && app.adminRotationBackupsSnapshot && Array.isArray(app.adminRotationBackupsSnapshot.backups)
    ? app.adminRotationBackupsSnapshot.backups
    : [];
  const monthLabel = String(monthKey || '').trim() || 'vybraný měsíc';
  return {
    monthLabel,
    items: [
    {
      state: rows.length ? 'ok' : 'warn',
      title: 'Načíst online data',
      detail: rows.length ? ('Nastavení je načtené (' + String(rows.length) + ' řádků).') : 'Nejdřív načti online nastavení, ať se nepracuje se starým lokálním stavem.',
      action: rows.length ? 'open-service' : 'load-machines',
      actionLabel: rows.length ? 'Servis' : 'Načíst'
    },
    {
      state: foodOk ? 'ok' : 'warn',
      title: 'Zkontrolovat provoz',
      detail: foodOk ? ('Kantýna/jídelna je připravená, přesčasových termínů je ' + String(overtimeCount) + '.') : 'Projdi kantýnu, jídelnu a přesčasy ještě před generováním rozpisu.',
      action: foodOk && overtimeCount ? 'open-overtime' : 'open-food',
      actionLabel: foodOk && overtimeCount ? 'Přesčasy' : 'Provoz'
    },
    {
      state: (vacationCount || specialDaysCount) ? 'ok' : 'info',
      title: 'Doplnit volno a absence',
      detail: (vacationCount || specialDaysCount)
        ? ('Dovolené/odstávky: ' + String(vacationCount) + ', mimořádné volné dny: ' + String(specialDaysCount) + '.')
        : 'Pokud je dovolená, odstávka, svátek nebo neplánované volno, doplň to před návrhem rozpisu.',
      action: vacationCount ? 'open-rotation' : 'open-vacation',
      actionLabel: vacationCount ? 'Absence' : 'Dovolená'
    },
    {
      state: monthReady ? 'ok' : 'warn',
      title: 'Připravit rozpis ' + monthLabel,
      detail: monthReady ? 'Měsíc už má vyplněné směny. Při přegenerování zkontroluj návrh před uložením.' : 'Otevři rozpis, vyber měsíc, doplň absence a teprve potom vytvoř návrh.',
      action: 'open-rotation',
      actionLabel: 'Rozpis'
    },
    {
      state: monthReady ? 'ok' : 'todo',
      title: 'Uložit až po ruční kontrole',
      detail: monthReady ? 'Po uložení ověř zelenou synchronizaci na home a případně stav v servisu.' : 'Návrh se nesmí brát jako hotový, dokud ho správce ručně nezkontroluje a neuloží.',
      action: monthReady ? 'open-service' : 'open-rotation',
      actionLabel: monthReady ? 'Servis' : 'Rozpis'
    },
    {
      state: backups.length ? 'ok' : 'info',
      title: 'Zálohy a export',
      detail: backups.length ? ('Načtených záloh: ' + String(backups.length) + '. Export udělej až po finální kontrole.') : 'Před větší změnou ověř zálohy. Po dokončení můžeš stáhnout Excel nebo ZIP.',
      action: backups.length ? 'open-export' : 'open-backups',
      actionLabel: backups.length ? 'Export' : 'Zálohy'
    }
    ]
  };
}

function adminNextStepItemHtml(item) {
  const state = String(item && item.state || 'todo').trim() || 'todo';
  const action = String(item && item.action || '').trim();
  const button = action
    ? '<button type="button" class="appMenuAction adminNextStepAction" data-admin-action="' + escapeHtml(action) + '">' + escapeHtml(item.actionLabel || 'Otevřít') + '</button>'
    : '';
  return [
    '<div class="adminNextStepItem is' + escapeHtml(state.charAt(0).toUpperCase() + state.slice(1)) + '">',
    '  <div class="adminNextStepText">',
    '    <div class="adminNextStepTitle">' + escapeHtml(item && item.title || '') + '</div>',
    '    <div class="smallText">' + escapeHtml(item && item.detail || '') + '</div>',
    '  </div>',
    button,
    '</div>'
  ].join('');
}

function buildAdminNextStepsHtml(monthKey) {
  const workflow = getAdminMonthlyWorkflowItems(monthKey);
  const items = Array.isArray(workflow.items) ? workflow.items : [];
  const needsAttention = items.filter((item) => item && /^(warn|todo)$/i.test(String(item.state || '')));
  const usefulInfo = items.filter((item) => item && /^info$/i.test(String(item.state || '')));
  const selected = (needsAttention.length ? needsAttention : usefulInfo.length ? usefulInfo : items).slice(0, 3);
  if (!selected.length) return '';
  const readyText = needsAttention.length
    ? 'Nejbližší kroky podle aktuálního stavu. Blok nic neukládá, jen vede do správné admin sekce.'
    : 'Aktuální stav nevypadá kriticky. Přesto tady zůstávají nejbližší kontrolní kroky pro správce.';
  return [
    '<div class="adminNextSteps">',
    '  <div class="appMenuSubTitle">Co teď zkontrolovat</div>',
    '  <div class="smallText uMb10">' + escapeHtml(readyText) + '</div>',
    selected.map(adminNextStepItemHtml).join(''),
    '</div>'
  ].join('');
}

function buildAdminHandoverExportsHtml(monthKey) {
  const monthLabel = String(monthKey || getAdminSelectedMonthKey() || '').trim() || 'nevybrán';
  const actions = [
    { action: 'download-handover-package', label: 'Balíček' },
    { action: 'download-handover-status', label: 'Stav' },
    { action: 'download-handover-todo', label: 'Úkoly' },
    { action: 'download-admin-manual', label: 'Příručka' },
    { action: 'download-monthly-workflow', label: 'Postup' },
    { action: 'download-settings-map', label: 'Mapa' }
  ];
  return [
    '<div class="adminHandoverExports">',
    '  <div class="appMenuSubTitle">Předávací podklady</div>',
    '  <div class="smallText uMb10">Rychlé stažení podkladů pro nového správce. Tlačítka jen vytvoří textový soubor, nic neukládají.</div>',
    '  <div class="adminHandoverExportStatus">',
    '    <span>Měsíc: <b>' + escapeHtml(monthLabel) + '</b></span>',
    '    <span>Zdroj: <b>aktuální stav</b></span>',
    '    <span>Uložení: <b>beze změn</b></span>',
    '  </div>',
    '  <div class="adminHandoverExportGrid">',
    actions.map((item, index) => '<button type="button" class="appMenuAction' + (index === 0 ? ' isActive' : '') + '" data-admin-action="' + escapeHtml(item.action) + '">' + escapeHtml(item.label) + '</button>').join(''),
    '  </div>',
    '</div>'
  ].join('');
}

function buildAdminActionLegendHtml() {
  const items = [
    { label: 'Uložit', detail: 'mění online data', state: 'save' },
    { label: 'Import', detail: 'přepisuje rozpisy z Excelu', state: 'import' },
    { label: 'Obnovit', detail: 'přepíše aktuální rozpis zálohou', state: 'restore' },
    { label: 'Načíst', detail: 'jen načte uložený stav', state: 'load' },
    { label: 'Stáhnout', detail: 'jen vytvoří soubor', state: 'download' },
    { label: 'Zpět', detail: 'nic nemění', state: 'back' }
  ];
  return [
    '<div class="adminActionLegend">',
    '  <div class="appMenuSubTitle">Legenda tlačítek</div>',
    '  <div class="adminActionLegendGrid">',
    items.map((item) => [
      '<div class="adminActionLegendItem is' + escapeHtml(item.state.charAt(0).toUpperCase() + item.state.slice(1)) + '">',
      '  <b>' + escapeHtml(item.label) + '</b>',
      '  <span>' + escapeHtml(item.detail) + '</span>',
      '</div>'
    ].join('')).join(''),
    '  </div>',
    '</div>'
  ].join('');
}


function buildAdminMonthlyWorkflowHtml(monthKey) {
  const workflow = getAdminMonthlyWorkflowItems(monthKey);
  return [
    '<div class="adminMonthlyWorkflow">',
    '  <div class="appMenuSubTitle">Měsíční postup</div>',
    '  <div class="smallText uMb10">Krátký pořádek práce pro správce. Panel nic sám neukládá, jen vede do chráněných admin sekcí.</div>',
    workflow.items.map(adminMonthlyWorkflowItemHtml).join(''),
    '</div>'
  ].join('');
}

function buildAdminMonthlyWorkflowText(monthKey) {
  const workflow = getAdminMonthlyWorkflowItems(monthKey);
  const stateLabels = { ok: 'OK', warn: 'zkontrolovat', info: 'podle potřeby', todo: 'čeká' };
  const lines = buildRakAdminExportMetadataLines('RaK - Měsíční postup správy', {
    monthKey,
    extraLines: ['Měsíc: ' + workflow.monthLabel]
  });
  lines.push(
    '',
    'Pravidlo',
    '- Tenhle soubor nic sám nemění. Každou změnu udělej v administraci a ulož v konkrétní sekci.',
    '- Běžní uživatelé nemají mít možnost měnit rozpis, provoz ani nastavení.',
    '',
    'Kroky'
  );
  workflow.items.forEach((item, index) => {
    const state = String(item && item.state || 'todo').trim() || 'todo';
    lines.push(String(index + 1) + '. ' + String(item && item.title || 'Krok'));
    lines.push('- Stav: ' + (stateLabels[state] || state));
    lines.push('- ' + String(item && item.detail || ''));
    lines.push('- Sekce v administraci: ' + String(item && item.actionLabel || 'otevřít'));
    lines.push('');
  });
  lines.push('Kontrola po uložení');
  lines.push('- Po uložení rozpisu zkontroluj zelenou synchronizaci na home.');
  lines.push('- Při větší změně se podívej do Záloh rozpisu a podle potřeby stáhni Excel/ZIP export.');
  lines.push('');
  return lines.join('\n');
}

function downloadAdminMonthlyWorkflowText() {
  const monthKey = getAdminSelectedMonthKey();
  const text = buildAdminMonthlyWorkflowText(monthKey);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateKey = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = 'RaK_mesicni_postup_' + dateKey + '.txt';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    try { URL.revokeObjectURL(url); } catch (err) {}
    try { a.remove(); } catch (err) {}
  }, 0);
  const status = document.getElementById('adminOnlineSaveStatus');
  if (status) status.textContent = 'Měsíční postup stažen jako textový soubor.';
}

function buildAdminHandoverRunbookHtml(monthKey) {
  const monthLabel = String(monthKey || '').trim() || 'vybraný měsíc';
  const steps = [
    {
      title: '1. Provoz',
      detail: 'Nejdřív načíst online nastavení a zkontrolovat stroje, kantýnu, přesčasy, dovolené a mimořádné volné dny.',
      actions: [
        { action: 'open-service', label: 'Servis' },
        { action: 'open-machines', label: 'Stroje' },
        { action: 'open-food', label: 'Kantýna' },
        { action: 'open-overtime', label: 'Přesčasy' },
        { action: 'open-vacation', label: 'Dovolená' },
        { action: 'open-special-days', label: 'Volné dny' }
      ]
    },
    {
      title: '2. Rozpis ' + monthLabel,
      detail: 'Doplnit absence, zkontrolovat pravidla generátoru, vygenerovat návrh a uložit ho až po ruční kontrole.',
      actions: [
        { action: 'open-rotation', label: 'Rozpisy' },
        { action: 'open-generator-settings', label: 'Pravidla' },
        { action: 'open-backups', label: 'Zálohy' }
      ]
    },
    {
      title: '3. Veřejná část',
      detail: 'Upravit jen to, co mají lidé opravdu vidět: oznámení, odkazy, kontakt a výplatu.',
      actions: [
        { action: 'open-announcement', label: 'Oznámení' },
        { action: 'open-external-links', label: 'Odkazy' },
        { action: 'open-app-contact', label: 'Kontakt' },
        { action: 'open-payroll-settings', label: 'Výplata' }
      ]
    },
    {
      title: '4. Kontrola',
      detail: 'Po uložení ověřit synchronizaci, reporty chyb a připravit export pro předání.',
      actions: [
        { action: 'open-reports', label: 'Reporty' },
        { action: 'open-export', label: 'Export' }
      ]
    }
  ];
  if (typeof rakAdminCanManageAdmins === 'function' && rakAdminCanManageAdmins()) {
    steps[3].actions.push({ action: 'open-admin-accounts', label: 'Správci' });
  }
  return [
    '<div class="adminHandoverRunbook">',
    steps.map((step) => [
      '<div class="adminHandoverStep">',
      '  <div class="adminHandoverStepTitle">' + escapeHtml(step.title) + '</div>',
      '  <div class="smallText">' + escapeHtml(step.detail) + '</div>',
      '  <div class="adminHandoverActionRow">',
      (step.actions || []).map((item) => '<button type="button" class="appMenuAction" data-admin-action="' + escapeHtml(item.action) + '">' + escapeHtml(item.label) + '</button>').join(''),
      '  </div>',
      '</div>'
    ].join('')).join(''),
    '</div>'
  ].join('');
}

function adminManualSectionHtml(title, detail, actions, options = {}) {
  const safeActions = (Array.isArray(actions) ? actions : []).filter((item) => item && item.action && item.label);
  const openAttr = options.open === false ? '' : ' open';
  return [
    '<details class="adminManualSection"' + openAttr + '>',
    '  <summary>',
    '    <span>' + escapeHtml(title || '') + '</span>',
    '    <small>' + escapeHtml(detail || '') + '</small>',
    '  </summary>',
    safeActions.length ? ('  <div class="adminManualActionRow">' + safeActions.map((item) => '<button type="button" class="appMenuAction" data-admin-action="' + escapeHtml(item.action) + '">' + escapeHtml(item.label) + '</button>').join('') + '</div>') : '',
    '</details>'
  ].join('');
}

function buildAdminManualHtml(monthKey) {
  const monthLabel = String(monthKey || '').trim() || 'vybraný měsíc';
  const ownerCanManage = typeof rakAdminCanManageAdmins === 'function' && rakAdminCanManageAdmins();
  const sections = [
    adminManualSectionHtml(
      'Nový měsíc rozpisu',
      'Načíst online data, zkontrolovat dny a absence, vygenerovat návrh, ručně ho projít a až potom uložit.',
      [
        { action: 'open-service', label: 'Servis' },
        { action: 'open-rotation', label: 'Rozpis ' + monthLabel },
        { action: 'open-generator-settings', label: 'Pravidla' },
        { action: 'open-backups', label: 'Zálohy' }
      ]
    ),
    adminManualSectionHtml(
      'Dovolené, odstávky a volné dny',
      'Dlouhé období patří do Dovolená / odstávky. Jednorázový den bez práce patří do Mimořádných volných dnů.',
      [
        { action: 'open-vacation', label: 'Dovolená' },
        { action: 'open-special-days', label: 'Volné dny' },
        { action: 'open-rotation', label: 'Absence v rozpisu' }
      ]
    ),
    adminManualSectionHtml(
      'Přesčasy a provoz kantýny',
      'Přesčasové neděle pro rozpis se spravují v Přesčasech. Časy kantýny a jídelny se upravují zvlášť.',
      [
        { action: 'open-overtime', label: 'Přesčasy' },
        { action: 'open-food', label: 'Kantýna / jídelna' }
      ],
      { open: false }
    ),
    adminManualSectionHtml(
      'Odkazy a texty pro lidi',
      'Tady se mění jen věci viditelné v běžné aplikaci: oznámení, odkazy, kontakt a výplata.',
      [
        { action: 'open-announcement', label: 'Oznámení' },
        { action: 'open-external-links', label: 'Odkazy' },
        { action: 'open-app-contact', label: 'Kontakt' },
        { action: 'open-payroll-settings', label: 'Výplata' }
      ],
      { open: false }
    ),
    adminManualSectionHtml(
      'Zálohy a obnova',
      'Před obnovou rozpisu i nastavení se aktuální stav ještě uloží jako bod návratu. Obnovu používat jen po kontrole správného času, měsíce a typu zálohy.',
      [
        { action: 'open-backups', label: 'Zálohy' },
        { action: 'open-settings-backups', label: 'Zálohy nastavení' },
        { action: 'open-export', label: 'Export / import' },
        { action: 'open-reports', label: 'Reporty' }
      ],
      { open: false }
    ),
    adminManualSectionHtml(
      'Předání dalšímu správci',
      ownerCanManage
        ? 'Hlavní admin může přidat další správce, nastavit jim heslo a potom projít panel Předání správy.'
        : 'Nižší admin může používat pracovní části administrace. Další adminy může přidat jen hlavní admin účet.',
      [
        { action: 'open-handover', label: 'Předání správy' }
      ].concat(ownerCanManage ? [
        { action: 'open-admin-accounts', label: 'Správci' },
        { action: 'open-admin-accounts', label: 'Admin zařízení' }
      ] : []),
      { open: false }
    )
  ];
  return [
    '<div class="adminManualBox">',
    '  <div class="appMenuSubTitle">Příručka správce</div>',
    '  <div class="smallText uMb10">Krátké postupy pro běžné admin práce. Všechny akce otevírají jen administraci; nic se neuloží bez tlačítka Uložit v konkrétní sekci.</div>',
    sections.join(''),
    '</div>'
  ].join('');
}

function adminSettingsMapItemHasPublicImpact(item) {
  const visibleText = String(item && item.visible || '');
  return /Viditeln|home|Rotace|export|menu|rozpis|statistik|provozn/i.test(visibleText);
}

function adminSettingsMapImpactItemHtml(item, state) {
  return [
    '<div class="adminSettingsMapImpactItem is' + escapeHtml(state === 'public' ? 'Public' : 'AdminOnly') + '">',
    '  <span>' + escapeHtml(item.title || '') + '</span>',
    '  <b>' + escapeHtml(state === 'public' ? 'Uvidí běžní lidé' : 'Jen správa') + '</b>',
    '  <small>' + escapeHtml(item.visible || '') + '</small>',
    '</div>'
  ].join('');
}

function buildAdminSettingsMapImpactGroupHtml(title, detail, items, state) {
  const list = Array.isArray(items) ? items : [];
  return [
    '<div class="adminSettingsMapImpactGroup is' + escapeHtml(state === 'public' ? 'Public' : 'AdminOnly') + '">',
    '  <div class="adminSettingsMapImpactHead">',
    '    <span>' + escapeHtml(title || '') + '</span>',
    '    <small>' + escapeHtml(detail || '') + '</small>',
    '  </div>',
    list.length
      ? list.map((item) => adminSettingsMapImpactItemHtml(item, state)).join('')
      : '  <div class="smallText">Žádná oblast v téhle skupině.</div>',
    '</div>'
  ].join('');
}

function buildAdminSettingsMapImpactHtml(items) {
  const list = Array.isArray(items) ? items : [];
  const publicItems = list.filter(adminSettingsMapItemHasPublicImpact);
  const adminOnlyItems = list.filter((item) => !adminSettingsMapItemHasPublicImpact(item));
  return [
    '<div class="adminSettingsMapImpact">',
    '  <div class="appMenuSubTitle">Veřejný dopad změn</div>',
    '  <div class="smallText uMb10">Rychlá kontrola pro správce: vlevo jsou změny, které se projeví běžným lidem, vpravo čistě správcovské části. Tenhle přehled nic neukládá.</div>',
    '  <div class="adminSettingsMapImpactGrid">',
    buildAdminSettingsMapImpactGroupHtml('Viditelné pro lidi', 'Po uložení zkontroluj běžnou aplikaci nebo export.', publicItems, 'public'),
    buildAdminSettingsMapImpactGroupHtml('Jen administrace', 'Slouží hlavně pro správu, kontrolu a předání.', adminOnlyItems, 'adminOnly'),
    '  </div>',
    '</div>'
  ].join('');
}

function adminSettingsMapItemHtml(item) {
  const actions = Array.isArray(item && item.actions) ? item.actions : [];
  const check = String(item && item.check || '').trim();
  return [
    '<div class="adminSettingsMapItem">',
    '  <div class="adminSettingsMapHead">',
    '    <span>' + escapeHtml(item.title || '') + '</span>',
    '    <b>' + escapeHtml(item.scope || '') + '</b>',
    '  </div>',
    '  <div class="smallText">' + escapeHtml(item.detail || '') + '</div>',
    '  <div class="adminSettingsMapMeta">' + escapeHtml(item.visible || '') + '</div>',
    check ? '  <div class="adminSettingsMapCheck"><span>Po ulozeni over</span><b>' + escapeHtml(check) + '</b></div>' : '',
    actions.length ? ('  <div class="adminSettingsMapActions">' + actions.map((action) => '<button type="button" class="appMenuAction" data-admin-action="' + escapeHtml(action.action || '') + '">' + escapeHtml(action.label || 'Otevřít') + '</button>').join('') + '</div>') : '',
    '</div>'
  ].join('');
}

function adminSettingsMapStatusItemHtml(label, value, detail, state) {
  const safeState = state || 'ok';
  return [
    '<div class="adminSettingsMapStatusItem is' + escapeHtml(safeState.charAt(0).toUpperCase() + safeState.slice(1)) + '">',
    '  <span>' + escapeHtml(label || '') + '</span>',
    '  <b>' + escapeHtml(value || '') + '</b>',
    detail ? '  <small>' + escapeHtml(detail) + '</small>' : '',
    '</div>'
  ].join('');
}

function buildAdminSettingsMapStatusHtml(items) {
  const list = Array.isArray(items) ? items : [];
  const actionCount = list.reduce((sum, item) => sum + (Array.isArray(item && item.actions) ? item.actions.length : 0), 0);
  const checkCount = list.filter((item) => item && String(item.check || '').trim()).length;
  const publicCount = list.filter(adminSettingsMapItemHasPublicImpact).length;
  const adminOnlyCount = list.length - publicCount;
  const ownerAccess = typeof rakAdminCanManageAdmins === 'function' && rakAdminCanManageAdmins();
  return [
    '<div class="adminSettingsMapStatus">',
    '  <div class="appMenuSubTitle">Stav mapy nastaveni</div>',
    '  <div class="adminSettingsMapStatusGrid">',
    adminSettingsMapStatusItemHtml('Oblasti', String(list.length), 'Mapa pokryva hlavni provozni a spravcovske casti.', list.length >= 7 ? 'ok' : 'warn'),
    adminSettingsMapStatusItemHtml('Kontroly', String(checkCount) + '/' + String(list.length), 'Kazda oblast ma rikat, co overit po ulozeni.', checkCount === list.length && list.length ? 'ok' : 'warn'),
    adminSettingsMapStatusItemHtml('Rychle akce', String(actionCount), 'Tlacitka jen oteviraji admin sekce, sama nic neukladaji.', actionCount ? 'ok' : 'warn'),
    adminSettingsMapStatusItemHtml('Dopad pro lidi', String(publicCount), adminOnlyCount ? String(adminOnlyCount) + ' oblasti jsou jen pro spravce.' : 'Vsechny oblasti mohou mit verejny dopad.', publicCount ? 'info' : 'warn'),
    adminSettingsMapStatusItemHtml('Spravci', ownerAccess ? 'owner' : 'nizsi admin', ownerAccess ? 'Tento ucet muze menit dalsi spravce.' : 'Nizsi admin smi menit pracovni casti aplikace, ale ne spravce ani hesla.', ownerAccess ? 'ok' : 'info'),
    '  </div>',
    '</div>'
  ].join('');
}

function getAdminSettingsMapItems() {
  const ownerAccess = typeof rakAdminCanManageAdmins === 'function' && rakAdminCanManageAdmins();
  const serviceActions = [
    { action: 'open-reports', label: 'Reporty' },
    { action: 'open-service', label: 'Servis' }
  ];
  if (ownerAccess) {
    serviceActions.unshift({ action: 'open-admin-accounts', label: 'Správci' });
    serviceActions.push({ action: 'open-settings-backups', label: 'Zálohy nastavení' });
  }
  const items = [
    {
      title: 'Stroje a kalkulačky',
      scope: 'Nastavení strojů',
      detail: 'Frezky, pračka, brusy a FHB středy používané ve výpočtech a návazných kontrolách.',
      visible: 'Viditelné v kalkulačkách, statistikách a kontrolách rozpisu.',
      check: 'Kalkulacky, nastaveni stroju a zelena synchronizace po ulozeni.',
      actions: [
        { action: 'open-machines', label: 'Stroje' }
      ]
    },
    {
      title: 'Rozpis a absence',
      scope: 'Administrace / Rozpisy',
      detail: 'Pracovní dny, absence, ruční úpravy směn a uložení hotového měsíce.',
      visible: 'Viditelné v Rotace / Rozpisy a v exportech.',
      check: 'Rotace / Rozpisy, export Excelu a zelena synchronizace na home.',
      actions: [
        { action: 'open-rotation', label: 'Rozpisy' },
        { action: 'open-backups', label: 'Zálohy' }
      ]
    },
    {
      title: 'Pracovníci',
      scope: 'Pracovníci',
      detail: 'Seznam aktivních lidí, kteří se počítají v rozpisu, generátoru a statistikách.',
      visible: 'Ovlivňuje rozpis, generátor návrhu i statistiky.',
      check: 'Seznam pracovniku odpovida jmenum pouzitym v rozpisu.',
      actions: [
        { action: 'open-workers', label: 'Pracovníci' }
      ]
    },
    {
      title: 'Generátor rozpisu',
      scope: 'Pravidla generátoru',
      detail: 'Pořadí lidí, základní cykly a pravidla, podle kterých vzniká nový návrh.',
      visible: 'Projeví se až při dalším vygenerování návrhu.',
      check: 'Vygenerovany navrh, pravidla generatoru a manualni kontrola pred ulozenim.',
      actions: [
        { action: 'open-generator-settings', label: 'Pravidla' },
        { action: 'open-rotation', label: 'Vygenerovat' }
      ]
    },
    {
      title: 'Dovolená, odstávky a volno',
      scope: 'Dovolená / Mimořádné volné dny',
      detail: 'Delší období od-do, jednorázové dny bez práce a nejbližší odpočet na home.',
      visible: 'Viditelné na home kartě Dovolená a v počítání směn.',
      check: 'Home karta Dovolena, odpocet smen a nejblizsi volne obdobi.',
      actions: [
        { action: 'open-vacation', label: 'Dovolená' },
        { action: 'open-special-days', label: 'Volné dny' }
      ]
    },
    {
      title: 'Přesčasy',
      scope: 'Přesčasy',
      detail: 'Přesčasové neděle podle roků, směn a tvrdoty.',
      visible: 'Používá rozpis, statistiky a provozní přehledy.',
      check: 'Kantyna, jidelna a seznam prescasu v prislusnem roce.',
      actions: [
        { action: 'open-overtime', label: 'Přesčasy' }
      ]
    },
    {
      title: 'Kantýna a jídelna',
      scope: 'Kantýna / jídelna',
      detail: 'Běžná otevírací doba, přesčasové časy a budoucí přesčasové neděle.',
      visible: 'Viditelné na home kartách Kantýna a Jídelna.',
      check: 'Home karty Kantyna/Jidelna a budoucí prescasove casy.',
      actions: [
        { action: 'open-food', label: 'Časy' }
      ]
    },
    {
      title: 'Oznámení, odkazy, kontakt a výplata',
      scope: 'Aplikace pro lidi',
      detail: 'Oznámení na home, jídelní lístek, Eportal, kalendář, kontakt aplikace a pravidlo výplaty.',
      visible: 'Viditelné na home, v běžném menu a na home kartách.',
      check: 'Home oznámení, běžné menu, home karty Vyplata/Jidelni listek/Eportal a Kontakt.',
      actions: [
        { action: 'open-announcement', label: 'Oznámení' },
        { action: 'open-external-links', label: 'Odkazy' },
        { action: 'open-app-contact', label: 'Kontakt' },
        { action: 'open-payroll-settings', label: 'Výplata' }
      ]
    },
    {
      title: ownerAccess ? 'Správci a kontrola provozu' : 'Kontrola a servis',
      scope: 'Kontrola a servis',
      detail: ownerAccess
        ? 'Admin účty, připojená zařízení, reporty chyb, synchronizace a exporty.'
        : 'Připojená zařízení, reporty chyb, synchronizace a exporty bez správy hesel.',
      visible: 'Dostupné jen administrátorům.',
      check: ownerAccess ? 'Spravci, servis synchronizace a predavaci podklady bez hesel.' : 'Servis synchronizace, pripojeni, reporty a predavaci podklady.',
      actions: serviceActions
    }
  ];
  if (ownerAccess) {
    items.push({
      title: 'Admin zařízení',
      scope: 'Správci / přihlášená zařízení',
      detail: 'Přehled zařízení, kde je admin účet trvale přihlášený, a možnost zařízení odhlásit.',
      visible: 'Jen hlavní admin; běžní lidé ani nižší admini to nevidí.',
      check: 'Spravci, prihlasena zarizeni a odhlaseni nepotrebnych zarizeni.',
      actions: [
        { action: 'open-admin-accounts', label: 'Správci' }
      ]
    });
  }
  return items;
}

function buildAdminSettingsMapHtml() {
  const items = getAdminSettingsMapItems();
  return [
    buildAdminSettingsMapStatusHtml(items),
    buildAdminSettingsMapImpactHtml(items),
    '<div class="adminSettingsMapGrid">',
    items.map(adminSettingsMapItemHtml).join(''),
    '</div>'
  ].join('');
}

function buildAdminSettingsMapText() {
  const items = getAdminSettingsMapItems();
  const ownerAccess = typeof rakAdminCanManageAdmins === 'function' && rakAdminCanManageAdmins();
  const lines = buildRakAdminExportMetadataLines('RaK - Kde co upravit');
  lines.push(
    '',
    'Pravidlo',
    '- Tenhle soubor je jen mapa administrace. Nic sám nemění ani neukládá.',
    '- Změny dělej jen v administraci a ukládej v konkrétní sekci.',
    '- Běžný uživatel nemá mít možnost měnit rozpis, provoz ani nastavení.',
    '- Správci: ' + (ownerAccess ? 'hlavní admin může měnit další správce.' : 'nižší admin nemůže měnit seznam správců ani jejich hesla; může změnit pouze vlastní heslo.'),
    '',
    'Oblasti'
  );
  items.forEach((item, index) => {
    const actions = Array.isArray(item && item.actions) ? item.actions : [];
    lines.push(String(index + 1) + '. ' + String(item && item.title || 'Oblast'));
    lines.push('- Sekce: ' + String(item && item.scope || 'administrace'));
    lines.push('- K čemu slouží: ' + String(item && item.detail || ''));
    lines.push('- Kde se projeví: ' + String(item && item.visible || ''));
    lines.push('- Po ulozeni over: ' + String(item && item.check || 'stav synchronizace a prislusnou admin sekci'));
    lines.push('- Dopad: ' + (adminSettingsMapItemHasPublicImpact(item) ? 'viditelné pro běžné lidi' : 'jen administrace'));
    lines.push('- Otevřít v aplikaci: ' + (actions.length ? actions.map((action) => String(action && action.label || 'Otevřít')).join(', ') : 'bez rychlé akce'));
    lines.push('');
  });
  lines.push('Kontrola po úpravě');
  lines.push('- Po uložení zkontroluj stav synchronizace na hlavní stránce.');
  lines.push('- U rozpisů před větší změnou ověř zálohy a po dokončení podle potřeby stáhni Excel nebo ZIP.');
  lines.push('');
  return lines.join('\n');
}

function downloadAdminSettingsMapText() {
  const text = buildAdminSettingsMapText();
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateKey = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = 'RaK_kde_co_upravit_' + dateKey + '.txt';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    try { URL.revokeObjectURL(url); } catch (err) {}
    try { a.remove(); } catch (err) {}
  }, 0);
  const status = document.getElementById('adminOnlineSaveStatus');
  if (status) status.textContent = 'Mapa nastavení stažena jako textový soubor.';
}

function buildAdminManualText(monthKey) {
  const monthLabel = String(monthKey || '').trim() || 'vybraný měsíc';
  const ownerLine = (typeof rakAdminCanManageAdmins === 'function' && rakAdminCanManageAdmins())
    ? 'Jsi hlavní admin: můžeš přidat další správce a nastavit jim heslo.'
    : 'Dalšího admina může přidat jen hlavní admin účet. Nižší admin může spravovat pracovní části aplikace.';
  return buildRakAdminExportMetadataLines('RaK - Příručka správce', {
    monthKey,
    extraLines: ['Měsíc: ' + monthLabel]
  }).concat([
    '',
    'Důležité pravidlo',
    '- Tahle příručka nic sama nemění. Každou změnu je potřeba udělat v administraci a uložit v konkrétní sekci.',
    '- Běžní uživatelé administraci neuvidí a nemají mít možnost měnit rozpis, provoz ani nastavení.',
    '',
    '1. Nový měsíc rozpisu',
    '- Otevři Servis a načti online stav.',
    '- Otevři Rozpis ' + monthLabel + ', zkontroluj pracovní dny a absence.',
    '- Zkontroluj Pravidla generátoru.',
    '- Vygeneruj návrh, projdi ho ručně a až potom ulož rozpis.',
    '- Před větší změnou se podívej do Záloh.',
    '',
    '2. Dovolené, odstávky a volné dny',
    '- Delší období od-do patří do Dovolená / odstávky.',
    '- Jednorázový den bez práce patří do Mimořádné volné dny.',
    '- Absence konkrétních lidí se zadávají v Rozpisech.',
    '',
    '3. Přesčasy a kantýna / jídelna',
    '- Přesčasové neděle pro rozpis se spravují v Přesčasy.',
    '- Otevírací časy kantýny a jídelny se spravují v Kantýna / jídelna.',
    '',
    '4. Odkazy a texty pro lidi',
    '- Oznámení, odkazy, kontakt a výplata se mění jen v administraci.',
    '- Po uložení se změna může projevit v běžné aplikaci.',
    '',
    '5. Zálohy a obnova',
    '- Obnova zálohy přepíše aktuální rozpis.',
    '- Před obnovou se aktuální stav uloží jako nová záloha.',
    '',
    '6. Předání dalšímu správci',
    '- ' + ownerLine,
    '- Nový správce má po přihlášení projít Předání správy a Kontrolu předání.',
    '',
    'Kontrola po úpravách',
    '- Po uložení zkontroluj stav synchronizace na hlavní stránce.',
    '- V administraci můžeš otevřít Reporty chyb a Servis / synchronizace.',
    ''
  ]).join('\n');
}

function downloadAdminManualText() {
  const monthKey = getAdminSelectedMonthKey();
  const text = buildAdminManualText(monthKey);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateKey = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = 'RaK_prirucka_spravce_' + dateKey + '.txt';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    try { URL.revokeObjectURL(url); } catch (err) {}
    try { a.remove(); } catch (err) {}
  }, 0);
  const status = document.getElementById('adminOnlineSaveStatus');
  if (status) status.textContent = 'Příručka správce stažena jako textový soubor.';
}

function renderAdminMenuBody(body, section) {
  const mode = String(section || 'home').trim() || 'home';
  const months = getAdminRotationMonthKeys();
  const monthKey = getAdminSelectedMonthKey();
  body.dataset.adminView = mode;
  try { adminSetRotationViewportLock(mode === 'rotation'); } catch (err) {}
  const page = document.getElementById('menu');
  if (page) page.dataset.adminView = mode;

  const adminServiceActions = [
    { action: 'open-service', label: 'Servis / synchronizace' }
  ];
  const adminServiceDetail = (typeof rakAdminCanManageAdmins === 'function' && rakAdminCanManageAdmins())
    ? 'Připojení, reporty, synchronizace a správa adminů.'
    : 'Připojení, reporty a synchronizace. Hesla a další adminy spravuje jen hlavní admin.';
  if (typeof rakAdminCanManageAdmins === 'function' && rakAdminCanManageAdmins()) {
    adminServiceActions.unshift({ action: 'open-admin-accounts', label: 'Správci' });
    adminServiceActions.push({ action: 'open-settings-backups', label: 'Zálohy nastavení' });
  }

  const homeHtml = [
    '<div class="appMenuCard appMenuAdminCard">',
    '  <div class="appMenuCardTitle">Administrace</div>',
    '  <div class="appMenuText">',
    '    <div>Nejdřív nastav provoz, potom vygeneruj a ulož rozpis. Všechno se ukládá online přes Supabase.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Vyber sekci, kterou chceš upravit.</div>',
    '  </div>',
    '  <div class="adminMenuSections">',
    buildAdminMenuSectionHtml('1. Provoz', 'Stroje, provozní doby a absence – vstupy pro tvorbu rozpisu.', [
      { action: 'open-machines', label: 'Nastavení strojů' },
      { action: 'open-correction-settings', label: 'Nastavení korekcí' },
      { action: 'open-food', label: 'Kantýna / jídelna' },
      { action: 'open-overtime', label: 'Přesčasy' },
      { action: 'open-vacation', label: 'Dovolená / odstávky' },
      { action: 'open-special-days', label: 'Mimořádné volné dny' }
    ]),
    buildAdminMenuSectionHtml('2. Rozpisy', 'Tvorba, kontrola, historie, zálohy a export rozpisu.', [
      { action: 'open-rotation', label: 'Rozpisy' },
      { action: 'open-workers', label: 'Pracovníci' },
      { action: 'open-generator-settings', label: 'Pravidla generátoru' },
      { action: 'open-machine-tasks', label: 'Úkoly podle stroje' },
      { action: 'open-change-log', label: 'Historie změn' },
      { action: 'open-backups', label: 'Zálohy rozpisů' },
      { action: 'open-export', label: 'Export / import' }
    ]),
    buildAdminMenuSectionHtml('3. Pro zaměstnance', 'Texty, odkazy a informace viditelné v běžné aplikaci.', [
      { action: 'open-announcement', label: 'Oznámení Dashboard' },
      { action: 'open-external-links', label: 'Odkazy' }
    ].concat((typeof rakAdminCanManageAdmins === 'function' && rakAdminCanManageAdmins()) ? [{ action: 'open-app-contact', label: 'Kontakt aplikace' }] : []).concat([
      { action: 'open-payroll-settings', label: 'Výplata' }
    ])),
    buildAdminMenuSectionHtml('4. Kontrola a servis', adminServiceDetail, [
      { action: 'open-reports', label: 'Reporty chyb' }
    ].concat(adminServiceActions)),
    '  </div>',
    '  <button type="button" class="appMenuAction appMenuBack" data-menu-back="1">Zpět</button>',
    '</div>'
  ].join('');

  const calendarNotePrefs = typeof getRakCalendarNotesSettings === 'function' ? getRakCalendarNotesSettings() : {};
  const calendarNoteButtons = (typeof RAK_CALENDAR_NOTE_DEFS !== 'undefined' ? RAK_CALENDAR_NOTE_DEFS : [])
    .map(def => '<button type="button" class="appMenuAction appMenuSettingBtn" data-admin-action="toggle-calendar-note" data-calendar-note-id="' + escapeHtml(def.id) + '">' + (calendarNotePrefs[def.id] ? '✓ ' : '') + escapeHtml(def.label) + '</button>')
    .join('');
  const machinesHtml = [
    '<div class="appMenuCard appMenuAdminCard adminMachinesCard">',
    '  <div class="appMenuCardTitle">Nastavení strojů</div>',
    '  <div class="appMenuText">',
    '    <div>Každý stroj je jeden řádek. U brusů se zapisuje stroj + index + parametry.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Stav uložení se zobrazí po kliknutí na Uložit stroje.</div>',
    '  </div>',
    buildAdminMachineSettingsTableHtml(),
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="load-machines">Načíst online</button>',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="save-machines">Uložit stroje</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>',
    '<div class="appMenuCard appMenuAdminCard adminCalendarNotesCard">',
    '  <div class="appMenuCardTitle">Upozornění v kalendáři</div>',
    '  <div class="appMenuText">',
    '    <div>Platí pro všechny - zapíná/vypíná se pro celou appku, ne jen pro tohle zařízení.</div>',
    '  </div>',
    '  <div class="appMenuSettingsList appMenuSettingsGrid">',
    calendarNoteButtons,
    '  </div>',
    '</div>'
  ].join('');

  const foodHtml = [
    '<div class="appMenuCard appMenuAdminCard adminFoodScheduleCard">',
    '  <div class="appMenuCardTitle">Kantýna / jídelna</div>',
    '  <div class="appMenuText">',
    '    <div>Tady si nastavíš běžnou otevírací dobu a přesčasovou dobu kantýny/jídelny. Které neděle jsou přesčasové se nastavuje v Provoz / Přesčasy.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Stav uložení se zobrazí po kliknutí na Uložit časy.</div>',
    '  </div>',
    buildAdminFoodScheduleSettingsHtml(),
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="load-food-schedule">Načíst online</button>',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="save-food-schedule">Uložit časy</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');

  const vacationHtml = [
    '<div class="appMenuCard appMenuAdminCard adminVacationCountdownCard">',
    '  <div class="appMenuCardTitle">Dovolená / odstávky</div>',
    '  <div class="appMenuText">',
    '    <div>Tady nastavíš období od-do včetně hodin. Home karta Dovolená bere nejbližší nadcházející řádek a během zadaného období se směna bere jako volno.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Prázdné řádky se neukládají. Pro odstranění řádek vymaž a ulož.</div>',
    '  </div>',
    buildAdminVacationCountdownSettingsHtml(),
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="load-vacation-countdown">Načíst online</button>',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="save-vacation-countdown">Uložit dovolenou</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');

  const specialDaysHtml = [
    '<div class="appMenuCard appMenuAdminCard adminSpecialDaysCard">',
    '  <div class="appMenuCardTitle">Mimořádné volné dny</div>',
    '  <div class="appMenuText">',
    '    <div>Tady doplníš jednorázové svátky, odstávky nebo jiné dny bez práce. Vestavěné české svátky zůstávají automatické.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Prázdné řádky se neukládají. Pro odstranění řádek vymaž a ulož.</div>',
    '  </div>',
    buildAdminSpecialDaysSettingsHtml(),
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="load-special-days">Načíst online</button>',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="save-special-days">Uložit volné dny</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');

  const rotationHtml = [
    '<div class="appMenuCard appMenuAdminCard">',
    '  <div class="appMenuCardTitle">Rozpisy</div>',
    '  <div class="appMenuText">',
    '    <div>Vyber měsíc, nejdřív doplň absence / svátek / odstávku a až potom vygeneruj návrh. Změny jdou online až po kliknutí na Uložit rozpis.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Před generováním zkontroluj absence a dny měsíce. Stav uložení se zobrazí po kliknutí na Uložit rozpis.</div>',
    '  </div>',
    renderAdminMonthPickerHtml(monthKey),
    '  <select id="adminMonthSelect" class="appMenuSelect appMenuHiddenSelect">' + months.map(m => '<option value="' + escapeHtml(m) + '"' + (m === monthKey ? ' selected' : '') + '>' + escapeHtml(m) + '</option>').join('') + '</select>',
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="load-month">Načíst měsíc</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="generate-rotation">Vygenerovat návrh</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="load-online">Načíst online</button>',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="save-rotation">Uložit rozpis</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    (typeof buildAdminStatsAnomalyHtml === 'function' ? buildAdminStatsAnomalyHtml((typeof parseMonthKey === 'function' && parseMonthKey(monthKey) ? parseMonthKey(monthKey).year : new Date().getFullYear())) : ''),
    buildAdminRotationTableHtml(monthKey),
    '</div>'
  ].join('');

  const overtimeHtml = [
    '<div class="appMenuCard appMenuAdminCard adminRotationOvertimeCard">',
    '  <div class="appMenuCardTitle">Přesčasy</div>',
    '  <div class="appMenuText">',
    '    <div>Tady si spravuješ přesčasové neděle pro rozpisy a statistiky. Přepínač TO říká, jestli jde přesčas na tvrdotu.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Změny se uloží přes stávající nastavení strojů, bez změny databáze.</div>',
    '  </div>',
    buildAdminRotationOvertimeSettingsHtml(),
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="load-overtime-settings">Načíst online</button>',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="save-overtime-settings">Uložit přesčasy</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');

  const generatorSettingsHtml = [
    '<div class="appMenuCard appMenuAdminCard adminGeneratorSettingsCard">',
    '  <div class="appMenuCardTitle">Pravidla generátoru</div>',
    '  <div class="appMenuText">',
    '    <div>Tady nastavuješ pořadí lidí a strojů, podle kterých se skládá nový návrh rozpisu. Bez uložené změny zůstávají původní pravidla.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Upravuj opatrně: změny se projeví až při dalším vygenerování návrhu.</div>',
    '  </div>',
    buildAdminRotationGeneratorSettingsHtml(),
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="load-generator-settings">Načíst online</button>',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="save-generator-settings">Uložit pravidla</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');

  const machineTasksHtml = [
    '<div class="appMenuCard appMenuAdminCard adminMachineTasksCard">',
    '  <div class="appMenuCardTitle">Úkoly podle stroje</div>',
    '  <div class="appMenuText">',
    '    <div>Tady nastavíš, co se zobrazí pracovníkovi po trojkliku na jeho stroj v příští směně v Rotacích.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Běžné úkoly platí vždy; ranní a noční se k nim pouze přidají.</div>',
    '  </div>',
    (typeof buildAdminMachineTasksSettingsHtml === 'function' ? buildAdminMachineTasksSettingsHtml() : '<div class="smallText">Nastavení úkolů se načítá…</div>'),
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="load-machine-tasks">Načíst online</button>',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="save-machine-tasks">Uložit úkoly</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');

  const correctionSettingsHtml = [
    '<div class="appMenuCard appMenuAdminCard adminFhbCalibrationCard">',
    '  <div class="appMenuCardTitle">Nastavení korekcí</div>',
    '  <div class="appMenuText">',
    '    <div>MFK / FHB: z měření před a po korekci ověříš, jestli kalkulačka odpovídá skutečné reakci stroje.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Výpočet se změní až po ručním potvrzení doporučení.</div>',
    '  </div>',
    (typeof buildAdminFhbCorrectionCalibrationHtml === 'function' ? buildAdminFhbCorrectionCalibrationHtml() : '<div class="smallText">Nastavení korekcí se načítá…</div>'),
    '  <button type="button" class="appMenuAction appMenuBack" data-admin-action="back-admin">Zpět</button>',
    '</div>'
  ].join('');

  const workersHtml = [
    '<div class="appMenuCard appMenuAdminCard adminWorkerRosterCard">',
    '  <div class="appMenuCardTitle">Pracovníci</div>',
    '  <div class="appMenuText">',
    '    <div>Tady nastavíš pracovníky pro rozpis a statistiky i samostatné účty pouze pro aplikaci.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Prázdné řádky se neukládají. Pro odebrání jméno smaž a ulož.</div>',
    '  </div>',
    typeof buildAdminWorkerRosterSettingsHtml === 'function' ? buildAdminWorkerRosterSettingsHtml() : '',
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="load-workers">Načíst online</button>',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="save-workers">Uložit pracovníky</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');

  const changeLogHtml = [
    '<div class="appMenuCard appMenuAdminCard adminChangeLogCard">',
    '  <div class="appMenuCardTitle">Historie změn</div>',
    '  <div class="appMenuText">',
    '    <div>Kdo a kdy uložil dovolenou, přesčasy nebo rozpis.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Zaznamenává se automaticky při ukládání, nic tady sám neupravuješ.</div>',
    '  </div>',
    typeof buildAdminChangeLogHtml === 'function' ? buildAdminChangeLogHtml() : '',
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="load-change-log">Načíst online</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');

  const adminAccountsCanManage = typeof rakAdminCanManageAdmins === 'function' && rakAdminCanManageAdmins();
  const adminAccountsHtml = [
    '<div class="appMenuCard appMenuAdminCard adminAccountsCard">',
    '  <div class="appMenuCardTitle">Správci</div>',
    '  <div class="appMenuText">',
    '    <div>' + (adminAccountsCanManage ? 'Tady hlavní admin nastaví další admin účty.' : 'Tady můžeš zkontrolovat správce a změnit pouze svoje heslo.') + ' Běžní uživatelé tuhle sekci neuvidí.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">' + (adminAccountsCanManage ? 'Heslo nech prázdné, pokud ho nechceš měnit. Pro odebrání správce klikni na × u řádku a ulož.' : 'Hesla jsou v přehledu vždy skrytá. Hlavní admin a ostatní účty nejdou z tohoto účtu měnit.') + '</div>',
    '  </div>',
    buildAdminAccountsSettingsHtml(),
    (typeof buildAdminOwnerPasswordHtml === 'function' ? buildAdminOwnerPasswordHtml() : ''),
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="load-admin-accounts">Načíst online</button>',
    (adminAccountsCanManage ? '    <button type="button" class="appMenuAction isActive" data-admin-action="save-admin-accounts">Uložit správce</button>' : ''),
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');

  const externalLinksHtml = [
    '<div class="appMenuCard appMenuAdminCard adminExternalLinksCard">',
    '  <div class="appMenuCardTitle">Odkazy</div>',
    '  <div class="appMenuText">',
    '    <div>Tady nastavíš odkazy na jídelní lístek, Eportal, výplatní portál a vložený Google kalendář. Řádek Kalendář určuje adresu, která se otevře po klepnutí na kalendář v aplikaci.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Bez uložené změny zůstávají původní odkazy.</div>',
    '  </div>',
    buildAdminExternalLinksSettingsHtml(),
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="load-external-links">Načíst online</button>',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="save-external-links">Uložit odkazy</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');

  const appContactHtml = [
    '<div class="appMenuCard appMenuAdminCard adminAppContactCard">',
    '  <div class="appMenuCardTitle">Kontakt aplikace</div>',
    '  <div class="appMenuText">',
    '    <div>Tady nastavíš jméno, telefon a e-mail, které se zobrazují v menu Kontakt.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Bez uložené změny zůstanou původní údaje.</div>',
    '  </div>',
    buildAdminAppContactSettingsHtml(),
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="load-app-contact">Načíst online</button>',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="save-app-contact">Uložit kontakt</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');

  const payrollSettingsHtml = [
    '<div class="appMenuCard appMenuAdminCard adminPayrollSettingsCard">',
    '  <div class="appMenuCardTitle">Výplata</div>',
    '  <div class="appMenuText">',
    '    <div>Tady nastavíš, podle kterého pracovního dne v měsíci se počítá karta Výplata, a případné ruční výjimky.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Bez uložené změny zůstává pravidlo 4. pracovní den v měsíci.</div>',
    '  </div>',
    buildAdminPayrollSettingsHtml(),
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="load-payroll-settings">Načíst online</button>',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="save-payroll-settings">Uložit výplatu</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');

  const backupsHtml = [
    '<div class="appMenuCard appMenuAdminCard adminRotationBackupsCard">',
    '  <div class="appMenuCardTitle">Zálohy rozpisů</div>',
    '  <div class="appMenuText">',
    '    <div>Tady jsou poslední online zálohy, které vznikly před přepsáním rozpisu. Obnova přepíše aktuální rozpis a současný stav si předtím ještě uloží jako novou zálohu.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Načti zálohy a vyber, kterou chceš obnovit.</div>',
    '  </div>',
    buildAdminRotationBackupStatusHtml(),
    buildAdminRotationBackupsHtml(),
    '  <div class="appMenuSubTitle uMt12">Automatické zálohy</div>',
    buildRotationSaveBackupsHtml(),
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="load-rotation-backups">Načíst zálohy</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="open-rotation">Zpět na rozpisy</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');

  const fullSettingsBackupsHtml = [
    '<div class="appMenuCard appMenuAdminCard adminFullSettingsBackupsCard">',
    '  <div class="appMenuCardTitle">Zálohy nastavení</div>',
    '  <div class="appMenuText">',
    '    <div>Tady si hlavní admin vytvoří bod návratu pro všechna online nastavení aplikace. "Vytvořit a stáhnout" uloží zálohu online do Supabase a zároveň ji stáhne jako JSON soubor, "Vytvořit zálohu (jen online)" ji uloží jen do Supabase bez stažení.</div>',
    '    <div class="smallText">Obnovit lze dvěma způsoby: online ze Supabase (vyber řádek v seznamu níže a klikni Obnovit), nebo nahráním souboru z telefonu (tlačítko Obnovit ze souboru).</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Vytvořit, nahrát nebo obnovit může jen hlavní admin účet.</div>',
    '  </div>',
    buildAdminFullSettingsBackupStatusHtml(),
    buildAdminFullSettingsBackupsHtml(),
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="load-full-settings-backups">Načíst online</button>',
    (typeof rakAdminCanManageAdmins === 'function' && rakAdminCanManageAdmins() ? '    <button type="button" class="appMenuAction" data-admin-action="restore-full-settings-backup-from-file">Obnovit ze souboru (telefon)</button>' : ''),
    (typeof rakAdminCanManageAdmins === 'function' && rakAdminCanManageAdmins() ? '    <button type="button" class="appMenuAction isActive" data-admin-action="create-full-settings-backup">Vytvořit a stáhnout</button>' : ''),
    (typeof rakAdminCanManageAdmins === 'function' && rakAdminCanManageAdmins() ? '    <button type="button" class="appMenuAction" data-admin-action="create-full-settings-backup-online">Vytvořit zálohu (jen online)</button>' : ''),
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');

  const handoverHtml = [
    '<div class="appMenuCard appMenuAdminCard adminHandoverCard">',
    '  <div class="appMenuCardTitle">Předání správy</div>',
    '  <div class="appMenuText">',
    '    <div>Krátký postup pro člověka, který bude aplikaci spravovat: provoz, rozpis, veřejná část a závěrečná kontrola.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Všechny kroky vedou jen do administrace. Běžná aplikace se odsud nemění bez uložení v konkrétní sekci.</div>',
    '  </div>',
    buildAdminPermissionStatusHtml(),
    buildAdminAccessRulesHtml(),
    buildAdminHandoverTodoHtml(monthKey),
    buildAdminHandoverReadinessHtml(monthKey),
    buildAdminPostSaveCheckHtml(),
    buildAdminHandoverAuditHtml(monthKey),
    buildAdminMonthlyWorkflowHtml(monthKey),
    buildAdminHandoverChecklistHtml(monthKey),
    buildAdminHandoverRunbookHtml(monthKey),
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="download-handover-package">Stáhnout balíček</button>',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="download-handover-todo">Stáhnout úkoly</button>',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="download-handover-status">Stáhnout stav</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="download-monthly-workflow">Stáhnout postup</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="load-machines">Načíst online</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');

  const monthlyWorkflowHtml = [
    '<div class="appMenuCard appMenuAdminCard adminMonthlyWorkflowCard">',
    '  <div class="appMenuCardTitle">Měsíční postup</div>',
    '  <div class="appMenuText">',
    '    <div>Stručný postup pro člověka, který každý měsíc jen načte data, doplní provoz a absence, vygeneruje rozpis, uloží ho a ověří synchronizaci.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Tahle obrazovka sama nic nemění. Každé tlačítko jen otevře odpovídající admin sekci.</div>',
    '  </div>',
    buildAdminMonthlyWorkflowHtml(monthKey),
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="download-monthly-workflow">Stáhnout postup</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="open-rotation">Rozpisy</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="open-handover">Předání správy</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');

  const manualHtml = [
    '<div class="appMenuCard appMenuAdminCard adminManualCard">',
    '  <div class="appMenuCardTitle">Příručka správce</div>',
    '  <div class="appMenuText">',
    '    <div>Rychlý návod pro člověka, který bude v aplikaci jen doplňovat dovolené, přesčasy, rozpisy a provozní údaje.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Tahle stránka sama nic nemění. Každé tlačítko jen otevře odpovídající admin sekci.</div>',
    '  </div>',
    buildAdminManualHtml(monthKey),
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="download-admin-manual">Stáhnout příručku</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="open-handover">Předání správy</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');

  const settingsMapHtml = [
    '<div class="appMenuCard appMenuAdminCard adminSettingsMapCard">',
    '  <div class="appMenuCardTitle">Kde co upravit</div>',
    '  <div class="appMenuText">',
    '    <div>Mapa správy pro člověka, který bude aplikaci udržovat. Ukazuje, kde se která věc mění a kde se projeví.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Tahle obrazovka sama nic neukládá. Jen otevírá existující admin sekce.</div>',
    '  </div>',
    buildAdminSettingsMapHtml(),
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="download-settings-map">Stáhnout mapu</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="open-admin-manual">Příručka správce</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');

  const announcementHtml = buildAdminAnnouncementHtml();
  const importPreview = (typeof getRakExcelImportPreview === 'function') ? getRakExcelImportPreview() : null;
  const rotationExcelMonthOptions = buildRakRotationExcelExportMonthOptions(monthKey);
  const exportHtml = [
    '<div class="appMenuCard appMenuAdminCard">',
    '  <div class="appMenuCardTitle">Export / import</div>',
    '  <div class="appMenuText">',
    '    <div>Import funguje ve dvou krocích: vybereš Excel, appka načte jen měsíční listy typu 01.2025 a potom si vybereš celý rok nebo konkrétní měsíc. Pomocné listy se ignorují.</div>',
    '    <div class="smallText" id="rakExcelImportStatus">XLSX rozpis stáhne jen vybraný měsíc v kopírovacím layoutu. Export celé appky je přesunutý do Kontrola a servis.</div>',
    '  </div>',
    '  <div class="appMenuSettingsList">',
    '    <div class="appMenuSubTitle">XLSX rozpis pro kopírování</div>',
    '    <div class="smallText">Stejný export jako v generátoru: Tvrdota v A:F, Měkota pod ní v A:F a Absence od H dál po pracovních dnech.</div>',
    '    <label class="appMenuFieldLabel" for="rakRotationExcelExportMonth">Měsíc rozpisu</label>',
    '    <select id="rakRotationExcelExportMonth" class="appMenuSelect">' + rotationExcelMonthOptions + '</select>',
    '    <button type="button" class="appMenuAction" data-admin-action="admin-download-rotation-excel">Stáhnout Excel rozpisu</button>',
    '    <div class="appMenuSubTitle">Import rozpisů z Excelu</div>',
    '    <div class="smallText" id="rakExcelImportFileStatus">' + escapeHtml(importPreview ? ('Načteno: ' + importPreview.fileName + ' · měsíčních listů: ' + importPreview.monthKeys.length) : 'Zatím není vybraný žádný Excel.') + '</div>',
    '    <button type="button" class="appMenuAction" data-admin-action="excel-pick">Vybrat Excel</button>',
    '    <label class="appMenuFieldLabel" for="rakExcelImportScope">Co importovat</label>',
    '    <select id="rakExcelImportScope" class="appMenuSelect">',
    '      <option value="all" selected>Celý načtený Excel / rok</option>',
    '      <option value="month">Jen vybraný měsíc</option>',
    '    </select>',
    '    <label class="appMenuFieldLabel" for="rakExcelImportDetectedMonth">Načtené měsíce z Excelu</label>',
    '    <select id="rakExcelImportDetectedMonth" class="appMenuSelect" disabled>',
    '      <option value="">Nejdřív vyber Excel</option>',
    '    </select>',
    '  </div>',
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction isActive" id="rakExcelImportCommitBtn" data-admin-action="excel-import" disabled>Načíst do rozpisů</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');


  const reportsHtml = [
    '<div class="appMenuCard appMenuAdminCard adminReportsCard">',
    '  <div class="appMenuCardTitle">Reporty chyb</div>',
    '  <div class="appMenuText">',
    '    <div>Tady uvidíš, co uživatelé poslali přes Pošli mi chybu. Reporty chodí do Supabase tabulky bug_reports.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Načti reporty a podle potřeby je označ jako viděné nebo hotové.</div>',
    '  </div>',
    buildAdminReportsHtml(),
    '  <button type="button" class="appMenuAction appMenuBack" data-admin-action="back-admin">Zpět</button>',
    '</div>'
  ].join('');

  const serviceHtml = buildAdminServiceHtml();

  if (mode === 'machines') {
    body.innerHTML = machinesHtml;
  } else if (mode === 'food') {
    body.innerHTML = foodHtml;
  } else if (mode === 'vacation') {
    body.innerHTML = vacationHtml;
  } else if (mode === 'special-days') {
    body.innerHTML = specialDaysHtml;
  } else if (mode === 'rotation') {
    body.innerHTML = rotationHtml;
  } else if (mode === 'overtime') {
    body.innerHTML = overtimeHtml;
  } else if (mode === 'generator-settings') {
    body.innerHTML = generatorSettingsHtml;
  } else if (mode === 'machine-tasks') {
    body.innerHTML = machineTasksHtml;
  } else if (mode === 'correction-settings') {
    body.innerHTML = correctionSettingsHtml;
  } else if (mode === 'workers') {
    body.innerHTML = workersHtml;
  } else if (mode === 'change-log') {
    body.innerHTML = changeLogHtml;
  } else if (mode === 'admin-accounts') {
    body.innerHTML = adminAccountsHtml;
  } else if (mode === 'external-links') {
    body.innerHTML = externalLinksHtml;
  } else if (mode === 'app-contact') {
    body.innerHTML = appContactHtml;
  } else if (mode === 'payroll-settings') {
    body.innerHTML = payrollSettingsHtml;
  } else if (mode === 'backups') {
    body.innerHTML = backupsHtml;
  } else if (mode === 'settings-backups') {
    body.innerHTML = fullSettingsBackupsHtml;
  } else if (mode === 'handover') {
    body.innerHTML = handoverHtml;
  } else if (mode === 'monthly-workflow') {
    body.innerHTML = monthlyWorkflowHtml;
  } else if (mode === 'manual') {
    body.innerHTML = manualHtml;
  } else if (mode === 'settings-map') {
    body.innerHTML = settingsMapHtml;
  } else if (mode === 'announcement') {
    body.innerHTML = announcementHtml;
  } else if (mode === 'export') {
    body.innerHTML = exportHtml;
  } else if (mode === 'reports') {
    body.innerHTML = reportsHtml;
  } else if (mode === 'service') {
    body.innerHTML = serviceHtml;
  } else {
    body.innerHTML = homeHtml;
  }

  if (mode === 'rotation') {
    runAdminRotationEditorMaintenance(body, 'render-admin-rotation');
  }
  if (mode === 'overtime' && typeof adminRotationRefreshOvertimeShiftBadges === 'function') {
    try { adminRotationRefreshOvertimeShiftBadges(body, true); } catch (err) {}
  }
  if (mode === 'export' && typeof updateRakExcelImportPreviewUi === 'function') {
    setTimeout(() => {
      try { updateRakExcelImportPreviewUi(); } catch (err) { console.warn('Excel preview UI update failed', err); }
    }, 0);
  }
}



// RaK 1.2 (1.155) – Plovoucí odebrání a údržba editoru rozpisů jsou oddělené v admin-rotation.js.
