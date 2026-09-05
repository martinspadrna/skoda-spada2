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
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener,noreferrer');
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

// RaK DEV – finální mobilní doladění Reportu směny.
(function () {
  'use strict';

  const STYLE_ID = 'rak-shift-report-ui-polish-style-v3';
  let scheduled = false;

  function compactEmptySections(text) {
    return String(text || '')
      .replace(/(^|\n)(MO|TO|R01|R07):\n\s*-\s*(?=\n|$)/g, '$1$2: —')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function compactPreview(root) {
    const preview = root && root.querySelector('.rakShiftPreview');
    if (!preview) return;
    const compact = compactEmptySections(preview.textContent);
    if (compact && compact !== preview.textContent.trim()) preview.textContent = compact;
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
#rakShiftReport.rakShiftReportPolished{gap:12px;padding-bottom:18px}
#rakShiftReport .rakShiftHero{padding:2px 2px 4px}
#rakShiftReport .rakShiftHero .appMenuSubTitle{font-size:20px;font-weight:850;letter-spacing:-.02em;margin-bottom:4px}
#rakShiftReport .rakShiftIntro{font-size:12px;line-height:1.4;opacity:.68;max-width:38rem}

#rakShiftReport .rakShiftContext{width:100%;max-width:none!important;min-width:0}
#rakShiftReport .rakShiftMetaGrid{display:grid;width:100%;min-width:0;grid-template-columns:minmax(0,1fr) 126px;gap:12px;align-items:end}
#rakShiftReport .rakShiftMetaLabel{display:grid;width:100%;gap:6px;font-size:12px;font-weight:750;opacity:.94;min-width:0;overflow:hidden}
#rakShiftReport .rakShiftMetaLabel>.rakShiftInput,
#rakShiftReport .rakShiftMetaLabel>.rakShiftSelect{width:100%!important;max-width:100%!important;min-width:0!important;min-height:48px;border-radius:14px;font-size:17px;font-weight:700;background:linear-gradient(180deg,rgba(255,255,255,.075),rgba(255,255,255,.038));border-color:rgba(255,255,255,.14);box-shadow:inset 0 1px 0 rgba(255,255,255,.045)}
#rakShiftReport .rakShiftDate{text-align:center;font-variant-numeric:tabular-nums;overflow:hidden;min-inline-size:0!important}
#rakShiftReport .rakShiftDate::-webkit-date-and-time-value{text-align:center}

#rakShiftReport .rakShiftSection{padding:12px;border-radius:18px;border:1px solid rgba(255,255,255,.105);background:linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.018));box-shadow:inset 0 1px 0 rgba(255,255,255,.035),0 8px 24px rgba(0,0,0,.08)}
#rakShiftReport .rakShiftSectionHead{margin-bottom:9px}
#rakShiftReport .rakShiftSectionHead h4{font-size:18px;line-height:1.1;font-weight:850;letter-spacing:-.015em}
#rakShiftReport .rakShiftRows{gap:8px}
#rakShiftReport .rakShiftProdRow{gap:7px;padding:5px;border-radius:15px;min-width:0}
#rakShiftReport .rakShiftProdRow[data-section="mo"],
#rakShiftReport .rakShiftProdRow[data-section="to"]{grid-template-columns:82px minmax(0,1fr) minmax(0,1fr) 42px!important}
#rakShiftReport .rakShiftProdRow[data-section="r01"],
#rakShiftReport .rakShiftProdRow[data-section="r07"]{grid-template-columns:78px minmax(0,.9fr) minmax(0,.9fr) minmax(0,1fr) 42px!important}
#rakShiftReport .rakShiftSelect,
#rakShiftReport .rakShiftInput,
#rakShiftReport .rakShiftTime,
#rakShiftReport .rakShiftProblemText{min-height:44px;border-radius:12px;padding:8px 10px;border-color:rgba(255,255,255,.13);background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.035));box-shadow:inset 0 1px 0 rgba(255,255,255,.04)}
#rakShiftReport .rakShiftQty,#rakShiftReport .rakShiftNok,#rakShiftReport .rakShiftFree{text-align:center;font-size:16px;font-variant-numeric:tabular-nums}
#rakShiftReport .rakShiftIndex{height:44px;font-size:17px;border-radius:12px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}
#rakShiftReport .rakShiftRemove{width:40px;height:40px;min-width:40px;border-radius:12px;background:rgba(255,255,255,.045);display:grid;place-items:center;font-size:21px;line-height:1;opacity:.72;padding:0}
#rakShiftReport .rakShiftRemove:active{transform:scale(.96);opacity:1}
#rakShiftReport .rakShiftAddBelow{width:100%;min-height:44px!important;margin-top:9px!important;padding:9px 12px!important;border-radius:14px!important;font-size:15px!important;font-weight:780!important;background:rgba(255,255,255,.045)!important;box-shadow:none!important}

#rakShiftReport .rakShiftProblemsSection{padding-bottom:13px}
#rakShiftReport .rakShiftProblemRow{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr) 42px!important;gap:8px!important;align-items:end!important;padding:2px 0 5px}
#rakShiftReport .rakShiftMachine{grid-column:1/-1!important;min-height:46px;font-size:16px}
#rakShiftReport .rakShiftTimeField{display:grid!important;grid-template-rows:auto 46px!important;gap:5px!important;min-width:0;opacity:1!important;font-size:12px!important;font-weight:760;color:inherit}
#rakShiftReport .rakShiftFromField{grid-column:1!important}
#rakShiftReport .rakShiftToField{grid-column:2!important}
#rakShiftReport .rakShiftTimeField span{padding-left:4px!important;opacity:.7}
#rakShiftReport .rakShiftTime{width:100%!important;min-width:0!important;height:46px;min-height:46px;padding:6px 8px!important;font-size:16px!important;text-align:center;font-variant-numeric:tabular-nums;-webkit-appearance:none;appearance:none}
#rakShiftReport .rakShiftTime::-webkit-date-and-time-value{text-align:center;margin:0}
#rakShiftReport .rakShiftProblemText{grid-column:1/3!important;min-height:46px;font-size:16px}
#rakShiftReport .rakShiftProblemRemove{grid-column:3!important;width:42px!important;height:42px!important;min-width:42px!important;margin:0!important;border-radius:13px!important;align-self:center}

#rakShiftReport .rakShiftPreviewSection{padding:12px 12px 13px}
#rakShiftReport .rakShiftPreviewHint{font-size:11px;opacity:.55;margin:-2px 0 8px 1px}
#rakShiftReport .rakShiftPreview{padding:14px 15px;border-radius:15px;border-color:rgba(255,255,255,.1);background:linear-gradient(145deg,rgba(4,18,30,.58),rgba(12,23,39,.38));box-shadow:inset 0 1px 0 rgba(255,255,255,.035);font-size:14px;line-height:1.34;white-space:pre-wrap;font-variant-numeric:tabular-nums}

#rakShiftReport .rakShiftActions{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:8px!important;margin-top:1px}
#rakShiftReport .rakShiftActions>.appMenuAction{margin:0!important;min-height:48px!important;border-radius:15px!important;padding:10px 13px!important;font-size:15px!important;font-weight:800!important}
#rakShiftReport .rakShiftActions [data-rak-share-action="copy"]{grid-column:1/-1;order:1;background:linear-gradient(135deg,rgba(35,159,107,.33),rgba(29,121,157,.28))!important;border-color:rgba(100,234,184,.28)!important}
#rakShiftReport .rakShiftActions [data-shift-action="send"]{grid-column:1;order:2}
#rakShiftReport .rakShiftActions [data-rak-share-action="whatsapp"]{grid-column:2;order:3;background:rgba(37,211,102,.12)!important;border-color:rgba(77,221,130,.2)!important}
#rakShiftReport .rakShiftActions [data-shift-action="preview"]{grid-column:1/-1;order:4;min-height:42px!important;font-size:14px!important;opacity:.86}
#rakShiftReport .rakShiftActions [data-shift-action="close"]{grid-column:1/-1;order:5;background:rgba(255,255,255,.025)!important;opacity:.78}
#rakShiftReport .rakShiftStatus{text-align:center;font-size:12px;opacity:.72;padding:0 8px;min-height:16px}

@media(max-width:390px){
  #rakShiftReport .rakShiftMetaGrid{grid-template-columns:minmax(0,1fr) 116px;gap:9px}
  #rakShiftReport .rakShiftSection{padding:10px}
  #rakShiftReport .rakShiftProdRow[data-section="mo"],
  #rakShiftReport .rakShiftProdRow[data-section="to"]{grid-template-columns:74px minmax(0,1fr) minmax(0,1fr) 38px!important;gap:6px}
  #rakShiftReport .rakShiftProdRow[data-section="r01"],
  #rakShiftReport .rakShiftProdRow[data-section="r07"]{grid-template-columns:72px minmax(0,.82fr) minmax(0,.82fr) minmax(0,1fr) 38px!important;gap:5px}
  #rakShiftReport .rakShiftSelect,#rakShiftReport .rakShiftInput{padding-left:7px;padding-right:7px}
  #rakShiftReport .rakShiftIndex{font-size:16px}
  #rakShiftReport .rakShiftQty,#rakShiftReport .rakShiftNok,#rakShiftReport .rakShiftFree{font-size:15px}
  #rakShiftReport .rakShiftRemove{width:36px;height:40px;min-width:36px}
  #rakShiftReport .rakShiftProblemRow{grid-template-columns:minmax(0,1fr) minmax(0,1fr) 38px!important;gap:7px!important}
  #rakShiftReport .rakShiftProblemRemove{width:38px!important;min-width:38px!important}
}
@media(max-width:380px){
  #rakShiftReport .rakShiftMetaGrid{grid-template-columns:minmax(0,1fr)!important;gap:10px}
}
`;
    document.head.appendChild(style);
  }

  function decorateMeta(root) {
    const date = root.querySelector('.rakShiftDate');
    const shift = root.querySelector('.rakShiftShift');
    if (!date || !shift) return;
    const dateLabel = date.closest('label');
    const shiftLabel = shift.closest('label');
    if (!dateLabel || !shiftLabel) return;
    dateLabel.classList.add('rakShiftMetaLabel');
    shiftLabel.classList.add('rakShiftMetaLabel');
    if (dateLabel.parentElement && dateLabel.parentElement.classList.contains('rakShiftMetaGrid')) return;
    const grid = document.createElement('div');
    grid.className = 'rakShiftMetaGrid';
    dateLabel.parentNode.insertBefore(grid, dateLabel);
    grid.appendChild(dateLabel);
    grid.appendChild(shiftLabel);
  }

  function decorateSections(root) {
    const hero = root.firstElementChild;
    if (hero) hero.classList.add('rakShiftHero');
    const problems = root.querySelector('.rakShiftProblems');
    const problemsSection = problems && problems.closest('.rakShiftSection');
    if (problemsSection) problemsSection.classList.add('rakShiftProblemsSection');
    root.querySelectorAll('.rakShiftProblemRow').forEach((row) => {
      const fromLabel = row.querySelector('.rakShiftFrom') && row.querySelector('.rakShiftFrom').closest('label');
      const toLabel = row.querySelector('.rakShiftTo') && row.querySelector('.rakShiftTo').closest('label');
      if (fromLabel) fromLabel.classList.add('rakShiftFromField');
      if (toLabel) toLabel.classList.add('rakShiftToField');
    });
    const preview = root.querySelector('.rakShiftPreview');
    const previewSection = preview && preview.closest('.rakShiftSection');
    if (previewSection) {
      previewSection.classList.add('rakShiftPreviewSection');
      if (!previewSection.querySelector('.rakShiftPreviewHint')) {
        const hint = document.createElement('div');
        hint.className = 'rakShiftPreviewHint';
        hint.textContent = 'Takto se report zkopíruje nebo odešle.';
        preview.parentNode.insertBefore(hint, preview);
      }
    }
  }

  function decorateActions(root) {
    const actions = root.querySelector('.rakShiftActions');
    if (!actions) return;
    const copyButton = actions.querySelector('[data-rak-share-action="copy"]');
    const shareButton = actions.querySelector('[data-shift-action="send"]');
    const whatsappButton = actions.querySelector('[data-rak-share-action="whatsapp"]');
    const previewButton = actions.querySelector('[data-shift-action="preview"]');
    const closeButton = actions.querySelector('[data-shift-action="close"]');
    if (copyButton) copyButton.textContent = 'Zkopírovat report';
    if (shareButton) shareButton.textContent = 'Sdílet';
    if (whatsappButton) whatsappButton.textContent = 'WhatsApp';
    if (previewButton) previewButton.textContent = 'Obnovit náhled';
    if (closeButton) closeButton.textContent = 'Zpět';
  }

  function polish() {
    scheduled = false;
    const root = document.getElementById('rakShiftReport');
    if (!root) return;
    ensureStyles();
    root.classList.add('rakShiftReportPolished');
    decorateMeta(root);
    decorateSections(root);
    decorateActions(root);
    compactPreview(root);
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(polish);
    else setTimeout(polish, 0);
  }

  async function shareCompact(root) {
    compactPreview(root);
    const preview = root && root.querySelector('.rakShiftPreview');
    const text = preview ? preview.textContent.trim() : '';
    if (!text) return;
    const status = root.querySelector('.rakShiftStatus');
    try {
      if (navigator.share) {
        await navigator.share({ title: 'RaK – report směny', text });
        if (status) status.textContent = 'Report připravený k odeslání.';
      } else {
        await navigator.clipboard.writeText(text);
        if (status) status.textContent = 'Report zkopírovaný do schránky.';
      }
    } catch (err) {
      if (status) status.textContent = 'Odeslání bylo zrušeno nebo se nepovedlo.';
    }
  }

  function boot() {
    ensureStyles();
    schedule();
    try { new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true }); }
    catch (err) {}
    document.addEventListener('click', (event) => {
      const button = event.target && event.target.closest ? event.target.closest('#rakShiftReport [data-shift-action="send"]') : null;
      if (!button) return;
      const root = button.closest('#rakShiftReport');
      event.preventDefault();
      event.stopImmediatePropagation();
      void shareCompact(root);
    }, true);
  }

  window.rakShiftReportPolishUi = polish;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
