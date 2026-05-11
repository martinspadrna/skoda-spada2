(function () {
  const SUPABASE_CONFIG = window.SUPABASE_CONFIG || {};
  const state = {
    client: null,
    ready: false,
    announcements: [],
    rotationSnapshot: null,
    machineSettingsSnapshot: [],
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

  const LOCAL_STATE_KEY = 'rotace_supabase_local_state_v1';
  const LOCAL_QUEUE_KEY = 'rotace_supabase_queue_v1';
  const LOCAL_ANNOUNCEMENTS_KEY = 'rotace_supabase_announcements_v1';
  const LOCAL_MACHINE_SETTINGS_KEY = 'rotace_supabase_machine_settings_v1';
  let flushPromise = null;

  function safeReadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed === undefined ? fallback : parsed;
    } catch (err) {
      return fallback;
    }
  }

  function safeWriteJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      return false;
    }
  }

  function saveLocalSnapshot(rotation, machineSettingsRows) {
    const existing = readLocalSnapshot() || {};
    const hasRotation = !!(rotation && typeof rotation === 'object');
    const hasMachineSettings = Array.isArray(machineSettingsRows) && machineSettingsRows.length > 0;
    const nextRotation = hasRotation ? rotation : (existing.rotation || null);
    const nextMachineSettings = hasMachineSettings
      ? machineSettingsRows
      : (Array.isArray(existing.machineSettingsRows) ? existing.machineSettingsRows : []);
    const nextAnnouncements = Array.isArray(state.announcements) && state.announcements.length
      ? state.announcements
      : (Array.isArray(existing.announcements) ? existing.announcements : []);
    const snapshot = {
      updatedAt: Date.now(),
      version: window.APP_VERSION || existing.version || '',
      rotation: nextRotation,
      machineSettingsRows: nextMachineSettings,
      announcements: nextAnnouncements
    };
    if (existing && typeof existing.updatedAt === 'number' && existing.updatedAt > snapshot.updatedAt && !hasRotation && !hasMachineSettings) {
      snapshot.updatedAt = existing.updatedAt;
      snapshot.version = existing.version || snapshot.version;
    }
    safeWriteJson(LOCAL_STATE_KEY, snapshot);
    if (hasMachineSettings || (Array.isArray(existing.machineSettingsRows) && existing.machineSettingsRows.length)) {
      safeWriteJson(LOCAL_MACHINE_SETTINGS_KEY, snapshot.machineSettingsRows);
    }
    return snapshot;
  }

  function readLocalSnapshot() {
    const snapshot = safeReadJson(LOCAL_STATE_KEY, null);
    if (snapshot && typeof snapshot === 'object') return snapshot;
    return null;
  }

  function readQueue() {
    const queue = safeReadJson(LOCAL_QUEUE_KEY, []);
    return Array.isArray(queue) ? queue : [];
  }

  function writeQueue(queue) {
    safeWriteJson(LOCAL_QUEUE_KEY, Array.isArray(queue) ? queue : []);
  }

  function enqueueTask(task) {
    const queue = readQueue();
    queue.push(Object.assign({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, queuedAt: new Date().toISOString() }, task || {}));
    writeQueue(queue);
    return queue[queue.length - 1];
  }

  function isLikelyOfflineError(err) {
    const msg = String(err && (err.message || err.statusText || err.code) ? (err.message || err.statusText || err.code) : err || '').toLowerCase();
    return !navigator.onLine || msg.includes('fetch') || msg.includes('network') || msg.includes('offline') || msg.includes('failed to fetch') || msg.includes('load failed');
  }

  async function upsertMachineSettingsDirect(client, rows) {
    let savedCount = 0;
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
      savedCount += 1;
    }
    return savedCount;
  }

  async function upsertRotationStateDirect(client, rotation, meta) {
    const payload = rotation && typeof rotation === 'object' ? rotation : null;
    const row = {
      key: 'main',
      payload,
      meta: meta && typeof meta === 'object' ? meta : {},
      updated_at: new Date().toISOString()
    };
    const { error } = await client.from('rotation_state').upsert([row], { onConflict: 'key' });
    if (error) throw error;
    return row;
  }

  async function upsertRotationMonthEntriesDirect(client, monthStart, label, rows) {
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
    let inserted = 0;
    if (payloadRows.length) {
      const { error: insertErr } = await client.from('rotation_entries').insert(payloadRows);
      if (insertErr) throw insertErr;
      inserted = payloadRows.length;
    }
    return { months: 1, entries: inserted };
  }

  async function upsertGomokuWinDirect(client, entry) {
    const payload = {
      player_name: String(entry && entry.name ? entry.name : '').trim(),
      difficulty: String(entry && entry.difficulty ? entry.difficulty : '').trim(),
      moves: Number(entry && entry.totalMoves ? entry.totalMoves : 0) || 0,
      app_version: String(window.APP_VERSION || '').trim(),
      elapsed_ms: Number(entry && entry.elapsedMs ? entry.elapsedMs : 0) || 0,
      elapsed_text: String(entry && entry.elapsedText ? entry.elapsedText : '').trim(),
      x_moves: Number(entry && entry.xMoves ? entry.xMoves : 0) || 0,
      o_moves: Number(entry && entry.oMoves ? entry.oMoves : 0) || 0
    };
    const { data, error } = await client.from('gomoku_wins').insert([payload]).select('*');
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }


  async function loadGameInviteByCode(client, code) {
    const inviteCode = String(code || '').trim().toUpperCase();
    if (!inviteCode) return { ok: false, error: new Error('Chybí kód pozvánky.') };
    const { data, error } = await client.from('game_invites').select('*').eq('invite_code', inviteCode).maybeSingle();
    if (error) throw error;
    return { ok: true, invite: data || null };
  }

  async function createGameInviteDirect(client, payload) {
    const inviteCode = String(payload && payload.code ? payload.code : '').trim().toUpperCase();
    if (!inviteCode) throw new Error('Chybí kód pozvánky.');
    const inviterAccountNumber = String(payload && payload.inviterAccountNumber ? payload.inviterAccountNumber : '').trim() || null;
    const boardState = payload && payload.boardState && typeof payload.boardState === 'object' ? payload.boardState : { board: Array(180).fill(''), turn: 'X', status: 'waiting' };
    const inviteRow = {
      game_type: 'gomoku',
      inviter_account_number: inviterAccountNumber,
      invitee_account_number: null,
      invite_code: inviteCode,
      status: 'pending',
      expires_at: null,
      payload: payload && payload.payload && typeof payload.payload === 'object' ? payload.payload : {}
    };
    const { data: inviteData, error: inviteErr } = await client.from('game_invites').insert([inviteRow]).select('*').maybeSingle();
    if (inviteErr) throw inviteErr;
    const sessionRow = {
      game_type: 'gomoku',
      invite_id: inviteData && inviteData.id ? inviteData.id : null,
      player_x_account_number: inviterAccountNumber,
      player_o_account_number: null,
      winner_account_number: null,
      status: 'waiting',
      board_state: boardState,
      move_history: [],
      updated_at: new Date().toISOString()
    };
    const { data: sessionData, error: sessionErr } = await client.from('game_sessions').insert([sessionRow]).select('*').maybeSingle();
    if (sessionErr) throw sessionErr;
    return { invite: inviteData || null, session: sessionData || null };
  }

  async function acceptGameInviteDirect(client, code, inviteeAccountNumber) {
    const inviteCode = String(code || '').trim().toUpperCase();
    const invitee = String(inviteeAccountNumber || '').trim() || null;
    const loaded = await loadGameInviteByCode(client, inviteCode);
    if (!loaded.invite) throw new Error('Pozvánka nenalezena.');
    const invite = loaded.invite;
    const { data: sessionData, error: sessionLookupErr } = await client.from('game_sessions').select('*').eq('invite_id', invite.id).maybeSingle();
    if (sessionLookupErr) throw sessionLookupErr;
    const nextInvite = {
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      invitee_account_number: invitee
    };
    const { data: updatedInvite, error: inviteUpdErr } = await client.from('game_invites').update(nextInvite).eq('id', invite.id).select('*').maybeSingle();
    if (inviteUpdErr) throw inviteUpdErr;
    const boardState = sessionData && sessionData.board_state && typeof sessionData.board_state === 'object' ? sessionData.board_state : { board: Array(180).fill(''), turn: 'X', status: 'active' };
    boardState.status = 'active';
    boardState.acceptedAt = new Date().toISOString();
    const sessionRow = {
      game_type: 'gomoku',
      invite_id: invite.id,
      player_x_account_number: invite.inviter_account_number || null,
      player_o_account_number: invitee,
      winner_account_number: null,
      status: 'active',
      board_state: boardState,
      move_history: Array.isArray(sessionData && sessionData.move_history) ? sessionData.move_history : [],
      updated_at: new Date().toISOString()
    };
    const { data: updatedSession, error: sessionUpdErr } = await client.from('game_sessions').upsert([Object.assign({ id: sessionData && sessionData.id ? sessionData.id : undefined }, sessionRow)], { onConflict: 'invite_id' }).select('*').maybeSingle();
    if (sessionUpdErr) throw sessionUpdErr;
    return { invite: updatedInvite || invite, session: updatedSession || sessionData || null };
  }

  async function loadGameSessionByInviteCodeDirect(client, code) {
    const loaded = await loadGameInviteByCode(client, code);
    if (!loaded.invite) return { ok: false, invite: null, session: null };
    const { data: sessionData, error: sessionErr } = await client.from('game_sessions').select('*').eq('invite_id', loaded.invite.id).maybeSingle();
    if (sessionErr) throw sessionErr;
    return { ok: true, invite: loaded.invite, session: sessionData || null };
  }

  async function saveGameSessionByInviteCodeDirect(client, code, payload) {
    const loaded = await loadGameInviteByCode(client, code);
    if (!loaded.invite) throw new Error('Pozvánka nenalezena.');
    const { data: sessionData, error: sessionErr } = await client.from('game_sessions').select('*').eq('invite_id', loaded.invite.id).maybeSingle();
    if (sessionErr) throw sessionErr;
    const boardState = payload && typeof payload === 'object' ? payload : {};
    const sessionRow = {
      game_type: 'gomoku',
      invite_id: loaded.invite.id,
      player_x_account_number: sessionData && sessionData.player_x_account_number ? sessionData.player_x_account_number : loaded.invite.inviter_account_number || null,
      player_o_account_number: sessionData && sessionData.player_o_account_number ? sessionData.player_o_account_number : loaded.invite.invitee_account_number || null,
      winner_account_number: boardState.winnerAccountNumber || sessionData && sessionData.winner_account_number || null,
      status: boardState.status || sessionData && sessionData.status || 'active',
      board_state: boardState,
      move_history: Array.isArray(boardState.moveHistory) ? boardState.moveHistory : (Array.isArray(sessionData && sessionData.move_history) ? sessionData.move_history : []),
      updated_at: new Date().toISOString(),
      finished_at: boardState.gameOver ? new Date().toISOString() : (sessionData && sessionData.finished_at ? sessionData.finished_at : null)
    };
    const { data: updatedSession, error: updErr } = await client.from('game_sessions').upsert([Object.assign({ id: sessionData && sessionData.id ? sessionData.id : undefined }, sessionRow)], { onConflict: 'invite_id' }).select('*').maybeSingle();
    if (updErr) throw updErr;
    return { ok: true, session: updatedSession || null, status: sessionRow.status };
  }

  async function flushPendingWrites() {
    if (flushPromise) return flushPromise;
    flushPromise = (async () => {
      const client = getClient();
      if (!client || !navigator.onLine) return { ok: false, reason: 'offline-or-missing-client', remaining: readQueue().length };

      const queue = readQueue();
      if (!queue.length) return { ok: true, flushed: 0, remaining: 0 };

      let flushed = 0;
      const remaining = [];
      for (let i = 0; i < queue.length; i += 1) {
        const task = queue[i];
        try {
          if (task.type === 'rotation_state') {
            await upsertRotationStateDirect(client, task.rotation, task.meta);
            flushed += 1;
          } else if (task.type === 'machine_settings') {
            await upsertMachineSettingsDirect(client, task.rows);
            flushed += 1;
          } else if (task.type === 'rotation_month_entries') {
            await upsertRotationMonthEntriesDirect(client, task.monthStart, task.label, task.rows);
            flushed += 1;
          } else if (task.type === 'gomoku_win') {
            await upsertGomokuWinDirect(client, task.entry);
            flushed += 1;
          } else {
            remaining.push(task);
          }
        } catch (err) {
          if (isLikelyOfflineError(err)) {
            remaining.push(task, ...queue.slice(i + 1));
            break;
          }
          console.warn('Supabase queued sync failed', err);
          remaining.push(task, ...queue.slice(i + 1));
          break;
        }
      }
      writeQueue(remaining);
      return { ok: true, flushed, remaining: remaining.length };
    })().finally(() => {
      flushPromise = null;
    });
    return flushPromise;
  }

  async function enqueueAndMaybeFlush(task) {
    enqueueTask(task);
    if (navigator.onLine) {
      void flushPendingWrites();
    }
    return { ok: true, queued: true, remaining: readQueue().length };
  }

  async function seedFromLocalSnapshot(rotation, machineSettingsRows) {
    saveLocalSnapshot(rotation, machineSettingsRows);
    if (!navigator.onLine || !getClient()) {
      enqueueTask({ type: 'rotation_state', rotation, meta: { source: 'local-seed' } });
      if (Array.isArray(machineSettingsRows) && machineSettingsRows.length) {
        enqueueTask({ type: 'machine_settings', rows: machineSettingsRows });
      }
      return { ok: true, queued: true, seeded: true };
    }
    try {
      const client = getClient();
      await upsertRotationStateDirect(client, rotation, { source: 'local-seed' });
      if (Array.isArray(machineSettingsRows) && machineSettingsRows.length) {
        await upsertMachineSettingsDirect(client, machineSettingsRows);
      }
      await flushPendingWrites();
      return { ok: true, seeded: true, queued: false };
    } catch (err) {
      console.warn('Supabase seed from local snapshot failed', err);
      enqueueTask({ type: 'rotation_state', rotation, meta: { source: 'local-seed' } });
      if (Array.isArray(machineSettingsRows) && machineSettingsRows.length) {
        enqueueTask({ type: 'machine_settings', rows: machineSettingsRows });
      }
      return { ok: true, queued: true, seeded: true, reason: 'fallback' };
    }
  }

  async function refreshPublicData() {
    const client = getClient();
    try {
      if (client && navigator.onLine) {
        const announcementsRes = await client
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(5);

        if (announcementsRes && !announcementsRes.error) {
          state.announcements = Array.isArray(announcementsRes.data) ? announcementsRes.data : [];
          safeWriteJson(LOCAL_ANNOUNCEMENTS_KEY, state.announcements);
        }
        state.ready = true;
        state.lastError = null;
      } else {
        const cachedAnnouncements = safeReadJson(LOCAL_ANNOUNCEMENTS_KEY, []);
        if (Array.isArray(cachedAnnouncements) && cachedAnnouncements.length) {
          state.announcements = cachedAnnouncements;
        }
        state.ready = true;
      }

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
      const cachedAnnouncements = safeReadJson(LOCAL_ANNOUNCEMENTS_KEY, []);
      if (Array.isArray(cachedAnnouncements) && cachedAnnouncements.length) {
        state.announcements = cachedAnnouncements;
      }
      state.ready = true;
      return { announcements: state.announcements, cached: true };
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
    try {
      if (client && navigator.onLine) {
        const { data, error } = await client
          .from('machine_settings')
          .select('*')
          .order('category', { ascending: true })
          .order('machine_key', { ascending: true });
        if (error) throw error;
        const rows = Array.isArray(data) ? data : [];
        if (rows.length) {
          state.machineSettingsSnapshot = rows;
          saveLocalSnapshot(state.rotationSnapshot || null, rows);
          return rows;
        }
      }
    } catch (err) {
      state.lastError = err;
      console.error('Supabase machine settings load failed', err);
    }
    const cached = readLocalSnapshot();
    if (cached && Array.isArray(cached.machineSettingsRows) && cached.machineSettingsRows.length) {
      state.machineSettingsSnapshot = cached.machineSettingsRows;
      return cached.machineSettingsRows;
    }
    const defaults = defaultMachineSettingsRows();
    state.machineSettingsSnapshot = defaults;
    saveLocalSnapshot(state.rotationSnapshot || null, defaults);
    return defaults;
  }

  async function saveMachineSettings(rows) {
    const client = getClient();
    try {
      if (client && navigator.onLine) {
        const savedCount = await upsertMachineSettingsDirect(client, rows);
        state.machineSettingsSnapshot = Array.isArray(rows) ? rows : [];
        saveLocalSnapshot(state.rotationSnapshot || null, rows);
        await flushPendingWrites();
        return { ok: true, savedCount, queued: false };
      }
      return Object.assign(await enqueueAndMaybeFlush({ type: 'machine_settings', rows }), { savedCount: Array.isArray(rows) ? rows.length : 0 });
    } catch (err) {
      state.lastError = err;
      console.error('Supabase machine settings save failed', err);
      if (isLikelyOfflineError(err)) {
        return await enqueueAndMaybeFlush({ type: 'machine_settings', rows });
      }
      return { ok: false, error: err };
    }
  }

  async function loadRotationMonthEntries(monthStart) {
    const client = getClient();
    try {
      if (client && navigator.onLine) {
        const { data, error } = await client
          .from('rotation_entries')
          .select('*')
          .eq('month_start', monthStart)
          .order('row_order', { ascending: true })
          .order('employee_name', { ascending: true });
        if (error) throw error;
        return Array.isArray(data) ? data : [];
      }
    } catch (err) {
      state.lastError = err;
      console.error('Supabase rotation entries load failed', err);
    }
    return [];
  }

  async function saveRotationMonthEntries(monthStart, label, rows) {
    const client = getClient();
    try {
      if (client && navigator.onLine) {
        const summary = await upsertRotationMonthEntriesDirect(client, monthStart, label, rows);
        await flushPendingWrites();
        return { ok: true, queued: false, months: summary.months, entries: summary.entries };
      }
      return Object.assign(await enqueueAndMaybeFlush({ type: 'rotation_month_entries', monthStart, label, rows }), { months: 1, entries: Array.isArray(rows) ? rows.length : 0 });
    } catch (err) {
      state.lastError = err;
      console.error('Supabase rotation entries save failed', err);
      if (isLikelyOfflineError(err)) {
        return await enqueueAndMaybeFlush({ type: 'rotation_month_entries', monthStart, label, rows });
      }
      return { ok: false, error: err };
    }
  }

  async function loadRotationState() {
    const client = getClient();
    try {
      if (client && navigator.onLine) {
        const { data, error } = await client.from('rotation_state').select('*').eq('key', 'main').maybeSingle();
        if (error) throw error;

        const row = data || null;
        if (row && (row.payload || row.rotation)) {
          const payload = row.payload || row.rotation || null;
          state.rotationSnapshot = payload;
          saveLocalSnapshot(payload, state.machineSettingsSnapshot || []);
          return {
            id: row.key || 'main',
            payload,
            updatedAt: row.updated_at || null,
            meta: row.meta || null
          };
        }

        if (typeof loadRotationFromTables === 'function') {
          const rebuilt = await loadRotationFromTables();
          if (rebuilt && rebuilt.months && Object.keys(rebuilt.months).length) {
            state.rotationSnapshot = rebuilt;
            saveLocalSnapshot(rebuilt, state.machineSettingsSnapshot || []);
            return {
              id: row && row.key ? row.key : 'main',
              payload: rebuilt,
              updatedAt: row && row.updated_at ? row.updated_at : null,
              meta: { source: 'tables' }
            };
          }
        }
      }
    } catch (err) {
      state.lastError = err;
      console.warn('Supabase rotation load failed', err);
    }

    const snapshot = readLocalSnapshot();
    if (snapshot && snapshot.rotation) {
      state.rotationSnapshot = snapshot.rotation;
      return {
        id: 'main',
        payload: snapshot.rotation,
        updatedAt: snapshot.updatedAt || null,
        meta: { source: 'local-cache' }
      };
    }

    return null;
  }

  async function saveRotationState(rotation, meta) {
    const client = getClient();
    try {
      if (client && navigator.onLine) {
        const row = await upsertRotationStateDirect(client, rotation, meta);
        state.rotationSnapshot = rotation && typeof rotation === 'object' ? rotation : null;
        saveLocalSnapshot(state.rotationSnapshot, state.machineSettingsSnapshot || []);
        await flushPendingWrites();
        return {
          ok: true,
          queued: false,
          verified: true,
          updatedAt: row.updated_at
        };
      }
      return await enqueueAndMaybeFlush({ type: 'rotation_state', rotation, meta });
    } catch (err) {
      state.lastError = err;
      console.warn('Supabase rotation save failed', err);
      if (isLikelyOfflineError(err)) {
        return await enqueueAndMaybeFlush({ type: 'rotation_state', rotation, meta });
      }
      return { ok: false, error: err };
    }
  }

  async function loadGomokuWins(limit) {
    const client = getClient();
    if (!client || !navigator.onLine) return [];
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

  async function sendGomokuWin(entry) {
    const client = getClient();
    try {
      if (client && navigator.onLine) {
        const data = await upsertGomokuWinDirect(client, entry);
        await flushPendingWrites();
        return { ok: true, queued: false, data };
      }
      return await enqueueAndMaybeFlush({ type: 'gomoku_win', entry });
    } catch (err) {
      state.lastError = err;
      console.error('Supabase win insert failed', err);
      if (isLikelyOfflineError(err)) {
        return await enqueueAndMaybeFlush({ type: 'gomoku_win', entry });
      }
      return { ok: false, error: err };
    }
  }


  function getSyncUiStatus() {
    const cached = readLocalSnapshot();
    const hasCache = !!(cached && (cached.rotation || (Array.isArray(cached.machineSettingsRows) && cached.machineSettingsRows.length)));
    const queueLength = readQueue().length;
    const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const lastError = state.lastError || null;

    if (!online) {
      return {
        kind: 'offline',
        label: hasCache ? '🟡 Offline cache' : '🟡 Offline cache',
        detail: cached && cached.updatedAt ? ('cache ' + new Date(cached.updatedAt).toLocaleString('cs-CZ')) : 'Bez internetu',
        queued: queueLength,
        hasCache
      };
    }

    if (queueLength > 0) {
      return {
        kind: 'pending',
        label: '🟡 Offline cache',
        detail: 'Čeká na odeslání ' + queueLength + ' změn',
        queued: queueLength,
        hasCache
      };
    }

    if (lastError) {
      return {
        kind: 'error',
        label: '🔴 Nepodařilo se synchronizovat',
        detail: 'Poslední pokus selhal',
        queued: queueLength,
        hasCache
      };
    }

    return {
      kind: 'online',
      label: '🟢 Online synchronizováno',
      detail: cached && cached.updatedAt ? ('Aktualizováno ' + new Date(cached.updatedAt).toLocaleString('cs-CZ')) : 'Online',
      queued: 0,
      hasCache
    };
  }

  window.refreshPublicData = refreshPublicData;

  function init() {
    if (state.ready) return refreshPublicData();
    if (!hasClient()) {
      return refreshPublicData();
    }
    void flushPendingWrites();
    return refreshPublicData();
  }

  window.sendGomokuWin = sendGomokuWin;

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
    seedFromLocalSnapshot,
    flushPendingWrites,
    getBridgeText,
    getCanteenStatus,
    getSyncUiStatus,
    createGameInvite: async (payload) => {
      const client = getClient();
      if (!client || !navigator.onLine) return { ok: false, reason: 'offline-or-missing-client' };
      try { return Object.assign({ ok: true }, await createGameInviteDirect(client, payload)); }
      catch (err) { state.lastError = err; console.error('TTT invite create failed', err); return { ok: false, error: err }; }
    },
    acceptGameInvite: async (code, inviteeAccountNumber) => {
      const client = getClient();
      if (!client || !navigator.onLine) return { ok: false, reason: 'offline-or-missing-client' };
      try { return Object.assign({ ok: true }, await acceptGameInviteDirect(client, code, inviteeAccountNumber)); }
      catch (err) { state.lastError = err; console.error('TTT invite accept failed', err); return { ok: false, error: err }; }
    },
    loadGameSessionByInviteCode: async (code) => {
      const client = getClient();
      if (!client || !navigator.onLine) return { ok: false, reason: 'offline-or-missing-client' };
      try { return Object.assign({ ok: true }, await loadGameSessionByInviteCodeDirect(client, code)); }
      catch (err) { state.lastError = err; console.error('TTT session load failed', err); return { ok: false, error: err }; }
    },
    saveGameSessionByInviteCode: async (code, payload) => {
      const client = getClient();
      if (!client || !navigator.onLine) return { ok: false, reason: 'offline-or-missing-client' };
      try { return Object.assign({ ok: true }, await saveGameSessionByInviteCodeDirect(client, code, payload)); }
      catch (err) { state.lastError = err; console.error('TTT session save failed', err); return { ok: false, error: err }; }
    },
    getState: () => ({ ...state })
  };

  window.flushSupabaseSyncQueue = flushPendingWrites;
  window.seedSupabaseFromLocalSnapshot = seedFromLocalSnapshot;

  window.getSupabaseAnnouncement = getBridgeText;
  window.getSupabaseCanteenStatus = getCanteenStatus;
  window.getSupabaseSyncStatus = getSyncUiStatus;
  window.createGameInvite = async (payload) => window.RotationSupabaseBridge.createGameInvite(payload);
  window.acceptGameInvite = async (code, inviteeAccountNumber) => window.RotationSupabaseBridge.acceptGameInvite(code, inviteeAccountNumber);
  window.loadGameSessionByInviteCode = async (code) => window.RotationSupabaseBridge.loadGameSessionByInviteCode(code);
  window.saveGameSessionByInviteCode = async (code, payload) => window.RotationSupabaseBridge.saveGameSessionByInviteCode(code, payload);

  window.addEventListener('online', () => {
    void flushPendingWrites();
    void refreshPublicData();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    setTimeout(init, 0);
  }
})();
