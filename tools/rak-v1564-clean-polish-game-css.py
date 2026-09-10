from pathlib import Path
import re, json

ROOT=Path('.')
TARGETS=[p for p in ROOT.glob('styles-*.css') if 'overrides-legacy' not in p.name]
APP=ROOT/'app.js'; PKG=ROOT/'package.json'; SW=ROOT/'sw.js'; CRIT=ROOT/'tools/critical-runtime-smoke.mjs'
GAME_TOKENS=('#games','.games','.gameboard','.gametitle','.gamemetric','.gamecontrol','.arcade','.ttt','bomber','sudoku','bubble','gomoku')
GROUP_AT=('@media','@supports','@container','@layer','@scope','@document')

def split_sels(s):
    out=[]; st=0; p=b=0; q=None; esc=False
    for i,ch in enumerate(s):
        if q:
            if esc: esc=False
            elif ch=='\\': esc=True
            elif ch==q: q=None
            continue
        if ch in ('"',"'"): q=ch
        elif ch=='(': p+=1
        elif ch==')': p=max(0,p-1)
        elif ch=='[': b+=1
        elif ch==']': b=max(0,b-1)
        elif ch==',' and p==0 and b==0: out.append(s[st:i].strip()); st=i+1
    out.append(s[st:].strip()); return [x for x in out if x]

def dead(sel):
    x=sel.lower()
    return any(t in x for t in GAME_TOKENS)

def brace(t,o):
    d=1;i=o+1;q=None;c=False
    while i<len(t):
        ch=t[i]; nx=t[i+1] if i+1<len(t) else ''
        if c:
            if ch=='*' and nx=='/': c=False;i+=2;continue
            i+=1;continue
        if q:
            if ch=='\\': i+=2;continue
            if ch==q:q=None
            i+=1;continue
        if ch=='/' and nx=='*': c=True;i+=2;continue
        if ch in ('"',"'"): q=ch;i+=1;continue
        if ch=='{': d+=1
        elif ch=='}':
            d-=1
            if d==0:return i
        i+=1
    raise RuntimeError('unclosed css')

def nexttop(t,pos):
    i=pos;q=None;c=False;p=b=0
    while i<len(t):
        ch=t[i];nx=t[i+1] if i+1<len(t) else ''
        if c:
            if ch=='*' and nx=='/':c=False;i+=2;continue
            i+=1;continue
        if q:
            if ch=='\\':i+=2;continue
            if ch==q:q=None
            i+=1;continue
        if ch=='/' and nx=='*':c=True;i+=2;continue
        if ch in ('"',"'"):q=ch
        elif ch=='(':p+=1
        elif ch==')':p=max(0,p-1)
        elif ch=='[':b+=1
        elif ch==']':b=max(0,b-1)
        elif p==0 and b==0:
            if ch=='{':return 'block',i
            if ch==';':return 'semi',i
        i+=1
    return None,len(t)

def prefix_head(pre):
    i=0
    while True:
        while i<len(pre) and pre[i].isspace():i+=1
        if pre.startswith('/*',i):
            e=pre.find('*/',i+2)
            if e<0:break
            i=e+2;continue
        break
    return pre[:i],pre[i:]

def clean(text, stats):
    out=[];pos=0
    while pos<len(text):
        kind,at=nexttop(text,pos)
        if kind is None: out.append(text[pos:]);break
        if kind=='semi': out.append(text[pos:at+1]);pos=at+1;continue
        cl=brace(text,at);pre=text[pos:at];prefix,head=prefix_head(pre);h=head.strip();inner=text[at+1:cl]
        if h.startswith('@'):
            if h.lower().startswith(GROUP_AT):
                ci=clean(inner,stats)
                if re.sub(r'/\*[\s\S]*?\*/','',ci).strip(): out.append(prefix+head+'{'+ci+'}')
                else: stats['empty_at']+=1; out.append(prefix)
            elif h.lower().startswith('@keyframes') and any(t in h.lower() for t in GAME_TOKENS):
                stats['keyframes']+=1; out.append(prefix)
            else: out.append(pre+'{'+inner+'}')
        else:
            sels=split_sels(head); live=[s for s in sels if not dead(s)]
            removed=len(sels)-len(live)
            if removed:
                stats['selectors']+=removed
                if live:
                    stats['mixed']+=1; out.append(prefix+', '.join(live)+'{'+inner+'}')
                else:
                    stats['rules']+=1; out.append(prefix)
            else: out.append(pre+'{'+inner+'}')
        pos=cl+1
    return ''.join(out)

