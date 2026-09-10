from pathlib import Path

path = Path('tools/critical-runtime-smoke.mjs')
text = path.read_text(encoding='utf-8')
needle = 'v1.5.78 změna rotace TNKS01/TPKW01 musí označit editor jako ručně změněný'
lines = text.splitlines()
removed = sum(1 for line in lines if needle in line)
assert removed == 1, f'expected exactly one obsolete v1.5.78 dirty assert, found {removed}'
text = '\n'.join(line for line in lines if needle not in line) + '\n'
path.write_text(text, encoding='utf-8')
print('retired obsolete v1.5.78 dirty smoke assert')
