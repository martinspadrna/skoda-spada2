from pathlib import Path
p = Path('package.json')
text = p.read_text()
old = ' && node --check rak-shift-report-entry-fix.js'
if text.count(old) != 1:
    raise SystemExit(f'package.json: expected one legacy check reference, found {text.count(old)}')
p.write_text(text.replace(old, '', 1))
