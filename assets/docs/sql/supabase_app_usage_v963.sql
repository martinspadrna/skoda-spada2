-- RaK v.1.5 (963) – anonymní přehled připojení v administraci
-- Bez ukládání surové IP: ukládá se jen hash IP, anonymní podpis zařízení a profil z appky.

create extension if not exists pgcrypto;

create table if not exists public.app_usage_devices (
  device_key text primary key,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  open_count integer not null default 0,
  account_number text,
  player_name text,
  app_version text,
  route text,
  user_agent text,
  device_info jsonb not null default '{}'::jsonb,
  last_event_type text,
  last_ip_hash text,
  updated_at timestamptz not null default now(),
  constraint app_usage_devices_device_key_len check (char_length(device_key) between 8 and 96)
);

create table if not exists public.app_usage_events (
  id bigserial primary key,
  device_key text not null,
  seen_at timestamptz not null default now(),
  event_type text not null default 'app-open',
  account_number text,
  player_name text,
  app_version text,
  route text,
  user_agent text,
  device_info jsonb not null default '{}'::jsonb,
  ip_hash text
);

create index if not exists app_usage_devices_last_seen_idx on public.app_usage_devices (last_seen_at desc);
create index if not exists app_usage_devices_player_idx on public.app_usage_devices (player_name);
create index if not exists app_usage_events_seen_idx on public.app_usage_events (seen_at desc);
create index if not exists app_usage_events_device_seen_idx on public.app_usage_events (device_key, seen_at desc);

alter table public.app_usage_devices enable row level security;
alter table public.app_usage_events enable row level security;

revoke all on public.app_usage_devices from anon, authenticated;
revoke all on public.app_usage_events from anon, authenticated;
revoke all on sequence public.app_usage_events_id_seq from anon, authenticated;

drop function if exists public.rak_usage_ip_hash();
create or replace function public.rak_usage_ip_hash()
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  headers jsonb := '{}'::jsonb;
  raw_headers text;
  ip text := '';
begin
  raw_headers := current_setting('request.headers', true);
  if raw_headers is not null and length(raw_headers) > 1 then
    begin
      headers := raw_headers::jsonb;
    exception when others then
      headers := '{}'::jsonb;
    end;
  end if;
  ip := coalesce(
    split_part(headers->>'x-forwarded-for', ',', 1),
    headers->>'cf-connecting-ip',
    headers->>'x-real-ip',
    ''
  );
  ip := btrim(ip);
  if ip = '' then
    return null;
  end if;
  return encode(digest(ip || ':rak-v963-ip-hash', 'sha256'), 'hex');
end;
$$;

