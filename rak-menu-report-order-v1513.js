// RaK DEV v1.5.13 – stabilní pořadí reportů v menu Více.
(function () {
  'use strict';

  const STYLE_ID = 'rak-menu-report-order-v1513';

  function ensureStableReportOrder() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '#appMenuBody .appMenuGrid > [data-menu-action="admin"]{order:0;}',
      '#appMenuBody .appMenuGrid > [data-admin-action="vacation-report"]{order:1;}',
      '#appMenuBody .appMenuGrid > [data-rak-shift-report-entry="1"]{order:2;}'
    ].join('');
    document.head.appendChild(style);
  }

  ensureStableReportOrder();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensureStableReportOrder, { once: true });
})();
