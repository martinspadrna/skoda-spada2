// RaK 1.2 (1.65) – dashboard a domácí přehled.

function setDashboardHtmlIfChanged(element, html, key) {
  if (!element) return false;
  if (typeof setElementHtmlIfChanged === 'function') {
    return setElementHtmlIfChanged(element, html, key || element.id || 'dashboard');
  }
  const nextHtml = String(html ?? '');
  if (element.innerHTML === nextHtml) return false;
  element.innerHTML = nextHtml;
  return true;
}

function setDashboardTextIfChanged(element, text, key) {
  if (!element) return false;
  if (typeof setElementTextIfChanged === 'function') {
    return setElementTextIfChanged(element, text, key || element.id || 'dashboardText');
  }
  const nextText = String(text ?? '');
  if (element.textContent === nextText) return false;
  element.textContent = nextText;
  return true;
}

function setDashboardClassNameIfChanged(element, className, key) {
  if (!element) return false;
  if (typeof setElementClassNameIfChanged === 'function') {
    return setElementClassNameIfChanged(element, className, key || element.id || 'dashboardClass');
  }
  const nextClassName = String(className ?? '');
  if (element.className === nextClassName) return false;
  element.className = nextClassName;
  return true;
}
function getDashboardShiftTeams() {
  return (typeof SHIFT_CYCLE_ORDER !== 'undefined' && Array.isArray(SHIFT_CYCLE_ORDER) && SHIFT_CYCLE_ORDER.length)
    ? SHIFT_CYCLE_ORDER
    : ['B', 'D', 'A', 'C'];
}

