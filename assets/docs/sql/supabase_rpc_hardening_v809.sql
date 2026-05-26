-- RaK v1.5(809) – návrh bezpečného Supabase hardening kroku.
-- Stav: RPC funkce byly v rámci Fáze 2C aplikované do Supabase a ověřené přes pg_proc.
-- Přímé write/delete policies zatím zůstávají beze změny kvůli bezpečnému rollbacku.
--
-- Cíl:
-- 1) Zavést úzké RPC pro rotation_state a machine_settings.
-- 2) Až po ověření v appce postupně vypnout veřejné DELETE policies.
-- 3) Přímé veřejné write policies vypínat až v dalším potvrzeném kroku.

create or replace function public.rak_save_rotation_state(
  p_key text,
  p_payload jsonb,
  p_meta jsonb default '{}'::jsonb
)
returns public.rotation_state
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.rotation_state;
begin
  if p_key is null or trim(p_key) <> 'main' then
    raise exception 'invalid rotation_state key';
  end if;

  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'invalid rotation_state payload';
  end if;

  if pg_column_size(p_payload) > 2500000 then
    raise exception 'rotation_state payload too large';
  end if;

  insert into public.rotation_state(key, payload, meta, updated_at)
  values ('main', p_payload, coalesce(p_meta, '{}'::jsonb), now())
  on conflict (key)
  do update set
    payload = excluded.payload,
    meta = excluded.meta,
    updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.rak_save_machine_settings(p_rows jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  saved_count integer := 0;
  v_machine_key text;
  v_category text;
  v_label text;
begin
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' then
    raise exception 'machine_settings payload must be an array';
  end if;

  if jsonb_array_length(p_rows) > 80 then
    raise exception 'too many machine_settings rows';
  end if;

  for item in select value from jsonb_array_elements(p_rows)
  loop
    if jsonb_typeof(item) <> 'object' then
      raise exception 'invalid machine_settings row';
    end if;

    v_machine_key := trim(coalesce(item->>'machine_key', ''));
    v_category := trim(coalesce(item->>'category', ''));
    v_label := trim(coalesce(item->>'label', ''));

    if v_machine_key = '' or length(v_machine_key) > 120 then
      raise exception 'invalid machine_key';
    end if;
    if v_category not in ('brus', 'frezka', 'pracka', 'fhb_target') then
      raise exception 'invalid category';
    end if;
    if v_label = '' or length(v_label) > 160 then
      raise exception 'invalid label';
    end if;
    if pg_column_size(coalesce(item->'settings_json', '{}'::jsonb)) > 24000 then
      raise exception 'settings_json too large';
    end if;

    insert into public.machine_settings(
      machine_key,
      machine_code,
      machine_index,
      label,
      category,
      speed,
      cycle_time,
      dress_time,
      dress_count,
      settings_json,
      updated_at
    )
    values (
      v_machine_key,
      nullif(trim(coalesce(item->>'machine_code', '')), ''),
      nullif(trim(coalesce(item->>'machine_index', '')), ''),
      v_label,
      v_category,
      nullif(item->>'speed', '')::numeric,
      nullif(item->>'cycle_time', '')::numeric,
      nullif(item->>'dress_time', '')::numeric,
      nullif(item->>'dress_count', '')::integer,
      coalesce(item->'settings_json', '{}'::jsonb),
      now()
    )
    on conflict (machine_key)
    do update set
      machine_code = excluded.machine_code,
      machine_index = excluded.machine_index,
      label = excluded.label,
      category = excluded.category,
      speed = excluded.speed,
      cycle_time = excluded.cycle_time,
      dress_time = excluded.dress_time,
      dress_count = excluded.dress_count,
      settings_json = excluded.settings_json,
      updated_at = now();

    saved_count := saved_count + 1;
  end loop;

  return jsonb_build_object('ok', true, 'saved_count', saved_count);
end;
$$;

grant execute on function public.rak_save_rotation_state(text, jsonb, jsonb) to anon, authenticated;
grant execute on function public.rak_save_machine_settings(jsonb) to anon, authenticated;

-- Fáze 2D po ověření klienta v reálné appce:
-- drop policy if exists game_stats_delete_public on public.game_stats;
-- drop policy if exists game_sessions_delete_public on public.game_sessions;
-- drop policy if exists game_invites_delete_public on public.game_invites;
