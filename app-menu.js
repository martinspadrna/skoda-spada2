// RaK 1.2 (1.155) – Více/menu shell, O aplikaci, Nastavení, Report chyby a admin menu.
try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('app-menu.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}


function formatRakDisplayVersion(version) {
  const text = String(version || '').trim();
  if (!text) return '—';
  return /^RaK\s+/i.test(text) ? text : ('RaK ' + text);
}

const RAK_ADMIN_EXPORT_IMPORT_EXCEL_COPY_CONTRACT_V1139 = Object.freeze({
  version: '1.2 (1.155)',
  scope: 'administrace-export-import-rotation-excel-copy-layout',
  action: 'admin-download-rotation-excel',
  rule: 'Export / import používá stejný XLSX layout rozpisu jako generátor.'
});

const RAK_ADMIN_EXPORT_IMPORT_EXCEL_MONTH_GROUP_CONTRACT_V1140 = Object.freeze({
  version: '1.2 (1.155)',
  scope: 'administrace-export-import-rotation-excel-month-picker',
  action: 'admin-download-rotation-excel',
  rule: 'Výběr měsíce pro XLSX export je řazený chronologicky a skupinovaný podle roku, aby se nemíchaly stejné měsíce z různých roků.'
});

function buildRakRotationExcelExportMonthOptions(selectedMonthKey) {
  const selected = String(selectedMonthKey || '').trim();
  const keys = getAdminRotationMonthKeys().slice().sort((a, b) => {
    const diff = adminRotationMonthSortValue(a) - adminRotationMonthSortValue(b);
    return diff || a.localeCompare(b, 'cs');
  });
  if (!keys.length) return '<option value="">Není dostupný žádný měsíc</option>';
  const groups = new Map();
  keys.forEach((key) => {
    const parsed = typeof parseMonthKey === 'function' ? parseMonthKey(key) : null;
    const year = parsed && Number.isFinite(parsed.year) ? String(parsed.year) : 'Bez roku';
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year).push(key);
  });
  return Array.from(groups.entries()).map(([year, yearKeys]) => {
    const options = yearKeys.map((key) => '<option value="' + escapeHtml(key) + '"' + (key === selected ? ' selected' : '') + '>' + escapeHtml(key) + '</option>').join('');
    return '<optgroup label="Rok ' + escapeHtml(year) + '">' + options + '</optgroup>';
  }).join('');
}

function adminExportImportStatusItemHtml(item) {
  const state = String(item && item.state || 'info').trim() || 'info';
  return [
    '<div class="adminExportImportStatusItem is' + escapeHtml(state.charAt(0).toUpperCase() + state.slice(1)) + '">',
    '  <span>' + escapeHtml(item && item.title || '') + '</span>',
    '  <b>' + escapeHtml(item && item.value || '') + '</b>',
    item && item.detail ? '  <small>' + escapeHtml(item.detail) + '</small>' : '',
    '</div>'
  ].join('');
}

function buildAdminExportImportStatusHtml(selectedMonthKey) {
  const preview = (typeof getRakExcelImportPreview === 'function') ? getRakExcelImportPreview() : null;
  const exportMonthEl = document.getElementById('rakRotationExcelExportMonth');
  const exportMonthKey = String((exportMonthEl && exportMonthEl.value) || selectedMonthKey || app.selectedMonth || '').trim();
  const scopeEl = document.getElementById('rakExcelImportScope');
  const detectedMonthEl = document.getElementById('rakExcelImportDetectedMonth');
  const scope = String(scopeEl && scopeEl.value ? scopeEl.value : 'all');
  const selectedImportMonth = String(detectedMonthEl && detectedMonthEl.value ? detectedMonthEl.value : '').trim();
  const monthCount = preview && Array.isArray(preview.monthKeys) ? preview.monthKeys.length : 0;
  const items = [
    {
      state: 'info',
      title: 'ZIP export',
      value: 'celá aplikace',
      detail: 'Stáhne kompletní build aplikace pro zálohu nebo nahrání.'
    },
    {
      state: exportMonthKey ? 'ok' : 'warn',
      title: 'Excel rozpisu',
      value: exportMonthKey || 'nevybrán',
      detail: exportMonthKey ? 'Stáhne jen vybraný měsíc v kopírovacím layoutu.' : 'Nejdřív vyber měsíc rozpisu.'
    },
    {
      state: monthCount ? 'ok' : 'info',
      title: 'Importovaný Excel',
      value: preview ? (preview.fileName || 'Excel') : 'nevybrán',
      detail: monthCount ? ('Použitelných měsíčních listů: ' + String(monthCount) + '.') : 'Po výběru souboru se načtou jen měsíční listy typu 01.2025.'
    },
    {
      state: preview && scope === 'month' && !selectedImportMonth ? 'warn' : 'info',
      title: 'Rozsah importu',
      value: scope === 'month' ? (selectedImportMonth || 'vyber měsíc') : 'celý Excel / rok',
      detail: scope === 'month' ? 'Import přepíše jen vybraný měsíc z načteného Excelu.' : 'Import přepíše všechny použitelné měsíce z načteného Excelu.'
    }
  ];
  return [
    '<div class="adminExportImportStatus" id="adminExportImportStatus">',
    '  <div class="appMenuSubTitle">Stav exportu / importu</div>',
    '  <div class="smallText uMb10">Rychlá kontrola před stažením nebo načtením dat. Tohle samo nic neimportuje.</div>',
    '  <div class="adminExportImportStatusGrid">',
    items.map(adminExportImportStatusItemHtml).join(''),
    '  </div>',
    '</div>'
  ].join('');
}

function renderAdminExportImportStatus() {
  const box = document.getElementById('adminExportImportStatus');
  if (!box) return;
  const exportMonthEl = document.getElementById('rakRotationExcelExportMonth');
  const selectedMonthKey = String((exportMonthEl && exportMonthEl.value) || app.selectedMonth || '').trim();
  const wrapper = document.createElement('div');
  wrapper.innerHTML = buildAdminExportImportStatusHtml(selectedMonthKey);
  const next = wrapper.firstElementChild;
  if (next) box.replaceWith(next);
}

function adminExportImportSafetyItemHtml(label, value, detail, state) {
  const safeState = state || 'info';
  return [
    '<div class="adminExportImportSafetyItem is' + escapeHtml(safeState.charAt(0).toUpperCase() + safeState.slice(1)) + '">',
    '  <span>' + escapeHtml(label || '') + '</span>',
    '  <b>' + escapeHtml(value || '') + '</b>',
    detail ? '  <small>' + escapeHtml(detail) + '</small>' : '',
    '</div>'
  ].join('');
}

function buildAdminExportImportSafetyHtml() {
  return [
    '<div class="adminExportImportSafety">',
    '  <div class="appMenuSubTitle">Bezpečnost importu</div>',
    '  <div class="smallText uMb10">Export jen stahuje data. Import naopak přepisuje rozpisy z načteného Excelu, proto před tlačítkem Načíst do rozpisů ověř rozsah a zálohy.</div>',
    '  <div class="adminExportImportSafetyGrid">',
    adminExportImportSafetyItemHtml('Rozsah', 'měsíc / rok', 'Před importem zkontroluj, jestli má být vybraný jen jeden měsíc, nebo celý načtený Excel.', 'warn'),
    adminExportImportSafetyItemHtml('Záloha', 'před importem', 'U většího importu nejdřív otevři Zálohy rozpisů nebo stáhni Excel aktuálního stavu.', 'info'),
    adminExportImportSafetyItemHtml('Kontrola po importu', 'rozpis + export', 'Po importu otevři Rozpisy, ověř absence/výjimky a stáhni kontrolní Excel podle potřeby.', 'info'),
    '  </div>',
    '</div>'
  ].join('');
}


function ensureAppMenuOverlay() {
  let page = document.getElementById('menu');
  if (page) return page;

  page = document.createElement('div');
  page.id = 'menu';
  page.className = 'page appMenuPage';
  page.innerHTML = [
    '<div class="headerBar appMenuPageTitleBar">',
    '  <div></div>',
    '  <h3>Více</h3>',
    '  <div class="appMenuTitleSpacer"></div>',
    '</div>',
    '<div class="card appMenuPageCard">',
    '  <div class="appMenuBody" id="appMenuBody"></div>',
    '</div>'
  ].join('');

  document.body.appendChild(page);
  return page;
}

function hideAppMenu() {
  const page = document.getElementById('menu');
  if (!page) return;
  page.classList.remove('active');
}

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
    '<div class="adminRotationBackupStatus">',
    '  <div class="appMenuSubTitle">Stav záloh</div>',
    '  <div class="smallText uMb10">Rychlá kontrola před obnovou. Tahle část sama nic neobnovuje ani neukládá.</div>',
    '  <div class="adminRotationBackupStatusGrid">',
    items.map(adminRotationBackupStatusItemHtml).join(''),
    '  </div>',
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
  const rows = backups.map((backup) => {
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
      '  <td>' + escapeHtml(label || 'Záloha') + '<div class="smallText">' + escapeHtml(source) + '</div></td>',
      '  <td><button type="button" class="appMenuAction" data-admin-action="restore-rotation-backup" data-backup-id="' + escapeHtml(id) + '">Obnovit</button></td>',
      '</tr>'
    ].join('');
  }).join('');
  return [
    '<div class="tableWrap appMenuTableWrap uMt8">',
    '  <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense">',
    '    <thead><tr><th>Záloha</th><th>Akce</th></tr></thead>',
    '    <tbody>' + rows + '</tbody>',
    '  </table>',
    '</div>'
  ].join('');
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
      && cat !== 'rotation_overtime_settings'
      && cat !== 'rotation_generator_settings'
      && cat !== 'external_links_settings'
      && cat !== 'app_contact_settings'
      && cat !== 'payroll_settings'
      && cat !== 'vacation_countdown_settings'
      && cat !== 'special_days_settings'
      && key !== 'ADMIN_ACCOUNTS_SETTINGS'
      && key !== 'ROTATION_OVERTIME_SETTINGS'
      && key !== 'ROTATION_GENERATOR_SETTINGS'
      && key !== 'EXTERNAL_LINKS_SETTINGS'
      && key !== 'APP_CONTACT_SETTINGS'
      && key !== 'PAYROLL_SETTINGS'
      && key !== 'VACATION_COUNTDOWN_SETTINGS'
      && key !== 'SPECIAL_DAYS_SETTINGS';
  });
}

function adminHandoverActiveAdminCount() {
  let activeAdmins = 1;
  try {
    const adminSettings = typeof rakAdminGetAccountsSettings === 'function' ? rakAdminGetAccountsSettings() : null;
    activeAdmins += (Array.isArray(adminSettings && adminSettings.admins) ? adminSettings.admins : []).filter((entry) => entry && entry.enabled !== false).length;
  } catch (err) {}
  return activeAdmins;
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
  if (safeTitle.indexOf('rozpis') !== -1) return { action: 'open-rotation', label: 'Rozpis' };
  if (safeTitle.indexOf('provoz') !== -1) return { action: 'open-food', label: 'Provoz' };
  if (safeTitle.indexOf('volno') !== -1) return { action: 'open-vacation', label: 'Dovolená' };
  if (safeTitle.indexOf('záloh') !== -1 || safeTitle.indexOf('zaloh') !== -1) return { action: 'open-backups', label: 'Zálohy' };
  if (safeTitle.indexOf('správc') !== -1 || safeTitle.indexOf('spravc') !== -1) return { action: 'open-admin-accounts', label: 'Správci' };
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
  const lines = [
    'Co jeste vyresit pred predanim'
  ];
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
      state: activeAdmins > 1 ? 'ok' : 'info',
      title: 'Správci',
      value: activeAdmins > 1 ? String(activeAdmins) + ' účty' : 'jen hlavní',
      detail: activeAdmins > 1 ? 'Je připravený další správce.' : 'Dalšího správce může doplnit hlavní admin.'
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
  const lines = [
    'Pripravenost predani',
    '- Mesic: ' + (snapshot.selectedMonth || 'nevybran'),
    '- Stav: ' + (snapshot.ready ? 'bez blokujicich varovani' : 'zkontrolovat varovani'),
    '- Souhrn: ' + String(snapshot.okCount) + '/' + String(snapshot.totalCount) + ' OK, varovani ' + String(snapshot.warnCount) + ', info ' + String(snapshot.infoCount)
  ];
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
  const roleLabel = unlocked ? (owner ? 'Hlavní admin' : 'Správce') : 'Zamčeno';
  const stateLabel = unlocked ? 'Odemčeno' : 'Zamčeno';
  const detail = unlocked
    ? (owner ? 'Můžeš měnit správce a všechny admin sekce.' : 'Můžeš spravovat provoz a rozpisy, správce mění jen hlavní admin.')
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
    adminAccessRuleItemHtml('Další správce', 'Provoz, rozpisy, absence, zálohy a exporty.', 'Nesmí měnit seznam správců ani jejich hesla.', 'admin'),
    adminAccessRuleItemHtml('Běžný účet', 'Používá jen běžnou aplikaci.', 'Nesmí měnit rozpis, provoz ani online nastavení.', 'user'),
    '  </div>',
    '</div>'
  ].join('');
}

