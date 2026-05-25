-- RaK v1.5(827) / Fáze 2E-K-A: bug_reports hardening preflight.
-- Tento soubor je kontrolní a nemění data ani policies.
-- Důvod: bez ověřeného admin/RPC review toku by okamžité zúžení SELECT/UPDATE mohlo rozbít administraci bug reportů.
-- Hry, game_stats, game_sessions a game_invites se tímto krokem dál nemění.

-- 1) Ověření očekávaných RPC funkcí pro aktuální hardening:
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

-- 2) Ověření restriktivních policies pro game_stats:
select count(*) as restrictive_game_stats_write_policies
from pg_policies
where schemaname = 'public'
  and tablename = 'game_stats'
  and policyname in (
    'game_stats_insert_rpc_only_v824',
    'game_stats_update_rpc_only_v824'
  );

-- 3) Ověření restriktivních policies pro online session/pozvánky:
select count(*) as restrictive_invite_session_write_policies
from pg_policies
where schemaname = 'public'
  and tablename in ('game_invites','game_sessions')
  and policyname in (
    'game_invites_insert_rpc_only_v826',
    'game_invites_update_rpc_only_v826',
    'game_sessions_insert_rpc_only_v826',
    'game_sessions_update_rpc_only_v826'
  );

-- 4) Ověření, že přímý public DELETE u herních tabulek zůstává odstraněný:
select count(*) as remaining_public_delete_policies
from pg_policies
where schemaname = 'public'
  and tablename in ('game_stats', 'game_sessions', 'game_invites')
  and cmd = 'DELETE';

-- 5) Bug reports privacy/admin preflight:
-- Ve v827 bylo živě zjištěno, že bug_reports má 2 veřejné SELECT/UPDATE policies.
-- Zatím je nemažeme, aby se nerozbila administrace reportů bez náhradní RPC/admin cesty.
select count(*) as bug_report_select_update_policies
from pg_policies
where schemaname = 'public'
  and tablename = 'bug_reports'
  and cmd in ('SELECT','UPDATE');

-- Další bezpečný krok 2E-K-B:
-- Připravit admin/RPC review tok pro bug_reports a až po jeho ověření omezit veřejné SELECT/UPDATE.
