// RaK DEV v1.5.15 – plný název směny v personifikované kartě Dashboardu.
(function () {
  'use strict';

  let attempts = 0;

  function install() {
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
    if (install()) return;
    attempts += 1;
    if (attempts < 80) setTimeout(retry, 25);
  }

  retry();
})();