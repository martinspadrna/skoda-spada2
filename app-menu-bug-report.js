// RaK – uživatelský report chyby oddělený od menu shellu.
try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('app-menu-bug-report.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}

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
  const version = getRakCurrentAppVersion() || '—';
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
    'Vzhled aplikace: ' + String((typeof getAppearancePreference === 'function' ? getAppearancePreference() : report.theme) || '—'),
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
    '  <div class="appMenuReportHint" id="bugReportStatus">' + (disabled ? 'Bez přihlášení nejde report odeslat.' : 'Přidám k tomu verzi, zařízení, stránku a vzhled aplikace.') + '</div>',
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
