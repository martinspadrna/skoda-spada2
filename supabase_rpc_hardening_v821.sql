-- RaK v1.5(821) / Fáze 2E-E: kontrolní SQL po přidání RPC pro profilový vzhled.
-- Nemazat data. Přímé INSERT/UPDATE policies zatím zůstávají kvůli kompatibilitě.

-- Ověření očekávaných RPC funkcí:
select count(*) as rpc_count
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'rak_save_rotation_state',
    'rak_save_machine_settings',
    'rak_record_game_stat_delta',
    'rak_save_game_ui_settings'
  );

-- Ověření, že veřejné DELETE policies u herních tabulek zůstávají odstraněné:
select count(*) as remaining_delete_policies
from pg_policies
where schemaname = 'public'
  and tablename in ('game_stats','game_sessions','game_invites')
  and cmd = 'DELETE';
