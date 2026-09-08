#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error('[maintenance-smoke] ' + message); };

const app = read('app.js');
const sw = read('sw.js');
const externalDeps = read('rak-external-deps.js');
const maintenance = read('rak-maintenance-v1516.js');
const styles = read('styles-maintenance.css');
const shiftReport = read('rak-shift-report.js');
const brus157 = read('brusy-fhb-v157.js');
const brusBase = read('brusy-fhb-correction.js');
const migration = read('supabase/migrations/20260907191622_rak_v1516_security_performance_cleanup.sql');

// Boot / cleanup
assert(app.includes('window.ensureRakAdminModulesLoaded'), 'chybí lazy admin loader');
assert(app.includes('"admin-rotation.js"') && app.includes('"admin-daymods.js"'), 'chybí lazy admin editory');
assert(app.includes('"admin-machine-tasks.js"') && app.includes('"admin-food.js"') && app.includes('"admin-reports.js"') && app.includes('"admin-service-usage.js"'), 'admin-only moduly nejsou v lazy balíku');
assert(app.includes('!lazyMenuFiles.includes(file) && !lazyAdminFiles.includes(file)'), 'běžný start neodfiltruje menu i admin moduly');
assert(app.includes('window.ensureRakMenuModulesLoaded'), 'chybí lazy loader menu Více');
assert(app.includes('const eagerDeferredFiles = deferredFiles.filter'), 'menu se neodfiltruje z běžného startu');
assert(app.includes('"app-menu.js"') && app.includes('"rak-admin-menu-fix.js"'), 'lazy menu nemá kompletní soubory');
assert(app.includes('await Promise.all(eagerDeferredFiles.map(loadScript))'), 'start stále stahuje celý deferred balík');
assert(app.includes('"rak-external-deps.js"'), 'chybí runtime loader externích knihoven');
assert(!app.includes('rak-dev-fixes-v1512.js'), 'stále se načítá starý provozní patch');
assert(!app.includes('rak-menu-report-order-v1513.js'), 'stále se načítá starý menu patch');
assert(!app.includes('rak-dashboard-shift-label-v1515.js'), 'stále se načítá starý dashboard patch');
assert(!app.includes('brusy-fhb-v158.js'), 'stále se načítá starý brus patch');
assert(!app.includes('new MutationObserver(() => removeGames())'), 'Games cleanup stále používá globální observer');

// Externí exportní knihovny
assert(externalDeps.includes("global: 'XLSX'"), 'lazy loader nezná XLSX');
assert(externalDeps.includes("global: 'JSZip'"), 'lazy loader nezná JSZip');
assert(externalDeps.includes('script.integrity = dep.integrity'), 'lazy loader nepoužívá SRI');
assert(externalDeps.includes("window.ensureRakExternalDependency = ensure"), 'lazy loader nezveřejňuje ensure API');
assert(externalDeps.includes("input.id !== 'excelFile'"), 'Excel file input nemá lazy fallback');

// Menu visual stability
assert(styles.includes('[data-admin-action="vacation-report"]{order:1;}'), 'Report dovolené nemá pevné pořadí');
assert(styles.includes('[data-rak-shift-report-entry="1"]{order:2;}'), 'Report směny nemá pevné pořadí');

// Shift report regression contracts
assert(maintenance.includes("const REPORT_SEPARATOR = '__________';"), 'report nemá oddělovače');
assert(maintenance.includes("' · Ranní'"), 'report/dashboard nemá plný název Ranní');
assert(maintenance.includes("' · Noční'"), 'report/dashboard nemá plný název Noční');
assert(maintenance.includes("value = '  - ' + nok[1] + ' NoK'"), 'NoK není ve formátu řádku');
assert(maintenance.includes("const INDEX_ORDER = Object.freeze({ AG: 0, AE: 0, AF: 1, AD: 1, AH: 2 })"), 'indexy nemají zelená→modrá→oranžová');
assert(maintenance.includes("'whatsapp://send?text='"), 'WhatsApp nepoužívá iOS-safe scheme');
assert(shiftReport.includes("const DRAFT_STORAGE_PREFIX = 'rak:shiftReportDraft:v1';"), 'chybí draft reportu');

// Calendar / dashboard
assert(maintenance.includes("return ['A', 'B', 'C', 'D'];"), 'první ranní není napříč všemi směnami');
assert(maintenance.includes('findFirstMorningShiftDateInMonth'), 'chybí helper první ranní');
assert(maintenance.includes("'$1Ranní'"), 'personifikovaná karta neexpanduje R');
assert(maintenance.includes("'$1Noční'"), 'personifikovaná karta neexpanduje N');

// Brusy FHB
assert(brus157.includes("const SPINDLES = ['C1', 'C2'];"), 'Brusy FHB nemají nezávislé C1/C2');
assert(brus157.includes("return side === 'right' ? 'left' : 'right';"), 'Brusy FHB neotáčí stranu programu');
assert(brus157.includes('chooseCenterCorrection'), 'Brusy FHB necílí na střed KPO');
assert(maintenance.includes('pruneBlankBrusResults'), 'prázdné FHB vstupy nejsou chráněné');
assert(brusBase.includes('const MIN_SAMPLES = 3;'), 'kalibrace nemá minimálně 3 vzorky');
assert(brusBase.includes('function median(values)'), 'kalibrace nepoužívá robustní medián');
assert(maintenance.includes('reliabilityLevel'), 'kalibrace nemá indikaci spolehlivosti');

// PWA
assert(!/CORE\s*=\s*\[[\s\S]*rak-login-crab/.test(sw), 'login obrázky jsou stále v precache');
assert(sw.includes('cacheFirstImage'), 'obrázky nemají cache-first');
assert(sw.includes('staleWhileRevalidateVersioned'), 'verzované moduly nemají SWR');
assert(sw.includes("url.pathname.startsWith('/api/')"), 'API není vyřazené z PWA cache');

// DB hardening source-of-truth
assert(migration.includes("revoke execute on function %s from anon"), 'admin RPC nemají anon hardening');
assert(migration.includes('rak_admin_audit_log_user_id_idx'), 'chybí FK indexy');
assert(migration.includes('rak_machine_settings_authenticated_read_v3'), 'machine_settings nemají sloučenou policy');
assert(migration.includes('revoke select, insert, update, delete on table public.game_invites'), 'odstraněné Hry stále mají veřejnou tabulku');

console.log('[maintenance-smoke] OK');