function buildAdminAccessRulesText() {
  const activeAdmins = adminHandoverActiveAdminCount();
  const permissionStatus = adminPermissionStatusSnapshot();
  return [
    'Pristup a hesla',
    '- Aktivni admin ucty: ' + String(activeAdmins),
    '- Aktualni role: ' + String(permissionStatus.roleLabel || 'nezjisteno'),
    '- Hlavni admin muze menit spravce, hesla, provoz i rozpisy.',
    '- Dalsi spravce muze menit provoz, rozpisy, absence, zalohy a exporty, ale ne seznam spravcu.',
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
  const permissionStatus = adminPermissionStatusSnapshot();
  const version = formatRakDisplayVersion((typeof app !== 'undefined' && app.version) || (typeof APP_VERSION !== 'undefined' ? APP_VERSION : ''));
  return [
    'RaK - Stav předání správy',
    'Verze: ' + version,
    'Vytvořeno: ' + new Date().toLocaleString('cs-CZ'),
    '',
    'Souhrn',
    buildAdminHandoverTodoText(selectedMonth).trim(),
    buildAdminHandoverReadinessText(selectedMonth).trim(),
    '- Online nastavení: ' + (rows.length ? ('načteno ' + rows.length + ' řádků') : 'nenačteno'),
    '- Běžné stroje v nastavení: ' + String(machineRows.length),
    '- Aktivní admin účet: ' + (permissionStatus.activeAccountId || 'nezjištěn'),
    '- Role administrace: ' + permissionStatus.roleLabel,
    '- Admin odemčen: ' + (permissionStatus.unlocked ? 'ano' : 'ne'),
    '- Pravidlo hlavního admina: hlavní admin smí měnit správce a hesla.',
    '- Pravidlo dalšího správce: smí měnit provoz a rozpisy, ale ne seznam správců.',
    '- Pravidlo běžného účtu: nesmí měnit rozpis, provoz ani online nastavení.',
    buildAdminAccessRulesText().trim(),
    '- Admin účty: ' + String(activeAdmins),
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
  ].join('\n');
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
  const version = formatRakDisplayVersion((typeof app !== 'undefined' && app.version) || (typeof APP_VERSION !== 'undefined' ? APP_VERSION : ''));
  return [
    'RaK - Balicek predani spravy',
    'Verze: ' + version,
    'Mesic: ' + (selectedMonth || 'nevybran'),
    'Vytvoreno: ' + new Date().toLocaleString('cs-CZ'),
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
  ].join('\n');
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

function adminAnnouncementPublicCheckItemHtml(label, value, detail, state) {
  const safeState = state || 'info';
  return [
    '<div class="adminAnnouncementPublicCheckItem is' + escapeHtml(safeState.charAt(0).toUpperCase() + safeState.slice(1)) + '">',
    '  <span>' + escapeHtml(label || '') + '</span>',
    '  <b>' + escapeHtml(value || '') + '</b>',
    detail ? '  <small>' + escapeHtml(detail) + '</small>' : '',
    '</div>'
  ].join('');
}

function buildAdminAnnouncementPublicCheckHtml() {
  return [
    '<div class="adminAnnouncementPublicCheck">',
    '  <div class="appMenuSubTitle">Veřejná kontrola oznámení</div>',
    '  <div class="smallText uMb10">Oznámení je jedna z mála admin změn, kterou po uložení uvidí běžní lidé hned na home. Tenhle blok nic neukládá, jen připomíná kontrolu.</div>',
    '  <div class="adminAnnouncementPublicCheckGrid">',
    adminAnnouncementPublicCheckItemHtml('Kde se projeví', 'Home / Dashboard', 'Po uložení otevři home a ověř, že text sedí a neblokuje ostatní karty.', 'warn'),
    adminAnnouncementPublicCheckItemHtml('Vypnutí', 'bar zmizí', 'Po vypnutí oznámení zkontroluj, že na home nezůstal starý text z cache.', 'info'),
    adminAnnouncementPublicCheckItemHtml('Čas Od / Do', 'dobrovolné', 'Když vyplníš časové omezení, ověř, že Od je před Do.', 'info'),
    '  </div>',
    '</div>'
  ].join('');
}

function adminExternalLinksPublicCheckItemHtml(label, value, detail, state) {
  const safeState = state || 'info';
  return [
    '<div class="adminExternalLinksPublicCheckItem is' + escapeHtml(safeState.charAt(0).toUpperCase() + safeState.slice(1)) + '">',
    '  <span>' + escapeHtml(label || '') + '</span>',
    '  <b>' + escapeHtml(value || '') + '</b>',
    detail ? '  <small>' + escapeHtml(detail) + '</small>' : '',
    '</div>'
  ].join('');
}

function buildAdminExternalLinksPublicCheckHtml() {
  return [
    '<div class="adminExternalLinksPublicCheck">',
    '  <div class="appMenuSubTitle">Veřejná kontrola odkazů</div>',
    '  <div class="smallText uMb10">Odkazy jsou viditelné v běžné aplikaci. Po uložení je potřeba ověřit, že se otevřou správné firemní stránky a kalendář.</div>',
    '  <div class="adminExternalLinksPublicCheckGrid">',
    adminExternalLinksPublicCheckItemHtml('Home a menu', 'otevřít', 'Zkontroluj Jídelní lístek, Eportal, Výplatu a Kalendář z běžné aplikace.', 'warn'),
    adminExternalLinksPublicCheckItemHtml('Formát URL', 'https', 'U veřejných odkazů používej celé bezpečné adresy, ne zkrácené nebo rozbité odkazy.', 'info'),
    adminExternalLinksPublicCheckItemHtml('Kalendář', 'iframe', 'Po změně kalendáře otevři modal a ověř, že se vložený kalendář opravdu načte.', 'info'),
    '  </div>',
    '</div>'
  ].join('');
}

function adminAppContactPublicCheckItemHtml(label, value, detail, state) {
  const safeState = state || 'info';
  return [
    '<div class="adminAppContactPublicCheckItem is' + escapeHtml(safeState.charAt(0).toUpperCase() + safeState.slice(1)) + '">',
    '  <span>' + escapeHtml(label || '') + '</span>',
    '  <b>' + escapeHtml(value || '') + '</b>',
    detail ? '  <small>' + escapeHtml(detail) + '</small>' : '',
    '</div>'
  ].join('');
}

function buildAdminAppContactPublicCheckHtml() {
  return [
    '<div class="adminAppContactPublicCheck">',
    '  <div class="appMenuSubTitle">Veřejná kontrola kontaktu</div>',
    '  <div class="smallText uMb10">Kontakt je viditelný v běžném menu. Po uložení ověř jméno, telefon a e-mail přes běžnou aplikaci, ne jen v administraci.</div>',
    '  <div class="adminAppContactPublicCheckGrid">',
    adminAppContactPublicCheckItemHtml('Běžné menu', 'Kontakt', 'Otevři menu Kontakt a ověř, že jsou údaje čitelné a aktuální.', 'warn'),
    adminAppContactPublicCheckItemHtml('Telefon', 'volatelný', 'Zkontroluj formát čísla, aby ho mobil uměl rovnou použít.', 'info'),
    adminAppContactPublicCheckItemHtml('E-mail', 'klikací', 'Zkontroluj adresu bez překlepů a bez zbytečných mezer.', 'info'),
    '  </div>',
    '</div>'
  ].join('');
}

function adminPayrollPublicCheckItemHtml(label, value, detail, state) {
  const safeState = state || 'info';
  return [
    '<div class="adminPayrollPublicCheckItem is' + escapeHtml(safeState.charAt(0).toUpperCase() + safeState.slice(1)) + '">',
    '  <span>' + escapeHtml(label || '') + '</span>',
    '  <b>' + escapeHtml(value || '') + '</b>',
    detail ? '  <small>' + escapeHtml(detail) + '</small>' : '',
    '</div>'
  ].join('');
}

function buildAdminPayrollPublicCheckHtml() {
  return [
    '<div class="adminPayrollPublicCheck">',
    '  <div class="appMenuSubTitle">Veřejná kontrola výplaty</div>',
    '  <div class="smallText uMb10">Datum výplaty je viditelné na home kartě Výplata. Po uložení ověř nejbližší datum v běžné aplikaci a zelenou synchronizaci.</div>',
    '  <div class="adminPayrollPublicCheckGrid">',
    adminPayrollPublicCheckItemHtml('Home karta', 'Výplata', 'Otevři home a ověř datum i text „za X dní“ po uložení pravidla.', 'warn'),
    adminPayrollPublicCheckItemHtml('Pravidlo', 'pracovní den', 'Zkontroluj, že pořadí pracovního dne odpovídá dohodnutému výplatnímu pravidlu.', 'info'),
    adminPayrollPublicCheckItemHtml('Výjimky', 'měsíc', 'U ruční výjimky ověř správný měsíc, datum a poznámku bez překlepů.', 'info'),
    '  </div>',
    '</div>'
  ].join('');
}

function adminFoodPublicCheckItemHtml(label, value, detail, state) {
  const safeState = state || 'info';
  return [
    '<div class="adminFoodPublicCheckItem is' + escapeHtml(safeState.charAt(0).toUpperCase() + safeState.slice(1)) + '">',
    '  <span>' + escapeHtml(label || '') + '</span>',
    '  <b>' + escapeHtml(value || '') + '</b>',
    detail ? '  <small>' + escapeHtml(detail) + '</small>' : '',
    '</div>'
  ].join('');
}

function buildAdminFoodPublicCheckHtml() {
  return [
    '<div class="adminFoodPublicCheck">',
    '  <div class="appMenuSubTitle">Veřejná kontrola provozu</div>',
    '  <div class="smallText uMb10">Časy kantýny a jídelny jsou viditelné na home kartách. Po uložení ověř běžnou aplikaci, ne jen administraci.</div>',
    '  <div class="adminFoodPublicCheckGrid">',
    adminFoodPublicCheckItemHtml('Home karty', 'Kantýna / Jídelna', 'Ověř stav otevřeno/zavřeno, čas „Do“ a řádek „Další“ na home.', 'warn'),
    adminFoodPublicCheckItemHtml('Běžné časy', 'týden', 'Po změně běžné otevírací doby zkontroluj pracovní den i neděli.', 'info'),
    adminFoodPublicCheckItemHtml('Přesčasy', 'budoucí neděle', 'U přesčasů ověř datum, časy a že minulé termíny zůstaly jen schované.', 'info'),
    '  </div>',
    '</div>'
  ].join('');
}

function adminVacationPublicCheckItemHtml(label, value, detail, state) {
  const safeState = state || 'info';
  return [
    '<div class="adminVacationPublicCheckItem is' + escapeHtml(safeState.charAt(0).toUpperCase() + safeState.slice(1)) + '">',
    '  <span>' + escapeHtml(label || '') + '</span>',
    '  <b>' + escapeHtml(value || '') + '</b>',
    detail ? '  <small>' + escapeHtml(detail) + '</small>' : '',
    '</div>'
  ].join('');
}

function buildAdminVacationPublicCheckHtml() {
  return [
    '<div class="adminVacationPublicCheck">',
    '  <div class="appMenuSubTitle">Veřejná kontrola dovolené</div>',
    '  <div class="smallText uMb10">Dovolená a odstávky mění home kartu Dovolená i počítání směn. Po uložení ověř běžnou aplikaci a rozpis, ne jen administraci.</div>',
    '  <div class="adminVacationPublicCheckGrid">',
    adminVacationPublicCheckItemHtml('Home karta', 'Dovolená', 'Ověř název období, počet dní a pravou část se směnou D.', 'warn'),
    adminVacationPublicCheckItemHtml('Od / Do', 'hodiny', 'Zkontroluj přesný začátek a konec, protože během období se směna bere jako volno.', 'info'),
    adminVacationPublicCheckItemHtml('Rozpis', 'směny D', 'U vytvořeného měsíce ověř, že odpočet směn bere skutečný rozpis.', 'info'),
    '  </div>',
    '</div>'
  ].join('');
}

function adminSpecialDaysPublicCheckItemHtml(label, value, detail, state) {
  const safeState = state || 'info';
  return [
    '<div class="adminSpecialDaysPublicCheckItem is' + escapeHtml(safeState.charAt(0).toUpperCase() + safeState.slice(1)) + '">',
    '  <span>' + escapeHtml(label || '') + '</span>',
    '  <b>' + escapeHtml(value || '') + '</b>',
    detail ? '  <small>' + escapeHtml(detail) + '</small>' : '',
    '</div>'
  ].join('');
}

function buildAdminSpecialDaysPublicCheckHtml() {
  return [
    '<div class="adminSpecialDaysPublicCheck">',
    '  <div class="appMenuSubTitle">Veřejná kontrola volných dnů</div>',
    '  <div class="smallText uMb10">Mimořádný volný den mění práci v konkrétní datum. Po uložení ověř rozpis a běžnou aplikaci, hlavně jestli se směna správně bere jako volno.</div>',
    '  <div class="adminSpecialDaysPublicCheckGrid">',
    adminSpecialDaysPublicCheckItemHtml('Datum', 'jeden den', 'Zkontroluj přesný den a důvod, aby se neblokoval jiný termín.', 'warn'),
    adminSpecialDaysPublicCheckItemHtml('Rozpis', 'volno', 'Ověř, že se v rozpisu a výpočtech ten den nebere jako běžná práce.', 'info'),
    adminSpecialDaysPublicCheckItemHtml('Návaznost', 'dovolená', 'Delší období patří do Dovolená / odstávky, tady nech jen jednorázové dny.', 'info'),
    '  </div>',
    '</div>'
  ].join('');
}

function adminMachinePublicCheckItemHtml(label, value, detail, state) {
  const safeState = state || 'info';
  return [
    '<div class="adminMachinePublicCheckItem is' + escapeHtml(safeState.charAt(0).toUpperCase() + safeState.slice(1)) + '">',
    '  <span>' + escapeHtml(label || '') + '</span>',
    '  <b>' + escapeHtml(value || '') + '</b>',
    detail ? '  <small>' + escapeHtml(detail) + '</small>' : '',
    '</div>'
  ].join('');
}

function buildAdminMachinePublicCheckHtml() {
  return [
    '<div class="adminMachinePublicCheck">',
    '  <div class="appMenuSubTitle">Kontrola dopadu strojů</div>',
    '  <div class="smallText uMb10">Nastavení strojů může změnit výpočty v kalkulačkách a návazné kontroly v administraci. Po uložení ověř běžnou aplikaci, ne jen tabulku.</div>',
    '  <div class="adminMachinePublicCheckGrid">',
    adminMachinePublicCheckItemHtml('Kalkulačky', 'výpočty', 'Otevři soustruhy nebo brusky a ověř, že nový čas, rychlost nebo orovnání dávají smysl.', 'warn'),
    adminMachinePublicCheckItemHtml('Rozpis / statistiky', 'návaznost', 'Po změně strojů ověř, že rozpis a souhrny pořád používají správné názvy strojů.', 'info'),
    adminMachinePublicCheckItemHtml('Online stav', 'zeleně', 'Po uložení zkontroluj synchronizaci a podle potřeby načti nastavení na dalším zařízení.', 'info'),
    '  </div>',
    '</div>'
  ].join('');
}

function adminRotationPublicCheckItemHtml(label, value, detail, state) {
  const safeState = state || 'info';
  return [
    '<div class="adminRotationPublicCheckItem is' + escapeHtml(safeState.charAt(0).toUpperCase() + safeState.slice(1)) + '">',
    '  <span>' + escapeHtml(label || '') + '</span>',
    '  <b>' + escapeHtml(value || '') + '</b>',
    detail ? '  <small>' + escapeHtml(detail) + '</small>' : '',
    '</div>'
  ].join('');
}

function buildAdminRotationPublicCheckHtml() {
  return [
    '<div class="adminRotationPublicCheck">',
    '  <div class="appMenuSubTitle">Veřejná kontrola rozpisu</div>',
    '  <div class="smallText uMb10">Rozpis je viditelný v Rotace / Rozpisy a v exportech. Po uložení ověř veřejný přehled, absence a export, ne jen admin tabulku.</div>',
    '  <div class="adminRotationPublicCheckGrid">',
    adminRotationPublicCheckItemHtml('Rotace / Rozpisy', 'měsíc', 'Ověř vybraný měsíc, žluté výjimky a detail výjimky po kliknutí.', 'warn'),
    adminRotationPublicCheckItemHtml('Absence', 'zkratky', 'Zkontroluj, že důvody jsou zkratkou a více absencí ve dni drží stabilní sloupce.', 'info'),
    adminRotationPublicCheckItemHtml('Export', 'Excel / obrázek', 'Po větší změně stáhni export a ověř zvýraznění výjimek i kopírovací layout.', 'info'),
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
  const version = formatRakDisplayVersion((typeof app !== 'undefined' && app.version) || (typeof APP_VERSION !== 'undefined' ? APP_VERSION : ''));
  const stateLabels = { ok: 'OK', warn: 'zkontrolovat', info: 'podle potřeby', todo: 'čeká' };
  const lines = [
    'RaK - Měsíční postup správy',
    'Verze: ' + version,
    'Měsíc: ' + workflow.monthLabel,
    'Vytvořeno: ' + new Date().toLocaleString('cs-CZ'),
    '',
    'Pravidlo',
    '- Tenhle soubor nic sám nemění. Každou změnu udělej v administraci a ulož v konkrétní sekci.',
    '- Běžní uživatelé nemají mít možnost měnit rozpis, provoz ani nastavení.',
    '',
    'Kroky'
  ];
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
      detail: 'Po uložení ověřit synchronizaci, připojení, reporty chyb a připravit export pro předání.',
      actions: [
        { action: 'open-usage', label: 'Připojení' },
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
      'Před obnovou se aktuální rozpis ještě uloží jako nová záloha. Obnovu používat jen po kontrole správného času a měsíce.',
      [
        { action: 'open-backups', label: 'Zálohy' },
        { action: 'open-export', label: 'Export / import' },
        { action: 'open-reports', label: 'Reporty' }
      ],
      { open: false }
    ),
    adminManualSectionHtml(
      'Předání dalšímu správci',
      ownerCanManage
        ? 'Hlavní admin může přidat další správce, nastavit jim heslo a potom projít panel Předání správy.'
        : 'Další správce může přidat jen hlavní admin účet. Ostatní admini mohou používat pracovní části administrace.',
      [
        { action: 'open-handover', label: 'Předání správy' }
      ].concat(ownerCanManage ? [{ action: 'open-admin-accounts', label: 'Správci' }] : []),
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
    adminSettingsMapStatusItemHtml('Spravci', ownerAccess ? 'owner' : 'bezny admin', ownerAccess ? 'Tento ucet muze menit dalsi spravce.' : 'Spravce smi menit provoz, ale ne seznam spravcu.', ownerAccess ? 'ok' : 'info'),
    '  </div>',
    '</div>'
  ].join('');
}

function getAdminSettingsMapItems() {
  return [
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
      title: 'Odkazy, kontakt a výplata',
      scope: 'Aplikace pro lidi',
      detail: 'Jídelní lístek, Eportal, kalendář, kontakt aplikace a pravidlo výplaty.',
      visible: 'Viditelné v běžném menu a na home kartách.',
      check: 'Běžné menu, home karty Vyplata/Jidelni listek/Eportal a Kontakt.',
      actions: [
        { action: 'open-external-links', label: 'Odkazy' },
        { action: 'open-app-contact', label: 'Kontakt' },
        { action: 'open-payroll-settings', label: 'Výplata' }
      ]
    },
    {
      title: 'Správci a kontrola provozu',
      scope: 'Kontrola a servis',
      detail: 'Admin účty, připojená zařízení, reporty chyb, synchronizace a exporty.',
      visible: 'Dostupné jen administrátorům.',
      check: 'Spravci, servis synchronizace a predavaci podklady bez hesel.',
      actions: [
        { action: 'open-admin-accounts', label: 'Správci' },
        { action: 'open-usage', label: 'Připojení' },
        { action: 'open-service', label: 'Servis' }
      ]
    }
  ];
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
  const version = formatRakDisplayVersion((typeof app !== 'undefined' && app.version) || (typeof APP_VERSION !== 'undefined' ? APP_VERSION : ''));
  const ownerAccess = typeof rakAdminCanManageAdmins === 'function' && rakAdminCanManageAdmins();
  const lines = [
    'RaK - Kde co upravit',
    'Verze: ' + version,
    'Vytvořeno: ' + new Date().toLocaleString('cs-CZ'),
    '',
    'Pravidlo',
    '- Tenhle soubor je jen mapa administrace. Nic sám nemění ani neukládá.',
    '- Změny dělej jen v administraci a ukládej v konkrétní sekci.',
    '- Běžný uživatel nemá mít možnost měnit rozpis, provoz ani nastavení.',
    '- Správci: ' + (ownerAccess ? 'hlavní admin může měnit další správce.' : 'běžný admin nemůže měnit seznam správců.'),
    '',
    'Oblasti'
  ];
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
  const version = formatRakDisplayVersion((typeof app !== 'undefined' && app.version) || (typeof APP_VERSION !== 'undefined' ? APP_VERSION : ''));
  const generatedAt = new Date().toLocaleString('cs-CZ');
  const ownerLine = (typeof rakAdminCanManageAdmins === 'function' && rakAdminCanManageAdmins())
    ? 'Jsi hlavní admin: můžeš přidat další správce a nastavit jim heslo.'
    : 'Další správce může přidat jen hlavní admin účet.';
  return [
    'RaK - Příručka správce',
    'Verze: ' + version,
    'Vytvořeno: ' + generatedAt,
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
    '- V administraci můžeš otevřít Přehled připojení, Reporty chyb a Servis / synchronizace.',
    ''
  ].join('\n');
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
  if (typeof rakAdminCanManageAdmins === 'function' && rakAdminCanManageAdmins()) {
    adminServiceActions.unshift({ action: 'open-admin-accounts', label: 'Správci' });
  }

  const homeHtml = [
    '<div class="appMenuCard appMenuAdminCard">',
    '  <div class="appMenuCardTitle">Administrace</div>',
    '  <div class="appMenuText">',
    '    <div>Nejdřív nastav provoz, potom vygeneruj a ulož rozpis. Všechno se ukládá online přes Supabase.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Vyber sekci, kterou chceš upravit.</div>',
    '  </div>',
    buildAdminPermissionStatusHtml(),
    buildAdminAccessRulesHtml(),
    buildAdminHandoverTodoHtml(monthKey),
    buildAdminHandoverReadinessHtml(monthKey),
    buildAdminPostSaveCheckHtml(),
    buildAdminNextStepsHtml(monthKey),
    buildAdminHandoverExportsHtml(monthKey),
    buildAdminActionLegendHtml(),
    buildAdminHandoverChecklistHtml(monthKey),
    '  <div class="adminMenuSections">',
    buildAdminMenuSectionHtml('1. Provoz před rozpisem', 'Co musí sedět před generováním dalšího měsíce.', [
      { action: 'open-machines', label: 'Nastavení strojů' },
      { action: 'open-food', label: 'Kantýna / jídelna' },
      { action: 'open-overtime', label: 'Přesčasy' },
      { action: 'open-vacation', label: 'Dovolená / odstávky' },
      { action: 'open-special-days', label: 'Mimořádné volné dny' }
    ]),
    buildAdminMenuSectionHtml('2. Rozpisy a předání', 'Tvorba, kontrola, zálohy a export rozpisu.', [
      { action: 'open-rotation', label: 'Rozpisy' },
      { action: 'open-generator-settings', label: 'Pravidla generátoru' },
      { action: 'open-monthly-workflow', label: 'Měsíční postup' },
      { action: 'open-handover', label: 'Předání správy' },
      { action: 'open-admin-manual', label: 'Příručka správce' },
      { action: 'open-settings-map', label: 'Kde co upravit' },
      { action: 'open-backups', label: 'Zálohy rozpisů' },
      { action: 'open-export', label: 'Export / import' }
    ]),
    buildAdminMenuSectionHtml('3. Aplikace pro lidi', 'Texty, odkazy a informace viditelné v běžné aplikaci.', [
      { action: 'open-announcement', label: 'Oznámení Dashboard' },
      { action: 'open-external-links', label: 'Odkazy' },
      { action: 'open-app-contact', label: 'Kontakt aplikace' },
      { action: 'open-payroll-settings', label: 'Výplata' }
    ]),
    buildAdminMenuSectionHtml('4. Kontrola a servis', 'Připojení, reporty, synchronizace a správa adminů.', [
      { action: 'open-usage', label: 'Přehled připojení' },
      { action: 'open-reports', label: 'Reporty chyb' }
    ].concat(adminServiceActions)),
    '  </div>',
    '  <button type="button" class="appMenuAction appMenuBack" data-menu-back="1">Zpět</button>',
    '</div>'
  ].join('');

  const machinesHtml = [
    '<div class="appMenuCard appMenuAdminCard adminMachinesCard">',
    '  <div class="appMenuCardTitle">Nastavení strojů</div>',
    '  <div class="appMenuText">',
    '    <div>Každý stroj je jeden řádek. U brusů se zapisuje stroj + index + parametry.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Stav uložení se zobrazí po kliknutí na Uložit stroje.</div>',
    '  </div>',
    buildAdminMachineSettingsTableHtml(),
    buildAdminMachinePublicCheckHtml(),
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="load-machines">Načíst online</button>',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="save-machines">Uložit stroje</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');

  const foodHtml = [
    '<div class="appMenuCard appMenuAdminCard adminFoodScheduleCard">',
    '  <div class="appMenuCardTitle">Kantýna / jídelna</div>',
    '  <div class="appMenuText">',
    '    <div>Tady si nastavíš běžnou otevírací dobu, přesčasovou dobu a seznam přesčasových nedělí. Datumy piš česky: třeba 11.1.2027.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Stav uložení se zobrazí po kliknutí na Uložit časy.</div>',
    '  </div>',
    buildAdminFoodScheduleSettingsHtml(),
    buildAdminFoodPublicCheckHtml(),
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
    buildAdminVacationPublicCheckHtml(),
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
    buildAdminSpecialDaysPublicCheckHtml(),
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
    buildAdminRotationPublicCheckHtml(),
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

  const adminAccountsHtml = [
    '<div class="appMenuCard appMenuAdminCard adminAccountsCard">',
    '  <div class="appMenuCardTitle">Správci</div>',
    '  <div class="appMenuText">',
    '    <div>Tady hlavní admin nastaví další admin účty. Běžní uživatelé tuhle sekci neuvidí.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Prázdné řádky se neukládají. Pro odebrání správce smaž účet nebo heslo a ulož.</div>',
    '  </div>',
    buildAdminAccountsSettingsHtml(),
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="load-admin-accounts">Načíst online</button>',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="save-admin-accounts">Uložit správce</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');

  const externalLinksHtml = [
    '<div class="appMenuCard appMenuAdminCard adminExternalLinksCard">',
    '  <div class="appMenuCardTitle">Odkazy</div>',
    '  <div class="appMenuText">',
    '    <div>Tady nastavíš odkazy na jídelní lístek, Eportal, výplatní portál a vložený Google kalendář. Změna se projeví v běžné aplikaci.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Bez uložené změny zůstávají původní odkazy.</div>',
    '  </div>',
    buildAdminExternalLinksSettingsHtml(),
    buildAdminExternalLinksPublicCheckHtml(),
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
    buildAdminAppContactPublicCheckHtml(),
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
    buildAdminPayrollPublicCheckHtml(),
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
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="load-rotation-backups">Načíst zálohy</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="open-rotation">Zpět na rozpisy</button>',
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

  const announcementHtml = [
    buildAdminAnnouncementHtml(),
    buildAdminAnnouncementPublicCheckHtml()
  ].join('');
  const usageHtml = buildAdminUsageHtml();

  const importPreview = (typeof getRakExcelImportPreview === 'function') ? getRakExcelImportPreview() : null;
  const rotationExcelMonthOptions = buildRakRotationExcelExportMonthOptions(monthKey);
  const exportHtml = [
    '<div class="appMenuCard appMenuAdminCard">',
    '  <div class="appMenuCardTitle">Export / import</div>',
    '  <div class="appMenuText">',
    '    <div>Import funguje ve dvou krocích: vybereš Excel, appka načte jen měsíční listy typu 01.2025 a potom si vybereš celý rok nebo konkrétní měsíc. Pomocné listy se ignorují.</div>',
    '    <div class="smallText" id="rakExcelImportStatus">ZIP export stáhne kompletní build aplikace. XLSX rozpis stáhne jen vybraný měsíc v kopírovacím layoutu.</div>',
    '  </div>',
    buildAdminExportImportStatusHtml(monthKey),
    buildAdminExportImportSafetyHtml(),
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
    '    <button type="button" class="appMenuAction" data-admin-action="export">Export ZIP</button>',
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
  } else if (mode === 'usage') {
    body.innerHTML = usageHtml;
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



const RAK_REPORTS_KEY = APP_KEY + ':userReports';
try { window.RAK_REPORTS_KEY = RAK_REPORTS_KEY; } catch (err) {}

function getBugReportAccount() {
  try {
    if (typeof gamesGetActiveAccount === 'function') return gamesGetActiveAccount();
  } catch (err) {}
  try {
    const profile = typeof gamesGetProfile === 'function' ? gamesGetProfile() : (app && app.gamesProfile);
    return profile && profile.activeAccountId && profile.accounts ? profile.accounts[profile.activeAccountId] : null;
  } catch (err) {}
  return null;
}

function buildBugReportPayload() {
  const account = getBugReportAccount();
  const typeEl = document.getElementById('bugReportType');
  const textEl = document.getElementById('bugReportText');
  const type = String(typeEl && typeEl.value || 'Chyba').trim() || 'Chyba';
  const text = String(textEl && textEl.value || '').trim();
  const version = String((typeof app !== 'undefined' && app.version) || (typeof APP_VERSION !== 'undefined' ? APP_VERSION : '—'));
  const theme = String(typeof getThemePreference === 'function' ? getThemePreference() : (document.documentElement.dataset.rakTheme || '—'));
  const background = String(typeof getBackgroundPreference === 'function' ? getBackgroundPreference() : (document.documentElement.dataset.rakBackground || '—'));
  return {
    id: 'report-' + Date.now(),
    type,
    text,
    accountId: account ? String(account.id || '') : '',
    accountName: account ? String(account.name || account.id || '') : '',
    version,
    page: String(document.querySelector('.page.active')?.id || '—'),
    game: String((typeof app !== 'undefined' && app.activeGameShell) || ''),
    theme,
    background,
    online: !!(typeof navigator !== 'undefined' && navigator.onLine),
    userAgent: String(navigator.userAgent || ''),
    createdAt: new Date().toISOString(),
    createdAtLocal: new Date().toLocaleString('cs-CZ')
  };
}

function formatBugReportMessage(report) {
  return [
    'RaK report – ' + String(report.type || 'Chyba'),
    '',
    'Od: ' + (report.accountName ? report.accountName + ' (' + report.accountId + ')' : 'nepřihlášený'),
    'Verze: ' + String(report.version || '—'),
    'Kdy: ' + String(report.createdAtLocal || '—'),
    'Stránka: ' + String(report.page || '—') + (report.game ? ' · hra: ' + report.game : ''),
    'Theme/pozadí: ' + String(report.theme || '—') + ' / ' + String(report.background || '—'),
    'Online: ' + (report.online ? 'ano' : 'ne'),
    '',
    'Text:',
    String(report.text || '').trim(),
    '',
    'Zařízení:',
    String(report.userAgent || '—')
  ].join('\n');
}

function saveBugReportLocal(report) {
  try {
    const current = typeof parseLocalStorageJsonCached === 'function'
      ? parseLocalStorageJsonCached(RAK_REPORTS_KEY, [])
      : JSON.parse(localStorage.getItem(RAK_REPORTS_KEY) || '[]');
    const next = (Array.isArray(current) ? current : []).concat([report]).slice(-30);
    const payload = JSON.stringify(next);
    if (typeof setLocalStorageIfChanged === 'function') setLocalStorageIfChanged(RAK_REPORTS_KEY, payload);
    else localStorage.setItem(RAK_REPORTS_KEY, payload);
  } catch (err) {
    console.warn('saveBugReportLocal failed', err);
  }
}

function renderBugReportMenuBody(body) {
  const account = getBugReportAccount();
  const disabled = !account;
  const accountText = account ? escapeHtml(String(account.name || account.id || 'Hráč')) : 'Nejdřív se přihlas v herním profilu.';
  body.innerHTML = [
    '<div class="appMenuCard appMenuReportCard">',
    '  <div class="appMenuCardTitle">Pošli mi chybu</div>',
    '  <div class="appMenuText">',
    '    <div>Sem napiš chybu, co se ti nelíbí, nebo nápad na zlepšení. Po odeslání se report uloží online do RaK databáze.</div>',
    '    <div>Když zrovna nejde internet, nechám ho v telefonu ve frontě a appka ho odešle později.</div>',
    '  </div>',
    '  <div class="appMenuContactRow"><span>Profil</span><b>' + accountText + '</b></div>',
    '  <label class="appMenuReportLabel" for="bugReportType">Typ</label>',
    '  <select class="appMenuReportSelect" id="bugReportType" ' + (disabled ? 'disabled' : '') + '>',
    '    <option>Chyba</option>',
    '    <option>Nelíbí se mi</option>',
    '    <option>Nápad</option>',
    '    <option>Výkon / sekání</option>',
    '    <option>Hra</option>',
    '  </select>',
    '  <label class="appMenuReportLabel" for="bugReportText">Popis</label>',
    '  <textarea class="appMenuReportTextarea" id="bugReportText" maxlength="1200" rows="7" placeholder="Napiš co nejpřesněji, kde se to stalo a co jsi dělal." ' + (disabled ? 'disabled' : '') + '></textarea>',
    '  <div class="appMenuReportHint" id="bugReportStatus">' + (disabled ? 'Bez přihlášení nejde report odeslat.' : 'Přidám k tomu verzi, zařízení, stránku, theme a pozadí.') + '</div>',
    '  <div class="appMenuActionRow appMenuReportActions">',
    disabled ? '    <button type="button" class="appMenuAction" data-menu-action="settings">Přihlásit / profil</button>' : '    <button type="button" class="appMenuAction isActive" data-menu-action="bug-report-submit">Odeslat</button>',
    '  </div>',
    '  <button type="button" class="appMenuAction appMenuBack" data-menu-back="1">Zpět</button>',
    '</div>'
  ].join('');
}

async function handleBugReportAction(action) {
  const account = getBugReportAccount();
  const status = document.getElementById('bugReportStatus');
  const submitBtn = document.querySelector('[data-menu-action="bug-report-submit"]');
  if (!account) {
    if (status) status.textContent = 'Nejdřív se přihlas v herním profilu.';
    return;
  }
  const report = buildBugReportPayload();
  if (!report.text || report.text.length < 5) {
    if (status) status.textContent = 'Napiš aspoň krátký popis, ať vím, co hledat.';
    document.getElementById('bugReportText')?.focus?.();
    return;
  }
  saveBugReportLocal(Object.assign({}, report, { localBackup: true }));
  if (status) status.textContent = 'Odesílám report…';
  if (submitBtn) submitBtn.disabled = true;
  try {
    let result = null;
    if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.submitBugReport === 'function') {
      result = await window.RotationSupabaseBridge.submitBugReport(report);
    }
    if (result && result.ok && result.queued) {
      if (status) status.textContent = 'Report je uložený ve frontě a odešle se automaticky, až bude online spojení.';
    } else if (result && result.ok) {
      updateLocalBugReportRecord(report.id, { uploadedOnline: true, adminDeleted: true, status: 'sent', adminStatus: 'sent' });
      if (status) status.textContent = 'Díky, report je odeslaný.';
      const textEl = document.getElementById('bugReportText');
      if (textEl) textEl.value = '';
    } else {
      saveBugReportLocal(Object.assign({}, report, { pendingOnline: true }));
      if (status) status.textContent = 'Report jsem uložil v appce. Online odeslání se nepovedlo, zkus to prosím později.';
    }
  } catch (err) {
    console.warn('Bug report submit failed', err);
    saveBugReportLocal(Object.assign({}, report, { pendingOnline: true, error: String(err && err.message ? err.message : err || '') }));
    if (status) status.textContent = 'Report jsem uložil v appce. Online odeslání se nepovedlo, zkus to prosím později.';
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}




// RaK 1.2 (1.155) – Plovoucí odebrání a údržba editoru rozpisů jsou oddělené v admin-rotation.js.

function appMenuAdminModeSet() {
  return new Set([
    'home',
    'machines',
    'food',
    'vacation',
    'special-days',
    'rotation',
    'overtime',
    'generator-settings',
    'monthly-workflow',
    'handover',
    'manual',
    'settings-map',
    'admin-accounts',
    'external-links',
    'app-contact',
    'payroll-settings',
    'backups',
    'announcement',
    'usage',
    'export',
    'reports',
    'service'
  ]);
}

function appMenuIsAdminInteraction(target, menuAction, adminAction, adminMonthKey, adminYearKey) {
  if (/^admin-/.test(String(menuAction || '').trim())) return true;
  if (adminAction || adminMonthKey || adminYearKey) return true;
  if (!target) return false;
  if (target.hasAttribute && (target.hasAttribute('data-admin-clear-field') || target.hasAttribute('data-admin-selected-remove'))) return true;
  return !!(target.matches && target.matches('[data-rot-field], [data-note-field]'));
}

function appMenuCanRunAdminInteraction(currentView) {
  const view = String(currentView || '').trim();
  return appMenuAdminModeSet().has(view)
    && typeof rakAdminCanOpenAdmin === 'function'
    && rakAdminCanOpenAdmin();
}

function bindAppMenuHandlers(body) {
  if (!body || body.dataset.menuHandlersBound === '1') return;
  body.dataset.menuHandlersBound = '1';
  adminBindRotationZoomGuard();

  body.addEventListener('focusin', (event) => {
    const target = event.target;
    if (target && target.matches && target.matches('[data-rot-field^="cell-"], [data-note-field="person"]')) adminShowRotationSelectedRemove(target);
    else adminHideRotationSelectedRemove();
  }, true);
  body.addEventListener('input', (event) => {
    const target = event.target;
    if (target && target.matches && target.matches('[data-rot-field^="cell-"], [data-note-field="person"]')) adminShowRotationSelectedRemove(target);
    if (target && target.matches && target.matches('[data-rotation-overtime-date]') && typeof adminRotationRefreshOvertimeShiftBadges === 'function') {
      adminRotationRefreshOvertimeShiftBadges(body, false);
    }
    if (target && target.matches && target.matches('[data-rotation-overtime-note]') && typeof adminRotationRefreshOvertimeStatus === 'function') {
      adminRotationRefreshOvertimeStatus(body);
    }
    if (target && target.matches && target.matches('[data-vacation-field]') && typeof adminVacationRefreshStatus === 'function') {
      adminVacationRefreshStatus(body);
    }
    if (target && target.matches && target.matches('[data-food-schedule-field]') && typeof adminFoodRefreshStatus === 'function') {
      adminFoodRefreshStatus(body);
    }
    if (target && target.matches && target.matches('[data-special-day-field]') && typeof adminSpecialDaysRefreshStatus === 'function') {
      adminSpecialDaysRefreshStatus(body);
    }
    if (target && target.matches && target.matches('[data-machine-field], [data-fhb-target-field]') && typeof adminMachineRefreshStatus === 'function') {
      adminMachineRefreshStatus(body);
    }
    if (target && target.matches && target.matches('[data-external-link-field]') && typeof adminExternalLinksRefreshStatus === 'function') {
      adminExternalLinksRefreshStatus(body);
    }
    if (target && target.matches && target.matches('[data-app-contact-field]') && typeof adminAppContactRefreshStatus === 'function') {
      adminAppContactRefreshStatus(body);
    }
    if (target && target.matches && target.matches('#adminPayrollWorkdayOrdinal, [data-payroll-override-field]') && typeof adminPayrollRefreshStatus === 'function') {
      adminPayrollRefreshStatus(body);
    }
    if (target && target.matches && target.matches('#adminAnnouncementTitle, #adminAnnouncementMessage, #adminAnnouncementStart, #adminAnnouncementEnd') && typeof adminAnnouncementRefreshStatus === 'function') {
      adminAnnouncementRefreshStatus(body);
    }
    if (target && target.matches && target.matches('[data-admin-account-field]') && typeof adminAccountsRefreshStatus === 'function') {
      adminAccountsRefreshStatus(body);
    }
    if (target && target.matches && target.matches('[data-generator-settings-field]') && typeof adminRotationRefreshGeneratorSettingsStatus === 'function') {
      adminRotationRefreshGeneratorSettingsStatus(body);
    }
  }, true);

  body.addEventListener('change', (event) => {
    const target = event.target;
    if (!target || typeof target.matches !== 'function') return;
    if (target.matches('#rakRotationExcelExportMonth, #rakExcelImportScope, #rakExcelImportDetectedMonth')) {
      renderAdminExportImportStatus();
    }
    if (target.matches('[data-rotation-overtime-to]') && typeof adminRotationRefreshOvertimeStatus === 'function') {
      adminRotationRefreshOvertimeStatus(body);
    }
    if (target.matches('[data-vacation-field]') && typeof adminVacationRefreshStatus === 'function') {
      adminVacationRefreshStatus(body);
    }
    if (target.matches('[data-food-schedule-field]') && typeof adminFoodRefreshStatus === 'function') {
      adminFoodRefreshStatus(body);
    }
    if (target.matches('[data-special-day-field]') && typeof adminSpecialDaysRefreshStatus === 'function') {
      adminSpecialDaysRefreshStatus(body);
    }
    if (target.matches('[data-machine-field], [data-fhb-target-field]') && typeof adminMachineRefreshStatus === 'function') {
      adminMachineRefreshStatus(body);
    }
    if (target.matches('[data-external-link-field]') && typeof adminExternalLinksRefreshStatus === 'function') {
      adminExternalLinksRefreshStatus(body);
    }
    if (target.matches('[data-app-contact-field]') && typeof adminAppContactRefreshStatus === 'function') {
      adminAppContactRefreshStatus(body);
    }
    if (target.matches('[data-admin-account-field]') && typeof adminAccountsRefreshStatus === 'function') {
      adminAccountsRefreshStatus(body);
    }
    if (target.matches('[data-generator-settings-field]') && typeof adminRotationRefreshGeneratorSettingsStatus === 'function') {
      adminRotationRefreshGeneratorSettingsStatus(body);
    }
    if (target.matches('#adminPayrollWorkdayOrdinal, [data-payroll-override-field]') && typeof adminPayrollRefreshStatus === 'function') {
      adminPayrollRefreshStatus(body);
    }
    if (target.matches('#adminAnnouncementTitle, #adminAnnouncementMessage, #adminAnnouncementStart, #adminAnnouncementEnd, #adminAnnouncementActive, #adminAnnouncementMarquee') && typeof adminAnnouncementRefreshStatus === 'function') {
      adminAnnouncementRefreshStatus(body);
    }
  }, true);

  body.addEventListener('click', async (event) => {
    const target = event.target && typeof event.target.closest === 'function'
      ? event.target.closest('[data-menu-action], [data-admin-action], [data-admin-month-key], [data-admin-year-key], [data-admin-clear-field], [data-admin-selected-remove], [data-ui-pref], [data-ui-reset], [data-menu-back], [data-rot-field], [data-note-field]')
      : null;
    if (!target || !body.contains(target)) return;

    const menuAction = target.getAttribute('data-menu-action');
    const adminAction = target.getAttribute('data-admin-action');
    const uiPref = target.getAttribute('data-ui-pref');
    const uiReset = target.hasAttribute('data-ui-reset');
    const menuBack = target.getAttribute('data-menu-back');
    const currentView = String(body.dataset.adminView || '');
    const select = body.querySelector('#adminMonthSelect');
    const monthKey = select ? select.value : getAdminSelectedMonthKey();
    const adminMonthKey = target.getAttribute('data-admin-month-key');
    const adminYearKey = target.getAttribute('data-admin-year-key');

    try {
      if (appMenuIsAdminInteraction(target, menuAction, adminAction, adminMonthKey, adminYearKey) && !appMenuCanRunAdminInteraction(currentView)) {
        event.preventDefault();
        openAppMenu('menu');
        return;
      }

      if (target.hasAttribute('data-admin-selected-remove')) {
        event.preventDefault();
        adminRemoveSelectedRotationName();
        return;
      }

      if (menuBack) {
        openAppMenu('menu');
        return;
      }

      if (target.matches && target.matches('[data-rot-field], [data-note-field]')) {
        if (target.matches('[data-note-field="code"]')) {
          adminHideRotationSelectedRemove();
          adminCloseRotationQuickRemove();
          adminShowAbsenceCodePicker(target);
        } else if (target.matches('[data-rot-field^="cell-"], [data-note-field="person"]')) {
          adminCloseAbsenceCodePicker();
          adminShowRotationSelectedRemove(target);
          adminShowRotationQuickRemove(target);
        } else {
          adminHideRotationSelectedRemove();
          adminCloseAbsenceCodePicker();
        }
        return;
      }

      if (menuAction === 'import' || adminAction === 'import' || adminAction === 'excel-pick') {
        startMenuImport();
        return;
      }
      if (adminAction === 'excel-import') {
        document.getElementById('importBtn')?.click();
        return;
      }
      if (adminAction === 'admin-download-rotation-excel') {
        const exportMonthEl = document.getElementById('rakRotationExcelExportMonth');
        const exportMonthKey = String((exportMonthEl && exportMonthEl.value) || app.selectedMonth || '').trim();
        if (!exportMonthKey) {
          alert('Nejdřív vyber měsíc pro Excel export rozpisu.');
          return;
        }
        app.selectedMonth = exportMonthKey;
        if (typeof adminRotationGeneratorDownloadExcel === 'function') {
          adminRotationGeneratorDownloadExcel(exportMonthKey);
        } else {
          alert('Excel export rozpisu není dostupný. Zkus aplikaci obnovit.');
        }
        return;
      }
      if (adminAction === 'download-admin-manual') {
        downloadAdminManualText();
        return;
      }
      if (adminAction === 'download-monthly-workflow') {
        downloadAdminMonthlyWorkflowText();
        return;
      }
      if (adminAction === 'download-handover-status') {
        downloadAdminHandoverStatusText();
        return;
      }
      if (adminAction === 'download-handover-todo') {
        downloadAdminHandoverTodoText();
        return;
      }
      if (adminAction === 'download-handover-package') {
        downloadAdminHandoverPackageText();
        return;
      }
      if (adminAction === 'download-settings-map') {
        downloadAdminSettingsMapText();
        return;
      }
      if (menuAction === 'export' || adminAction === 'export') {
        if (typeof triggerRakZipExport === 'function') {
          await triggerRakZipExport();
        } else if (typeof exportCurrentHtml === 'function') {
          await exportCurrentHtml();
        } else {
          document.getElementById('exportBtn')?.click();
        }
        return;
      }
      if (menuAction === 'settings') {
        openAppMenu('settings');
        return;
      }
      if (menuAction === 'about') {
        triggerAboutAction();
        return;
      }
      if (menuAction === 'contact') {
        openAppMenu('contact');
        return;
      }
      if (menuAction === 'bug-report') {
        openAppMenu('bug-report');
        return;
      }
      if (menuAction === 'bug-report-submit') {
        await handleBugReportAction(menuAction);
        return;
      }
      if (menuAction === 'admin') {
        if (!(typeof rakAdminCanOpenAdmin === 'function' && rakAdminCanOpenAdmin())) {
          openAppMenu('menu');
          return;
        }
        openAppMenu('admin');
        return;
      }
      if (menuAction === 'admin-machines') {
        openAppMenu('admin-machines');
        return;
      }
      if (menuAction === 'admin-rotation') {
        openAppMenu('admin-rotation');
        return;
      }
      if (adminYearKey) {
        const parsedYear = parseInt(adminYearKey, 10);
        if (Number.isFinite(parsedYear)) {
          app.selectedYear = parsedYear;
          const monthsForYear = typeof getMonthsForYear === 'function' ? getMonthsForYear(app.rotation, parsedYear) : [];
          if (!app.selectedMonth || !monthsForYear.includes(app.selectedMonth)) {
            app.selectedMonth = monthsForYear[0] || app.selectedMonth || null;
          }
          renderAdminMenuBody(body, currentView);
        }
        return;
      }
      if (adminMonthKey) {
        if (select) select.value = adminMonthKey;
        app.selectedMonth = adminMonthKey;
        const parsedMonth = typeof parseMonthKey === 'function' ? parseMonthKey(adminMonthKey) : null;
        if (parsedMonth && Number.isFinite(parsedMonth.year)) app.selectedYear = parsedMonth.year;
        renderAdminMenuBody(body, currentView);
        return;
      }
      if (target.hasAttribute('data-admin-clear-field')) {
        const wrap = target.closest('.appMenuInlineFieldWrap');
        const input = wrap ? wrap.querySelector('input') : null;
        if (input) {
          input.value = '';
          const clearBtn = wrap ? wrap.querySelector('.appMenuInlineClearBtn') : null;
          if (clearBtn) clearBtn.remove();
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.focus();
        }
        return;
      }
      if (menuAction === 'admin-export') {
        openAppMenu('admin-export');
        return;
      }
      if (menuAction === 'admin-reports') {
        openAppMenu('admin-reports');
        return;
      }
      if (menuAction === 'device-performance-test') {
        const status = body.querySelector('#adminOnlineSaveStatus') || body.querySelector('.rakDevicePerfCard .smallText');
        if (status) status.textContent = 'Měřím plynulost… chvíli nehýbej obrazovkou.';
        try {
          const result = await runRakDevicePerformanceProbe({ durationMs: 950 });
          const msg = 'Měření hotové: skóre ' + String(result.score || 0) + '/100, ' + String(result.avgFps || '—') + ' FPS, doporučení ' + String(result.label || '—') + '.';
          alert(msg);
        } catch (err) {
          console.warn('Device performance test failed', err);
          alert('Měření se nepovedlo. Zkus to prosím znovu.');
        }
        openAppMenu('settings');
        return;
      }
      if (menuAction === 'device-performance-auto') {
        try {
          localStorage.removeItem(DEVICE_PERFORMANCE_PROBE_KEY);
          if (typeof clearLocalStorageJsonCache === 'function') clearLocalStorageJsonCache(DEVICE_PERFORMANCE_PROBE_KEY);
        } catch (err) {}
        const current = loadUiPrefs();
        applyUiPrefs(Object.assign({}, current, { lightweight: false, lightweightManual: false }));
        openAppMenu('settings');
        return;
      }
      if (menuAction === 'clear-cache') {
        if (!confirm('Vyčistit cache a tvrdě obnovit aplikaci?')) return;
        try {
          if ('caches' in window && typeof caches.keys === 'function') {
            const keys = await caches.keys();
            await Promise.all(keys.map((key) => caches.delete(key)));
          }
          if ('serviceWorker' in navigator && navigator.serviceWorker && typeof navigator.serviceWorker.getRegistrations === 'function') {
            const regs = await navigator.serviceWorker.getRegistrations();
            await Promise.all(regs.map((reg) => reg && reg.update ? reg.update().catch(() => {}) : Promise.resolve()));
          }
          alert('Cache byla vyčištěná. Appka se teď tvrdě obnoví.');
          window.location.reload();
        } catch (err) {
          console.error('Cache clear failed', err);
          alert('Cache se nepodařilo vymazat.');
        }
        return;
      }
      if (menuAction === 'app-diagnostics') {
        const lowEndInfo = typeof getLowEndDeviceInfo === 'function' ? getLowEndDeviceInfo() : { lowEnd: false, reasons: [], cores: 0, memory: null, isIOS: false, isAndroid: false, dpr: 1, width: 0, effectiveType: '' };
        const lowEndReason = lowEndInfo.lowEnd && lowEndInfo.reasons && lowEndInfo.reasons.length ? ' · důvod: ' + lowEndInfo.reasons.join(', ') : '';
        const lightweightManual = !!(app && app.uiPrefs && app.uiPrefs.lightweightManual);
        const deviceInfo = [
          lowEndInfo.cores ? (lowEndInfo.cores + ' jader') : 'jádra neznámá',
          lowEndInfo.memory ? (lowEndInfo.memory + ' GB RAM') : 'RAM nehlášena',
          lowEndInfo.width ? ('šířka ' + lowEndInfo.width + ' px') : '',
          lowEndInfo.dpr ? ('DPR ' + Math.round(lowEndInfo.dpr * 100) / 100) : '',
          lowEndInfo.effectiveType ? ('síť ' + lowEndInfo.effectiveType) : '',
          lowEndInfo.isIOS ? 'iOS/Safari' : (lowEndInfo.isAndroid ? 'Android' : '')
        ].filter(Boolean).join(' · ');
        const supabaseHardening = typeof window.getSupabaseHardeningStatus === 'function' ? window.getSupabaseHardeningStatus() : null;
        const supabaseGuard = supabaseHardening && supabaseHardening.guard ? supabaseHardening.guard : null;
        const gameStatsRpcSmoke = typeof window.getGameStatsRpcSmokeStatus === 'function' ? window.getGameStatsRpcSmokeStatus() : (supabaseHardening && supabaseHardening.gameStatsRpcSmoke ? supabaseHardening.gameStatsRpcSmoke : null);
        const gameUiRpcSmoke = typeof window.getGameUiRpcSmokeStatus === 'function' ? window.getGameUiRpcSmokeStatus() : (supabaseHardening && supabaseHardening.gameUiRpcSmoke ? supabaseHardening.gameUiRpcSmoke : null);
        const gameSessionRpcSmoke = typeof window.getGameSessionRpcSmokeStatus === 'function' ? window.getGameSessionRpcSmokeStatus() : (supabaseHardening && supabaseHardening.gameSessionRpcSmoke ? supabaseHardening.gameSessionRpcSmoke : null);
        const tttOnlineJoinHealth = typeof window.getTttOnlineJoinHealth === 'function' ? window.getTttOnlineJoinHealth() : null;
        const rpcHardeningStatus = supabaseHardening && supabaseHardening.rpcHardening ? supabaseHardening.rpcHardening : null;
        const supabaseSyncGuard = supabaseHardening && supabaseHardening.syncGuard ? supabaseHardening.syncGuard : null;
        const supabaseCacheGuard = supabaseHardening && supabaseHardening.cacheGuard ? supabaseHardening.cacheGuard : null;
        const supabasePerformanceHealth = typeof window.getSupabasePerformanceHealth === 'function' ? window.getSupabasePerformanceHealth() : (supabaseHardening && supabaseHardening.performanceHealth ? supabaseHardening.performanceHealth : null);
        const supabaseKeepaliveStatus = typeof window.getSupabaseKeepaliveStatus === 'function' ? window.getSupabaseKeepaliveStatus() : (supabaseHardening && supabaseHardening.keepaliveStatus ? supabaseHardening.keepaliveStatus : null);
        const supabaseStructureHealth = typeof window.getSupabaseStructureHealth === 'function' ? window.getSupabaseStructureHealth() : (supabaseHardening && supabaseHardening.structureHealth ? supabaseHardening.structureHealth : null);
        const supabasePolicyRiskHealth = typeof window.getSupabasePolicyRiskHealth === 'function' ? window.getSupabasePolicyRiskHealth() : (supabaseHardening && supabaseHardening.policyRiskHealth ? supabaseHardening.policyRiskHealth : null);
        const supabaseHardeningReadiness = typeof window.getSupabaseHardeningReadiness === 'function' ? window.getSupabaseHardeningReadiness() : (supabaseHardening && supabaseHardening.hardeningReadiness ? supabaseHardening.hardeningReadiness : null);
        const readRakDiag = (alias, fallbackGlobalName) => {
          try {
            if (window.RaK && window.RaK.diagnostics && typeof window.RaK.diagnostics.readWithFallback === 'function') {
              return window.RaK.diagnostics.readWithFallback(alias, fallbackGlobalName);
            }
          } catch (err) {}
          try {
            if (window.RaK && window.RaK.diagnostics && typeof window.RaK.diagnostics.read === 'function') {
              const result = window.RaK.diagnostics.read(alias);
              if (result) return result;
            }
          } catch (err) {}
          try {
            const fn = window[String(fallbackGlobalName || '')];
            return typeof fn === 'function' ? fn() : null;
          } catch (err) {
            return null;
          }
        };
        const releaseReadiness = readRakDiag('releaseReadiness', 'getRakReleaseReadinessHealth');
        const architectureBaseline = readRakDiag('architectureBaseline', 'getRakArchitectureBaselineHealth');
        const moduleReadiness = readRakDiag('health', 'getRakModuleReadinessHealth');
        const runtimeGuard = readRakDiag('runtimeGuard', 'getRakRuntimeGuardHealth');
        const storageSyncAudit = readRakDiag('storageSyncAudit', 'getRakStorageSyncAuditHealth');
        const storageSyncSmokeReport = readRakDiag('storageSyncSmokeReport', 'getRakStorageSyncSmokeReport');
        const storageManualCleanupGuard = readRakDiag('storageManualCleanupGuard', 'getRakStorageManualCleanupGuard');
        const storageSyncClosure = readRakDiag('storageSyncClosure', 'getRakStorageSyncClosureHealth');
        const supabaseClientQueueAudit = readRakDiag('supabaseClientQueueAudit', 'getRakSupabaseClientQueueAuditHealth');
        const supabaseQueueSmokeReport = readRakDiag('supabaseQueueSmokeReport', 'getRakSupabaseQueueSmokeReport');
        const supabaseQueueManualGuard = readRakDiag('supabaseQueueManualGuard', 'getRakSupabaseQueueManualGuard');
        const supabaseQueueClosure = readRakDiag('supabaseQueueClosure', 'getRakSupabaseQueueClosureHealth');
        const onlineGameContracts = readRakDiag('onlineGameContracts', 'getRakOnlineGameContractAuditHealth');
        const onlineGameContractSmoke = readRakDiag('onlineGameContractSmoke', 'getRakOnlineGameContractSmokeReport');
        const onlineGameContractClosure = readRakDiag('onlineGameContractClosure', 'getRakOnlineGameContractClosureHealth');
        const foodSundayGuard = readRakDiag('foodSundayGuard', 'getFoodScheduleSundayGuardHealth');
        const releaseOpsChecklist = readRakDiag('releaseOpsChecklist', 'getRakReleaseOpsChecklistHealth');
        const monitoringPlan = readRakDiag('monitoringPlan', 'getRakMonitoringPlanHealth');
        const rollbackPlaybook = readRakDiag('rollbackPlaybook', 'getRakRollbackPlaybookHealth');
        const releaseOpsClosure = readRakDiag('releaseOpsClosure', 'getRakReleaseOpsClosureHealth');
        const appSecPrivacySurface = readRakDiag('appSecPrivacySurface', 'getRakAppSecPrivacySurfaceHealth');
        const appSecPrivacyRisks = readRakDiag('appSecPrivacyRisks', 'getRakAppSecPrivacyRiskRegister');
        const appSecStorageKeys = readRakDiag('appSecStorageKeys', 'getRakAppSecStorageKeyClassificationHealth');
        const appSecDomSurface = readRakDiag('appSecDomSurface', 'getRakAppSecDomInjectionSurfaceHealth');
        const appSecCspSriPlan = readRakDiag('appSecCspSriPlan', 'getRakAppSecCspSriReportOnlyPlan');
        const appSecPrivacyClosure = readRakDiag('appSecPrivacyClosure', 'getRakAppSecPrivacyClosureHealth');
        const releaseGatePolicy = readRakDiag('releaseGatePolicy', 'getRakReleaseGatePolicy');
        const releaseGateMatrix = readRakDiag('releaseGateMatrix', 'getRakReleaseGateMatrixHealth');
        const releaseGateClosure = readRakDiag('releaseGateClosure', 'getRakReleaseGateClosureHealth');
        const domSafeHelperPolicy = readRakDiag('domSafeHelperPolicy', 'getRakDomSafeHelperPolicy');
        const domSecurityHardeningPlan = readRakDiag('domSecurityHardeningPlan', 'getRakDomSecurityHardeningPlan');
        const domSecurityHardeningClosure = readRakDiag('domSecurityHardeningClosure', 'getRakDomSecurityHardeningClosureHealth');
        const bootSequence = readRakDiag('bootSequence', 'getRakBootSequenceHealth');
        const namespaceHealth = readRakDiag('namespace', 'getRakNamespaceHealth');
        const namespaceReadOnlyMap = readRakDiag('namespaceReadOnlyMap', 'getRakNamespaceReadOnlyMapHealth');
        const exportReleaseTooling = readRakDiag('exportReleaseTooling', 'getRakExportReleaseToolingHealth');
        const exportSmokeReport = readRakDiag('exportSmokeReport', 'getRakExportSmokeReport');
        const domActionRegistry = readRakDiag('domActionRegistry', 'getRakDomActionRegistryHealth');
        const domActionSmokeReport = readRakDiag('domActionSmokeReport', 'getRakDomActionSmokeReport');
        const profileUiStatus = typeof window.getProfileUiSyncStatus === 'function' ? window.getProfileUiSyncStatus() : null;
        const profileUiGuard = profileUiStatus && profileUiStatus.guard ? profileUiStatus.guard : null;
        const dataOptStatus = typeof window.getDataOptimizationStatus === 'function' ? window.getDataOptimizationStatus() : null;
        const pwaStatus = typeof window.getPwaHardeningStatus === 'function' ? window.getPwaHardeningStatus() : null;
        const securityRenderStatus = typeof window.getSecurityRenderStatus === 'function' ? window.getSecurityRenderStatus() : null;
        const finalStabilizationStatus = typeof window.getFinalStabilizationStatus === 'function' ? window.getFinalStabilizationStatus() : null;
        const ladaPerformanceStatus = typeof window.getLadaPerformanceHealth === 'function' ? window.getLadaPerformanceHealth() : null;
        const devicePerformanceStatus = typeof window.getRakDevicePerformanceStatus === 'function' ? window.getRakDevicePerformanceStatus() : null;
        const gameEngineStatus = typeof window.getGameEngineBaselineHealth === 'function' ? window.getGameEngineBaselineHealth() : null;
        const securityRenderDiag = securityRenderStatus ? [
          'Security/render: fáze ' + String(securityRenderStatus.phasePercent || 0) + '% · escapované dynamické HTML ' + String(securityRenderStatus.escapedDynamicHtmlWrites || 0) + ' · text render ' + String(securityRenderStatus.guardedTextWrites || 0) + '/' + String(securityRenderStatus.guardedTextSkippedWrites || 0),
          'Security/render HTML: zápisy/skip/riziko ' + String(securityRenderStatus.guardedHtmlWrites || 0) + '/' + String(securityRenderStatus.guardedHtmlSkippedWrites || 0) + '/' + String(securityRenderStatus.riskyHtmlWrites || 0) + ' · poslední ' + String(securityRenderStatus.lastHtmlKey || '—') + ' / ' + String(securityRenderStatus.lastHtmlRisk || '—'),
          'Security/render URL: kontroly/blokace ' + String(securityRenderStatus.safeExternalUrlChecks || 0) + '/' + String(securityRenderStatus.safeExternalUrlBlocked || 0) + ' · allowlist ' + String(securityRenderStatus.safeExternalUrlAllowlistChecks || 0) + '/' + String(securityRenderStatus.safeExternalUrlAllowlistBlocked || 0) + ' · href ' + String(securityRenderStatus.safeExternalHrefWrites || 0) + '/' + String(securityRenderStatus.safeExternalHrefSkippedWrites || 0) + ' · poslední ' + String(securityRenderStatus.lastAllowedExternalUrlKey || securityRenderStatus.lastExternalUrlKey || '—'),
          'Security/render akce: kontroly/blokace ' + String(securityRenderStatus.delegatedActionChecks || 0) + '/' + String(securityRenderStatus.delegatedActionBlocked || 0) + ' · režim ' + String(securityRenderStatus.delegatedActionGuardMode || '—'),
          'Security/render poslední: HTML escape ' + String(securityRenderStatus.lastEscapedKey || '—') + ' · text ' + String(securityRenderStatus.lastTextKey || '—') + ' · safe DOM build/skip ' + String(securityRenderStatus.safeDomBuilds || 0) + '/' + String(securityRenderStatus.safeDomSkippedBuilds || 0) + ' / ' + String(securityRenderStatus.lastSafeDomKey || '—') + ' · replace/clear/fallback ' + String(securityRenderStatus.safeDomReplacements || 0) + '/' + String(securityRenderStatus.safeDomClears || 0) + '/' + String(securityRenderStatus.safeDomFallbackReplacements || 0)
        ] : [];
        const ladaPerformanceDiag = ladaPerformanceStatus ? [
          'Láďův režim výkon: ' + (ladaPerformanceStatus.ok ? 'OK' : 'kontrola') + ' · režim ' + String(ladaPerformanceStatus.mode || '—') + ' · profil ' + String(ladaPerformanceStatus.profileLevel || '—') + ' · aktivní ' + (ladaPerformanceStatus.active ? 'ano' : 'ne'),
          'Láďův režim efekty: DPR limit ' + String(ladaPerformanceStatus.dprLimit || '—') + ' · FPS brzda ' + String(ladaPerformanceStatus.frameMs || 0) + ' ms · resize ' + String(ladaPerformanceStatus.resizeThrottleMs || 0) + ' ms · max blur ' + String(ladaPerformanceStatus.maxBlurPx || 0) + 'px · animované vzorky ' + String(ladaPerformanceStatus.animatedSampleCount || 0) + ' · problémy ' + String((ladaPerformanceStatus.issues || []).length || 0)
        ] : [];
        const devicePerformanceDiag = devicePerformanceStatus ? [
          'Výkon zařízení: režim ' + String(devicePerformanceStatus.label || devicePerformanceStatus.mode || '—') + ' · doporučení ' + String(devicePerformanceStatus.recommendedProfile || '—') + ' · měření ' + (devicePerformanceStatus.probe ? (String(devicePerformanceStatus.probe.score || 0) + '/100, ' + String(devicePerformanceStatus.probe.avgFps || '—') + ' FPS') : 'není')
        ] : [];
        const gameEngineDiag = gameEngineStatus ? [
          'Herní engine: ' + (gameEngineStatus.ok ? 'OK' : 'kontrola') + ' · režim ' + String(gameEngineStatus.mode || '—') + ' · aktivní hra ' + String(gameEngineStatus.activeGame || '—') + ' · pauza ' + (gameEngineStatus.paused ? 'ano' : 'ne'),
          'Herní engine lifecycle: otevřeno/zavřeno ' + String(gameEngineStatus.openedCount || 0) + '/' + String(gameEngineStatus.closedCount || 0) + ' · pauza/resume ' + String(gameEngineStatus.pausedCount || 0) + '/' + String(gameEngineStatus.resumedCount || 0) + ' · stop loop ' + String(gameEngineStatus.loopStopRequests || 0) + ' · problémy ' + String((gameEngineStatus.issues || []).length || 0)
        ] : [];
        const tttOnlineJoinDiag = tttOnlineJoinHealth ? [
          'Piškvorky online join: ' + (tttOnlineJoinHealth.ok ? 'OK' : 'kontrola') + ' · link pokusy/OK ' + String(tttOnlineJoinHealth.linkAttempts || 0) + '/' + String(tttOnlineJoinHealth.linkSuccesses || 0) + ' · ruční pokusy/OK ' + String(tttOnlineJoinHealth.manualAttempts || 0) + '/' + String(tttOnlineJoinHealth.manualSuccesses || 0) + ' · chyby ' + String(tttOnlineJoinHealth.errors || 0),
          'Piškvorky online stav: režim ' + String(tttOnlineJoinHealth.activeMode || '—') + ' · role ' + String(tttOnlineJoinHealth.activeRole || '—') + ' · tah ' + String(tttOnlineJoinHealth.activeTurn || '—') + ' · může hrát teď ' + (tttOnlineJoinHealth.activeCanMoveNow ? 'ano' : 'ne') + ' · opravy role ' + String(tttOnlineJoinHealth.roleRepairs || 0) + ' · blokované tahy ' + String(tttOnlineJoinHealth.moveBlocks || 0) + ' · problémy ' + String((tttOnlineJoinHealth.issues || []).length || 0)
        ] : [];
        const finalStabilizationDiag = finalStabilizationStatus ? [
          'Finální stabilizace: fáze ' + String(finalStabilizationStatus.phasePercent || 0) + '% · audit ' + (finalStabilizationStatus.lastAuditOk ? 'OK' : 'kontrola') + ' · běhy ' + String(finalStabilizationStatus.audits || 0) + ' · chybí ' + String(finalStabilizationStatus.lastMissingCount || 0),
          'Finální stabilizace stav: verze ' + String(finalStabilizationStatus.lastVersion || '—') + ' · stránka ' + String(finalStabilizationStatus.lastPage || '—') + ' · F9 ' + String(finalStabilizationStatus.lastPhase9Percent || 0) + '% · PWA mismatch ' + (finalStabilizationStatus.lastPwaVersionMismatch ? 'ano' : 'ne'),
          'Finální stabilizace DOM/log: duplicitní ID ' + String(finalStabilizationStatus.lastDuplicateIdCount || 0) + ' · error log ' + String(finalStabilizationStatus.lastErrorLogCount || 0),
          'Finální stabilizace storage: localStorage ' + (finalStabilizationStatus.lastStorageOk ? 'OK' : 'kontrola') + ' · položky ' + String(finalStabilizationStatus.lastStorageItemCount || 0) + ' · velké klíče ' + String(finalStabilizationStatus.lastLargeStorageKeyCount || 0) + ' · online ' + (finalStabilizationStatus.lastNavigatorOnline === false ? 'ne' : 'ano'),
          'Finální stabilizace moduly: načtení ' + (finalStabilizationStatus.lastScriptHealthOk ? 'OK' : 'kontrola') + ' · chybí ' + String(finalStabilizationStatus.lastScriptMissingCount || 0) + ' · duplicity ' + String(finalStabilizationStatus.lastScriptDuplicateCount || 0) + ' · navíc ' + String(finalStabilizationStatus.lastScriptUnexpectedCount || 0),
          'Finální stabilizace navigace: ' + (finalStabilizationStatus.lastNavigationHealthOk ? 'OK' : 'kontrola') + ' · tlačítka ' + String(finalStabilizationStatus.lastNavigationButtonCount || 0) + ' · aktivní ' + String(finalStabilizationStatus.lastNavigationActiveCount || 0) + ' · chybí ' + String(finalStabilizationStatus.lastNavigationMissingCount || 0),
          'Finální stabilizace stránky: ' + (finalStabilizationStatus.lastPageShellHealthOk ? 'OK' : 'kontrola') + ' · stránky ' + String(finalStabilizationStatus.lastPageShellPageCount || 0) + ' · aktivní ' + String(finalStabilizationStatus.lastPageShellActiveCount || 0) + ' · panely ' + String(finalStabilizationStatus.lastPageShellCriticalPanelCount || 0) + ' · chybí ' + String(finalStabilizationStatus.lastPageShellMissingCount || 0),
          'Finální stabilizace akce/odkazy: ' + (finalStabilizationStatus.lastActionHealthOk ? 'OK' : 'kontrola') + ' · akce ' + String(finalStabilizationStatus.lastActionCount || 0) + ' · neznámé ' + String(finalStabilizationStatus.lastActionUnknownCount || 0) + ' · chybí ' + String(finalStabilizationStatus.lastActionRequiredMissingCount || 0) + ' · cíle ' + String(finalStabilizationStatus.lastActionMissingTargetsCount || 0) + ' · odkazy ' + String(finalStabilizationStatus.lastActionLinkIssueCount || 0),
          'Finální stabilizace formuláře: ' + (finalStabilizationStatus.lastFormHealthOk ? 'OK' : 'kontrola') + ' · inputy ' + String(finalStabilizationStatus.lastFormInputCount || 0) + ' · selecty ' + String(finalStabilizationStatus.lastFormSelectCount || 0) + ' · tlačítka ' + String(finalStabilizationStatus.lastFormButtonCount || 0) + ' · chybí ' + String((finalStabilizationStatus.lastFormRequiredMissingCount || 0) + (finalStabilizationStatus.lastFormActionMissingCount || 0)) + ' · čísla ' + String(finalStabilizationStatus.lastFormInvalidNumberCount || 0),
          'Finální stabilizace připravenost: ' + (finalStabilizationStatus.lastRuntimeReadinessOk ? 'OK' : 'kontrola') + ' · splněno ' + String(finalStabilizationStatus.lastRuntimeReadinessPassedCount || 0) + '/' + String(finalStabilizationStatus.lastRuntimeReadinessTotalCount || 0) + ' · body ke kontrole ' + String((finalStabilizationStatus.lastRuntimeReadinessFailedItems || []).length || 0),
          'Supabase struktura: ' + (finalStabilizationStatus.lastSupabaseStructureOk ? 'OK' : 'kontrola') + ' · tabulky ' + String(finalStabilizationStatus.lastSupabaseStructureTableCount || 0) + ' · problémy ' + String(finalStabilizationStatus.lastSupabaseStructureIssueCount || 0) + ' · režim ' + String(finalStabilizationStatus.lastSupabaseStructureMode || '—'),
          'Herní engine základ: ' + (finalStabilizationStatus.lastGameEngineHealthOk ? 'OK' : 'kontrola') + ' · režim ' + String(finalStabilizationStatus.lastGameEngineMode || '—') + ' · aktivní ' + String(finalStabilizationStatus.lastGameEngineActiveGame || '—') + ' · lifecycle ' + String(finalStabilizationStatus.lastGameEngineLifecycleEvents || 0) + ' · problémy ' + String(finalStabilizationStatus.lastGameEngineIssueCount || 0),
          'Post-stabilizace helpery: ' + (finalStabilizationStatus.lastSafeHelperHealthOk ? 'OK' : 'kontrola') + ' · helpery ' + String(finalStabilizationStatus.lastSafeHelperCount || 0) + ' · chybí ' + String(finalStabilizationStatus.lastSafeHelperMissingCount || 0),
          'Post-stabilizace: ' + (finalStabilizationStatus.lastPostStabilizationOk ? 'OK' : 'kontrola') + ' · režim ' + String(finalStabilizationStatus.lastPostStabilizationMode || '—') + ' · body ke kontrole ' + String(finalStabilizationStatus.lastPostStabilizationIssueCount || 0)
        ] : [];
        const architectureDiag = architectureBaseline ? [
          'Architektura/boot: ' + (architectureBaseline.ok ? 'OK' : 'kontrola') + ' · režim ' + String(architectureBaseline.mode || '—') + ' · skripty ' + String(architectureBaseline.scriptCount || 0) + ' · styly ' + String(architectureBaseline.stylesheetCount || 0) + ' · data-action ' + String(architectureBaseline.dataActionCount || 0),
          'Architektura coupling: chybějící globály ' + String((architectureBaseline.missingGlobals || []).length || 0) + ' · duplicitní ID ' + String(architectureBaseline.duplicateIdCount || 0) + ' · warningy ' + String(architectureBaseline.warningCount || 0),
          moduleReadiness ? ('Module readiness: ' + (moduleReadiness.ok ? 'OK' : 'kontrola') + ' · načteno ' + String(moduleReadiness.loadedCount || 0) + '/' + String(moduleReadiness.expectedCount || 0) + ' · chyby ' + String(moduleReadiness.errorCount || 0) + ' · chybí ' + String(moduleReadiness.missingCount || 0) + ' · boot ' + String(moduleReadiness.bootDurationMs || 0) + ' ms') : '',
          bootSequence ? ('Boot sekvence: ' + (bootSequence.ok ? 'OK' : 'kontrola') + ' · statická ' + (bootSequence.staticOrderOk ? 'OK' : 'kontrola') + ' · dynamická ' + (bootSequence.dynamicOrderOk ? 'OK' : 'kontrola') + ' · chybí ' + String(bootSequence.dynamicMissingCount || 0)) : '',
          namespaceHealth ? ('RaK namespace: ' + (namespaceHealth.ok ? 'OK' : 'kontrola') + ' · režim ' + String(namespaceHealth.mode || '—') + ' · mapa ' + String(namespaceHealth.namespaceMapCount || 0) + ' · fáze ' + String(namespaceHealth.refactorProgressPercent || 0) + '% · mapa uzavřená ' + (namespaceHealth.namespaceMapClosed ? 'ano' : 'ne') + ' · warningy ' + String(namespaceHealth.warningCount || 0)) : '',
          namespaceReadOnlyMap ? ('RaK namespace fallbacky: ' + (namespaceReadOnlyMap.ok ? 'OK' : 'kontrola') + ' · read-only aliasy ' + String(namespaceReadOnlyMap.safeNowCount || 0) + ' · runtime ' + String(namespaceReadOnlyMap.runtimeAliasCount || 0) + ' · chybí čtečky ' + String(namespaceReadOnlyMap.missingReaderCount || 0) + ' · rizikové mutace ' + String(namespaceReadOnlyMap.mutatingRiskCount || 0)) : '',
          runtimeGuard ? ('Runtime health: ' + (runtimeGuard.ok ? 'OK' : 'kontrola') + ' · warningy ' + String(runtimeGuard.warningCount || 0) + ' · storage ' + (runtimeGuard.storage && runtimeGuard.storage.writable ? 'OK' : 'kontrola') + ' · budoucí měsíce ' + String(runtimeGuard.statsScope && runtimeGuard.statsScope.futureImportedMonthCount || 0)) : '',
          storageSyncAudit ? ('Storage/sync audit: ' + (storageSyncAudit.ok ? 'OK' : 'kontrola') + ' · položky ' + String(storageSyncAudit.storage && storageSyncAudit.storage.itemCount || 0) + ' · JSON chyby ' + String(storageSyncAudit.storage && storageSyncAudit.storage.invalidJsonCount || 0) + ' · velké klíče ' + String(storageSyncAudit.storage && storageSyncAudit.storage.largeKeyCount || 0) + ' · kandidáti úklidu ' + String(storageSyncAudit.staleCleanupCandidateCount || 0) + ' · offline/sync klíče ' + String(storageSyncAudit.storage && storageSyncAudit.storage.offlineSyncKeyCount || 0) + ' · fáze ' + String(storageSyncAudit.phasePercent || 0) + '%') : '',
          storageSyncSmokeReport ? ('Storage/sync smoke: ' + (storageSyncSmokeReport.ok === true ? 'OK' : (storageSyncSmokeReport.ok === false ? 'kontrola' : 'zatím neběžel')) + ' · stav ' + String(storageSyncSmokeReport.status || '—') + ' · běhy ' + String(storageSyncSmokeReport.runCount || 0) + ' · kandidáti ' + String(storageSyncSmokeReport.cleanupCandidateCount || 0) + ' · JSON chyby ' + String(storageSyncSmokeReport.invalidJsonCount || 0) + ' · guard ' + (storageSyncSmokeReport.manualGuardReady ? 'OK' : 'kontrola')) : '',
          storageManualCleanupGuard ? ('Storage cleanup guard: ruční režim ' + (storageManualCleanupGuard.manualOnly ? 'OK' : 'kontrola') + ' · auto mazání ' + (storageManualCleanupGuard.autoCleanupEnabled ? 'zapnuto' : 'vypnuto') + ' · kandidáti ' + String(storageManualCleanupGuard.candidateCount || 0) + ' · ruční kontrola ' + (storageManualCleanupGuard.requiresHumanReview ? 'ano' : 'ne')) : '',
          storageSyncClosure ? ('Storage/sync closure: ' + (storageSyncClosure.ok ? 'OK' : 'kontrola') + ' · fáze ' + String(storageSyncClosure.phasePercent || 0) + '% · kandidáti ' + String(storageSyncClosure.candidateCount || 0) + ' · auto mazání ' + (storageSyncClosure.autoCleanupEnabled ? 'zapnuto' : 'vypnuto')) : '',
          supabaseClientQueueAudit ? ('Supabase client/queue: ' + (supabaseClientQueueAudit.ok ? 'OK' : 'kontrola') + ' · fronta ' + String(supabaseClientQueueAudit.queueLength || 0) + '/' + String(supabaseClientQueueAudit.queueMaxItems || '—') + ' · stale ' + String(supabaseClientQueueAudit.queueStaleTaskCount || 0) + ' · realtime ' + String(supabaseClientQueueAudit.realtimeStatus || '—') + ' · fáze ' + String(supabaseClientQueueAudit.phasePercent || 0) + '%') : '',
          supabaseQueueSmokeReport ? ('Supabase queue smoke: ' + (supabaseQueueSmokeReport.ok === true ? 'OK' : (supabaseQueueSmokeReport.ok === false ? 'kontrola' : 'zatím neběžel')) + ' · stav ' + String(supabaseQueueSmokeReport.status || '—') + ' · fronta ' + String(supabaseQueueSmokeReport.queueLength || 0) + ' · stale ' + String(supabaseQueueSmokeReport.staleTaskCount || 0) + ' · guard ' + (supabaseQueueSmokeReport.manualGuardReady ? 'OK' : 'kontrola') + ' · online ' + (supabaseQueueSmokeReport.online ? 'ano' : 'ne')) : '',
          supabaseQueueManualGuard ? ('Supabase queue guard: ' + (supabaseQueueManualGuard.ok ? 'OK' : 'kontrola') + ' · auto flush ' + (supabaseQueueManualGuard.autoFlushEnabled ? 'zapnuto' : 'vypnuto') + ' · auto mazání ' + (supabaseQueueManualGuard.autoDeleteEnabled ? 'zapnuto' : 'vypnuto') + ' · fronta ' + String(supabaseQueueManualGuard.queueLength || 0)) : '',
          supabaseQueueClosure ? ('Supabase queue closure: ' + (supabaseQueueClosure.ok ? 'OK' : 'kontrola') + ' · fáze ' + String(supabaseQueueClosure.phasePercent || 0) + '% · auto flush ' + (supabaseQueueClosure.autoFlushEnabled ? 'zapnuto' : 'vypnuto') + ' · DB změny ' + (supabaseQueueClosure.dbMutations ? 'ano' : 'ne') + ' · policies ' + (supabaseQueueClosure.policyChanges ? 'ano' : 'ne')) : '',
          onlineGameContracts ? ('Online hry kontrakty: ' + (onlineGameContracts.ok ? 'OK' : 'kontrola') + ' · fáze ' + String(onlineGameContracts.phasePercent || 0) + '% · bridge ' + (onlineGameContracts.bridgeMethodsReady ? 'OK' : 'kontrola') + ' · c/a/s ' + String(onlineGameContracts.gameCoverageText || '—') + ' · fallback ' + String(onlineGameContracts.fallbackCount || 0)) : '',
          onlineGameContractSmoke ? ('Online hry smoke: ' + (onlineGameContractSmoke.ok ? 'OK' : 'kontrola') + ' · pokusy/OK/fallback ' + String(onlineGameContractSmoke.attempts || 0) + '/' + String(onlineGameContractSmoke.successes || 0) + '/' + String(onlineGameContractSmoke.fallbackCount || 0) + ' · policies ' + (onlineGameContractSmoke.readyForPolicyTightening ? 'lze zvažovat' : 'neutahovat')) : '',
          onlineGameContractClosure ? ('Online hry closure: ' + (onlineGameContractClosure.ok ? 'OK' : 'kontrola') + ' · fáze ' + String(onlineGameContractClosure.phasePercent || 0) + '% · policies ' + (onlineGameContractClosure.policyChangeAllowedNow ? 'lze' : 'neutahovat') + ' · warningy ' + String(onlineGameContractClosure.warningCount || 0)) : '',
          foodSundayGuard ? ('Kantýna/jídelna neděle: ' + (foodSundayGuard.ok ? 'OK' : 'kontrola') + ' · přesčasových nedělí ' + String(foodSundayGuard.overtimeSundayCount || 0) + ' · běžná neděle = normální rozpis ' + (foodSundayGuard.rows && foodSundayGuard.rows.every ? (foodSundayGuard.rows.every((row) => row.plainMatchesRegular) ? 'ano' : 'ne') : '—')) : '',
          releaseOpsChecklist ? ('Release ops checklist: ' + (releaseOpsChecklist.ok ? 'OK' : 'kontrola') + ' · gate ' + String(releaseOpsChecklist.gateCount || 0) + ' · blockery ' + String(releaseOpsChecklist.blockerCount || 0) + ' · ruční kontroly ' + String(releaseOpsChecklist.manualCount || 0) + ' · ZIP ' + (releaseOpsChecklist.readyForZip ? 'ano' : 'ne')) : '',
          monitoringPlan ? ('Monitoring mapa: metriky ' + String(monitoringPlan.metricCount || 0) + ' · alerty ' + String((monitoringPlan.alertRules || []).length || 0) + ' · režim ' + String(monitoringPlan.mode || '—')) : '',
          rollbackPlaybook ? ('Rollback playbook: kroky ' + String((rollbackPlaybook.steps || []).length || 0) + ' · pravidla ' + String((rollbackPlaybook.decisionRules || []).length || 0) + ' · artefakt ' + String(rollbackPlaybook.rollbackArtifactRule || '—')) : '',
          releaseOpsClosure ? ('Release ops closure: ' + (releaseOpsClosure.ok ? 'OK' : 'kontrola') + ' · fáze ' + String(releaseOpsClosure.phasePercent || 0) + '% · monitoring ' + String(releaseOpsClosure.monitoringMetricCount || 0) + ' · rollback kroky ' + String(releaseOpsClosure.rollbackStepCount || 0)) : '',
          appSecPrivacySurface ? ('AppSec/privacy: ' + (appSecPrivacySurface.ok ? 'OK' : 'kontrola') + ' · CSP ' + (appSecPrivacySurface.cspMetaPresent ? 'ano' : 'ne') + ' · CDN skripty ' + String(appSecPrivacySurface.externalScriptCount || 0) + ' · bez SRI ' + String(appSecPrivacySurface.externalScriptsWithoutSri || 0) + ' · storage podezřelé ' + String(appSecPrivacySurface.storage && appSecPrivacySurface.storage.suspiciousKeyCount || 0) + ' · warningy ' + String(appSecPrivacySurface.warningCount || 0)) : '',
          appSecPrivacyRisks ? ('AppSec risk register: položky ' + String(appSecPrivacyRisks.itemCount || 0) + ' · P0 ' + String(appSecPrivacyRisks.p0Count || 0) + ' · P1 ' + String(appSecPrivacyRisks.p1Count || 0) + ' · P2 ' + String(appSecPrivacyRisks.p2Count || 0)) : '',
          appSecStorageKeys ? ('AppSec storage: klíče ' + String(appSecStorageKeys.classifiedKeyCount || 0) + ' · kategorie ' + String(appSecStorageKeys.categoryCount || 0) + ' · neznámé ' + String(appSecStorageKeys.unknownKeyCount || 0) + ' · podezřelé ' + String(appSecStorageKeys.suspiciousKeyCount || 0) + ' · hodnoty ' + String(appSecStorageKeys.valueInspectionMode || '—')) : '',
          appSecDomSurface ? ('AppSec DOM: sinky ' + String(appSecDomSurface.staticSinkCount || 0) + ' · innerHTML ' + String(appSecDomSurface.staticBySink && appSecDomSurface.staticBySink.innerHTML || 0) + ' · insertAdjacentHTML ' + String(appSecDomSurface.staticBySink && appSecDomSurface.staticBySink.insertAdjacentHTML || 0) + ' · target blank bez noopener ' + String(appSecDomSurface.targetBlankWithoutNoopener || 0)) : '',
          appSecCspSriPlan ? ('AppSec CSP/SRI: report-only ' + (appSecCspSriPlan.enforceNow ? 'ne' : 'ano') + ' · CDN skripty bez SRI ' + String(appSecCspSriPlan.externalScriptsWithoutSri || 0) + ' · rollout kroky ' + String((appSecCspSriPlan.rolloutSteps || []).length || 0)) : '',
          appSecPrivacyClosure ? ('AppSec closure: ' + (appSecPrivacyClosure.ok ? 'OK' : 'kontrola') + ' · fáze ' + String(appSecPrivacyClosure.phasePercent || 0) + '% · storage neznámé ' + String(appSecPrivacyClosure.storageUnknownKeyCount || 0) + ' · DOM sinky ' + String(appSecPrivacyClosure.domStaticSinkCount || 0)) : '',
          releaseGateMatrix ? ('Release gate matrix: ' + (releaseGateMatrix.ok ? 'OK' : 'blocker') + ' · gate ' + String(releaseGateMatrix.gateCount || 0) + ' · blockery ' + String(releaseGateMatrix.blockerCount || 0) + ' · warningy ' + String(releaseGateMatrix.warningCount || 0) + ' · ruční ' + String(releaseGateMatrix.manualCount || 0) + ' · ZIP ' + (releaseGateMatrix.readyForZip ? 'ano' : 'ne')) : '',
          releaseGateClosure ? ('Release gate closure: ' + (releaseGateClosure.ok ? 'OK' : 'kontrola') + ' · fáze ' + String(releaseGateClosure.phasePercent || 0) + '% · produkce ' + (releaseGateClosure.readyForProduction ? 'ano' : 'čeká na ruční smoke')) : '',
          releaseGatePolicy ? ('Release gate pravidla: statusy ' + String(releaseGatePolicy.policyStatusCount || (releaseGatePolicy.statuses || []).length || 0) + ' · mutace ' + String(releaseGatePolicy.mutationPolicy || 'read-only')) : '',
          domSecurityHardeningPlan ? ('DOM/security hardening: kandidáti ' + String(domSecurityHardeningPlan.candidateCount || 0) + ' · P1 review ' + String(domSecurityHardeningPlan.p1ReviewCount || 0) + ' · sinky ' + String(domSecurityHardeningPlan.staticSinkCount || 0)) : '',
          domSafeHelperPolicy ? ('DOM safe helper policy: helpery ' + String(domSafeHelperPolicy.helperCount || 0) + ' · režim ' + String(domSafeHelperPolicy.rule || 'read-only')) : '',
          domSecurityHardeningClosure ? ('DOM/security closure: ' + (domSecurityHardeningClosure.ok ? 'OK' : 'kontrola') + ' · fáze ' + String(domSecurityHardeningClosure.phasePercent || 0) + '% · render změny ' + (domSecurityHardeningClosure.renderChanges ? 'ano' : 'ne')) : '',
          exportReleaseTooling ? ('Export/release tooling: ' + (exportReleaseTooling.ok ? 'OK' : 'kontrola') + ' · source ID ' + String(exportReleaseTooling.sourceIdCount || 0) + ' · binární ' + String(exportReleaseTooling.binaryFileCount || 0) + ' · duplicit ' + String(exportReleaseTooling.duplicateBinaryCount || 0) + ' · warningy ' + String(exportReleaseTooling.warningCount || 0)) : '',
          exportSmokeReport ? ('Export smoke report: ' + (exportSmokeReport.ok === true ? 'OK' : (exportSmokeReport.ok === false ? 'kontrola' : 'zatím neběžel')) + ' · stav ' + String(exportSmokeReport.status || '—') + ' · text/bin ' + String(exportSmokeReport.checkedTextFileCount || 0) + '/' + String(exportSmokeReport.checkedBinaryFileCount || 0) + ' · chybí ' + String((exportSmokeReport.missingTextFileCount || 0) + (exportSmokeReport.missingBinaryFileCount || 0)) + ' · poslední ' + String(exportSmokeReport.lastStage || '—')) : '',
          domActionRegistry ? ('DOM/action registry: ' + (domActionRegistry.ok ? 'OK' : 'kontrola') + ' · akce ' + String(domActionRegistry.actionElementCount || 0) + ' · unikátní ' + String(domActionRegistry.uniqueActionCount || 0) + ' · kategorie ' + String(domActionRegistry.categoryCount || 0) + ' · target mapa ' + String(domActionRegistry.targetCoveragePercent || 0) + '% · target warningy ' + String(domActionRegistry.actionTargetWarningCount || 0) + ' · neznámé ' + String(domActionRegistry.unknownActionCount || 0) + ' · cíle ' + String(domActionRegistry.missingTargetCount || 0) + ' · warningy ' + String(domActionRegistry.warningCount || 0)) : '',
          domActionSmokeReport ? ('DOM/action smoke: ' + (domActionSmokeReport.ok === true ? 'OK' : (domActionSmokeReport.ok === false ? 'kontrola' : 'zatím neběžel')) + ' · stav ' + String(domActionSmokeReport.status || '—') + ' · běhy ' + String(domActionSmokeReport.runCount || 0) + ' · akce ' + String(domActionSmokeReport.actionElementCount || 0) + ' · target mapa ' + String(domActionSmokeReport.targetCoveragePercent || 0) + '% · problémy ' + String(domActionSmokeReport.issueCount || 0) + ' · warningy ' + String(domActionSmokeReport.warningCount || 0)) : ''
        ].filter(Boolean) : [];
        const pwaDiag = pwaStatus ? [
          'PWA/SW: fáze ' + String(pwaStatus.phasePercent || 0) + '% · controller ' + (pwaStatus.hasController ? 'ano' : 'ne') + ' · update toast ' + (pwaStatus.updateToastVisible ? 'viditelný' : 'ne') + ' · verze cache ' + (pwaStatus.swVersionMismatch ? 'nesedí' : 'sedí'),
          'PWA update check: běhy/skip/join ' + String(pwaStatus.updateChecks || 0) + '/' + String(pwaStatus.updateCheckSkips || 0) + '/' + String(pwaStatus.updateCheckJoins || 0) + ' · update volání ' + String(pwaStatus.registrationUpdates || 0) + ' · chyby ' + String(pwaStatus.registrationUpdateErrors || 0),
          'PWA zprávy SW: celkem/verze/aktivace/cache ' + String(pwaStatus.swMessages || 0) + '/' + String(pwaStatus.swVersionMessages || 0) + '/' + String(pwaStatus.swActivatedMessages || 0) + '/' + String(pwaStatus.swCacheStatusMessages || 0) + ' · poslední ' + String(pwaStatus.lastMessageType || '—'),
          'PWA cache: verze ' + String(pwaStatus.swCacheVersion || '—') + ' / oček. ' + String(pwaStatus.swExpectedCacheVersion || '—') + ' · mismatch ' + String(pwaStatus.swVersionMismatchCount || 0) + ' · update/skip ' + String(pwaStatus.swVersionMismatchUpdateChecks || 0) + '/' + String(pwaStatus.swVersionMismatchUpdateSkips || 0) + ' · static/runtime ' + String(pwaStatus.swStaticCacheEntries || 0) + '/' + String(pwaStatus.swRuntimeCacheEntries || 0) + ' · runtime trim ' + String(pwaStatus.swRuntimeTrimDeletedCount || 0) + '/' + String(pwaStatus.swRuntimeTrimBeforeCount || 0) + ' · staré RaK cache/smazáno ' + String(pwaStatus.swStaleRakCacheCount || 0) + '/' + String(pwaStatus.swStaleRakCacheDeletedCount || 0) + ' · precache OK/chyby/chybí ' + String(pwaStatus.swPrecacheSuccessCount || 0) + '/' + String(pwaStatus.swPrecacheFailedCount || 0) + '/' + String(pwaStatus.swPrecacheMissingCount || 0) + ' · požadavky/skip ' + String(pwaStatus.swCacheStatusRequests || 0) + '/' + String(pwaStatus.swCacheStatusRequestSkips || 0) + ' · klienti ' + String(pwaStatus.swClientsCount || 0) + ' · preload ' + (pwaStatus.swNavigationPreloadEnabled ? 'ano' : 'ne'),
          'PWA cache režim: lookup ' + String(pwaStatus.swCacheLookupMode || '—') + ' · ukládání ' + String(pwaStatus.swCacheableResponseMode || '—') + ' · trim ' + String(pwaStatus.swActivateRuntimeTrimMode || '—') + ' · síť fallback ' + String(pwaStatus.swNetworkTimeoutFallbackMode || '—') + ' (' + String(pwaStatus.swNetworkFallbackTimeoutMs || 0) + ' ms)' + ' · static timeout ' + String(pwaStatus.swStaticCacheFirstTimeoutMode || '—'),
          'PWA asset audit: ' + String(pwaStatus.pwaAssetAuditMode || '—') + ' · manifest ' + (pwaStatus.pwaAssetManifestOk ? 'OK' : 'kontrola') + ' · favicon ' + (pwaStatus.pwaAssetFaviconOk ? 'OK' : 'kontrola') + ' · apple ' + (pwaStatus.pwaAssetAppleTouchOk ? 'OK' : 'kontrola') + ' · SW ikony ' + String(pwaStatus.swAssetIconCount || 0) + '/' + String(pwaStatus.pwaAssetExpectedIconCount || 0) + ' · root odkazy ' + (pwaStatus.pwaAssetRootIconRefsBlocked && !Number(pwaStatus.swAssetLegacyRootIconCount || 0) ? 'žádné' : 'kontrola') + ' · ZIP ' + String(pwaStatus.swExportZipRootMode || '—'),
          'PWA dokončení: ' + String(pwaStatus.swPhase8CompletionMode || '—') + ' · připraveno ' + (pwaStatus.swPhase8Ready ? 'ano' : 'ne') + ' · app shell ' + String(pwaStatus.swAppShellCachedRatio || 0) + '%',
          releaseReadiness ? ('Release readiness: ' + (releaseReadiness.ok ? 'OK' : 'kontrola') + ' · verze ' + String(releaseReadiness.version || '—') + ' · CDN skripty ' + String(releaseReadiness.externalScriptCount || 0) + ' · export ' + String(releaseReadiness.exportSmokeReportStatus || '—') + ' · DOM ' + String(releaseReadiness.domActionSmokeReportStatus || '—') + ' · SQ ' + String(releaseReadiness.supabaseQueueSmokeReportStatus || '—') + ' · warningy ' + String(releaseReadiness.warningCount || 0)) : ''
        ] : [];
        const dataOptDiag = dataOptStatus ? [
          'Data opt: zápisy/skipy ' + String(dataOptStatus.localStorageWrites || 0) + '/' + String(dataOptStatus.localStorageSkippedWrites || 0) + ' · čtení/cache ' + String(dataOptStatus.localStorageReads || 0) + '/' + String(dataOptStatus.localStorageReadCacheHits || 0),
          'Data opt JSON: parse/cache ' + String(dataOptStatus.localStorageJsonParseReads || 0) + '/' + String(dataOptStatus.localStorageJsonParseCacheHits || 0) + ' · chyby ' + String(dataOptStatus.localStorageJsonParseErrors || 0),
          'Data opt cache: read/json ' + String(dataOptStatus.localReadCacheSize || 0) + '/' + String(dataOptStatus.localCacheMaxSize || 0) + ' · ' + String(dataOptStatus.localJsonCacheSize || 0) + '/' + String(dataOptStatus.localJsonCacheMaxSize || 0) + ' · úklid ' + String(dataOptStatus.localReadCachePrunes || 0) + '/' + String(dataOptStatus.localJsonCachePrunes || 0) + ' · ořez ' + String(dataOptStatus.localReadCacheTrimmedEntries || 0) + '/' + String(dataOptStatus.localJsonCacheTrimmedEntries || 0),
          'Data opt bajty: zapsáno/přeskočeno/přečteno ' + String(dataOptStatus.approxBytesWritten || 0) + '/' + String(dataOptStatus.approxBytesSkipped || 0) + '/' + String(dataOptStatus.approxBytesRead || 0),
          'Data opt home refresh: plán/sloučeno/běh ' + String(dataOptStatus.homeRefreshSchedules || 0) + '/' + String(dataOptStatus.homeRefreshCoalescedSchedules || 0) + '/' + String(dataOptStatus.homeRefreshRuns || 0) + ' · modaly skip ' + String(dataOptStatus.homeRefreshModalSkips || 0),
          'Data opt DOM HTML: zápisy/skipy ' + String(dataOptStatus.domHtmlWrites || 0) + '/' + String(dataOptStatus.domHtmlSkippedWrites || 0) + ' · chyby ' + String(dataOptStatus.domHtmlWriteErrors || 0) + ' · poslední ' + String(dataOptStatus.domHtmlLastKey || '—'),
          'Data opt DOM text/class: text ' + String(dataOptStatus.domTextWrites || 0) + '/' + String(dataOptStatus.domTextSkippedWrites || 0) + ' · class ' + String(dataOptStatus.domClassWrites || 0) + '/' + String(dataOptStatus.domClassSkippedWrites || 0) + ' · poslední ' + String(dataOptStatus.domTextLastKey || dataOptStatus.domClassLastKey || '—'),
          'Data opt DOM select: zápisy/skipy ' + String(dataOptStatus.domSelectWrites || 0) + '/' + String(dataOptStatus.domSelectSkippedWrites || 0) + ' · chyby ' + String(dataOptStatus.domSelectWriteErrors || 0) + ' · poslední ' + String(dataOptStatus.domSelectLastKey || '—'),
          'Data opt DOM toggle: zápisy/skipy ' + String(dataOptStatus.domToggleWrites || 0) + '/' + String(dataOptStatus.domToggleSkippedWrites || 0) + ' · chyby ' + String(dataOptStatus.domToggleWriteErrors || 0) + ' · poslední ' + String(dataOptStatus.domToggleLastKey || '—'),
          'Data opt DOM style: zápisy/skipy ' + String(dataOptStatus.domStyleWrites || 0) + '/' + String(dataOptStatus.domStyleSkippedWrites || 0) + ' · chyby ' + String(dataOptStatus.domStyleWriteErrors || 0) + ' · poslední ' + String(dataOptStatus.domStyleLastKey || '—')
        ] : [];
        const supabaseDiag = supabaseHardening ? [
          'Supabase fronta: ' + String(supabaseHardening.queueLength || 0) + ' / ' + String(supabaseHardening.queueMaxItems || '—'),
          'Supabase realtime: ' + String(supabaseHardening.realtimeStatus || '—'),
          supabaseKeepaliveStatus ? ('Supabase stav: ' + String(supabaseKeepaliveStatus.label || supabaseKeepaliveStatus.status || '—') + ' · poslední OK ' + String(supabaseKeepaliveStatus.lastSuccessAt || '—') + ' · poslední chyba ' + String(supabaseKeepaliveStatus.lastErrorMessage || '—')) : '',
          supabaseKeepaliveStatus ? ('Supabase heartbeat: tabulka ' + String(supabaseKeepaliveStatus.table || 'app_keepalive') + ' · interval ' + String(supabaseKeepaliveStatus.minIntervalHours || 12) + ' h · pokusy/OK/chyby/skip ' + String(supabaseKeepaliveStatus.attempts || 0) + '/' + String(supabaseKeepaliveStatus.successes || 0) + '/' + String(supabaseKeepaliveStatus.failures || 0) + '/' + String(supabaseKeepaliveStatus.skips || 0) + ' · důvod ' + String(supabaseKeepaliveStatus.lastReason || '—') + ' · typ ' + String(supabaseKeepaliveStatus.lastClassification || '—')) : '',
          supabasePerformanceHealth ? ('Supabase výkon: ' + (supabasePerformanceHealth.ok ? 'OK' : 'kontrola') + ' · refresh sloučeno/běh ' + String(supabasePerformanceHealth.realtimeRefreshCoalesced || 0) + '/' + String(supabasePerformanceHealth.realtimeRefreshRuns || 0) + ' · hidden odklad ' + String(supabasePerformanceHealth.realtimeRefreshHiddenDefers || 0) + ' · tabulek ' + String(supabasePerformanceHealth.realtimeTableCount || 0)) : '',
          supabasePerformanceHealth ? ('Supabase cache/realtime: cache hit/write ' + String(supabasePerformanceHealth.cacheHits || 0) + '/' + String(supabasePerformanceHealth.cacheWrites || 0) + ' · sdílené čtení start/join/peak ' + String(supabasePerformanceHealth.sharedReadStarts || 0) + '/' + String(supabasePerformanceHealth.sharedReadJoins || 0) + '/' + String(supabasePerformanceHealth.sharedReadPeak || 0) + ' · problémy ' + String((supabasePerformanceHealth.issues || []).length || 0)) : '',
          supabasePerformanceHealth ? ('Supabase zápisy: check/start/join/skip ' + String(supabasePerformanceHealth.writeOptimizationChecks || 0) + '/' + String(supabasePerformanceHealth.writeOptimizationStarts || 0) + '/' + String(supabasePerformanceHealth.writeOptimizationJoins || 0) + '/' + String(supabasePerformanceHealth.writeOptimizationSkips || 0) + ' · aktivní/peak ' + String(supabasePerformanceHealth.writeOptimizationActive || 0) + '/' + String(supabasePerformanceHealth.writeOptimizationPeak || 0)) : '',
          supabaseStructureHealth ? ('Supabase struktura/RLS: ' + (supabaseStructureHealth.ok ? 'OK' : 'kontrola') + ' · tabulky ' + String(supabaseStructureHealth.expectedTableCount || 0) + ' · realtime chybí ' + String(supabaseStructureHealth.missingRealtimeTableCount || 0) + ' · queue chybí ' + String(supabaseStructureHealth.missingQueueTypeCount || 0) + ' · helpery chybí ' + String(supabaseStructureHealth.missingHelperCount || 0)) : '',
          supabaseStructureHealth ? ('Supabase GRANT/policies checklist: signály ' + String(supabaseStructureHealth.grantSignalCount || 0) + ' · policies ' + String(supabaseStructureHealth.rlsPolicyChecklistCount || 0) + ' · problémy ' + String((supabaseStructureHealth.issues || []).length || 0)) : '',
          supabasePolicyRiskHealth ? ('Supabase RLS audit: ' + (supabasePolicyRiskHealth.ok ? 'OK' : 'rizika') + ' · P0/P1/P2 ' + String(supabasePolicyRiskHealth.p0Count || 0) + '/' + String(supabasePolicyRiskHealth.p1Count || 0) + '/' + String(supabasePolicyRiskHealth.p2Count || 0) + ' · veřejný write tabulek ' + String(supabasePolicyRiskHealth.publicWriteTableCount || 0) + ' · destruktivní ' + String(supabasePolicyRiskHealth.destructiveTableCount || 0)) : '',
          supabasePolicyRiskHealth && supabasePolicyRiskHealth.phase ? ('Supabase fáze: ' + String(supabasePolicyRiskHealth.phase.current || '—') + ' · další: ' + String(supabasePolicyRiskHealth.phase.next || '—')) : '',
          supabaseHardeningReadiness ? ('Supabase readiness: ' + String(supabaseHardeningReadiness.readinessPercent || 0) + '% · policy změna teď ' + (supabaseHardeningReadiness.policyChangeAllowedNow ? 'ano' : 'ne') + ' · přímé fallback oblasti ' + String(supabaseHardeningReadiness.directFallbackCount || 0) + ' · P0 ' + String(supabaseHardeningReadiness.p0Count || 0)) : '',
          supabaseHardeningReadiness ? ('Supabase další bezpečný krok: ' + String(supabaseHardeningReadiness.nextSafeStep || '—')) : '',
          supabaseHardeningReadiness ? ('Supabase potvrzeno: Piškvorky link/kód ' + (supabaseHardeningReadiness.confirmed && supabaseHardeningReadiness.confirmed.tttLinkAndCode ? 'OK' : 'ne') + ' · Lodě smoke ' + (gameSessionRpcSmoke && gameSessionRpcSmoke.perGameCoverage && gameSessionRpcSmoke.perGameCoverage.battleship && gameSessionRpcSmoke.perGameCoverage.battleship.create && gameSessionRpcSmoke.perGameCoverage.battleship.accept && gameSessionRpcSmoke.perGameCoverage.battleship.save ? 'OK' : 'čeká') + ' · heartbeat RPC ' + (supabaseHardeningReadiness.confirmed && supabaseHardeningReadiness.confirmed.keepaliveRpc ? 'OK' : 'kontrola') + ' · DB policies v tomto buildu ' + (supabaseHardeningReadiness.confirmed && supabaseHardeningReadiness.confirmed.noPolicyChangeInThisBuild ? 'beze změny' : 'kontrola')) : '',

          rpcHardeningStatus ? ('Supabase bug_reports: veřejné SELECT/UPDATE policies ' + String(rpcHardeningStatus.bugReportsPublicSelectUpdatePolicies || 0) + ' · DB změna ' + (rpcHardeningStatus.bugReportsDbChanged ? 'ano' : 'ne') + ' · další ' + String(rpcHardeningStatus.bugReportsNextStep || '—')) : '',
          gameStatsRpcSmoke ? ('Supabase game_stats RPC smoke: pokusy/OK/fallback ' + String(gameStatsRpcSmoke.attempts || 0) + '/' + String(gameStatsRpcSmoke.successes || 0) + '/' + String(gameStatsRpcSmoke.fallbacks || 0) + ' · ready ' + (gameStatsRpcSmoke.readyForPolicyTightening ? 'ano' : 'ne') + ' · poslední OK ' + String(gameStatsRpcSmoke.lastSuccessType || '—')) : '',
          gameUiRpcSmoke ? ('Supabase profile UI RPC smoke: pokusy/OK/fallback ' + String(gameUiRpcSmoke.attempts || 0) + '/' + String(gameUiRpcSmoke.successes || 0) + '/' + String(gameUiRpcSmoke.fallbacks || 0) + ' · ready ' + (gameUiRpcSmoke.readyForPolicyTightening ? 'ano' : 'ne')) : '',
          gameSessionRpcSmoke ? ('Supabase session/pozvánky RPC smoke: pokusy/OK/fallback ' + String(gameSessionRpcSmoke.attempts || 0) + '/' + String(gameSessionRpcSmoke.successes || 0) + '/' + String(gameSessionRpcSmoke.fallbacks || 0) + ' · ready ' + (gameSessionRpcSmoke.readyForPolicyTightening ? 'ano' : 'ne') + ' · poslední OK ' + String(gameSessionRpcSmoke.lastSuccessType || '—')) : '',
          gameSessionRpcSmoke ? ('Supabase online hry RPC pokrytí: ' + String(gameSessionRpcSmoke.gameCoverageText || gameSessionRpcSmoke.coverageText || 'Piškvorky c/a/s 0/0/0 · fallback 0 | Lodě c/a/s 0/0/0 · fallback 0')) : '',
          gameSessionRpcSmoke ? ('Supabase online hry chybí: ' + String((gameSessionRpcSmoke.missingGameOperations || []).length ? gameSessionRpcSmoke.missingGameOperations.join(', ') : 'nic')) : '',
          supabaseGuard ? ('Supabase guard: sloučeno ' + String(supabaseGuard.deduped || 0) + ' · ořezáno ' + String(supabaseGuard.trimmed || 0) + ' · odmítnuto ' + String((supabaseGuard.rejected || 0) + (supabaseGuard.oversized || 0))) : '',
          supabaseSyncGuard ? ('Supabase sync: timeouty R/W ' + String(supabaseSyncGuard.readTimeouts || 0) + '/' + String(supabaseSyncGuard.writeTimeouts || 0) + ' · retry R/W ' + String(supabaseSyncGuard.readRetries || 0) + '/' + String(supabaseSyncGuard.writeRetries || 0) + ' · fallback ' + String(supabaseSyncGuard.queuedFallbacks || 0)) : '',
          supabaseSyncGuard ? ('Supabase chyby: čtení ' + String(supabaseSyncGuard.failedReads || 0) + ' · zápis ' + String(supabaseSyncGuard.failedWrites || 0) + ' · cooldown ' + String(supabaseSyncGuard.cooldownSkips || 0)) : '',
          supabaseCacheGuard ? ('Supabase herní cache: účty hit/write ' + String(supabaseCacheGuard.accountCacheHits || 0) + '/' + String(supabaseCacheGuard.accountCacheWrites || 0) + ' · statistiky hit/write ' + String(supabaseCacheGuard.statsCacheHits || 0) + '/' + String(supabaseCacheGuard.statsCacheWrites || 0)) : '',
          supabaseCacheGuard ? ('Supabase sdílené čtení: spojeno ' + String(supabaseCacheGuard.sharedReadJoins || 0) + ' · stale fallback ' + String(supabaseCacheGuard.staleFallbacks || 0)) : '',
          profileUiGuard ? ('Profilový vzhled: load ' + String(profileUiGuard.remoteLoads || 0) + ' · apply ' + String(profileUiGuard.remoteApplies || 0) + ' · skip starší ' + String(profileUiGuard.remoteOlderSkips || 0) + ' · save ' + String(profileUiGuard.remoteSaves || 0)) : '',
          profileUiGuard ? ('Profilový vzhled guard: stejný save ' + String(profileUiGuard.saveSameSkips || 0) + ' · in-flight load/save ' + String(profileUiGuard.loadInFlightJoins || 0) + '/' + String(profileUiGuard.saveInFlightJoins || 0)) : ''
        ].filter(Boolean) : [];
        const diag = [
          'Verze: ' + formatRakDisplayVersion((typeof app !== "undefined" && app.version) || (typeof APP_VERSION !== 'undefined' ? APP_VERSION : '')), 
          'Online: ' + (navigator.onLine ? 'ano' : 'ne'),
          formatSupabaseKeepaliveLine(supabaseKeepaliveStatus || readSupabaseKeepaliveStatusForUi()),
          'Kompaktní režim: ' + (document.body.classList.contains('compactUI') ? 'zapnutý' : 'vypnutý'),
          LIGHTWEIGHT_MODE_LABEL + ': ' + (document.body.classList.contains('lightweightMode') ? 'zapnutý' : 'vypnutý') + (document.body.classList.contains('reduceMotion') ? ' · méně animací aktivní' : '') + (lightweightManual ? ' · ručně' : ''),
          'Výkonový profil: ' + (document.body.classList.contains('lightweightMode') || document.body.classList.contains('lowEndDevice') ? 'odlehčený' : 'normální'),
          'Starší/slabší zařízení detekováno: ' + (lowEndInfo.lowEnd ? 'ano' : (document.body.classList.contains('lightweightMode') ? 'ne automaticky, ale Láďův režim je zapnutý' : 'ne')) + lowEndReason,
          'Canvas DPR limit: ' + String(typeof getRakPerformanceDprMax === 'function' ? getRakPerformanceDprMax() : '—'),
          'Zařízení: ' + deviceInfo,
          'Aktuální stránka: ' + String(document.querySelector('.page.active')?.id || '—'),
          'Pozadí: ' + String((typeof getBackgroundPreference === 'function' ? getBackgroundPreference() : document.documentElement.dataset.rakBackground) || '—'),
          'Bottom lišta: ' + String(getComputedStyle(document.querySelector('.bottomNav') || document.body).bottom || '—'),
          ...securityRenderDiag,
          ...finalStabilizationDiag,
          ...ladaPerformanceDiag,
          ...devicePerformanceDiag,
          ...gameEngineDiag,
          ...architectureDiag,
          ...tttOnlineJoinDiag,
          ...pwaDiag,
          ...dataOptDiag,
          ...supabaseDiag
        ].join('\n');
        body.innerHTML = [
          '<div class="appMenuCard appMenuDiagnosticsCard">',
          '  <div class="appMenuCardTitle">Diagnostika</div>',
          '</div>',
          buildSupabaseKeepaliveStatusHtml({ includeButton: true }),
          '<div class="appMenuCard appMenuDiagnosticsCard">',
          '  <pre class="appMenuDiagnosticsText">' + escapeHtml(diag) + '</pre>',
          '</div>',
          '<button type="button" class="appMenuAction appMenuStandaloneBack" data-menu-action="settings">Zpět do nastavení</button>'
        ].join('');
        return;
      }
      if (menuAction === 'supabase-heartbeat-now') {
        try {
          const before = readSupabaseKeepaliveStatusForUi();
          const run = typeof window.runSupabaseKeepaliveNow === 'function'
            ? window.runSupabaseKeepaliveNow
            : (typeof window.RotationSupabaseBridge !== 'undefined' && window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.runKeepaliveNow === 'function' ? window.RotationSupabaseBridge.runKeepaliveNow : null);
          if (!run) {
            alert('Supabase heartbeat ještě není připravený. Zkus to po pár sekundách znovu.\n\n' + formatSupabaseKeepaliveLine(before));
            return;
          }
          await Promise.resolve(run('manual-diagnostics'));
          const after = readSupabaseKeepaliveStatusForUi();
          alert(formatSupabaseKeepaliveLine(after));
        } catch (err) {
          const after = readSupabaseKeepaliveStatusForUi();
          alert('Supabase heartbeat test se nepovedl: ' + String(err && err.message ? err.message : err || 'neznámá chyba') + '\n\n' + formatSupabaseKeepaliveLine(after));
        }
        return;
      }
      if (menuAction === 'hard-reload') {
        if (confirm('Načíst appku znovu bez uložené cache?')) {
          try {
            window.location.reload();
          } catch (err) {
            window.location.reload();
          }
        }
        return;
      }
      if (menuAction === 'reset-state') {
        if (confirm('Smazat uložený stav aplikace?')) {
          try {
            localStorage.removeItem(APP_KEY);
            localStorage.removeItem('rotationBuild');
            localStorage.removeItem(UI_PREFS_KEY);
            localStorage.removeItem('adminUnlocked');
          } catch (err) {
            console.warn(err);
          }
          if (typeof forceHomeRefresh === 'function') forceHomeRefresh();
          if (typeof renderRotace === 'function') renderRotace();
          if (typeof renderStatsPanel === 'function') renderStatsPanel();
          if (typeof updateDashboard === 'function') updateDashboard();
        }
        return;
      }

      if (adminAction === 'back-admin') {
        openAppMenu('admin');
        return;
      }
      if (adminAction === 'open-machines') {
        openAppMenu('admin-machines');
        return;
      }
      if (adminAction === 'open-food') {
        openAppMenu('admin-food');
        return;
      }
      if (adminAction === 'open-vacation') {
        openAppMenu('admin-vacation');
        return;
      }
      if (adminAction === 'open-special-days') {
        openAppMenu('admin-special-days');
        return;
      }
      if (adminAction === 'open-rotation') {
        openAppMenu('admin-rotation');
        return;
      }
      if (adminAction === 'open-overtime') {
        openAppMenu('admin-overtime');
        return;
      }
      if (adminAction === 'open-generator-settings') {
        openAppMenu('admin-generator-settings');
        return;
      }
      if (adminAction === 'open-monthly-workflow') {
        openAppMenu('admin-monthly-workflow');
        return;
      }
      if (adminAction === 'open-handover') {
        openAppMenu('admin-handover');
        return;
      }
      if (adminAction === 'open-admin-manual') {
        openAppMenu('admin-manual');
        return;
      }
      if (adminAction === 'open-settings-map') {
        openAppMenu('admin-settings-map');
        return;
      }
      if (adminAction === 'open-admin-accounts') {
        openAppMenu('admin-accounts');
        return;
      }
      if (adminAction === 'open-external-links') {
        openAppMenu('admin-external-links');
        return;
      }
      if (adminAction === 'open-app-contact') {
        openAppMenu('admin-app-contact');
        return;
      }
      if (adminAction === 'open-payroll-settings') {
        openAppMenu('admin-payroll-settings');
        return;
      }
      if (adminAction === 'open-backups') {
        openAppMenu('admin-backups');
        return;
      }
      if (adminAction === 'open-announcement') {
        openAppMenu('admin-announcement');
        return;
      }
      if (adminAction === 'open-usage') {
        openAppMenu('admin-usage');
        return;
      }
      if (adminAction === 'open-export') {
        openAppMenu('admin-export');
        return;
      }
      if (adminAction === 'open-reports') {
        openAppMenu('admin-reports');
        return;
      }
      if (adminAction === 'open-service') {
        openAppMenu('admin-service');
        return;
      }
      if (adminAction === 'service-load-status') {
        const statusEl = document.getElementById('adminOnlineSaveStatus');
        if (statusEl) statusEl.textContent = 'Načítám servisní stav…';
        await loadAdminServiceSnapshotFromSupabase();
        renderAdminMenuBody(body, 'service');
        return;
      }
      if (adminAction === 'service-sync-now') {
        const statusEl = document.getElementById('adminOnlineSaveStatus');
        if (statusEl) statusEl.textContent = 'Synchronizuji rozpis, hry a update…';
        if (typeof runDashboardManualSync === 'function') await runDashboardManualSync('admin-service-sync');
        else if (typeof window.__rotaceTriggerLiveRefresh === 'function') await window.__rotaceTriggerLiveRefresh('admin-service-sync', { force: true });
        await loadAdminServiceSnapshotFromSupabase();
        renderAdminMenuBody(body, 'service');
        return;
      }
      if (adminAction === 'service-update-check') {
        const statusEl = document.getElementById('adminOnlineSaveStatus');
        if (statusEl) statusEl.textContent = 'Kontroluji aktualizaci…';
        if (typeof window.__rotaceForcePwaUpdateCheck === 'function') await window.__rotaceForcePwaUpdateCheck('admin-service');
        if (typeof window.__rotaceRequestPwaCacheStatus === 'function') window.__rotaceRequestPwaCacheStatus('admin-service');
        renderAdminMenuBody(body, 'service');
        return;
      }
      if (adminAction === 'service-clean-invites') {
        const statusEl = document.getElementById('adminOnlineSaveStatus');
        if (statusEl) statusEl.textContent = 'Čistím prošlé pozvánky…';
        const result = await cleanupAdminExpiredInvites();
        if (!result || result.ok === false) throw (result && result.error ? result.error : new Error('Úklid pozvánek se nepovedl.'));
        await loadAdminServiceSnapshotFromSupabase();
        renderAdminMenuBody(body, 'service');
        return;
      }
      if (adminAction === 'usage-load') {
        const statusEl = document.getElementById('adminOnlineSaveStatus');
        if (statusEl) statusEl.textContent = 'Načítám připojení…';
        await loadAdminAppUsageFromSupabase();
        renderAdminMenuBody(body, 'usage');
        return;
      }
      if (adminAction === 'load-reports') {
        const statusEl = document.getElementById('adminOnlineSaveStatus');
        if (statusEl) statusEl.textContent = 'Načítám reporty…';
        await loadAdminBugReportsFromSupabase();
        renderAdminMenuBody(body, 'reports');
        return;
      }
      if (adminAction === 'download-reports') {
        downloadAdminBugReports();
        return;
      }
      if (adminAction === 'report-delete') {
        const reportId = target.getAttribute('data-report-id') || target.closest('[data-report-id]')?.getAttribute('data-report-id') || '';
        const result = await deleteAdminBugReport(reportId);
        if (!result || result.ok === false) throw (result && result.error ? result.error : new Error('Report se nepodařilo smazat.'));
        renderAdminMenuBody(body, 'reports');
        return;
      }
      if (adminAction === 'report-seen' || adminAction === 'report-done' || adminAction === 'report-ignore') {
        const reportId = target.getAttribute('data-report-id') || target.closest('[data-report-id]')?.getAttribute('data-report-id') || '';
        const nextStatus = adminAction === 'report-done' ? 'done' : (adminAction === 'report-ignore' ? 'ignored' : 'seen');
        const result = await updateAdminBugReportStatus(reportId, nextStatus);
        if (!result || result.ok === false) throw (result && result.error ? result.error : new Error('Report se nepodařilo upravit.'));
        renderAdminMenuBody(body, 'reports');
        return;
      }
      if (adminAction === 'save-announcement') {
        const statusEl = document.getElementById('adminOnlineSaveStatus');
        const payload = readAdminAnnouncementFromDom();
        if (!payload.message) {
          if (statusEl) statusEl.textContent = 'Nejdřív napiš text oznámení.';
          document.getElementById('adminAnnouncementMessage')?.focus?.();
          return;
        }
        if (payload.startAt && payload.endAt && new Date(payload.startAt).getTime() > new Date(payload.endAt).getTime()) {
          if (statusEl) statusEl.textContent = 'Čas „Od“ musí být před časem „Do“.';
          return;
        }
        if (typeof window.writeRakDashboardAnnouncement === 'function') {
          if (statusEl) statusEl.textContent = 'Ukládám oznámení…';
          const result = await window.writeRakDashboardAnnouncement(payload);
          if (statusEl) {
            statusEl.textContent = result && result.ok
              ? 'Oznámení uložené ✓ · uvidí ho všichni po načtení appky.'
              : 'Oznámení se nepodařilo uložit online: ' + String((result && (result.reason || result.message)) || 'zkontroluj připojení / Supabase.');
          }
          renderAdminMenuBody(body, 'announcement');
        } else if (statusEl) {
          statusEl.textContent = 'Oznámení se nepodařilo uložit, chybí dashboard helper.';
        }
        return;
      }
      if (adminAction === 'clear-announcement') {
        const statusEl = document.getElementById('adminOnlineSaveStatus');
        if (typeof window.clearRakDashboardAnnouncement === 'function') {
          if (statusEl) statusEl.textContent = 'Vypínám oznámení…';
          const result = await window.clearRakDashboardAnnouncement();
          if (statusEl) {
            statusEl.textContent = result && result.ok
              ? 'Oznámení vypnuté ✓'
              : 'Oznámení se nepodařilo vypnout online: ' + String((result && (result.reason || result.message)) || 'zkontroluj připojení / Supabase.');
          }
          renderAdminMenuBody(body, 'announcement');
        } else if (statusEl) {
          statusEl.textContent = 'Oznámení se nepodařilo vypnout, chybí dashboard helper.';
        }
        return;
      }
      if (adminAction === 'load-month') {
        if (monthKey) {
          app.selectedMonth = monthKey;
          setRotaceView('months');
          renderRotace();
          if (typeof renderMonth === 'function') renderMonth(monthKey);
        }
        return;
      }
      if (adminAction === 'load-online') {
        await loadAdminRotationFromSupabase();
        renderAdminMenuBody(body, currentView);
        return;
      }
      if (adminAction === 'load-rotation-backups') {
        const statusEl = document.getElementById('adminOnlineSaveStatus');
        if (statusEl) statusEl.textContent = 'Načítám zálohy…';
        await loadAdminRotationBackupsFromSupabase();
        renderAdminMenuBody(body, 'backups');
        return;
      }
      if (adminAction === 'restore-rotation-backup') {
        const backupId = target.getAttribute('data-backup-id') || target.closest('[data-backup-id]')?.getAttribute('data-backup-id') || '';
        if (!backupId) return;
        if (!confirm('Obnovit vybranou zálohu rozpisu? Aktuální stav se před obnovou ještě uloží jako nová záloha.')) return;
        const statusEl = document.getElementById('adminOnlineSaveStatus');
        if (statusEl) statusEl.textContent = 'Obnovuji zálohu…';
        const result = await restoreAdminRotationBackupFromSupabase(backupId);
        if (!result || result.ok === false) throw (result && result.error ? result.error : new Error('Obnova zálohy selhala.'));
        await loadAdminRotationBackupsFromSupabase();
        renderAdminMenuBody(body, 'backups');
        const nextStatus = document.getElementById('adminOnlineSaveStatus');
        if (nextStatus) nextStatus.textContent = 'Záloha obnovená online ✓';
        return;
      }
      if (adminAction === 'generate-rotation') {
        if (typeof adminOpenRotationGeneratorWizard === 'function') {
          adminOpenRotationGeneratorWizard(monthKey);
        }
        return;
      }
      if (adminAction === 'overtime-shift-filter') {
        if (typeof adminRotationOvertimeSetShiftFilter === 'function') adminRotationOvertimeSetShiftFilter(target && target.getAttribute('data-overtime-shift-filter'));
        renderAdminMenuBody(body, 'overtime');
        return;
      }
      if (adminAction === 'overtime-row-add') {
        if (typeof adminRotationAddOvertimeRow === 'function') adminRotationAddOvertimeRow(target && target.getAttribute('data-overtime-year'));
        if (typeof adminRotationRefreshOvertimeShiftBadges === 'function') adminRotationRefreshOvertimeShiftBadges(body, true);
        return;
      }
      if (adminAction === 'overtime-row-clear') {
        if (typeof adminRotationClearOvertimeRow === 'function') adminRotationClearOvertimeRow(target);
        return;
      }
      if (adminAction === 'load-overtime-settings') {
        await loadAdminMachineSettingsFromSupabase();
        renderAdminMenuBody(body, 'overtime');
        return;
      }
      if (adminAction === 'save-overtime-settings') {
        const overtimeSettings = readAdminRotationOvertimeSettingsFromDom();
        const rows = mergeAdminRotationOvertimeSettingsRows(overtimeSettings);
        if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.saveMachineSettings === 'function') {
          const result = await window.RotationSupabaseBridge.saveMachineSettings(rows);
          if (result && result.ok === false) throw (result.error || new Error('Uložení přesčasů selhalo.'));
          app.machineSettingsRows = rows;
          try { if (typeof renderStatsPanel === 'function') renderStatsPanel(); } catch (err) {}
          try { if (typeof updateFoodTile === 'function') updateFoodTile(); } catch (err) {}
          try { if (typeof renderFoodSchedulePage === 'function') renderFoodSchedulePage(); } catch (err) {}
          renderAdminMenuBody(body, 'overtime');
          const statusEl = document.getElementById('adminOnlineSaveStatus');
          if (statusEl) statusEl.textContent = (result && result.queued)
            ? 'Přesčasy uložené lokálně ✓ · po připojení se synchronizují'
            : 'Přesčasy uložené online ✓';
        }
        return;
      }
      if (adminAction === 'load-generator-settings') {
        await loadAdminMachineSettingsFromSupabase();
        renderAdminMenuBody(body, 'generator-settings');
        return;
      }
      if (adminAction === 'save-generator-settings') {
        const generatorSettings = readAdminRotationGeneratorSettingsFromDom();
        const rows = mergeAdminRotationGeneratorSettingsRows(generatorSettings);
        if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.saveMachineSettings === 'function') {
          const result = await window.RotationSupabaseBridge.saveMachineSettings(rows);
          if (result && result.ok === false) throw (result.error || new Error('Uložení pravidel generátoru selhalo.'));
          app.machineSettingsRows = rows;
          renderAdminMenuBody(body, 'generator-settings');
          const statusEl = document.getElementById('adminOnlineSaveStatus');
          if (statusEl) statusEl.textContent = (result && result.queued)
            ? 'Pravidla uložená lokálně - po připojení se synchronizují'
            : 'Pravidla generátoru uložená online';
        }
        return;
      }
      if (adminAction === 'load-admin-accounts') {
        if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.loadMachineSettings === 'function') {
          app.machineSettingsRows = await window.RotationSupabaseBridge.loadMachineSettings();
          renderAdminMenuBody(body, 'admin-accounts');
          return;
        }
      }
      if (adminAction === 'save-admin-accounts') {
        if (!(typeof rakAdminCanManageAdmins === 'function' && rakAdminCanManageAdmins())) return;
        const adminSettings = readAdminAccountsSettingsFromDom();
        const rows = mergeAdminAccountsSettingsRows(adminSettings);
        if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.saveMachineSettings === 'function') {
          const result = await window.RotationSupabaseBridge.saveMachineSettings(rows);
          if (result && result.ok === false) throw (result.error || new Error('Uložení správců selhalo.'));
          app.machineSettingsRows = rows;
          renderAdminMenuBody(body, 'admin-accounts');
          const statusEl = document.getElementById('adminOnlineSaveStatus');
          if (statusEl) statusEl.textContent = (result && result.queued)
            ? 'Správci uložení lokálně ✓ · po připojení se synchronizují'
            : 'Správci uložení online ✓';
        }
        return;
      }
      if (adminAction === 'load-external-links') {
        await loadAdminMachineSettingsFromSupabase();
        renderAdminMenuBody(body, 'external-links');
        return;
      }
      if (adminAction === 'save-external-links') {
        const linkSettings = readAdminExternalLinksSettingsFromDom();
        const rows = mergeRakExternalLinksSettingsRows(linkSettings);
        if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.saveMachineSettings === 'function') {
          const result = await window.RotationSupabaseBridge.saveMachineSettings(rows);
          if (result && result.ok === false) throw (result.error || new Error('Uložení odkazů selhalo.'));
          app.machineSettingsRows = rows;
          try { if (typeof syncDashboardExternalLinks === 'function') syncDashboardExternalLinks(); } catch (err) {}
          try { if (typeof updateDashboard === 'function') updateDashboard(); } catch (err) {}
          renderAdminMenuBody(body, 'external-links');
          const statusEl = document.getElementById('adminOnlineSaveStatus');
          if (statusEl) statusEl.textContent = (result && result.queued)
            ? 'Odkazy uložené lokálně - po připojení se synchronizují'
            : 'Odkazy uložené online';
        }
        return;
      }
      if (adminAction === 'load-app-contact') {
        await loadAdminMachineSettingsFromSupabase();
        renderAdminMenuBody(body, 'app-contact');
        return;
      }
      if (adminAction === 'save-app-contact') {
        const contactSettings = readAdminAppContactSettingsFromDom();
        const rows = mergeRakAppContactSettingsRows(contactSettings);
        if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.saveMachineSettings === 'function') {
          const result = await window.RotationSupabaseBridge.saveMachineSettings(rows);
          if (result && result.ok === false) throw (result.error || new Error('Uložení kontaktu selhalo.'));
          app.machineSettingsRows = rows;
          renderAdminMenuBody(body, 'app-contact');
          const statusEl = document.getElementById('adminOnlineSaveStatus');
          if (statusEl) statusEl.textContent = (result && result.queued)
            ? 'Kontakt uložený lokálně - po připojení se synchronizuje'
            : 'Kontakt uložený online';
        }
        return;
      }
      if (adminAction === 'load-payroll-settings') {
        await loadAdminMachineSettingsFromSupabase();
        renderAdminMenuBody(body, 'payroll-settings');
        return;
      }
      if (adminAction === 'save-payroll-settings') {
        const payrollSettings = readAdminPayrollSettingsFromDom();
        const rows = mergeRakPayrollSettingsRows(payrollSettings);
        if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.saveMachineSettings === 'function') {
          const result = await window.RotationSupabaseBridge.saveMachineSettings(rows);
          if (result && result.ok === false) throw (result.error || new Error('Uložení výplaty selhalo.'));
          app.machineSettingsRows = rows;
          try { if (typeof updateDashboard === 'function') updateDashboard(); } catch (err) {}
          try { if (typeof updateFoodTile === 'function') updateFoodTile(); } catch (err) {}
          renderAdminMenuBody(body, 'payroll-settings');
          const statusEl = document.getElementById('adminOnlineSaveStatus');
          if (statusEl) statusEl.textContent = (result && result.queued)
            ? 'Výplata uložená lokálně - po připojení se synchronizuje'
            : 'Výplata uložená online';
        }
        return;
      }
      if (adminAction === 'add-absence-row') {
        if (typeof adminAddAbsenceRowToEditor === 'function') adminAddAbsenceRowToEditor();
        return;
      }
      if (adminAction && adminAction.indexOf('generator-') === 0) {
        if (typeof adminHandleRotationGeneratorWizardAction === 'function' && adminHandleRotationGeneratorWizardAction(adminAction, target, body)) return;
      }
      if (adminAction === 'save-rotation') {
        const result = await saveAdminRotationFromDom(monthKey);
        const statusEl = document.getElementById('adminOnlineSaveStatus');
        const saveResult = result && result.saveResult ? result.saveResult : null;
        if (statusEl) {
          statusEl.textContent = saveResult && saveResult.ok === true
            ? (saveResult.queued
                ? 'Rozpis uložený lokálně ✓ · po připojení se synchronizuje'
                : ('Rozpis uložený online ✓ · měsíců: ' + String(saveResult.months || 0) + ' · řádků: ' + String(saveResult.entries || 0)))
            : 'Rozpis se nepodařilo uložit online.';
        }
        renderAdminMenuBody(body, currentView);
        return;
      }
      if (adminAction === 'load-food-schedule') {
        if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.loadMachineSettings === 'function') {
          app.machineSettingsRows = await window.RotationSupabaseBridge.loadMachineSettings();
          try { if (typeof updateFoodTile === 'function') updateFoodTile(); } catch (err) {}
          try { if (typeof renderFoodSchedulePage === 'function') renderFoodSchedulePage(); } catch (err) {}
          try { if (typeof updateDashboard === 'function') updateDashboard(); } catch (err) {}
          renderAdminMenuBody(body, 'food');
          return;
        }
      }
      if (adminAction === 'save-food-schedule') {
        const foodSettings = readAdminFoodScheduleSettingsFromDom();
        const rows = mergeAdminFoodScheduleSettingsRows(foodSettings);
        if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.saveMachineSettings === 'function') {
          const result = await window.RotationSupabaseBridge.saveMachineSettings(rows);
          if (result && result.ok === false) throw (result.error || new Error('Uložení časů selhalo.'));
          app.machineSettingsRows = rows;
          try { if (typeof updateFoodTile === 'function') updateFoodTile(); } catch (err) {}
          try { if (typeof renderFoodSchedulePage === 'function') renderFoodSchedulePage(); } catch (err) {}
          try { if (typeof updateDashboard === 'function') updateDashboard(); } catch (err) {}
          renderAdminMenuBody(body, 'food');
          const statusEl = document.getElementById('adminOnlineSaveStatus');
          if (statusEl) statusEl.textContent = (result && result.queued)
            ? ('Časy uložené lokálně ✓ · po připojení se synchronizují')
            : ('Časy uložené online ✓');
          return;
        }
      }
      if (adminAction === 'load-vacation-countdown') {
        if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.loadMachineSettings === 'function') {
          app.machineSettingsRows = await window.RotationSupabaseBridge.loadMachineSettings();
          try { if (typeof updateDashboard === 'function') updateDashboard(); } catch (err) {}
          renderAdminMenuBody(body, 'vacation');
          return;
        }
      }
      if (adminAction === 'save-vacation-countdown') {
        const vacationSettings = readAdminVacationCountdownSettingsFromDom();
        const rows = mergeAdminVacationCountdownSettingsRows(vacationSettings);
        if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.saveMachineSettings === 'function') {
          const result = await window.RotationSupabaseBridge.saveMachineSettings(rows);
          if (result && result.ok === false) throw (result.error || new Error('Uložení dovolené selhalo.'));
          app.machineSettingsRows = rows;
          try { if (typeof updateDashboard === 'function') updateDashboard(); } catch (err) {}
          renderAdminMenuBody(body, 'vacation');
          const statusEl = document.getElementById('adminOnlineSaveStatus');
          if (statusEl) statusEl.textContent = (result && result.queued)
            ? ('Dovolená uložená lokálně ✓ · po připojení se synchronizuje')
            : ('Dovolená uložená online ✓');
          return;
        }
      }
      if (adminAction === 'load-special-days') {
        if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.loadMachineSettings === 'function') {
          app.machineSettingsRows = await window.RotationSupabaseBridge.loadMachineSettings();
          try { if (typeof updateDashboard === 'function') updateDashboard(); } catch (err) {}
          renderAdminMenuBody(body, 'special-days');
          return;
        }
      }
      if (adminAction === 'save-special-days') {
        const specialDaysSettings = readAdminSpecialDaysSettingsFromDom();
        const rows = mergeRakSpecialDaysSettingsRows(specialDaysSettings);
        if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.saveMachineSettings === 'function') {
          const result = await window.RotationSupabaseBridge.saveMachineSettings(rows);
          if (result && result.ok === false) throw (result.error || new Error('Uložení volných dnů selhalo.'));
          app.machineSettingsRows = rows;
          try { if (typeof updateDashboard === 'function') updateDashboard(); } catch (err) {}
          try { if (typeof updateFoodTile === 'function') updateFoodTile(); } catch (err) {}
          renderAdminMenuBody(body, 'special-days');
          const statusEl = document.getElementById('adminOnlineSaveStatus');
          if (statusEl) statusEl.textContent = (result && result.queued)
            ? 'Volné dny uložené lokálně ✓ · po připojení se synchronizují'
            : 'Volné dny uložené online ✓';
          return;
        }
      }
      if (adminAction === 'load-machines') {
        if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.loadMachineSettings === 'function') {
          app.machineSettingsRows = await window.RotationSupabaseBridge.loadMachineSettings();
          try { if (typeof updateFoodTile === 'function') updateFoodTile(); } catch (err) {}
          try { if (typeof renderFoodSchedulePage === 'function') renderFoodSchedulePage(); } catch (err) {}
          try { if (typeof updateDashboard === 'function') updateDashboard(); } catch (err) {}
          renderAdminMenuBody(body, currentView);
          return;
        }
      }
      if (adminAction === 'save-machines') {
        const rows = readAdminMachineSettingsFromDom();
        if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.saveMachineSettings === 'function') {
          const result = await window.RotationSupabaseBridge.saveMachineSettings(rows);
          if (result && result.ok === false) throw (result.error || new Error('Uložení strojů selhalo.'));
          app.machineSettingsRows = rows;
          try {
            if (typeof refreshPrackaFromMachineSettings === 'function') refreshPrackaFromMachineSettings('admin-save-machines');
            else if (typeof updatePrackaInfo === 'function') updatePrackaInfo();
          } catch (err) {}
          try {
            if (typeof refreshFhbSettingsUi === 'function') refreshFhbSettingsUi({ source: 'admin-save-machines', recalculate: true });
            else if (typeof updateFhbPresetButtons === 'function') updateFhbPresetButtons();
          } catch (err) {}
          try { if (typeof updateFoodTile === 'function') updateFoodTile(); } catch (err) {}
          try { if (typeof renderFoodSchedulePage === 'function') renderFoodSchedulePage(); } catch (err) {}
          renderAdminMenuBody(body, currentView);
          const statusEl = document.getElementById('adminOnlineSaveStatus');
          if (statusEl) statusEl.textContent = (result && result.queued)
            ? ('Stroje uložené lokálně ✓ · po připojení se synchronizují' + ((result && result.savedCount) ? (' · řádků: ' + result.savedCount) : ''))
            : ('Stroje uložené online ✓' + ((result && result.savedCount) ? (' · řádků: ' + result.savedCount) : ''));
          return;
        }
      }

      if (uiPref) {
        toggleUiPref(uiPref);
        openAppMenu('settings');
        return;
      }
      if (uiReset) {
        resetUiPrefs();
        openAppMenu('settings');
        return;
      }
    } catch (err) {
      console.error('Menu/admin action failed', err);
      alert(err && err.message ? err.message : 'Akce se nepodařila.');
    }
  });

  body.addEventListener('focusout', (event) => {
    const target = event.target;
    if (!target || typeof target.matches !== 'function') return;
    if (target.matches('[data-food-overtime-date]')) {
      if (typeof adminFoodNormalizeDateInput === 'function') {
        const normalized = adminFoodNormalizeDateInput(target.value || '');
        if (normalized && normalized !== target.value) target.value = normalized;
      }
      if (typeof adminFoodRefreshStatus === 'function') adminFoodRefreshStatus(body);
      return;
    }
    if (!target.matches('[data-rot-field], [data-note-field]')) return;
    window.setTimeout(() => {
      const next = document.activeElement;
      const codePicker = document.getElementById('adminAbsenceCodePicker');
      if (codePicker && codePicker.classList && codePicker.classList.contains('isVisible')) {
        if (next === codePicker || (next && codePicker.contains && codePicker.contains(next))) return;
        if (!next || !next.matches || !next.matches('[data-note-field="code"]')) adminCloseAbsenceCodePicker();
      }
      const quick = document.getElementById('adminRotationQuickRemove');
      if (quick && quick.classList && quick.classList.contains('isVisible')) {
        if (next === quick || (next && quick.contains && quick.contains(next))) return;
        const shownAt = Number(window.__rakAdminRotationQuickRemoveShownAt || 0) || 0;
        // Mobilní klávesnice/focus občas po tapnutí pole hned vyvolá blur. Nezavírat rychlé Odebrat okamžitě po zobrazení.
        if (shownAt && Date.now() - shownAt < 8000) return;
      }
      if (!next || !next.matches || !next.matches('[data-rot-field], [data-note-field]')) adminCloseRotationQuickRemove();
    }, 120);
  });

  body.addEventListener('scroll', () => {
    if (body.dataset.adminView !== 'rotation') return;
    try {
      if (window.__rakAdminRotationScrollCloseRaf) return;
      window.__rakAdminRotationScrollCloseRaf = window.requestAnimationFrame(() => {
        window.__rakAdminRotationScrollCloseRaf = 0;
        const codeTarget = window.__rakAdminAbsenceCodeInput;
        if (codeTarget && codeTarget.isConnected && body.contains(codeTarget)) adminShowAbsenceCodePicker(codeTarget);
        else adminCloseAbsenceCodePicker();
        const target = window.__rakAdminRotationQuickRemoveInput;
        if (target && target.isConnected && body.contains(target)) adminShowRotationQuickRemove(target);
        else adminCloseRotationQuickRemove();
      });
    } catch (err) {
      const codeTarget = window.__rakAdminAbsenceCodeInput;
      if (codeTarget && codeTarget.isConnected && body.contains(codeTarget)) adminShowAbsenceCodePicker(codeTarget);
      else adminCloseAbsenceCodePicker();
      const target = window.__rakAdminRotationQuickRemoveInput;
      if (target && target.isConnected && body.contains(target)) adminShowRotationQuickRemove(target);
      else adminCloseRotationQuickRemove();
    }
  }, { passive: true });

  body.addEventListener('input', (event) => {
    const target = event.target;
    if (!target || typeof target.matches !== 'function') return;
    if (!target.matches('[data-rot-field], [data-note-field]')) return;
    if (target.matches('[data-note-field="code"]')) {
      adminCloseRotationQuickRemove();
      adminScheduleAbsenceCodePicker(target);
    } else if (adminRotationIsRemoveValue(target.value)) {
      target.value = '';
      adminCloseRotationQuickRemove();
    } else {
      adminScheduleRotationQuickRemove(target);
    }
    if (body.dataset.adminView === 'rotation') {
      scheduleAdminRotationEditorMaintenance(body, 'input', 900);
    }
  });

  body.addEventListener('focusin', (event) => {
    const target = event.target;
    if (!target || typeof target.matches !== 'function') return;
    if (!target.matches('[data-rot-field], [data-note-field]')) return;
    if (body.dataset.adminView === 'rotation') {
      if (target.matches('[data-note-field="code"]')) {
        adminCloseRotationQuickRemove();
        adminScheduleAbsenceCodePicker(target);
      } else {
        adminCloseAbsenceCodePicker();
        adminScheduleRotationQuickRemove(target);
      }
      adminAttachRotationAvailableDatalist(target);
    }
  });
}

