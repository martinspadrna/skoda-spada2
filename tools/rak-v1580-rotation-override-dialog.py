from pathlib import Path
import json

root = Path('.')

# 1) Custom two-button override dialog instead of native confirm().
path = root / 'admin-rotation-editor.js'
text = path.read_text(encoding='utf-8')
start = text.index('function adminRotationConfirmManualRuleOverride(state) {')
end = text.index('\nasync function saveAdminRotationFromDom(monthKey, options) {', start)
replacement = r'''async function adminRotationConfirmManualRuleOverride(state) {
  const blocking = state && Array.isArray(state.blockingIssues) ? state.blockingIssues : [];
  if (!blocking.length) return true;

  const previous = document.getElementById('adminRotationRuleOverrideModal');
  if (previous) previous.remove();

  return await new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.id = 'adminRotationRuleOverrideModal';
    overlay.className = 'adminRotationRuleOverrideModal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'adminRotationRuleOverrideTitle');

    const card = document.createElement('div');
    card.className = 'adminRotationRuleOverrideCard';

    const title = document.createElement('div');
    title.id = 'adminRotationRuleOverrideTitle';
    title.className = 'adminRotationRuleOverrideTitle';
    title.textContent = 'Chyba v rozpisu';

    const intro = document.createElement('div');
    intro.className = 'adminRotationRuleOverrideIntro';
    intro.textContent = 'V rozpisu jsou chyby. Můžeš se vrátit a opravit je, nebo rozpis vědomě uložit i přesto.';

    const list = document.createElement('div');
    list.className = 'adminRotationRuleOverrideList';
    const limit = 10;
    blocking.slice(0, limit).forEach((issue, idx) => {
      const row = document.createElement('div');
      row.className = 'adminRotationRuleOverrideIssue';
      row.textContent = String(idx + 1) + '. ' + String(issue && issue.message || 'Porušení pravidla');
      list.appendChild(row);
    });
    if (blocking.length > limit) {
      const more = document.createElement('div');
      more.className = 'adminRotationRuleOverrideMore';
      more.textContent = '… a dalších ' + String(blocking.length - limit) + ' chyb.';
      list.appendChild(more);
    }

    const actions = document.createElement('div');
    actions.className = 'adminRotationRuleOverrideActions';

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'adminRotationRuleOverrideBtn adminRotationRuleOverrideClose';
    closeBtn.textContent = 'Zavřít';

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'adminRotationRuleOverrideBtn adminRotationRuleOverrideSave';
    saveBtn.textContent = 'Přesto uložit';

    actions.append(closeBtn, saveBtn);
    card.append(title, intro, list, actions);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      document.removeEventListener('keydown', onKeyDown, true);
      overlay.remove();
      resolve(!!value);
    };
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      finish(false);
    };

    closeBtn.addEventListener('click', () => finish(false), { once: true });
    saveBtn.addEventListener('click', () => finish(true), { once: true });
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) finish(false);
    });
    document.addEventListener('keydown', onKeyDown, true);

    requestAnimationFrame(() => {
      try { closeBtn.focus({ preventScroll: true }); } catch (err) { try { closeBtn.focus(); } catch (err2) {} }
    });
  });
}
'''
text = text[:start] + replacement + text[end:]
assert "window.confirm(text)" not in text, 'native confirm remained in rotation override dialog'
assert "saveBtn.textContent = 'Přesto uložit';" in text
assert "closeBtn.textContent = 'Zavřít';" in text
path.write_text(text, encoding='utf-8')

