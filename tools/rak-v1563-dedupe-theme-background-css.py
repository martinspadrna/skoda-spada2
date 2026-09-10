from pathlib import Path
import re

ROOT=Path('.')
LEGACY=[ROOT/'styles-overrides-legacy-early.css',ROOT/'styles-overrides-legacy-mid.css',ROOT/'styles-overrides-legacy-late.css']
OWNERS=[ROOT/'styles-theme-polish.css',ROOT/'styles-theme-propagation.css',ROOT/'styles-viewport-polish.css',ROOT/'styles-release-polish.css']
EARLY=LEGACY[0]; CRITICAL=ROOT/'tools/critical-runtime-smoke.mjs'; APP=ROOT/'app.js'; PKG=ROOT/'package.json'; SW=ROOT/'sw.js'
GROUP_AT_RULES=('@media','@supports','@container','@layer','@scope','@document')

def norm(s):
    s=re.sub(r'\s+',' ',s.strip()); s=re.sub(r'\s*([>+~])\s*',r' \1 ',s); return re.sub(r'\s+',' ',s).strip()
def nctx(s): return re.sub(r'\s+',' ',s.strip())
def split_sel(s):
    out=[]; start=0; par=br=0; q=None; esc=False
    for i,ch in enumerate(s):
        if q:
            if esc: esc=False
            elif ch=='\\': esc=True
            elif ch==q: q=None
            continue
        if ch in ('"',"'"): q=ch
        elif ch=='(': par+=1
        elif ch==')': par=max(0,par-1)
        elif ch=='[': br+=1
        elif ch==']': br=max(0,br-1)
        elif ch==',' and par==0 and br==0: out.append(s[start:i].strip()); start=i+1
    out.append(s[start:].strip()); return [x for x in out if x]
def in_scope(sel):
    s=norm(sel).lower()
    if any(x in s for x in ('#home','#dash','#rotace','#stats','#menu','#admin','#appmenu','.card','.tile','.dashboard','.rotace','.stats','.calc','.appmenu','.admin')): return False
    return s==':root' or s=='html' or s=='body' or s.startswith('html.') or s.startswith('body.') or s.startswith('html ') or s.startswith('body ')
def match_brace(t,o):
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
        if ch=='{':d+=1
        elif ch=='}':
            d-=1
            if d==0:return i
        i+=1
    raise RuntimeError('Unclosed CSS block')
def prefix_head(p):
    i=0
    while True:
        while i<len(p) and p[i].isspace():i+=1
        if p.startswith('/*',i):
            e=p.find('*/',i+2)
            if e<0:break
            i=e+2;continue
        break
    return p[:i],p[i:]
def next_top(t,pos):
    i=pos;q=None;c=False;par=br=0
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
        elif ch=='(':par+=1
        elif ch==')':par=max(0,par-1)
        elif ch=='[':br+=1
        elif ch==']':br=max(0,br-1)
        elif par==0 and br==0:
            if ch=='{':return 'block',i
            if ch==';':return 'semi',i
        i+=1
    return None,len(t)
def decl_segments(body):
    seg=[];start=0;i=0;q=None;c=False;par=br=0
    while i<len(body):
        ch=body[i];nx=body[i+1] if i+1<len(body) else ''
        if c:
            if ch=='*' and nx=='/':c=False;i+=2;continue
            i+=1;continue
        if q:
            if ch=='\\':i+=2;continue
            if ch==q:q=None
            i+=1;continue
        if ch=='/' and nx=='*':c=True;i+=2;continue
        if ch in ('"',"'"):q=ch
        elif ch=='(':par+=1
        elif ch==')':par=max(0,par-1)
        elif ch=='[':br+=1
        elif ch==']':br=max(0,br-1)
        elif ch==';' and par==0 and br==0:seg.append(body[start:i+1]);start=i+1
        i+=1
    if start<len(body):seg.append(body[start:])
    return seg
def parse_decl(seg):
    clean=re.sub(r'/\*[\s\S]*?\*/','',seg).strip()
    if not clean:return None
    if clean.endswith(';'):clean=clean[:-1].rstrip()
    q=None;par=br=0;colon=-1;i=0
    while i<len(clean):
        ch=clean[i]
        if q:
            if ch=='\\':i+=2;continue
            if ch==q:q=None
        elif ch in ('"',"'"):q=ch
        elif ch=='(':par+=1
        elif ch==')':par=max(0,par-1)
        elif ch=='[':br+=1
        elif ch==']':br=max(0,br-1)
        elif ch==':' and par==0 and br==0:colon=i;break
        i+=1
    if colon<=0:return None
    prop=clean[:colon].strip();val=clean[colon+1:].strip()
    if not re.match(r'^(?:--[A-Za-z0-9_-]+|-?[A-Za-z][A-Za-z0-9_-]*)$',prop):return None
    return (prop if prop.startswith('--') else prop.lower(), bool(re.search(r'!\s*important\s*$',val,re.I)))
def collect(text,ctx=(),out=None):
    if out is None:out={}
    pos=0
    while pos<len(text):
        kind,at=next_top(text,pos)
        if kind is None:break
        if kind=='semi':pos=at+1;continue
        close=match_brace(text,at);pre=text[pos:at];_,head=prefix_head(pre);st=head.strip();inner=text[at+1:close]
        if st.startswith('@'):
            if st.lower().startswith(GROUP_AT_RULES):collect(inner,ctx+(nctx(st),),out)
        else:
            decls=[parse_decl(x) for x in decl_segments(inner)]
            for sel in [norm(x) for x in split_sel(head)]:
                props=out.setdefault((ctx,sel),{})
                for d in decls:
                    if d:props[d[0]]=d[1]
        pos=close+1
    return out
