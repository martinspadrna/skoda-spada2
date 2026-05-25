-- RaK v1.5(828) / Hotfix: online Piškvorky rollback restriktivních policies z v826.
-- Důvod: po omezení přímých INSERT/UPDATE na game_invites/game_sessions přestaly fungovat online Piškvorky.
-- Tento hotfix NEMĚNÍ data. Vrací kompatibilitu online pozvánek/session, aby hra znovu fungovala.

-- Provedeno v DB:
-- drop policy if exists game_invites_insert_rpc_only_v826 on public.game_invites;
-- drop policy if exists game_invites_update_rpc_only_v826 on public.game_invites;
-- drop policy if exists game_sessions_insert_rpc_only_v826 on public.game_sessions;
-- drop policy if exists game_sessions_update_rpc_only_v826 on public.game_sessions;

-- Kontrola: restriktivní v826 policies pro online Piškvorky mají být 0.
select count(*) as remaining_restrictive_online_ttt_policies
from pg_policies
where schemaname = 'public'
  and policyname in (
    'game_invites_insert_rpc_only_v826',
    'game_invites_update_rpc_only_v826',
    'game_sessions_insert_rpc_only_v826',
    'game_sessions_update_rpc_only_v826'
  );

-- Kontrola: public DELETE policies u herních tabulek mají dál zůstat odstraněné.
select count(*) as remaining_public_delete_policies
from pg_policies
where schemaname = 'public'
  and tablename in ('game_stats','game_sessions','game_invites')
  and cmd = 'DELETE';

-- Kontrola: game_stats restriktivní policies z v824 zůstávají, protože běžné score už má RPC cestu.
select count(*) as game_stats_rpc_only_policies
from pg_policies
where schemaname = 'public'
  and tablename = 'game_stats'
  and policyname in ('game_stats_insert_rpc_only_v824','game_stats_update_rpc_only_v824');

-- Očekávaný stav po hotfixu:
-- remaining_restrictive_online_ttt_policies = 0
-- remaining_public_delete_policies = 0
-- game_stats_rpc_only_policies = 2

-- Další bezpečný krok:
-- 1) reálně otestovat online Piškvorky na dvou mobilech,
-- 2) teprve potom znovu řešit sessions/invites RPC hardening,
-- 3) nepřidávat restriktivní INSERT/UPDATE policies na game_invites/game_sessions bez potvrzeného smoke testu.
