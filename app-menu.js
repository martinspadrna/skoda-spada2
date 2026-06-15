// RaK 1.2 (1.153) – Více/menu shell, O aplikaci, Nastavení, Report chyby a admin menu.
try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('app-menu.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}


function formatRakDisplayVersion(version) {
  const text = String(version || '').trim();
  if (!text) return '—';
  return /^RaK\s+/i.test(text) ? text : ('RaK ' + text);
}

const RAK_ADMIN_EXPORT_IMPORT_EXCEL_COPY_CONTRACT_V1139 = Object.freeze({
  version: '1.2 (1.153)',
  scope: 'administrace-export-import-rotation-excel-copy-layout',
  action: 'admin-download-rotation-excel',
  rule: 'Export / import používá stejný XLSX layout rozpisu jako generátor.'
});

const RAK_ADMIN_EXPORT_IMPORT_EXCEL_MONTH_GROUP_CONTRACT_V1140 = Object.freeze({
  version: '1.2 (1.153)',
  scope: 'administrace-export-import-rotation-excel-month-picker',
  action: 'admin-download-rotation-excel',
  rule: 'Výběr měsíce pro XLSX export je řazený chronologicky a skupinovaný podle roku, aby se nemíchaly stejné měsíce z různých roků.'
});

function buildRakRotationExcelExportMonthOptions(selectedMonthKey) {
  const selected = String(selectedMonthKey || '').trim();
  if (typeof adminRotationGeneratorBuildMonthOptions === 'function') {
    const grouped = adminRotationGeneratorBuildMonthOptions(selected);
    if (grouped) return grouped;
  }
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
function renderAdminMenuBody(body, section) {
  const mode = String(section || 'home').trim() || 'home';
  const months = getAdminRotationMonthKeys();
  const monthKey = getAdminSelectedMonthKey();
  body.dataset.adminView = mode;
  try { adminSetRotationViewportLock(mode === 'rotation'); } catch (err) {}
  const page = document.getElementById('menu');
  if (page) page.dataset.adminView = mode;

  const homeHtml = [
    '<div class="appMenuCard appMenuAdminCard">',
    '  <div class="appMenuCardTitle">Administrace</div>',
    '  <div class="appMenuText">',
    '    <div>Nejprve stroje, pak rozpisy a export až nakonec. Všechno se ukládá online přes Supabase.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Vyber sekci, kterou chceš upravit.</div>',
    '  </div>',
    '  <div class="appMenuSettingsList">',
    '    <button type="button" class="appMenuAction" data-admin-action="open-machines">Nastavení strojů</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="open-food">Kantýna / jídelna</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="open-rotation">Rozpisy</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="open-announcement">Oznámení Dashboard</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="open-usage">Přehled připojení</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="open-export">Export / import</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="open-reports">Reporty chyb</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="open-service">Servis / synchronizace</button>',
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
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="load-food-schedule">Načíst online</button>',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="save-food-schedule">Uložit časy</button>',
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
    '    <button type="button" class="appMenuAction" data-admin-action="open-overtime">Přesčasy</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="load-online">Načíst online</button>',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="save-rotation">Uložit rozpis</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    buildAdminRotationTableHtml(monthKey),
    '</div>'
  ].join('');

  const overtimeHtml = [
    '<div class="appMenuCard appMenuAdminCard adminRotationOvertimeCard">',
    '  <div class="appMenuCardTitle">Přesčasy rozpisu</div>',
    '  <div class="appMenuText">',
    '    <div>Tady si spravuješ přesčasové neděle pro rozpisy a statistiky. Přepínač TO říká, jestli jde přesčas na tvrdotu.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Změny se uloží přes stávající nastavení strojů, bez změny databáze.</div>',
    '  </div>',
    buildAdminRotationOvertimeSettingsHtml(),
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="load-overtime-settings">Načíst online</button>',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="save-overtime-settings">Uložit přesčasy</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="open-rotation">Zpět na rozpisy</button>',
    '  </div>',
    '</div>'
  ].join('');

  const announcementHtml = buildAdminAnnouncementHtml();
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
  } else if (mode === 'rotation') {
    body.innerHTML = rotationHtml;
  } else if (mode === 'overtime') {
    body.innerHTML = overtimeHtml;
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




// RaK 1.2 (1.153) – Plovoucí odebrání a údržba editoru rozpisů jsou oddělené v admin-rotation.js.

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
    const currentView = String(body.dataset.adminView || 'home');
    const select = body.querySelector('#adminMonthSelect');
    const monthKey = select ? select.value : getAdminSelectedMonthKey();
    const adminMonthKey = target.getAttribute('data-admin-month-key');

    try {
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
      const adminYearKey = target.getAttribute('data-admin-year-key');
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
      if (adminAction === 'open-rotation') {
        openAppMenu('admin-rotation');
        return;
      }
      if (adminAction === 'open-overtime') {
        openAppMenu('admin-overtime');
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
          renderAdminMenuBody(body, 'food');
          const statusEl = document.getElementById('adminOnlineSaveStatus');
          if (statusEl) statusEl.textContent = (result && result.queued)
            ? ('Časy uložené lokálně ✓ · po připojení se synchronizují')
            : ('Časy uložené online ✓');
          return;
        }
      }
      if (adminAction === 'load-machines') {
        if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.loadMachineSettings === 'function') {
          app.machineSettingsRows = await window.RotationSupabaseBridge.loadMachineSettings();
          try { if (typeof updateFoodTile === 'function') updateFoodTile(); } catch (err) {}
          try { if (typeof renderFoodSchedulePage === 'function') renderFoodSchedulePage(); } catch (err) {}
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

  const versionText = (typeof app !== 'undefined' && app.version) || (typeof APP_VERSION !== 'undefined' ? APP_VERSION : '');
  const contactName = 'Martin Špadrna';
  const contactPhone = '+420 773 682 499';
  const contactEmail = 'martinspadrna@gmail.com';

  if (body) {
    bindAppMenuHandlers(body);
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
        '<div class="appMenuCard appMenuSecretCard" data-admin-secret="contact" role="button" tabindex="0">',
        '  <div class="appMenuCardTitle">Kontakt</div>',
        '',
        '  <div class="appMenuContactRow"><span>Jméno</span><b>' + escapeHtml(contactName) + '</b></div>',
        '  <div class="appMenuContactRow"><span>Telefon</span><b>' + escapeHtml(contactPhone) + '</b></div>',
        '  <div class="appMenuContactRow"><span>E-mail</span><b>' + escapeHtml(contactEmail) + '</b></div>',
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
        (app.adminUnlocked ? '  <button type="button" class="appMenuAction isActive" data-menu-action="admin">Administrace</button>' : ''),
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
