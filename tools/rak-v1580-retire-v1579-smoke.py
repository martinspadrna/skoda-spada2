from pathlib import Path

path = Path('tools/critical-runtime-smoke.mjs')
text = path.read_text(encoding='utf-8')
old = "assert(appMenuJsV1578.includes('adminRotationHasManualDomChanges(monthKey, manualMonth)'), 'v1.5.79 save musí použít DOM fallback ruční změny');\n"
assert old in text, 'obsolete v1.5.79 save DOM fallback assert not found'
text = text.replace(old, '', 1)
path.write_text(text, encoding='utf-8')
print('retired obsolete v1.5.79 save-path smoke assert')
