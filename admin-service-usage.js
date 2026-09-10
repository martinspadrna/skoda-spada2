// RaK 1.2 (1.155) – Administrace servisu a oznámení oddělené z hlavního UI modulu.
try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('admin-service-usage.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}

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

function buildAdminServiceHtml() {
  const sync = typeof getSupabaseSyncStatus === 'function' ? getSupabaseSyncStatus() : null;
  const pwa = typeof getPwaHardeningStatus === 'function' ? getPwaHardeningStatus() : null;
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
  const syncLabel = offline ? 'offline' : (sync ? String(sync.label || sync.kind || sync.status || 'stav známý') : 'nenačteno');
  const updatePending = !!(pwa && pwa.updateToastVisible);
  const items = [
    {
      label: 'Synchronizace',
      value: syncLabel,
      detail: offline ? 'Zařízení je offline.' : 'Ruční synchronizace pracovních dat je dostupná tlačítkem níže.',
      state: offline ? 'warn' : (sync ? 'ok' : 'info')
    },
    {
      label: 'Aktualizace',
      value: updatePending ? 'čeká update' : 'bez čekajícího updatu',
      detail: 'Kontrola aktualizace ověří novou verzi PWA bez sledování používání.',
      state: updatePending ? 'warn' : 'ok'
    }
  ];
  return [
    '<div class="appMenuCard appMenuAdminCard adminServiceCard">',
    '  <div class="appMenuCardTitle">Servis / synchronizace</div>',
    '  <div class="appMenuText">',
    '    <div>Rychlá údržba appky: synchronizace pracovních dat, kontrola aktualizace, reporty chyb a export.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Servisní akce se spustí až po klepnutí na tlačítko.</div>',
    '  </div>',
    '  <div class="adminServiceStatus" id="adminServiceStatus">',
    '    <div class="appMenuSubTitle">Stav servisu</div>',
    '    <div class="adminServiceStatusGrid">',
    items.map((item) => adminServiceStatusItemHtml(item.label, item.value, item.detail, item.state)).join(''),
    '    </div>',
    '  </div>',
    '  <div class="adminServicePrivacyNote smallText">Servis nevede přehled připojených zařízení ani běžného používání aplikace.</div>',
    '  <div class="appMenuActionRow adminServiceActions">',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="service-sync-now">Vynutit synchronizaci</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="service-update-check">Kontrola aktualizace</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="open-reports">Reporty chyb</button>',
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