def overridden(idx,ctx,sel,prop,imp):
    props=idx.get((ctx,norm(sel))); return bool(props and prop in props and (props[prop] or not imp))
def dedupe(text,idx,ctx=(),stats=None):
    if stats is None:stats={'removed_declarations':0,'removed_rules':0,'trimmed_rules':0,'removed_empty_at_rules':0}
    out=[];pos=0
    while pos<len(text):
        kind,at=next_top(text,pos)
        if kind is None:out.append(text[pos:]);break
        if kind=='semi':out.append(text[pos:at+1]);pos=at+1;continue
        close=match_brace(text,at);pre=text[pos:at];prefix,head=prefix_head(pre);st=head.strip();inner=text[at+1:close]
        if st.startswith('@'):
            if st.lower().startswith(GROUP_AT_RULES):
                cleaned=dedupe(inner,idx,ctx+(nctx(st),),stats)
                if re.sub(r'/\*[\s\S]*?\*/','',cleaned).strip():out.append(prefix+head+'{'+cleaned+'}')
                else:stats['removed_empty_at_rules']+=1;out.append(prefix)
            else:out.append(pre+'{'+inner+'}')
        else:
            sels=split_sel(head);scoped=bool(sels) and all(in_scope(x) for x in sels)
            if not scoped:out.append(pre+'{'+inner+'}')
            else:
                kept=[];removed=0
                for seg in decl_segments(inner):
                    d=parse_decl(seg)
                    if d and all(overridden(idx,ctx,s,d[0],d[1]) for s in sels):removed+=1
                    else:kept.append(seg)
                if removed:
                    stats['removed_declarations']+=removed;body=''.join(kept)
                    if re.sub(r'/\*[\s\S]*?\*/','',body).strip():stats['trimmed_rules']+=1;out.append(pre+'{'+body+'}')
                    else:stats['removed_rules']+=1;out.append(prefix)
                else:out.append(pre+'{'+inner+'}')
        pos=close+1
    return ''.join(out)

idx={}
for p in OWNERS:collect(p.read_text(encoding='utf-8'),(),idx)
summary={'removed_declarations':0,'removed_rules':0,'trimmed_rules':0,'removed_empty_at_rules':0}
for p in LEGACY:
    old=p.read_text(encoding='utf-8');st={k:0 for k in summary};new=dedupe(old,idx,(),st);p.write_text(new,encoding='utf-8')
    for k in summary:summary[k]+=st[k]
    print(p.name,st,'bytes',len(old),'->',len(new))
if summary['removed_declarations']<1:raise RuntimeError(f'No proven theme/background cleanup found: {summary}')
second={k:0 for k in summary}
for p in LEGACY:
    st={k:0 for k in summary};dedupe(p.read_text(encoding='utf-8'),idx,(),st)
    for k in second:second[k]+=st[k]
if second['removed_declarations']!=0:raise RuntimeError(f'Cleanup not idempotent: {second}')
marker='''/* RaK v1.5.63 – proven theme/background legacy dedupe.\n   Cleanup je omezený na :root/html/body a jejich stavové varianty.\n   Dashboard, Rotace, menu, admin, karty a další komponenty jsou záměrně mimo scope. */\n'''
early=EARLY.read_text(encoding='utf-8')
if 'RaK v1.5.63 – proven theme/background legacy dedupe' not in early:EARLY.write_text(marker+early.lstrip(),encoding='utf-8')
critical=CRITICAL.read_text(encoding='utf-8')
anchor="const stylesReleasePolishCss = read('styles-release-polish.css');"
if "const stylesThemePolishCss = read('styles-theme-polish.css');" not in critical:
    critical=critical.replace(anchor,anchor+"\nconst stylesThemePolishCss = read('styles-theme-polish.css');\nconst stylesThemePropagationCss = read('styles-theme-propagation.css');",1)
check="""\nassert(stylesOverridesLegacyEarlyCss.includes('RaK v1.5.63 – proven theme/background legacy dedupe'), 'Chybí v1.5.63 theme cleanup marker');\nassert(stylesThemePolishCss.includes('--rakThemeAccentStrong'), 'Theme polish musí dál vlastnit theme proměnné');\nassert(stylesThemePolishCss.includes('background:var(--rakAppBackground'), 'Theme polish musí dál vlastnit app background');\nassert(stylesThemePropagationCss.length > 500, 'Theme propagation owner nesmí zmizet');\n"""
if 'v1.5.63 theme cleanup marker' not in critical:
    ca="const bootSelfTest = read('app-boot-selftest.js');";critical=critical.replace(ca,check+ca,1)
CRITICAL.write_text(critical,encoding='utf-8')
app=APP.read_text(encoding='utf-8')
if '1.5.62' not in app:raise RuntimeError('app baseline not 1.5.62')
app=app.replace('const RAK_MODULE_CACHE_VERSION = "1.5.62";','const RAK_MODULE_CACHE_VERSION = "1.5.63";').replace('const RAK_DEV_UPDATE_BUILD = "v1.5.62";','const RAK_DEV_UPDATE_BUILD = "v1.5.63";')
APP.write_text(app,encoding='utf-8')
pkg=PKG.read_text(encoding='utf-8')
if '"version": "1.5.62"' not in pkg:raise RuntimeError('package baseline not 1.5.62')
PKG.write_text(pkg.replace('"version": "1.5.62"','"version": "1.5.63"'),encoding='utf-8')
sw=SW.read_text(encoding='utf-8')
if "const CACHE_VERSION = 'v1.5.62';" not in sw:raise RuntimeError('sw baseline not 1.5.62')
SW.write_text(sw.replace("const CACHE_VERSION = 'v1.5.62';","const CACHE_VERSION = 'v1.5.63';"),encoding='utf-8')
print('v1.5.63 theme/background legacy dedupe OK',summary)
