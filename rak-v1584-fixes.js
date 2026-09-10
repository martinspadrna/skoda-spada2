// RaK v1.5.84 – stabilizace mobilního přehledu Rozpisů a Reportu směny.
(function installRakV1584StabilityFixes() {
  'use strict';

  const BUILD = '1.5.84';
  const UPDATE_LOGO = 'assets/app-icons/icon-192.png?v=1.5.1';
  const SHIFT_INDEXES = Object.freeze({
    mo: Object.freeze(['AF', 'AG', 'AH']),
    to: Object.freeze(['AD', 'AE', 'AH']),
    r01: Object.freeze(['AD', 'AE', 'AH']),
    r07: Object.freeze(['AD', 'AE', 'AH'])
  });
  const knownShiftRows = new WeakSet();
  let adminSummaryFrame = 0;

  function ensureStyles() {
    if (document.getElementById('rakV1584FixStyles')) return;
    const style = document.createElement('style');
    style.id = 'rakV1584FixStyles';
    style.textContent = `
/* v1.5.84: nový skupinový přehled nesmí roztáhnout Administraci ani spodní navigaci mimo viewport. */
html body #appMenuBody[data-admin-view="rotation"],
html body #appMenuBody[data-admin-view="rotation"] #adminRotationEditor,
html body #appMenuBody[data-admin-view="rotation"] #rakV1582AdminMachineSummary,
html body #appMenuBody[data-admin-view="rotation"] #rakV1582AdminMachineSummary .adminRotationGeneratorMachineSummary{
  box-sizing:border-box!important;
  width:100%!important;
  max-width:100%!important;
  min-width:0!important;
}
html body #appMenuBody[data-admin-view="rotation"] #rakV1582AdminMachineSummary,
html body #appMenuBody[data-admin-view="rotation"] #rakV1582AdminMachineSummary .adminRotationGeneratorMachineSummary{
  overflow:hidden!important;
}
html body #appMenuBody[data-admin-view="rotation"] #rakV1582AdminMachineSummary .adminRotationGeneratorMachineSummary > summary,
html body #appMenuBody[data-admin-view="rotation"] #rakV1582AdminMachineSummary .adminRotationGeneratorMachineSummary > .smallText{
  box-sizing:border-box!important;
  max-width:100%!important;
  min-width:0!important;
  white-space:normal!important;
  overflow-wrap:anywhere!important;
}
html body #appMenuBody[data-admin-view="rotation"] #rakV1582AdminMachineSummary .adminRotationGeneratorMachineSummaryScroll{
  box-sizing:border-box!important;
  width:100%!important;
  max-width:100%!important;
  min-width:0!important;
  overflow-x:auto!important;
  overflow-y:hidden!important;
  overscroll-behavior-x:contain!important;
  -webkit-overflow-scrolling:touch!important;
}
html body #appMenuBody[data-admin-view="rotation"] #rakV1582AdminMachineSummary .adminRotationGeneratorMachineSummaryTable{
  width:max-content!important;
  min-width:620px!important;
  max-width:none!important;
}
@media(max-width:520px){
  html body #appMenuBody[data-admin-view="rotation"] #rakV1582AdminMachineSummary .adminRotationGeneratorMachineSummary > summary{
    padding:9px 10px!important;
    font-size:14px!important;
    line-height:1.2!important;
  }
  html body #appMenuBody[data-admin-view="rotation"] #rakV1582AdminMachineSummary .adminRotationGeneratorMachineSummary > .smallText{
    padding-left:10px!important;
    padding-right:10px!important;
    font-size:11px!important;
    line-height:1.35!important;
  }
  html body #appMenuBody[data-admin-view="rotation"] #rakV1582AdminMachineSummary .adminRotationGeneratorMachineSummaryScroll{
    padding-left:8px!important;
    padding-right:8px!important;
  }
}
`;
    document.head.appendChild(style);
  }

  function retireLegacyObserver() {
    const observer = window.__rakV1582FixObserver;
    if (!observer || typeof observer.disconnect !== 'function') return false;
    try {
      observer.disconnect();
      window.__rakV1582FixObserverRetiredByV1584 = true;
      return true;
    } catch (_) {
      return false;
    }
  }

  function scheduleLegacyObserverRetirement() {
    if (retireLegacyObserver()) return;
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (retireLegacyObserver() || attempts >= 50) clearInterval(timer);
    }, 40);
  }

  function patchUpdateToast(scope) {
    const root = scope && scope.querySelectorAll ? scope : document;
    const badges = [];
    if (root.nodeType === 1 && root.matches && root.matches('.rakUpdateToastBadge')) badges.push(root);
    if (root.querySelectorAll) root.querySelectorAll('.rakUpdateToastBadge').forEach((badge) => badges.push(badge));
    badges.forEach((badge) => {
      if (badge.querySelector && badge.querySelector('.rakV1582UpdateLogo, .rakV1584UpdateLogo')) return;
      const img = document.createElement('img');
      img.className = 'rakV1584UpdateLogo';
      img.src = UPDATE_LOGO;
      img.alt = '';
      img.decoding = 'async';
      img.draggable = false;
      badge.replaceChildren(img);
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

  function sameValues(select, values) {
    const current = Array.from(select.options || []).map((option) => String(option.value || ''));
    return current.length === values.length && current.every((value, index) => value === values[index]);
  }

  function rebuildShiftSelect(select, allIndexes, otherUsed) {
    if (!select) return;
    const current = String(select.value || '').trim();
    const allowed = allIndexes.filter((index) => index === current || !otherUsed.has(index));
    const values = allowed.length ? allowed : (current ? [current] : allIndexes.slice(0, 1));

    if (!sameValues(select, values)) {
      const fragment = document.createDocumentFragment();
      values.forEach((index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = index;
        fragment.appendChild(option);
      });
      select.replaceChildren(fragment);
    }
    if (current && values.includes(current)) select.value = current;
    else if (values.length) select.value = values[0];
    setShiftIndexVisual(select);
  }

  function syncShiftReport(root) {
    if (!root || !root.isConnected || !root.querySelectorAll) return;
    root.querySelectorAll('[data-section-block]').forEach((block) => {
      const id = shiftSectionId(block);
      const allIndexes = SHIFT_INDEXES[id] || [];
      if (!allIndexes.length) return;
      const selects = Array.from(block.querySelectorAll('.rakShiftIndex'));
      const used = new Set(selects.map((select) => String(select.value || '').trim()).filter(Boolean));
      selects.forEach((select) => {
        const otherUsed = new Set(selects
          .filter((candidate) => candidate !== select)
          .map((candidate) => String(candidate.value || '').trim())
          .filter(Boolean));
        rebuildShiftSelect(select, allIndexes, otherUsed);
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
    if (!root) return;
    root.querySelectorAll('.rakShiftProdRow').forEach((row) => knownShiftRows.add(row));
    root.dataset.rakV1584IndexFilterReady = '1';
    syncShiftReport(root);
  }

  function repairNewShiftRow(row) {
    if (!row || knownShiftRows.has(row)) return;
    knownShiftRows.add(row);
    const root = row.closest('#rakShiftReport');
    const block = row.closest('[data-section-block]');
    const id = shiftSectionId(block);
    const allIndexes = SHIFT_INDEXES[id] || [];
    const select = row.querySelector('.rakShiftIndex');
    if (!root || !block || !select || !allIndexes.length) return;

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
    const builder = window.rakV1582BuildGroupedMachineSummary;
    if (typeof builder !== 'function') return;
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
    container.innerHTML = builder(state.month, state.monthKey, { open: wasOpen, admin: true });
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

    const reports = [];
    if (node.matches && node.matches('#rakShiftReport')) reports.push(node);
    if (node.querySelectorAll) node.querySelectorAll('#rakShiftReport').forEach((root) => reports.push(root));
    reports.forEach(initializeShiftReport);

    const rows = [];
    if (node.matches && node.matches('.rakShiftProdRow')) rows.push(node);
    if (node.querySelectorAll) node.querySelectorAll('.rakShiftProdRow').forEach((row) => rows.push(row));
    rows.forEach((row) => queueMicrotask(() => repairNewShiftRow(row)));

    if ((node.matches && (node.matches('#adminRotationEditor') || node.matches('#adminRotationFreeNamesSummary')))
      || (node.querySelector && (node.querySelector('#adminRotationEditor') || node.querySelector('#adminRotationFreeNamesSummary')))) {
      scheduleAdminSummary();
    }
  }

  function removedNodeHasShiftRow(node) {
    return !!(node && node.nodeType === 1 && (
      (node.matches && node.matches('.rakShiftProdRow'))
      || (node.querySelector && node.querySelector('.rakShiftProdRow'))
    ));
  }

  function installSafeObserver() {
    if (window.__rakV1584SafeObserver) return;
    const observer = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach(scanNode);
        const removedRow = Array.from(record.removedNodes || []).some(removedNodeHasShiftRow);
        if (!removedRow) return;
        const target = record.target;
        const root = target && target.closest ? target.closest('#rakShiftReport') : null;
        if (root) queueMicrotask(() => syncShiftReport(root));
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.__rakV1584SafeObserver = observer;
  }

  function install() {
    ensureStyles();
    scheduleLegacyObserverRetirement();
    patchUpdateToast(document);
    const report = document.getElementById('rakShiftReport');
    if (report) initializeShiftReport(report);
    scheduleAdminSummary();
    installSafeObserver();

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

    try {
      if (typeof window.rakMarkModuleReady === 'function') {
        window.rakMarkModuleReady('rak-v1584-fixes.js', 'loaded', { source: 'dynamic-loader', build: BUILD });
      }
    } catch (_) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
