// RaK – Report směny pro mistra.
(function () {
  'use strict';

  const STORAGE_KEY = 'rak:shiftReports';
  const HARD = ['TNKS01', 'TBKR07', 'TPKW01', 'TPKW02', 'TBKR01'];
  const SOFT = ['MSKC01', 'MSKC03', 'MSKC04', 'MFKF06', 'MFKF10'];
  const INDEX_COLORS = { AF: 'blue', AG: 'green', AH: 'orange', AD: 'blue', AE: 'green' };
  const SECTIONS = [
    { id: 'mo', label: 'MO', fields: ['nok'], indexes: ['AF', 'AG', 'AH'], defaultIndex: 'AF' },
    { id: 'to', label: 'TO', fields: ['nok'], indexes: ['AD', 'AE', 'AH'], defaultIndex: 'AD' },
    { id: 'r01', label: 'TBKR01', fields: ['nok', 'free'], indexes: ['AD', 'AE', 'AH'], defaultIndex: 'AD' },
    { id: 'r07', label: 'TBKR07', fields: ['nok', 'free'], indexes: ['AD', 'AE', 'AH'], defaultIndex: 'AD' }
  ];

  function esc(value) {
    if (typeof escapeHtml === 'function') return escapeHtml(String(value == null ? '' : value));
    return String(value == null ? '' : value).replace(/[&<>\"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' }[c]));
  }
  function inputNumber(value, cls, placeholder) {
    return '<input class="rakShiftInput ' + cls + '" type="number" min="0" step="1" inputmode="numeric" value="' + esc(value || '') + '" placeholder="' + esc(placeholder || '0') + '">';
  }
  function indexColorClass(index) {
    return 'rakShiftIndex--' + (INDEX_COLORS[index] || 'neutral');
  }
  function selectIndex(section, value) {
    const indexes = section.indexes || [];
    const selected = indexes.includes(value) ? value : (section.defaultIndex || indexes[0] || '');
    return '<select class="rakShiftSelect rakShiftIndex ' + indexColorClass(selected) + '" data-index-color="' + esc(INDEX_COLORS[selected] || 'neutral') + '">' + indexes.map((i) => '<option value="' + i + '"' + (i === selected ? ' selected' : '') + '>' + i + '</option>').join('') + '</select>';
  }
  function sectionRow(section, data) {
    const d = data || {};
    const fields = section.fields || [];
    return [
      '<div class="rakShiftProdRow" data-section="' + section.id + '" data-index-color="' + esc(INDEX_COLORS[d.index || section.defaultIndex] || 'neutral') + '">',
      '  ' + selectIndex(section, d.index || section.defaultIndex),
      '  ' + inputNumber(d.qty, 'rakShiftQty', 'ks'),
      fields.includes('nok') ? '  ' + inputNumber(d.nok, 'rakShiftNok', 'NOK') : '',
      fields.includes('free') ? '  ' + inputNumber(d.free, 'rakShiftFree', 'volné') : '',
      '  <button type="button" class="rakShiftRemove" title="Odstranit řádek">×</button>',
      '</div>'
    ].join('');
  }
  function sectionHtml(section) {
    const first = sectionRow(section, { index: section.defaultIndex });
    return [
      '<section class="rakShiftSection" data-section-block="' + section.id + '">',
      '  <div class="rakShiftSectionHead"><h4>' + section.label + '</h4><button type="button" class="appMenuAction rakShiftAddIndex" data-shift-add="' + section.id + '">＋ Přidat index</button></div>',
      '  <div class="rakShiftRows">' + first + '</div>',
      '</section>'
    ].join('');
  }
  function problemRow() {
    const machines = HARD.concat(SOFT);
    return [
      '<div class="rakShiftProblemRow">',
      '  <select class="rakShiftSelect rakShiftMachine">',
      '    <option value="">Stroj…</option>',
      machines.map((m) => '<option value="' + m + '">' + m + '</option>').join(''),
      '  </select>',
      '  <label><span>Od</span><input class="rakShiftTime rakShiftFrom" type="time"></label>',
      '  <label><span>Do</span><input class="rakShiftTime rakShiftTo" type="time"></label>',
      '  <input class="rakShiftProblemText" type="text" maxlength="500" placeholder="Popis problému">',
      '  <button type="button" class="rakShiftRemove" title="Odstranit problém">×</button>',
      '</div>'
    ].join('');
  }
  function ensureStyles() {
    if (document.getElementById('rakShiftReportStyles')) return;
    const style = document.createElement('style');
    style.id = 'rakShiftReportStyles';
    style.textContent = `
      .rakShiftReport{display:grid;gap:14px}.rakShiftIntro{font-size:13px;opacity:.78}.rakShiftSection{border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:12px;background:rgba(255,255,255,.025)}
      .rakShiftSectionHead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:9px}.rakShiftSectionHead h4{margin:0;font-size:16px}.rakShiftRows{display:grid;gap:7px}
      .rakShiftProdRow{display:grid;grid-template-columns:minmax(70px,1fr) minmax(80px,1fr) minmax(80px,1fr) minmax(80px,1fr) 34px;gap:7px;align-items:center;border-radius:12px;padding:4px;transition:box-shadow .15s ease,background .15s ease}.rakShiftSelect,.rakShiftInput,.rakShiftTime,.rakShiftProblemText{box-sizing:border-box;width:100%;min-height:40px;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:rgba(0,0,0,.22);color:inherit;padding:8px 10px}.rakShiftRemove{border:0;background:transparent;color:inherit;opacity:.6;font-size:22px;cursor:pointer}.rakShiftRemove:hover{opacity:1}
      .rakShiftIndex{-webkit-appearance:none;appearance:none;font-weight:900;text-align:center;border-width:2px!important;background-image:linear-gradient(45deg,transparent 50%,currentColor 50%),linear-gradient(135deg,currentColor 50%,transparent 50%)!important;background-position:calc(100% - 15px) 50%,calc(100% - 10px) 50%!important;background-size:5px 5px,5px 5px!important;background-repeat:no-repeat!important;padding-right:28px!important;transition:border-color .15s ease,background-color .15s ease,box-shadow .15s ease,color .15s ease}.rakShiftIndex--blue{color:#5db6ff!important;border-color:#2698ff!important;background-color:rgba(22,112,205,.34)!important;box-shadow:0 0 0 1px rgba(38,152,255,.2),inset 0 0 18px rgba(38,152,255,.08)!important}.rakShiftIndex--green{color:#72ef92!important;border-color:#2cc85a!important;background-color:rgba(28,142,61,.34)!important;box-shadow:0 0 0 1px rgba(44,200,90,.2),inset 0 0 18px rgba(44,200,90,.08)!important}.rakShiftIndex--orange{color:#ffae51!important;border-color:#ff8a1f!important;background-color:rgba(188,86,12,.36)!important;box-shadow:0 0 0 1px rgba(255,138,31,.22),inset 0 0 18px rgba(255,138,31,.09)!important}
      .rakShiftProdRow[data-index-color="blue"]{background:rgba(38,152,255,.055);box-shadow:inset 3px 0 0 #2698ff}.rakShiftProdRow[data-index-color="green"]{background:rgba(44,200,90,.055);box-shadow:inset 3px 0 0 #2cc85a}.rakShiftProdRow[data-index-color="orange"]{background:rgba(255,138,31,.06);box-shadow:inset 3px 0 0 #ff8a1f}
      .rakShiftProblems{display:grid;gap:8px}.rakShiftProblemRow{display:grid;grid-template-columns:110px 86px 86px minmax(150px,1fr) 34px;gap:7px;align-items:end}.rakShiftProblemRow label{display:grid;gap:3px;font-size:11px;opacity:.75}.rakShiftProblemText{min-height:40px}.rakShiftActions{display:flex;flex-wrap:wrap;gap:8px}.rakShiftPreview{white-space:pre-wrap;border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);font-family:inherit;font-size:13px}.rakShiftStatus{font-size:13px;min-height:18px}.rakShiftSaved{opacity:.8}
      @media(max-width:640px){.rakShiftProdRow{grid-template-columns:1fr 1fr 1fr 1fr 30px}.rakShiftProblemRow{grid-template-columns:1fr 1fr 1fr 30px}.rakShiftProblemText{grid-column:1 / -1}.rakShiftProblemRow label span{display:block}.rakShiftSectionHead{align-items:flex-start}.rakShiftSectionHead .appMenuAction{white-space:nowrap}}
    `;
    document.head.appendChild(style);
  }
  function syncIndexColor(select) {
    if (!select) return;
    select.classList.remove('rakShiftIndex--blue', 'rakShiftIndex--green', 'rakShiftIndex--orange', 'rakShiftIndex--neutral');
    select.classList.add(indexColorClass(select.value));
    const color = INDEX_COLORS[select.value] || 'neutral';
    select.dataset.indexColor = color;
    const row = select.closest('.rakShiftProdRow');
    if (row) row.dataset.indexColor = color;
  }
  function getDraft(root) {
    const production = {};
    SECTIONS.forEach((section) => {
      production[section.id] = Array.from(root.querySelectorAll('[data-section="' + section.id + '"]')).map((row) => ({
        index: row.querySelector('.rakShiftIndex')?.value || section.defaultIndex, qty: row.querySelector('.rakShiftQty')?.value || '', nok: row.querySelector('.rakShiftNok')?.value || '', free: row.querySelector('.rakShiftFree')?.value || ''
      })).filter((r) => r.qty !== '' || r.nok !== '' || r.free !== '');
    });
    const problems = Array.from(root.querySelectorAll('.rakShiftProblemRow')).map((row) => ({ machine: row.querySelector('.rakShiftMachine')?.value || '', from: row.querySelector('.rakShiftFrom')?.value || '', to: row.querySelector('.rakShiftTo')?.value || '', text: row.querySelector('.rakShiftProblemText')?.value.trim() || '' })).filter((p) => p.machine || p.from || p.to || p.text);
    return { date: root.querySelector('.rakShiftDate')?.value || '', shift: root.querySelector('.rakShiftShift')?.value || '', production, problems };
  }
  function reportText(draft) {
    const date = draft.date ? new Date(draft.date + 'T12:00:00').toLocaleDateString('cs-CZ') : new Date().toLocaleDateString('cs-CZ');
    const lines = ['RaK – REPORT SMĚNY', date + (draft.shift ? ' · ' + draft.shift : ''), ''];
    const labels = { mo: 'MO', to: 'TO', r01: 'R01', r07: 'R07' };
    Object.keys(labels).forEach((id) => { lines.push(labels[id] + ':'); const rows = draft.production[id] || []; rows.forEach((r) => { const extras = []; if (r.nok) extras.push(r.nok + ' NOK'); if (r.free) extras.push(r.free + ' volné'); lines.push('  - ' + r.qty + ' ' + r.index + (extras.length ? ' (' + extras.join(', ') + ')' : '')); }); if (!rows.length) lines.push('  -'); lines.push(''); });
    if (draft.problems.length) { lines.push('PROBLÉMY:'); draft.problems.forEach((p) => lines.push('  ' + p.machine + ' – ' + (p.from || '??:??') + '–' + (p.to || '??:??') + ', ' + (p.text || 'bez popisu'))); }
    return lines.join('\n').trim();
  }
  function saveLocal(text, draft) { try { const rows = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); rows.unshift({ id: Date.now(), createdAt: new Date().toISOString(), text, draft }); localStorage.setItem(STORAGE_KEY, JSON.stringify(rows.slice(0, 30))); } catch (err) {} }
  async function shareReport(text, root) { saveLocal(text, getDraft(root)); try { if (navigator.share) { await navigator.share({ title: 'RaK – report směny', text }); setStatus(root, 'Report připravený k odeslání.'); return; } await navigator.clipboard.writeText(text); setStatus(root, 'Report zkopírovaný do schránky – můžeš ho poslat mistrovi.'); } catch (err) { setStatus(root, 'Odeslání bylo zrušeno nebo se nepovedlo.'); } }
  function setStatus(root, text) { const el = root.querySelector('.rakShiftStatus'); if (el) el.textContent = text; }
  function renderPreview(root) { const el = root.querySelector('.rakShiftPreview'); if (el) el.textContent = reportText(getDraft(root)); }
  function addIndex(root, id) { const block = root.querySelector('[data-section-block="' + id + '"] .rakShiftRows'); const section = SECTIONS.find((s) => s.id === id); if (!block || !section) return; block.insertAdjacentHTML('beforeend', sectionRow(section, { index: section.defaultIndex })); const added = block.lastElementChild?.querySelector('.rakShiftIndex'); if (added) syncIndexColor(added); renderPreview(root); }
  function addProblem(root) { const block = root.querySelector('.rakShiftProblems'); if (!block) return; block.insertAdjacentHTML('beforeend', problemRow()); renderPreview(root); }
  function canUseShiftReport() { return typeof rakAdminCanOpenAdmin === 'function' && rakAdminCanOpenAdmin(); }
  function build() {
    if (!canUseShiftReport()) return;
    ensureStyles(); const body = document.getElementById('appMenuBody'); if (!body || body.dataset.rakShiftReportOpen !== '1') return; const root = body.querySelector('#rakShiftReport'); if (root) return;
    body.innerHTML = ['<div id="rakShiftReport" class="rakShiftReport">','  <div><div class="appMenuSubTitle">Report směny pro mistra</div><div class="rakShiftIntro">MO: AF / AG / AH. TO a brusy: AD / AE / AH. Barvy indexů odpovídají výrobním indexům.</div></div>','  <label>Datum směny<input class="rakShiftInput rakShiftDate" type="date" value="' + new Date().toISOString().slice(0,10) + '"></label>','  <label>Směna<select class="rakShiftSelect rakShiftShift"><option value="N">Noc</option><option value="R">Ráno</option><option value="N8">Noc 8 h</option><option value="R8">Ráno 8 h</option></select></label>',SECTIONS.map(sectionHtml).join(''),'  <section class="rakShiftSection"><div class="rakShiftSectionHead"><h4>Problémy / odstávky</h4><button type="button" class="appMenuAction rakShiftAddProblem">＋ Přidat problém</button></div><div class="rakShiftProblems">' + problemRow() + '</div></section>','  <section class="rakShiftSection"><div class="appMenuSubTitle">Náhled reportu</div><div class="rakShiftPreview"></div></section>','  <div class="rakShiftActions"><button type="button" class="appMenuAction" data-shift-action="preview">Obnovit náhled</button><button type="button" class="appMenuAction isActive" data-shift-action="send">Odeslat report</button><button type="button" class="appMenuAction" data-shift-action="close">Zpět do Adminu</button></div>','  <div class="rakShiftStatus"></div>','</div>'].join(''); const builtRoot = body.querySelector('#rakShiftReport'); builtRoot?.querySelectorAll('.rakShiftIndex').forEach(syncIndexColor); renderPreview(builtRoot);
  }
  function injectAdminEntry() {
    const body = document.getElementById('appMenuBody');
    if (!body || body.dataset.rakShiftReportOpen === '1') return;
    const old = body.querySelector('[data-admin-action="shift-report"]');
    if (!canUseShiftReport()) { if (old) old.remove(); return; }
    if (old) return;
    const adminButton = body.querySelector('[data-menu-action="admin"]');
    if (!adminButton) return;
    const button = document.createElement('button'); button.type = 'button'; button.className = 'appMenuAction isActive'; button.dataset.adminAction = 'shift-report'; button.textContent = 'Report směny';
    adminButton.insertAdjacentElement('afterend', button);
    button.addEventListener('click', () => { if (!canUseShiftReport()) return; body.dataset.rakShiftReportOpen = '1'; build(); });
  }
  function bindBody() {
    const body = document.getElementById('appMenuBody'); if (!body || body.dataset.rakShiftDelegated === '1') return; body.dataset.rakShiftDelegated = '1';
    body.addEventListener('input', (e) => { if (e.target.closest('#rakShiftReport')) renderPreview(body); });
    body.addEventListener('change', (e) => { if (e.target.classList && e.target.classList.contains('rakShiftIndex')) syncIndexColor(e.target); if (e.target.closest('#rakShiftReport')) renderPreview(body); });
    body.addEventListener('click', (e) => { const root = e.target.closest('#rakShiftReport'); if (!root) return; const add = e.target.closest('[data-shift-add]'); if (add) { addIndex(root, add.dataset.shiftAdd); return; } if (e.target.closest('.rakShiftAddProblem')) { addProblem(root); return; } if (e.target.closest('.rakShiftRemove')) { e.target.closest('.rakShiftProdRow,.rakShiftProblemRow')?.remove(); renderPreview(root); return; } const action = e.target.closest('[data-shift-action]')?.dataset.shiftAction; if (action === 'preview') { renderPreview(root); return; } if (action === 'send') { void shareReport(reportText(getDraft(root)), root); return; } if (action === 'close') { body.dataset.rakShiftReportOpen = '0'; if (typeof renderAdminMenuBody === 'function') renderAdminMenuBody(body, 'home'); return; } });
  }
  function observe() { bindBody(); injectAdminEntry(); const observer = new MutationObserver(() => { bindBody(); if (document.getElementById('appMenuBody')?.dataset.rakShiftReportOpen !== '1') injectAdminEntry(); }); observer.observe(document.body, { childList: true, subtree: true }); }
  window.RakShiftReport = { open: () => { if (!canUseShiftReport()) return; const body = document.getElementById('appMenuBody'); if (body) { body.dataset.rakShiftReportOpen = '1'; build(); } } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', observe, { once: true }); else observe();
})();