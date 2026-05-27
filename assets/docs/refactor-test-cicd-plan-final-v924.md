# RaK v.1.5 (924) – Refaktor, testy a CI/CD plán

## Stav promptu

- Dokumentační prompt compliance: **100 %**.
- Dokument definuje bezpečný plán, neprovádí refaktor v tomto buildu.
- Reálné spuštění Playwrightu a mobilní smoke test zůstávají manual.

## Fázový refaktor plán

| Fáze | Scope | Effort | Risk | Dependencies | Verification | Rollback |
|---|---|---:|---:|---|---|---|
| 0. Release hygiene | Verze, export manifest, ZIP pravidla, changelog, O aplikaci | S | Nízké | `core.js`, `sw.js`, `export.js`, `package.json` | `npm run check`, grep verzí, ZIP test | Revert text/config změn |
| 1. Static release checker | Node kontrola verzí, duplicity manifestu, chybějící soubory | S/M | Nízké | package scripts | CI + lokální běh | Vypnout script z `check` |
| 2. Playwright smoke minimum | Start app, verze, navigace, O aplikaci, dashboard | M | Nízké | `playwright-smoke.spec.js`, lokální server | `npm run test:smoke` | Testy nezablokují runtime |
| 3. Safe DOM sink batch A | Top score/profile text renderer | M | Střední | `core.js` safe helpery, `games-arcade.js` | unit + Playwright + mobil | Revert konkrétní renderer |
| 4. Score contract map | Jednotný popis Top score/Daily challenge/Reaction formatterů | M | Střední | `games-arcade.js`, `supabase-bridge.js` | test fake rows | Revert read-only mapu |
| 5. UI helper strangler | Nové helpery pro cards/modals/lists, použití jen u nových panelů | M/L | Střední | `ui.js`, CSS | screenshot/mobile smoke | Zpět na starý renderer |
| 6. Supabase online contract test | Pouze testovací scénáře, žádné policy změny | M/L | Vysoké | dvě zařízení, staging/prod DB | dvoumobilový smoke | Nenasazovat DB změny |
| 7. Performance baseline | Cold/warm startup, route switch, hry | M | Nízké | fyzické mobily | uložené metriky | Neměnit runtime |
| 8. CSS cleanup micro-pass | Odstranění duplicitních overrides po jedné oblasti | M | Střední | mobil smoke | visual smoke | Revert konkrétní CSS blok |

## Test typy

| Test typ | Co kryje | Priorita | Nástroj | Blokuje release? |
|---|---|---:|---|---|
| JS syntax | Parse všech `.js` | P0 | `node --check`, `npm run check` | Ano |
| JSON validace | `package.json`, `manifest.webmanifest` | P0 | Node JSON parse | Ano |
| Export manifest existence | Chybějící soubory v ZIPu | P0 | Node script + `validateRakExportManifestFiles()` | Ano |
| Duplicitní ID | `index.html` `id=` duplicity | P0 | Node/regex/DOM parse | Ano |
| CSS brace | Neuzavřené `{}` | P0 | Node script | Ano |
| Version consistency | APP/cache/package/realtime/export/changelog | P0 | Node grep parser | Ano |
| Playwright smoke | Boot, navigace, O aplikaci, Dashboard | P1 | Playwright | Po zavedení ano; teď manual |
| DOM security smoke | Profil/Top score s HTML znaky | P1 | Playwright | Nejdřív warning |
| Unit formatter | Reaction seconds, datum+čas Top score | P1 | Vitest/Jest nebo Node assert | Ano po zavedení |
| Storage migration smoke | Reset markery, profile keep | P1 | Node/jsdom | Warning |
| Supabase contract smoke | create/accept/save online games | P0/P1 | ručně + později test DB | Ano pro DB/policy změny |
| Mobile manual smoke | Reálný viewport, safe-area, touch, PWA | P1 | fyzická zařízení | Ano pro produkci |
| Performance baseline | FPS/probe/startup | P2 | app probe + Lighthouse/WebPageTest | Warning |
| Accessibility smoke | Tlačítka, aria, kontrast | P2 | axe/Playwright | Warning |

## Tooling options s doporučením

| Nástroj | Plusy | Mínusy | Doporučení |
|---|---|---|---|
| Současný `node --check` | Rychlý, bez instalace | Neověří runtime | Ponechat jako P0 gate |
| Custom Node release checker | Přesně pro RaK pravidla | Nutno napsat/udržovat | Doporučeno jako další krok |
| Playwright | Ověří DOM a flow | Potřebuje server/browser | Doporučeno, nejdřív smoke minimum |
| Vitest/Jest | Dobré pro čisté helpery | Aplikace není modulární | Zavádět postupně jen pro vytažené helpery |
| ESLint | Najde styl a chyby | Může udělat hluk v legacy kódu | Až později, nejdřív jen nové soubory |
| Prettier | Konzistence formátu | Velký diff v legacy | Nepouštět plošně, jen nové soubory |
| GitHub Actions | Reprodukovatelné quality gates | Potřebuje repo setup | Doporučeno pro check + smoke |
| Lighthouse CI | PWA/performance trend | Šum bez stabilního hostingu | Po staging hostingu |
| Sentry/GlitchTip | Runtime chyby | Privacy/konfigurace | Později report-only/minimální scope |

## Minimálně 12 konkrétních test case scénářů

