// RaK v1.5.82 – cílený balík: update popup, Report směny, skupiny strojů a Dashboard shell.
(function installRakV1582Fixes() {
  'use strict';

  const BUILD = '1.5.82';
  const UPDATE_LOGO = 'assets/app-icons/icon-192.png?v=1.5.1';
  const SHIFT_INDEXES = Object.freeze({
    mo: Object.freeze(['AF', 'AG', 'AH']),
    to: Object.freeze(['AD', 'AE', 'AH']),
    r01: Object.freeze(['AD', 'AE', 'AH']),
    r07: Object.freeze(['AD', 'AE', 'AH'])
  });
  const knownShiftRows = new WeakSet();
  let adminSummaryFrame = 0;

  try {
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-v1582-fixes.js', 'loading', { source: 'dynamic-loader', build: BUILD });
    }
  } catch (_) {}

  function esc(value) {
    if (typeof escapeHtml === 'function') return escapeHtml(String(value == null ? '' : value));
    return String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  function ensureStyles() {
    if (document.getElementById('rakV1582FixStyles')) return;
    const style = document.createElement('style');
    style.id = 'rakV1582FixStyles';
    style.textContent = `
/* v1.5.82: nabídka aktualizace musí být i nad portálovým dockem jmen v Rotaci. */
html body .rakUpdateToast{z-index:2147483600!important;}
html body .rakUpdateToastBadge{overflow:hidden!important;padding:0!important;flex:0 0 42px!important;}
html body .rakUpdateToastBadge .rakV1582UpdateLogo{display:block!important;width:100%!important;height:100%!important;object-fit:cover!important;border-radius:inherit!important;}
/* v1.5.82: vyčerpaná nabídka indexů se nedá znovu přidat. */
html body .rakShiftAddIndex:disabled{opacity:.42!important;cursor:default!important;filter:saturate(.45)!important;}
/* v1.5.82: zkušebně bez vnější linky Dashboard shellu; vnitřní karty/glass zůstávají. */
html body #home.page.active .dashboardShell,
html body:not(.lightweightMode):not(.lowEndDevice):not(.ladaMode) #home.page.active .dashboardShell,
html body.lightweightMode #home.page.active .dashboardShell,
html body.lowEndDevice #home.page.active .dashboardShell,
html body.ladaMode #home.page.active .dashboardShell{
  border-width:0!important;
  border-color:transparent!important;
  outline:0!important;
}
`;
    document.head.appendChild(style);
  }

  function patchUpdateToast(scope) {
    const root = scope && scope.querySelectorAll ? scope : document;
    const badges = [];
    if (root.nodeType === 1 && root.matches && root.matches('.rakUpdateToastBadge')) badges.push(root);
    root.querySelectorAll('.rakUpdateToastBadge').forEach((badge) => badges.push(badge));
    badges.forEach((badge) => {
      if (badge.dataset.rakV1582Logo === '1') return;
      const img = document.createElement('img');
      img.className = 'rakV1582UpdateLogo';
      img.src = UPDATE_LOGO;
      img.alt = '';
      img.decoding = 'async';
      img.draggable = false;
      badge.replaceChildren(img);
      badge.dataset.rakV1582Logo = '1';
    });
  }

  function shiftSectionId(block) {
    return String(block && block.getAttribute('data-section-block') || '').trim();
  }

  function setShiftIndexVisual(select) {
    if (!select) return;
    const colors = { AF: 'blue', AG: 'green', AH: 'orange', AD: 'blue', AE: 'green' };
    const color = colors[String(select.value || '').trim()] || 'neutral';
    select.classList.remove('rakShiftIndex--blue', 'rakShiftIndex--green', 'rakShiftIndex--orange', 'rakShiftIndex--neutral');
    select.classList.add('rakShiftIndex--' + color);
    select.dataset.indexColor = color;
    const row = select.closest('.rakShiftProdRow');
    if (row) row.dataset.indexColor = color;
  }

  function rebuildShiftSelect(select, allIndexes, otherUsed) {
    if (!select) return;
    const current = String(select.value || '').trim();
    const allowed = allIndexes.filter((index) => index === current || !otherUsed.has(index));
    const values = allowed.length ? allowed : (current ? [current] : allIndexes.slice(0, 1));
    const fragment = document.createDocumentFragment();
    values.forEach((index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = index;
      option.selected = index === current;
      fragment.appendChild(option);
    });
    select.replaceChildren(fragment);
    if (current && values.includes(current)) select.value = current;
    setShiftIndexVisual(select);
  }

  function syncShiftReport(root) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll('[data-section-block]').forEach((block) => {
      const id = shiftSectionId(block);
      const allIndexes = SHIFT_INDEXES[id] || [];
      if (!allIndexes.length) return;
      const selects = Array.from(block.querySelectorAll('.rakShiftIndex'));
      const used = new Set(selects.map((select) => String(select.value || '').trim()).filter(Boolean));
      selects.forEach((select) => {
        const current = String(select.value || '').trim();
        const otherUsed = new Set(selects
          .filter((candidate) => candidate !== select)
          .map((candidate) => String(candidate.value || '').trim())
          .filter(Boolean));
        rebuildShiftSelect(select, allIndexes, otherUsed);
        if (current) select.value = current;
      });
      const add = block.querySelector('[data-shift-add]');
      if (add) {
        const exhausted = allIndexes.every((index) => used.has(index));
        add.disabled = exhausted;
        add.setAttribute('aria-disabled', exhausted ? 'true' : 'false');
        add.title = exhausted ? 'Všechny dostupné indexy už jsou v reportu použité.' : '';
      }
    });
  }

  function initializeShiftReport(root) {
    if (!root || root.dataset.rakV1582IndexFilterReady === '1') return;
    root.querySelectorAll('.rakShiftProdRow').forEach((row) => knownShiftRows.add(row));
    root.dataset.rakV1582IndexFilterReady = '1';
    syncShiftReport(root);
  }

  function repairNewShiftRow(row) {
    if (!row || knownShiftRows.has(row)) return;
    knownShiftRows.add(row);
    const root = row.closest('#rakShiftReport');
    if (!root || root.dataset.rakV1582IndexFilterReady !== '1') return;
    const block = row.closest('[data-section-block]');
    const id = shiftSectionId(block);
    const allIndexes = SHIFT_INDEXES[id] || [];
    const select = row.querySelector('.rakShiftIndex');
    if (!block || !select || !allIndexes.length) return;
    const otherUsed = new Set(Array.from(block.querySelectorAll('.rakShiftIndex'))
      .filter((candidate) => candidate !== select)
      .map((candidate) => String(candidate.value || '').trim())
      .filter(Boolean));
    const current = String(select.value || '').trim();
    if (otherUsed.has(current)) {
      const firstUnused = allIndexes.find((index) => !otherUsed.has(index));
      if (firstUnused) {
        select.value = firstUnused;
        setShiftIndexVisual(select);
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
    syncShiftReport(root);
  }

  function getHardMachines(month) {
    if (month && month.hard && Array.isArray(month.hard.machines) && month.hard.machines.length) return month.hard.machines;
    try { if (typeof HARD_MACHINE_HEADERS !== 'undefined' && Array.isArray(HARD_MACHINE_HEADERS)) return HARD_MACHINE_HEADERS; } catch (_) {}
    return ['TNKS01', 'TBKR07', 'TPKW01', 'TPKW02', 'TBKR01'];
  }

  function getSoftMachines(month) {
    if (month && month.soft && Array.isArray(month.soft.machines) && month.soft.machines.length) return month.soft.machines;
    try { if (typeof SOFT_MACHINE_HEADERS !== 'undefined' && Array.isArray(SOFT_MACHINE_HEADERS)) return SOFT_MACHINE_HEADERS; } catch (_) {}
    return ['MSKC01', 'MSKC03', 'MSKC04', 'MFKF06', 'MFKF10'];
  }

  function groupedMachineKey(machine) {
    const value = String(machine || '').trim().toUpperCase();
    if (value.startsWith('TBK')) return 'TBK';
    if (value.startsWith('MSK')) return 'MSK';
    if (value.startsWith('MFK')) return 'MFK';
    return value;
  }

  function canonicalName(raw, names) {
    try {
      if (typeof adminRotationCanonicalName === 'function') return adminRotationCanonicalName(raw, names);
    } catch (_) {}
    return String(raw || '').trim();
  }

  function machineIndex(machines, wanted) {
    try {
      if (typeof adminRotationGeneratorMachineIndex === 'function') return adminRotationGeneratorMachineIndex(machines, wanted);
    } catch (_) {}
    return machines.findIndex((machine) => String(machine || '').trim().toUpperCase() === String(wanted || '').trim().toUpperCase());
  }

  function shouldSplitPress(date, monthKey, month) {
    try {
      if (typeof adminRotationGeneratorShouldSplitPressMachines === 'function') {
        return !!adminRotationGeneratorShouldSplitPressMachines(date, monthKey, month);
      }
    } catch (_) {}
    return false;
  }

  function formatCount(value) {
    try {
      if (typeof adminRotationGeneratorFormatCount === 'function') return adminRotationGeneratorFormatCount(value);
    } catch (_) {}
    const number = Number(value || 0);
    return Number.isInteger(number) ? String(number) : String(Math.round(number * 10) / 10).replace('.', ',');
  }

  function collectNames(month) {
    try {
      if (typeof adminGetKnownNames === 'function') {
        const known = adminGetKnownNames();
        if (Array.isArray(known) && known.length) return known;
      }
    } catch (_) {}
    const names = new Set();
    ['hard', 'soft'].forEach((sectionKey) => {
      const rows = Array.isArray(month && month[sectionKey] && month[sectionKey].rows) ? month[sectionKey].rows : [];
      rows.forEach((row) => (Array.isArray(row && row.cells) ? row.cells : []).forEach((cell) => {
        const name = String(cell || '').trim();
        if (name) names.add(name);
      }));
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b, 'cs'));
  }

  function buildGroupedMachineSummary(month, monthKey, options) {
    if (!month) return '<div class="smallText">Souhrn zatím není dostupný.</div>';
    const opts = options || {};
    const names = collectNames(month);
    const nameSet = new Set(names);
    const machineMap = new Map();
    const sectionTotals = { hard: new Map(), soft: new Map() };

    const addMachine = (machine, person, amount) => {
      const group = groupedMachineKey(machine);
      const name = String(person || '').trim();
      if (!group || !name) return;
      if (!machineMap.has(group)) machineMap.set(group, new Map());
      const map = machineMap.get(group);
      map.set(name, Number(map.get(name) || 0) + Number(amount || 0));
    };
    const addTotal = (sectionKey, person, amount) => {
      const name = String(person || '').trim();
      if (!name) return;
      const map = sectionKey === 'soft' ? sectionTotals.soft : sectionTotals.hard;
      map.set(name, Number(map.get(name) || 0) + Number(amount || 0));
    };

    const addSection = (sectionKey, machines) => {
      const rows = Array.isArray(month && month[sectionKey] && month[sectionKey].rows) ? month[sectionKey].rows : [];
      rows.forEach((row) => {
        const cells = Array.isArray(row && row.cells) ? row.cells : [];
        if (sectionKey === 'hard') {
          const tnksIdx = machineIndex(machines, 'TNKS01');
          const tpkw01Idx = machineIndex(machines, 'TPKW01');
          if (tnksIdx >= 0 && tpkw01Idx >= 0 && shouldSplitPress(row && row.date, monthKey, month)) {
            [tnksIdx, tpkw01Idx].forEach((idx) => {
              const person = canonicalName(cells[idx], names);
              if (!person || (nameSet.size && !nameSet.has(person))) return;
              addMachine('TNKS01', person, 0.5);
              addMachine('TPKW01', person, 0.5);
              addTotal('hard', person, 1);
            });
            machines.forEach((machine, idx) => {
              const key = String(machine || '').trim().toUpperCase();
              if (!key || key === 'TNKS01' || key === 'TPKW01') return;
              const person = canonicalName(cells[idx], names);
              if (!person || (nameSet.size && !nameSet.has(person))) return;
              addMachine(machine, person, 1);
              addTotal('hard', person, 1);
            });
            return;
          }
        }
        machines.forEach((machine, idx) => {
          const person = canonicalName(cells[idx], names);
          if (!person || (nameSet.size && !nameSet.has(person))) return;
          addMachine(machine, person, 1);
          addTotal(sectionKey, person, 1);
        });
      });
    };

    addSection('hard', getHardMachines(month));
    addSection('soft', getSoftMachines(month));

    const usedNames = names.filter((name) => Array.from(machineMap.values()).some((map) => map.has(name))
      || sectionTotals.hard.has(name) || sectionTotals.soft.has(name));
    if (!usedNames.length || !machineMap.size) return '<div class="smallText">Souhrn bude dostupný po vyplnění rozpisu.</div>';

    const preferredOrder = ['TNKS01', 'TPKW01', 'TPKW02', 'TBK', 'MSK', 'MFK'];
    const remaining = Array.from(machineMap.keys()).filter((key) => !preferredOrder.includes(key)).sort((a, b) => a.localeCompare(b, 'cs'));
    const columns = preferredOrder.filter((key) => machineMap.has(key)).concat(remaining);
    const head = '<tr><th>Jméno</th><th>TO</th><th>MO</th>'
      + columns.map((key) => '<th>' + esc(key) + '</th>').join('') + '</tr>';
    const body = usedNames.map((name) => {
      const hardTotal = Number(sectionTotals.hard.get(name) || 0);
      const softTotal = Number(sectionTotals.soft.get(name) || 0);
      const cells = columns.map((key) => {
        const count = Number(machineMap.get(key) && machineMap.get(key).get(name) || 0);
        return '<td class="' + (count ? 'adminRotationMachineCountHit' : '') + '">' + esc(formatCount(count)) + '</td>';
      }).join('');
      return '<tr><td>' + esc(name) + '</td>'
        + '<td class="' + (hardTotal ? 'adminRotationMachineCountHit' : '') + '">' + esc(formatCount(hardTotal)) + '</td>'
        + '<td class="' + (softTotal ? 'adminRotationMachineCountHit' : '') + '">' + esc(formatCount(softTotal)) + '</td>'
        + cells + '</tr>';
    }).join('');
    const openAttr = opts.open === false ? '' : ' open';
    const summaryTitle = opts.admin ? 'Přehled: jména × skupiny strojů' : 'Rychlý přehled: jména × stroje';
    return [
      '<details class="adminRotationGeneratorMachineSummary"' + openAttr + '>',
      '  <summary>' + esc(summaryTitle) + '</summary>',
      '  <div class="smallText">TBK = všechny TBKR, MSK = všechny MSKC a MFK = všechny MFKF. TNKS01/TPKW01 si zachovávají pravidlo 0,5 + 0,5 tam, kde se střídají. TO/MO zůstávají celkové součty.</div>',
      '  <div class="adminRotationGeneratorMachineSummaryScroll">',
      '    <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense adminRotationGeneratorMachineSummaryTable"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>',
      '  </div>',
      '</details>'
    ].join('');
  }

  function installGroupedSummaryOverride() {
    if (window.__rakV1582GroupedSummaryInstalled) return true;
    if (typeof window.adminBuildRotationMachineCountSummaryHtml !== 'function') return false;
    window.__rakV1582OriginalMachineSummary = window.adminBuildRotationMachineCountSummaryHtml;
    const grouped = function adminBuildRotationMachineCountSummaryHtmlV1582(month, monthKey) {
      return buildGroupedMachineSummary(month, monthKey, { open: true, admin: false });
    };
    window.adminBuildRotationMachineCountSummaryHtml = grouped;
    try { adminBuildRotationMachineCountSummaryHtml = grouped; } catch (_) {}
    window.rakV1582BuildGroupedMachineSummary = buildGroupedMachineSummary;
    window.__rakV1582GroupedSummaryInstalled = true;
    return true;
  }

  function adminEditorMonth() {
    let monthKey = '';
    try { if (typeof getAdminSelectedMonthKey === 'function') monthKey = String(getAdminSelectedMonthKey() || '').trim(); } catch (_) {}
    let month = null;
    try {
      if (monthKey && typeof readAdminRotationFromDom === 'function' && document.querySelector('#adminRotationEditor tr[data-rotation-section]')) {
        month = readAdminRotationFromDom(monthKey);
      }
    } catch (_) {}
    if (!month) {
      try { month = app && app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null; } catch (_) {}
    }
    return { monthKey, month };
  }

  function refreshAdminGroupedSummary() {
    adminSummaryFrame = 0;
    if (!installGroupedSummaryOverride()) return;
    const editor = document.getElementById('adminRotationEditor');
    const anchor = document.getElementById('adminRotationFreeNamesSummary');
    if (!editor || !anchor || !anchor.parentNode) return;
    const state = adminEditorMonth();
    if (!state.monthKey || !state.month) return;
    let container = document.getElementById('rakV1582AdminMachineSummary');
    const wasOpen = !!(container && container.querySelector('details') && container.querySelector('details').open);
    const fingerprint = state.monthKey + '|' + JSON.stringify(state.month);
    if (container && container.dataset.rakFingerprint === fingerprint) return;
    if (!container) {
      container = document.createElement('div');
      container.id = 'rakV1582AdminMachineSummary';
      container.className = 'rakV1582AdminMachineSummary';
      anchor.insertAdjacentElement('afterend', container);
    }
    container.innerHTML = buildGroupedMachineSummary(state.month, state.monthKey, { open: wasOpen, admin: true });
    container.dataset.rakFingerprint = fingerprint;
  }

  function scheduleAdminSummary() {
    if (adminSummaryFrame) return;
    const run = () => refreshAdminGroupedSummary();
    if (typeof requestAnimationFrame === 'function') adminSummaryFrame = requestAnimationFrame(run);
    else {
      adminSummaryFrame = 1;
      setTimeout(run, 0);
    }
  }

  function scanNode(node) {
    if (!node || node.nodeType !== 1) return;
    patchUpdateToast(node);
    const reportRoots = [];
    if (node.matches && node.matches('#rakShiftReport')) reportRoots.push(node);
    if (node.querySelectorAll) node.querySelectorAll('#rakShiftReport').forEach((root) => reportRoots.push(root));
    reportRoots.forEach(initializeShiftReport);

    const rows = [];
    if (node.matches && node.matches('.rakShiftProdRow')) rows.push(node);
    if (node.querySelectorAll) node.querySelectorAll('.rakShiftProdRow').forEach((row) => rows.push(row));
    rows.forEach(repairNewShiftRow);

    if ((node.matches && (node.matches('#adminRotationEditor') || node.matches('#adminRotationFreeNamesSummary')))
      || (node.querySelector && (node.querySelector('#adminRotationEditor') || node.querySelector('#adminRotationFreeNamesSummary')))) {
      scheduleAdminSummary();
    }
  }

  function install() {
    ensureStyles();
    installGroupedSummaryOverride();
    patchUpdateToast(document);
    const report = document.getElementById('rakShiftReport');
    if (report) initializeShiftReport(report);
    scheduleAdminSummary();

    document.addEventListener('change', (event) => {
      const select = event.target && event.target.closest ? event.target.closest('#rakShiftReport .rakShiftIndex') : null;
      if (select) {
        setShiftIndexVisual(select);
        const root = select.closest('#rakShiftReport');
        queueMicrotask(() => syncShiftReport(root));
      }
      if (event.target && event.target.closest && event.target.closest('#adminRotationEditor')) scheduleAdminSummary();
    });
    document.addEventListener('input', (event) => {
      if (event.target && event.target.closest && event.target.closest('#adminRotationEditor')) scheduleAdminSummary();
    });

    const observer = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach(scanNode);
        if (record.removedNodes && record.removedNodes.length) {
          const root = document.getElementById('rakShiftReport');
          if (root) syncShiftReport(root);
        }
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.__rakV1582FixObserver = observer;

    if (!window.__rakV1582GroupedSummaryInstalled) {
      let retries = 0;
      const timer = setInterval(() => {
        retries += 1;
        if (installGroupedSummaryOverride() || retries >= 40) {
          clearInterval(timer);
          scheduleAdminSummary();
        }
      }, 50);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();

  try {
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-v1582-fixes.js', 'loaded', { source: 'dynamic-loader', build: BUILD });
    }
  } catch (_) {}
})();