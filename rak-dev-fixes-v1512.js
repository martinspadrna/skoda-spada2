// RaK DEV v1.5.14 – provozní oprava první ranní směny v měsíci.
(function () {
  'use strict';

  function getAllShiftTeams() {
    try {
      if (Array.isArray(window.SHIFT_CYCLE_ORDER) && window.SHIFT_CYCLE_ORDER.length) return window.SHIFT_CYCLE_ORDER.slice();
    } catch (err) {}
    return ['A', 'B', 'C', 'D'];
  }

  function findFirstMorningShiftDateInMonth(now) {
    const d = now instanceof Date ? new Date(now.getTime()) : new Date();
    const year = d.getFullYear();
    const monthIndex = d.getMonth();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const teams = getAllShiftTeams();

    if (typeof window.getTeamShiftState === 'function') {
      for (let day = 1; day <= daysInMonth; day += 1) {
        // 09:00 leží bezpečně uvnitř ranní směny 6–18 i ranní 8h směny 6–14.
        const probe = new Date(year, monthIndex, day, 9, 0, 0, 0);
        for (const team of teams) {
          try {
            const state = window.getTeamShiftState(probe, team);
            if (!state || !state.active) continue;
            const label = String(state.label || '').trim();
            if (/^R/i.test(label) || /rann/i.test(label)) return new Date(year, monthIndex, day, 6, 0, 0, 0);
          } catch (err) {}
        }
      }
    }

    // Bez směnového enginu je nejbezpečnější obecný význam „první ranní v měsíci“ první den měsíce.
    return new Date(year, monthIndex, 1, 6, 0, 0, 0);
  }

  function installFirstMorningCalendarFix() {
    // stats.js je načtený před tímto modulem. Přepis globálního helperu zajistí,
    // že Roznýtování není vázané jen na první ranní směny D, ale na první ranní
    // směnu kteréhokoli týmu v daném měsíci.
    window.getFirstMorningShiftDateInMonth = findFirstMorningShiftDateInMonth;
  }

  function boot() {
    installFirstMorningCalendarFix();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  window.rakGetFirstMorningShiftDateInMonthAllTeams = findFirstMorningShiftDateInMonth;
})();
