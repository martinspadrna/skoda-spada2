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
      { machine_key: 'FZK01', label: 'Frézka 01', category: 'frezka', speed: null, settings_json: { machine: '', index: '', dress_time: '', dress_count: '' } },
      { machine_key: 'FZK02', label: 'Frézka 02', category: 'frezka', speed: null, settings_json: { machine: '', index: '', dress_time: '', dress_count: '' } },
      { machine_key: 'TPKW01', label: 'Pračka TPKW01', category: 'pracka', speed: null, settings_json: { machine: '', index: '', dress_time: '', dress_count: '' } },
      { machine_key: 'TPKW02', label: 'Pračka TPKW02', category: 'pracka', speed: null, settings_json: { machine: '', index: '', dress_time: '', dress_count: '' } },

      { machine_key: 'TBKR01_AD', label: 'TBKR01 / AD', category: 'brus', speed: 58.2, settings_json: { machine: 'TBKR01', index: 'AD', dress_time: 323, dress_count: 59 } },
      { machine_key: 'TBKR01_ADV', label: 'TBKR01 / ADV', category: 'brus', speed: 62.7, settings_json: { machine: 'TBKR01', index: 'ADV', dress_time: 240, dress_count: 45 } },
      { machine_key: 'TBKR01_AE', label: 'TBKR01 / AE', category: 'brus', speed: 57.0, settings_json: { machine: 'TBKR01', index: 'AE', dress_time: 240, dress_count: 58 } },
      { machine_key: 'TBKR01_AEV', label: 'TBKR01 / AEV', category: 'brus', speed: 60.0, settings_json: { machine: 'TBKR01', index: 'AEV', dress_time: 240, dress_count: 45 } },
      { machine_key: 'TBKR01_AH', label: 'TBKR01 / AH', category: 'brus', speed: 66.0, settings_json: { machine: 'TBKR01', index: 'AH', dress_time: 400, dress_count: 87 } },

      { machine_key: 'TBKR07_AD', label: 'TBKR07 / AD', category: 'brus', speed: 58.2, settings_json: { machine: 'TBKR07', index: 'AD', dress_time: 298, dress_count: 59 } },
      { machine_key: 'TBKR07_ADV', label: 'TBKR07 / ADV', category: 'brus', speed: 60.3, settings_json: { machine: 'TBKR07', index: 'ADV', dress_time: 240, dress_count: 45 } },
      { machine_key: 'TBKR07_AE', label: 'TBKR07 / AE', category: 'brus', speed: 56.4, settings_json: { machine: 'TBKR07', index: 'AE', dress_time: 325, dress_count: 59 } },
      { machine_key: 'TBKR07_AEV', label: 'TBKR07 / AEV', category: 'brus', speed: 60.0, settings_json: { machine: 'TBKR07', index: 'AEV', dress_time: 240, dress_count: 45 } },
      { machine_key: 'TBKR07_AH', label: 'TBKR07 / AH', category: 'brus', speed: 63.0, settings_json: { machine: 'TBKR07', index: 'AH', dress_time: 240, dress_count: 65 } }
    ];
  }

  function buildRotationProjection(rotation) {
    const months = rotation && rotation.months && typeof rotation.months === 'object' ? rotation.months : {};
    const monthRows = [];
    const entryRows = [];
    const now = new Date().toISOString();

    Object.entries(months).forEach(([monthKey, month]) => {
      const monthStart = monthKeyToMonthStart(monthKey);
      if (!monthStart || !month || typeof month !== 'object') return;
      monthRows.push({
        month_start: monthStart,
        label: String(monthKey || '').trim() || null,
        updated_at: now
      });

      const pushRow = (section, row, rowIndex, machineName, cellIndex, cellValue) => {
        const value = String(cellValue || '').trim();
        if (!value) return;
        entryRows.push({
          month_start: monthStart,
          employee_name: value,
          target_machine: String(machineName || '').trim() || null,
          assignment_type: String(section || 'work').trim(),
          shift_code: String(row && row.date ? row.date : '').trim() || null,
          note: row && row.text ? String(row.text).trim() : null,
          row_order: (rowIndex * 100) + cellIndex,
          updated_at: now
        });
      };

      const hard = month.hard && Array.isArray(month.hard.rows) ? month.hard.rows : [];
      const hardMachines = month.hard && Array.isArray(month.hard.machines) ? month.hard.machines : [];
      hard.forEach((row, rowIndex) => {
        const cells = Array.isArray(row && row.cells) ? row.cells : [];
        cells.forEach((cellValue, cellIndex) => pushRow('hard', row, rowIndex, hardMachines[cellIndex], cellIndex, cellValue));
      });

      const soft = month.soft && Array.isArray(month.soft.rows) ? month.soft.rows : [];
      const softMachines = month.soft && Array.isArray(month.soft.machines) ? month.soft.machines : [];
      soft.forEach((row, rowIndex) => {
        const cells = Array.isArray(row && row.cells) ? row.cells : [];
        cells.forEach((cellValue, cellIndex) => pushRow('soft', row, rowIndex, softMachines[cellIndex], cellIndex, cellValue));
      });

      const notes = Array.isArray(month.notes) ? month.notes : [];
      notes.forEach((note, rowIndex) => {
        const person = String(note && note.person ? note.person : '').trim();
        if (!person) return;
        entryRows.push({
          month_start: monthStart,
          employee_name: person,
          target_machine: String(note && note.code ? note.code : '').trim() || null,
          assignment_type: 'note',
          shift_code: String(note && note.date ? note.date : '').trim() || null,
          note: String(note && note.text ? note.text : '').trim() || null,
          row_order: 9000 + rowIndex,
          updated_at: now
        });
      });
    });

    return { monthRows, entryRows };
  }

  async function saveRotationProjection(rotation) {
    const client = getClient();
    if (!client) return { ok: false, reason: 'missing-client' };
    try {
      const { monthRows, entryRows } = buildRotationProjection(rotation);
      if (monthRows.length) {
        const { error: monthErr } = await client.from('rotation_months').upsert(monthRows, { onConflict: 'month_start' });
        if (monthErr) throw monthErr;
      }
      if (monthRows.length) {
        const monthStarts = [...new Set(monthRows.map(row => row.month_start))];
        if (monthStarts.length) {
          const { error: deleteErr } = await client.from('rotation_entries').delete().in('month_start', monthStarts);
          if (deleteErr) throw deleteErr;
        }
      }
      if (entryRows.length) {
        for (let i = 0; i < entryRows.length; i += 500) {
          const chunk = entryRows.slice(i, i + 500);
          const { error: insertErr } = await client.from('rotation_entries').insert(chunk);
          if (insertErr) throw insertErr;
        }
      }
      return { ok: true, months: monthRows.length, entries: entryRows.length };
    } catch (err) {
      state.lastError = err;
      console.error('Supabase rotation projection save failed', err);
      return { ok: false, error: err };
    }
  }

  async function seedFromLocalSnapshot(rotation, machineRows) {
    const client = getClient();
    if (!client) return { ok: false, reason: 'missing-client' };
    try {
      const [monthCountRes, entryCountRes, machineCountRes] = await Promise.all([
        client.from('rotation_months').select('month_start', { count: 'exact', head: true }),
        client.from('rotation_entries').select('id', { count: 'exact', head: true }),
        client.from('machine_settings').select('id', { count: 'exact', head: true })
      ]);
      const monthCount = Number(monthCountRes && monthCountRes.count) || 0;
      const entryCount = Number(entryCountRes && entryCountRes.count) || 0;
      const machineCount = Number(machineCountRes && machineCountRes.count) || 0;

      const payload = rotation && rotation.months ? rotation : null;
      if (!payload) return { ok: false, reason: 'missing-rotation' };

      let seeded = false;
      if (!machineCount) {
        const machines = Array.isArray(machineRows) && machineRows.length ? machineRows : defaultMachineSettingsRows();
        const machineResult = await saveMachineSettings(machines);
        if (!machineResult || machineResult.ok !== true) throw (machineResult && machineResult.error ? machineResult.error : new Error('Seed machine settings failed.'));
        seeded = true;
      }

      if (!monthCount || !entryCount) {
        const rotationResult = await saveRotationState(payload, { source: 'seed' });
        if (!rotationResult || rotationResult.ok !== true) throw (rotationResult && rotationResult.error ? rotationResult.error : new Error('Seed rotation failed.'));
        seeded = true;
      }

      return {
        ok: true,
        seeded,
        months: monthCount,
        entries: entryCount,
        machines: machineCount
      };
    } catch (err) {
      state.lastError = err;
      console.error('Supabase seed failed', err);
      return { ok: false, error: err };
    }
  }

  async function loadRotationState() {
    const client = getClient();
    if (!client) return null;
    try {
      const { data, error } = await client.from('rotation_state').select('*').eq('key', 'main').maybeSingle();
      if (error) throw error;
      const row = data || null;
      const payload = row ? (row.payload || row.rotation || null) : null;
      const normalizedPayload = payload && typeof payload === 'object' && !Array.isArray(payload) && Object.keys(payload).length ? payload : null;
      if (row && normalizedPayload) {
        return {
          id: row.key || 'main',
          payload: normalizedPayload,
          updatedAt: row.updated_at || null,
          meta: row.meta || null
        };
      }

      const [monthRowsRes, entryRowsRes] = await Promise.all([
        client.from('rotation_months').select('*').order('month_start', { ascending: true }),
        client.from('rotation_entries').select('*').order('month_start', { ascending: true }).order('row_order', { ascending: true })
      ]);
      const monthRows = monthRowsRes && !monthRowsRes.error ? (Array.isArray(monthRowsRes.data) ? monthRowsRes.data : []) : [];
      const entryRows = entryRowsRes && !entryRowsRes.error ? (Array.isArray(entryRowsRes.data) ? entryRowsRes.data : []) : [];
      const reconstructed = rebuildRotationFromTables(monthRows, entryRows);
      return reconstructed && reconstructed.months && Object.keys(reconstructed.months).length ? {
        id: row && row.key ? row.key : 'main',
        payload: reconstructed,
        updatedAt: row && row.updated_at ? row.updated_at : null,
        meta: row && row.meta ? row.meta : null,
        source: 'tables'
      } : null;
    } catch (err) {
      state.lastError = err;
      console.warn('Supabase rotation load failed', err);
      return null;
    }
  }

  async function saveRotationState(rotation, meta) {
    const client = getClient();
    if (!client) return { ok: false, reason: 'missing-client' };
    try {
      const payload = rotation && typeof rotation === 'object' ? rotation : null;
      const row = {
        key: 'main',
        payload,
        meta: meta && typeof meta === 'object' ? meta : {},
        updated_at: new Date().toISOString()
      };
      const { error } = await client.from('rotation_state').upsert([row], { onConflict: 'key' });
      if (error) throw error;

      const verify = await client.from('rotation_state').select('*').eq('key', 'main').maybeSingle();
      if (verify && verify.error) throw verify.error;
      const verifiedRow = verify && verify.data ? verify.data : null;

      const projection = payload ? await saveRotationProjection(payload) : { ok: true, months: 0, entries: 0 };
      if (!projection || projection.ok !== true) throw (projection && projection.error ? projection.error : new Error('Rotation projection save failed.'));

      return {
        ok: true,
        verified: !!verifiedRow,
        updatedAt: verifiedRow && verifiedRow.updated_at ? verifiedRow.updated_at : row.updated_at,
        months: projection.months || 0,
        entries: projection.entries || 0
      };
    } catch (err) {
      state.lastError = err;
      console.warn('Supabase rotation save failed', err);
      return { ok: false, error: err };
    }
  }

  async function loadGomokuWins(limit) {
    const client = getClient();
    if (!client) return [];
    try {
      const res = await client
        .from('gomoku_wins')
        .select('player_name,difficulty,moves,elapsed_ms,elapsed_text,x_moves,o_moves,created_at,app_version')
        .order('created_at', { ascending: false })
        .limit(Math.max(1, Math.min(100, Number(limit) || 20)));
      if (res && res.error) throw res.error;
      return Array.isArray(res && res.data) ? res.data : [];
    } catch (err) {
      state.lastError = err;
      console.error('Supabase win list load failed', err);
      return [];
    }
  }

  async function refreshPublicData() {
    const client = getClient();
    if (!client) return null;

    try {
      const announcementsRes = await client.from('announcements').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(5);

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

  async function sendGomokuWin(entry) {
    const client = getClient();
    if (!client) return { ok: false, reason: 'missing-client' };
    try {
      const payload = {
        player_name: String(entry && entry.name ? entry.name : '').trim(),
        difficulty: String(entry && entry.difficulty ? entry.difficulty : '').trim(),
        moves: Number(entry && entry.totalMoves ? entry.totalMoves : 0) || 0,
        app_version: String(window.APP_VERSION || '').trim(),
        elapsed_ms: Number(entry && entry.elapsedMs ? entry.elapsedMs : 0) || 0,
        elapsed_text: String(entry && entry.elapsedText ? entry.elapsedText : '').trim(),
        x_moves: Number(entry && entry.xMoves ? entry.xMoves : 0) || 0,
        o_moves: Number(entry && entry.oMoves ? entry.oMoves : 0) || 0,
      };
      const { error } = await client.from('gomoku_wins').insert([payload]);
      if (error) throw error;
      try {
        if (typeof window.loadTTTLeaderboard === 'function') {
          setTimeout(() => {
            try { window.loadTTTLeaderboard(true); } catch (err) { console.warn(err); }
          }, 150);
        }
      } catch (err) {
        console.warn(err);
      }
      return { ok: true, savedCount: 1 };
    } catch (err) {
      state.lastError = err;
      console.error('Supabase win insert failed', err);
      return { ok: false, error: err };
    }
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
        const payload = {
          machine_key: String(row && row.machine_key ? row.machine_key : '').trim(),
          label: String(row && row.label ? row.label : '').trim(),
          category: String(row && row.category ? row.category : 'general').trim(),
          speed: row && row.speed !== '' && row.speed !== null && row.speed !== undefined ? Number(row.speed) : null,
          settings_json: row && typeof row.settings_json === 'object' && row.settings_json !== null
            ? row.settings_json
            : (() => {
                try { return row && row.settings_json ? JSON.parse(String(row.settings_json)) : {}; }
                catch (err) { return {}; }
              })(),
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
