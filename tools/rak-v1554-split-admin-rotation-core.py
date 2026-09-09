from pathlib import Path
import re

ROOT = Path('.')
SRC = ROOT / 'admin-rotation.js'
GEN = ROOT / 'admin-rotation-generator.js'
OT = ROOT / 'admin-rotation-overtime.js'
EDITOR = ROOT / 'admin-rotation-editor.js'
MACHINE = ROOT / 'admin-machine-settings.js'
APP = ROOT / 'app.js'
PKG = ROOT / 'package.json'
SW = ROOT / 'sw.js'
SMOKE = ROOT / 'tools/critical-runtime-smoke.mjs'

src = SRC.read_text(encoding='utf-8')

# Find top-level function declarations and their complete bodies.
pat = re.compile(r'(?m)^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(')

def find_block_end(text, start):
    brace = text.find('{', start)
    if brace < 0:
        raise RuntimeError('Missing function body at %d' % start)
    depth = 0
    i = brace
    state = 'code'
    quote = ''
    while i < len(text):
        ch = text[i]
        nxt = text[i+1] if i + 1 < len(text) else ''
        if state == 'code':
            if ch in ('"', "'", '`'):
                state = 'string'; quote = ch
            elif ch == '/' and nxt == '/':
                state = 'line'; i += 1
            elif ch == '/' and nxt == '*':
                state = 'block'; i += 1
            elif ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0:
                    end = i + 1
                    while end < len(text) and text[end] in ' \t':
                        end += 1
                    if end < len(text) and text[end] == ';':
                        end += 1
                    while end < len(text) and text[end] in '\r\n':
                        end += 1
                    return end
        elif state == 'string':
            if ch == '\\':
                i += 1
            elif ch == quote:
                state = 'code'
        elif state == 'line':
            if ch in '\r\n':
                state = 'code'
        elif state == 'block':
            if ch == '*' and nxt == '/':
                state = 'code'; i += 1
        i += 1
    raise RuntimeError('Unclosed function at %d' % start)

blocks = []
for m in pat.finditer(src):
    start = m.start()
    # Only accept declarations that start with no indentation (top-level).
    if start > 0 and src[start-1] not in '\r\n':
        continue
    end = find_block_end(src, start)
    blocks.append((start, end, m.group(1), src[start:end]))

# Classification: generator/overtime first, then machines, then editor/shared rotation UI.
def is_machine(name):
    exact = {
        'splitMachineKey', 'makeMachineKey', 'getAdminFhbTargetRows',
        'buildAdminFhbTargetSettingsHtml', 'readAdminFhbTargetSettingsFromDom',
        'mergeAdminFhbTargetSettingsRows', 'saveAdminMachineSettingsToSupabase',
        'loadAdminMachineSettingsFromSupabase'
    }
    return (name in exact or name.startswith('adminMachine') or name.startswith('buildAdminMachine')
            or name.startswith('readAdminMachine') or name.startswith('mergeAdminMachine')
            or name.startswith('saveAdminMachine') or name.startswith('getAdminFhb')
            or name.startswith('buildAdminFhb') or name.startswith('readAdminFhb')
            or name.startswith('mergeAdminFhb'))

def is_editor(name):
    exact = {
        'renderAdminInlineFieldHtml', 'buildAdminRotationColgroupHtml', 'buildAdminAbsenceColgroupHtml',
        'buildAdminAbsenceCodeDatalistHtml', 'buildAdminAbsenceSummaryHtml',
        'adminGetKnownNames', 'adminSplitPeopleList', 'adminGetRotationActiveDateKey',
        'adminSetRotationViewportLock', 'adminBindRotationZoomGuard',
        'runAdminRotationEditorMaintenance', 'scheduleAdminRotationEditorMaintenance',
        'adminCloseAbsenceCodePicker', 'adminShowAbsenceCodePicker', 'adminScheduleAbsenceCodePicker'
    }
    prefixes = (
        'buildAdminRotation', 'readAdminRotation', 'saveAdminRotation', 'copyAdminRotation',
        'adminBuildUsedNames', 'adminBuildMonthUsage', 'adminRenderRotation', 'adminRefreshRotation',
        'adminCloseRotation', 'adminShowRotation', 'adminScheduleRotation',
        'adminRotationFindShiftForAbsence', 'adminRotationSortNotes', 'adminRotationCopyAbsence',
        'adminRotationCopyText', 'adminRotationNameLookupKey', 'adminRotationCanonicalPeopleText'
    )
    return name in exact or name.startswith(prefixes)

