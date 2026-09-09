from pathlib import Path


def replace_exact(path, old, new, count=1):
    p = Path(path)
    text = p.read_text()
    actual = text.count(old)
    if actual != count:
        raise SystemExit(f'{path}: expected {count} occurrence(s), found {actual}: {old!r}')
    p.write_text(text.replace(old, new, count))

# Version bump and loader cleanup.
replace_exact('app.js', 'const RAK_MODULE_CACHE_VERSION = "1.5.46";', 'const RAK_MODULE_CACHE_VERSION = "1.5.47";')
replace_exact('app.js', 'const RAK_DEV_UPDATE_BUILD = "v1.5.46";', 'const RAK_DEV_UPDATE_BUILD = "v1.5.47";')
replace_exact('package.json', '"version": "1.5.46"', '"version": "1.5.47"')
replace_exact('sw.js', "const CACHE_VERSION = 'v1.5.46';", "const CACHE_VERSION = 'v1.5.47';")
replace_exact('app.js', '    "rak-shift-report-entry-fix.js",\n', '')

# Native Report směny entry handler in app-menu.js.
marker = 'function getRakAdminExportMetadataSnapshot(monthKey) {'
entry_code = r'''let appMenuShiftReportOpening = false;

async function appMenuOpenShiftReport() {
  if (appMenuShiftReportOpening) return false;
  appMenuShiftReportOpening = true;
  try {
    let ready = false;
    try { ready = typeof window.rakAdminCanOpenAdmin === 'function' && window.rakAdminCanOpenAdmin(); } catch (err) {}
    if (!ready && typeof window.appMenuEnsureAdminAccessFromMenu === 'function') {
      try { await window.appMenuEnsureAdminAccessFromMenu(); } catch (err) {}
      try { ready = typeof window.rakAdminCanOpenAdmin === 'function' && window.rakAdminCanOpenAdmin(); } catch (err) {}
    }
    if (!ready && typeof window.rakAdminLoadSettingsThenCheckOnce === 'function') {
      try { await window.rakAdminLoadSettingsThenCheckOnce('shift-report'); } catch (err) {}
      try { ready = typeof window.rakAdminCanOpenAdmin === 'function' && window.rakAdminCanOpenAdmin(); } catch (err) {}
    }
    if (!ready) return false;
    const body = document.getElementById('appMenuBody');
    if (body) body.dataset.rakShiftReportOpen = '1';
    if (window.RakShiftReport && typeof window.RakShiftReport.open === 'function') {
      window.RakShiftReport.open();
      return true;
    }
    return false;
  } finally {
    appMenuShiftReportOpening = false;
  }
}

function appMenuHandleShiftReportEntry(event) {
  const target = event.target && event.target.closest ? event.target.closest('[data-rak-shift-report-entry="1"]') : null;
  if (!target) return;
  event.preventDefault();
  event.stopPropagation();
  void appMenuOpenShiftReport();
}

if (!window.__rakAppMenuShiftReportBound) {
  window.__rakAppMenuShiftReportBound = true;
  document.addEventListener('click', appMenuHandleShiftReportEntry, true);
}
window.appMenuOpenShiftReport = appMenuOpenShiftReport;

'''
p = Path('app-menu.js')
text = p.read_text()
if text.count(marker) != 1:
    raise SystemExit('app-menu.js: metadata marker not unique')
if 'function appMenuOpenShiftReport()' in text:
    raise SystemExit('app-menu.js: native shift report entry already exists')
p.write_text(text.replace(marker, entry_code + marker, 1))