# 2) Always validate current DOM on Save. Any blocking issue opens the custom dialog.
path = root / 'app-menu.js'
text = path.read_text(encoding='utf-8')
start = text.index("      if (adminAction === 'save-rotation') {")
result_anchor = "        const result = await saveAdminRotationFromDom(monthKey, saveOptions);"
result_pos = text.index(result_anchor, start)
new_intro = r'''      if (adminAction === 'save-rotation') {
        const manualMonth = readAdminRotationFromDom(monthKey);
        const overrideState = adminRotationBuildManualRuleOverrideState(monthKey, manualMonth);
        let saveOptions = {
          normalizedMonth: overrideState.normalized,
          ruleCheck: overrideState.ruleCheck
        };
        if (overrideState.blockingIssues.length) {
          const confirmed = await adminRotationConfirmManualRuleOverride(overrideState);
          if (!confirmed) {
            const cancelledStatus = document.getElementById('adminOnlineSaveStatus') || document.getElementById('adminRotationDraftStatus');
            if (cancelledStatus) cancelledStatus.textContent = 'Uložení zrušeno · rozepsané změny zůstaly v editoru.';
            return;
          }
          saveOptions = {
            normalizedMonth: overrideState.normalized,
            ruleCheck: overrideState.ruleCheck,
            manualOverride: true,
            allowRuleViolations: true,
            manualOverrideIssues: overrideState.blockingIssues
          };
        }
'''
text = text[:start] + new_intro + text[result_pos:]
assert "const confirmed = await adminRotationConfirmManualRuleOverride(overrideState);" in text
assert text.index("const confirmed = await adminRotationConfirmManualRuleOverride(overrideState);") < text.index(result_anchor, start)
path.write_text(text, encoding='utf-8')

# 3) iOS/PWA-safe custom modal styling.
path = root / 'styles-admin-rotation-editor.css'
css = path.read_text(encoding='utf-8')
marker = 'RaK v1.5.80 – vlastní dialog pro vědomé uložení chybného rozpisu'
assert marker not in css, 'v1.5.80 modal CSS already present'
css += r'''

/* RaK v1.5.80 – vlastní dialog pro vědomé uložení chybného rozpisu. */
.adminRotationRuleOverrideModal{
  position:fixed !important;
  inset:0 !important;
  z-index:100000 !important;
  display:flex !important;
  align-items:center !important;
  justify-content:center !important;
  padding:16px max(14px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(14px,env(safe-area-inset-left)) !important;
  background:rgba(3,8,18,.72) !important;
  backdrop-filter:blur(12px) saturate(1.12) !important;
  -webkit-backdrop-filter:blur(12px) saturate(1.12) !important;
}
.adminRotationRuleOverrideCard{
  width:min(520px,100%) !important;
  max-height:calc(100dvh - 36px - env(safe-area-inset-bottom)) !important;
  overflow:auto !important;
  -webkit-overflow-scrolling:touch !important;
  padding:18px !important;
  border-radius:24px !important;
  border:1px solid rgba(255,255,255,.16) !important;
  background:linear-gradient(155deg,rgba(31,35,55,.98),rgba(15,22,38,.98)) !important;
  color:rgba(248,251,255,.96) !important;
  box-shadow:0 24px 70px rgba(0,0,0,.52),inset 0 1px 0 rgba(255,255,255,.12) !important;
}
.adminRotationRuleOverrideTitle{
  font-size:20px !important;
  line-height:1.15 !important;
  font-weight:950 !important;
  color:#fff !important;
}
.adminRotationRuleOverrideIntro{
  margin-top:8px !important;
  font-size:13px !important;
  line-height:1.4 !important;
  color:rgba(239,244,252,.76) !important;
}
.adminRotationRuleOverrideList{
  margin-top:14px !important;
  padding:10px !important;
  border-radius:16px !important;
  background:rgba(255,82,105,.08) !important;
  border:1px solid rgba(255,105,125,.18) !important;
}
.adminRotationRuleOverrideIssue,
.adminRotationRuleOverrideMore{
  font-size:12px !important;
  line-height:1.35 !important;
  color:rgba(255,236,239,.94) !important;
}
.adminRotationRuleOverrideIssue + .adminRotationRuleOverrideIssue,
.adminRotationRuleOverrideMore{
  margin-top:6px !important;
}
.adminRotationRuleOverrideActions{
  display:grid !important;
  grid-template-columns:1fr 1fr !important;
  gap:10px !important;
  margin-top:16px !important;
}
.adminRotationRuleOverrideBtn{
  min-height:46px !important;
  margin:0 !important;
  border-radius:15px !important;
  font-size:14px !important;
  font-weight:950 !important;
  touch-action:manipulation !important;
}
.adminRotationRuleOverrideClose{
  border:1px solid rgba(255,255,255,.18) !important;
  background:rgba(255,255,255,.08) !important;
  color:rgba(248,251,255,.94) !important;
}
.adminRotationRuleOverrideSave{
  border:1px solid rgba(255,132,92,.38) !important;
  background:linear-gradient(135deg,rgba(255,76,104,.94),rgba(255,145,68,.92)) !important;
  color:#fff !important;
  box-shadow:0 10px 24px rgba(255,78,102,.18) !important;
}
body.lightweightMode .adminRotationRuleOverrideModal,
body.lowEndDevice .adminRotationRuleOverrideModal,
body.ladaMode .adminRotationRuleOverrideModal{
  backdrop-filter:none !important;
  -webkit-backdrop-filter:none !important;
}
@media (max-width:420px){
  .adminRotationRuleOverrideActions{grid-template-columns:1fr !important;}
  .adminRotationRuleOverrideSave{order:-1 !important;}
}
'''
path.write_text(css, encoding='utf-8')

