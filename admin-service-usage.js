// RaK 1.2 (1.38) – Administrace Připojení, servis a oznámení oddělené z hlavního UI modulu.
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

function formatAdminUsageAgo(value) {
  const minutes = Number(value);
  if (!Number.isFinite(minutes)) return '';
  if (minutes < 1) return 'teď';
  if (minutes < 60) return 'před ' + Math.round(minutes) + ' min';
  if (minutes < 60 * 24) return 'před ' + Math.round(minutes / 60) + ' h';
  return 'před ' + Math.round(minutes / 60 / 24) + ' dny';
}

function shortAdminUsageDevice(value) {
  const ua = String(value || '');
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/iPad/i.test(ua)) return 'iPad';
  if (/Android/i.test(ua)) return 'Android';
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Macintosh|Mac OS/i.test(ua)) return 'Mac';
  return ua ? ua.slice(0, 42) : 'Zařízení neznámé';
}

function formatAdminUsageViewport(info) {
  const base = info && typeof info === 'object' ? info : {};
  const parseMaybeJson = (value) => {
    if (value && typeof value === 'object') return value;
    const raw = String(value || '').trim();
    if (!raw) return {};
    try { return JSON.parse(raw); } catch (err) { return { raw }; }
  };
  const mergeDeviceInfo = (value) => {
    const parsed = parseMaybeJson(value);
    if (parsed && (parsed.viewport || parsed.screen || parsed.dpr || parsed.viewportWidth || parsed.screenWidth)) return parsed;
    return {};
  };
  const nested = Object.assign({}, mergeDeviceInfo(base.screen), mergeDeviceInfo(base.raw), mergeDeviceInfo(base.deviceInfo));
  const obj = Object.assign({}, base, nested);
  const vp = parseMaybeJson(obj.viewport);
  const scrCandidate = parseMaybeJson(obj.screen);
  const scr = scrCandidate && (scrCandidate.width || scrCandidate.height)
    ? scrCandidate
    : parseMaybeJson(scrCandidate.screen || obj.screenInfo || obj.display || '');
  const nestedVp = scrCandidate && scrCandidate.viewport ? parseMaybeJson(scrCandidate.viewport) : {};
  const nestedScr = scrCandidate && scrCandidate.screen ? parseMaybeJson(scrCandidate.screen) : {};
  const w = Number(vp.width || nestedVp.width || obj.viewportWidth || obj.innerWidth || 0) || 0;
  const h = Number(vp.height || nestedVp.height || obj.viewportHeight || obj.innerHeight || 0) || 0;
  const dpr = Number(vp.dpr || nestedVp.dpr || obj.dpr || obj.devicePixelRatio || 0) || 0;
  const sw = Number(nestedScr.width || scr.width || obj.screenWidth || 0) || 0;
  const sh = Number(nestedScr.height || scr.height || obj.screenHeight || 0) || 0;
  const rawScreen = scr.raw && !/^Europe\//i.test(String(scr.raw)) ? String(scr.raw) : '';
  const parts = [];
  if (w && h) parts.push('Viewport ' + w + '×' + h);
  if (sw && sh && (sw !== w || sh !== h)) parts.push('Screen ' + sw + '×' + sh);
  else if (!w && !h && sw && sh) parts.push('Screen ' + sw + '×' + sh);
  else if (!w && !h && rawScreen) parts.push(rawScreen);
  if (dpr) parts.push('DPR ' + dpr);
  return parts.filter(Boolean).join(' · ') || '—';
}

async function loadAdminAppUsageFromSupabase() {
  if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.loadAppUsage === 'function') {
    const result = await window.RotationSupabaseBridge.loadAppUsage({ limit: 100 });
    app.adminUsageSnapshot = result || null;
    return app.adminUsageSnapshot;
  }
  app.adminUsageSnapshot = { ok: false, reason: 'missing-bridge', devices: [], events: [], summary: {} };
  return app.adminUsageSnapshot;
}

async function recordAdminAppUsageNow() {
  if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.recordAppUsage === 'function') {
    return window.RotationSupabaseBridge.recordAppUsage({ force: true, eventType: 'admin-manual-check' });
  }
  return { ok: false, reason: 'missing-bridge' };
}

