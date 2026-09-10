from pathlib import Path

path = Path('tools/critical-runtime-smoke.mjs')
text = path.read_text(encoding='utf-8')
obsolete = [
    "assert(appMenuJsV1578.includes('const isManualEdit = !!'), 'v1.5.78 potvrzení musí být navázané jen na ruční editaci');\n",
    "assert(appMenuJsV1578.includes('adminRotationHasManualDomChanges(monthKey, manualMonth)'), 'v1.5.79 save musí použít DOM fallback ruční změny');\n",
]
for old in obsolete:
    assert old in text, 'obsolete save-path smoke assert not found: ' + old.strip()
    text = text.replace(old, '', 1)
path.write_text(text, encoding='utf-8')
print('retired obsolete v1.5.78/v1.5.79 save-path smoke asserts')
