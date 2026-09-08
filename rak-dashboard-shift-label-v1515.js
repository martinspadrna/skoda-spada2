// RaK DEV – plný název směny v personifikované kartě Dashboardu + jednotné číslo testovacího buildu.
(function () {
  'use strict';

  let attempts = 0;

  function installCurrentBuildLabel() {
    const currentBuild = String(window.RAK_PWA_BUILD || window.RAK_DEV_BUILD || '').trim();
    if (!currentBuild) return;
    window.RAK_DEV_BUILD = currentBuild;
    try {
      document.documentElement.style.setProperty('--rak-dev-build-label', JSON.stringify('Testovací build: ' + currentBuild));
      if (!document.getElementById('rak-current-dev-build-label-style')) {
        const style = document.createElement('style');
        style.id = 'rak-current-dev-build-label-style';
        style.textContent = '[data-rak-dev-build-info="1"]{font-size:0!important;}[data-rak-dev-build-info="1"]::after{content:var(--rak-dev-build-label);font-size:14px;line-height:1.35;font-weight:800;}';
        document.head.appendChild(style);
      }
    } catch (err) {}
  }

  function install() {
    installCurrentBuildLabel();
    const original = window.buildDashboardPersonalHeroHtml;
    if (typeof original !== 'function') return false;
    if (original.__rakFullShiftLabelV1515) return true;

    const patched = function () {
      const html = String(original.apply(this, arguments) || '');
      return html
        .replace(/(dashboardPersonalStatus\">[^<]*?\s·\s)R8?(?=<\/div>)/i, '$1Ranní')
        .replace(/(dashboardPersonalStatus\">[^<]*?\s·\s)N8?(?=<\/div>)/i, '$1Noční');
    };

    patched.__rakFullShiftLabelV1515 = true;
    patched.__rakOriginal = original;
    window.buildDashboardPersonalHeroHtml = patched;
    try { buildDashboardPersonalHeroHtml = patched; } catch (err) {}

    // Když je Dashboard už vykreslený, přepíšeme kartu hned bez čekání na další periodický refresh.
    try {
      if (typeof window.updateDashboard === 'function') window.updateDashboard();
      else if (typeof updateDashboard === 'function') updateDashboard();
    } catch (err) {}
    return true;
  }

  function retry() {
    installCurrentBuildLabel();
    if (install()) return;
    attempts += 1;
    if (attempts < 80) setTimeout(retry, 25);
  }

  retry();
})();