# Shift report owns draft retention directly.
replace_exact('rak-shift-report.js', "  const DRAFT_STORAGE_PREFIX = 'rak:shiftReportDraft:v1';\n", "  const DRAFT_STORAGE_PREFIX = 'rak:shiftReportDraft:v1';\n  const DRAFT_RETENTION_VERSION = 1;\n  const DRAFT_RETENTION_TEAM = 'D';\n")
old_draft = "  function loadDraft(){try{const saved=JSON.parse(localStorage.getItem(draftStorageKey())||'null');return saved&&saved.draft&&typeof saved.draft==='object'?saved:null;}catch(err){return null;}}\n  function saveDraft(root){try{if(root)localStorage.setItem(draftStorageKey(),JSON.stringify({updatedAt:new Date().toISOString(),draft:getDraft(root)}));}catch(err){}}\n  function clearDraft(){try{localStorage.removeItem(draftStorageKey());}catch(err){}}"
new_draft = r'''  function safeDraftDate(value){const date=value instanceof Date?new Date(value.getTime()):new Date(value||Date.now());return Number.isNaN(date.getTime())?new Date():date;}
  function nextShiftReportTeamStartAfter(anchor){const base=safeDraftDate(anchor);try{if(typeof window.getDashboardNextTeamShift==='function'){const next=window.getDashboardNextTeamShift(base,DRAFT_RETENTION_TEAM);if(next&&next.start instanceof Date&&!Number.isNaN(next.start.getTime())&&next.start>base)return new Date(next.start.getTime());}}catch(err){}try{if(typeof window.getTeamShiftState!=='function')return null;const candidates=[];const collect=(probe)=>{const state=window.getTeamShiftState(probe,DRAFT_RETENTION_TEAM);if(!state)return;if(state.active&&state.start instanceof Date&&state.start>base)candidates.push(state.start);if(state.next&&state.next.start instanceof Date&&state.next.start>base)candidates.push(state.next.start);};collect(base);if(!candidates.length){for(let hours=6;hours<=60*24;hours+=6){collect(new Date(base.getTime()+hours*60*60*1000));if(candidates.length)break;}}candidates.sort((a,b)=>a-b);return candidates.length?new Date(candidates[0].getTime()):null;}catch(err){return null;}}
  function draftRetentionDeadline(saved){if(!saved)return null;if(saved.retainUntil){const explicit=safeDraftDate(saved.retainUntil);if(!Number.isNaN(explicit.getTime()))return explicit;}const anchor=saved.updatedAt?safeDraftDate(saved.updatedAt):new Date();return nextShiftReportTeamStartAfter(anchor);}
  function loadDraft(){try{const key=draftStorageKey();const saved=JSON.parse(localStorage.getItem(key)||'null');if(!(saved&&saved.draft&&typeof saved.draft==='object'))return null;const deadline=draftRetentionDeadline(saved);if(deadline&&Date.now()>=deadline.getTime()){localStorage.removeItem(key);return null;}if(deadline&&!saved.retainUntil){saved.retainUntil=deadline.toISOString();saved.retentionVersion=DRAFT_RETENTION_VERSION;saved.retentionTeam=DRAFT_RETENTION_TEAM;localStorage.setItem(key,JSON.stringify(saved));}return saved;}catch(err){return null;}}
  function saveDraft(root){try{if(!root)return;const updatedAt=new Date();const saved={updatedAt:updatedAt.toISOString(),draft:getDraft(root)};const deadline=nextShiftReportTeamStartAfter(updatedAt);if(deadline){saved.retainUntil=deadline.toISOString();saved.retentionVersion=DRAFT_RETENTION_VERSION;saved.retentionTeam=DRAFT_RETENTION_TEAM;}localStorage.setItem(draftStorageKey(),JSON.stringify(saved));}catch(err){}}
  function clearDraft(){try{localStorage.removeItem(draftStorageKey());}catch(err){}}
  function expireShiftReportDraftIfDue(){return loadDraft()===null;}'''
replace_exact('rak-shift-report.js', old_draft, new_draft)

# Remove report DOM observer/injected legacy entry; menu now owns entry.
old_tail = "  function injectAdminEntry(){const body=document.getElementById('appMenuBody');if(!body||body.dataset.rakShiftReportOpen==='1')return;const old=body.querySelector('[data-admin-action=\"shift-report\"]');if(!canUseShiftReport()){if(old)old.remove();return;}if(old)return;const adminButton=body.querySelector('[data-admin-action=\"vacation-report\"]')||body.querySelector('[data-menu-action=\"admin\"]');if(!adminButton)return;const button=document.createElement('button');button.type='button';button.className='appMenuAction isActive';button.dataset.adminAction='shift-report';button.textContent='Report směny';adminButton.insertAdjacentElement('afterend',button);button.addEventListener('click',()=>{if(!canUseShiftReport())return;body.dataset.rakShiftReportOpen='1';build();});}\n"
replace_exact('rak-shift-report.js', old_tail, '')
old_observe = "  function observe(){bindBody();injectAdminEntry();const observer=new MutationObserver(()=>{bindBody();if(document.getElementById('appMenuBody')?.dataset.rakShiftReportOpen!=='1')injectAdminEntry();});observer.observe(document.body,{childList:true,subtree:true});}\n  window.RakShiftReport={open:()=>{if(!canUseShiftReport())return;const body=document.getElementById('appMenuBody');if(body){body.dataset.rakShiftReportOpen='1';build();}}};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe,{once:true});else observe();"
new_observe = "  function bootShiftReport(){bindBody();expireShiftReportDraftIfDue();window.addEventListener('focus',expireShiftReportDraftIfDue);document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='hidden')expireShiftReportDraftIfDue();});}\n  window.rakExpireShiftReportDraftIfDue=expireShiftReportDraftIfDue;\n  window.rakGetShiftReportRetentionDeadline=()=>{const saved=loadDraft();const deadline=draftRetentionDeadline(saved);return deadline?new Date(deadline.getTime()):null;};\n  window.RakShiftReport={open:()=>{if(!canUseShiftReport())return;expireShiftReportDraftIfDue();const body=document.getElementById('appMenuBody');if(body){body.dataset.rakShiftReportOpen='1';build();}}};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootShiftReport,{once:true});else bootShiftReport();"
replace_exact('rak-shift-report.js', old_observe, new_observe)

