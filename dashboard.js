// Extracted dashboard logic (v1(256))
function updateDashboard() {
  const now = typeof getPragueNow === "function" ? getPragueNow(new Date()) : new Date();
  const active = getActiveShiftNow(now);
  const dState = getTeamShiftState(now, "D");
  const special = getSpecialWorkInfo(now);
  const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const showSpecial = special && (!active || sameDay(active.start, now));
  const vacationCountdown = typeof getVacationCountdown === "function"
    ? getVacationCountdown(now)
    : { text: "--", meta: "" };
  const esc = typeof escapeHtml === "function"
    ? escapeHtml
    : (value) => String(value ?? "").replace(/[&<>"']/g, ch => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[ch]));

  const hero = document.getElementById('dashHero');
  if (hero) {
    const heroLine1 = active && !showSpecial
      ? '<span class="dashboardHeroLine1Text">V práci: směna ' + active.team + (active.label ? ' (' + active.label + ')' : '') + '</span>'
      : '<span class="dashboardHeroLine1Text">' + (special ? 'Dnes se nepracuje' : '—') + '</span>';
    const nextAbsences = (!active || active.team !== 'D') && dState.next ? getAbsenceNamesForDate(dState.next.start) : [];
    const heroLine2 = (!active || active.team !== 'D') && dState.next
      ? 'Směna D začne za: ' + formatDuration(dState.next.start - now)
      : '';
    const heroLine3 = nextAbsences.length ? 'Na další směně chybí: ' + nextAbsences.join(', ') : '';
    const heroProgress = active && !showSpecial && active.start && active.end
      ? Math.max(0, Math.min(100, ((now.getTime() - active.start.getTime()) / (active.end.getTime() - active.start.getTime())) * 100))
      : 0;
    hero.innerHTML = [
      '<div class="dashboardHeroLine1">' + heroLine1 + '</div>',
      heroLine2 ? '<div class="dashboardHeroLine2">' + esc(heroLine2) + '</div>' : '',
      heroLine3 ? '<div class="dashboardHeroLine3">' + esc(heroLine3) + '</div>' : '',
      '<div class="dashboardHeroBar"><span style="width:' + heroProgress.toFixed(1) + '%"></span></div>'
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

  const iconImg = (src) => '<img class="dashboardIconImage" src="' + src + '" alt="" aria-hidden="true" loading="eager" decoding="sync">';
  const walletIcon = iconImg('assets/dashboard-icons/wallet.png');
  const croissantIcon = iconImg('assets/dashboard-icons/croissant.png');
  const plateIcon = iconImg('assets/dashboard-icons/plate.png');
  const calendarIcon = iconImg('assets/dashboard-icons/calendar.png');
  const clockIcon = iconImg('assets/dashboard-icons/hourglass.png');
  const palmIcon = iconImg('assets/dashboard-icons/palm.png');
  const bookIcon = iconImg('assets/dashboard-icons/document.png');
  const eportalIcon = iconImg('assets/dashboard-icons/eportal.png');

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

  const kantyna = findFoodStatus(FOOD_LOCATIONS[0], now);
  const jidelna = findFoodStatus(FOOD_LOCATIONS[1], now);
  const foodText = status => status.isOpen && status.active ? ('Otevřeno do ' + formatFoodTime(status.active.end)) : 'Zavřeno';
  const foodDot = status => status.isOpen ? 'is-open' : 'is-closed';
  const foodMeta = status => {
    if (status.isOpen && status.active) return 'do ' + formatFoodTime(status.active.end);
    if (!status.next) return 'otevření není známé';
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const nextStart = new Date(status.next.start);
    nextStart.setHours(0, 0, 0, 0);
    const diffDays = Math.round((nextStart - today) / 86400000);
    const time = formatFoodTime(status.next.start);
    if (diffDays <= 0) return 'otevřeno dnes v ' + time;
    if (diffDays === 1) return 'otevřeno zítra v ' + time;
    return 'otevřeno ' + formatFoodRelativeLabel(status.next.start, now) + ' v ' + time;
  };
  setCard('dashKantyna', 'Kantýna', foodText(kantyna), foodMeta(kantyna), foodDot(kantyna), true, croissantIcon);
  setCard('dashJidelna', 'Jídelna', foodText(jidelna), foodMeta(jidelna), foodDot(jidelna), true, plateIcon);
  setCard('dashVyplata', 'Další výplata', payDateText, payMeta, '', false, walletIcon);
  setCard('dashCzd', 'Odpočet do dovolené', vacationCountdown.text, vacationCountdown.meta, '', false, palmIcon);
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
  return !hero || !cal || !count || heroText === 'V práci: směna A (noční)' || calValue === '--' || countValue === '--' || kantynaValue === '--' || jidelnaValue === '--';
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