function openAppMenu(view) {
  const page = ensureAppMenuOverlay();
  page.classList.add('active');
  const body = page.querySelector('#appMenuBody');
  const v = view || 'menu';
  const adminViews = new Set(['admin', 'admin-machines', 'admin-food', 'admin-vacation', 'admin-special-days', 'admin-rotation', 'admin-overtime', 'admin-generator-settings', 'admin-monthly-workflow', 'admin-handover', 'admin-manual', 'admin-settings-map', 'admin-accounts', 'admin-external-links', 'admin-app-contact', 'admin-payroll-settings', 'admin-backups', 'admin-announcement', 'admin-usage', 'admin-export', 'admin-reports', 'admin-service']);

  const versionText = (typeof app !== 'undefined' && app.version) || (typeof APP_VERSION !== 'undefined' ? APP_VERSION : '');
  const contact = typeof getRakAppContactSettings === 'function'
    ? getRakAppContactSettings()
    : { name: 'Martin Špadrna', phone: '+420 773 682 499', email: 'martinspadrna@gmail.com' };

  if (body) {
    bindAppMenuHandlers(body);
    if (!adminViews.has(v)) body.dataset.adminView = '';
    if (adminViews.has(v) && !(typeof rakAdminCanOpenAdmin === 'function' && rakAdminCanOpenAdmin())) {
      body.innerHTML = [
        '<div class="appMenuCard appMenuAdminCard">',
        '  <div class="appMenuCardTitle">Administrace zamčena</div>',
        '  <div class="appMenuText">Administrace je dostupná jen po přihlášení admin účtem.</div>',
        '  <button type="button" class="appMenuAction appMenuBack" data-menu-back="1">Zpět</button>',
        '</div>'
      ].join('');
      return;
    }
    if (v === 'admin-accounts' && !(typeof rakAdminCanManageAdmins === 'function' && rakAdminCanManageAdmins())) {
      body.innerHTML = [
        '<div class="appMenuCard appMenuAdminCard">',
        '  <div class="appMenuCardTitle">Správci</div>',
        '  <div class="appMenuText">Seznam správců může měnit jen hlavní admin. Běžný admin může spravovat provoz, rozpisy a nastavení, ale nemůže přidávat další správce ani měnit jejich hesla.</div>',
        '  <button type="button" class="appMenuAction appMenuBack" data-menu-back="1">Zpět</button>',
        '</div>'
      ].join('');
      return;
    }
    if (v === 'about') {
      body.innerHTML = [
        '<div class="appMenuCard">',
        '  <div class="appMenuCardTitle">O aplikaci</div>',
        '  <div class="appMenuVersion">' + escapeHtml(formatRakDisplayVersion(versionText)) + '</div>',
        '  ' + buildAppHistoryHtml(versionText),
        '  <button type="button" class="appMenuAction appMenuBack" data-menu-back="1">Zpět</button>',
        '</div>'
      ].join('');
      if (typeof renderThemeSettingsCards === 'function') {
        try { renderThemeSettingsCards(); } catch (err) {}
      }
    } else if (v === 'contact') {
      bindAppMenuHandlers(body);
      body.innerHTML = [
        '<div class="appMenuCard">',
        '  <div class="appMenuCardTitle">Kontakt</div>',
        '',
        '  <div class="appMenuContactRow"><span>Jméno</span><b>' + escapeHtml(contact.name) + '</b></div>',
        '  <div class="appMenuContactRow"><span>Telefon</span><b>' + escapeHtml(contact.phone) + '</b></div>',
        '  <div class="appMenuContactRow"><span>E-mail</span><b>' + escapeHtml(contact.email) + '</b></div>',
        '  <button type="button" class="appMenuAction appMenuBack" data-menu-back="1">Zpět</button>',
        '</div>'
      ].join('');
    } else if (v === 'bug-report') {
      bindAppMenuHandlers(body);
      renderBugReportMenuBody(body);
    } else if (v === 'settings') {
      bindAppMenuHandlers(body);
      const prefs = loadUiPrefs();
      const profileCard = buildGamesProfileSettingsHtml();
      const performanceCard = typeof buildRakDevicePerformanceSettingsHtml === 'function' ? buildRakDevicePerformanceSettingsHtml() : '';
      const themeCards = buildThemeSystemSettingsHtml();
      body.innerHTML = [
        profileCard,
        performanceCard,
        '<div class="appMenuCard appMenuSettingsCard appMenuAppSettingsCard">',
        '  <div class="appMenuCardTitle">Nastavení aplikace</div>',
        '  <div class="appMenuSettingsList appMenuSettingsGrid">',
        '    <button type="button" class="appMenuAction appMenuSettingBtn" data-ui-pref="compact">' + (prefs.compact ? '✓ ' : '') + 'Kompaktní</button>',
        '    <button type="button" class="appMenuAction appMenuSettingBtn" data-menu-action="clear-cache">Vyčistit cache</button>',
        '    <button type="button" class="appMenuAction appMenuSettingBtn" data-menu-action="app-diagnostics">Diagnostika</button>',
        '    <button type="button" class="appMenuAction appMenuSettingBtn" data-ui-reset="1">Výchozí</button>',
        '    <button type="button" class="appMenuAction appMenuSettingBtn appMenuDangerBtn" data-menu-action="reset-state">Smazat data</button>',
        '  </div>',
        '</div>',
        themeCards,
        '<button type="button" class="appMenuAction appMenuBack appMenuStandaloneBack" data-menu-back="1">Zpět</button>'
      ].join('');
      if (typeof gamesRenderAccountChips === 'function') {
        try { gamesRenderAccountChips(); } catch (err) {}
      }
      if (typeof renderGamesProfileStatus === 'function') {
        try { renderGamesProfileStatus(); } catch (err) {}
      }
      if (typeof renderThemeSettingsCards === 'function') {
        try { renderThemeSettingsCards(); } catch (err) {}
      }
    } else if (v === 'admin') {
      bindAppMenuHandlers(body);
      void (async () => {
        try {
          await loadAdminMachineSettingsFromSupabase();
          renderAdminMenuBody(body, 'home');
        } catch (err) {
          console.warn('Admin preload failed', err);
          renderAdminMenuBody(body, 'home');
        }
      })();
    } else if (v === 'admin-machines') {
      void (async () => {
        try {
          await loadAdminMachineSettingsFromSupabase();
          renderAdminMenuBody(body, 'machines');
        } catch (err) {
          console.warn('Admin machines preload failed', err);
          renderAdminMenuBody(body, 'machines');
        }
      })();
    } else if (v === 'admin-food') {
      void (async () => {
        try {
          await loadAdminMachineSettingsFromSupabase();
          renderAdminMenuBody(body, 'food');
        } catch (err) {
          console.warn('Admin food preload failed', err);
          renderAdminMenuBody(body, 'food');
        }
      })();
    } else if (v === 'admin-vacation') {
      void (async () => {
        try {
          await loadAdminMachineSettingsFromSupabase();
          renderAdminMenuBody(body, 'vacation');
        } catch (err) {
          console.warn('Admin vacation preload failed', err);
          renderAdminMenuBody(body, 'vacation');
        }
      })();
    } else if (v === 'admin-special-days') {
      void (async () => {
        try {
          await loadAdminMachineSettingsFromSupabase();
          renderAdminMenuBody(body, 'special-days');
        } catch (err) {
          console.warn('Admin special days preload failed', err);
          renderAdminMenuBody(body, 'special-days');
        }
      })();
    } else if (v === 'admin-rotation') {
      void (async () => {
        try {
          await loadAdminRotationFromSupabase();
          await loadAdminMachineSettingsFromSupabase();
          renderAdminMenuBody(body, 'rotation');
        } catch (err) {
          console.warn('Admin rotation preload failed', err);
          renderAdminMenuBody(body, 'rotation');
        }
      })();
    } else if (v === 'admin-overtime') {
      void (async () => {
        try {
          await loadAdminMachineSettingsFromSupabase();
          renderAdminMenuBody(body, 'overtime');
        } catch (err) {
          console.warn('Admin overtime preload failed', err);
          renderAdminMenuBody(body, 'overtime');
        }
      })();
    } else if (v === 'admin-generator-settings') {
      void (async () => {
        try {
          await loadAdminMachineSettingsFromSupabase();
          renderAdminMenuBody(body, 'generator-settings');
        } catch (err) {
          console.warn('Admin generator settings preload failed', err);
          renderAdminMenuBody(body, 'generator-settings');
        }
      })();
    } else if (v === 'admin-handover') {
      void (async () => {
        try {
          await loadAdminMachineSettingsFromSupabase();
          renderAdminMenuBody(body, 'handover');
        } catch (err) {
          console.warn('Admin handover preload failed', err);
          renderAdminMenuBody(body, 'handover');
        }
      })();
    } else if (v === 'admin-monthly-workflow') {
      void (async () => {
        try {
          await loadAdminMachineSettingsFromSupabase();
          renderAdminMenuBody(body, 'monthly-workflow');
        } catch (err) {
          console.warn('Admin monthly workflow preload failed', err);
          renderAdminMenuBody(body, 'monthly-workflow');
        }
      })();
    } else if (v === 'admin-manual') {
      void (async () => {
        try {
          await loadAdminMachineSettingsFromSupabase();
          renderAdminMenuBody(body, 'manual');
        } catch (err) {
          console.warn('Admin manual preload failed', err);
          renderAdminMenuBody(body, 'manual');
        }
      })();
    } else if (v === 'admin-settings-map') {
      void (async () => {
        try {
          await loadAdminMachineSettingsFromSupabase();
          renderAdminMenuBody(body, 'settings-map');
        } catch (err) {
          console.warn('Admin settings map preload failed', err);
          renderAdminMenuBody(body, 'settings-map');
        }
      })();
    } else if (v === 'admin-accounts') {
      void (async () => {
        try {
          await loadAdminMachineSettingsFromSupabase();
          renderAdminMenuBody(body, 'admin-accounts');
        } catch (err) {
          console.warn('Admin accounts preload failed', err);
          renderAdminMenuBody(body, 'admin-accounts');
        }
      })();
    } else if (v === 'admin-external-links') {
      void (async () => {
        try {
          await loadAdminMachineSettingsFromSupabase();
          renderAdminMenuBody(body, 'external-links');
        } catch (err) {
          console.warn('Admin external links preload failed', err);
          renderAdminMenuBody(body, 'external-links');
        }
      })();
    } else if (v === 'admin-app-contact') {
      void (async () => {
        try {
          await loadAdminMachineSettingsFromSupabase();
          renderAdminMenuBody(body, 'app-contact');
        } catch (err) {
          console.warn('Admin app contact preload failed', err);
          renderAdminMenuBody(body, 'app-contact');
        }
      })();
    } else if (v === 'admin-payroll-settings') {
      void (async () => {
        try {
          await loadAdminMachineSettingsFromSupabase();
          renderAdminMenuBody(body, 'payroll-settings');
        } catch (err) {
          console.warn('Admin payroll settings preload failed', err);
          renderAdminMenuBody(body, 'payroll-settings');
        }
      })();
    } else if (v === 'admin-backups') {
      void (async () => {
        try {
          await loadAdminRotationBackupsFromSupabase();
          renderAdminMenuBody(body, 'backups');
        } catch (err) {
          console.warn('Admin backups preload failed', err);
          if (typeof app !== 'undefined') app.adminRotationBackupsSnapshot = { ok: false, error: err, backups: [] };
          renderAdminMenuBody(body, 'backups');
        }
      })();
    } else if (v === 'admin-announcement') {
      renderAdminMenuBody(body, 'announcement');
    } else if (v === 'admin-export') {
      renderAdminMenuBody(body, 'export');
    } else if (v === 'admin-usage') {
      bindAppMenuHandlers(body);
      void (async () => {
        try {
          await loadAdminAppUsageFromSupabase();
          renderAdminMenuBody(body, 'usage');
        } catch (err) {
          console.warn('Admin usage preload failed', err);
          app.adminUsageSnapshot = { ok: false, error: err, devices: [], events: [], summary: {} };
          renderAdminMenuBody(body, 'usage');
        }
      })();
    } else if (v === 'admin-reports') {
      void (async () => {
        try {
          await loadAdminBugReportsFromSupabase();
          renderAdminMenuBody(body, 'reports');
        } catch (err) {
          console.warn('Admin reports preload failed', err);
          renderAdminMenuBody(body, 'reports');
        }
      })();
    } else if (v === 'admin-service') {
      bindAppMenuHandlers(body);
      void (async () => {
        try {
          await loadAdminServiceSnapshotFromSupabase();
          renderAdminMenuBody(body, 'service');
        } catch (err) {
          console.warn('Admin service preload failed', err);
          renderAdminMenuBody(body, 'service');
        }
      })();
    } else {
      body.innerHTML = [
        '<div class="appMenuGrid">',
        '  <button type="button" class="appMenuAction" data-menu-action="settings">Nastavení</button>',
        '  <button type="button" class="appMenuAction" data-menu-action="about">O aplikaci</button>',
        '  <button type="button" class="appMenuAction" data-menu-action="contact">Kontakt</button>',
        '  <button type="button" class="appMenuAction" data-menu-action="bug-report">Pošli mi chybu</button>',
        ((typeof rakAdminCanOpenAdmin === 'function' && rakAdminCanOpenAdmin()) ? '  <button type="button" class="appMenuAction isActive" data-menu-action="admin">Administrace</button>' : ''),
        '</div>'
      ].join('');
    }

    bindAppMenuHandlers(body);
  }

  return page;
}

function toggleAppMenu() {

  showPage('menu');
  openAppMenu('menu');
  setBottomNavActive('menu');
}
