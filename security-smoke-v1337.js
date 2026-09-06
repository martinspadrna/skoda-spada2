const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const includes = (source, value, message) => assert(source.includes(value), message);
const excludes = (source, value, message) => assert(!source.includes(value), message);

const indexHtml = read('index.html');
const vercel = JSON.parse(read('vercel.json'));
const serviceWorker = read('sw.js');
const bridge = read('supabase-bridge.js');
const adminUnlock = read('app-admin-unlock.js');
const adminMenu = read('app-menu.js');
const adminRotation = read('admin-rotation.js');
const excelImport = read('app-excel-import.js');
const calendarApi = read('api/rotation-absence-calendar.js');
const calendarEdge = read('supabase/functions/rak-absence-calendar/index.ts');
const adminAuthApi = read('api/_admin-auth.js');
const adminUsersApi = read('api/admin-users.js');
const adminUsersEdge = read('supabase/functions/rak-admin-users/index.ts');
const migrationDir = path.join(root, 'supabase', 'migrations');
const migrations = fs.readdirSync(migrationDir).filter((name) => name.endsWith('.sql')).sort();
const migrationText = migrations.map((name) => read(path.join('supabase', 'migrations', name))).join('\n');

assert(migrations.length >= 5, 'Chybi kompletni sada bezpecnostnich migraci.');
includes(migrationText, "'enforced', true", 'Posledni migrace musi vynutit Supabase Auth.');
includes(migrationText, 'rak_admin_save_rotation_v2', 'Rozpis musi mit revizni admin RPC.');
includes(migrationText, "jsonb_object_keys(current_row.payload -> 'months')", 'Zaloha rozpisu musi pocitat mesice platnou PostgreSQL funkci.');
includes(migrationText, 'rak_admin_settings_backups', 'Zalohy nastaveni musi byt v chranene tabulce.');
includes(migrationText, 'v_machine_key text', 'Bezpecny zapis nastaveni nesmi kolidovat se sloupcem machine_key.');
includes(migrationText, 'rak_owner_delete_settings_backup_v2', 'Hlavni admin musi mit chranene mazani zaloh nastaveni.');
includes(migrationText, 'revoke select, insert, update, delete on table public.bug_reports', 'Reporty nesmi mit primy verejny pristup.');
includes(migrationText, 'revoke insert, update, delete on table', 'Provozni tabulky musi mit odebrane prime zapisy.');

includes(adminAuthApi, "'/rest/v1/rpc/rak_admin_context'", 'Server musi overovat i odvolani admin relace.');
includes(adminUsersApi, 'admin_users_endpoint_moved', 'Stary Vercel endpoint spravy adminu musi byt vyradit.');
includes(adminUsersEdge, 'withSupabase({ auth: "user" }', 'Sprava adminu musi overovat prihlaseneho uzivatele.');
includes(adminUsersEdge, 'owner.role !== "owner"', 'Sprava adminu musi vyzadovat hlavniho admina.');
includes(adminUsersEdge, 'ctx.supabaseAdmin.auth.admin.createUser', 'Auth uzivatele smi vytvaret jen interni Edge Function.');
includes(adminUsersEdge, 'change-owner-password', 'Hlavni admin musi mit chranenou zmenu vlastniho hesla.');
includes(adminUsersEdge, 'change-own-password', 'Nizsi admin musi mit samostatnou serverovou zmenu vlastniho hesla.');
includes(adminUsersEdge, 'list-admin-directory', 'Nizsi admin smi nacist pouze bezpecny adresar spravcu.');
includes(adminUsersEdge, '.select("account_id,display_name,role,enabled")', 'Adresar spravcu nesmi vracet hesla, tokeny ani interni ID uzivatelu.');
includes(adminUsersEdge, 'String(verified && verified.user && verified.user.id || "") !== String(owner.user_id || "")', 'Zmena vlastniho hesla musi overit, ze prihlaseni patri aktualnimu adminovi.');
includes(adminUsersEdge, 'invalid_current_password', 'Zmena hesla musi overit soucasne heslo.');
includes(adminUsersEdge, 'ALLOWED_ORIGIN = "https://skoda-spada.vercel.app"', 'Sprava adminu smi povolit jen produkcni origin.');
includes(calendarApi, "'Cache-Control', 'no-store, max-age=0'", 'ICS odpoved se nesmi cachovat.');
includes(calendarApi, 'calendar_endpoint_moved', 'Stary Vercel endpoint musi byt vyradenit bez prace se soukromymi klici.');
excludes(calendarApi, 'process.env.RAK_ABSENCE_ICS_URL', 'Soukrome ICS URL nema byt ve Vercel vrstve.');
includes(calendarEdge, 'Deno.env.get("RAK_ABSENCE_ICS_URL")', 'ICS URL musi byt jen v Supabase secrets.');
includes(calendarEdge, 'withSupabase({ auth: "user" }', 'Edge Function musi overovat prihlaseneho uzivatele.');
includes(calendarEdge, 'ctx.supabase.rpc("rak_admin_context")', 'Edge Function musi overovat aktivni admin opravneni.');
includes(calendarEdge, 'ALLOWED_ORIGIN = "https://skoda-spada.vercel.app"', 'CORS smi povolit jen produkcni aplikaci.');
includes(calendarEdge, 'headers["access-control-allow-origin"] = ALLOWED_ORIGIN', 'CORS odpoved musi vracet jen povoleny origin.');
includes(calendarEdge, 'parsed.hostname === CALENDAR_HOST', 'ICS presmerovani musi zustat na povolenem Google hostu.');
includes(calendarEdge, 'MAX_ICS_BYTES', 'Edge Function musi omezit velikost soukromeho kalendare.');
excludes(calendarApi, 'Access-Control-Allow-Origin', 'Soukrome ICS API nesmi mit verejne CORS.');
excludes(calendarEdge, 'access-control-allow-origin": "*"', 'Soukroma Edge Function nesmi mit verejne CORS.');
excludes(calendarApi, '31eea99edff1771be15ba877f7c2f5b1371e0a742ad9d54fca526d41eafa5995', 'Soukrome ID kalendare nesmi byt ve zdrojich.');
includes(adminRotation, "'/functions/v1/rak-absence-calendar'", 'Admin klient musi volat Edge Function primo.');
includes(adminRotation, 'apikey: String(window.SUPABASE_CONFIG', 'Prime volani Edge Function musi poslat verejny projektovy klic.');

