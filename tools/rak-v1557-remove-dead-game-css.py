from pathlib import Path
import re

ROOT = Path('.')
CSS_FILES = [
    ROOT / 'styles-overrides-legacy-early.css',
    ROOT / 'styles-overrides-legacy-mid.css',
    ROOT / 'styles-overrides-legacy-late.css',
]
APP = ROOT / 'app.js'
PKG = ROOT / 'package.json'
SW = ROOT / 'sw.js'
CRITICAL = ROOT / 'tools/critical-runtime-smoke.mjs'

# Hry byly z HTML/runtime odstraněné už dříve. Tady mažeme pouze selektory patřící
# odstraněné herní ploše. Smíšená pravidla zachovají všechny živé selektory.
GAME_SELECTOR_RE = re.compile(
    r'(?:#games\b|body\.games[A-Za-z0-9_-]*\b|body\.tttOpen\b|#tttOverlay\b|'
    r'\.(?:games|game|ttt|snake|arcade|ships|flap|gomoku)[A-Za-z0-9_-]*\b)',
    re.I,
)
GAME_KEYFRAME_RE = re.compile(r'(?:2048|games?|ttt|snake|arcade|ships|flap|gomoku)', re.I)
COMMENT_RE = re.compile(r'/\*[\s\S]*?\*/')


def clean_for_match(text):
    return COMMENT_RE.sub('', text)


def is_game_selector(selector):
    return bool(GAME_SELECTOR_RE.search(clean_for_match(selector)))


def split_selector_list(text):
    parts = []
    start = 0
    paren = 0
    bracket = 0
    state = 'code'
    quote = ''
    i = 0
    while i < len(text):
        ch = text[i]
        nxt = text[i + 1] if i + 1 < len(text) else ''
        if state == 'code':
            if ch == '/' and nxt == '*':
                state = 'comment'
                i += 1
            elif ch in ('"', "'"):
                state = 'string'
                quote = ch
            elif ch == '(':
                paren += 1
            elif ch == ')':
                paren = max(0, paren - 1)
            elif ch == '[':
                bracket += 1
            elif ch == ']':
                bracket = max(0, bracket - 1)
            elif ch == ',' and paren == 0 and bracket == 0:
                parts.append(text[start:i])
                start = i + 1
        elif state == 'comment':
            if ch == '*' and nxt == '/':
                state = 'code'
                i += 1
        elif state == 'string':
            if ch == '\\':
                i += 1
            elif ch == quote:
                state = 'code'
        i += 1
    parts.append(text[start:])
    return parts


def next_top_level_token(text, start):
    state = 'code'
    quote = ''
    paren = 0
    bracket = 0
    i = start
    while i < len(text):
        ch = text[i]
        nxt = text[i + 1] if i + 1 < len(text) else ''
        if state == 'code':
            if ch == '/' and nxt == '*':
                state = 'comment'
                i += 1
            elif ch in ('"', "'"):
                state = 'string'
                quote = ch
            elif ch == '(':
                paren += 1
            elif ch == ')':
                paren = max(0, paren - 1)
            elif ch == '[':
                bracket += 1
            elif ch == ']':
                bracket = max(0, bracket - 1)
            elif paren == 0 and bracket == 0 and ch in '{;':
                return i, ch
        elif state == 'comment':
            if ch == '*' and nxt == '/':
                state = 'code'
                i += 1
        elif state == 'string':
            if ch == '\\':
                i += 1
            elif ch == quote:
                state = 'code'
        i += 1
    return len(text), ''


def matching_brace(text, open_pos):
    depth = 1
    state = 'code'
    quote = ''
    i = open_pos + 1
    while i < len(text):
        ch = text[i]
        nxt = text[i + 1] if i + 1 < len(text) else ''
        if state == 'code':
            if ch == '/' and nxt == '*':
                state = 'comment'
                i += 1
            elif ch in ('"', "'"):
                state = 'string'
                quote = ch
            elif ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0:
                    return i
        elif state == 'comment':
            if ch == '*' and nxt == '/':
                state = 'code'
                i += 1
        elif state == 'string':
            if ch == '\\':
                i += 1
            elif ch == quote:
                state = 'code'
        i += 1
    raise RuntimeError('Unclosed CSS block')


