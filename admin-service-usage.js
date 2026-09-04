// RaK 1.2 (1.155) – Administrace servisu a oznámení oddělené z hlavního UI modulu.
try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('admin-service-usage.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}

function formatAdminServiceCount(value) {
  if (value === null || typeof value === 'undefined') return '—';
  return String(Number(value || 0) || 0);
}

function formatAdminUsageDate(value, includeSeconds) {
  try {
    const d = value ? new Date(value) : null;
    if (!d || Number.isNaN(d.getTime())) return '—';
    const opts = includeSeconds
      ? { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }
      : { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' };
    return d.toLocaleString('cs-CZ', opts);
  } catch (err) { return '—'; }
}

function getAdminServiceSnapshotCache() {
  return app && app.adminServiceSnapshot && typeof app.adminServiceSnapshot === 'object' ? app.adminServiceSnapshot : null;
}

async function loadAdminServiceSnapshotFromSupabase() {
  if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.getAdminServiceSnapshot === 'function') {
    const result = await window.RotationSupabaseBridge.getAdminServiceSnapshot();
    app.adminServiceSnapshot = result || null;
    return result;
  }
  app.adminServiceSnapshot = { ok: false, reason: 'missing-bridge', counts: {} };
  return app.adminServiceSnapshot;
}

async function cleanupAdminExpiredInvites() {
  if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.cleanupExpiredGameInvites === 'function') {
    return window.RotationSupabaseBridge.cleanupExpiredGameInvites();
  }
  return { ok: false, reason: 'missing-bridge' };
}

function adminServiceStatusItemHtml(label, value, detail, state) {
  const safeState = state || 'ok';
  return [
    '<div class="adminServiceStatusItem is' + escapeHtml(safeState.charAt(0).toUpperCase() + safeState.slice(1)) + '">',
    '  <span>' + escapeHtml(label || '') + '</span>',
    '  <b>' + escapeHtml(value || '') + '</b>',
    detail ? '  <small>' + escapeHtml(detail) + '</small>' : '',
    '</div>'
  ].join('');
}

function buildAdminServiceStatusHtml(snapshot, sync, profileUi, pwa) {
  const counts = snapshot && snapshot.counts ? snapshot.counts : {};
  const pendingInvites = Number(counts.game_invites_pending || 0) || 0;
  const newReports = Number(counts.bug_reports_new || 0) || 0;
  const activeSessions = Number(counts.game_sessions_active || 0) || 0;
  const loadedAt = snapshot && snapshot.at ? formatAdminUsageDate(snapshot.at, true) : '';
  const syncLabel = sync ? String(sync.label || sync.kind || sync.status || 'stav známý') : 'nenačteno';
  const updatePending = !!(pwa && pwa.updateToastVisible);
  const profileLabel = profileUi && profileUi.account ? String(profileUi.account) : 'bez profilu';
  const issues = newReports + pendingInvites;
  const items = [
    {
      label: 'Online stav',
      value: snapshot ? (snapshot.ok ? 'načteno' : 'chyba') : 'nenačteno',
      detail: snapshot ? (snapshot.ok ? ('Poslední načtení: ' + (loadedAt || 'teď') + '.') : ('Důvod: ' + String(snapshot.reason || (snapshot.error && snapshot.error.message) || 'zkontroluj připojení.'))) : 'Klikni na Načíst stav.',
      state: snapshot && snapshot.ok ? 'ok' : 'warn'
    },
    {
      label: 'Synchronizace',
      value: syncLabel,
      detail: 'Ruční synchronizace je dostupná tlačítkem níže.',
      state: sync ? 'ok' : 'info'
    },
    {
      label: 'K řešení',
      value: String(issues),
      detail: String(newReports) + ' nové reporty · ' + String(pendingInvites) + ' čekající pozvánky.',
      state: issues ? 'warn' : 'ok'
    },
    {
      label: 'Provoz',
      value: String(activeSessions) + ' aktivní session',
      detail: 'profil ' + profileLabel + (updatePending ? ' · čeká update.' : '.'),
      state: updatePending ? 'warn' : 'info'
    }
  ];
  return [
    '<div class="adminServiceStatus" id="adminServiceStatus">',
    '  <div class="appMenuSubTitle">Stav servisu</div>',
    '  <div class="smallText uMb10">Rychlá kontrola před údržbou. Tlačítka níže teprve spouští synchronizaci, aktualizaci nebo úklid.</div>',
    '  <div class="adminServiceStatusGrid">',
    items.map((item) => adminServiceStatusItemHtml(item.label, item.value, item.detail, item.state)).join(''),
    '  </div>',
    '</div>'
  ].join('');
}