summary={'selectors':0,'rules':0,'mixed':0,'empty_at':0,'keyframes':0}
changed=[]
for p in TARGETS:
    old=p.read_text(encoding='utf-8'); st={k:0 for k in summary}; new=clean(old,st)
    if new!=old:
        p.write_text(new,encoding='utf-8'); changed.append((p.name,st,len(old),len(new)))
        for k in summary: summary[k]+=st[k]
for row in changed: print(row)
print('summary',summary)
if summary['selectors']<1: raise RuntimeError('No dead Games polish selectors found')
# idempotence
probe={k:0 for k in summary}
for p in TARGETS: clean(p.read_text(encoding='utf-8'),probe)
if probe['selectors'] or probe['keyframes']: raise RuntimeError(f'not idempotent {probe}')
# ensure no live polish game selectors remain outside legacy; comments ignored for selector check
for p in TARGETS:
    txt=re.sub(r'/\*[\s\S]*?\*/','',p.read_text(encoding='utf-8'))
    for token in ('#games','.games'):
        if token in txt.lower(): raise RuntimeError(f'{token} remains in {p.name}')

crit=CRIT.read_text(encoding='utf-8')
anchor="const bootSelfTest = read('app-boot-selftest.js');"
check="""\nconst activePolishCssFiles = ['styles-dashboard-fit.css','styles-admin-polish.css','styles-menu-polish.css','styles-stats-polish.css','styles-viewport-polish.css','styles-theme-polish.css','styles-release-polish.css','styles-dashboard-polish.css','styles-theme-propagation.css','styles-rotation-tasks.css'];\nfor (const cssFile of activePolishCssFiles) {\n  const css = read(cssFile).replace(/\\/\\*[\\s\\S]*?\\*\\//g, '');\n  assert(!/#games|\\.games/i.test(css), `Dead Games selector returned to ${cssFile}`);\n}\n"""
if 'Dead Games selector returned to' not in crit:
    if anchor not in crit: raise RuntimeError('critical anchor missing')
    crit=crit.replace(anchor,check+anchor,1)
CRIT.write_text(crit,encoding='utf-8')

app=APP.read_text(encoding='utf-8')
if '1.5.63' not in app: raise RuntimeError('app baseline not 1.5.63')
app=app.replace('const RAK_MODULE_CACHE_VERSION = "1.5.63";','const RAK_MODULE_CACHE_VERSION = "1.5.64";').replace('const RAK_DEV_UPDATE_BUILD = "v1.5.63";','const RAK_DEV_UPDATE_BUILD = "v1.5.64";')
APP.write_text(app,encoding='utf-8')
pkg=PKG.read_text(encoding='utf-8')
if '"version": "1.5.63"' not in pkg: raise RuntimeError('package baseline not 1.5.63')
PKG.write_text(pkg.replace('"version": "1.5.63"','"version": "1.5.64"'),encoding='utf-8')
sw=SW.read_text(encoding='utf-8')
if "const CACHE_VERSION = 'v1.5.63';" not in sw: raise RuntimeError('sw baseline not 1.5.63')
SW.write_text(sw.replace("const CACHE_VERSION = 'v1.5.63';","const CACHE_VERSION = 'v1.5.64';"),encoding='utf-8')
print('v1.5.64 OK', summary)