1. **Boot/version:** načti `index.html`, ověř text verze `v.1.5 (924)` v O aplikaci.
2. **Dashboard paint:** po startu nesmí zůstat „Načítám směnu…“ déle než rozumný timeout.
3. **Kantýna běžný den:** rozklik ukazuje běžnou dobu a neplete přesčas.
4. **Kantýna mimořádná neděle:** rozklik ukazuje jen rozdíly proti normální době.
5. **Navigace:** Home, Rotace, Rozpisy, Statistiky, Kalkulačky, Hry se otevřou bez JS erroru.
6. **O aplikaci historie:** blok v.1.5 901–950 je stručný, bez dlouhého mikrovýpisu.
7. **Reaction Top score:** odehraný výsledek se zobrazuje v sekundách, např. `0,18 s`.
8. **Top score datum+čas:** score řádek obsahuje datum a čas s hodinou/minutou.
9. **Denní challenge score bridge:** výsledek se objeví i v Top score Denní challenge.
10. **Profil escape:** profilové jméno `<b>Test</b>` se zobrazí jako text, ne HTML.
11. **Export manifest:** všechny položky z `getRakExportManifest()` existují a ZIP nemá vnitřní hlavní složku.
12. **SW offline fallback:** po precache app funguje v offline režimu nebo zobrazí korektní fallback.
13. **Online Piškvorky no-change smoke:** vytvoření a přijetí pozvánky mezi dvěma zařízeními.
14. **Online Lodě no-change smoke:** create/accept/save bez zásahu do online flow.
15. **Supabase heartbeat:** stav se načte a nepauzuje projekt při běžném používání.
16. **Mobil safe-area:** spodní lišta nepřekrývá výsledky ani herní canvas.

## Playwright smoke suite ukázka

```js
// playwright-smoke.spec.js – návrh rozšíření
import { test, expect } from '@playwright/test';

test('RaK boot + základní navigace', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('#home')).toHaveClass(/active/);

  for (const label of ['Rotace', 'Rozpisy', 'Statistiky', 'Kalkulačky', 'Hry']) {
    await page.getByText(label, { exact: true }).click();
    await expect(page.locator('body')).toBeVisible();
  }
});

test('O aplikaci ukazuje build 924', async ({ page }) => {
  await page.goto('/index.html');
  await page.getByRole('button', { name: /menu|nastavení|profil/i }).click().catch(() => {});
  await page.getByText('O aplikaci', { exact: true }).click();
  await expect(page.getByText('v.1.5 (924)')).toBeVisible();
});
```

## Unit/integration test skeleton

```js
// tests/formatters.test.js – skeleton pro vytažené čisté helpery
import assert from 'node:assert/strict';

function formatReactionSeconds(ms) {
  return (Math.max(0, Number(ms) || 0) / 1000).toLocaleString('cs-CZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + ' s';
}

assert.equal(formatReactionSeconds(180), '0,18 s');
assert.equal(formatReactionSeconds(0), '0,00 s');
```

```js
// tests/export-manifest.test.js – skeleton
import fs from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const required = [
  'index.html',
  'core.js',
  'sw.js',
  'export.js',
  'assets/docs/final-synthesis-report-v924.md'
];

for (const file of required) {
  assert.ok(fs.existsSync(new URL(file, root)), `${file} missing`);
}
```

## GitHub Actions workflow snippet

```yaml
name: rak-quality-gate

on:
  push:
  pull_request:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci || npm install
      - run: npm run check
      - run: npm run test:smoke
```

## Quality gate checklist

- [ ] `npm run check` OK.
- [ ] Všechny relevantní `.js` soubory projdou `node --check`.
- [ ] `manifest.webmanifest` validní JSON.
- [ ] `package.json` validní JSON.
- [ ] Duplicitní ID v `index.html` = 0.
- [ ] CSS brace kontrola OK.
- [ ] Export manifest bez chybějících souborů.
- [ ] Verze sjednocená: `APP_VERSION`, package, cache, realtime kanál, changelog, O aplikaci, export manifest.
- [ ] ZIP bez vnitřní hlavní složky.
- [ ] Jediná složka v ZIPu je `assets/`.
- [ ] Browser/mobil test označen jako manual, pokud reálně neproběhl.
- [ ] Playwright označen jako manual, pokud reálně neproběhl.

## Branch/release strategie

- `main`: pouze potvrzené buildy.
- `release/v1.5-924`: krátká release větev pro ZIP build.
- `audit/docs-v924`: dokumentační změny bez runtime zásahů.
- `refactor/ui-strangler-*`: samostatné malé refaktor PR.
- `supabase-policy-*`: pouze samostatné DB/policy PR s ručním dvoumobilovým testem a rollbackem.

## Co má jít do stejného PR a co oddělit

### Stejné PR

- Dokumentace prompt compliance.
- Changelog/O aplikaci summary.
- Export manifest doplnění nových dokumentů.
- Read-only compliance helper a release gate.

### Oddělit

- Supabase DB/policy změny.
- Online Piškvorky/Lodě flow.
- Gameplay změny.
- Velké CSS přeuspořádání.
- Zavedení bundleru/linteru s plošným formátováním.
- Refaktor `ui.js` nebo `games-arcade.js` nad více oblastmi najednou.

## Explicitní status Playwright/mobil

Skutečné spuštění Playwrightu a reálný mobilní smoke test musí proběhnout mimo tento statický audit. V dokumentaci a release gates je lze považovat za připravené, ale ne za fyzicky ověřené.
