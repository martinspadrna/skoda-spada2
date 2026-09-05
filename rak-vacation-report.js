// RaK – report dovolených z absencí v rozpisu. Používá pouze již načtená data,
// proto funguje i offline a nemění samotný kalendář ani rozpis.
(function () {
  'use strict';

  const MONTHS = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'];
  const ABSENCE_CALENDAR_URL = String(window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url || '').replace(/\/$/, '') + '/functions/v1/rak-absence-calendar';
  const calendarRowsByMonth = new Map();
  const calendarLoadByMonth = new Map();

  function escapeHtml(value) {
    if (typeof window.escapeHtml === 'function') return window.escapeHtml(String(value || ''));
    return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function canUse() {
    return typeof window.rakAdminCanOpenAdmin === 'function' && window.rakAdminCanOpenAdmin();
  }

  // Stejná viditelnost jako tlačítko Administrace. Samotné otevření níže stejně
  // znovu vyžaduje platnou admin relaci, takže zobrazení tlačítka nepřidává práva.
  function canShowAdminEntry() {
    try {
      if (typeof window.appMenuShouldShowAdminEntry === 'function') return !!window.appMenuShouldShowAdminEntry();
    } catch (err) {}
    return canUse();
  }

  async function ensureAdminAccess() {
    if (canUse()) return true;
    try {
      if (typeof window.appMenuEnsureAdminAccessFromMenu === 'function') await window.appMenuEnsureAdminAccessFromMenu();
    } catch (err) {}
    return canUse();
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

  function normalizeLookup(value) {
    return String(value || '').toLocaleLowerCase('cs-CZ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  }

  function decodeIcsText(value) {
    return String(value || '').replace(/\\n/gi, ' ').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\').replace(/\s+/g, ' ').trim();
  }

  function icsProperty(block, name) {
    const wanted = String(name || '').toUpperCase();
    const lines = String(block || '').replace(/\r?\n[ \t]/g, '').split(/\r?\n/);
    for (const line of lines) {
      const split = line.indexOf(':');
      if (split < 0) continue;
      if (line.slice(0, split).split(';')[0].toUpperCase() === wanted) return { key: line.slice(0, split), value: line.slice(split + 1) };
    }
    return { key: '', value: '' };
  }

  function icsDate(value) {
    const match = String(value || '').match(/^(\d{4})(\d{2})(\d{2})/);
    return match ? match[1] + '-' + match[2] + '-' + match[3] : '';
  }

  function isoDate(value) {
    const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;
    const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    return Number.isFinite(date.getTime()) ? date : null;
  }

  function icsDates(start, end) {
    const startIso = icsDate(start && start.value);
    const startDate = isoDate(startIso);
    if (!startDate) return [];
    const endDate = isoDate(icsDate(end && end.value));
    if (!endDate || endDate <= startDate) return [startIso];
    const allDay = /VALUE=DATE/i.test(String(start && start.key || '')) || /^\d{8}$/.test(String(start && start.value || '').trim());
    const limit = new Date(endDate.getTime());
    if (allDay) limit.setUTCDate(limit.getUTCDate() - 1);
    if (limit < startDate) return [startIso];
    const dates = [];
    const cursor = new Date(startDate.getTime());
    while (cursor <= limit && dates.length < 370) {
      dates.push(cursor.toISOString().slice(0, 10));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return dates;
  }

  function knownNames() {
    if (typeof window.getKnownStatNames === 'function') return Array.from(window.getKnownStatNames()).map((name) => String(name || '').trim()).filter(Boolean);
    return [];
  }

  function nameFromCalendarSummary(summary) {
    const raw = decodeIcsText(summary);
    if (!raw || !isVacation({ text: raw })) return '';
    const names = knownNames();
    const normalized = normalizeLookup(raw);
    const exact = names.find((name) => normalized.startsWith(normalizeLookup(name)));
    if (exact) return exact;
    const firstPart = raw.split(/[,:;]/)[0].trim().split(/\s+/)[0];
    return firstPart && firstPart.length < 80 ? firstPart : '';
  }

  function calendarVacationRows(text, monthKey) {
    const parsedMonth = typeof window.parseMonthKey === 'function' ? window.parseMonthKey(monthKey) : null;
    if (!parsedMonth) return [];
    const wantedPrefix = String(parsedMonth.year) + '-' + String(parsedMonth.month).padStart(2, '0') + '-';
    const seen = new Set();
    const rows = [];
    const events = String(text || '').match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) || [];
    events.forEach((event, index) => {
      const name = nameFromCalendarSummary(icsProperty(event, 'SUMMARY').value);
      if (!name) return;
      icsDates(icsProperty(event, 'DTSTART'), icsProperty(event, 'DTEND')).forEach((date) => {
        if (!date.startsWith(wantedPrefix)) return;
        const key = name + '|' + date;
        if (seen.has(key)) return;
        seen.add(key);
        rows.push({ name, date: String(Number(date.slice(8, 10))) + '.' + String(Number(date.slice(5, 7))) + '.', shift: '', day: Number(date.slice(8, 10)), order: 0, noteIndex: index });
      });
    });
    return rows.sort((a, b) => a.name.localeCompare(b.name, 'cs') || a.day - b.day || a.noteIndex - b.noteIndex);
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

  function rowsForMonth(monthKey) {
    return calendarRowsByMonth.has(monthKey) ? calendarRowsByMonth.get(monthKey) : vacationRows(monthKey);
  }

  function reportSource(monthKey) {
    return calendarRowsByMonth.has(monthKey) ? 'Google kalendář' : 'Absence v rozpisu';
  }

  function reportText(monthKey) {
    const rows = rowsForMonth(monthKey);
    const byName = new Map();
    rows.forEach((row) => {
      if (!byName.has(row.name)) byName.set(row.name, []);
      byName.get(row.name).push([row.date, row.shift].filter(Boolean).join(' '));
    });
    const lines = ['RaK – report dovolených', 'Měsíc: ' + monthLabel(monthKey), 'Zdroj: ' + reportSource(monthKey), ''];
    if (!byName.size) lines.push('Pro vybraný měsíc nejsou zapsané žádné dovolené.');
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

  async function loadCalendar(root, force) {
    const select = root && root.querySelector('.rakVacationReportMonth');
    const monthKey = String(select && select.value || '');
    if (!monthKey) return;
    if (!force && calendarRowsByMonth.has(monthKey)) { renderPreview(root); return; }
    if (calendarLoadByMonth.get(monthKey)) return calendarLoadByMonth.get(monthKey);
    const promise = (async () => {
      setStatus(root, 'Načítám dovolené z Google kalendáře…');
      try {
        const bridge = window.RotationSupabaseBridge;
        const accessToken = bridge && typeof bridge.getAdminAccessToken === 'function' ? await bridge.getAdminAccessToken() : '';
        if (!accessToken || !ABSENCE_CALENDAR_URL) throw new Error('admin-auth-required');
        const response = await fetch(ABSENCE_CALENDAR_URL, {
          cache: 'no-store',
          headers: { Authorization: 'Bearer ' + accessToken, apikey: String(window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.publishableKey || '') }
        });
        if (!response || !response.ok) throw new Error('HTTP ' + String(response && response.status || ''));
        calendarRowsByMonth.set(monthKey, calendarVacationRows(await response.text(), monthKey));
        renderPreview(root);
        setStatus(root, 'Dovolené byly načtené z Google kalendáře.');
      } catch (err) {
        renderPreview(root);
        setStatus(root, 'Kalendář teď není dostupný – zobrazuji Absence z rozpisu.');
      } finally {
        calendarLoadByMonth.delete(monthKey);
      }
    })();
    calendarLoadByMonth.set(monthKey, promise);
    return promise;
  }

  function getReportText(root) {
    const select = root && root.querySelector('.rakVacationReportMonth');
    return reportText(select && select.value);
  }

  async function copy(root) {
    const text = getReportText(root);
    if (!text) return false;
    try {
      await navigator.clipboard.writeText(text);
      setStatus(root, 'Report je zkopírovaný do schránky.');
      return true;
    } catch (err) {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try {
        const copied = document.execCommand('copy');
        setStatus(root, copied ? 'Report je zkopírovaný do schránky.' : 'Kopírování se nepodařilo.');
        return copied;
      } catch (copyErr) {
        setStatus(root, 'Kopírování se nepodařilo.');
        return false;
      } finally {
        area.remove();
      }
    }
  }

  async function share(root) {
    const text = getReportText(root);
    try {
      if (navigator.share) {
        await navigator.share({ title: 'RaK – report dovolených', text });
        setStatus(root, 'Report je připravený k odeslání.');
        return;
      }
      await copy(root);
    } catch (err) {
      setStatus(root, 'Odeslání bylo zrušeno nebo se nepovedlo.');
    }
  }

  function whatsapp(root) {
    const text = getReportText(root);
    if (!text) return;
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener,noreferrer');
    setStatus(root, 'Otevírám WhatsApp…');
  }

  function ensureStyles() {
    if (document.getElementById('rakVacationReportStyles')) return;
    const style = document.createElement('style');
    style.id = 'rakVacationReportStyles';
    style.textContent = '.rakVacationReport{display:grid;gap:14px}.rakVacationReportContext{display:grid;gap:5px;max-width:250px;font-size:13px}.rakVacationReportMonth{box-sizing:border-box;width:100%;min-height:40px;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:rgba(0,0,0,.22);color:inherit;padding:8px 10px}.rakVacationReportPreview{white-space:pre-wrap;border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);font-family:inherit;font-size:13px}.rakVacationReportActions{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px}.rakVacationReportActions [data-vacation-report-action="copy"],.rakVacationReportActions [data-vacation-report-action="close"]{grid-column:1/-1}.rakVacationReportActions [data-vacation-report-action="whatsapp"]{background:rgba(37,211,102,.14);border-color:rgba(77,221,130,.28)}.rakVacationReportStatus{min-height:18px;font-size:13px}';
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
      '<div><div class="appMenuSubTitle">Report dovolené</div><div class="smallText">Přehled dovolených z Google kalendáře; při nedostupném připojení bezpečně použije Absence ve zvoleném rozpisu.</div></div>',
      '<label class="rakVacationReportContext">Měsíc<select class="rakVacationReportMonth">',
      months.map((key) => '<option value="' + escapeHtml(key) + '"' + (key === selected ? ' selected' : '') + '>' + escapeHtml(monthLabel(key)) + '</option>').join(''),
      '</select></label><section><div class="appMenuSubTitle">Náhled reportu</div><div class="rakVacationReportPreview"></div></section>',
      '<div class="rakVacationReportActions"><button type="button" class="appMenuAction" data-vacation-report-action="calendar">Načíst z kalendáře</button><button type="button" class="appMenuAction" data-vacation-report-action="preview">Obnovit náhled</button><button type="button" class="appMenuAction" data-vacation-report-action="copy">Zkopírovat report</button><button type="button" class="appMenuAction isActive" data-vacation-report-action="share">Sdílet</button><button type="button" class="appMenuAction" data-vacation-report-action="whatsapp">WhatsApp</button><button type="button" class="appMenuAction" data-vacation-report-action="close">Zpět do Adminu</button></div>',
      '<div class="rakVacationReportStatus" aria-live="polite"></div></div>'
    ].join('');
    const root = body.querySelector('#rakVacationReport');
    renderPreview(root);
    void loadCalendar(root, false);
  }

  function bindAdminEntry(button, body) {
    if (!button || button.dataset.rakVacationReportBound === '1') return;
    button.dataset.rakVacationReportBound = '1';
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      void ensureAdminAccess().then((allowed) => {
        if (!allowed) return;
        body.dataset.rakVacationReportOpen = '1';
        build();
      });
    });
  }

  function injectAdminEntry() {
    const body = document.getElementById('appMenuBody');
    if (!body || body.dataset.rakVacationReportOpen === '1') return;
    const old = body.querySelector('[data-admin-action="vacation-report"]');
    if (!canShowAdminEntry()) { if (old) old.remove(); return; }
    if (old) {
      old.hidden = false;
      old.disabled = false;
      old.setAttribute('aria-hidden', 'false');
      bindAdminEntry(old, body);
      return;
    }
    const adminButton = body.querySelector('[data-menu-action="admin"]');
    if (!adminButton) return;
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'appMenuAction isActive';
    button.dataset.adminAction = 'vacation-report'; button.textContent = 'Report dovolené';
    adminButton.insertAdjacentElement('afterend', button);
    bindAdminEntry(button, body);
  }

  function bindBody() {
    const body = document.getElementById('appMenuBody');
    if (!body || body.dataset.rakVacationReportDelegated === '1') return;
    body.dataset.rakVacationReportDelegated = '1';
    body.addEventListener('change', (event) => {
      if (!event.target.matches('.rakVacationReportMonth')) return;
      const root = event.target.closest('#rakVacationReport');
      renderPreview(root);
      void loadCalendar(root, false);
    });
    body.addEventListener('click', (event) => {
      const root = event.target.closest('#rakVacationReport');
      if (!root) return;
      const action = event.target.closest('[data-vacation-report-action]')?.dataset.vacationReportAction;
      if (action === 'preview') renderPreview(root);
      if (action === 'calendar') void loadCalendar(root, true);
      if (action === 'copy') void copy(root);
      if (action === 'share') void share(root);
      if (action === 'whatsapp') whatsapp(root);
      if (action === 'close') { body.dataset.rakVacationReportOpen = '0'; if (typeof window.renderAdminMenuBody === 'function') window.renderAdminMenuBody(body, 'home'); }
    });
  }

  function observe() {
    bindBody(); injectAdminEntry();
    new MutationObserver(() => { bindBody(); if (document.getElementById('appMenuBody')?.dataset.rakVacationReportOpen !== '1') injectAdminEntry(); }).observe(document.body, { childList: true, subtree: true });
  }

  window.RakVacationReport = { open: () => { const body = document.getElementById('appMenuBody'); if (body) { void ensureAdminAccess().then((allowed) => { if (allowed) { body.dataset.rakVacationReportOpen = '1'; build(); } }); } }, getText: reportText };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', observe, { once: true }); else observe();
})();
