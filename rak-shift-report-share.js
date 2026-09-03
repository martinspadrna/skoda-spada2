// RaK – doplňkové akce sdílení reportu směny.
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

  function scan() {
    const root = document.getElementById('rakShiftReport');
    if (root) install(root);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan, { once: true });
  else scan();
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
})();
