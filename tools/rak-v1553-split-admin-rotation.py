#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'admin-rotation.js'
APP = ROOT / 'app.js'
PKG = ROOT / 'package.json'
SW = ROOT / 'sw.js'
SMOKE = ROOT / 'tools' / 'critical-runtime-smoke.mjs'

source = SRC.read_text(encoding='utf-8')

FUNC_RE = re.compile(r'^(?:async\s+)?function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(', re.M)
CONST_RE = re.compile(r'^const\s+(ADMIN_ROTATION_(?:OVERTIME|GENERATOR)_[A-Z0-9_]+)\s*=.*?;\s*$', re.M)

def block_end(text: str, start: int) -> int:
    brace = text.find('{', start)
    if brace < 0:
        raise RuntimeError(f'No opening brace after {start}')
    depth = 0
    i = brace
    quote = None
    escape = False
    line_comment = False
    block_comment = False
    while i < len(text):
        ch = text[i]
        nxt = text[i+1] if i + 1 < len(text) else ''
        if line_comment:
            if ch == '\n': line_comment = False
            i += 1; continue
        if block_comment:
            if ch == '*' and nxt == '/':
                block_comment = False; i += 2; continue
            i += 1; continue
        if quote:
            if escape:
                escape = False
            elif ch == '\\':
                escape = True
            elif ch == quote:
                quote = None
            i += 1; continue
        if ch == '/' and nxt == '/':
            line_comment = True; i += 2; continue
        if ch == '/' and nxt == '*':
            block_comment = True; i += 2; continue
        if ch in ('\'', '"', '`'):
            quote = ch; i += 1; continue
        if ch == '{': depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                i += 1
                while i < len(text) and text[i] in ' \t': i += 1
                if i < len(text) and text[i] == ';': i += 1
                while i < len(text) and text[i] == '\n': i += 1
                return i
        i += 1
    raise RuntimeError(f'Unclosed block after {start}')

spans = []
overtime_parts = []
generator_parts = []

for m in FUNC_RE.finditer(source):
    name = m.group(1)
    owner = None
    if 'RotationOvertime' in name:
        owner = 'overtime'
    elif 'RotationGenerator' in name or 'RotationGeneration' in name:
        owner = 'generator'
    if not owner:
        continue
    start = m.start()
    end = block_end(source, start)
    part = source[start:end].rstrip() + '\n\n'
    spans.append((start, end, name, owner))
    (overtime_parts if owner == 'overtime' else generator_parts).append(part)

for m in CONST_RE.finditer(source):
    name = m.group(1)
    owner = 'overtime' if '_OVERTIME_' in name else 'generator'
    start, end = m.span()
    while end < len(source) and source[end] == '\n': end += 1
    part = source[start:end].rstrip() + '\n\n'
    spans.append((start, end, name, owner))
    (overtime_parts if owner == 'overtime' else generator_parts).insert(0, part)

# Prevent accidental overlaps and make sure this is a meaningful split.
spans.sort(key=lambda x: x[0])
for prev, cur in zip(spans, spans[1:]):
    if prev[1] > cur[0]:
        raise RuntimeError(f'Overlapping extraction: {prev[2]} / {cur[2]}')

overtime_names = [s[2] for s in spans if s[3] == 'overtime']
generator_names = [s[2] for s in spans if s[3] == 'generator']
if len(overtime_names) < 15:
    raise RuntimeError(f'Too few overtime declarations: {len(overtime_names)}')
if len(generator_names) < 40:
    raise RuntimeError(f'Too few generator declarations: {len(generator_names)}')
for required in ['buildAdminRotationOvertimeSettingsHtml', 'adminRotationOvertimeGetShiftInfoForIsoDate']:
    if required not in overtime_names: raise RuntimeError(f'Missing overtime owner: {required}')
for required in ['buildAdminRotationGeneratorSettingsHtml', 'adminBuildRotationGenerationModel', 'adminRotationGeneratorRenderWizard']:
    if required not in generator_names: raise RuntimeError(f'Missing generator owner: {required}')

new_source = source
for start, end, _, _ in reversed(spans):
    new_source = new_source[:start] + new_source[end:]
new_source = re.sub(r'\n{4,}', '\n\n\n', new_source)

ov_header = "// RaK – přesčasy administrace rozpisů oddělené z admin-rotation.js.\ntry { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('admin-rotation-overtime.js', 'loading', { source: 'dynamic-loader' }); } catch (err) {}\n\n"
ov_footer = "try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('admin-rotation-overtime.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}\n"
gen_header = "// RaK – generátor administrace rozpisů oddělený z admin-rotation.js.\ntry { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('admin-rotation-generator.js', 'loading', { source: 'dynamic-loader' }); } catch (err) {}\n\n"
gen_footer = "try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('admin-rotation-generator.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}\n"

