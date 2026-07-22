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

with protected_tables(name) as (
  values
    ('announcements'), ('machine_settings'), ('rotation_state'), ('rotation_months'),
    ('rotation_entries'), ('game_accounts'), ('game_invites'), ('game_sessions'),
    ('game_stats'), ('game_ui_settings'), ('gomoku_wins'), ('bug_reports'),
    ('rotation_state_backups'), ('rak_rotation_backups_v2'),
    ('rak_admin_settings_backups'), ('rak_admin_profiles'), ('rak_admin_devices'),
    ('rak_admin_audit_log')
), legacy_functions(name) as (
  values
    ('rak_admin_save_machine_settings'), ('rak_admin_save_rotation_state'),
    ('rak_admin_list_rotation_backups'), ('rak_admin_restore_rotation_backup'),
    ('rak_save_dashboard_announcement'), ('rak_clear_dashboard_announcement'),
    ('rak_usage_presence_admin'), ('rak_admin_cleanup_expired_game_invites')
), game_write_functions(name) as (
  values
    ('rak_create_game_invite_session'), ('rak_accept_game_invite'),
    ('rak_record_game_stat_delta'), ('rak_save_game_session_by_invite_code'),
    ('rak_save_game_ui_settings'), ('rak_submit_gomoku_win_v2')
)
select jsonb_build_object(
  'admin_auth', public.rak_admin_auth_capabilities(),
  'all_target_tables_rls', (
    select bool_and(cls.relrowsecurity)
    from protected_tables target
    join pg_class cls on cls.oid = to_regclass('public.' || target.name)
  ),
  'non_select_table_grants', (
    select count(*)
    from information_schema.role_table_grants grants
    join protected_tables target on target.name = grants.table_name
    where grants.table_schema = 'public'
      and grants.grantee in ('PUBLIC', 'anon', 'authenticated')
      and grants.privilege_type <> 'SELECT'
  ),
  'legacy_rpc_execute_grants', (
    select count(*)
    from pg_proc procedure
    join pg_namespace namespace on namespace.oid = procedure.pronamespace
    join legacy_functions legacy on legacy.name = procedure.proname
    where namespace.nspname = 'public'
      and (
        has_function_privilege('public', procedure.oid, 'EXECUTE')
        or has_function_privilege('anon', procedure.oid, 'EXECUTE')
        or has_function_privilege('authenticated', procedure.oid, 'EXECUTE')
      )
  ),
  'game_write_rpcs_ready', (
    select count(distinct game_function.name)
    from game_write_functions game_function
    join pg_proc procedure on procedure.proname = game_function.name
    join pg_namespace namespace on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'public'
      and procedure.prosecdef
      and (
        has_function_privilege('anon', procedure.oid, 'EXECUTE')
        or has_function_privilege('authenticated', procedure.oid, 'EXECUTE')
      )
  ),
  'legacy_sensitive_rows', (
    select count(*)
    from public.machine_settings
    where category in ('admin_accounts_settings', 'admin_full_settings_backup')
       or machine_key = 'ADMIN_ACCOUNTS_SETTINGS'
       or machine_key like 'ADMIN_FULL_SETTINGS_BACKUP_%'
       or settings_json ->> 'stored_category' in ('admin_accounts_settings', 'admin_full_settings_backup')
       or settings_json ->> 'admin_settings_key' = 'ADMIN_ACCOUNTS_SETTINGS'
       or settings_json ->> 'admin_settings_key' like 'ADMIN_FULL_SETTINGS_BACKUP_%'
  ),
  'legacy_rotation_backups', (select count(*) from public.rotation_state_backups),
  'protected_rotation_backups', (select count(*) from public.rak_rotation_backups_v2),
  'settings_backups', (select count(*) from public.rak_admin_settings_backups),
  'owner_profiles', (select count(*) from public.rak_admin_profiles where role = 'owner' and enabled)
) as security_summary;
