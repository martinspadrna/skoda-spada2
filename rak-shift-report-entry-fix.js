// RaK – stabilní vstup do Reportu směny pro administrátorské účty.
(function () {
  'use strict';

  const DEV_BUILD = String(window.RAK_PWA_BUILD || window.RAK_DEV_BUILD || '').trim();
  const STYLE_ID = 'rak-shift-report-entry-fix-style-v4';
  const ENTRY_ATTR = 'data-rak-shift-report-entry';
  const PORTRAIT_OVERLAY_ID = 'rakPortraitOnlyOverlay';
  const SHIFT_REPORT_DRAFT_PREFIX = 'rak:shiftReportDraft:v1';
  const SHIFT_REPORT_RETENTION_VERSION = 1;
  const SHIFT_REPORT_TEAM = 'D';
  let opening = false;
  let scheduled = false;

  if (DEV_BUILD) window.RAK_DEV_BUILD = DEV_BUILD;

  function clearStaleDevUpdatePromptState() {
    if (!DEV_BUILD) return;
    // Každý DEV build smaže staré potlačení nabídky jen jednou. Po kliknutí na
    // Aktualizovat už při reloadu stav znovu nemažeme, takže nevznikne update smyčka.
    try {
      const key = 'rak_dev_entry_prompt_reset_build';
      if (localStorage.getItem(key) === DEV_BUILD) return;
      sessionStorage.removeItem('rotace_sw_update_notice_v1');
      sessionStorage.removeItem('rotace_sw_update_pending_v1');
      localStorage.removeItem('rotace_sw_update_suppress_v1');
      localStorage.setItem(key, DEV_BUILD);
    } catch (err) {}
  }

  function shiftReportDraftStorageKey() {
    let account = '';
    try {
      const profile = typeof window.rakUserProfileGet === 'function' ? window.rakUserProfileGet() : null;
      account = String(profile && profile.accountNumber || '').trim();
      if (!account && typeof window.app === 'object' && window.app && window.app.gamesProfile) {
        account = String(window.app.gamesProfile.activeAccountId || '').trim();
      }
    } catch (err) {}
    return SHIFT_REPORT_DRAFT_PREFIX + ':' + (account || 'local');
  }

  function safeDate(value) {
    const date = value instanceof Date ? new Date(value.getTime()) : new Date(value || Date.now());
    return Number.isNaN(date.getTime()) ? new Date() : date;
  }

  function nextTeamShiftStartAfter(anchor) {
    const base = safeDate(anchor);
    try {
      if (typeof window.getDashboardNextTeamShift === 'function') {
        const next = window.getDashboardNextTeamShift(base, SHIFT_REPORT_TEAM);
        if (next && next.start instanceof Date && !Number.isNaN(next.start.getTime()) && next.start > base) {
          return new Date(next.start.getTime());
        }
      }
    } catch (err) {}

    // Fallback přes stejný směnový engine, kdyby dashboard helper ještě nebyl načtený.
    try {
      if (typeof window.getTeamShiftState !== 'function') return null;
      const candidates = [];
      const collect = (probe) => {
        const state = window.getTeamShiftState(probe, SHIFT_REPORT_TEAM);
        if (!state) return;
        if (state.active && state.start instanceof Date && state.start > base) candidates.push(state.start);
        if (state.next && state.next.start instanceof Date && state.next.start > base) candidates.push(state.next.start);
      };
      collect(base);
      if (!candidates.length) {
        for (let hours = 6; hours <= 60 * 24; hours += 6) {
          collect(new Date(base.getTime() + hours * 60 * 60 * 1000));
          if (candidates.length) break;
        }
      }
      candidates.sort((a, b) => a - b);
      return candidates.length ? new Date(candidates[0].getTime()) : null;
    } catch (err) {
      return null;
    }
  }

  function readShiftReportDraftEnvelope() {
    try {
      const raw = localStorage.getItem(shiftReportDraftStorageKey());
      if (!raw) return null;
      const saved = JSON.parse(raw);
      return saved && saved.draft && typeof saved.draft === 'object' ? saved : null;
    } catch (err) {
      return null;
    }
  }

  function writeShiftReportDraftEnvelope(saved) {
    try {
      if (saved && saved.draft && typeof saved.draft === 'object') {
        localStorage.setItem(shiftReportDraftStorageKey(), JSON.stringify(saved));
      }
    } catch (err) {}
  }

  function calculateDraftRetentionDeadline(saved) {
    if (!saved) return null;
    const explicit = safeDate(saved.retainUntil || '');
    if (saved.retainUntil && !Number.isNaN(explicit.getTime())) return explicit;
    const anchor = saved.updatedAt ? safeDate(saved.updatedAt) : new Date();
    return nextTeamShiftStartAfter(anchor);
  }

  function expireShiftReportDraftIfDue(now) {
    const saved = readShiftReportDraftEnvelope();
    if (!saved) return false;
    const deadline = calculateDraftRetentionDeadline(saved);
    if (!deadline) return false;
    if (safeDate(now || Date.now()).getTime() >= deadline.getTime()) {
      try { localStorage.removeItem(shiftReportDraftStorageKey()); } catch (err) {}
      return true;
    }
    if (!saved.retainUntil) {
      saved.retainUntil = deadline.toISOString();
      saved.retentionVersion = SHIFT_REPORT_RETENTION_VERSION;
      saved.retentionTeam = SHIFT_REPORT_TEAM;
      writeShiftReportDraftEnvelope(saved);
    }
    return false;
  }

  function stampShiftReportDraftRetention() {
    const saved = readShiftReportDraftEnvelope();
    if (!saved) return;
    const anchor = saved.updatedAt ? safeDate(saved.updatedAt) : new Date();
    const deadline = nextTeamShiftStartAfter(anchor);
    if (!deadline) return;
    saved.retainUntil = deadline.toISOString();
    saved.retentionVersion = SHIFT_REPORT_RETENTION_VERSION;
    saved.retentionTeam = SHIFT_REPORT_TEAM;
    writeShiftReportDraftEnvelope(saved);
  }

  function scheduleShiftReportRetentionStamp() {
    const run = () => stampShiftReportDraftRetention();
    if (typeof queueMicrotask === 'function') queueMicrotask(run);
    else setTimeout(run, 0);
  }

  function installShiftReportRetention() {
    expireShiftReportDraftIfDue(new Date());
    document.addEventListener('input', (event) => {
      if (event.target && event.target.closest && event.target.closest('#rakShiftReport')) {
        scheduleShiftReportRetentionStamp();
      }
    });
    document.addEventListener('change', (event) => {
      if (event.target && event.target.closest && event.target.closest('#rakShiftReport')) {
        scheduleShiftReportRetentionStamp();
      }
    });
    document.addEventListener('click', (event) => {
      if (event.target && event.target.closest && event.target.closest('#rakShiftReport')) {
        scheduleShiftReportRetentionStamp();
      }
    });
  }

  function isStandalonePwa() {
    try {
      if (window.navigator && window.navigator.standalone === true) return true;
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
    } catch (err) {}
    return false;
  }

  function ensurePortraitOverlay() {
    if (!isStandalonePwa() || !document.body) return;
    document.documentElement.classList.add('rakPortraitOnly');
    let overlay = document.getElementById(PORTRAIT_OVERLAY_ID);
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.id = PORTRAIT_OVERLAY_ID;
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-live', 'polite');
    overlay.innerHTML = '<div class="rakPortraitOnlyIcon" aria-hidden="true">↻</div><strong>Otoč telefon na výšku</strong><span>RaK je na mobilu uzamčený na výšku.</span>';
    document.body.appendChild(overlay);
  }

  function tryLockPortrait() {
    if (!isStandalonePwa()) return;
    try {
      const orientation = window.screen && window.screen.orientation;
      if (!orientation || typeof orientation.lock !== 'function') return;
      const result = orientation.lock('portrait-primary');
      if (result && typeof result.catch === 'function') result.catch(() => {});
    } catch (err) {}
  }

  function installPortraitOnlyMode() {
    if (!isStandalonePwa()) return;
    ensurePortraitOverlay();
    tryLockPortrait();
    try {
      window.addEventListener('pageshow', tryLockPortrait);
      window.addEventListener('orientationchange', ensurePortraitOverlay);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState !== 'hidden') {
          ensurePortraitOverlay();
          tryLockPortrait();
        }
      });
      document.addEventListener('pointerdown', tryLockPortrait, { once: true, passive: true });
    } catch (err) {}
  }

  function ensureAboutBuildInfo() {
    if (!DEV_BUILD) return;
    const body = document.getElementById('appMenuBody');
    if (!body) return;
    const title = body.querySelector('.appMenuCardTitle');
    if (!title || String(title.textContent || '').trim() !== 'O aplikaci') return;
    const version = body.querySelector('.appMenuVersion');
    if (!version) return;
    let info = body.querySelector('[data-rak-dev-build-info="1"]');
    if (!info) {
      info = document.createElement('div');
      info.setAttribute('data-rak-dev-build-info', '1');
      info.className = 'smallText';
      info.style.marginTop = '6px';
      info.style.fontWeight = '800';
      info.style.opacity = '0.92';
      version.insertAdjacentElement('afterend', info);
    }
    info.textContent = 'Testovací build: ' + DEV_BUILD;
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
    style.textContent = [
      '[data-admin-action="shift-report"]{display:none!important;}',
      '#' + PORTRAIT_OVERLAY_ID + '{display:none;}',
      '@media (orientation:landscape) and (max-height:700px){',
      'html.rakPortraitOnly #' + PORTRAIT_OVERLAY_ID + '{display:flex!important;position:fixed;inset:0;z-index:2147483647;align-items:center;justify-content:center;flex-direction:column;gap:10px;padding:calc(20px + env(safe-area-inset-top)) calc(24px + env(safe-area-inset-right)) calc(20px + env(safe-area-inset-bottom)) calc(24px + env(safe-area-inset-left));box-sizing:border-box;text-align:center;background:radial-gradient(circle at 50% 35%,rgba(18,56,79,.98),rgba(5,8,22,.995) 68%);color:#f4fbff;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}',
      'html.rakPortraitOnly #' + PORTRAIT_OVERLAY_ID + ' .rakPortraitOnlyIcon{font-size:54px;line-height:1;font-weight:800;}',
      'html.rakPortraitOnly #' + PORTRAIT_OVERLAY_ID + ' strong{font-size:24px;line-height:1.15;}',
      'html.rakPortraitOnly #' + PORTRAIT_OVERLAY_ID + ' span{font-size:15px;line-height:1.35;opacity:.78;max-width:360px;}',
      '}'
    ].join('');
    document.head.appendChild(style);
  }

  function ensureEntry() {
    scheduled = false;
    ensureAboutBuildInfo();
    const body = document.getElementById('appMenuBody');
    if (!body || body.dataset.rakShiftReportOpen === '1') return;
    const adminButton = body.querySelector('[data-menu-action="admin"]');
    const vacationReportButton = body.querySelector('[data-admin-action="vacation-report"]');
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
    button.hidden = false;
    button.disabled = false;
    button.setAttribute('aria-hidden', 'false');

    // Report dovolené je viditelný vlastník pořadí. Skrytý legacy vstup do
    // reportu směny může observer přesouvat, ale náš stabilní vstup zůstává za dovolenou.
    const anchor = vacationReportButton || nativeReportButton || adminButton;
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
      // Rozepsaný report zůstává uložený přes volno, ale na začátku další směny D
      // se před otevřením automaticky zahodí. Např. 7. 9. R zůstane do 8. 9. 06:00.
      expireShiftReportDraftIfDue(new Date());
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
    installShiftReportRetention();
    ensureStyle();
    installPortraitOnlyMode();
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
    window.addEventListener('focus', () => {
      expireShiftReportDraftIfDue(new Date());
      scheduleEnsure();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'hidden') {
        expireShiftReportDraftIfDue(new Date());
        scheduleEnsure();
      }
    });
    window.__rakShiftReportEntryTimer = setInterval(() => {
      if (document.visibilityState !== 'hidden') {
        expireShiftReportDraftIfDue(new Date());
        ensureEntry();
      }
    }, 2000);
  }

  window.rakShiftReportRefreshEntry = ensureEntry;
  window.rakRefreshDevBuildInfo = ensureAboutBuildInfo;
  window.rakExpireShiftReportDraftIfDue = expireShiftReportDraftIfDue;
  window.rakGetShiftReportRetentionDeadline = () => {
    const saved = readShiftReportDraftEnvelope();
    const deadline = calculateDraftRetentionDeadline(saved);
    return deadline ? new Date(deadline.getTime()) : null;
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