(ROOT / 'admin-rotation-overtime.js').write_text(ov_header + ''.join(overtime_parts) + ov_footer, encoding='utf-8')
(ROOT / 'admin-rotation-generator.js').write_text(gen_header + ''.join(generator_parts) + gen_footer, encoding='utf-8')
SRC.write_text(new_source, encoding='utf-8')

app = APP.read_text(encoding='utf-8')
app = app.replace('const RAK_MODULE_CACHE_VERSION = "1.5.52";', 'const RAK_MODULE_CACHE_VERSION = "1.5.53";')
app = app.replace('const RAK_DEV_UPDATE_BUILD = "v1.5.52";', 'const RAK_DEV_UPDATE_BUILD = "v1.5.53";')
needle = '    "admin-rotation.js",'
if needle not in app: raise RuntimeError('admin-rotation.js loader entry missing')
app = app.replace(needle, '    "admin-rotation-overtime.js",\n    "admin-rotation-generator.js",\n' + needle, 1)
APP.write_text(app, encoding='utf-8')

pkg = PKG.read_text(encoding='utf-8')
pkg = pkg.replace('"version": "1.5.52"', '"version": "1.5.53"')
check_old = 'node --check admin-rotation.js'
check_new = 'node --check admin-rotation-overtime.js && node --check admin-rotation-generator.js && node --check admin-rotation.js'
if check_old not in pkg: raise RuntimeError('admin rotation package check entry missing')
pkg = pkg.replace(check_old, check_new, 1)
PKG.write_text(pkg, encoding='utf-8')

sw = SW.read_text(encoding='utf-8')
if 'v1.5.52' not in sw: raise RuntimeError('SW v1.5.52 marker missing')
sw = sw.replace('v1.5.52', 'v1.5.53')
SW.write_text(sw, encoding='utf-8')

smoke = SMOKE.read_text(encoding='utf-8')
needle_read = "const appMenuJs = read('app-menu.js');"
insert_read = "const adminRotationJs = read('admin-rotation.js');\nconst adminRotationOvertimeJs = read('admin-rotation-overtime.js');\nconst adminRotationGeneratorJs = read('admin-rotation-generator.js');\n"
if needle_read not in smoke: raise RuntimeError('smoke read insertion point missing')
smoke = smoke.replace(needle_read, insert_read + needle_read, 1)
needle_assert = "assert(deferred.includes('app-menu-admin-export.js'), 'Admin export modul musí zůstat součástí ověřeného bootu');"
insert_assert = """assert(deferred.includes('admin-rotation-overtime.js'), 'Přesčasy rozpisu musí zůstat součástí ověřeného bootu');
assert(deferred.includes('admin-rotation-generator.js'), 'Generátor rozpisu musí zůstat součástí ověřeného bootu');
assert(adminRotationOvertimeJs.includes('function buildAdminRotationOvertimeSettingsHtml()'), 'Přesčasový renderer musí vlastnit admin-rotation-overtime.js');
assert(adminRotationOvertimeJs.includes('function adminRotationOvertimeGetShiftInfoForIsoDate'), 'Výpočet směny přesčasu musí vlastnit admin-rotation-overtime.js');
assert(adminRotationGeneratorJs.includes('function buildAdminRotationGeneratorSettingsHtml()'), 'Nastavení generátoru musí vlastnit admin-rotation-generator.js');
assert(adminRotationGeneratorJs.includes('function adminBuildRotationGenerationModel'), 'Historický model generátoru musí vlastnit admin-rotation-generator.js');
assert(adminRotationGeneratorJs.includes('function adminRotationGeneratorRenderWizard'), 'Průvodce generátoru musí vlastnit admin-rotation-generator.js');
assert(!adminRotationJs.includes('function buildAdminRotationOvertimeSettingsHtml()'), 'Přesčasy se nesmí vrátit do admin-rotation.js');
assert(!adminRotationJs.includes('function buildAdminRotationGeneratorSettingsHtml()'), 'Generátor se nesmí vrátit do admin-rotation.js');
"""
if needle_assert not in smoke: raise RuntimeError('smoke assertion insertion point missing')
smoke = smoke.replace(needle_assert, insert_assert + needle_assert, 1)
SMOKE.write_text(smoke, encoding='utf-8')

print(f'overtime declarations: {len(overtime_names)}')
print(f'generator declarations: {len(generator_names)}')
print(f'admin-rotation chars: {len(source)} -> {len(new_source)}')
