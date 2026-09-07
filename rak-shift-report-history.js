// RaK v1.5.16 – lokální historie odeslaných reportů směny a rychlé znovupoužití.
(function installShiftReportHistory() {
  'use strict';

  const HISTORY_KEY = 'rak:shiftReports';
  const DRAFT_PREFIX = 'rak:shiftReportDraft:v1';
  const MAX_HISTORY = 30;
  const STYLE_ID = 'rak-shift-report-history-style';
  let wrappedOpen = false;

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[ch]));
  }

  function accountId() {
    try {
      const profile = typeof window.rakUserProfileGet === 'function' ? window.rakUserProfileGet() : null;
      const id = String(profile && profile.accountNumber || '').trim();
      if (id) return id;
    } catch (_) {}
    try {
      const id = String(window.app && window.app.gamesProfile && window.app.gamesProfile.activeAccountId || '').trim();
      if (id) return id;
    } catch (_) {}
    return 'local';
  }

  function draftKey() { return DRAFT_PREFIX + ':' + accountId(); }

  function readHistory() {
    try {
      const rows = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      return Array.isArray(rows) ? rows.filter((row) => row && typeof row === 'object').slice(0, MAX_HISTORY) : [];
    } catch (_) { return []; }
  }

  function writeHistory(rows) {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify((Array.isArray(rows) ? rows : []).slice(0, MAX_HISTORY))); }
    catch (_) {}
  }

  function collectDraft(root) {
    if (!root) return null;
    const production = {};
    ['mo','to','r01','r07'].forEach((section) => {
      production[section] = Array.from(root.querySelectorAll('[data-section="' + section + '"]')).map((row) => ({
        index: row.querySelector('.rakShiftIndex')?.value || '',
        qty: row.querySelector('.rakShiftQty')?.value || '',
        nok: row.querySelector('.rakShiftNok')?.value || '',
        free: row.querySelector('.rakShiftFree')?.value || ''
      })).filter((row) => row.qty !== '' || row.nok !== '' || row.free !== '');
    });
    const problems = Array.from(root.querySelectorAll('.rakShiftProblemRow')).map((row) => ({
      machine: row.querySelector('.rakShiftMachine')?.value || '',
      from: row.querySelector('.rakShiftFrom')?.value || '',
      to: row.querySelector('.rakShiftTo')?.value || '',
      text: row.querySelector('.rakShiftProblemText')?.value?.trim() || ''
    })).filter((row) => row.machine || row.from || row.to || row.text);
    return {
      date: root.querySelector('.rakShiftDate')?.value || '',
      shift: root.querySelector('.rakShiftShift')?.value || '',
      production,
      moNok: root.querySelector('.rakShiftTotalNok')?.value || '',
      problems
    };
  }

  function normalizeText(root) {
    const preview = root && root.querySelector ? root.querySelector('.rakShiftPreview') : null;
    const raw = String(preview && preview.textContent || '').trim();
    try {
      if (typeof window.rakSortShiftReportRowsByIndexColor === 'function' && typeof window.rakFormatShiftReportText === 'function') {
        return window.rakSortShiftReportRowsByIndexColor(window.rakFormatShiftReportText(raw));
      }
    } catch (_) {}
    return raw;
  }

  function recordWhatsApp(root) {
    const text = normalizeText(root);
    if (!text) return;
    const draft = collectDraft(root);
    const rows = readHistory();
    const duplicate = rows[0] && rows[0].text === text && Date.now() - Number(rows[0].id || 0) < 5000;
    if (duplicate) {
      rows[0].status = 'odeslano';
      rows[0].channel = 'WhatsApp';
      rows[0].createdAt = new Date().toISOString();
      if (draft) rows[0].draft = draft;
      writeHistory(rows);
      return;
    }
    rows.unshift({
      id: Date.now(),
      createdAt: new Date().toISOString(),
      status: 'odeslano',
      channel: 'WhatsApp',
      text,
      draft
    });
    writeHistory(rows);
  }

  function reportLabel(row) {
    const first = String(row && row.text || '').split('\n').find((line) => String(line || '').trim()) || 'Report směny';
    return first.replace(/\s+/g, ' ').trim().slice(0, 80);
  }

  function dateTime(row) {
    const d = new Date(row && (row.createdAt || row.id));
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('cs-CZ', { day:'numeric', month:'numeric', hour:'2-digit', minute:'2-digit' });
  }

  function render(root) {
    if (!root) return;
    let host = root.querySelector('[data-rak-shift-history="1"]');
    if (!host) {
      host = document.createElement('details');
      host.className = 'rakShiftHistory';
      host.setAttribute('data-rak-shift-history', '1');
      const status = root.querySelector('.rakShiftStatus');
      if (status && status.parentNode) status.parentNode.insertBefore(host, status);
      else root.appendChild(host);
    }
    const rows = readHistory().slice(0, 8);
    host.innerHTML = '<summary>Poslední reporty' + (rows.length ? ' <span>' + rows.length + '</span>' : '') + '</summary>' +
      '<div class="rakShiftHistoryBody">' + (rows.length ? rows.map((row, index) => {
        const status = String(row.status || '').toLowerCase() === 'odeslano' ? 'Odeslaný' : 'Uložený';
        return '<div class="rakShiftHistoryRow">' +
          '<div class="rakShiftHistoryMeta"><b>' + esc(reportLabel(row)) + '</b><span>' + esc(status + (row.channel ? ' · ' + row.channel : '') + (dateTime(row) ? ' · ' + dateTime(row) : '')) + '</span></div>' +
          '<div class="rakShiftHistoryActions">' +
            (row.draft ? '<button type="button" data-rak-history-action="reuse" data-index="' + index + '">Použít</button>' : '') +
            '<button type="button" data-rak-history-action="copy" data-index="' + index + '">Kopírovat</button>' +
          '</div></div>';
      }).join('') : '<div class="rakShiftHistoryEmpty">Zatím žádný uložený report.</div>') + '</div>';
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
#rakShiftReport .rakShiftHistory{margin-top:8px;border:1px solid rgba(255,255,255,.10);border-radius:14px;background:rgba(255,255,255,.035);overflow:hidden}
#rakShiftReport .rakShiftHistory>summary{cursor:pointer;list-style:none;padding:12px 14px;font-weight:800;color:var(--green2,#cfff63);display:flex;justify-content:space-between;gap:8px}
#rakShiftReport .rakShiftHistory>summary::-webkit-details-marker{display:none}
#rakShiftReport .rakShiftHistory>summary span{font-size:12px;opacity:.72}
#rakShiftReport .rakShiftHistoryBody{display:flex;flex-direction:column;border-top:1px solid rgba(255,255,255,.08)}
#rakShiftReport .rakShiftHistoryRow{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.07)}
#rakShiftReport .rakShiftHistoryRow:last-child{border-bottom:0}
#rakShiftReport .rakShiftHistoryMeta{min-width:0;display:flex;flex-direction:column;gap:2px}
#rakShiftReport .rakShiftHistoryMeta b{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#rakShiftReport .rakShiftHistoryMeta span,#rakShiftReport .rakShiftHistoryEmpty{font-size:11px;opacity:.68}
#rakShiftReport .rakShiftHistoryActions{display:flex;gap:5px;flex:none}
#rakShiftReport .rakShiftHistoryActions button{border:1px solid rgba(255,255,255,.14);border-radius:9px;background:rgba(255,255,255,.07);color:inherit;padding:7px 8px;font:700 11px/1 system-ui,-apple-system,sans-serif}
#rakShiftReport .rakShiftHistoryEmpty{padding:12px}
`;
    document.head.appendChild(style);
  }

  function reuse(index) {
    const row = readHistory()[Number(index)];
    if (!row || !row.draft) return;
    try {
      localStorage.setItem(draftKey(), JSON.stringify({ updatedAt: new Date().toISOString(), draft: row.draft }));
      if (window.RakShiftReport && typeof window.RakShiftReport.open === 'function') {
        window.RakShiftReport.open();
        setTimeout(() => render(document.getElementById('rakShiftReport')), 0);
      }
    } catch (_) {}
  }

  async function copy(index, root) {
    const row = readHistory()[Number(index)];
    if (!row || !row.text) return;
    try {
      await navigator.clipboard.writeText(String(row.text));
      const status = root && root.querySelector ? root.querySelector('.rakShiftStatus') : null;
      if (status) status.textContent = 'Starší report zkopírovaný ✓';
    } catch (_) {}
  }

  function wrapOpen() {
    if (wrappedOpen || !window.RakShiftReport || typeof window.RakShiftReport.open !== 'function') return false;
    const original = window.RakShiftReport.open;
    window.RakShiftReport.open = function () {
      const result = original.apply(this, arguments);
      setTimeout(() => render(document.getElementById('rakShiftReport')), 0);
      return result;
    };
    wrappedOpen = true;
    return true;
  }

  function boot() {
    ensureStyles();
    document.addEventListener('click', (event) => {
      const whatsapp = event.target && event.target.closest ? event.target.closest('[data-rak-share-action="whatsapp"]') : null;
      if (whatsapp) {
        const root = whatsapp.closest('#rakShiftReport');
        if (root) {
          recordWhatsApp(root);
          setTimeout(() => render(root), 0);
        }
      }
      const action = event.target && event.target.closest ? event.target.closest('[data-rak-history-action]') : null;
      if (!action) return;
      const root = action.closest('#rakShiftReport');
      const kind = String(action.dataset.rakHistoryAction || '');
      if (kind === 'reuse') reuse(action.dataset.index);
      if (kind === 'copy') void copy(action.dataset.index, root);
    }, true);
    if (!wrapOpen()) {
      let tries = 0;
      const timer = setInterval(() => {
        tries += 1;
        if (wrapOpen() || tries >= 40) clearInterval(timer);
      }, 100);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();

  window.RakShiftReportHistory = Object.freeze({ read: readHistory, render, recordWhatsApp });
})();
