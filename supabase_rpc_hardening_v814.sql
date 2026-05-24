-- RaK v1.5(814): kontrolní SQL pro Fázi 2E-C.
-- Tento soubor je kontrolní/checkpoint, nemění data ani policies.
-- Cíl: ověřit, že RPC scaffold existuje a že veřejné DELETE policies zůstávají odstraněné.

select 'expected_rpc_count' as check_name, count(*) as value
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('rak_save_rotation_state','rak_save_machine_settings','rak_record_game_stat_delta');

select 'remaining_public_game_delete_policies' as check_name, count(*) as value
from pg_policies
where schemaname = 'public'
  and tablename in ('game_stats','game_sessions','game_invites')
  and cmd = 'DELETE';

-- Očekávání pro v814:
-- expected_rpc_count = 3
-- remaining_public_game_delete_policies = 0
-- Přímé INSERT/UPDATE policies se mají zužovat až po mobilním ověření RPC zápisů bez fallbacků.