function buildAdminUsageGroups(devices) {
  const rows = Array.isArray(devices) ? devices : [];
  const map = new Map();
  rows.forEach((row) => {
    const displayName = String(row.player_name || row.account_number || 'Bez profilu').trim() || 'Bez profilu';
    const keyBase = String(row.player_name || row.account_number || '').trim().toLowerCase();
    const key = keyBase || ('device:' + String(row.device_key || row.device_id || Math.random()).slice(0, 96));
    if (!map.has(key)) {
      map.set(key, {
        key,
        name: displayName,
        account: String(row.account_number || '').trim(),
        devices: [],
        openCount: 0,
        firstSeen: null,
        lastSeen: null,
        newest: null,
        appVersions: new Set(),
        displays: new Set()
      });
    }
    const group = map.get(key);
    group.devices.push(row);
    group.openCount += Number(row.open_count || 0) || 0;
    if (row.app_version) group.appVersions.add(String(row.app_version));
    const display = formatAdminUsageViewport(row.device_info);
    if (display && display !== '—') group.displays.add(display);
    const lastTime = Date.parse(row.last_seen_at || '') || 0;
    const firstTime = Date.parse(row.first_seen_at || '') || 0;
    if (!group.lastSeen || lastTime > (Date.parse(group.lastSeen) || 0)) {
      group.lastSeen = row.last_seen_at || group.lastSeen;
      group.newest = row;
    }
    if (row.first_seen_at && (!group.firstSeen || firstTime < (Date.parse(group.firstSeen) || 0))) {
      group.firstSeen = row.first_seen_at;
    }
  });
  return Array.from(map.values()).sort((a, b) => (Date.parse(b.lastSeen || '') || 0) - (Date.parse(a.lastSeen || '') || 0));
}

