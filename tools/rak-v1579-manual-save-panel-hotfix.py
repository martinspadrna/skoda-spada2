from pathlib import Path
import json

root = Path('.')

# 1) Ruční změna: porovnat skutečný DOM obsah, ale při potvrzení vypsat VŠECHNY aktuální chyby.
path = root / 'admin-rotation-editor.js'
text = path.read_text(encoding='utf-8')
start = text.index('function adminRotationRuleIssueSignature(issue) {')
end = text.index('function adminRotationConfirmManualRuleOverride(state) {', start)
replacement = r'''function adminRotationComparableMonth(value) {
  const month = value && typeof value === 'object' ? value : {};
  const normalizeRows = (section) => (Array.isArray(section && section.rows) ? section.rows : []).map((row) => ({
    date: String(row && row.date || '').trim(),
    cells: (Array.isArray(row && row.cells) ? row.cells : []).map((cell) => String(cell || '').trim())
  }));
  const notes = (Array.isArray(month.notes) ? month.notes : []).map((note) => ({
    date: String(note && note.date || '').trim(),
    person: String(note && note.person || '').trim(),
    code: String(note && note.code || '').trim(),
    shift: String(note && note.shift || '').trim(),
    text: String(note && note.text || '').trim()
  })).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b), 'cs'));
  const pressRotationOverrides = Object.entries(month.pressRotationOverrides || {})
    .map(([key, value]) => [String(key), String(value)])
    .sort((a, b) => a[0].localeCompare(b[0], 'cs'));
  return JSON.stringify({
    hard: normalizeRows(month.hard),
    soft: normalizeRows(month.soft),
    notes,
    pressRotationOverrides
  });
}

function adminRotationHasManualDomChanges(monthKey, normalizedMonth) {
  const current = normalizedMonth || readAdminRotationFromDom(monthKey);
  let baseline = null;
  try {
    if (typeof adminRotationGeneratorGetPendingDraft === 'function') baseline = adminRotationGeneratorGetPendingDraft(monthKey);
  } catch (err) {}
  if (!baseline) baseline = app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
  if (!baseline) return true;
  return adminRotationComparableMonth(current) !== adminRotationComparableMonth(baseline);
}

function adminRotationBuildManualRuleOverrideState(monthKey, normalizedMonth) {
  const normalized = normalizedMonth || readAdminRotationFromDom(monthKey);
  const ruleCheck = adminRotationValidateMonthRules(normalized, monthKey, { source: 'manual-save' });
  const blockingIssues = (Array.isArray(ruleCheck.issues) ? ruleCheck.issues : [])
    .filter((issue) => issue && issue.severity === 'error');
  return { normalized, ruleCheck, blockingIssues };
}

'''
text = text[:start] + replacement + text[end:]
assert 'baselineKeys' not in text and 'baselineCheck' not in text, 'legacy baseline-only filtering remained'
assert 'function adminRotationHasManualDomChanges' in text
path.write_text(text, encoding='utf-8')

# 2) Save handler: iOS-safe dirty tracking + DOM fallback; potvrzení před skutečným uložením.
path = root / 'app-menu.js'
text = path.read_text(encoding='utf-8')
old_change = "    if (target.matches('[data-press-rotation-date]') && typeof app !== 'undefined' && app) app.adminRotationDirty = true;"
new_change = "    if (target.matches('[data-rot-field], [data-note-field], [data-press-rotation-date]') && typeof app !== 'undefined' && app) {\n      app.adminRotationDirty = true;\n    }"
assert old_change in text, 'change dirty anchor missing'
text = text.replace(old_change, new_change, 1)

save_start = text.index("      if (adminAction === 'save-rotation') {")
result_anchor = "        const result = await saveAdminRotationFromDom(monthKey, saveOptions);"
result_pos = text.index(result_anchor, save_start)
save_intro = r'''      if (adminAction === 'save-rotation') {
        const manualMonth = readAdminRotationFromDom(monthKey);
        const isManualEdit = !!(
          (typeof app !== 'undefined' && app && app.adminRotationDirty === true)
          || (typeof adminRotationHasManualDomChanges === 'function'
              && adminRotationHasManualDomChanges(monthKey, manualMonth))
        );
        let saveOptions = null;
        if (isManualEdit) {
          const overrideState = adminRotationBuildManualRuleOverrideState(monthKey, manualMonth);
          if (overrideState.blockingIssues.length && !adminRotationConfirmManualRuleOverride(overrideState)) {
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
text = text[:save_start] + save_intro + text[result_pos:]
assert 'adminRotationHasManualDomChanges(monthKey, manualMonth)' in text
path.write_text(text, encoding='utf-8')

# 3) Kontrola měsíce: bez skrytého vnitřního scrollu/pevné výšky.
path = root / 'styles-admin-rotation-editor.css'
css = path.read_text(encoding='utf-8')
marker = 'RaK v1.5.79 – Kontrola měsíce celá viditelná'
assert marker not in css, 'v1.5.79 CSS marker already present'
css = css.rstrip() + r'''