# PWA module owns portrait-only mode and stale DEV update prompt reset.
pwa_marker = 'function installPwaAndConnectivityHooks() {'
portrait_code = r'''function installRakPortraitOnlyPwaMode() {
  if (window.__rakPortraitOnlyPwaInstalled) return;
  let standalone = false;
  try { standalone = !!(window.navigator && window.navigator.standalone === true) || !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches); } catch (err) {}
  if (!standalone) return;
  window.__rakPortraitOnlyPwaInstalled = true;
  const overlayId = 'rakPortraitOnlyOverlay';
  const ensureOverlay = () => {
    if (!document.body) return;
    document.documentElement.classList.add('rakPortraitOnly');
    let overlay = document.getElementById(overlayId);
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = overlayId;
      overlay.setAttribute('role', 'status');
      overlay.setAttribute('aria-live', 'polite');
      overlay.innerHTML = '<div class="rakPortraitOnlyIcon" aria-hidden="true">↻</div><strong>Otoč telefon na výšku</strong><span>RaK je na mobilu uzamčený na výšku.</span>';
      document.body.appendChild(overlay);
    }
    if (!document.getElementById('rakPortraitOnlyPwaStyle')) {
      const style = document.createElement('style');
      style.id = 'rakPortraitOnlyPwaStyle';
      style.textContent = '#' + overlayId + '{display:none;}@media (orientation:landscape) and (max-height:700px){html.rakPortraitOnly #' + overlayId + '{display:flex!important;position:fixed;inset:0;z-index:2147483647;align-items:center;justify-content:center;flex-direction:column;gap:10px;padding:calc(20px + env(safe-area-inset-top)) calc(24px + env(safe-area-inset-right)) calc(20px + env(safe-area-inset-bottom)) calc(24px + env(safe-area-inset-left));box-sizing:border-box;text-align:center;background:radial-gradient(circle at 50% 35%,rgba(18,56,79,.98),rgba(5,8,22,.995) 68%);color:#f4fbff;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}html.rakPortraitOnly #' + overlayId + ' .rakPortraitOnlyIcon{font-size:54px;line-height:1;font-weight:800;}html.rakPortraitOnly #' + overlayId + ' strong{font-size:24px;line-height:1.15;}html.rakPortraitOnly #' + overlayId + ' span{font-size:15px;line-height:1.35;opacity:.78;max-width:360px;}}';
      document.head.appendChild(style);
    }
  };
  const tryLock = () => {
    try { const orientation = window.screen && window.screen.orientation; if (!orientation || typeof orientation.lock !== 'function') return; const result = orientation.lock('portrait-primary'); if (result && typeof result.catch === 'function') result.catch(() => {}); } catch (err) {}
  };
  ensureOverlay();
  tryLock();
  window.addEventListener('pageshow', tryLock);
  window.addEventListener('orientationchange', ensureOverlay);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState !== 'hidden') { ensureOverlay(); tryLock(); } });
  document.addEventListener('pointerdown', tryLock, { once: true, passive: true });
}

'''
p = Path('app-pwa-connectivity.js')
text = p.read_text()
if text.count(pwa_marker) != 1:
    raise SystemExit('app-pwa-connectivity.js: install marker not unique')
if 'function installRakPortraitOnlyPwaMode()' in text:
    raise SystemExit('app-pwa-connectivity.js: portrait mode already exists')
