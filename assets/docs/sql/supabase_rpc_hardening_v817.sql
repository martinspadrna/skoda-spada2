-- RaK v1.5(817): Vercel/GitHub root-static deploy hotfix.
-- DB se ve v817 nemění.
-- Kontrola aktuálního bezpečnostního stavu po předchozích fázích:

select count(*) as expected_rpc_count
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('rak_save_rotation_state','rak_save_machine_settings','rak_record_game_stat_delta');

select count(*) as remaining_public_delete_policies
from pg_policies
where schemaname = 'public'
  and tablename in ('game_stats','game_sessions','game_invites')
  and cmd = 'DELETE';

-- Očekávání po v817:
-- expected_rpc_count = 3
-- remaining_public_delete_policies = 0
-- Vercel deploy: žádný package.json, žádný buildCommand, žádný outputDirectory, žádná public/scripts složka.
