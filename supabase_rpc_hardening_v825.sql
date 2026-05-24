-- RaK v1.5(825) / Fáze 2E-I: RPC scaffold pro game_invites a game_sessions.
-- Stav DB: funkce byly aplikované přes Supabase migraci v825.
-- Tohle je nedestruktivní krok: přímé INSERT/UPDATE policies u game_invites/game_sessions zatím zůstávají kvůli kompatibilitě.

-- Ověření očekávaných RPC funkcí:
select count(*) as expected_rpc_count
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'rak_save_rotation_state',
    'rak_save_machine_settings',
    'rak_record_game_stat_delta',
    'rak_save_game_ui_settings',
    'rak_create_game_invite_session',
    'rak_save_game_session_by_invite_code'
  );

-- Ověření, že přímý public DELETE u herních tabulek zůstává odstraněný:
select count(*) as remaining_public_delete_policies
from pg_policies
where schemaname = 'public'
  and tablename in ('game_stats', 'game_sessions', 'game_invites')
  and cmd = 'DELETE';

-- Ověření, že game_stats má restriktivní write policies z v824:
select count(*) as game_stats_restrictive_write_policies
from pg_policies
where schemaname = 'public'
  and tablename = 'game_stats'
  and policyname in ('game_stats_insert_rpc_only_v824', 'game_stats_update_rpc_only_v824');

-- Další ruční fáze až po mobilním smoke testu:
-- 1) vytvořit/ověřit RPC pro accept invite, pokud bude potřeba.
-- 2) až po ověření bez fallbacků přidat restriktivní policies pro game_sessions/game_invites INSERT/UPDATE.
-- 3) nezužovat policies dřív, než online Piškvorky/pozvánky projdou reálným testem.
