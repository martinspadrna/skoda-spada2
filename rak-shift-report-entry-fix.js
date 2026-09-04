// RaK DEV – stabilní vstup do Reportu směny pro administrátorské účty.
(function () {
  'use strict';

  const STYLE_ID = 'rak-shift-report-entry-fix-style-v1';
  const ENTRY_ATTR = 'data-rak-shift-report-entry';
  let opening = false;
  let scheduled = false;

  function canOpenAdminNow() {
    try {
      return typeof window.rakAdminCanOpenAdmin === 'function' && window.rakAdminCanOpenAdmin();
    } catch (err) {
      return false;
    }
  }

  function shouldShowAdminTools() {
    try {
      if (typeof window.appMenuShouldShowAdminEntry === 'function') return !!window.appMenuShouldShowAdminEntry();
    } catch (err) {}
    if (canOpenAdminNow()) return true;
    try {
      const activeId = typeof window.rakAdminMenuResolveActiveAccountId === 'function'
        ? String(window.rakAdminMenuResolveActiveAccountId() || '').trim()
        : (typeof window.rakAdminGetActiveAccountId === 'function' ? String(window.rakAdminGetActiveAccountId() || '').trim() : '');
      return activeId === '9811';
    } catch (err) {
      return false;
    }
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = '[data-admin-action="shift-report"]{display:none!important;}';
    document.head.appendChild(style);
  }

  function ensureEntry() {
    scheduled = false;
    const body = document.getElementById('appMenuBody');
    if (!body || body.dataset.rakShiftReportOpen === '1') return;
    const adminButton = body.querySelector('[data-menu-action="admin"]');
    let button = body.querySelector('[' + ENTRY_ATTR + '="1"]');
    const visible = !!adminButton && shouldShowAdminTools();
    if (!visible) {
      if (button) button.remove();
      return;
    }
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'appMenuAction isActive';
      button.setAttribute(ENTRY_ATTR, '1');
      button.textContent = 'Report směny';
    }
    if (adminButton.nextElementSibling !== button) adminButton.insertAdjacentElement('afterend', button);
  }

  function scheduleEnsure() {
    if (scheduled) return;
    scheduled = true;
    if (typeof queueMicrotask === 'function') queueMicrotask(ensureEntry);
    else setTimeout(ensureEntry, 0);
  }

  async function ensureAdminAccess() {
    if (canOpenAdminNow()) return true;
    try {
      if (typeof window.appMenuEnsureAdminAccessFromMenu === 'function') {
        const result = await window.appMenuEnsureAdminAccessFromMenu();
        if (result && canOpenAdminNow()) return true;
      }
    } catch (err) {}
    try {
      if (typeof window.rakAdminLoadSettingsThenCheckOnce === 'function') {
        const result = await window.rakAdminLoadSettingsThenCheckOnce('shift-report');
        if (result && canOpenAdminNow()) return true;
      }
    } catch (err) {}
    return canOpenAdminNow();
  }

  async function openReport() {
    if (opening) return;
    opening = true;
    try {
      const ready = await ensureAdminAccess();
      if (!ready) return;
      const body = document.getElementById('appMenuBody');
      if (body) body.dataset.rakShiftReportOpen = '1';
      if (window.RakShiftReport && typeof window.RakShiftReport.open === 'function') window.RakShiftReport.open();
    } finally {
      opening = false;
      setTimeout(ensureEntry, 0);
    }
  }

  function boot() {
    ensureStyle();
    ensureEntry();
    document.addEventListener('click', (event) => {
      const button = event.target && event.target.closest ? event.target.closest('[' + ENTRY_ATTR + '="1"]') : null;
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      void openReport();
    }, true);
    try {
      const observer = new MutationObserver(scheduleEnsure);
      observer.observe(document.body, { childList: true, subtree: true });
      window.__rakShiftReportEntryObserver = observer;
    } catch (err) {}
    window.addEventListener('focus', scheduleEnsure);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'hidden') scheduleEnsure();
    });
    window.__rakShiftReportEntryTimer = setInterval(() => {
      if (document.visibilityState !== 'hidden') ensureEntry();
    }, 1000);
  }

  window.rakShiftReportRefreshEntry = ensureEntry;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
