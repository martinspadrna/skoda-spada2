// Extracted dashboard logic (v1(248))
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
    const heroLine2 = (!active || active.team !== 'D') && dState.next
      ? 'Směna D začne za: ' + formatDuration(dState.next.start - now)
      : '';
    const awayNames = getTodayAbsenceNames(now);
    const heroLine3 = awayNames.length ? 'Dnes mimo práci: ' + awayNames.join(', ') : '';
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
    const icon = iconHtml ? '<div class="dashboardIcon dashboardIconInline" aria-hidden="true">' + iconHtml + '</div>' : '';
    const dot = dotClass ? '<span class="dashboardDot ' + esc(dotClass) + '" aria-hidden="true"></span>' : '';
    el.innerHTML = [
      '<div class="dashboardTop">',
      icon,
      '<div class="dashboardHead">',
      '<div class="dashboardLabelRow">',
      '<div class="dashboardLabel">' + esc(title) + '</div>',
      dot,
      '</div>',
      '</div>',
      '</div>',
      '<div class="dashboardValue">' + esc(value || '--') + '</div>',
      meta ? '<div class="dashboardMeta">' + esc(meta) + '</div>' : ''
    ].join('');
  };

  const walletIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.7 7.4h10.6c1.7 0 3.1.9 3.7 2.1l1 1.9H18c-1.7 0-3.1 1.4-3.1 3.1S16.3 17.6 18 17.6h1.6c.7 0 1.3-.6 1.3-1.3V11c0-1.8-1.4-3.3-3.2-3.3H4.7a2 2 0 0 0-2 2v5.3a2 2 0 0 0 2 2h9.5"/><path d="M16.4 12.1h3"/><circle cx="17.6" cy="15.2" r=".6" fill="currentColor" stroke="none"/></svg>';
  const croissantIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.3 14.4c0-3.1 2.6-5.7 6.1-5.7 2.8 0 5.3 1.1 6.9 3-.1 2.6-2.2 4.6-5 4.6H9.4c-1.8 0-3.3-.8-4-2-.3-.5-.2-1.2.2-1.7.7-.7 1.2-1.3 1.5-2 .2-.6.2-1.2.1-1.8"/><path d="M8.4 12c.8.9 1.8 1.5 3 1.5 1.1 0 2.1-.3 3.1-1"/><path d="M13 8.3c.6.9 1.3 1.7 2.1 2.4"/></svg>';
  const plateIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2.2"/><path d="M5.4 5.2v13.6M6.2 5.2v4.8M7.2 5.2v4.8M17.8 5.2v13.6M18.8 5.2c.9 2 .9 4.5 0 6.3"/></svg>';
  const calendarIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M7 3.5v3M17 3.5v3M3.5 9h17"/></svg>';
  const clockIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="7.5"/><path d="M12 8v4.5l3 2"/></svg>';
  const palmIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20v-7"/><path d="M12 13c-1-2.3-3.4-4-6.2-4.3 1.9-1.6 4.3-1.8 6.3-.6"/><path d="M12 13c1.1-2.3 3.5-4 6.3-4.3-1.9-1.5-4.4-1.7-6.3-.6"/><path d="M7.2 20h9.6"/><path d="M8.8 20c1-1.3 2.1-2 3.2-2s2.2.7 3.2 2"/></svg>';
  const bookIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 5.8h5.2a3 3 0 0 1 3 3V20H8.2a3 3 0 0 0-3 3V8.8a3 3 0 0 1 0-3z"/><path d="M19 5.8h-5.2a3 3 0 0 0-3 3V20H15.8a3 3 0 0 1 3 3V8.8a3 3 0 0 0 0-3z"/><path d="M12 8.2v12"/></svg>';
  const externalIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.5 6.5H5.8A2.3 2.3 0 0 0 3.5 8.8v9.4a2.3 2.3 0 0 0 2.3 2.3h9.4a2.3 2.3 0 0 0 2.3-2.3v-4.7"/><path d="M13.5 4.5h6v6"/><path d="M12 12l7.5-7.5"/></svg>';

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
  setCard('dashEportalLink', 'Eportal', 'Otevřít', 'Firemní portál', '', true, externalIcon);
}

function scheduleDashboardInitialPaint() {
  const run = () => {
    if (typeof updateDashboard === 'function') updateDashboard();
  };
  run();
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(run);
    requestAnimationFrame(() => requestAnimationFrame(run));
  } else {
    setTimeout(run, 0);
    setTimeout(run, 120);
  }
}

function forceHomeRefresh() {
  if (typeof showPage === 'function') showPage('home');
  if (typeof refreshHomeScreen === 'function') refreshHomeScreen();
  else if (typeof updateDashboard === 'function') updateDashboard();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    forceHomeRefresh();
    scheduleDashboardInitialPaint();
  }, { once: true });
} else {
  forceHomeRefresh();
  scheduleDashboardInitialPaint();
}
window.addEventListener('load', () => {
  forceHomeRefresh();
  scheduleDashboardInitialPaint();
}, { once: true });
window.addEventListener('pageshow', () => {
  forceHomeRefresh();
  scheduleDashboardInitialPaint();
});
window.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    forceHomeRefresh();
    scheduleDashboardInitialPaint();
  }
});