includes(bridge, 'persistSession: true', 'Admin Auth relace musi prezit restart aplikace.');
includes(bridge, 'rak_admin_touch_device', 'Admin relace musi evidovat zarizeni.');
includes(bridge, 'rak_admin_write_audit_v2', 'Historie zmen musi pouzivat chraneny audit.');
includes(bridge, "select('revision')", 'Prvni zapis rozpisu musi nacist aktualni online revizi.');
includes(bridge, 'rak_owner_delete_settings_backup_v2', 'Mazani zalohy musi jit pres owner-only RPC.');
includes(bridge, 'rak_submit_bug_report_v2', 'Report musi jit pres omezeny RPC.');
includes(adminUnlock, 'rakAdminRestoreSecureSessionForActiveAccount', 'Start aplikace musi obnovit bezpecnou admin relaci.');
excludes(adminUnlock, 'RAK_OWNER_ADMIN_PASSWORD', 'Klient nesmi obsahovat konstantu s heslem hlavniho admina.');
excludes(bridge, 'p_admin_pin', 'Klient nesmi volat starsi PINove admin RPC.');
excludes(bridge, 'getAdminPinForWrite', 'Klient nesmi sestavovat PIN pro online zapisy.');
includes(adminMenu, 'rakAdminLoadChangeLog', 'Historie zmen se musi nacitat z online auditu.');
includes(adminMenu, 'delete-full-settings-backup', 'Zalohy nastaveni musi mit ovladani pro smazani.');
includes(adminUnlock, 'rakAdminChangeOwnerPassword', 'Spravci musi mit ovladani pro zmenu hesla hlavniho admina.');
includes(adminRotation, "syncRotationFromSupabase('discard-draft')", 'Online nacteni musi explicitne potvrdit zahozeni rozepsaneho navrhu.');

includes(serviceWorker, "url.pathname.startsWith('/api/')", 'Service worker musi obejit cache pro API.');
includes(serviceWorker, '/\\bno-store\\b|\\bprivate\\b/', 'Service worker musi respektovat privatni cache hlavicky.');
includes(serviceWorker, '{ ignoreSearch: false }', 'Runtime cache nesmi ignorovat parametry URL.');

assert((indexHtml.match(/integrity="sha384-/g) || []).length >= 3, 'Externi knihovny musi mit SRI.');
assert((indexHtml.match(/cdn\.jsdelivr\.net\/npm\//g) || []).length === 3, 'Externi knihovny musi byt pripnute na konkretni verze.');
const globalHeaders = (vercel.headers || []).find((rule) => rule.source === '/(.*)');
const csp = globalHeaders && (globalHeaders.headers || []).find((header) => header.key === 'Content-Security-Policy');
assert(csp && csp.value.includes("frame-ancestors 'none'"), 'Vercel musi posilat CSP s ochranou proti framingu.');

includes(excelImport, 'RAK_EXCEL_IMPORT_MAX_FILE_BYTES', 'Excel import musi mit limit souboru.');
includes(excelImport, 'RAK_EXCEL_IMPORT_MAX_CELLS_PER_SHEET', 'Excel import musi mit limit bunek.');

console.log(JSON.stringify({ ok: true, mode: 'security-smoke-v1337', migrations: migrations.length, sriScripts: 3 }));
