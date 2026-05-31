#!/usr/bin/env node
// RaK 1.2 (1.34) – smoke test přehledu připojení.
const fs = require('fs');
const path = require('path');

function read(file) {
  return fs.readFileSync(path.join(__dirname, file), 'utf8');
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const bridge = read('supabase-bridge.js');
const ui = read('ui.js') + '\n' + read('app-runtime-guards.js') + '\n' + read('app-health-audits.js') + '\n' + read('app-postload-audits.js') + '\n' + read('app-pwa-connectivity.js') + '\n' + read('games-engine.js') + '\n' + read('games-profile.js') + '\n' + read('appearance-theme.js') + '\n' + read('admin-service-usage.js') + '\n' + read('admin-rotation.js') + '\n' + read('app-navigation.js') + '\n' + read('app-bottom-nav.js') + '\n' + read('app-menu.js') + '\n' + read('app-actions.js') + '\n' + read('app-boot-selftest.js') + '\n' + read('app-rotation-sync.js') + '\n' + read('app-excel-import.js') + '\n' + read('app-rotation-controls.js') + '\n' + read('app-admin-unlock.js') + '\n' + read('app-home-boot.js') + '\n' + read('app-init.js');
const sql = read('assets/docs/sql/supabase_app_usage_v963.sql');

assert(bridge.includes('recordAppUsage'), 'RotationSupabaseBridge.recordAppUsage chybí');
assert(bridge.includes('loadAppUsage'), 'RotationSupabaseBridge.loadAppUsage chybí');
assert(bridge.includes('rak_usage_presence_touch'), 'RPC rak_usage_presence_touch není napojená');
assert(bridge.includes('rak_usage_presence_admin'), 'RPC rak_usage_presence_admin není napojená');
assert(bridge.includes('APP_USAGE_MIN_INTERVAL_MS'), 'App usage throttle chybí');
assert(ui.includes('buildAdminUsageHtml'), 'Admin UI přehledu připojení chybí');
assert(ui.includes('buildAdminUsageGroups'), 'Admin přehled musí seskupovat zařízení podle jména/profilu');
assert(ui.includes('adminUsageDeviceList'), 'Admin přehled musí ukazovat zařízení uvnitř jedné složky jména');
assert(ui.includes('data-admin-action="open-usage"'), 'Tlačítko Přehled připojení chybí');
assert(ui.includes("openAppMenu('admin-usage')"), 'Admin usage routing chybí');
assert(!ui.includes('Zapsat mě teď'), 'Testovací tlačítko Zapsat mě teď nemá být viditelné');
assert(!ui.includes('<b>Stránka:</b>'), 'Přehled připojení už nemá ukazovat stránku');
assert(ui.includes('Viewport '), 'Displej má ukazovat viewport/rozlišení, ne časovou zónu');
assert(sql.includes('create table if not exists public.app_usage_devices'), 'SQL app_usage_devices chybí');
assert(sql.includes('create table if not exists public.app_usage_events'), 'SQL app_usage_events chybí');
assert(sql.includes('returns jsonb'), 'SQL RPC návrat JSONB chybí');
assert(sql.includes('last_ip_hash'), 'SQL hash IP pole chybí');
assert(!sql.includes(' ip text not null'), 'SQL nesmí ukládat surovou IP jako povinný sloupec');

console.log('app-usage-smoke-v963 OK');