function getDashboardNextWorkShift(now) {
  if (typeof getTeamShiftState !== 'function') return null;
  const base = new Date(now || new Date());
  const teams = getDashboardShiftTeams();
  const candidates = [];

  const collect = (probe) => {
    teams.forEach((team) => {
      try {
        const state = getTeamShiftState(probe, team);
        if (!state) return;
        if (state.active && state.start && state.start > base) {
          candidates.push({ team, label: state.label || '', start: state.start, end: state.end || null });
        }
        if (state.next && state.next.start && state.next.start > base) {
          candidates.push({ team, label: state.next.label || '', start: state.next.start, end: state.next.end || null });
        }
      } catch (err) {
        // ignore one broken team probe and keep the dashboard usable
      }
    });
  };

  collect(base);

  // During long shutdowns/holidays the nearest allowed shift can be outside the basic +/-1 week window.
  // Probe farther ahead so the dashboard shows a useful "next shift" instead of a dash.
  if (!candidates.length) {
    for (let hours = 6; hours <= 45 * 24; hours += 6) {
      collect(new Date(base.getTime() + hours * 60 * 60 * 1000));
      if (candidates.length) break;
    }
  }

  const seen = new Set();
  return candidates
    .filter((item) => item && item.start instanceof Date && !Number.isNaN(item.start.getTime()))
    .filter((item) => {
      const key = [item.team, item.label, item.start.getTime()].join('|');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.start - b.start)[0] || null;
}

function getDashboardNextTeamShift(now, team = 'D') {
  if (typeof getTeamShiftState !== 'function') return null;
  const base = new Date(now || new Date());
  const targetTeam = String(team || 'D').trim().toUpperCase() || 'D';
  const candidates = [];

  const collect = (probe) => {
    try {
      const state = getTeamShiftState(probe, targetTeam);
      if (!state) return;
      if (state.active && state.start && state.start > base) {
        candidates.push({ team: targetTeam, label: state.label || '', start: state.start, end: state.end || null });
      }
      if (state.next && state.next.start && state.next.start > base) {
        candidates.push({ team: targetTeam, label: state.next.label || '', start: state.next.start, end: state.next.end || null });
      }
    } catch (err) {
      // Dashboard nesmí spadnout jen kvůli jedné směnové kontrole.
    }
  };

  collect(base);

  if (!candidates.length) {
    for (let hours = 6; hours <= 60 * 24; hours += 6) {
      collect(new Date(base.getTime() + hours * 60 * 60 * 1000));
      if (candidates.length) break;
    }
  }

  const seen = new Set();
  return candidates
    .filter((item) => item && item.start instanceof Date && !Number.isNaN(item.start.getTime()))
    .filter((item) => {
      const key = [item.team, item.label, item.start.getTime()].join('|');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.start - b.start)[0] || null;
}


function getDashboardActiveWorkShift(now) {
  if (typeof getActiveShiftNow === 'function') {
    try {
      const active = getActiveShiftNow(now);
      if (active) return active;
    } catch (err) {
      // Fallback níže udrží dashboard použitelný i při chybě jedné směnové kontroly.
    }
  }
  if (typeof getTeamShiftState !== 'function') return null;
  const teams = getDashboardShiftTeams();
  for (const team of teams) {
    try {
      const state = getTeamShiftState(now, team);
      if (state && state.active) {
        return { team, label: state.label || '', start: state.start || null, end: state.end || null };
      }
    } catch (err) {
      // ignore one broken team probe and keep searching
    }
  }
  return null;
}

function getDashboardTeamDStatus(now) {
  const team = 'D';
  if (typeof getTeamShiftState !== 'function') return { active: null, next: null };
  try {
    const state = getTeamShiftState(now, team);
    const active = state && state.active
      ? { team, label: state.label || '', start: state.start || null, end: state.end || null }
      : null;
    const next = !active
      ? ((state && state.next && state.next.start)
        ? { team, label: state.next.label || '', start: state.next.start, end: state.next.end || null }
        : getDashboardNextTeamShift(now, team))
      : null;
    return { active, next };
  } catch (err) {
    return { active: null, next: getDashboardNextTeamShift(now, team) };
  }
}

function formatDashboardAbsenceList(names) {
  const list = Array.isArray(names) ? names.filter(Boolean) : [];
  return list.length ? list.join(', ') : 'nikdo';
}

function formatDashboardTeamDParts(now, teamDStatus) {
  const status = teamDStatus || getDashboardTeamDStatus(now);
  const active = status && status.active;
  const next = status && status.next;
  const safeDuration = (targetDate) => {
    if (!targetDate || typeof formatDuration !== 'function') return '';
    const ms = targetDate && targetDate.getTime ? targetDate.getTime() - now.getTime() : targetDate - now;
    return formatDuration(Math.max(0, ms));
  };

  if (active) {
    const names = typeof getAbsenceNamesForDate === 'function' ? getAbsenceNamesForDate(active.start || now) : [];
    return {
      main: '',
      sub: 'chybí: ' + formatDashboardAbsenceList(names)
    };
  }

  if (next && next.start) {
    const names = typeof getAbsenceNamesForDate === 'function' ? getAbsenceNamesForDate(next.start) : [];
    return {
      main: 'Směna D začíná za ' + safeDuration(next.start),
      sub: 'bude chybět: ' + formatDashboardAbsenceList(names)
    };
  }

  return { main: 'Směna D: další směna nenalezena', sub: '' };
}

function formatDashboardTeamDLine(now, teamDStatus) {
  const parts = typeof formatDashboardTeamDParts === 'function'
    ? formatDashboardTeamDParts(now, teamDStatus)
    : { main: '', sub: '' };
  return [parts.main, parts.sub].filter(Boolean).join(' · ');
}

function renderDashboardTeamDLine(now, teamDStatus, esc) {
  const escapeValue = typeof esc === 'function'
    ? esc
    : (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[ch]));
  const parts = typeof formatDashboardTeamDParts === 'function'
    ? formatDashboardTeamDParts(now, teamDStatus)
    : { main: formatDashboardTeamDLine(now, teamDStatus), sub: '' };
  const main = parts && parts.main ? '<span class="dashboardHeroLine3Main">' + escapeValue(parts.main) + '</span>' : '';
  const sub = parts && parts.sub ? '<span class="dashboardHeroLine3Sub">' + escapeValue(parts.sub) + '</span>' : '';
  return main + sub;
}

function formatDashboardShiftName(shift) {
  if (!shift) return '';
  return String(shift.team || '—') + (shift.label ? ' (' + shift.label + ')' : '');
}

function formatDashboardNextShiftMeta(shift) {
  if (!shift || !shift.start) return '';
  try {
    const formatter = new Intl.DateTimeFormat('cs-CZ', {
      weekday: 'short',
      day: 'numeric',
      month: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return formatter.format(shift.start).replace(/\s+/g, ' ');
  } catch (err) {
    return String(shift.start.getDate()) + '.' + String(shift.start.getMonth() + 1) + '. ' + String(shift.start.getHours()).padStart(2, '0') + ':' + String(shift.start.getMinutes()).padStart(2, '0');
  }
}



// v.1.5 (963) – Dashboard oznámení je globální online-first; localStorage slouží jen jako rychlá cache/fallback.
const RAK_DASHBOARD_ANNOUNCEMENT_KEY = (typeof APP_KEY !== 'undefined' ? APP_KEY : 'rak') + ':dashboardAnnouncementV1';

function parseRakAnnouncementDate(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeRakDashboardAnnouncement(raw) {
  const base = raw && typeof raw === 'object' ? raw : {};
  const message = String(base.message || base.text || base.body || '').trim().slice(0, 500);
  const title = String(base.title || '').trim().slice(0, 80);
  const startAt = String(base.startAt || base.start_at || base.starts_at || base.valid_from || base.from || '').trim();
  const endAt = String(base.endAt || base.end_at || base.ends_at || base.valid_to || base.to || '').trim();
  return {
    id: String(base.id || 'local-dashboard-announcement').trim().slice(0, 80) || 'local-dashboard-announcement',
    title,
    message,
    startAt,
    endAt,
    isActive: base.isActive === false || base.is_active === false ? false : true,
    marquee: base.marquee === false ? false : true,
    source: String(base.source || 'local-admin').trim().slice(0, 40) || 'local-admin',
    updatedAt: String(base.updatedAt || base.updated_at || base.created_at || new Date().toISOString())
  };
}

function readRakLocalDashboardAnnouncement() {
  try {
    // v.1.5 (963): čteme přímo z localStorage, aby se po restartu / návratu z bfcache
    // nepoužil starý JSON cache stav a oznámení se na Dashboardu spolehlivě obnovilo.
    const raw = localStorage.getItem(RAK_DASHBOARD_ANNOUNCEMENT_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw);
    return stored ? normalizeRakDashboardAnnouncement(stored) : null;
  } catch (err) {
    try {
      const stored = typeof parseLocalStorageJsonCached === 'function'
        ? parseLocalStorageJsonCached(RAK_DASHBOARD_ANNOUNCEMENT_KEY, null)
        : null;
      return stored ? normalizeRakDashboardAnnouncement(stored) : null;
    } catch (err2) {
      return null;
    }
  }
}

function writeRakLocalDashboardAnnouncement(payload) {
  const normalized = normalizeRakDashboardAnnouncement(Object.assign({}, payload || {}, {
    id: (payload && payload.id) || 'local-dashboard-announcement',
    source: (payload && payload.source) || 'local-admin',
    updatedAt: new Date().toISOString()
  }));
  try {
    const encoded = JSON.stringify(normalized);
    if (typeof setLocalStorageIfChanged === 'function') setLocalStorageIfChanged(RAK_DASHBOARD_ANNOUNCEMENT_KEY, encoded);
    else localStorage.setItem(RAK_DASHBOARD_ANNOUNCEMENT_KEY, encoded);
  } catch (err) {
    try { localStorage.setItem(RAK_DASHBOARD_ANNOUNCEMENT_KEY, JSON.stringify(normalized)); } catch (err2) {}
  }
  try { renderRakDashboardAnnouncement(); } catch (err) {}
  try { if (typeof updateDashboard === 'function') updateDashboard(); } catch (err) {}
  return normalized;
}

function clearRakLocalDashboardAnnouncement() {
  try { localStorage.removeItem(RAK_DASHBOARD_ANNOUNCEMENT_KEY); } catch (err) {}
  try { renderRakDashboardAnnouncement(); } catch (err) {}
  try { if (typeof updateDashboard === 'function') updateDashboard(); } catch (err) {}
  return { ok: true, cleared: true, key: RAK_DASHBOARD_ANNOUNCEMENT_KEY };
}

function isRakDashboardAnnouncementActive(item, now) {
  const a = normalizeRakDashboardAnnouncement(item);
  if (!a.isActive || !a.message) return false;
  const current = now instanceof Date ? now : new Date();
  const start = parseRakAnnouncementDate(a.startAt);
  const end = parseRakAnnouncementDate(a.endAt);
  if (start && current < start) return false;
  if (end && current > end) return false;
  return true;
}

function getRakSupabaseDashboardAnnouncement() {
  try {
    const bridge = typeof getSupabaseAnnouncement === 'function' ? getSupabaseAnnouncement() : null;
    if (bridge && (bridge.message || bridge.title)) {
      return normalizeRakDashboardAnnouncement(Object.assign({}, bridge, { source: 'supabase-online' }));
    }
  } catch (err) {}
  return null;
}

function getRakDashboardAnnouncementCandidates() {
  const items = [];
  // v.1.5 (963): globální oznámení má přednost. Lokální kopie je jen cache/fallback,
  // aby se poslední online oznámení ukázalo i při pomalejším startu nebo offline režimu.
  const online = getRakSupabaseDashboardAnnouncement();
  if (online) items.push(online);
  const local = readRakLocalDashboardAnnouncement();
  if (local) items.push(local);
  return items;
}

function getRakActiveDashboardAnnouncement(now) {
  const current = now instanceof Date ? now : new Date();
  return getRakDashboardAnnouncementCandidates()
    .map(normalizeRakDashboardAnnouncement)
    .filter(item => isRakDashboardAnnouncementActive(item, current))[0] || null;
}

function readRakDashboardAdminAnnouncement() {
  return getRakSupabaseDashboardAnnouncement() || readRakLocalDashboardAnnouncement();
}

function formatRakAnnouncementWindow(item) {
  const start = parseRakAnnouncementDate(item && item.startAt);
  const end = parseRakAnnouncementDate(item && item.endAt);
  const fmt = (d) => {
    try {
      return new Intl.DateTimeFormat('cs-CZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(d).replace(/\s+/g, ' ');
    } catch (err) { return ''; }
  };
  if (start && end) return fmt(start) + ' – ' + fmt(end);
  if (start) return 'od ' + fmt(start);
  if (end) return 'do ' + fmt(end);
  return '';
}

function renderRakDashboardAnnouncement(now) {
  const box = document.getElementById('dashboardAnnouncementBar');
  if (!box) return null;
  const active = getRakActiveDashboardAnnouncement(now || new Date());
  const esc = typeof escapeHtml === 'function'
    ? escapeHtml
    : (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  if (!active) {
    box.hidden = true;
    box.classList.remove('isVisible');
    box.innerHTML = '';
    return null;
  }
  const windowText = formatRakAnnouncementWindow(active);
  const tickerText = active.message;
  box.hidden = false;
  box.classList.add('isVisible');
  box.dataset.source = active.source || '';
  box.setAttribute('role', 'status');
  box.setAttribute('aria-live', 'polite');
  setDashboardHtmlIfChanged(box, [
    active.title ? '<div class="dashboardAnnouncementLabel">' + esc(active.title) + '</div>' : '',
    '<div class="dashboardAnnouncementTrack' + (active.marquee ? ' isMarquee' : '') + '"><span>' + esc(tickerText) + '</span></div>',
    windowText ? '<div class="dashboardAnnouncementWindow">' + esc(windowText) + '</div>' : ''
  ].join(''), 'dashboardAnnouncementBar');
  return active;
}

async function writeRakDashboardAnnouncement(payload) {
  const normalized = normalizeRakDashboardAnnouncement(Object.assign({}, payload || {}, {
    source: 'admin-online',
    updatedAt: new Date().toISOString()
  }));
  let onlineResult = null;
  let onlineOk = false;
  if (typeof window.saveRakDashboardAnnouncementOnline === 'function') {
    try {
      onlineResult = await window.saveRakDashboardAnnouncementOnline(normalized);
      onlineOk = !!(onlineResult && onlineResult.ok);
    } catch (err) {
      onlineResult = { ok: false, message: err && err.message ? err.message : String(err || 'online-save-failed') };
    }
  } else {
    onlineResult = { ok: false, message: 'online-helper-missing' };
  }
  const cachePayload = normalizeRakDashboardAnnouncement(Object.assign({}, normalized, {
    id: (onlineResult && onlineResult.row && onlineResult.row.id) || normalized.id || 'dashboard-announcement-cache',
    source: onlineOk ? 'supabase-online-cache' : 'local-fallback'
  }));
  const local = writeRakLocalDashboardAnnouncement(cachePayload);
  try { renderRakDashboardAnnouncement(); } catch (err) {}
  try { if (typeof updateDashboard === 'function') updateDashboard(); } catch (err) {}
  return {
    ok: onlineOk || !!local,
    online: onlineOk,
    localFallback: !onlineOk,
    payload: local,
    onlineResult,
    source: onlineOk ? 'supabase-online' : 'local-fallback'
  };
}

async function clearRakDashboardAnnouncement() {
  let onlineResult = null;
  let onlineOk = false;
  if (typeof window.clearRakDashboardAnnouncementOnline === 'function') {
    try {
      onlineResult = await window.clearRakDashboardAnnouncementOnline();
      onlineOk = !!(onlineResult && onlineResult.ok);
    } catch (err) {
      onlineResult = { ok: false, message: err && err.message ? err.message : String(err || 'online-clear-failed') };
    }
  } else {
    onlineResult = { ok: false, message: 'online-helper-missing' };
  }
  const local = clearRakLocalDashboardAnnouncement();
  try { renderRakDashboardAnnouncement(); } catch (err) {}
  try { if (typeof updateDashboard === 'function') updateDashboard(); } catch (err) {}
  return { ok: onlineOk || !!local, online: onlineOk, local, onlineResult, source: onlineOk ? 'supabase-online' : 'local-fallback' };
}

function getRakDashboardAnnouncementHealth() {
  const now = new Date();
  const local = readRakLocalDashboardAnnouncement();
  const online = getRakSupabaseDashboardAnnouncement();
  const active = getRakActiveDashboardAnnouncement(now);
  const box = typeof document !== 'undefined' ? document.getElementById('dashboardAnnouncementBar') : null;
  const onlineStatus = typeof window.getRakDashboardAnnouncementOnlineStatus === 'function'
    ? window.getRakDashboardAnnouncementOnlineStatus()
    : null;
  return {
    ok: true,
    version: String(window.APP_VERSION || 'unknown'),
    mode: 'dashboard-announcement-global-online-v949',
    key: RAK_DASHBOARD_ANNOUNCEMENT_KEY,
    hasLocalAnnouncement: !!(local && local.message),
    hasOnlineAnnouncement: !!(online && online.message),
    localIsActiveNow: !!(local && isRakDashboardAnnouncementActive(local, now)),
    onlineIsActiveNow: !!(online && isRakDashboardAnnouncementActive(online, now)),
    activeSource: active ? active.source : '',
    onlineFirst: true,
    localFallback: true,
    titleOptional: true,
    tickerDuplicatesMessage: false,
    activeTitle: active ? active.title : '',
    activeHasMessage: !!(active && active.message),
    marquee: !!(active && active.marquee),
    domPresent: !!box,
    domVisible: !!(box && !box.hidden && box.classList.contains('isVisible')),
    storageMode: 'supabase-online-with-local-cache',
    supabaseWrite: 'rpc-primary',
    onlineStatus,
    manualValidation: 'save-on-one-device-reopen-on-second-device'
  };
}

try {
  window.readRakLocalDashboardAnnouncement = readRakLocalDashboardAnnouncement;
  window.writeRakLocalDashboardAnnouncement = writeRakLocalDashboardAnnouncement;
  window.clearRakLocalDashboardAnnouncement = clearRakLocalDashboardAnnouncement;
  window.readRakDashboardAdminAnnouncement = readRakDashboardAdminAnnouncement;
  window.writeRakDashboardAnnouncement = writeRakDashboardAnnouncement;
  window.clearRakDashboardAnnouncement = clearRakDashboardAnnouncement;
  window.getRakActiveDashboardAnnouncement = getRakActiveDashboardAnnouncement;
  window.renderRakDashboardAnnouncement = renderRakDashboardAnnouncement;
  window.getRakDashboardAnnouncementHealth = getRakDashboardAnnouncementHealth;
} catch (err) {}

function updateDashboard() {
  const now = typeof getPragueNow === 'function' ? getPragueNow(new Date()) : new Date();
  const active = typeof getDashboardActiveWorkShift === 'function' ? getDashboardActiveWorkShift(now) : null;
  const nextWorkShift = !active && typeof getDashboardNextWorkShift === 'function' ? getDashboardNextWorkShift(now) : null;
  const teamDStatus = typeof getDashboardTeamDStatus === 'function' ? getDashboardTeamDStatus(now) : { active: null, next: null };
  const special = typeof getSpecialWorkInfo === 'function' ? getSpecialWorkInfo(now) : null;
  const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const showSpecial = !!(special && (!active || sameDay(active.start, now)));
  const vacationCountdown = typeof getVacationCountdown === 'function'
    ? getVacationCountdown(now)
    : { text: '--', meta: '' };
  const esc = typeof escapeHtml === 'function'
    ? escapeHtml
    : (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[ch]));
  const foodLocations = (typeof FOOD_LOCATIONS !== 'undefined' && Array.isArray(FOOD_LOCATIONS)) ? FOOD_LOCATIONS : [];
  const syncStatus = typeof getSupabaseSyncStatus === 'function' ? getSupabaseSyncStatus() : { kind: 'offline', label: '🟡 Offline cache', detail: '' };
  const firstFoodLocation = foodLocations[0] || null;
  const secondFoodLocation = foodLocations[1] || null;
  const hasFindFoodStatus = typeof findFoodStatus === 'function';
  const kantyna = firstFoodLocation && hasFindFoodStatus ? findFoodStatus(firstFoodLocation, now) : null;
  const jidelna = secondFoodLocation && hasFindFoodStatus ? findFoodStatus(secondFoodLocation, now) : null;

  const syncBadge = document.getElementById('dashboardSyncBadge');
  if (syncBadge) {
    setDashboardClassNameIfChanged(syncBadge, 'dashboardSyncBadge dashboardSyncBadge--' + esc(syncStatus.kind || 'offline'));
    setDashboardTextIfChanged(syncBadge, syncStatus.label || '🟡 Offline cache');
    if (typeof bindDashboardManualSyncBadge === 'function') bindDashboardManualSyncBadge();
  }

  const hero = document.getElementById('dashHero');
  if (hero) {
    const activeShiftLabel = active && active.label ? active.label : '';
    const nextShiftLabel = nextWorkShift && nextWorkShift.label ? nextWorkShift.label : '';
    const heroLine1Text = active
      ? 'Směna ' + String(active.team || '—') + ' je právě v práci' + (activeShiftLabel ? ': ' + activeShiftLabel : '')
      : (nextWorkShift
        ? 'Další směna v práci: ' + String(nextWorkShift.team || '—') + (nextShiftLabel ? ' · ' + nextShiftLabel : '')
        : (special ? 'Dnes se nepracuje' : '—'));
    const heroLine1 = '<span class="dashboardHeroLine1Text">' + esc(heroLine1Text) + '</span>';
    const heroLine2 = active
      ? (active.end ? 'Končí za: ' + formatDuration(Math.max(0, active.end - now)) : '')
      : (nextWorkShift
        ? 'Začíná za: ' + formatDuration(Math.max(0, nextWorkShift.start - now))
        : '');
    const heroLine3 = typeof renderDashboardTeamDLine === 'function'
      ? renderDashboardTeamDLine(now, teamDStatus, esc)
      : (typeof formatDashboardTeamDLine === 'function' ? esc(formatDashboardTeamDLine(now, teamDStatus)) : '');
    const heroProgress = active && active.start && active.end
      ? Math.max(0, Math.min(100, ((now.getTime() - active.start.getTime()) / (active.end.getTime() - active.start.getTime())) * 100))
      : 0;
    const heroProgressText = active ? Math.round(heroProgress) + ' %' : '';
    setDashboardHtmlIfChanged(hero, [
      '<div class="dashboardHeroLine1">' + heroLine1 + '</div>',
      heroLine2 ? '<div class="dashboardHeroLine2">' + esc(heroLine2) + '</div>' : '',
      heroLine3 ? '<div class="dashboardHeroLine3"><span class="dashboardHeroLine3Pill">' + heroLine3 + '</span></div>' : '',
      '<div class="dashboardHeroBarRow">',
      '<div class="dashboardHeroBar"><span style="--fill:' + heroProgress.toFixed(1) + '%"></span></div>',
      heroProgressText ? '<div class="dashboardHeroBarPercent">' + esc(heroProgressText) + '</div>' : '',
      '</div>'
    ].join(''), 'dashboardHero');
  }

  const setCard = (id, title, value, meta, dotClass, clickable, iconHtml) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('dashboardCardClickable', !!clickable);
    const icon = iconHtml ? '<span class="dashboardIcon dashboardIconInline" aria-hidden="true">' + iconHtml + '</span>' : '';
    const dot = dotClass ? '<span class="dashboardDot ' + esc(dotClass) + '" aria-hidden="true"></span>' : '';
    setDashboardHtmlIfChanged(el, [
      '<div class="dashboardTop">',
      '<div class="dashboardHead">',
      '<div class="dashboardLabelRow">',
      icon,
      '<div class="dashboardLabel">' + esc(title) + '</div>',
      dot,
      '</div>',
      '</div>',
      '</div>',
      '<div class="dashboardValue">' + esc(value || '--') + '</div>',
      meta ? '<div class="dashboardMeta">' + esc(meta) + '</div>' : ''
    ].join(''), id || 'dashboardCard');
  };


  const dashboardIconImg = (src) => '<img class="dashboardIconImg" src="' + src + '" alt="" aria-hidden="true" decoding="async" loading="eager" width="512" height="512">';
  const calendarIcon = dashboardIconImg('assets/dashboard-icons/calendar.png');
  const clockIcon = dashboardIconImg('assets/dashboard-icons/hourglass.png');
  const walletIcon = dashboardIconImg('assets/dashboard-icons/vyplata.png');
  const croissantIcon = dashboardIconImg('assets/dashboard-icons/kantyna.png');
  const plateIcon = dashboardIconImg('assets/dashboard-icons/jidelna.png');
  const palmIcon = dashboardIconImg('assets/dashboard-icons/dovolena.png');
  const bookIcon = dashboardIconImg('assets/dashboard-icons/jidelnilistek.png');
  const eportalIcon = dashboardIconImg('assets/dashboard-icons/eportal.png');

  const payDate = typeof getNextPayrollDate === 'function' ? getNextPayrollDate(now) : null;
  const payDateText = payDate
    ? new Intl.DateTimeFormat('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(payDate).replace(/\s+/g, '')
    : '—';
  const payDays = payDate
    ? Math.max(0, Math.round((payDate.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / 86400000))
    : null;
  const payMeta = payDays === null
    ? ''
    : (payDays === 0 ? 'dnes' : 'za ' + payDays + ' ' + (payDays === 1 ? 'den' : (payDays >= 2 && payDays <= 4 ? 'dny' : 'dní')));
  setCard('dashCalendar', 'Kalendář', formatCalendarDateLabel(now), getCalendarSpecialText(now), '', false, calendarIcon);
  const shiftCountdownTitle = active ? 'Zbývá' : (nextWorkShift ? 'Začíná' : 'Zbývá');
  const shiftCountdownValue = active
    ? (active.end ? formatDuration(Math.max(0, active.end - now)) : '—')
    : (nextWorkShift ? formatDuration(Math.max(0, nextWorkShift.start - now)) : '—');
  const shiftCountdownMeta = active
    ? 'Směna ' + String(active.team || '—') + (active.label ? ' · ' + active.label : '')
    : (nextWorkShift ? 'Směna ' + String(nextWorkShift.team || '—') + (nextWorkShift.label ? ' · ' + nextWorkShift.label : '') + ' · ' + formatDashboardNextShiftMeta(nextWorkShift) : '');
  setCard('dashCountdown', shiftCountdownTitle, shiftCountdownValue, shiftCountdownMeta, '', false, clockIcon);

  const foodText = status => (status && status.isOpen && status.active) ? ('Do ' + formatFoodTime(status.active.end)) : 'Zavřeno';
  const foodDot = status => (status && status.isOpen) ? 'is-open' : 'is-closed';
  const foodDate = value => {
    try {
      return new Intl.DateTimeFormat('cs-CZ', { day: '2-digit', month: '2-digit' }).format(new Date(value)).replace(/\s+/g, '');
    } catch (err) {
      const d = new Date(value);
      return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.';
    }
  };
  const foodMeta = status => {
    if (!status) return '';
    if (!status.next) return status.isOpen ? 'Dnes už nic dalšího.' : 'Rozpis není dostupný.';
    const nextStart = new Date(status.next.start);
    const nextEnd = new Date(status.next.end);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextDay = new Date(nextStart.getFullYear(), nextStart.getMonth(), nextStart.getDate());
    const label = nextDay.getTime() === today.getTime()
      ? formatFoodTime(nextStart)
      : (nextDay.getTime() === tomorrow.getTime()
        ? 'Zítra ' + formatFoodTime(nextStart)
        : foodDate(nextStart) + ' ' + formatFoodTime(nextStart));
    return 'Další: ' + label + '–' + formatFoodTime(nextEnd);
  };
  setCard('dashKantyna', 'Kantýna', foodText(kantyna), foodMeta(kantyna), foodDot(kantyna), true, croissantIcon);
  setCard('dashJidelna', 'Jídelna', foodText(jidelna), foodMeta(jidelna), foodDot(jidelna), true, plateIcon);
  setCard('dashVyplata', 'Výplata', payDateText, payMeta, '', true, walletIcon);
  setCard('dashCzd', 'Dovolená', vacationCountdown.text, vacationCountdown.meta || 'Odpočet do dovolené', '', false, palmIcon);
  setCard('dashFoodLink', 'Jídelní lístek', 'Otevřít', 'Aktuální menu', '', true, bookIcon);
  setCard('dashEportalLink', 'Eportal', 'Otevřít', 'Firemní portál', '', true, eportalIcon);
  try { renderRakDashboardAnnouncement(now); } catch (err) {}
}

function scheduleDashboardInitialPaint() {
  let attempts = 0;
  const run = () => {
    attempts += 1;
    try {
      if (typeof updateDashboard === 'function') updateDashboard();
      if (typeof updateFoodTile === 'function') updateFoodTile();
      if (typeof updateEportalTile === 'function') updateEportalTile();
      return true;
    } catch (err) {
      console.warn('Dashboard refresh failed', err);
      return false;
    }
  };
  const retry = () => {
    const ok = run();
    if (!ok && attempts < 6) {
      if (typeof registerTimeout === 'function') registerTimeout(retry, 180); else setTimeout(retry, 180);
    }
  };
  retry();
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(retry);
    requestAnimationFrame(() => requestAnimationFrame(retry));
  } else {
    if (typeof registerTimeout === 'function') {
      registerTimeout(retry, 0);
      registerTimeout(retry, 120);
    } else {
      setTimeout(retry, 0);
      setTimeout(retry, 120);
    }
  }
  if (typeof registerTimeout === 'function') {
    registerTimeout(retry, 360);
    registerTimeout(retry, 900);
  } else {
    setTimeout(retry, 360);
    setTimeout(retry, 900);
  }
}

function forceHomeRefresh() {
  const activePage = document.querySelector('.page.active')?.id || "";
  if (isAnyModalOpen()) return;
  if ((typeof app !== 'undefined' && app.homeBootSuppressed && activePage !== "home") || (window.__rotaceUserNavigated && activePage !== 'home')) return;
  if (activePage !== 'home' && typeof showPage === 'function') showPage('home');
  if (typeof refreshHomeScreen === 'function') refreshHomeScreen();
  else if (typeof updateDashboard === 'function') updateDashboard();
  if (typeof updateFoodTile === 'function') updateFoodTile();
  if (typeof updateEportalTile === 'function') updateEportalTile();
}

function homeLooksUnpainted() {
  const hero = document.getElementById('dashHero');
  const cal = document.getElementById('dashCalendar');
  const count = document.getElementById('dashCountdown');
  const kantyna = document.getElementById('dashKantyna');
  const jidelna = document.getElementById('dashJidelna');
  const heroText = hero?.querySelector('.dashboardHeroLine1Text')?.textContent?.trim() || '';
  const calValue = cal?.querySelector('.dashboardValue')?.textContent?.trim() || '';
  const countValue = count?.querySelector('.dashboardValue')?.textContent?.trim() || '';
  const kantynaValue = kantyna?.querySelector('.dashboardValue')?.textContent?.trim() || '';
  const jidelnaValue = jidelna?.querySelector('.dashboardValue')?.textContent?.trim() || '';
  return !hero || !cal || !count || !heroText || (!calValue && !countValue);
}

function hammerHomeRefresh() {
  [0, 40, 120, 240, 480, 900, 1500, 2500].forEach((delay) => {
    if (typeof registerTimeout === 'function') registerTimeout(() => {
      try {
        forceHomeRefresh();
      } catch (err) {
        console.warn('Home refresh retry failed', err);
      }
    }, delay);
  });
}

function watchHomePaint() {
  [80, 180, 360, 700, 1200, 2000, 3000].forEach((delay) => {
    if (typeof registerTimeout === 'function') registerTimeout(() => {
      try {
        if (typeof document !== 'undefined' && document.body && !document.hidden && homeLooksUnpainted()) {
          forceHomeRefresh();
        }
      } catch (err) {
        console.warn('Home paint watch failed', err);
      }
    }, delay);
  });
}

function bootHomeRefresh() {
  if (isAnyModalOpen()) return;
  forceHomeRefresh();
  hammerHomeRefresh();
  scheduleDashboardInitialPaint();
  watchHomePaint();
}

function bootHomeRefreshLate() {
  setTimeout(() => {
    try {
      bootHomeRefresh();
    } catch (err) {
      console.warn('Late home refresh failed', err);
    }
  }, 0);
}

function isAnyModalOpen() {
  if (typeof document === 'undefined' || !document.body) return false;
  return !!(
    document.body.classList.contains('calendarModalOpen') ||
    document.body.classList.contains('calendarModalOpening') ||
    document.body.classList.contains('foodModalOpen') ||
    document.body.classList.contains('personModalOpen') ||
    document.body.classList.contains('appMenuOpen') ||
    document.body.classList.contains('menuOpen')
  );
}

if (document.readyState === 'loading') {
  registerListener(document, 'DOMContentLoaded', bootHomeRefresh, { once: true });
} else {
  bootHomeRefresh();
}
registerListener(window, 'load', bootHomeRefresh, { once: true });
registerListener(window, 'pageshow', bootHomeRefresh);
registerListener(window, 'visibilitychange', () => {
  if (!document.hidden) {
    bootHomeRefresh();
  }
});
window.__rotaceBootHomeRefreshLate = bootHomeRefreshLate;


(function installDashboardFallbackGuard() {
  if (window.__rotaceDashboardFallbackGuardInstalled) return;
  window.__rotaceDashboardFallbackGuardInstalled = true;

  const originalUpdateDashboard = typeof updateDashboard === 'function' ? updateDashboard : null;
  const esc = typeof escapeHtml === 'function'
    ? escapeHtml
    : (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[ch]));

  function safeCall(fn, fallback) {
    try {
      return typeof fn === 'function' ? fn() : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function nowInPrague() {
    return typeof getPragueNow === 'function' ? getPragueNow(new Date()) : new Date();
  }

  const fallbackDashboardIconImg = (src) => '<img class="dashboardIconImg" src="' + src + '" alt="" aria-hidden="true" decoding="async" loading="eager" width="512" height="512">';
  const fallbackDashboardIcons = {
    calendar: fallbackDashboardIconImg('assets/dashboard-icons/calendar.png'),
    countdown: fallbackDashboardIconImg('assets/dashboard-icons/hourglass.png'),
    kantyna: fallbackDashboardIconImg('assets/dashboard-icons/kantyna.png'),
    jidelna: fallbackDashboardIconImg('assets/dashboard-icons/jidelna.png'),
    vyplata: fallbackDashboardIconImg('assets/dashboard-icons/vyplata.png'),
    dovolena: fallbackDashboardIconImg('assets/dashboard-icons/dovolena.png'),
    menu: fallbackDashboardIconImg('assets/dashboard-icons/jidelnilistek.png'),
    eportal: fallbackDashboardIconImg('assets/dashboard-icons/eportal.png')
  };

  function setCardSimple(id, title, value, meta, dotClass, clickable, iconHtml) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('dashboardCardClickable', !!clickable);
    const icon = iconHtml ? '<span class="dashboardIcon dashboardIconInline" aria-hidden="true">' + iconHtml + '</span>' : '';
    const dot = dotClass ? '<span class="dashboardDot ' + esc(dotClass) + '" aria-hidden="true"></span>' : '';
    setDashboardHtmlIfChanged(el, [
      '<div class="dashboardTop">',
      '  <div class="dashboardHead">',
      '    <div class="dashboardLabelRow">',
      icon,
      '      <div class="dashboardLabel">' + esc(title) + '</div>',
      dot,
      '    </div>',
      '  </div>',
      '</div>',
      '<div class="dashboardValue">' + esc(value || '--') + '</div>',
      meta ? '<div class="dashboardMeta">' + esc(meta) + '</div>' : ''
    ].join(''), id || 'dashboardFallbackCard');
  }

  function renderDashboardFallback(err) {
    const now = nowInPrague();
    const active = safeCall(() => typeof getDashboardActiveWorkShift === 'function' ? getDashboardActiveWorkShift(now) : null, null);
    const nextWorkShift = !active ? safeCall(() => typeof getDashboardNextWorkShift === 'function' ? getDashboardNextWorkShift(now) : null, null) : null;
    const teamDStatus = safeCall(() => typeof getDashboardTeamDStatus === 'function' ? getDashboardTeamDStatus(now) : { active: null, next: null }, { active: null, next: null });
    const special = safeCall(() => typeof getSpecialWorkInfo === 'function' ? getSpecialWorkInfo(now) : null, null);
    const vacationCountdown = safeCall(() => typeof getVacationCountdown === 'function' ? getVacationCountdown(now) : { text: '--', meta: '' }, { text: '--', meta: '' });
    const payDate = safeCall(() => typeof getNextPayrollDate === 'function' ? getNextPayrollDate(now) : null, null);
    const payText = payDate
      ? new Intl.DateTimeFormat('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(payDate).replace(/\s+/g, '')
      : '—';
    const payMeta = payDate ? 'následující výplata' : '';
    const calendarText = (() => {
      try {
        return new Intl.DateTimeFormat('cs-CZ', { weekday: 'short', day: 'numeric', month: 'numeric', year: 'numeric' }).format(now);
      } catch (formatErr) {
        return now.toLocaleDateString('cs-CZ');
      }
    })();
    const activeText = active
      ? 'Směna ' + String(active.team || '—') + ' je právě v práci' + (active.label ? ': ' + active.label : '')
      : (nextWorkShift ? 'Další směna v práci: ' + String(nextWorkShift.team || '—') + (nextWorkShift.label ? ' · ' + nextWorkShift.label : '') : (special ? 'Dnes se nepracuje' : '—'));
    const countdownText = active && active.end
      ? (typeof formatDuration === 'function' ? formatDuration(Math.max(0, active.end - now)) : '—')
      : (nextWorkShift && nextWorkShift.start && typeof formatDuration === 'function' ? formatDuration(Math.max(0, nextWorkShift.start - now)) : '—');
    const countdownMeta = active && active.end
      ? 'Směna ' + String(active.team || '—') + (active.label ? ' · ' + active.label : '')
      : (nextWorkShift ? 'Směna ' + String(nextWorkShift.team || '—') + (nextWorkShift.label ? ' · ' + nextWorkShift.label : '') + ' · ' + formatDashboardNextShiftMeta(nextWorkShift) : '');
    const foodLocations = (typeof FOOD_LOCATIONS !== 'undefined' && Array.isArray(FOOD_LOCATIONS)) ? FOOD_LOCATIONS : [];
  const syncStatus = typeof getSupabaseSyncStatus === 'function' ? getSupabaseSyncStatus() : { kind: 'offline', label: '🟡 Offline cache', detail: '' };
    const foodA = safeCall(() => (typeof findFoodStatus === 'function' && foodLocations[0] ? findFoodStatus(foodLocations[0], now) : null), null);
    const foodB = safeCall(() => (typeof findFoodStatus === 'function' && foodLocations[1] ? findFoodStatus(foodLocations[1], now) : null), null);
    const foodText = (status) => {
      if (!status) return '—';
      if (status.isOpen && status.active) {
        return 'Do ' + formatFoodTime(status.active.end);
      }
      return 'Zavřeno';
    };
    const foodDate = value => {
      try {
        return new Intl.DateTimeFormat('cs-CZ', { day: '2-digit', month: '2-digit' }).format(new Date(value)).replace(/\s+/g, '');
      } catch (err) {
        const d = new Date(value);
        return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.';
      }
    };
    const foodMeta = (status) => {
      if (!status) return '';
      if (!status.next) return status.isOpen ? 'Dnes už nic dalšího.' : '';
      const nextStart = new Date(status.next.start);
      const nextEnd = new Date(status.next.end);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextDay = new Date(nextStart.getFullYear(), nextStart.getMonth(), nextStart.getDate());
      const label = nextDay.getTime() === today.getTime()
        ? formatFoodTime(nextStart)
        : (nextDay.getTime() === tomorrow.getTime()
          ? 'Zítra ' + formatFoodTime(nextStart)
          : foodDate(nextStart) + ' ' + formatFoodTime(nextStart));
      return 'Další: ' + label + '–' + formatFoodTime(nextEnd);
    };
    const hero = document.getElementById('dashHero');
    if (hero) {
      setDashboardHtmlIfChanged(hero, [
        '<div class="dashboardHeroLine1"><span class="dashboardHeroLine1Text">' + esc(activeText) + '</span></div>',
        '<div class="dashboardHeroLine2">' + esc(active ? 'Končí za: ' + countdownText : (nextWorkShift ? 'Začíná za: ' + countdownText : countdownText)) + '</div>',
        '<div class="dashboardHeroLine3"><span class="dashboardHeroLine3Pill">' + (typeof renderDashboardTeamDLine === 'function' ? renderDashboardTeamDLine(now, teamDStatus, esc) : esc(typeof formatDashboardTeamDLine === 'function' ? formatDashboardTeamDLine(now, teamDStatus) : '')) + '</span></div>',
        '<div class="dashboardHeroBarRow"><div class="dashboardHeroBar"><span style="--fill:' + (active && active.start && active.end ? Math.max(0, Math.min(100, ((now.getTime() - active.start.getTime()) / (active.end.getTime() - active.start.getTime())) * 100)).toFixed(1) + '%' : '0%') + '"></span></div></div>'
      ].join(''), 'dashboardFallbackHero');
    }

    const calendarMeta = safeCall(() => typeof getCalendarSpecialText === 'function' ? getCalendarSpecialText(now) : (special ? String(special.label || '') : ''), special ? String(special.label || '') : '');
    setCardSimple('dashCalendar', 'Kalendář', calendarText, calendarMeta, '', false, fallbackDashboardIcons.calendar);
    setCardSimple('dashCountdown', active ? 'Zbývá' : (nextWorkShift ? 'Začíná' : 'Zbývá'), countdownText, countdownMeta, '', false, fallbackDashboardIcons.countdown);
    setCardSimple('dashKantyna', 'Kantýna', foodText(foodA), foodMeta(foodA), foodA && foodA.isOpen ? 'is-open' : 'is-closed', true, fallbackDashboardIcons.kantyna);
    setCardSimple('dashJidelna', 'Jídelna', foodText(foodB), foodMeta(foodB), foodB && foodB.isOpen ? 'is-open' : 'is-closed', true, fallbackDashboardIcons.jidelna);
    setCardSimple('dashVyplata', 'Výplata', payText, payMeta, '', true, fallbackDashboardIcons.vyplata);
    setCardSimple('dashCzd', 'Dovolená', vacationCountdown.text || '--', vacationCountdown.meta || 'Odpočet do dovolené', '', false, fallbackDashboardIcons.dovolena);
    setCardSimple('dashFoodLink', 'Jídelní lístek', 'Otevřít', 'Aktuální menu', '', true, fallbackDashboardIcons.menu);
    setCardSimple('dashEportalLink', 'Eportal', 'Otevřít', 'Firemní portál', '', true, fallbackDashboardIcons.eportal);

    if (err) {
      console.warn('Dashboard fallback activated', err);
    }
  }

  window.updateDashboard = function wrappedUpdateDashboard(...args) {
    try {
      const result = originalUpdateDashboard ? originalUpdateDashboard.apply(this, args) : null;
      try {
        if (typeof homeLooksUnpainted === 'function' && homeLooksUnpainted()) {
          renderDashboardFallback();
        }
      } catch (checkErr) {
        renderDashboardFallback(checkErr);
      }
      return result;
    } catch (err) {
      renderDashboardFallback(err);
      return null;
    }
  };
})();


// v.1.5 (963) – read-only kontrola centrování horního směnového panelu na Dashboardu včetně řádku kdo chybí.
function getRakDashboardHeroCenteringHealth() {
  return {
    ok: true,
    version: window.APP_VERSION || '1.2 (1.65)',
    heroId: 'dashHero',
    scope: 'dashboard top shift panel',
    centeredLines: ['dashboardHeroLine1', 'dashboardHeroLine2', 'dashboardHeroLine3', 'dashboardHeroLine3Sub'],
    responsive: true,
    notes: 'Texty o aktuální směně, odpočtu, směně D a absencích jsou centrované CSS vrstvou pro všechny viewporty; v954 je zvlášť srovnaný i subřádek kdo chybí.'
  };
}
window.getRakDashboardHeroCenteringHealth = getRakDashboardHeroCenteringHealth;


// v.1.1 (725): ruční sync přes online stav na dashboardu.
const RAK_DASHBOARD_MANUAL_SYNC_STATE = {
  running: false,
  lastAt: 0,
  lastText: ''
};

function setDashboardManualSyncBadge(text, kind) {
  try {
    const badge = document.getElementById('dashboardSyncBadge');
    if (!badge) return;
    const safeKind = String(kind || 'pending').trim() || 'pending';
    badge.className = 'dashboardSyncBadge dashboardSyncBadge--' + safeKind;
    badge.textContent = String(text || '').trim() || 'Synchronizuji…';
    badge.title = 'Kliknutím vynutíš synchronizaci rozpisu, herních statistik a kontrolu aktualizace.';
  } catch (err) {}
}

async function runDashboardManualSync(source) {
  if (RAK_DASHBOARD_MANUAL_SYNC_STATE.running) return { ok: false, reason: 'already-running' };
  RAK_DASHBOARD_MANUAL_SYNC_STATE.running = true;
  const started = Date.now();
  setDashboardManualSyncBadge('⟳ Synchronizuji…', 'pending');
  const result = { ok: true, source: source || 'dashboard-sync-badge', steps: [] };
  const step = async (name, fn) => {
    try {
      if (typeof fn !== 'function') return null;
      const value = await fn();
      result.steps.push({ name, ok: true });
      return value;
    } catch (err) {
      result.ok = false;
      result.steps.push({ name, ok: false, error: String(err && err.message ? err.message : err || '') });
      return null;
    }
  };
  try {
    await step('flush-fronty', () => window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.flushPendingWrites === 'function' ? window.RotationSupabaseBridge.flushPendingWrites() : null);
    await step('rozpis', () => typeof syncRotationFromSupabase === 'function' ? syncRotationFromSupabase(true) : null);
    await step('herni-profily', () => typeof gamesSyncProfileFromRemote === 'function' ? gamesSyncProfileFromRemote(true) : null);
    await step('profil-vzhled', async () => {
      if (typeof pushActiveAccountUiRemoteSettings === 'function') await pushActiveAccountUiRemoteSettings('dashboard-manual-sync');
      const active = typeof gamesGetActiveAccount === 'function' ? gamesGetActiveAccount() : null;
      if (active && typeof loadActiveAccountUiRemoteSettings === 'function') return loadActiveAccountUiRemoteSettings(active.id);
      return null;
    });
    await step('herni-statistiky', () => typeof gamesRefreshRemoteLeaderboards === 'function' ? gamesRefreshRemoteLeaderboards(true) : null);
    await step('live-refresh', () => typeof window.__rotaceTriggerLiveRefresh === 'function' ? window.__rotaceTriggerLiveRefresh('dashboard-manual-sync', { force: true }) : null);
    await step('kontrola-aktualizace', () => typeof window.__rotaceForcePwaUpdateCheck === 'function' ? window.__rotaceForcePwaUpdateCheck('dashboard-manual-sync') : null);
    await step('pwa-cache', () => typeof window.__rotaceRequestPwaCacheStatus === 'function' ? window.__rotaceRequestPwaCacheStatus('dashboard-manual-sync') : null);
    if (typeof renderRotace === 'function') renderRotace();
    if (typeof renderStatsPanel === 'function') renderStatsPanel();
    if (typeof updateDashboard === 'function') updateDashboard();
    RAK_DASHBOARD_MANUAL_SYNC_STATE.lastAt = Date.now();
    RAK_DASHBOARD_MANUAL_SYNC_STATE.lastText = result.ok ? 'Synchronizace hotová.' : 'Synchronizace doběhla s chybou.';
    setDashboardManualSyncBadge(result.ok ? '🟢 Synchronizováno teď' : '🔴 Sync s chybou', result.ok ? 'online' : 'error');
    const restore = () => { try { if (typeof updateDashboard === 'function') updateDashboard(); } catch (err) {} };
    if (typeof registerTimeout === 'function') registerTimeout(restore, 1800); else setTimeout(restore, 1800);
    return Object.assign(result, { elapsedMs: Date.now() - started });
  } finally {
    RAK_DASHBOARD_MANUAL_SYNC_STATE.running = false;
  }
}

function bindDashboardManualSyncBadge() {
  const badge = document.getElementById('dashboardSyncBadge');
  if (!badge || badge.dataset.manualSyncBound === '1') return;
  badge.dataset.manualSyncBound = '1';
  badge.setAttribute('role', 'button');
  badge.setAttribute('tabindex', '0');
  badge.setAttribute('aria-label', 'Vynutit synchronizaci a kontrolu aktualizace');
  badge.title = 'Kliknutím vynutíš synchronizaci rozpisu, herních statistik a kontrolu aktualizace.';
  badge.addEventListener('click', () => { void runDashboardManualSync('dashboard-click'); });
  badge.addEventListener('keydown', (event) => {
    if (event && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      void runDashboardManualSync('dashboard-keyboard');
    }
  });
}

window.runDashboardManualSync = runDashboardManualSync;
window.bindDashboardManualSyncBadge = bindDashboardManualSyncBadge;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindDashboardManualSyncBadge, { once: true });
} else {
  bindDashboardManualSyncBadge();
}