function buildAdminUsageHtml() {
  const snapshot = app && app.adminUsageSnapshot && typeof app.adminUsageSnapshot === 'object'
    ? app.adminUsageSnapshot
    : null;
  const ok = !!(snapshot && snapshot.ok !== false);
  const devices = snapshot && Array.isArray(snapshot.devices) ? snapshot.devices : [];
  const groups = buildAdminUsageGroups(devices);
  const events = snapshot && Array.isArray(snapshot.events) ? snapshot.events : [];
  const summary = snapshot && snapshot.summary && typeof snapshot.summary === 'object' ? snapshot.summary : {};
  const status = snapshot
    ? (ok ? ('Načteno ' + formatAdminUsageDate(snapshot.fetchedAt || new Date().toISOString())) : ('Nepodařilo se načíst: ' + String((snapshot.error && snapshot.error.message) || snapshot.reason || 'zkontroluj Supabase migraci.')))
    : 'Zatím nenačteno. Klikni na Načíst připojení.';
  const newestGroup = groups[0] || null;
  const cards = [
    ['Jména / profily', groups.length],
    ['Zařízení celkem', summary.device_count ?? devices.length],
    ['Aktivní 24 h', summary.active_24h ?? '—'],
    ['Aktivní 7 dní', summary.active_7d ?? '—']
  ].map(pair => '<div class="adminUsageMetric"><span>' + escapeHtml(pair[0]) + '</span><b>' + escapeHtml(String(pair[1])) + '</b></div>').join('');
  const list = groups.length ? groups.map((group) => {
    const newest = group.newest || group.devices[0] || {};
    const ago = formatAdminUsageAgo(newest.minutes_since_seen);
    const deviceCount = group.devices.length;
    const versions = Array.from(group.appVersions).slice(0, 3).join(' · ') || '—';
    const displays = Array.from(group.displays).slice(0, 4);
    const displayText = displays.length ? displays.join(' | ') : '—';
    const deviceRows = group.devices
      .slice()
      .sort((a, b) => (Date.parse(b.last_seen_at || '') || 0) - (Date.parse(a.last_seen_at || '') || 0))
      .map((row, index) => {
        const device = shortAdminUsageDevice(row.user_agent || '');
        const hash = row.last_ip_hash ? String(row.last_ip_hash).slice(0, 10) + '…' : '—';
        return [
          '<div class="adminUsageDeviceRow">',
          '  <div class="adminUsageDeviceHead"><b>' + escapeHtml(device || ('Zařízení ' + (index + 1))) + '</b><em>' + escapeHtml(String(row.open_count || 0) + '×') + '</em></div>',
          '  <div><b>Naposledy:</b> ' + escapeHtml(formatAdminUsageDate(row.last_seen_at, true)) + '</div>',
          '  <div><b>Poprvé:</b> ' + escapeHtml(formatAdminUsageDate(row.first_seen_at, true)) + '</div>',
          '  <div><b>Verze:</b> ' + escapeHtml(row.app_version || '—') + '</div>',
          '  <div><b>Displej:</b> ' + escapeHtml(formatAdminUsageViewport(row.device_info)) + '</div>',
          '  <div><b>IP hash:</b> ' + escapeHtml(hash) + '</div>',
          '  <div class="smallText adminUsageUa">' + escapeHtml(row.user_agent || '—') + '</div>',
          '</div>'
        ].join('');
      }).join('');
    return [
      '<details class="adminUsageItem">',
      '  <summary class="adminUsageSummary">',
      '    <span><b>' + escapeHtml(group.name) + '</b><small>' + escapeHtml(String(deviceCount) + ' zařízení · ' + (ago || formatAdminUsageDate(group.lastSeen))) + '</small></span>',
      '    <em>' + escapeHtml(String(group.openCount || 0) + '×') + '</em>',
      '  </summary>',
      '  <div class="adminUsageBody">',
      '    <div><b>Naposledy:</b> ' + escapeHtml(formatAdminUsageDate(group.lastSeen, true)) + '</div>',
      '    <div><b>Poprvé:</b> ' + escapeHtml(formatAdminUsageDate(group.firstSeen, true)) + '</div>',
      group.account ? ('    <div><b>Profil:</b> ' + escapeHtml(group.account) + '</div>') : '',
      '    <div><b>Verze:</b> ' + escapeHtml(versions) + '</div>',
      '    <div><b>Displeje:</b> ' + escapeHtml(displayText) + '</div>',
      '    <div class="adminUsageDeviceList">' + deviceRows + '</div>',
      '  </div>',
      '</details>'
    ].join('');
  }).join('') : '<div class="smallText adminUsageEmpty">Zatím tu nejsou žádná zařízení. Jakmile někdo otevře novou verzi a Supabase migrace bude nasazená, objeví se tady.</div>';
  const recentEvents = events.slice(0, 8).map((ev) => {
    const label = [ev.player_name || ev.account_number || 'Bez profilu', ev.event_type || 'open', formatAdminUsageDate(ev.seen_at)].filter(Boolean).join(' · ');
    return '<div class="adminUsageEvent">' + escapeHtml(label) + '</div>';
  }).join('');
  return [
    '<div class="appMenuCard appMenuAdminCard adminUsageCard">',
    '  <div class="appMenuCardTitle">Přehled připojení</div>',
    '  <div class="appMenuText">',
    '    <div>Každé jméno je tady jen jednou. Po rozkliknutí uvidíš všechna zařízení, ze kterých se profil připojil, včetně rozlišení displeje.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">' + escapeHtml(status) + '</div>',
    '  </div>',
    '  <div class="adminUsageGrid">' + cards + '</div>',
    newestGroup ? ('  <div class="adminUsageLatest smallText">Naposledy: ' + escapeHtml(String(newestGroup.name || 'Bez profilu')) + ' · ' + escapeHtml(formatAdminUsageDate(newestGroup.lastSeen, true)) + '</div>') : '',
    '  <div class="adminUsageList">' + list + '</div>',
    recentEvents ? ('  <div class="adminUsageEvents"><div class="smallText">Poslední události</div>' + recentEvents + '</div>') : '',
    '  <div class="appMenuActionRow adminUsageActions">',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="usage-load">Načíst připojení</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');
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
    ['Nové reporty', counts.bug_reports_new],
    ['Zařízení v appce', counts.app_usage_devices],
    ['Otevření 24 h', counts.app_usage_events_24h]
  ].map(pair => '<div class="adminServiceMetric"><span>' + escapeHtml(pair[0]) + '</span><b>' + escapeHtml(formatAdminServiceCount(pair[1])) + '</b></div>').join('');
  return [
    '<div class="appMenuCard appMenuAdminCard adminServiceCard">',
    '  <div class="appMenuCardTitle">Servis / synchronizace</div>',
    '  <div class="appMenuText">',
    '    <div>Tady je rychlá údržba appky: sync rozpisu, herních statistik, kontrola aktualizace a úklid starých pozvánek.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">' + escapeHtml(statusText) + '</div>',
    '  </div>',
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
  const title = String(document.getElementById('adminAnnouncementTitle')?.value || '').trim();
  const message = String(document.getElementById('adminAnnouncementMessage')?.value || '').trim();
  const startAt = rakDatetimeLocalToIso(document.getElementById('adminAnnouncementStart')?.value || '');
  const endAt = rakDatetimeLocalToIso(document.getElementById('adminAnnouncementEnd')?.value || '');
  const isActive = !!document.getElementById('adminAnnouncementActive')?.checked;
  const marquee = !!document.getElementById('adminAnnouncementMarquee')?.checked;
  return { title, message, startAt, endAt, isActive, marquee };
}
