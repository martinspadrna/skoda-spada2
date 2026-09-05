// RaK – report dovolených z absencí v rozpisu. Používá pouze již načtená data,
// proto funguje i offline a nemění samotný kalendář ani rozpis.
(function () {
  'use strict';

  const MONTHS = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'];

  function escapeHtml(value) {
    if (typeof window.escapeHtml === 'function') return window.escapeHtml(String(value || ''));
    return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function canUse() {
    return typeof window.rakAdminCanOpenAdmin === 'function' && window.rakAdminCanOpenAdmin();
  }

  function getMonths() {
    const months = window.app && app.rotation && app.rotation.months ? app.rotation.months : {};
    return Object.keys(months).sort((a, b) => {
      const pa = typeof window.parseMonthKey === 'function' ? window.parseMonthKey(a) : null;
      const pb = typeof window.parseMonthKey === 'function' ? window.parseMonthKey(b) : null;
      return ((pa && pa.year) || 0) - ((pb && pb.year) || 0) || ((pa && pa.month) || 0) - ((pb && pb.month) || 0);
    });
  }

  function monthLabel(monthKey) {
    const parsed = typeof window.parseMonthKey === 'function' ? window.parseMonthKey(monthKey) : null;
    if (!parsed) return String(monthKey || '—');
    return String(MONTHS[parsed.month - 1] || parsed.month) + ' ' + String(parsed.year);
  }

  function isVacation(entry) {
    const raw = [entry && entry.code, entry && entry.label, entry && entry.text].filter(Boolean).join(' ');
    const normalized = String(raw).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return /dovolena/.test(normalized) || /(^|[^a-z])d($|[^a-z])/i.test(normalized);
  }

  function vacationRows(monthKey) {
    const month = window.app && app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
    const source = Array.isArray(month && month.notes) ? month.notes : [];
    const seen = new Set();
    return source.flatMap((note, noteIndex) => {
      const entry = typeof window.normalizeNoteEntry === 'function' ? window.normalizeNoteEntry(note) : note;
      if (!entry || !entry.isAbsence || !isVacation(entry)) return [];
      const parsed = typeof window.parseDateToken === 'function' ? window.parseDateToken(entry.date) : null;
      const shift = String(entry.shift || (parsed && parsed.shift) || '').trim();
      const date = parsed ? (String(parsed.day) + '.' + String(parsed.month) + '.') : String(entry.date || '').replace(/\b(?:R8|N8|R|N)\b/gi, '').trim();
      const people = Array.isArray(entry.people) && entry.people.length ? entry.people : [entry.person];
      return people.map((person) => {
        const name = String(person || '').trim();
        const key = [name, date, shift].join('|');
        if (!name || !date || seen.has(key)) return null;
        seen.add(key);
        return {
          name,
          date,
          shift,
          day: Number(parsed && parsed.day) || 99,
          order: shift.toUpperCase().startsWith('R') ? 1 : (shift.toUpperCase().startsWith('N') ? 2 : 9),
          noteIndex
        };
      }).filter(Boolean);
    }).sort((a, b) => a.name.localeCompare(b.name, 'cs') || a.day - b.day || a.order - b.order || a.noteIndex - b.noteIndex);
  }

  function reportText(monthKey) {
    const rows = vacationRows(monthKey);
    const byName = new Map();
    rows.forEach((row) => {
      if (!byName.has(row.name)) byName.set(row.name, []);
      byName.get(row.name).push([row.date, row.shift].filter(Boolean).join(' '));
    });
    const lines = ['RaK – report dovolených', 'Měsíc: ' + monthLabel(monthKey), ''];
    if (!byName.size) lines.push('V rozpisu nejsou zapsané žádné dovolené.');
    else {
      lines.push('Dovolené:');
      byName.forEach((dates, name) => lines.push('- ' + name + ': ' + dates.join(', ')));
      lines.push('', 'Celkem: ' + String(rows.length) + ' záznamů · ' + String(byName.size) + ' osob');
    }
    return lines.join('\n');
  }

  function setStatus(root, text) {
    const status = root && root.querySelector('.rakVacationReportStatus');
    if (status) status.textContent = text || '';
  }

  function renderPreview(root) {
    const select = root && root.querySelector('.rakVacationReportMonth');
    const preview = root && root.querySelector('.rakVacationReportPreview');
    if (preview) preview.textContent = reportText(select && select.value);
  }

  async function share(root) {
    const select = root && root.querySelector('.rakVacationReportMonth');
    const text = reportText(select && select.value);
    try {
      if (navigator.share) {
        await navigator.share({ title: 'RaK – report dovolených', text });
        setStatus(root, 'Report je připravený k odeslání.');
        return;
      }
      await navigator.clipboard.writeText(text);
      setStatus(root, 'Report je zkopírovaný do schránky – můžeš ho poslat přes WhatsApp nebo jinou aplikaci.');
    } catch (err) {
      setStatus(root, 'Odeslání bylo zrušeno nebo se nepovedlo.');
    }
  }

  function ensureStyles() {
    if (document.getElementById('rakVacationReportStyles')) return;
    const style = document.createElement('style');
    style.id = 'rakVacationReportStyles';
    style.textContent = '.rakVacationReport{display:grid;gap:14px}.rakVacationReportContext{display:grid;gap:5px;max-width:250px;font-size:13px}.rakVacationReportMonth{box-sizing:border-box;width:100%;min-height:40px;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:rgba(0,0,0,.22);color:inherit;padding:8px 10px}.rakVacationReportPreview{white-space:pre-wrap;border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);font-family:inherit;font-size:13px}.rakVacationReportActions{display:flex;flex-wrap:wrap;gap:8px}.rakVacationReportStatus{min-height:18px;font-size:13px}';
    document.head.appendChild(style);
  }

  function build() {
    if (!canUse()) return;
    const body = document.getElementById('appMenuBody');
    if (!body || body.dataset.rakVacationReportOpen !== '1') return;
    const months = getMonths();
    const selected = (window.app && app.selectedMonth && months.includes(app.selectedMonth)) ? app.selectedMonth : months[months.length - 1];
    ensureStyles();
    body.innerHTML = [
      '<div id="rakVacationReport" class="rakVacationReport">',
      '<div><div class="appMenuSubTitle">Report dovolené</div><div class="smallText">Přehled čerpání dovolené z Absencí ve zvoleném rozpisu.</div></div>',
      '<label class="rakVacationReportContext">Měsíc<select class="rakVacationReportMonth">',
      months.map((key) => '<option value="' + escapeHtml(key) + '"' + (key === selected ? ' selected' : '') + '>' + escapeHtml(monthLabel(key)) + '</option>').join(''),
      '</select></label><section><div class="appMenuSubTitle">Náhled reportu</div><div class="rakVacationReportPreview"></div></section>',
      '<div class="rakVacationReportActions"><button type="button" class="appMenuAction" data-vacation-report-action="preview">Obnovit náhled</button><button type="button" class="appMenuAction isActive" data-vacation-report-action="send">Sdílet / kopírovat</button><button type="button" class="appMenuAction" data-vacation-report-action="close">Zpět do Adminu</button></div>',
      '<div class="rakVacationReportStatus" aria-live="polite"></div></div>'
    ].join('');
    renderPreview(body.querySelector('#rakVacationReport'));
  }

  function injectAdminEntry() {
    const body = document.getElementById('appMenuBody');
    if (!body || body.dataset.rakVacationReportOpen === '1') return;
    const old = body.querySelector('[data-admin-action="vacation-report"]');
    if (!canUse()) { if (old) old.remove(); return; }
    if (old) return;
    const adminButton = body.querySelector('[data-menu-action="admin"]');
    if (!adminButton) return;
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'appMenuAction isActive';
    button.dataset.adminAction = 'vacation-report'; button.textContent = 'Report dovolené';
    adminButton.insertAdjacentElement('afterend', button);
    button.addEventListener('click', () => { body.dataset.rakVacationReportOpen = '1'; build(); });
  }

  function bindBody() {
    const body = document.getElementById('appMenuBody');
    if (!body || body.dataset.rakVacationReportDelegated === '1') return;
    body.dataset.rakVacationReportDelegated = '1';
    body.addEventListener('change', (event) => { if (event.target.matches('.rakVacationReportMonth')) renderPreview(event.target.closest('#rakVacationReport')); });
    body.addEventListener('click', (event) => {
      const root = event.target.closest('#rakVacationReport');
      if (!root) return;
      const action = event.target.closest('[data-vacation-report-action]')?.dataset.vacationReportAction;
      if (action === 'preview') renderPreview(root);
      if (action === 'send') void share(root);
      if (action === 'close') { body.dataset.rakVacationReportOpen = '0'; if (typeof window.renderAdminMenuBody === 'function') window.renderAdminMenuBody(body, 'home'); }
    });
  }

  function observe() {
    bindBody(); injectAdminEntry();
    new MutationObserver(() => { bindBody(); if (document.getElementById('appMenuBody')?.dataset.rakVacationReportOpen !== '1') injectAdminEntry(); }).observe(document.body, { childList: true, subtree: true });
  }

  window.RakVacationReport = { open: () => { const body = document.getElementById('appMenuBody'); if (body && canUse()) { body.dataset.rakVacationReportOpen = '1'; build(); } }, getText: reportText };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', observe, { once: true }); else observe();
})();