function buildAdminServiceHtml() {
  const snapshot = getAdminServiceSnapshotCache();
  const counts = snapshot && snapshot.counts ? snapshot.counts : {};
  const sync = snapshot && snapshot.sync ? snapshot.sync : (typeof getSupabaseSyncStatus === 'function' ? getSupabaseSyncStatus() : null);
  const profileUi = typeof getProfileUiSyncStatus === 'function' ? getProfileUiSyncStatus() : null;
  const pwa = typeof getPwaHardeningStatus === 'function' ? getPwaHardeningStatus() : null;
  const statusText = snapshot
    ? (snapshot.ok ? ('Načteno ' + new Date(snapshot.at || Date.now()).toLocaleString('cs-CZ')) : 'Servisní stav se nepodařilo načíst.')
    : 'Klikni na Načíst stav a uvidíš online počty.';
  const rows = [
    ['Hráčské profily', counts.game_accounts],
    ['Herní statistiky', counts.game_stats],
    ['Profilový vzhled', counts.profile_ui_settings],
    ['Pozvánky celkem', counts.game_invites],
    ['Čekající pozvánky', counts.game_invites_pending],
    ['Session celkem', counts.game_sessions],
    ['Aktivní session', counts.game_sessions_active],
    ['Nové reporty', counts.bug_reports_new]
  ].map(pair => '<div class="adminServiceMetric"><span>' + escapeHtml(pair[0]) + '</span><b>' + escapeHtml(formatAdminServiceCount(pair[1])) + '</b></div>').join('');
  return [
    '<div class="appMenuCard appMenuAdminCard adminServiceCard">',
    '  <div class="appMenuCardTitle">Servis / synchronizace</div>',
    '  <div class="appMenuText">',
    '    <div>Tady je rychlá údržba appky: sync rozpisu, herních statistik, kontrola aktualizace a úklid starých pozvánek.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">' + escapeHtml(statusText) + '</div>',
    '  </div>',
    buildAdminServiceStatusHtml(snapshot, sync, profileUi, pwa),
    '  <div class="adminServiceGrid">' + rows + '</div>',
    '  <div class="adminServiceDiag smallText">',
    sync ? ('Online stav: ' + escapeHtml(sync.label || sync.kind || '—') + '<br>') : '',
    profileUi ? ('Profilový vzhled: ' + escapeHtml(profileUi.account || 'bez profilu') + ' · theme ' + escapeHtml(profileUi.themeId || '—') + ' · pozadí ' + escapeHtml(profileUi.backgroundId || '—') + '<br>') : '',
    pwa ? ('PWA: poslední kontrola ' + escapeHtml(pwa.lastUpdateCheckAgoMs === null ? '—' : Math.round(Number(pwa.lastUpdateCheckAgoMs || 0) / 1000) + ' s') + ' · čeká update ' + escapeHtml(pwa.updateToastVisible ? 'ano' : 'ne')) : '',
    '  </div>',
    '  <div class="appMenuActionRow adminServiceActions">',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="service-sync-now">Vynutit synchronizaci</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="service-update-check">Kontrola aktualizace</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="service-load-status">Načíst stav</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="service-clean-invites">Vyčistit pozvánky</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="export">Export ZIP (stáhnout app)</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');
}

function rakFormatDatetimeLocal(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

function rakDatetimeLocalToIso(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString();
}

function adminAnnouncementParseDate(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function adminAnnouncementFormatDate(value) {
  const date = value instanceof Date ? value : adminAnnouncementParseDate(value);
  if (!date) return '';
  try {
    return date.toLocaleString('cs-CZ', { dateStyle: 'short', timeStyle: 'short' });
  } catch (err) {
    const pad = (n) => String(n).padStart(2, '0');
    return pad(date.getDate()) + '.' + pad(date.getMonth() + 1) + '.' + date.getFullYear() + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
  }
}

function readAdminAnnouncementDraftFromDom(root) {
  const scope = root || document.getElementById('appMenuBody') || document;
  const get = (id) => String(scope.querySelector && scope.querySelector('#' + id)?.value || '').trim();
  const checked = (id) => !!(scope.querySelector && scope.querySelector('#' + id)?.checked);
  return {
    title: get('adminAnnouncementTitle'),
    message: get('adminAnnouncementMessage'),
    startAt: rakDatetimeLocalToIso(get('adminAnnouncementStart')),
    endAt: rakDatetimeLocalToIso(get('adminAnnouncementEnd')),
    isActive: checked('adminAnnouncementActive'),
    marquee: checked('adminAnnouncementMarquee')
  };
}

function adminAnnouncementRefreshStatus(root) {
  const scope = root || document.getElementById('appMenuBody') || document;
  const payload = readAdminAnnouncementDraftFromDom(scope);
  const preview = scope.querySelector ? scope.querySelector('.adminAnnouncementPreview') : null;
  if (preview) {
    const label = preview.querySelector('.dashboardAnnouncementLabel');
    const track = preview.querySelector('.dashboardAnnouncementTrack');
    const text = track ? track.querySelector('span') : null;
    if (label) label.textContent = payload.title || 'Náhled';
    if (text) text.textContent = payload.message || 'Tady pojede nastavený text oznámení.';
    if (track) track.classList.toggle('isMarquee', payload.marquee !== false);
    preview.classList.toggle('isMuted', !payload.isActive || !payload.message);
  }
}

function buildAdminAnnouncementHtml() {
  const current = typeof window.readRakDashboardAdminAnnouncement === 'function'
    ? window.readRakDashboardAdminAnnouncement()
    : (typeof window.readRakLocalDashboardAnnouncement === 'function' ? window.readRakLocalDashboardAnnouncement() : null);
  const active = current && current.isActive !== false;
  const marquee = !current || current.marquee !== false;
  const health = typeof window.getRakDashboardAnnouncementHealth === 'function' ? window.getRakDashboardAnnouncementHealth() : null;
  const status = health
    ? ('Stav: ' + (health.domPresent ? 'panel připraven' : 'panel nenalezen') + ' · aktivní teď: ' + (health.activeHasMessage ? 'ano' : 'ne'))
    : 'Oznámení se ukládá lokálně v této appce.';
  return [
    '<div class="appMenuCard appMenuAdminCard adminAnnouncementCard">',
    '  <div class="appMenuCardTitle">Oznámení na Dashboardu</div>',
    '  <div class="appMenuText">',
    '    <div>Nastavíš text, který se zobrazí nad prvním panelem na Dashboardu. Ukládá se lokálně v této appce a má se znovu ukázat i po vypnutí a zapnutí.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">' + escapeHtml(status) + '</div>',
    '  </div>',
    '  <label class="appMenuFieldLabel" for="adminAnnouncementTitle">Nadpis <span class="smallText">volitelné</span></label>',
    '  <input class="appMenuInlineInput adminAnnouncementInput" id="adminAnnouncementTitle" maxlength="80" value="' + escapeHtml(current ? current.title || '' : '') + '" placeholder="Volitelné – klidně nech prázdné">',
    '  <label class="appMenuFieldLabel" for="adminAnnouncementMessage">Text</label>',
    '  <textarea class="appMenuReportTextarea adminAnnouncementTextarea" id="adminAnnouncementMessage" maxlength="500" rows="4" placeholder="Třeba: V pátek bude odstávka, počítej s tím.">' + escapeHtml(current ? current.message || '' : '') + '</textarea>',
    '  <div class="adminAnnouncementTwoCols">',
    '    <div><label class="appMenuFieldLabel" for="adminAnnouncementStart">Od</label><input class="appMenuInlineInput" id="adminAnnouncementStart" type="datetime-local" value="' + escapeHtml(rakFormatDatetimeLocal(current ? current.startAt : '')) + '"></div>',
    '    <div><label class="appMenuFieldLabel" for="adminAnnouncementEnd">Do</label><input class="appMenuInlineInput" id="adminAnnouncementEnd" type="datetime-local" value="' + escapeHtml(rakFormatDatetimeLocal(current ? current.endAt : '')) + '"></div>',
    '  </div>',
    '  <div class="adminAnnouncementToggleRow">',
    '    <label class="adminAnnouncementCheck"><input id="adminAnnouncementActive" type="checkbox" ' + (active ? 'checked' : '') + '><span>Aktivní</span></label>',
    '    <label class="adminAnnouncementCheck"><input id="adminAnnouncementMarquee" type="checkbox" ' + (marquee ? 'checked' : '') + '><span>Text má jezdit</span></label>',
    '  </div>',
    '  <div class="dashboardAnnouncementBar adminAnnouncementPreview isVisible" aria-hidden="true">',
    '    <div class="dashboardAnnouncementLabel">Náhled</div>',
    '    <div class="dashboardAnnouncementTrack isMarquee"><span>' + escapeHtml((current && current.message) ? current.message : 'Tady pojede nastavený text oznámení.') + '</span></div>',
    '  </div>',
    '  <div class="appMenuActionRow adminAnnouncementActions">',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="save-announcement">Uložit oznámení</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="clear-announcement">Vypnout oznámení</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');
}

function readAdminAnnouncementFromDom() {
  return readAdminAnnouncementDraftFromDom(document);
}

try {
  window.buildAdminServiceStatusHtml = buildAdminServiceStatusHtml;
  window.adminAnnouncementRefreshStatus = adminAnnouncementRefreshStatus;
} catch (err) {}
