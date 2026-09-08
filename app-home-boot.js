// RaK 1.5.17 – lehká Home boot sekvence bez kaskády plných překreslení.
(function installRakLeanHomeBootModule() {
  'use strict';

  let lastBootRefreshAt = 0;
  let recoveryTimer = 0;
  let recoveryAttempt = 0;

  function getActivePageId() {
    try { return document.querySelector('.page.active')?.id || ''; }
    catch (_) { return ''; }
  }

  function homeNavigationBlocked(activePage) {
    return !!(
      window.__rotaceManualNavLocked
      || (window.__rotaceHomeBootLocked && activePage !== 'home')
      || (typeof app !== 'undefined' && app && app.homeBootSuppressed && activePage !== 'home')
      || (window.__rotaceUserNavigated && activePage !== 'home')
    );
  }

  function homeNeedsRecovery() {
    try {
      if (typeof homeLooksUnpainted === 'function') return !!homeLooksUnpainted();
    } catch (_) {}
    const hero = document.getElementById('dashHero');
    if (!hero) return true;
    const text = String(hero.textContent || '').trim();
    return !text || /Načítám směnu/i.test(text);
  }

  function paintHome(options) {
    const opts = options || {};
    const activePage = getActivePageId();
    if (homeNavigationBlocked(activePage)) return false;

    try {
      if (activePage !== 'home' && typeof showPage === 'function') showPage('home');
      if (opts.force && typeof forceHomeRefresh === 'function') {
        forceHomeRefresh();
      } else if (typeof scheduleHomeRefresh === 'function') {
        scheduleHomeRefresh();
      } else if (typeof refreshHomeScreen === 'function') {
        refreshHomeScreen();
      } else if (typeof updateDashboard === 'function') {
        updateDashboard();
      }
      if (typeof updateFoodTile === 'function') updateFoodTile();
      if (typeof updateEportalTile === 'function') updateEportalTile();
      return true;
    } catch (err) {
      console.warn('Home paint failed', err);
      return false;
    }
  }

  function clearRecoveryTimer() {
    if (!recoveryTimer) return;
    clearTimeout(recoveryTimer);
    recoveryTimer = 0;
  }

  function scheduleRecoveryCheck(delay) {
    clearRecoveryTimer();
    recoveryTimer = setTimeout(() => {
      recoveryTimer = 0;
      const activePage = getActivePageId();
      if (activePage !== 'home' || homeNavigationBlocked(activePage)) return;
      if (!homeNeedsRecovery()) {
        recoveryAttempt = 0;
        return;
      }

      recoveryAttempt += 1;
      paintHome({ force: true, reason: 'blank-home-recovery' });
      if (recoveryAttempt < 4 && homeNeedsRecovery()) {
        const nextDelay = [160, 280, 520, 900][Math.min(recoveryAttempt, 3)];
        scheduleRecoveryCheck(nextDelay);
      } else {
        recoveryAttempt = 0;
      }
    }, Math.max(40, Number(delay) || 140));
  }

  function runRakHomeBootRefresh() {
    const activePage = getActivePageId();
    if (homeNavigationBlocked(activePage)) return false;

    const now = Date.now();
    // DOMContentLoaded, load a pageshow mohou při startu přijít těsně po sobě.
    // Jedno vykreslení stačí; další běží jen pokud Home zůstala prázdná.
    if (now - lastBootRefreshAt < 120 && !homeNeedsRecovery()) return true;
    lastBootRefreshAt = now;

    paintHome({ force: false, reason: 'boot' });
    recoveryAttempt = 0;
    scheduleRecoveryCheck(170);
    return true;
  }

  function runRakLateHomeBootRefresh() {
    const activePage = getActivePageId();
    if (activePage !== 'home' || homeNavigationBlocked(activePage)) return false;
    if (!homeNeedsRecovery()) return true;
    paintHome({ force: true, reason: 'late-recovery' });
    scheduleRecoveryCheck(260);
    return true;
  }

  function installRakHomeBootSequence() {
    if (window.__rakHomeBootSequenceInstalled) {
      if (homeNeedsRecovery()) runRakHomeBootRefresh();
      return;
    }
    window.__rakHomeBootSequenceInstalled = true;

    runRakHomeBootRefresh();

    window.addEventListener('load', () => {
      if (homeNeedsRecovery()) runRakLateHomeBootRefresh();
    }, { once: true });

    window.addEventListener('pageshow', (event) => {
      // Při běžném prvním pageshow znovu nic nepřekreslujeme. Po návratu z BFCache
      // nebo při skutečně prázdné Home obnovíme jen jeden render.
      if ((event && event.persisted) || homeNeedsRecovery()) runRakHomeBootRefresh();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && getActivePageId() === 'home' && homeNeedsRecovery()) {
        runRakLateHomeBootRefresh();
      }
    });
  }

  window.runRakHomeBootRefresh = runRakHomeBootRefresh;
  window.runRakLateHomeBootRefresh = runRakLateHomeBootRefresh;
  window.installRakHomeBootSequence = installRakHomeBootSequence;

  try {
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('app-home-boot.js', 'loaded', { source: 'dynamic-loader', mode: 'lean-recovery' });
    }
  } catch (_) {}
})();
