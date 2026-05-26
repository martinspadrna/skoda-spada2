-- RaK v.1.5 (837) – Supabase keepalive RPC v2 + app_keepalive-only RLS oprava.
-- Oprava po reálné diagnostice: stará RLS chyba se po neúspěchu nesmí držet 12 hodin
-- a tabulka app_keepalive má vlastní úzké RLS/grant pravidlo jen pro keepalive.
-- Netýká se game_invites/game_sessions ani policies online Piškvorek.

create table if not exists public.app_keepalive (
  device_key text primary key,
  app_version text,
  heartbeat_at timestamptz not null default now(),
  user_agent text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.app_keepalive enable row level security;

create index if not exists app_keepalive_heartbeat_at_idx
  on public.app_keepalive (heartbeat_at desc);

create or replace function public.rak_app_keepalive(
  p_device_key text,
  p_app_version text default null,
  p_user_agent text default null,
  p_payload jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_device_key text := left(trim(coalesce(p_device_key, '')), 80);
  v_app_version text := left(coalesce(p_app_version, ''), 40);
  v_user_agent text := left(coalesce(p_user_agent, ''), 300);
  v_payload jsonb := coalesce(p_payload, '{}'::jsonb);
  v_heartbeat_at timestamptz := now();
begin
  if char_length(v_device_key) < 8 then
    raise exception using errcode = '22023', message = 'invalid_device_key';
  end if;

  if jsonb_typeof(v_payload) is distinct from 'object' then
    v_payload := '{}'::jsonb;
  end if;

  insert into public.app_keepalive (
    device_key,
    app_version,
    heartbeat_at,
    user_agent,
    payload
  ) values (
    v_device_key,
    nullif(v_app_version, ''),
    v_heartbeat_at,
    nullif(v_user_agent, ''),
    v_payload
  )
  on conflict (device_key) do update
  set app_version = excluded.app_version,
      heartbeat_at = excluded.heartbeat_at,
      user_agent = excluded.user_agent,
      payload = excluded.payload;

  return jsonb_build_object(
    'ok', true,
    'method', 'rpc',
    'heartbeat_at', v_heartbeat_at,
    'device_key', v_device_key
  );
end;
$$;

revoke all on function public.rak_app_keepalive(text, text, text, jsonb) from public;
grant execute on function public.rak_app_keepalive(text, text, text, jsonb) to anon, authenticated;

drop policy if exists app_keepalive_insert_public_v834 on public.app_keepalive;
drop policy if exists app_keepalive_update_public_v834 on public.app_keepalive;
drop policy if exists app_keepalive_insert_public_v837 on public.app_keepalive;
drop policy if exists app_keepalive_update_public_v837 on public.app_keepalive;
drop policy if exists app_keepalive_select_public_v837 on public.app_keepalive;

create policy app_keepalive_insert_public_v837
on public.app_keepalive
for insert
to anon, authenticated
with check (char_length(coalesce(device_key, '')) between 1 and 120);

create policy app_keepalive_update_public_v837
on public.app_keepalive
for update
to anon, authenticated
using (char_length(coalesce(device_key, '')) between 1 and 120)
with check (char_length(coalesce(device_key, '')) between 1 and 120);

create policy app_keepalive_select_public_v837
on public.app_keepalive
for select
to anon, authenticated
using (char_length(coalesce(device_key, '')) between 1 and 120);

grant select, insert, update on table public.app_keepalive to anon, authenticated;

comment on table public.app_keepalive is 'RaK v837: lightweight app startup heartbeat storage. RLS is scoped to app_keepalive only; game_invites/game_sessions are untouched.';
comment on function public.rak_app_keepalive(text, text, text, jsonb) is 'RaK v837: safe keepalive RPC. Validates/truncates client fields and writes only to app_keepalive. Does not touch game_invites/game_sessions.';
