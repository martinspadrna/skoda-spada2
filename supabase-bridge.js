(function () {
  const SUPABASE_CONFIG = window.SUPABASE_CONFIG || {};
  const state = {
    client: null,
    ready: false,
    announcements: [],
    canteenStatus: null,
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
    return state.canteenStatus ? {
      isOpen: !!state.canteenStatus.is_open,
      note: String(state.canteenStatus.note || '').trim(),
      updatedAt: state.canteenStatus.updated_at || null
    } : null;
  }


  function monthKeyToMonthStart(monthKey) {
    const match = /^(\d{1,2})\/(\d{2})$/.exec(String(monthKey || '').trim());
    if (!match) return null;
    const month = Math.max(1, Math.min(12, parseInt(match[1], 10) || 1));
    const year = 2000 + (parseInt(match[2], 10) || 0);
    return `${year}-${String(month).padStart(2, '0')}-01`;
  }

  function defaultMachineSettingsRows() {
    return [
      { machine_key: 'FZK01', label: 'Frézka 01', category: 'frezka', speed: null, settings_json: { cycle_time: '', cycleTime: '', wheel: '', index: '', dress_time: '', dress_count: '' } },
      { machine_key: 'FZK02', label: 'Frézka 02', category: 'frezka', speed: null, settings_json: { cycle_time: '', cycleTime: '', wheel: '', index: '', dress_time: '', dress_count: '' } },
      { machine_key: 'BRS01', label: 'Brus 01', category: 'brus', speed: null, settings_json: { cycle_time: '', cycleTime: '', wheel: '', index: '', dress_time: '', dress_count: '' } },
      { machine_key: 'PRK01', label: 'Pračka 01', category: 'pracka', speed: null, settings_json: { cycle_time: '', cycleTime: '', wheel: '', index: '', dress_time: '', dress_count: '' } }
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
      const { data, error } = await client.from('rotation_state').select('*').eq('id', 'main').limit(1);
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] || null : null;
      return row ? {
        id: row.id || 'main',
        payload: row.payload || row.rotation || null,
        updatedAt: row.updated_at || null,
        meta: row.meta || null
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
        id: 'main',
        payload,
        meta: meta && typeof meta === 'object' ? meta : {},
        updated_at: new Date().toISOString()
      };
      const { error } = await client.from('rotation_state').upsert([row], { onConflict: 'id' });
      if (error) throw error;

      const verify = await client.from('rotation_state').select('*').eq('id', 'main').limit(1);
      if (verify && verify.error) throw verify.error;
      const verifiedRow = Array.isArray(verify && verify.data) ? verify.data[0] || null : null;

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
      const [announcementsRes, canteenRes] = await Promise.all([
        client.from('announcements').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(5),
        client.from('canteen_status').select('*').order('updated_at', { ascending: false }).limit(1)
      ]);

      if (announcementsRes && !announcementsRes.error) {
        state.announcements = Array.isArray(announcementsRes.data) ? announcementsRes.data : [];
      }
      if (canteenRes && !canteenRes.error) {
        state.canteenStatus = Array.isArray(canteenRes.data) ? canteenRes.data[0] || null : null;
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

      return { announcements: state.announcements, canteenStatus: state.canteenStatus };
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
      return { ok: true, savedCount: list.length };
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