def process_scope(text, stats):
    out = []
    pos = 0
    while pos < len(text):
        token_pos, token = next_top_level_token(text, pos)
        if not token:
            out.append(text[pos:])
            break
        if token == ';':
            out.append(text[pos:token_pos + 1])
            pos = token_pos + 1
            continue

        prelude = text[pos:token_pos]
        close_pos = matching_brace(text, token_pos)
        body = text[token_pos + 1:close_pos]
        clean_prelude = clean_for_match(prelude).strip()

        if clean_prelude.startswith('@'):
            lower = clean_prelude.lower()
            if lower.startswith('@keyframes') or lower.startswith('@-webkit-keyframes'):
                if GAME_KEYFRAME_RE.search(clean_prelude):
                    stats['removed_at_rules'] += 1
                else:
                    out.append(text[pos:close_pos + 1])
            elif lower.startswith(('@media', '@supports', '@container', '@layer')):
                new_body = process_scope(body, stats)
                if clean_for_match(new_body).strip():
                    out.append(prelude + '{' + new_body + '}')
                else:
                    stats['removed_at_rules'] += 1
            else:
                out.append(text[pos:close_pos + 1])
        else:
            selectors = split_selector_list(prelude)
            game_flags = [is_game_selector(selector) for selector in selectors]
            if any(game_flags):
                kept = [selector for selector, is_game in zip(selectors, game_flags) if not is_game]
                stats['removed_selectors'] += sum(1 for flag in game_flags if flag)
                if not kept:
                    stats['removed_rules'] += 1
                else:
                    stats['trimmed_rules'] += 1
                    # Zachováme deklarace beze změny; mění se jen selector list.
                    new_prelude = ','.join(kept)
                    out.append(new_prelude + '{' + body + '}')
            else:
                out.append(text[pos:close_pos + 1])
        pos = close_pos + 1
    return ''.join(out)


def assert_no_game_selectors(text, file_name):
    # Stejný parser projde pravidla a hledá zbylé herní selectory; komentáře se ignorují.
    def walk(scope):
        pos = 0
        while pos < len(scope):
            token_pos, token = next_top_level_token(scope, pos)
            if not token:
                return
            if token == ';':
                pos = token_pos + 1
                continue
            prelude = scope[pos:token_pos]
            close_pos = matching_brace(scope, token_pos)
            body = scope[token_pos + 1:close_pos]
            clean_prelude = clean_for_match(prelude).strip()
            if clean_prelude.startswith('@'):
                lower = clean_prelude.lower()
                if lower.startswith(('@media', '@supports', '@container', '@layer')):
                    walk(body)
                elif (lower.startswith('@keyframes') or lower.startswith('@-webkit-keyframes')) and GAME_KEYFRAME_RE.search(clean_prelude):
                    raise RuntimeError(f'{file_name}: game keyframes survived: {clean_prelude[:100]}')
            else:
                for selector in split_selector_list(prelude):
                    if is_game_selector(selector):
                        raise RuntimeError(f'{file_name}: game selector survived: {clean_for_match(selector).strip()[:140]}')
            pos = close_pos + 1
    walk(text)


totals = {'removed_rules': 0, 'removed_selectors': 0, 'trimmed_rules': 0, 'removed_at_rules': 0}
for path in CSS_FILES:
    original = path.read_text(encoding='utf-8')
    stats = {'removed_rules': 0, 'removed_selectors': 0, 'trimmed_rules': 0, 'removed_at_rules': 0}
    cleaned = process_scope(original, stats)
    assert_no_game_selectors(cleaned, path.name)
    if len(cleaned) >= len(original):
        raise RuntimeError(f'{path.name}: cleanup did not shrink file')
    if len(cleaned) < 1000:
        raise RuntimeError(f'{path.name}: cleanup unexpectedly emptied file')
    path.write_text(cleaned, encoding='utf-8')
    for key in totals:
        totals[key] += stats[key]
    print(path.name, stats, 'bytes', len(original), '->', len(cleaned))

if totals['removed_rules'] < 100:
    raise RuntimeError(f'Too few dead game rules removed: {totals}')
