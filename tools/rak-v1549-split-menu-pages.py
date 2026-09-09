from pathlib import Path


def replace_exact(path, old, new, count=1):
    p = Path(path)
    text = p.read_text()
    actual = text.count(old)
    if actual != count:
        raise SystemExit(f'{path}: expected {count} occurrence(s), found {actual}: {old!r}')
    p.write_text(text.replace(old, new, count))


def matching_brace(text, open_idx):
    if text[open_idx] != '{':
        raise SystemExit('matching_brace: index is not opening brace')
    depth = 0
    i = open_idx
    state = 'normal'
    escaped = False
    while i < len(text):
        ch = text[i]
        nxt = text[i + 1] if i + 1 < len(text) else ''
        if state == 'normal':
            if ch == "'":
                state = 'single'; escaped = False
            elif ch == '"':
                state = 'double'; escaped = False
            elif ch == '`':
                state = 'template'; escaped = False
            elif ch == '/' and nxt == '/':
                state = 'line'; i += 1
            elif ch == '/' and nxt == '*':
                state = 'block'; i += 1
            elif ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0:
                    return i
        elif state in ('single', 'double', 'template'):
            if escaped:
                escaped = False
            elif ch == '\\':
                escaped = True
            elif (state == 'single' and ch == "'") or (state == 'double' and ch == '"') or (state == 'template' and ch == '`'):
                state = 'normal'
        elif state == 'line':
            if ch == '\n':
                state = 'normal'
        elif state == 'block':
            if ch == '*' and nxt == '/':
                state = 'normal'; i += 1
        i += 1
    raise SystemExit('matching_brace: no closing brace')


def extract_condition_body(text, condition, helper_call):
    if text.count(condition) != 1:
        raise SystemExit(f'app-menu.js: condition {condition!r} count={text.count(condition)}')
    cond_idx = text.index(condition)
    open_idx = text.index('{', cond_idx)
    close_idx = matching_brace(text, open_idx)
    body = text[open_idx + 1:close_idx]
    replacement = '{\n      ' + helper_call + '\n      return;\n    }'
    return text[:open_idx] + replacement + text[close_idx + 1:], body


# Version and boot wiring.
replace_exact('app.js', 'const RAK_MODULE_CACHE_VERSION = "1.5.48";', 'const RAK_MODULE_CACHE_VERSION = "1.5.49";')
replace_exact('app.js', 'const RAK_DEV_UPDATE_BUILD = "v1.5.48";', 'const RAK_DEV_UPDATE_BUILD = "v1.5.49";')
replace_exact('package.json', '"version": "1.5.48"', '"version": "1.5.49"')
replace_exact('sw.js', "const CACHE_VERSION = 'v1.5.48';", "const CACHE_VERSION = 'v1.5.49';")
replace_exact(
    'app.js',
    '    "app-menu.js",\n    "app-menu-profile.js",\n    "app-menu-shift-report.js",\n',
    '    "app-menu.js",\n    "app-menu-pages.js",\n    "app-menu-bug-report.js",\n    "app-menu-profile.js",\n    "app-menu-shift-report.js",\n'
)
replace_exact(
    'package.json',
    'node --check app-menu.js && node --check app-menu-profile.js && node --check app-menu-shift-report.js',
    'node --check app-menu.js && node --check app-menu-pages.js && node --check app-menu-bug-report.js && node --check app-menu-profile.js && node --check app-menu-shift-report.js'
)

# Split bug-report implementation as one contiguous ownership block.
p = Path('app-menu.js')
text = p.read_text()
bug_start_marker = "const RAK_REPORTS_KEY = APP_KEY + ':userReports';"
if text.count(bug_start_marker) != 1:
    raise SystemExit('app-menu.js: bug report start marker not unique')
bug_start = text.index(bug_start_marker)
handler_marker = 'async function handleBugReportAction(action)'
if text.count(handler_marker) != 1:
    raise SystemExit('app-menu.js: bug report handler marker not unique')
handler_idx = text.index(handler_marker)
handler_open = text.index('{', handler_idx)
handler_close = matching_brace(text, handler_open)
bug_end = handler_close + 1
while bug_end < len(text) and text[bug_end] in '\r\n':
    bug_end += 1
bug_block = text[bug_start:bug_end].rstrip() + '\n'
text = text[:bug_start] + text[bug_end:]

# Split ordinary menu page render bodies without rewriting their internal HTML/logic.
text, about_body = extract_condition_body(text, "v === 'about'", 'renderAppMenuAboutPage(body, versionText);')
text, contact_body = extract_condition_body(text, "v === 'contact'", 'renderAppMenuContactPage(body, versionText);')
text, settings_body = extract_condition_body(text, "v === 'settings'", 'renderAppMenuSettingsPage(body, versionText);')
p.write_text(text)

