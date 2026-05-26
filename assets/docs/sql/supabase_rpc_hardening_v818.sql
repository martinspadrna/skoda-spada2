-- RaK v1.5(818): Vercel/GitHub clean static-root hotfix.
-- DB se ve v818 nemění.
-- Vercel konfigurační soubory jsou odstraněné, aby deploy nepadal na neplatném/root output nastavení z repozitáře.
-- Pokud Vercel dál padá, zkontrolovat uložené Project Settings ve Vercel dashboardu: Framework Other, Build Command prázdný, Output Directory prázdný nebo '.', Install Command prázdný.

select count(*) as expected_rpc_count
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('rak_save_rotation_state','rak_save_machine_settings','rak_record_game_stat_delta');

select count(*) as remaining_delete_policies
from pg_policies
where schemaname = 'public'
  and tablename in ('game_stats','game_sessions','game_invites')
  and cmd = 'DELETE';
