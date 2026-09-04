// RaK DEV – stabilní vstup do Reportu směny pro administrátorské účty.
(function () {
  'use strict';

  const STYLE_ID = 'rak-shift-report-entry-fix-style-v3';
  const ENTRY_ATTR = 'data-rak-shift-report-entry';
  let opening = false;
  let scheduled = false;

  function clearStaleDevUpdatePromptState() {
    // Development větev používá stejné produkční APP_VERSION metadata 1.338,
    // takže produkční ochrana proti opakovanému toastu by jinak mohla nové DEV
    // aktualizace trvale schovat. Stav čistíme před instalací PWA hooků; po kliknutí
    // na Aktualizovat si app-pwa-connectivity nastaví nový pending stav znovu.
    try { sessionStorage.removeItem('rotace_sw_update_notice_v1'); } catch (err) {}
    try { sessionStorage.removeItem('rotace_sw_update_pending_v1'); } catch (err) {}
    try { localStorage.removeItem('rotace_sw_update_suppress_v1'); } catch (err) {}
  }

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
    const nativeReportButton = body.querySelector('[data-admin-action="shift-report"]');
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

    // Původní skrytý vstup do reportu spravuje rak-shift-report-share.js.
    // Kotvíme náš stabilní vstup až ZA něj. Tím se oba MutationObservery
    // nepřetahují o pozici hned za tlačítkem Administrace a nezablokují UI.
    const anchor = nativeReportButton || adminButton;
    if (anchor && anchor.nextElementSibling !== button) anchor.insertAdjacentElement('afterend', button);
  }

  function scheduleEnsure() {
    if (scheduled) return;
    scheduled = true;
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(ensureEntry);
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
    clearStaleDevUpdatePromptState();
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
    }, 2000);
  }

  window.rakShiftReportRefreshEntry = ensureEntry;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