pages = """// RaK – běžné stránky menu oddělené od admin shellu.\ntry { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('app-menu-pages.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}\n\nfunction renderAppMenuAboutPage(body, versionText) {""" + about_body + """\n}\n\nfunction renderAppMenuContactPage(body, versionText) {""" + contact_body + """\n}\n\nfunction renderAppMenuSettingsPage(body, versionText) {""" + settings_body + """\n}\n"""
Path('app-menu-pages.js').write_text(pages)

bug_file = """// RaK – uživatelský report chyby oddělený od menu shellu.\ntry { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('app-menu-bug-report.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}\n\n""" + bug_block
Path('app-menu-bug-report.js').write_text(bug_file)

# Strong migration assertions before repository checks.
menu = Path('app-menu.js').read_text()
pages_now = Path('app-menu-pages.js').read_text()
bug_now = Path('app-menu-bug-report.js').read_text()
if 'function formatBugReportMessage' in menu or 'function renderBugReportMenuBody' in menu or 'async function handleBugReportAction' in menu:
    raise SystemExit('app-menu.js: bug-report implementation was not fully extracted')
if 'const devBuildLine' in menu or 'const privacyCard' in menu:
    raise SystemExit('app-menu.js: ordinary page implementation still remains in shell')
for required in ('function renderAppMenuAboutPage', 'function renderAppMenuContactPage', 'function renderAppMenuSettingsPage', 'Testovací build:', 'privacyCard'):
    if required not in pages_now:
        raise SystemExit('app-menu-pages.js missing ' + required)
for required in ('function getBugReportAccount', 'function buildBugReportPayload', 'function formatBugReportMessage', 'function renderBugReportMenuBody', 'async function handleBugReportAction'):
    if required not in bug_now:
        raise SystemExit('app-menu-bug-report.js missing ' + required)
for required in ('renderAppMenuAboutPage(body, versionText)', 'renderAppMenuContactPage(body, versionText)', 'renderAppMenuSettingsPage(body, versionText)'):
    if required not in menu:
        raise SystemExit('app-menu.js missing delegated page call ' + required)

# Smoke guards for the new ownership split.
smoke = Path('tools/critical-runtime-smoke.mjs').read_text()
smoke = smoke.replace(
    "const appMenuJs = read('app-menu.js');\n",
    "const appMenuJs = read('app-menu.js');\nconst appMenuPagesJs = read('app-menu-pages.js');\nconst appMenuBugReportJs = read('app-menu-bug-report.js');\n",
    1
)
old_guard = "assert(appMenuJs.includes('Testovací build: '), 'O aplikaci musí renderovat testovací build přímo z app-menu.js');\n"
new_guard = """assert(deferred.includes('app-menu-pages.js'), 'Běžné menu stránky musí zůstat součástí ověřeného bootu');\nassert(deferred.includes('app-menu-bug-report.js'), 'Bug-report menu modul musí zůstat součástí ověřeného bootu');\nassert(appMenuPagesJs.includes('function renderAppMenuAboutPage'), 'O aplikaci musí vlastnit app-menu-pages.js');\nassert(appMenuPagesJs.includes('function renderAppMenuContactPage'), 'Kontakt musí vlastnit app-menu-pages.js');\nassert(appMenuPagesJs.includes('function renderAppMenuSettingsPage'), 'Nastavení musí vlastnit app-menu-pages.js');\nassert(appMenuPagesJs.includes('Testovací build: '), 'O aplikaci musí dál zobrazovat testovací build');\nassert(!appMenuJs.includes('const devBuildLine'), 'O aplikaci se nesmí vrátit do app-menu.js shellu');\nassert(!appMenuJs.includes('const privacyCard'), 'Běžné Nastavení se nesmí vrátit do app-menu.js shellu');\nassert(appMenuBugReportJs.includes('function formatBugReportMessage'), 'Bug report formatter musí vlastnit app-menu-bug-report.js');\nassert(appMenuBugReportJs.includes('async function handleBugReportAction'), 'Bug report odeslání musí vlastnit app-menu-bug-report.js');\nassert(!appMenuJs.includes('function formatBugReportMessage'), 'Bug-report implementace se nesmí vrátit do app-menu.js shellu');\n"""
if smoke.count(old_guard) != 1:
    raise SystemExit('critical-runtime-smoke: old app-menu build guard not unique')
smoke = smoke.replace(old_guard, new_guard, 1)
Path('tools/critical-runtime-smoke.mjs').write_text(smoke)
