-- Read-only checks after the RaK 1.337 security cutover.

select public.rak_admin_auth_capabilities() as admin_auth;

select tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename in (
    'announcements', 'machine_settings', 'rotation_state', 'rotation_months',
    'rotation_entries', 'game_accounts', 'game_invites', 'game_sessions',
    'game_stats', 'game_ui_settings', 'gomoku_wins', 'bug_reports',
    'rak_admin_profiles', 'rak_admin_devices', 'rak_admin_audit_log',
    'rak_admin_settings_backups', 'rak_rotation_backups_v2'
  )
order by tablename, policyname;

select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon', 'authenticated')
  and table_name in (
    'announcements', 'machine_settings', 'rotation_state', 'rotation_months',
    'rotation_entries', 'game_accounts', 'game_invites', 'game_sessions',
    'game_stats', 'game_ui_settings', 'gomoku_wins', 'bug_reports'
  )
order by table_name, grantee, privilege_type;

select machine_key, category
from public.machine_settings
where category in ('admin_accounts_settings', 'admin_full_settings_backup')
   or machine_key = 'ADMIN_ACCOUNTS_SETTINGS'
   or machine_key like 'ADMIN_FULL_SETTINGS_BACKUP_%';

select count(*) as settings_backups from public.rak_admin_settings_backups;
select count(*) as rotation_backups from public.rak_rotation_backups_v2;
select count(*) as audit_rows from public.rak_admin_audit_log;
