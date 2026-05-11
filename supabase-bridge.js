(function () {
  const SUPABASE_CONFIG = window.SUPABASE_CONFIG || {};
  const state = {
    client: null,
    ready: false,
    announcements: [],
    lastError: null
  };

  function hasClient() {
    return !!(window.supabase && typeof window.supabase.createClient === 'function');
  }

  function getClient() {
    if (state.client) return state.client;
    if (!hasClient()) return null;
    const url = SUPABASE_CONFIG.url || '';
    const key = SUPABASE_CONFIG.publishableKey || '';
    if (!url || !key) return null;
    state.client = window.supabase.createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
    return state.client;
  }

  function getBridgeText() {
    const active = state.announcements.find(item => item && item.is_active !== false) || state.announcements[0] || null;
    return active ? {
      title: String(active.title || '').trim(),
      message: String(active.message || '').trim()
    } : null;
  }

  function getCanteenStatus() {
    return null;
  }



  async function refreshPublicData() {
    const client = getClient();
    if (!client) return null;

    try {
      const announcementsRes = await client
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (announcementsRes && !announcementsRes.error) {
        state.announcements = Array.isArray(announcementsRes.data) ? announcementsRes.data : [];
      }

      state.ready = true;
      state.lastError = null;

      if (typeof forceHomeRefresh === 'function') forceHomeRefresh();
      if (typeof window.__rotaceBootHomeRefreshLate === 'function') window.__rotaceBootHomeRefreshLate();
      else {
        if (typeof updateDashboard === 'function') updateDashboard();
        if (typeof updateFoodTile === 'function') updateFoodTile();
        if (typeof updateEportalTile === 'function') updateEportalTile();
      }

      return { announcements: state.announcements };
    } catch (err) {
      state.lastError = err;
      console.warn('Supabase public data refresh failed', err);
      return null;
    }
  }

  function monthKeyToMonthStart(monthKey) {
    const match = /^(\d{1,2})\/(\d{2})$/.exec(String(monthKey || '').trim());
    if (!match) return null;
    const month = Math.max(1, Math.min(12, parseInt(match[1], 10) || 1));
    const year = 2000 + (parseInt(match[2], 10) || 0);
    return `${year}-${String(month).padStart(2, '0')}-01`;
  }


  function monthStartToMonthKey(monthStart) {
    const raw = String(monthStart || '').trim();
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
    if (!m) return raw ? raw : '';
    return String(Number(m[2])) + '/' + String(m[1]).slice(-2);
  }

  function rebuildRotationFromTables(monthRows, entryRows) {
    const months = {};
    const hardMachines = Array.isArray(window.HARD_MACHINE_HEADERS) ? window.HARD_MACHINE_HEADERS.slice() : [];
    const softMachines = Array.isArray(window.SOFT_MACHINE_HEADERS) ? window.SOFT_MACHINE_HEADERS.slice() : [];
    const rowsByMonthKey = new Map();

    (Array.isArray(monthRows) ? monthRows : []).forEach(row => {
      const monthKey = String(row && row.label ? row.label : monthStartToMonthKey(row && row.month_start ? row.month_start : '')).trim();
      if (!monthKey) return;
      months[monthKey] = {
        hard: { title: 'Rotace tvrdota', machines: hardMachines.slice(), rows: [] },
        soft: { title: 'Rotace měkota', machines: softMachines.slice(), rows: [] },
        notes: []
      };
      rowsByMonthKey.set(String(row && row.month_start ? row.month_start : '').trim() || monthKey, monthKey);
    });

    const ensureMonth = (monthKey) => {
      if (!months[monthKey]) {
        months[monthKey] = {
          hard: { title: 'Rotace tvrdota', machines: hardMachines.slice(), rows: [] },
          soft: { title: 'Rotace měkota', machines: softMachines.slice(), rows: [] },
          notes: []
        };
      }
      return months[monthKey];
    };

    const grouped = { hard: new Map(), soft: new Map() };

    (Array.isArray(entryRows) ? entryRows : []).forEach(entry => {
      const monthKey = rowsByMonthKey.get(String(entry && entry.month_start ? entry.month_start : '').trim()) || monthStartToMonthKey(entry && entry.month_start ? entry.month_start : '');
      if (!monthKey) return;
      const month = ensureMonth(monthKey);
      const type = String(entry && entry.assignment_type ? entry.assignment_type : '').trim();

      if (type === 'note') {
        const note = {
          date: String(entry && entry.shift_code ? entry.shift_code : '').trim(),
          person: String(entry && entry.employee_name ? entry.employee_name : '').trim(),
          code: String(entry && entry.target_machine ? entry.target_machine : '').trim(),
          shift: '',
          text: String(entry && entry.note ? entry.note : '').trim()
        };
        if (note.date || note.person || note.code || note.text) month.notes.push(note);
        return;
      }

      const section = type === 'soft' ? 'soft' : 'hard';
      const machineList = section === 'hard' ? hardMachines : softMachines;
      const rowIndex = Math.floor(Number(entry && entry.row_order ? entry.row_order : 0) / 100);
      const rowKey = [monthKey, section, String(entry && entry.shift_code ? entry.shift_code : '').trim(), String(rowIndex)].join('||');
      const cidx = machineList.indexOf(String(entry && entry.target_machine ? entry.target_machine : '').trim());

      if (!grouped[section].has(rowKey)) {
        grouped[section].set(rowKey, {
          date: String(entry && entry.shift_code ? entry.shift_code : '').trim(),
          cells: Array(machineList.length).fill(''),
          _order: rowIndex
        });
      }
      const row = grouped[section].get(rowKey);
      if (cidx >= 0) row.cells[cidx] = String(entry && entry.employee_name ? entry.employee_name : '').trim();
    });

    Object.entries(grouped).forEach(([section, map]) => {
      const rows = Array.from(map.values()).sort((a, b) => a._order - b._order || String(a.date || '').localeCompare(String(b.date || ''), 'cs'));
      rows.forEach(row => { delete row._order; });
      Object.values(months).forEach(m => {
        m[section].rows = rows.filter(r => true);
      });
    });

    // Re-run per month to assign the correct rows only to each month.
    Object.keys(months).forEach(monthKey => {
      ['hard', 'soft'].forEach(section => { months[monthKey][section].rows = []; });
    });

    (Array.isArray(entryRows) ? entryRows : []).forEach(entry => {
      const monthKey = rowsByMonthKey.get(String(entry && entry.month_start ? entry.month_start : '').trim()) || monthStartToMonthKey(entry && entry.month_start ? entry.month_start : '');
      if (!monthKey) return;
      const type = String(entry && entry.assignment_type ? entry.assignment_type : '').trim();
      if (type === 'note') return;
      const section = type === 'soft' ? 'soft' : 'hard';
      const machineList = section === 'hard' ? hardMachines : softMachines;
      const rowIndex = Math.floor(Number(entry && entry.row_order ? entry.row_order : 0) / 100);
      const rowKey = [monthKey, section, String(entry && entry.shift_code ? entry.shift_code : '').trim(), String(rowIndex)].join('||');
      const cidx = machineList.indexOf(String(entry && entry.target_machine ? entry.target_machine : '').trim());
      const month = ensureMonth(monthKey);
      if (!month[section]._map) month[section]._map = new Map();
      if (!month[section]._map.has(rowKey)) {
        month[section]._map.set(rowKey, { date: String(entry && entry.shift_code ? entry.shift_code : '').trim(), cells: Array(machineList.length).fill(''), _order: rowIndex });
      }
      const row = month[section]._map.get(rowKey);
      if (cidx >= 0) row.cells[cidx] = String(entry && entry.employee_name ? entry.employee_name : '').trim();
    });

    Object.entries(months).forEach(([monthKey, month]) => {
      ['hard', 'soft'].forEach(section => {
        const map = month[section]._map || new Map();
        month[section].rows = Array.from(map.values()).sort((a, b) => a._order - b._order || String(a.date || '').localeCompare(String(b.date || ''), 'cs'));
        month[section].rows.forEach(row => { delete row._order; });
        delete month[section]._map;
      });
      month.notes = (month.notes || []).sort((a, b) => String(a.date || '').localeCompare(String(b.date || ''), 'cs') || String(a.person || '').localeCompare(String(b.person || ''), 'cs'));
    });

    return { months };
  }


  function defaultMachineSettingsRows() {
    return [
      { machine_key: 'FREZKY', machine_code: 'FREZKY', machine_index: '', label: 'Frezky', category: 'frezka', cycle_time: null, dress_time: null, dress_count: null, settings_json: { machine: 'FREZKY', index: '', cycle_time: '', dress_time: '', dress_count: '' } },
      { machine_key: 'TPKW01', machine_code: 'TPKW01', machine_index: '', label: 'Pračka', category: 'pracka', cycle_time: null, dress_time: null, dress_count: null, settings_json: { machine: 'TPKW01', index: '', cycle_time: '', dress_time: '', dress_count: '' } },
      { machine_key: 'TBKR01-AD', machine_code: 'TBKR01', machine_index: 'AD', label: 'TBKR01-AD', category: 'brus', cycle_time: 58.2, dress_time: 323, dress_count: 59, settings_json: { machine: 'TBKR01', index: 'AD', cycle_time: '58.2', dress_time: '323', dress_count: '59' } },
      { machine_key: 'TBKR01-AE', machine_code: 'TBKR01', machine_index: 'AE', label: 'TBKR01-AE', category: 'brus', cycle_time: 57.0, dress_time: 240, dress_count: 58, settings_json: { machine: 'TBKR01', index: 'AE', cycle_time: '57.0', dress_time: '240', dress_count: '58' } },
      { machine_key: 'TBKR01-AH', machine_code: 'TBKR01', machine_index: 'AH', label: 'TBKR01-AH', category: 'brus', cycle_time: 66.0, dress_time: 400, dress_count: 87, settings_json: { machine: 'TBKR01', index: 'AH', cycle_time: '66.0', dress_time: '400', dress_count: '87' } },
      { machine_key: 'TBKR01-AD volné', machine_code: 'TBKR01', machine_index: 'AD volné', label: 'TBKR01-AD volné', category: 'brus', cycle_time: 62.7, dress_time: 240, dress_count: 45, settings_json: { machine: 'TBKR01', index: 'AD volné', cycle_time: '62.7', dress_time: '240', dress_count: '45' } },
      { machine_key: 'TBKR01-AE volné', machine_code: 'TBKR01', machine_index: 'AE volné', label: 'TBKR01-AE volné', category: 'brus', cycle_time: 60.0, dress_time: 240, dress_count: 45, settings_json: { machine: 'TBKR01', index: 'AE volné', cycle_time: '60.0', dress_time: '240', dress_count: '45' } },
      { machine_key: 'TBKR07-AD', machine_code: 'TBKR07', machine_index: 'AD', label: 'TBKR07-AD', category: 'brus', cycle_time: 58.2, dress_time: 298, dress_count: 59, settings_json: { machine: 'TBKR07', index: 'AD', cycle_time: '58.2', dress_time: '298', dress_count: '59' } },
      { machine_key: 'TBKR07-AE', machine_code: 'TBKR07', machine_index: 'AE', label: 'TBKR07-AE', category: 'brus', cycle_time: 56.4, dress_time: 325, dress_count: 59, settings_json: { machine: 'TBKR07', index: 'AE', cycle_time: '56.4', dress_time: '325', dress_count: '59' } },
      { machine_key: 'TBKR07-AH', machine_code: 'TBKR07', machine_index: 'AH', label: 'TBKR07-AH', category: 'brus', cycle_time: 63.0, dress_time: 240, dress_count: 65, settings_json: { machine: 'TBKR07', index: 'AH', cycle_time: '63.0', dress_time: '240', dress_count: '65' } },
      { machine_key: 'TBKR07-AD volné', machine_code: 'TBKR07', machine_index: 'AD volné', label: 'TBKR07-AD volné', category: 'brus', cycle_time: 60.3, dress_time: 240, dress_count: 45, settings_json: { machine: 'TBKR07', index: 'AD volné', cycle_time: '60.3', dress_time: '240', dress_count: '45' } },
      { machine_key: 'TBKR07-AE volné', machine_code: 'TBKR07', machine_index: 'AE volné', label: 'TBKR07-AE volné', category: 'brus', cycle_time: 60.0, dress_time: 240, dress_count: 45, settings_json: { machine: 'TBKR07', index: 'AE volné', cycle_time: '60.0', dress_time: '240', dress_count: '45' } }
    ];
  }

  async function loadMachineSettings() {

    const client = getClient();
    if (!client) return [];
    try {
      const { data, error } = await client
        .from('machine_settings')
        .select('*')
        .order('category', { ascending: true })
        .order('machine_key', { ascending: true });
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      state.lastError = err;
      console.error('Supabase machine settings load failed', err);
      return [];
    }
  }

  async function saveMachineSettings(rows) {
    const client = getClient();
    if (!client) return { ok: false, reason: 'missing-client' };
    try {
      const list = Array.isArray(rows) ? rows : [];
      for (const row of list) {
        const settings = row && typeof row.settings_json === 'object' && row.settings_json !== null
          ? row.settings_json
          : (() => {
              try { return row && row.settings_json ? JSON.parse(String(row.settings_json)) : {}; }
              catch (err) { return {}; }
            })();

        const machineCode = String(row && (row.machine_code || row.machine) ? (row.machine_code || row.machine) : settings.machine || '').trim();
        const machineIndex = String(row && (row.machine_index || row.index) ? (row.machine_index || row.index) : settings.index || '').trim();
        const label = String(row && row.label ? row.label : '').trim() || (machineCode + (machineIndex ? '-' + machineIndex : ''));
        const category = String(row && row.category ? row.category : (String(machineCode).toUpperCase().startsWith('TBKR') ? 'brus' : (String(machineCode).toUpperCase().startsWith('TPKW') ? 'pracka' : 'frezka'))).trim();
        const machine_key = String(row && row.machine_key ? row.machine_key : (machineCode + (machineIndex ? '-' + machineIndex : ''))).trim();

        const cycleTime = row && row.cycle_time !== '' && row.cycle_time !== null && row.cycle_time !== undefined
          ? Number(row.cycle_time)
          : (row && row.speed !== '' && row.speed !== null && row.speed !== undefined ? Number(row.speed) : null);
        const dressTime = row && row.dress_time !== '' && row.dress_time !== null && row.dress_time !== undefined ? Number(row.dress_time) : null;
        const dressCount = row && row.dress_count !== '' && row.dress_count !== null && row.dress_count !== undefined ? parseInt(row.dress_count, 10) : null;
        const payload = {
          machine_key,
          machine_code: machineCode || null,
          machine_index: machineIndex || null,
          label,
          category,
          speed: cycleTime,
          cycle_time: cycleTime,
          dress_time: dressTime,
          dress_count: Number.isFinite(dressCount) ? dressCount : null,
          settings_json: {
            machine: machineCode,
            index: machineIndex,
            cycle_time: row && row.cycle_time !== '' && row.cycle_time !== null && row.cycle_time !== undefined ? String(row.cycle_time) : (row && row.speed !== '' && row.speed !== null && row.speed !== undefined ? String(row.speed) : ''),
            dress_time: row && row.dress_time !== '' && row.dress_time !== null && row.dress_time !== undefined ? String(row.dress_time) : '',
            dress_count: row && row.dress_count !== '' && row.dress_count !== null && row.dress_count !== undefined ? String(row.dress_count) : ''
          },
          updated_at: new Date().toISOString()
        };
        if (!payload.machine_key || !payload.label) continue;
        const { error } = await client.from('machine_settings').upsert([payload], { onConflict: 'machine_key' });
        if (error) throw error;
      }
      return { ok: true };
    } catch (err) {
      state.lastError = err;
      console.error('Supabase machine settings save failed', err);
      return { ok: false, error: err };
    }
  }

  async function loadRotationMonthEntries(monthStart) {
    const client = getClient();
    if (!client) return [];
    try {
      const { data, error } = await client
        .from('rotation_entries')
        .select('*')
        .eq('month_start', monthStart)
        .order('row_order', { ascending: true })
        .order('employee_name', { ascending: true });
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      state.lastError = err;
      console.error('Supabase rotation entries load failed', err);
      return [];
    }
  }

  async function saveRotationMonthEntries(monthStart, label, rows) {
    const client = getClient();
    if (!client) return { ok: false, reason: 'missing-client' };
    try {
      const monthRow = {
        month_start: monthStart,
        label: String(label || '').trim() || null,
        updated_at: new Date().toISOString()
      };
      const { error: monthErr } = await client.from('rotation_months').upsert([monthRow], { onConflict: 'month_start' });
      if (monthErr) throw monthErr;

      const { error: deleteErr } = await client.from('rotation_entries').delete().eq('month_start', monthStart);
      if (deleteErr) throw deleteErr;

      const payloadRows = (Array.isArray(rows) ? rows : []).map((row, idx) => ({
        month_start: monthStart,
        employee_name: String(row && row.employee_name ? row.employee_name : '').trim(),
        target_machine: String(row && row.target_machine ? row.target_machine : '').trim() || null,
        assignment_type: String(row && row.assignment_type ? row.assignment_type : 'work').trim(),
        shift_code: String(row && row.shift_code ? row.shift_code : '').trim() || null,
        note: String(row && row.note ? row.note : '').trim() || null,
        row_order: Number.isFinite(Number(row && row.row_order)) ? Number(row.row_order) : idx
      })).filter(row => row.employee_name || row.target_machine || row.shift_code || row.note || row.assignment_type !== 'work');
      if (payloadRows.length) {
        const { error: insertErr } = await client.from('rotation_entries').insert(payloadRows);
        if (insertErr) throw insertErr;
      }
      return { ok: true };
    } catch (err) {
      state.lastError = err;
      console.error('Supabase rotation entries save failed', err);
      return { ok: false, error: err };
    }
  }

  function init() {
    if (state.ready) return refreshPublicData();
    if (!hasClient()) {
      return null;
    }
    return refreshPublicData();
  }

  window.RotationSupabaseBridge = {
    init,
    refreshPublicData,
    sendGomokuWin,
    loadRotationState,
    saveRotationState,
    loadGomokuWins,
    loadMachineSettings,
    saveMachineSettings,
    loadRotationMonthEntries,
    saveRotationMonthEntries,
    getBridgeText,
    getCanteenStatus,
    getState: () => ({ ...state })
  };

  window.getSupabaseAnnouncement = getBridgeText;
  window.getSupabaseCanteenStatus = getCanteenStatus;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    setTimeout(init, 0);
  }
})();
