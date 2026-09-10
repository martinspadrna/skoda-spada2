-- RaK v1.5.74 – retire legacy Přehled připojení / usage-presence tracking.
-- Applied to Supabase as migration remove_legacy_usage_presence_tracking.
-- These objects are no longer referenced by the v1.5.73+ client.

drop function if exists public.rak_admin_service_snapshot_v2();
drop function if exists public.rak_admin_usage_presence_v2(integer);
drop function if exists public.rak_usage_presence_admin(integer);
drop function if exists public.rak_usage_presence_touch(jsonb);

drop table if exists public.app_usage_events;
drop table if exists public.app_usage_devices;
drop table if exists public.rak_usage_presence;
