// RaK – doplňkové akce sdílení reportu směny + umístění vstupu jen pro adminy.
(function () {
  'use strict';

  function getReport(root) {
    const preview = root && root.querySelector('.rakShiftPreview');
    return preview ? preview.textContent.trim() : '';
  }

  function status(root, text) {
    const el = root && root.querySelector('.rakShiftStatus');
    if (el) el.textContent = text;
  }

  async function copy(root) {
    const text = getReport(root);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      status(root, 'Report zkopírovaný do schránky.');
    } catch (err) {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try { document.execCommand('copy'); status(root, 'Report zkopírovaný do schránky.'); }
      catch (copyErr) { status(root, 'Kopírování se nepodařilo.'); }
      area.remove();
    }
  }

  function whatsapp(root) {
    const text = getReport(root);
    if (!text) return;
    const url = 'https://wa.me/?text=' + encodeURIComponent(text);
    window.open(url, '_blank', 'noopener,noreferrer');
    status(root, 'Otevírám WhatsApp…');
  }

  function install(root) {
    if (!root || root.dataset.rakShareActions === '1') return;
    const actions = root.querySelector('.rakShiftActions');
    if (!actions) return;
    const send = actions.querySelector('[data-shift-action="send"]');
    if (!send) return;

    const copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.className = 'appMenuAction';
    copyButton.dataset.rakShareAction = 'copy';
    copyButton.textContent = 'Zkopírovat';

    const whatsappButton = document.createElement('button');
    whatsappButton.type = 'button';
    whatsappButton.className = 'appMenuAction isActive';
    whatsappButton.dataset.rakShareAction = 'whatsapp';
    whatsappButton.textContent = 'WhatsApp';

    send.textContent = 'Sdílet…';
    actions.insertBefore(copyButton, send);
    actions.insertBefore(whatsappButton, send.nextSibling);
    root.dataset.rakShareActions = '1';

    copyButton.addEventListener('click', () => { void copy(root); });
    whatsappButton.addEventListener('click', () => whatsapp(root));
  }

  function adminAllowed() {
    try {
      if (typeof appMenuShouldShowAdminEntry === 'function') return !!appMenuShouldShowAdminEntry();
    } catch (err) {}
    try {
      const id = typeof rakAdminGetActiveAccountId === 'function' ? String(rakAdminGetActiveAccountId() || '').trim() : '';
      if (id === '9811') return true;
      if (id && typeof rakAdminAccountRequiresPassword === 'function' && rakAdminAccountRequiresPassword(id)) return true;
      if (typeof rakAdminCanOpenAdmin === 'function' && rakAdminCanOpenAdmin()) return true;
    } catch (err) {}
    return false;
  }

  function placeAdminEntry() {
    const body = document.getElementById('appMenuBody');
    if (!body || body.dataset.rakShiftReportOpen === '1') return;
    const report = body.querySelector('[data-admin-action="shift-report"]');
    if (!report) return;
    const admin = body.querySelector('[data-menu-action="admin"]');
    const allowed = adminAllowed() && !!admin;

    report.hidden = !allowed;
    report.disabled = !allowed;
    report.setAttribute('aria-hidden', allowed ? 'false' : 'true');
    if (!allowed) return;

    report.classList.remove('isActive');
    report.dataset.rakAdminOnly = '1';
    if (admin.nextElementSibling !== report) admin.insertAdjacentElement('afterend', report);
  }

  function scan() {
    const root = document.getElementById('rakShiftReport');
    if (root) install(root);
    placeAdminEntry();
  }

  document.addEventListener('click', (event) => {
    const trigger = event.target && event.target.closest ? event.target.closest('[data-admin-action="shift-report"]') : null;
    if (!trigger || adminAllowed()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan, { once: true });
  else scan();
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
})();