/* RaK v1.5.79 – Kontrola měsíce celá viditelná bez vnitřního ořezu na iPhonu. */
#appMenuBody[data-admin-view="rotation"] #adminRotationEditor .appMenuFreeNamesBox{
  max-height:none !important;
  overflow:visible !important;
}
#appMenuBody[data-admin-view="rotation"] #adminRotationEditor .appMenuMonthCheckList{
  max-height:none !important;
  overflow:visible !important;
}
'''
path.write_text(css.rstrip() + '\n', encoding='utf-8')

# 4) Version sync.
path = root / 'app.js'
text = path.read_text(encoding='utf-8')
assert text.count('1.5.78') >= 2, 'app.js v1.5.78 anchors missing'
path.write_text(text.replace('1.5.78', '1.5.79'), encoding='utf-8')

path = root / 'package.json'
pkg = json.loads(path.read_text(encoding='utf-8'))
assert pkg.get('version') == '1.5.78', 'package version is not 1.5.78'
pkg['version'] = '1.5.79'
path.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

path = root / 'sw.js'
text = path.read_text(encoding='utf-8')
assert "const CACHE_VERSION = 'v1.5.78';" in text, 'sw.js v1.5.78 anchor missing'
path.write_text(text.replace("const CACHE_VERSION = 'v1.5.78';", "const CACHE_VERSION = 'v1.5.79';", 1), encoding='utf-8')

# 5) Permanent critical guard.
path = root / 'tools/critical-runtime-smoke.mjs'
smoke = path.read_text(encoding='utf-8')
smoke_lines = [line for line in smoke.splitlines() if 'baselineKeys' not in line and 'baselineCheck' not in line]
smoke = '\n'.join(smoke_lines) + '\n'
log_anchor = "console.log('[critical-runtime-smoke] OK"
pos = smoke.index(log_anchor)
assertions = r'''assert(!adminRotationEditorJsV1578.includes('baselineKeys') && !adminRotationEditorJsV1578.includes('baselineCheck'), 'v1.5.79 ruční save nesmí filtrovat jen nové chyby proti uloženému rozpisu');
assert(adminRotationEditorJsV1578.includes('function adminRotationHasManualDomChanges'), 'v1.5.79 chybí DOM fallback pro skutečnou ruční změnu');
assert(adminRotationEditorJsV1578.includes(".filter((issue) => issue && issue.severity === 'error')"), 'v1.5.79 musí před ručním uložením vzít všechny aktuální chyby');
assert(appMenuJsV1578.includes('adminRotationHasManualDomChanges(monthKey, manualMonth)'), 'v1.5.79 save musí použít DOM fallback ruční změny');
assert(appMenuJsV1578.includes("target.matches('[data-rot-field], [data-note-field], [data-press-rotation-date]')"), 'v1.5.79 change musí značit všechny ruční rozpisové vstupy');
assert(appMenuJsV1578.indexOf('adminRotationConfirmManualRuleOverride(overrideState)') < appMenuJsV1578.indexOf('saveAdminRotationFromDom(monthKey, saveOptions)'), 'v1.5.79 potvrzení musí proběhnout před uložením');
assert(stylesAdminRotationEditorCss.includes('RaK v1.5.79 – Kontrola měsíce celá viditelná'), 'v1.5.79 chybí CSS guard panelu Kontrola měsíce');
assert(stylesAdminRotationEditorCss.includes('max-height:none !important') && stylesAdminRotationEditorCss.includes('overflow:visible !important'), 'v1.5.79 Kontrola měsíce nesmí mít pevný ořez');

'''
if 'v1.5.79 ruční save nesmí filtrovat' not in smoke:
    smoke = smoke[:pos] + assertions + smoke[pos:]
path.write_text(smoke, encoding='utf-8')

print('v1.5.79 migration complete')
