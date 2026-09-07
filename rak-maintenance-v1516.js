// RaK v1.5.16 – konsolidované provozní opravy bez globálních MutationObserverů.
(function installRakMaintenanceV1516() {
  'use strict';

  const BUILD = 'v1.5.16';
  const INDEX_ORDER = Object.freeze({ AG: 0, AE: 0, AF: 1, AD: 1, AH: 2 });
  const REPORT_SEPARATOR = '__________';
  let previewSorting = false;
  let reportOpenWrapped = false;
  let adminLazyReplay = false;

  window.RAK_DEV_BUILD = BUILD;

  function getAllShiftTeams() {
    try {
      if (Array.isArray(window.SHIFT_CYCLE_ORDER) && window.SHIFT_CYCLE_ORDER.length) return window.SHIFT_CYCLE_ORDER.slice();
    } catch (_) {}
    return ['A', 'B', 'C', 'D'];
  }

  function findFirstMorningShiftDateInMonth(now) {
    const d = now instanceof Date ? new Date(now.getTime()) : new Date(now || Date.now());
    const year = d.getFullYear();
    const monthIndex = d.getMonth();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const teams = getAllShiftTeams();

    if (typeof window.getTeamShiftState === 'function') {
      for (let day = 1; day <= daysInMonth; day += 1) {
        const probe = new Date(year, monthIndex, day, 9, 0, 0, 0);
        for (const team of teams) {
          try {
            const state = window.getTeamShiftState(probe, team);
            if (!state || !state.active) continue;
            const label = String(state.label || '').trim();
            if (/^R/i.test(label) || /rann/i.test(label)) return new Date(year, monthIndex, day, 6, 0, 0, 0);
          } catch (_) {}
        }
      }
    }
    return new Date(year, monthIndex, 1, 6, 0, 0, 0);
  }

  function installFirstMorningCalendarFix() {
    window.getFirstMorningShiftDateInMonth = findFirstMorningShiftDateInMonth;
    window.rakGetFirstMorningShiftDateInMonthAllTeams = findFirstMorningShiftDateInMonth;
  }

  function installDashboardFullShiftLabel() {
    const original = window.buildDashboardPersonalHeroHtml;
    if (typeof original !== 'function' || original.__rakFullShiftLabel) return;
    const patched = function () {
      const html = String(original.apply(this, arguments) || '');
      return html
        .replace(/(dashboardPersonalStatus\">[^<]*?\s·\s)R8?(?=<\/div>)/i, '$1Ranní')
        .replace(/(dashboardPersonalStatus\">[^<]*?\s·\s)N8?(?=<\/div>)/i, '$1Noční')
        .replace(/(Právě v práci\s*·\s*)R8?(?=<\/div>)/i, '$1Ranní')
        .replace(/(Právě v práci\s*·\s*)N8?(?=<\/div>)/i, '$1Noční');
    };
    patched.__rakFullShiftLabel = true;
    patched.__rakOriginal = original;
    window.buildDashboardPersonalHeroHtml = patched;
    try { buildDashboardPersonalHeroHtml = patched; } catch (_) {}
    try { if (typeof window.updateDashboard === 'function') window.updateDashboard(); } catch (_) {}
  }

  function reportLineIndex(line) {
    const match = String(line || '').match(/\b(AF|AG|AH|AD|AE)\b/i);
    return match ? match[1].toUpperCase() : '';
  }

  function formatShiftReportText(text) {
    let lines = String(text || '').replace(/\r/g, '').split('\n');
    if (lines.length && /^\s*RaK\s*[–-]\s*REPORT SMĚNY\s*$/i.test(lines[0])) lines.shift();

    lines = lines
      .filter((line) => !/^\s*_{5,}\s*$/.test(String(line || '')))
      .map((line) => {
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

    lines.forEach((line) => {
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

    const compact = [];
    out.forEach((line) => {
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
      rows.forEach((item) => out.push(item.line));
    }
    return out.join('\n');
  }

  function sortReportPreview(root) {
    if (previewSorting) return;
    const targetRoot = root || document.getElementById('rakShiftReport');
    const preview = targetRoot && targetRoot.querySelector ? targetRoot.querySelector('.rakShiftPreview') : null;
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

  function setReportStatus(root, text) {
    const status = root && root.querySelector ? root.querySelector('.rakShiftStatus') : null;
    if (status) status.textContent = text;
  }

  function openWhatsAppWithoutBlankPage(root) {
    sortReportPreview(root);
    const preview = root && root.querySelector ? root.querySelector('.rakShiftPreview') : null;
    const text = preview ? String(preview.textContent || '').trim() : '';
    if (!text) return;
    const link = document.createElement('a');
    link.href = 'whatsapp://send?text=' + encodeURIComponent(text);
    link.style.display = 'none';
    link.setAttribute('aria-hidden', 'true');
    document.body.appendChild(link);
    try {
      link.click();
      setReportStatus(root, 'Otevírám WhatsApp…');
    } finally {
      setTimeout(() => link.remove(), 0);
    }
  }

  function wrapReportOpen() {
    if (reportOpenWrapped || !window.RakShiftReport || typeof window.RakShiftReport.open !== 'function') return false;
    const original = window.RakShiftReport.open;
    window.RakShiftReport.open = function () {
      const result = original.apply(this, arguments);
      scheduleReportSort();
      setTimeout(() => sortReportPreview(), 20);
      return result;
    };
    reportOpenWrapped = true;
    return true;
  }

  function installReportHooks() {
    ['input', 'change'].forEach((type) => {
      document.addEventListener(type, (event) => {
        const root = event.target && event.target.closest ? event.target.closest('#rakShiftReport') : null;
        if (root) scheduleReportSort(root);
      }, true);
    });
    document.addEventListener('click', (event) => {
      const whatsapp = event.target && event.target.closest ? event.target.closest('[data-rak-share-action="whatsapp"]') : null;
      if (whatsapp) {
        const root = whatsapp.closest('#rakShiftReport');
        if (root) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          openWhatsAppWithoutBlankPage(root);
          return;
        }
      }
      const root = event.target && event.target.closest ? event.target.closest('#rakShiftReport') : null;
      if (root) scheduleReportSort(root);
    }, true);
    window.addEventListener('focus', () => scheduleReportSort());
    window.addEventListener('pageshow', () => scheduleReportSort());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') scheduleReportSort();
    });
    if (!wrapReportOpen()) {
      let tries = 0;
      const timer = setInterval(() => {
        tries += 1;
        if (wrapReportOpen() || tries >= 40) clearInterval(timer);
      }, 100);
    }
  }

  function removeDevelopmentBadge() {
    document.querySelectorAll('.calcTileText .calcDevBadge').forEach((badge) => {
      const parent = badge.closest('.calcTileText');
      if (parent && /Brusy/i.test(parent.textContent || '')) badge.remove();
    });
  }

  function cleanBrusResultText() {
    document.querySelectorAll('#korekce-brusy .brus157Meta').forEach((meta) => {
      const phrase = ' · hodnota už je v pásmu, ale korekce ji posune blíž středu';
      if ((meta.textContent || '').includes(phrase)) meta.textContent = (meta.textContent || '').replace(phrase, '');
    });
  }

  function blankBrusResultKeys() {
    const result = new Set();
    [
      ['brus157_c1_left', 'C1|vlevo'],
      ['brus157_c1_right', 'C1|vpravo'],
      ['brus157_c2_left', 'C2|vlevo'],
      ['brus157_c2_right', 'C2|vpravo']
    ].forEach(([id, key]) => {
      const input = document.getElementById(id);
      if (!input || String(input.value || '').trim() === '') result.add(key);
    });
    return result;
  }

  function pruneBlankBrusResults(blankKeys) {
    if (!blankKeys || !blankKeys.size) return;
    document.querySelectorAll('#korekce-brusy .brus157ResultSide').forEach((card) => {
      const label = String(card.querySelector('.brus157ResultTop > span')?.textContent || '').trim();
      const match = /^(C1|C2)\s*·\s*FHB\s*(vlevo|vpravo)$/i.exec(label);
      if (!match) return;
      const key = match[1].toUpperCase() + '|' + match[2].toLowerCase();
      if (blankKeys.has(key)) card.remove();
    });
  }

  function installBrusHooks() {
    document.addEventListener('click', (event) => {
      const evaluate = event.target && event.target.closest ? event.target.closest('#brus157Evaluate') : null;
      if (evaluate) {
        const blanks = blankBrusResultKeys();
        window.__rakBrusFhbBlankKeys = blanks;
        const prune = () => {
          pruneBlankBrusResults(blanks);
          cleanBrusResultText();
        };
        if (typeof queueMicrotask === 'function') queueMicrotask(prune); else setTimeout(prune, 0);
        if (typeof requestAnimationFrame === 'function') requestAnimationFrame(prune);
        setTimeout(prune, 40);
      }
      const calcEntry = event.target && event.target.closest ? event.target.closest('[data-action="page-korekce-brusy"]') : null;
      if (calcEntry) setTimeout(() => { removeDevelopmentBadge(); cleanBrusResultText(); }, 0);
    }, true);
    removeDevelopmentBadge();
    cleanBrusResultText();
  }

  function calibrationRate(row) {
    const before = Number(row && row.before);
    const after = Number(row && row.after);
    const correction = Number(row && row.correction);
    if (![before, after, correction].every(Number.isFinite) || Math.abs(correction) < 0.0001) return NaN;
    const rate = (before - after) / correction;
    return Number.isFinite(rate) && rate >= 0.25 && rate <= 8 ? rate : NaN;
  }

  function reliabilityLevel(count) {
    if (count >= 8) return { level: 'high', text: 'vysoká · ' + count + ' vz.' };
    if (count >= 3) return { level: 'medium', text: 'střední · ' + count + ' vz.' };
    return { level: 'low', text: 'nízká · ' + count + '/3' };
  }

  function decorateBrusCalibrationReliability() {
    const root = document.querySelector('.adminBrusFhbCalibration');
    if (!root || root.querySelector('.adminBrusFhbReliability')) return;
    let settings = null;
    try { settings = typeof window.getBrusFhbCorrectionCalibrationSettings === 'function' ? window.getBrusFhbCorrectionCalibrationSettings() : null; } catch (_) {}
    const records = Array.isArray(settings && settings.records) ? settings.records : [];
    const rows = [];
    ['TBKR01', 'TBKR07'].forEach((machine) => {
      ['left', 'right'].forEach((side) => {
        const count = records.filter((row) => row && row.machine === machine && row.side === side && Number.isFinite(calibrationRate(row))).length;
        const state = reliabilityLevel(count);
        rows.push('<div class="adminBrusFhbReliabilityItem" data-level="' + state.level + '"><span>' + machine + ' · ' + (side === 'left' ? 'vlevo' : 'vpravo') + '</span><b>' + state.text + '</b></div>');
      });
    });
    const block = document.createElement('div');
    block.className = 'adminBrusFhbReliability';
    block.innerHTML = rows.join('');
    const model = root.querySelector('.adminBrusFhbModel');
    if (model) model.insertBefore(block, model.querySelector('.adminBrusFhbMetrics') || null);
  }

  function updateBuildInfo() {
    document.querySelectorAll('[data-rak-dev-build-info="1"]').forEach((node) => { node.textContent = 'Testovací build: ' + BUILD; });
  }

  function installLazyAdminGuard() {
    document.addEventListener('click', async (event) => {
      if (adminLazyReplay) return;
      const button = event.target && event.target.closest ? event.target.closest('[data-menu-action="admin"]') : null;
      if (!button || typeof window.ensureRakAdminModulesLoaded !== 'function') return;
      if (button.dataset.rakLazyAdminReady === '1') return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      button.disabled = true;
      try {
        await window.ensureRakAdminModulesLoaded();
        button.dataset.rakLazyAdminReady = '1';
        adminLazyReplay = true;
        button.click();
      } catch (err) {
        console.error('RaK admin lazy load failed', err);
        if (typeof alert === 'function') alert('Administraci se nepodařilo načíst. Zkus aplikaci znovu otevřít.');
      } finally {
        adminLazyReplay = false;
        button.disabled = false;
      }
    }, true);
  }

  function boot() {
    installFirstMorningCalendarFix();
    installDashboardFullShiftLabel();
    installReportHooks();
    installBrusHooks();
    installLazyAdminGuard();
    updateBuildInfo();
    decorateBrusCalibrationReliability();

    document.addEventListener('click', () => {
      if (typeof queueMicrotask === 'function') queueMicrotask(() => {
        updateBuildInfo();
        decorateBrusCalibrationReliability();
      });
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  window.rakFormatShiftReportText = formatShiftReportText;
  window.rakSortShiftReportRowsByIndexColor = sortReportRowsByIndexColor;
})();