drop function if exists public.rak_log_app_usage(text,text,text,text,text,text,text,jsonb);
create or replace function public.rak_log_app_usage(
  p_device_key text,
  p_event_type text default 'app-open',
  p_account_number text default null,
  p_player_name text default null,
  p_app_version text default null,
  p_route text default null,
  p_user_agent text default null,
  p_device_info jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_device_key text := left(nullif(btrim(coalesce(p_device_key, '')), ''), 96);
  v_event_type text := left(coalesce(nullif(btrim(p_event_type), ''), 'app-open'), 80);
  v_account text := left(nullif(btrim(coalesce(p_account_number, '')), ''), 80);
  v_player text := left(nullif(btrim(coalesce(p_player_name, '')), ''), 160);
  v_version text := left(nullif(btrim(coalesce(p_app_version, '')), ''), 80);
  v_route text := left(nullif(btrim(coalesce(p_route, '')), ''), 220);
  v_user_agent text := left(nullif(coalesce(p_user_agent, ''), ''), 1000);
  v_device_info jsonb := coalesce(p_device_info, '{}'::jsonb);
  v_ip_hash text := public.rak_usage_ip_hash();
  v_now timestamptz := now();
begin
  if v_device_key is null or char_length(v_device_key) < 8 then
    return jsonb_build_object('ok', false, 'reason', 'missing-device-key');
  end if;

  insert into public.app_usage_devices as d (
    device_key, first_seen_at, last_seen_at, open_count,
    account_number, player_name, app_version, route, user_agent, device_info,
    last_event_type, last_ip_hash, updated_at
  ) values (
    v_device_key, v_now, v_now, 1,
    v_account, v_player, v_version, v_route, v_user_agent, v_device_info,
    v_event_type, v_ip_hash, v_now
  )
  on conflict (device_key) do update set
    last_seen_at = excluded.last_seen_at,
    open_count = public.app_usage_devices.open_count + 1,
    account_number = coalesce(excluded.account_number, public.app_usage_devices.account_number),
    player_name = coalesce(excluded.player_name, public.app_usage_devices.player_name),
    app_version = coalesce(excluded.app_version, public.app_usage_devices.app_version),
    route = coalesce(excluded.route, public.app_usage_devices.route),
    user_agent = coalesce(excluded.user_agent, public.app_usage_devices.user_agent),
    device_info = coalesce(excluded.device_info, public.app_usage_devices.device_info),
    last_event_type = excluded.last_event_type,
    last_ip_hash = coalesce(excluded.last_ip_hash, public.app_usage_devices.last_ip_hash),
    updated_at = v_now;

  insert into public.app_usage_events (
    device_key, seen_at, event_type, account_number, player_name,
    app_version, route, user_agent, device_info, ip_hash
  ) values (
    v_device_key, v_now, v_event_type, v_account, v_player,
    v_version, v_route, v_user_agent, v_device_info, v_ip_hash
  );

  delete from public.app_usage_events where seen_at < now() - interval '120 days';

  return jsonb_build_object('ok', true, 'device_key', v_device_key, 'seen_at', v_now, 'ip_hash_saved', v_ip_hash is not null);
end;
$$;

drop function if exists public.rak_admin_get_app_usage(text, integer);
create or replace function public.rak_admin_get_app_usage(
  p_admin_pin text,
  p_limit integer default 80
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit integer := greatest(1, least(coalesce(p_limit, 80), 200));
  v_now timestamptz := now();
  v_devices jsonb;
  v_events jsonb;
  v_summary jsonb;
begin
  -- Parametr zustava jen kvuli kompatibilite stareho SQL navodu. Opravneni
  -- overuje serverova Supabase Auth relace, nikdy hodnota z klienta.
  perform private.rak_require_admin(false);

  select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb)
  into v_devices
  from (
    select
      device_key,
      account_number,
      player_name,
      app_version,
      route,
      user_agent,
      device_info,
      first_seen_at,
      last_seen_at,
      open_count,
      last_event_type,
      last_ip_hash,
      floor(extract(epoch from (v_now - last_seen_at)) / 60)::integer as minutes_since_seen
    from public.app_usage_devices
    order by last_seen_at desc
    limit v_limit
  ) x;

  select coalesce(jsonb_agg(to_jsonb(e)), '[]'::jsonb)
  into v_events
  from (
    select
      id,
      device_key,
      seen_at,
      event_type,
      account_number,
      player_name,
      app_version,
      route
    from public.app_usage_events
    order by seen_at desc
    limit least(v_limit, 80)
  ) e;

  select jsonb_build_object(
    'device_count', (select count(*) from public.app_usage_devices),
    'active_24h', (select count(*) from public.app_usage_devices where last_seen_at >= v_now - interval '24 hours'),
    'active_7d', (select count(*) from public.app_usage_devices where last_seen_at >= v_now - interval '7 days'),
    'events_24h', (select count(*) from public.app_usage_events where seen_at >= v_now - interval '24 hours'),
    'generated_at', v_now
  ) into v_summary;

  return jsonb_build_object('ok', true, 'summary', v_summary, 'devices', v_devices, 'events', v_events);
end;
$$;

grant execute on function public.rak_log_app_usage(text,text,text,text,text,text,text,jsonb) to anon, authenticated;
revoke all on function public.rak_admin_get_app_usage(text, integer) from public, anon;
grant execute on function public.rak_admin_get_app_usage(text, integer) to authenticated;
grant execute on function public.rak_usage_ip_hash() to anon, authenticated;
