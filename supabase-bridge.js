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
      };
      const { error } = await client.from('gomoku_wins').insert([payload]);
      if (error) throw error;
      return { ok: true };
    } catch (err) {
      state.lastError = err;
      console.warn('Supabase win insert failed', err);
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
