-- RaK v1.5(819): kontrolní SQL beze změny DB, navazuje na hardening v812.
-- Build v819 řeší klientskou opravu přehledu otevírací doby jídelny pro nedělní přesčas.

-- RaK v.1.5 (819) / Fáze 2E-B
-- DB stav po v811: existuje RPC rak_record_game_stat_delta pro game_stats.
-- V812 je hlavně klientský smoke/diagnostický build: měří RPC pokusy, úspěchy a fallbacky.
-- Přímé INSERT/UPDATE policies zatím zůstávají kvůli kompatibilitě online her a profilů.
-- Další bezpečný krok po mobilním ověření: zúžit direct INSERT/UPDATE u game_stats.

-- Ověření očekávaných RPC funkcí:
select count(*) as expected_rak_rpc_count
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('rak_save_rotation_state','rak_save_machine_settings','rak_record_game_stat_delta');

-- Ověření, že veřejné DELETE policies zůstávají odstraněné:
select count(*) as remaining_public_game_delete_policies
from pg_policies
where schemaname = 'public'
  and tablename in ('game_stats','game_sessions','game_invites')
  and cmd = 'DELETE';
