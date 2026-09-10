from pathlib import Path
import re

ROOT=Path('.')
MID=ROOT/'styles-overrides-legacy-mid.css'
OWNER=ROOT/'styles-shift-report.css'
INDEX=ROOT/'index.html'
CRITICAL=ROOT/'tools/critical-runtime-smoke.mjs'
APP=ROOT/'app.js'; PKG=ROOT/'package.json'; SW=ROOT/'sw.js'

mid=MID.read_text(encoding='utf-8')
stop='/* v.1.1 (693) - Administrace reportů + logické hry */'
if stop not in mid:
    raise RuntimeError('Shift-report boundary marker missing in legacy-mid')
block, rest = mid.split(stop,1)
block=block.strip()
if '.appMenuReportCard' not in block or '.appMenuReportActions' not in block:
    raise RuntimeError('Expected shift-report CSS not found at legacy-mid head')
if any(token in block for token in ('#admin', '#rotace', '#home', '#stats', '.dashboard')):
    raise RuntimeError('Unexpected unrelated selector in extracted shift-report block')
if OWNER.exists():
    raise RuntimeError('styles-shift-report.css already exists; refusing overwrite')

owner_header='''/* RaK v1.5.65 – vlastník vzhledu Reportu směny.\n   Přesunuto 1:1 z čela styles-overrides-legacy-mid.css.\n   Soubor se načítá přesně na původní cascade pozici bez změny deklarací. */\n'''
OWNER.write_text(owner_header+block+'\n',encoding='utf-8')
MID.write_text(stop+rest,encoding='utf-8')

index=INDEX.read_text(encoding='utf-8')
legacy_link='<link rel="stylesheet" href="styles-overrides-legacy-mid.css">'
owner_link='<link rel="stylesheet" href="styles-shift-report.css">'
if legacy_link not in index:
    raise RuntimeError('legacy-mid stylesheet link missing from index.html')
if owner_link in index:
    raise RuntimeError('shift-report stylesheet already linked')
index=index.replace(legacy_link, owner_link+'\n'+legacy_link,1)
INDEX.write_text(index,encoding='utf-8')

# Exact-content proof: owner body must equal the bytes removed from legacy-mid, ignoring only our ownership header.
owner_body=OWNER.read_text(encoding='utf-8').split('*/',1)[1].strip()
if owner_body != block:
    raise RuntimeError('Extracted CSS changed during ownership move')
if '.appMenuReportCard' in MID.read_text(encoding='utf-8')[:1200]:
    raise RuntimeError('Shift-report CSS still remains at legacy-mid head')

# Small ownership map for the remaining legacy CSS, for next releases.
legacy='\n'.join((ROOT/name).read_text(encoding='utf-8') for name in (
    'styles-overrides-legacy-early.css','styles-overrides-legacy-mid.css','styles-overrides-legacy-late.css'))
low=re.sub(r'/\*[\s\S]*?\*/','',legacy).lower()
groups={
 'dashboard':('dashboard','#home','#dash'),
 'menu_admin':('appmenu','#menu','#admin','.admin'),
 'rotation':('#rotace','rotacenamespanel','#namesgrid','.rotace','.rotation'),
 'stats':('#stats','.stats'),
 'calc':('#soustruhy','#frezky','#brusy','#pracka','.calc'),
 'theme':('theme','appearance','background'),
 'shift_report':('.appmenureport','shiftreport'),
}
print('v1.5.65 remaining legacy ownership map:',{k:sum(low.count(t) for t in ts) for k,ts in groups.items()})
print('legacy bytes:',len(legacy),'shift-report owner bytes:',len(OWNER.read_text(encoding='utf-8')))

critical=CRITICAL.read_text(encoding='utf-8')
read_anchor="const stylesOverridesLegacyMidCss = read('styles-overrides-legacy-mid.css');"
read_line="const stylesShiftReportCss = read('styles-shift-report.css');"
if read_line not in critical:
    if read_anchor not in critical:
        raise RuntimeError('critical legacy-mid read anchor missing')
    critical=critical.replace(read_anchor,read_anchor+'\n'+read_line,1)
check_anchor="const bootSelfTest = read('app-boot-selftest.js');"
check='''\nassert(stylesShiftReportCss.includes('RaK v1.5.65 – vlastník vzhledu Reportu směny'), 'Chybí v1.5.65 shift-report CSS owner marker');\nassert(stylesShiftReportCss.includes('.appMenuReportCard'), 'Shift-report owner musí obsahovat report card CSS');\nassert(!stylesOverridesLegacyMidCss.slice(0, 1200).includes('.appMenuReportCard'), 'Report směny se nesmí vrátit na čelo legacy-mid');\nconst shiftReportCssPos = indexHtml.indexOf('styles-shift-report.css');\nconst legacyMidCssPos = indexHtml.indexOf('styles-overrides-legacy-mid.css');\nassert(shiftReportCssPos >= 0 && legacyMidCssPos > shiftReportCssPos, 'Shift-report owner musí být načten bezprostředně před legacy-mid');\n'''
if 'v1.5.65 shift-report CSS owner marker' not in critical:
    if check_anchor not in critical:
        raise RuntimeError('critical check anchor missing')
    critical=critical.replace(check_anchor,check+check_anchor,1)
CRITICAL.write_text(critical,encoding='utf-8')

app=APP.read_text(encoding='utf-8')
if '1.5.64' not in app: raise RuntimeError('app baseline is not 1.5.64')
app=app.replace('const RAK_MODULE_CACHE_VERSION = "1.5.64";','const RAK_MODULE_CACHE_VERSION = "1.5.65";').replace('const RAK_DEV_UPDATE_BUILD = "v1.5.64";','const RAK_DEV_UPDATE_BUILD = "v1.5.65";')
APP.write_text(app,encoding='utf-8')
pkg=PKG.read_text(encoding='utf-8')
if '"version": "1.5.64"' not in pkg: raise RuntimeError('package baseline is not 1.5.64')
PKG.write_text(pkg.replace('"version": "1.5.64"','"version": "1.5.65"'),encoding='utf-8')
sw=SW.read_text(encoding='utf-8')
if "const CACHE_VERSION = 'v1.5.64';" not in sw: raise RuntimeError('sw baseline is not 1.5.64')
SW.write_text(sw.replace("const CACHE_VERSION = 'v1.5.64';","const CACHE_VERSION = 'v1.5.65';"),encoding='utf-8')
print('v1.5.65 shift-report CSS ownership extraction OK')