selected = {'generator': [], 'overtime': [], 'machine': [], 'editor': []}
ranges = []
for start, end, name, block in blocks:
    bucket = None
    if 'Generator' in name or 'Generation' in name:
        bucket = 'generator'
    elif 'Overtime' in name:
        bucket = 'overtime'
    elif is_machine(name):
        bucket = 'machine'
    elif is_editor(name):
        bucket = 'editor'
    if bucket:
        selected[bucket].append((name, block))
        ranges.append((start, end, name, bucket))

if len(selected['machine']) < 8:
    raise RuntimeError('Machine split too small: %d' % len(selected['machine']))
if len(selected['editor']) < 15:
    raise RuntimeError('Editor split too small: %d' % len(selected['editor']))
if not selected['generator']:
    raise RuntimeError('Expected leftover generator functions')
if not selected['overtime']:
    raise RuntimeError('Expected leftover overtime functions')

# Remove selected blocks from the core in reverse order.
core = src
for start, end, name, bucket in sorted(ranges, reverse=True):
    core = core[:start] + core[end:]
core = re.sub(r'\n{4,}', '\n\n\n', core)
SRC.write_text(core, encoding='utf-8')

# Append leftovers to existing thematic modules before readiness marker if possible.
def append_before_ready(path, additions, label):
    text = path.read_text(encoding='utf-8')
    marker = "try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady("
    pos = text.rfind(marker)
    payload = '\n\n// v1.5.54 – doplněné funkce přesunuté z admin-rotation.js.\n' + '\n'.join(block for _, block in additions).rstrip() + '\n\n'
    if pos >= 0:
        text = text[:pos] + payload + text[pos:]
    else:
        text = text.rstrip() + payload
    path.write_text(text, encoding='utf-8')

append_before_ready(GEN, selected['generator'], 'generator')
append_before_ready(OT, selected['overtime'], 'overtime')

EDITOR.write_text(
    "// RaK – editor rozpisu a absence oddělené z admin-rotation.js.\n"
    "try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('admin-rotation-editor.js', 'loading', { source: 'dynamic-loader' }); } catch (err) {}\n\n"
    + '\n'.join(block for _, block in selected['editor']).rstrip()
    + "\n\ntry { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('admin-rotation-editor.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}\n",
    encoding='utf-8'
)
MACHINE.write_text(
    "// RaK – nastavení strojů a FHB oddělené z admin-rotation.js.\n"
    "try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('admin-machine-settings.js', 'loading', { source: 'dynamic-loader' }); } catch (err) {}\n\n"
    + '\n'.join(block for _, block in selected['machine']).rstrip()
    + "\n\ntry { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('admin-machine-settings.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}\n",
    encoding='utf-8'
)

# Boot: keep functions available before the final admin-rotation binding shell runs.
app = APP.read_text(encoding='utf-8')
app = app.replace('const RAK_MODULE_CACHE_VERSION = "1.5.53";', 'const RAK_MODULE_CACHE_VERSION = "1.5.54";')
app = app.replace('const RAK_DEV_UPDATE_BUILD = "v1.5.53";', 'const RAK_DEV_UPDATE_BUILD = "v1.5.54";')
old = '    "admin-rotation-overtime.js",\n    "admin-rotation-generator.js",\n    "admin-rotation.js",'
new = '    "admin-rotation-editor.js",\n    "admin-rotation-overtime.js",\n    "admin-rotation-generator.js",\n    "admin-machine-settings.js",\n    "admin-rotation.js",'
if old not in app:
    raise RuntimeError('app.js rotation loader block not found')
app = app.replace(old, new, 1)
APP.write_text(app, encoding='utf-8')

