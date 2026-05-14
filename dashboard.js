// Extracted dashboard logic (v1(321))
function updateDashboard() {
  const now = typeof getPragueNow === 'function' ? getPragueNow(new Date()) : new Date();
  const active = typeof getActiveShiftNow === 'function' ? getActiveShiftNow(now) : null;
  const dState = typeof getTeamShiftState === 'function' ? getTeamShiftState(now, 'D') : null;
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
    syncBadge.className = 'dashboardSyncBadge dashboardSyncBadge--' + esc(syncStatus.kind || 'offline');
    syncBadge.textContent = syncStatus.label || '🟡 Offline cache';
  }

  const hero = document.getElementById('dashHero');
  if (hero) {
    const currentAbsences = active && active.team === 'D' ? getAbsenceNamesForDate(active.start || now) : [];
    const nextAbsences = (!active || active.team !== 'D') && dState && dState.next ? getAbsenceNamesForDate(dState.next.start) : [];
    const heroLine1 = active && !showSpecial
      ? '<span class="dashboardHeroLine1Text">V práci: směna ' + active.team + (active.label ? ' (' + active.label + ')' : '') + '</span>'
      : '<span class="dashboardHeroLine1Text">' + (special ? 'Dnes se nepracuje' : '—') + '</span>';
    const heroLine2 = active && active.team === 'D'
      ? (currentAbsences.length ? 'Aktuálně chybí: ' + currentAbsences.join(', ') : 'Aktuálně nechybí nikdo')
      : ((!active || active.team !== 'D') && dState && dState.next
        ? 'Směna D začne za: ' + formatDuration(dState.next.start - now)
        : '');
    const heroLine3 = (!active || active.team !== 'D') && nextAbsences.length ? 'Na další směně chybí: ' + nextAbsences.join(', ') : '';
    const heroProgress = active && !showSpecial && active.start && active.end
      ? Math.max(0, Math.min(100, ((now.getTime() - active.start.getTime()) / (active.end.getTime() - active.start.getTime())) * 100))
      : 0;
    const heroProgressText = active && !showSpecial ? Math.round(heroProgress) + ' %' : '';
    hero.innerHTML = [
      '<div class="dashboardHeroLine1">' + heroLine1 + '</div>',
      heroLine2 ? '<div class="dashboardHeroLine2">' + esc(heroLine2) + '</div>' : '',
      heroLine3 ? '<div class="dashboardHeroLine3">' + esc(heroLine3) + '</div>' : '',
      '<div class="dashboardHeroBarRow">',
      '<div class="dashboardHeroBar"><span style="width:' + heroProgress.toFixed(1) + '%"></span></div>',
      heroProgressText ? '<div class="dashboardHeroBarPercent">' + esc(heroProgressText) + '</div>' : '',
      '</div>'
    ].join('');
  }

  const setCard = (id, title, value, meta, dotClass, clickable, iconHtml) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('dashboardCardClickable', !!clickable);
    const icon = iconHtml ? '<span class="dashboardIcon dashboardIconInline" aria-hidden="true">' + iconHtml + '</span>' : '';
    const dot = dotClass ? '<span class="dashboardDot ' + esc(dotClass) + '" aria-hidden="true"></span>' : '';
    el.innerHTML = [
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
    ].join('');
  };


  const dashboardIconImg = (src) => '<img class="dashboardIconImg" src="' + src + '" alt="" aria-hidden="true" decoding="async" loading="lazy">';
  const calendarIcon = dashboardIconImg('assets/dashboard-icons/calendar.png');
  const clockIcon = dashboardIconImg('assets/dashboard-icons/hourglass.png');
  const walletIcon = dashboardIconImg('assets/dashboard-icons/wallet.png');
  const croissantIcon = dashboardIconImg('assets/dashboard-icons/croissant.png');
  const plateIcon = dashboardIconImg('assets/dashboard-icons/plate.png');
  const palmIcon = dashboardIconImg('assets/dashboard-icons/suitcase.png');
  const bookIcon = dashboardIconImg('assets/dashboard-icons/book.png');
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
  setCard('dashCountdown', 'Zbývá', active && !showSpecial ? formatDuration(active.end - now) : '—', '', '', false, clockIcon);

  const foodText = status => status.isOpen && status.active ? 'Otevřeno' : 'Zavřeno';
  const foodDot = status => status.isOpen ? 'is-open' : 'is-closed';
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
  setCard('dashVyplata', 'Další výplata', payDateText, payMeta, '', false, walletIcon);
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
      setTimeout(retry, 180);
    }
  };
  retry();
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(retry);
    requestAnimationFrame(() => requestAnimationFrame(retry));
  } else {
    setTimeout(retry, 0);
    setTimeout(retry, 120);
  }
  setTimeout(retry, 360);
  setTimeout(retry, 900);
}