# 4) Version sync.
path = root / 'app.js'
text = path.read_text(encoding='utf-8')
assert text.count('1.5.79') >= 2, 'app.js v1.5.79 anchors missing'
path.write_text(text.replace('1.5.79', '1.5.80'), encoding='utf-8')

path = root / 'package.json'
pkg = json.loads(path.read_text(encoding='utf-8'))
assert pkg.get('version') == '1.5.79', 'package version is not 1.5.79'
pkg['version'] = '1.5.80'
path.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

path = root / 'sw.js'
text = path.read_text(encoding='utf-8')
assert "const CACHE_VERSION = 'v1.5.79';" in text, 'sw.js v1.5.79 anchor missing'
path.write_text(text.replace("const CACHE_VERSION = 'v1.5.79';", "const CACHE_VERSION = 'v1.5.80';", 1), encoding='utf-8')

# 5) Permanent critical runtime guards.
path = root / 'tools/critical-runtime-smoke.mjs'
smoke = path.read_text(encoding='utf-8')
log_anchor = "console.log('[critical-runtime-smoke] OK"
pos = smoke.index(log_anchor)
assertions = r'''assert(adminRotationEditorJsV1578.includes('async function adminRotationConfirmManualRuleOverride'), 'v1.5.80 override dialog musí být async custom modal');
assert(adminRotationEditorJsV1578.includes("saveBtn.textContent = 'Přesto uložit';"), 'v1.5.80 dialog musí mít tlačítko Přesto uložit');
assert(adminRotationEditorJsV1578.includes("closeBtn.textContent = 'Zavřít';"), 'v1.5.80 dialog musí mít tlačítko Zavřít');
assert(!adminRotationEditorJsV1578.includes('window.confirm(text)'), 'v1.5.80 override nesmí používat nativní confirm');
assert(appMenuJsV1578.includes('const overrideState = adminRotationBuildManualRuleOverrideState(monthKey, manualMonth);'), 'v1.5.80 save musí validovat aktuální DOM vždy');
assert(appMenuJsV1578.includes('const confirmed = await adminRotationConfirmManualRuleOverride(overrideState);'), 'v1.5.80 save musí čekat na vlastní dvoutlačítkový dialog');
assert(appMenuJsV1578.indexOf('const confirmed = await adminRotationConfirmManualRuleOverride(overrideState);') < appMenuJsV1578.indexOf('saveAdminRotationFromDom(monthKey, saveOptions)'), 'v1.5.80 potvrzení Přesto uložit musí proběhnout před uložením');
assert(stylesAdminRotationEditorCss.includes('RaK v1.5.80 – vlastní dialog pro vědomé uložení chybného rozpisu'), 'v1.5.80 chybí CSS custom override dialogu');
assert(stylesAdminRotationEditorCss.includes('.adminRotationRuleOverrideSave') && stylesAdminRotationEditorCss.includes('.adminRotationRuleOverrideClose'), 'v1.5.80 chybí styly obou dialogových tlačítek');

'''
if 'v1.5.80 override dialog musí být async custom modal' not in smoke:
    smoke = smoke[:pos] + assertions + smoke[pos:]
path.write_text(smoke, encoding='utf-8')

print('v1.5.80 migration complete')
