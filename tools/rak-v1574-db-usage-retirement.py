from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERSION_FROM = '1.5.73'
VERSION_TO = '1.5.74'
MIGRATION = 'supabase/migrations/20260910115407_remove_legacy_usage_presence_tracking.sql'


def read(name):
    return (ROOT / name).read_text(encoding='utf-8')


def write(name, content):
    path = ROOT / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding='utf-8')


def replace_once(text, old, new, label):
    count = text.count(old)
    assert count == 1, f'{label}: očekáván 1 výskyt, nalezeno {count}'
    return text.replace(old, new, 1)


# 1) Source-of-truth migration mirroring the already applied Supabase migration.
migration_path = ROOT / MIGRATION
assert not migration_path.exists(), f'{MIGRATION} už existuje'
migration_sql = '''-- RaK v1.5.74 – retire legacy Přehled připojení / usage-presence tracking.
-- Applied to Supabase as migration remove_legacy_usage_presence_tracking.
-- These objects are no longer referenced by the v1.5.73+ client.

drop function if exists public.rak_admin_service_snapshot_v2();
drop function if exists public.rak_admin_usage_presence_v2(integer);
drop function if exists public.rak_usage_presence_admin(integer);
drop function if exists public.rak_usage_presence_touch(jsonb);

drop table if exists public.app_usage_events;
drop table if exists public.app_usage_devices;
drop table if exists public.rak_usage_presence;
'''
write(MIGRATION, migration_sql)

# 2) Version bump.
app = read('app.js')
app = replace_once(app, 'const RAK_MODULE_CACHE_VERSION = "1.5.73";', 'const RAK_MODULE_CACHE_VERSION = "1.5.74";', 'app module cache version')
app = replace_once(app, 'const RAK_DEV_UPDATE_BUILD = "v1.5.73";', 'const RAK_DEV_UPDATE_BUILD = "v1.5.74";', 'app dev build')
write('app.js', app)

package = read('package.json')
package = replace_once(package, '"version": "1.5.73"', '"version": "1.5.74"', 'package version')
write('package.json', package)

sw = read('sw.js')
sw = replace_once(sw, "const CACHE_VERSION = 'v1.5.73';", "const CACHE_VERSION = 'v1.5.74';", 'service worker cache version')
write('sw.js', sw)

# 3) Permanent source guard: retired usage RPC/table names may exist only in the retirement migration.
smoke = read('tools/critical-runtime-smoke.mjs')
anchor = "assert(!stylesAdminServiceCss.includes('.dashboardSyncBadge') && !stylesAdminServiceCss.includes('.rakDevicePerfCard'), 'Admin service owner nesmí obsahovat Dashboard sync ani následující Nastavení/Výkon');\n"
assert smoke.count(anchor) == 1, 'nenalezena v1.5.73 admin-service privacy kotva'
addition = anchor + "const usageRetirementMigrationV1574 = read('supabase/migrations/20260910115407_remove_legacy_usage_presence_tracking.sql');\n" + \
"for (const retiredDbMarkerV1574 of ['rak_admin_service_snapshot_v2', 'rak_admin_usage_presence_v2', 'rak_usage_presence_admin', 'rak_usage_presence_touch', 'app_usage_events', 'app_usage_devices', 'rak_usage_presence']) {\n" + \
"  assert(usageRetirementMigrationV1574.includes('drop ') && usageRetirementMigrationV1574.includes(retiredDbMarkerV1574), 'v1.5.74 migration musí vyřazovat DB objekt ' + retiredDbMarkerV1574);\n" + \
"}\n" + \
"for (const retiredClientMarkerV1574 of ['APP_USAGE_', 'recordAppUsage', 'loadAppUsage', 'scheduleAppUsage', 'rak_usage_presence']) {\n" + \
"  assert(!supabaseBridgeJsV1567.includes(retiredClientMarkerV1574), 'Mrtvý usage tracking se vrátil do Supabase bridge: ' + retiredClientMarkerV1574);\n" + \
"}\n" + \
"assert(!fs.existsSync(path.join(root, 'app-usage-smoke-v963.js')), 'Starý app usage smoke se nesmí vrátit');\n" + \
"assert(!fs.existsSync(path.join(root, 'assets/docs/sql/supabase_app_usage_v963.sql')), 'Starý usage SQL scaffold se nesmí vrátit');\n"
smoke = smoke.replace(anchor, addition, 1)
write('tools/critical-runtime-smoke.mjs', smoke)

print('v1.5.74 source migration + permanent guard ready')