function forceHomeRefresh() {
  const activePage = document.querySelector('.page.active')?.id || "";
  if ((typeof app !== 'undefined' && app.homeBootSuppressed && activePage !== "home") || (window.__rotaceUserNavigated && activePage !== 'home')) return;
  if (typeof showPage === 'function') showPage('home');
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
    setTimeout(() => {
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
    setTimeout(() => {
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootHomeRefresh, { once: true });
} else {
  bootHomeRefresh();
}
window.addEventListener('load', bootHomeRefresh, { once: true });
window.addEventListener('pageshow', bootHomeRefresh);
window.addEventListener('visibilitychange', () => {
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

  function setCardSimple(id, title, value, meta, dotClass, clickable) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('dashboardCardClickable', !!clickable);
    const dot = dotClass ? '<span class="dashboardDot ' + esc(dotClass) + '" aria-hidden="true"></span>' : '';
    el.innerHTML = [
      '<div class="dashboardTop">',
      '  <div class="dashboardHead">',
      '    <div class="dashboardLabelRow">',
      '      <div class="dashboardLabel">' + esc(title) + '</div>',
      dot,
      '    </div>',
      '  </div>',
      '</div>',
      '<div class="dashboardValue">' + esc(value || '--') + '</div>',
      meta ? '<div class="dashboardMeta">' + esc(meta) + '</div>' : ''
    ].join('');
  }

  function renderDashboardFallback(err) {
    const now = nowInPrague();
    const active = safeCall(() => typeof getActiveShiftNow === 'function' ? getActiveShiftNow(now) : null, null);
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
      ? 'V práci: směna ' + active.team + (active.label ? ' (' + active.label + ')' : '')
      : (special ? 'Dnes se nepracuje' : '—');
    const countdownText = active && active.end
      ? (typeof formatDuration === 'function' ? formatDuration(active.end - now) : '—')
      : '—';
    const foodLocations = (typeof FOOD_LOCATIONS !== 'undefined' && Array.isArray(FOOD_LOCATIONS)) ? FOOD_LOCATIONS : [];
  const syncStatus = typeof getSupabaseSyncStatus === 'function' ? getSupabaseSyncStatus() : { kind: 'offline', label: '🟡 Offline cache', detail: '' };
    const foodA = safeCall(() => (typeof findFoodStatus === 'function' && foodLocations[0] ? findFoodStatus(foodLocations[0], now) : null), null);
    const foodB = safeCall(() => (typeof findFoodStatus === 'function' && foodLocations[1] ? findFoodStatus(foodLocations[1], now) : null), null);
    const foodText = (status) => {
      if (!status) return '—';
      if (status.isOpen && status.active) {
        return 'Otevřeno';
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
      hero.innerHTML = [
        '<div class="dashboardHeroLine1"><span class="dashboardHeroLine1Text">' + esc(activeText) + '</span></div>',
        '<div class="dashboardHeroLine2">' + esc(countdownText) + '</div>',
        '<div class="dashboardHeroLine3">' + esc(special ? special.label || '' : '') + '</div>',
        '<div class="dashboardHeroBarRow"><div class="dashboardHeroBar"><span style="width:' + (active && active.start && active.end ? '50%' : '0%') + '"></span></div></div>'
      ].join('');
    }

    setCardSimple('dashCalendar', 'Kalendář', calendarText, special ? String(special.label || '') : '', '', false);
    setCardSimple('dashCountdown', 'Zbývá', countdownText, '', '', false);
    setCardSimple('dashKantyna', 'Kantýna', foodText(foodA), foodMeta(foodA), foodA && foodA.isOpen ? 'is-open' : 'is-closed', true);
    setCardSimple('dashJidelna', 'Jídelna', foodText(foodB), foodMeta(foodB), foodB && foodB.isOpen ? 'is-open' : 'is-closed', true);
    setCardSimple('dashVyplata', 'Další výplata', payText, payMeta, '', false);
    setCardSimple('dashCzd', 'Dovolená', vacationCountdown.text || '--', vacationCountdown.meta || 'Odpočet do dovolené', '', false);
    setCardSimple('dashFoodLink', 'Jídelní lístek', 'Otevřít', 'Aktuální menu', '', true);
    setCardSimple('dashEportalLink', 'Eportal', 'Otevřít', 'Firemní portál', '', true);

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
