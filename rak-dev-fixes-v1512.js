// RaK DEV v1.5.14 – provozní opravy: kalendář, report směny a WhatsApp.
(function () {
  'use strict';

  const INDEX_ORDER = { AG: 0, AE: 0, AF: 1, AD: 1, AH: 2 };
  const REPORT_SEPARATOR = '__________';
  let previewSorting = false;

  function sameDay(a, b) {
    return !!(a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate());
  }

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

  function reportLineIndex(line) {
    const match = String(line || '').match(/\b(AF|AG|AH|AD|AE)\b/i);
    return match ? match[1].toUpperCase() : '';
  }

  function formatShiftReportText(text) {
    let lines = String(text || '').replace(/\r/g, '').split('\n');

    // V reportu pro mistra už není potřeba interní nadpis RaK – REPORT SMĚNY.
    if (lines.length && /^\s*RaK\s*[–-]\s*REPORT SMĚNY\s*$/i.test(lines[0])) lines.shift();

    lines = lines
      .filter(line => !/^\s*_{5,}\s*$/.test(String(line || '')))
      .map(line => {
        let value = String(line || '');
        value = value.replace(/\s*·\s*R8?\s*$/i, ' · Ranní');
        value = value.replace(/\s*·\s*N8?\s*$/i, ' · Noční');
        const nok = value.match(/^\s*NoK\s+celkem:\s*(.+?)\s*$/i);
        if (nok) value = '  - ' + nok[1] + ' NoK';
        return value;
      });

    const out = [];
    let grinderSeen = false;

    const trimTrailingBlankLines = () => {
      while (out.length && !String(out[out.length - 1] || '').trim()) out.pop();
    };

    lines.forEach(line => {
      const header = String(line || '').trim();
      const grinderHeader = header === 'TBKR01:' || header === 'TRBR07:';

      if (grinderHeader) {
        if (!grinderSeen) {
          trimTrailingBlankLines();
          if (out.length && out[out.length - 1] !== REPORT_SEPARATOR) out.push(REPORT_SEPARATOR);
        } else if (header === 'TRBR07:') {
          trimTrailingBlankLines();
          out.push('');
        }
        grinderSeen = true;
        out.push(line);
        return;
      }

      if (header === 'PROBLÉMY:') {
        trimTrailingBlankLines();
        if (grinderSeen && out[out.length - 1] !== REPORT_SEPARATOR) out.push(REPORT_SEPARATOR);
        if (out.length) out.push('');
        out.push(line);
        return;
      }

      out.push(line);
    });

    // Nanejvýš jeden prázdný řádek mezi bloky a žádné prázdné řádky na krajích.
    const compact = [];
    out.forEach(line => {
      const blank = !String(line || '').trim();
      if (blank && (!compact.length || !String(compact[compact.length - 1] || '').trim())) return;
      compact.push(line);
    });
    while (compact.length && !String(compact[0] || '').trim()) compact.shift();
    while (compact.length && !String(compact[compact.length - 1] || '').trim()) compact.pop();
    return compact.join('\n');
  }

  function sortReportRowsByIndexColor(text) {
    const lines = String(text || '').split('\n');
    const out = [];
    let i = 0;
    while (i < lines.length) {
      const header = String(lines[i] || '').trim();
      if (!/^(MO|TO|TBKR01|TRBR07):$/.test(header)) {
        out.push(lines[i]);
        i += 1;
        continue;
      }

      out.push(lines[i]);
      i += 1;
      const rows = [];
      while (i < lines.length && /^\s*-\s*/.test(lines[i])) {
        rows.push({ line: lines[i], pos: rows.length, index: reportLineIndex(lines[i]) });
        i += 1;
      }
      rows.sort((a, b) => {
        const ao = Object.prototype.hasOwnProperty.call(INDEX_ORDER, a.index) ? INDEX_ORDER[a.index] : 99;
        const bo = Object.prototype.hasOwnProperty.call(INDEX_ORDER, b.index) ? INDEX_ORDER[b.index] : 99;
        return ao - bo || a.pos - b.pos;
      });
      rows.forEach(item => out.push(item.line));
    }
    return out.join('\n');
  }

  function sortReportPreview(root) {
    if (previewSorting) return;
    const preview = root && root.querySelector ? root.querySelector('.rakShiftPreview') : null;
    if (!preview) return;
    const before = String(preview.textContent || '');
    const after = sortReportRowsByIndexColor(formatShiftReportText(before));
    if (after === before) return;
    previewSorting = true;
    preview.textContent = after;
    previewSorting = false;
  }

  function scheduleReportSort(root) {
    const run = () => sortReportPreview(root || document.getElementById('rakShiftReport'));
    if (typeof queueMicrotask === 'function') queueMicrotask(run);
    else setTimeout(run, 0);
  }

  function installReportIndexOrderFix() {
    document.addEventListener('input', event => {
      const root = event.target && event.target.closest ? event.target.closest('#rakShiftReport') : null;
      if (root) scheduleReportSort(root);
    }, true);
    document.addEventListener('change', event => {
      const root = event.target && event.target.closest ? event.target.closest('#rakShiftReport') : null;
      if (root) scheduleReportSort(root);
    }, true);
    document.addEventListener('click', event => {
      const root = event.target && event.target.closest ? event.target.closest('#rakShiftReport') : null;
      if (root) scheduleReportSort(root);
    }, true);

    try {
      const observer = new MutationObserver(() => scheduleReportSort());
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
      window.__rakShiftReportIndexOrderObserver = observer;
    } catch (err) {}
    scheduleReportSort();
  }

  function installReportReturnSortFix() {
    // Po návratu z externí aplikace pouze znovu srovnáme náhled; nic nepřerenderujeme,
    // takže rozepsaný report i scroll zůstanou na místě.
    window.addEventListener('focus', () => scheduleReportSort());
    window.addEventListener('pageshow', () => scheduleReportSort());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') scheduleReportSort();
    });
  }

  function boot() {
    installFirstMorningCalendarFix();
    installReportIndexOrderFix();
    installReportReturnSortFix();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  window.rakGetFirstMorningShiftDateInMonthAllTeams = findFirstMorningShiftDateInMonth;
  window.rakFormatShiftReportText = formatShiftReportText;
  window.rakSortShiftReportRowsByIndexColor = sortReportRowsByIndexColor;
})();
