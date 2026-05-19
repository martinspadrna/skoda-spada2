// Extracted dashboard logic (v1(321))

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

  const foodText = status => (status && status.isOpen && status.active) ? 'Otevřeno do ' + formatFoodTime(status.active.end) : 'Zavřeno';
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
    return 'Další termín\n' + label + ' – ' + formatFoodTime(nextEnd);
  };
  setCard('dashKantyna', 'Kantýna', foodText(kantyna), foodMeta(kantyna), foodDot(kantyna), true, croissantIcon);
  setCard('dashJidelna', 'Jídelna', foodText(jidelna), foodMeta(jidelna), foodDot(jidelna), true, plateIcon);
  setCard('dashVyplata', 'Výplata', payDateText, payMeta, '', true, walletIcon);
  setCard('dashCzd', 'Dovolená', vacationCountdown.text, vacationCountdown.meta || 'Odpočet do dovolené', '', false, palmIcon);
  setCard('dashFoodLink', 'Jídelní lístek', 'Otevřít', 'Aktuální menu', '', true, bookIcon);
  setCard('dashEportalLink', 'Eportal', 'Otevřít', 'Firemní portál', '', true, eportalIcon);
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
        return 'Otevřeno do ' + formatFoodTime(status.active.end);
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
      return 'Další termín\n' + label + ' – ' + formatFoodTime(nextEnd);
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
