// RaK – admin importy a zálohy oddělené od admin rendereru.
try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('app-menu-admin-storage.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}

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