if totals['trimmed_rules'] < 5:
    raise RuntimeError(f'Expected mixed live/game selector rules to be trimmed: {totals}')

# Version bump.
app = APP.read_text(encoding='utf-8')
if 'const RAK_MODULE_CACHE_VERSION = "1.5.56";' not in app:
    raise RuntimeError('app.js v1.5.56 cache version anchor not found')
app = app.replace('const RAK_MODULE_CACHE_VERSION = "1.5.56";', 'const RAK_MODULE_CACHE_VERSION = "1.5.57";', 1)
app = app.replace('const RAK_DEV_UPDATE_BUILD = "v1.5.56";', 'const RAK_DEV_UPDATE_BUILD = "v1.5.57";', 1)
APP.write_text(app, encoding='utf-8')

pkg = PKG.read_text(encoding='utf-8')
if '"version": "1.5.56"' not in pkg:
    raise RuntimeError('package.json v1.5.56 version anchor not found')
PKG.write_text(pkg.replace('"version": "1.5.56"', '"version": "1.5.57"', 1), encoding='utf-8')

sw = SW.read_text(encoding='utf-8')
if "const CACHE_VERSION = 'v1.5.56';" not in sw:
    raise RuntimeError('sw.js v1.5.56 cache version anchor not found')
SW.write_text(sw.replace("const CACHE_VERSION = 'v1.5.56';", "const CACHE_VERSION = 'v1.5.57';", 1), encoding='utf-8')

# Runtime guard: Hry se nesmí vrátit ani do aktivních legacy CSS selectorů.
critical = CRITICAL.read_text(encoding='utf-8')
critical = critical.replace(
    "assert(stylesOverridesLegacyEarlyCss.length > 100000, 'CSS legacy early vrstva je neočekávaně malá');",
    "assert(stylesOverridesLegacyEarlyCss.length > 1000, 'CSS legacy early vrstva chybí nebo je neočekávaně malá');"
)
critical = critical.replace(
    "assert(stylesOverridesLegacyMidCss.length > 100000, 'CSS legacy mid vrstva je neočekávaně malá');",
    "assert(stylesOverridesLegacyMidCss.length > 1000, 'CSS legacy mid vrstva chybí nebo je neočekávaně malá');"
)
critical = critical.replace(
    "assert(stylesOverridesLegacyLateCss.length > 100000, 'CSS legacy late vrstva je neočekávaně malá');",
    "assert(stylesOverridesLegacyLateCss.length > 1000, 'CSS legacy late vrstva chybí nebo je neočekávaně malá');"
)
anchor = "assert(cssLegacyEarlyPos >= 0 && cssLegacyEarlyPos < cssLegacyMidPos && cssLegacyMidPos < cssLegacyLatePos && cssLegacyLatePos < cssDashboardFitPos, 'CSS legacy vrstvy musí zachovat původní cascade pořadí před Dashboard fit');"
checks = """
const legacyCssWithoutComments = [stylesOverridesLegacyEarlyCss, stylesOverridesLegacyMidCss, stylesOverridesLegacyLateCss]
  .join('\\n')
  .replace(/\\/\\*[\\s\\S]*?\\*\\//g, '');
for (const deadGameCssMarker of ['#games', 'body.gamesOpen', 'body.gamesCompactMode', 'body.tttOpen', '#tttOverlay']) {
  assert(!legacyCssWithoutComments.includes(deadGameCssMarker), 'Po odstranění Her zůstal legacy CSS marker ' + deadGameCssMarker);
}
assert(!/\\.(?:games|game|ttt|snake|arcade|ships|flap|gomoku)[A-Za-z0-9_-]*\\b/i.test(legacyCssWithoutComments), 'Po odstranění Her zůstal herní legacy CSS selector');
""".strip()
if 'legacyCssWithoutComments' not in critical:
    if anchor not in critical:
        raise RuntimeError('critical CSS order guard anchor not found')
    critical = critical.replace(anchor, anchor + '\n' + checks, 1)
CRITICAL.write_text(critical, encoding='utf-8')

print('v1.5.57 dead game CSS cleanup OK', totals)