pkg = PKG.read_text(encoding='utf-8')
pkg = pkg.replace('"version": "1.5.53"', '"version": "1.5.54"')
old_check = 'node --check admin-rotation-overtime.js && node --check admin-rotation-generator.js && node --check admin-rotation.js'
new_check = 'node --check admin-rotation-editor.js && node --check admin-rotation-overtime.js && node --check admin-rotation-generator.js && node --check admin-machine-settings.js && node --check admin-rotation.js'
if old_check not in pkg:
    raise RuntimeError('package rotation check block not found')
pkg = pkg.replace(old_check, new_check, 1)
PKG.write_text(pkg, encoding='utf-8')

sw = SW.read_text(encoding='utf-8').replace('v1.5.53', 'v1.5.54')
SW.write_text(sw, encoding='utf-8')

smoke = SMOKE.read_text(encoding='utf-8')
needle = "const appMenuAdminExportJs = read('app-menu-admin-export.js');"
insert = "const adminRotationEditorJs = read('admin-rotation-editor.js');\nconst adminRotationOvertimeJs = read('admin-rotation-overtime.js');\nconst adminRotationGeneratorJs = read('admin-rotation-generator.js');\nconst adminMachineSettingsJs = read('admin-machine-settings.js');\nconst adminRotationJs = read('admin-rotation.js');\n"
if 'const adminRotationEditorJs' not in smoke:
    smoke = smoke.replace(needle, insert + needle, 1)
anchor = "assert(deferred.includes('app-menu-admin-export.js'), 'Admin export modul musí zůstat součástí ověřeného bootu');"
checks = """
assert(deferred.includes('admin-rotation-editor.js'), 'Editor rozpisu musí zůstat součástí ověřeného bootu');
assert(deferred.includes('admin-rotation-overtime.js'), 'Přesčasy musí zůstat součástí ověřeného bootu');
assert(deferred.includes('admin-rotation-generator.js'), 'Generátor rozpisu musí zůstat součástí ověřeného bootu');
assert(deferred.includes('admin-machine-settings.js'), 'Nastavení strojů musí zůstat součástí ověřeného bootu');
assert(adminRotationEditorJs.includes('function buildAdminRotationTableHtml'), 'Editor tabulky rozpisu musí vlastnit admin-rotation-editor.js');
assert(adminRotationEditorJs.includes('function adminBindRotationZoomGuard'), 'Mobilní guard editoru musí vlastnit admin-rotation-editor.js');
assert(adminMachineSettingsJs.includes('function buildAdminMachineSettingsTableHtml'), 'Nastavení strojů musí vlastnit admin-machine-settings.js');
assert(adminRotationGeneratorJs.includes('function adminRotationNormalizeGeneratorSettings'), 'Generator settings musí být sjednocené v admin-rotation-generator.js');
assert(adminRotationOvertimeJs.includes('function adminRotationRefreshOvertimeYearSummaries'), 'Overtime refresh musí být sjednocený v admin-rotation-overtime.js');
assert(!adminRotationJs.includes('function buildAdminRotationTableHtml'), 'Editor se nesmí vrátit do admin-rotation.js core');
assert(!adminRotationJs.includes('function buildAdminMachineSettingsTableHtml'), 'Nastavení strojů se nesmí vrátit do admin-rotation.js core');
assert(!adminRotationJs.includes('function adminRotationNormalizeGeneratorSettings'), 'Generator settings se nesmí vrátit do admin-rotation.js core');
assert(adminRotationJs.includes('function getAdminRotationMonthKeys'), 'admin-rotation.js core musí držet společný výběr měsíců');
"""
if "Editor rozpisu musí zůstat" not in smoke:
    smoke = smoke.replace(anchor, checks + '\n' + anchor, 1)
SMOKE.write_text(smoke, encoding='utf-8')

print('v1.5.54 split OK')
for key in ('editor', 'machine', 'generator', 'overtime'):
    print(key, len(selected[key]), 'functions')
print('core lines', len(core.splitlines()))
print('editor lines', len(EDITOR.read_text(encoding='utf-8').splitlines()))
print('machine lines', len(MACHINE.read_text(encoding='utf-8').splitlines()))
