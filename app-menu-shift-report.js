// RaK – vstup do Reportu směny oddělený z app-menu.js.
try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('app-menu-shift-report.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}

let appMenuShiftReportOpening = false;

async function appMenuOpenShiftReport() {
  if (appMenuShiftReportOpening) return false;
  appMenuShiftReportOpening = true;
  try {
    let ready = false;
    try { ready = typeof window.rakAdminCanOpenAdmin === 'function' && window.rakAdminCanOpenAdmin(); } catch (err) {}
    if (!ready && typeof window.appMenuEnsureAdminAccessFromMenu === 'function') {
      try { await window.appMenuEnsureAdminAccessFromMenu(); } catch (err) {}
      try { ready = typeof window.rakAdminCanOpenAdmin === 'function' && window.rakAdminCanOpenAdmin(); } catch (err) {}
    }
    if (!ready && typeof window.rakAdminLoadSettingsThenCheckOnce === 'function') {
      try { await window.rakAdminLoadSettingsThenCheckOnce('shift-report'); } catch (err) {}
      try { ready = typeof window.rakAdminCanOpenAdmin === 'function' && window.rakAdminCanOpenAdmin(); } catch (err) {}
    }
    if (!ready) return false;
    const body = document.getElementById('appMenuBody');
    if (body) body.dataset.rakShiftReportOpen = '1';
    if (window.RakShiftReport && typeof window.RakShiftReport.open === 'function') {
      window.RakShiftReport.open();
      return true;
    }
    return false;
  } finally {
    appMenuShiftReportOpening = false;
  }
}

function appMenuHandleShiftReportEntry(event) {
  const target = event.target && event.target.closest ? event.target.closest('[data-rak-shift-report-entry="1"]') : null;
  if (!target) return;
  event.preventDefault();
  event.stopPropagation();
  void appMenuOpenShiftReport();
}

if (!window.__rakAppMenuShiftReportBound) {
  window.__rakAppMenuShiftReportBound = true;
  document.addEventListener('click', appMenuHandleShiftReportEntry, true);
}
window.appMenuOpenShiftReport = appMenuOpenShiftReport;