p.write_text(text.replace(pwa_marker, portrait_code + pwa_marker, 1))
replace_exact('app-pwa-connectivity.js', '  window.__rotacePwaBootstrapped = true;\n', '  window.__rotacePwaBootstrapped = true;\n  installRakPortraitOnlyPwaMode();\n')
keys = "  const SW_UPDATE_NOTICE_KEY = 'rotace_sw_update_notice_v1';\n  const SW_UPDATE_PENDING_KEY = 'rotace_sw_update_pending_v1';\n  const SW_UPDATE_SUPPRESS_KEY = 'rotace_sw_update_suppress_v1';\n"
reset = keys + "  const DEV_BUILD = String(window.RAK_PWA_BUILD || window.RAK_DEV_BUILD || '').trim();\n  if (DEV_BUILD) {\n    window.RAK_DEV_BUILD = DEV_BUILD;\n    try {\n      const key = 'rak_dev_entry_prompt_reset_build';\n      if (localStorage.getItem(key) !== DEV_BUILD) {\n        sessionStorage.removeItem(SW_UPDATE_NOTICE_KEY);\n        sessionStorage.removeItem(SW_UPDATE_PENDING_KEY);\n        localStorage.removeItem(SW_UPDATE_SUPPRESS_KEY);\n        localStorage.setItem(key, DEV_BUILD);\n      }\n    } catch (err) {}\n  }\n"
replace_exact('app-pwa-connectivity.js', keys, reset)

# Smoke guards move from legacy fix to native owners.
replace_exact('tools/critical-runtime-smoke.mjs', "const shiftReportEntryFix = read('rak-shift-report-entry-fix.js');\n", "const appPwaConnectivity = read('app-pwa-connectivity.js');\n")
replace_exact('tools/critical-runtime-smoke.mjs', "assert(shiftReportEntryFix.includes('const anchor = vacationReportButton || nativeReportButton || adminButton;'), 'Report směny musí preferovat Report dovolené jako viditelnou kotvu pořadí');\n", "assert(!deferred.includes('rak-shift-report-entry-fix.js'), 'Legacy vstup Reportu směny se po nativním převzetí nesmí vrátit do runtime');\nassert(!fs.existsSync(path.join(root, 'rak-shift-report-entry-fix.js')), 'Legacy vstup Reportu směny se po nativním převzetí nesmí vrátit do zdrojů');\nassert(appMenuJs.includes('data-rak-shift-report-entry=\\\"1\\\"'), 'Více musí nativně renderovat Report směny');\nassert(appMenuJs.includes('function appMenuOpenShiftReport()'), 'Otevření Reportu směny musí vlastnit app-menu.js');\n")
replace_exact('tools/critical-runtime-smoke.mjs', "assert(shiftReportEntryFix.includes(\"const DEV_BUILD = String(window.RAK_PWA_BUILD || window.RAK_DEV_BUILD || '').trim();\"), 'O aplikaci musí brát testovací build z aktuálního PWA buildu');\nassert(!shiftReportEntryFix.includes(\"const DEV_BUILD = 'v1.5.11';\"), 'Starý hardcoded testovací build v1.5.11 se nesmí vrátit');\n", "assert(appMenuJs.includes('Testovací build: '), 'O aplikaci musí renderovat testovací build přímo z app-menu.js');\nassert(shiftReport.includes(\"const DRAFT_RETENTION_TEAM = 'D';\"), 'Retention Reportu směny musí zůstat navázaná na směnu D');\nassert(shiftReport.includes('function nextShiftReportTeamStartAfter(anchor)'), 'Retention Reportu směny musí vlastnit hlavní report modul');\nassert(!shiftReport.includes('new MutationObserver'), 'Report směny už nesmí používat DOM observer pro vkládání menu vstupu');\nassert(appPwaConnectivity.includes('function installRakPortraitOnlyPwaMode()'), 'Portrait PWA guard musí vlastnit app-pwa-connectivity.js');\nassert(appPwaConnectivity.includes(\"const key = 'rak_dev_entry_prompt_reset_build';\"), 'Reset starého DEV update promptu musí vlastnit PWA modul');\n")

# Delete legacy all-in-one patch.
p = Path('rak-shift-report-entry-fix.js')
if not p.exists():
    raise SystemExit('rak-shift-report-entry-fix.js missing before migration')
p.unlink()
