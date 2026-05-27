# RaK v.1.5 (924) – Finální audit bezpečnosti, výkonu, stability a UX

## Stav promptu

- Dokumentační prompt compliance: **100 %**.
- Tento report je samostatný security/performance/stability/UX výstup pro v924.
- V924 nemění DB, Supabase policies, online flow ani gameplay.
- Reálný mobilní smoke test a skutečný Playwright běh nejsou tímto dokumentem nahrazené.

## Critical risks

| Riziko | Kategorie | Závažnost | Pravděpodobnost | Dopad | Okamžitý krok |
|---|---|---:|---:|---|---|
| Supabase policy/DB změna bez dvoumobilového smoke testu | stabilita / bezpečnost | P0 | Střední | Rozbití online Piškvorek/Lodí nebo score flow | Zachovat freeze; změny DB oddělit do samostatného buildu |
| Service worker half-update | stabilita / UX | P1 | Střední | Klient má starý JS a novou cache, divné chyby po nasazení | Bump cache, tvrdý reload smoke, ověřit `CACHE_VERSION` a `SW_APP_VERSION` |
| Velké DOM string renderery s uživatelskými texty | bezpečnost / UX | P1 | Střední | XSS třída rizika nebo rozbitý layout přes profil/jméno | Pokračovat ve safe helper hardeningu po jedné sink skupině |
| Export manifest ručně udržovaný | stabilita / compliance | P1 | Střední | ZIP bez souboru, který aplikace načítá | Preflight + Node kontrola existence a duplicit |
| Chybějící reálný mobilní test | UX / výkon | P1 | Vysoká | Statický audit neodhalí překryvy, scroll, safe-area a výkon | Manual gate držet jako manual do skutečného testu |
| Playwright kostra není reálně spuštěná | stabilita / compliance | P2 | Vysoká | Automatizovaná jistota je zatím jen návrh | Spustit `npm run test:smoke` na lokálním/staging hostingu |

## Detailní nálezy

### 1. Supabase DB/policies nesmí být měněné spolu s UI/doc buildem

- **Kategorie:** bezpečnost / stabilita / compliance
- **Závažnost:** P0
- **Pravděpodobnost:** střední při neopatrném zásahu
- **Dopad:** online hry, pozvánky, session save nebo Top score se mohou tvářit lokálně funkčně a selhat až mezi dvěma klienty.
- **Kde přesně v systému:** `supabase-bridge.js`, tabulky `game_accounts`, `game_invites`, `game_sessions`, `game_stats`, `game_ui_settings`, `gomoku_wins`, RPC `rak_record_game_stat_delta`, `rak_save_game_ui_settings`, `rak_create_game_invite_session`, `rak_accept_game_invite`, `rak_save_game_session_by_invite_code`.
- **Kořenová příčina:** online flow je kombinace realtime, RPC a fallbacků; DB policy změna má dopad mimo statický ZIP.
- **Projev v praxi:** hráč vytvoří pozvánku, druhý ji nepřijme; hra se uloží lokálně, ale ne online; Top score se nezapíše.
- **Návrh opravy:** v tomto typu buildu neměnit DB; policy změny dělat jen s vlastním SQL dokumentem, rollback skriptem a dvoumobilovým smoke testem.
- **Riziko regresí:** vysoké.
- **Automatické ověření:** `npm run check`, kontrola, že žádný nový SQL není aktivně spouštěn klientem; release gate `supabase-policy-change-freeze`.
- **Manuální ověření:** dvě zařízení, online Piškvorky i Lodě: create invite, accept invite, save session, reconnect.

### 2. Service worker update flow a cache verze

- **Kategorie:** stabilita / UX / výkon
- **Závažnost:** P1
- **Pravděpodobnost:** střední
- **Dopad:** část klientů může držet staré soubory a novou cache nebo opačně.
- **Kde přesně v systému:** `sw.js`: `CACHE_VERSION`, `SW_APP_VERSION`, `APP_SHELL`, `STATIC_CACHE`, `RUNTIME_CACHE`, `STALE_CACHE_CLEANUP_MODE`, `OFFLINE_FALLBACK_HTML`.
- **Kořenová příčina:** statická PWA bez bundler manifestu ručně synchronizuje app shell a export.
- **Projev v praxi:** po vydání se zobrazí stará verze, chybí nový helper nebo se offline nenačte správný modul.
- **Návrh opravy:** každý build bump cache; release check porovná `sw.js`, `core.js`, `package.json`, `export.js` a `CHANGELOG.md`.
- **Riziko regresí:** střední.
- **Automatické ověření:** JS syntax, JSON validace, grep verzí, ZIP test, kontrola app shell souborů.
- **Manuální ověření:** mobil: zavřít PWA, tvrdý reload v prohlížeči, vypnout/zapnout síť, ověřit O aplikaci a offline fallback.

### 3. DOM string rendering a uživatelské texty

- **Kategorie:** bezpečnost / UX
- **Závažnost:** P1
- **Pravděpodobnost:** střední
- **Dopad:** profilové jméno, Top score nebo hláška může porušit layout; ve špatném sinku i XSS třída problému.
- **Kde přesně v systému:** `core.js` safe helpery; `ui.js` a `games-arcade.js` renderery profilů, achievementů, Top score, HUD a modalů.
- **Kořenová příčina:** historicky se skládalo hodně HTML stringů ručně.
- **Projev v praxi:** jméno s HTML znaky se zobrazí rozbitě; dlouhý text přeteče kartu.
- **Návrh opravy:** pokračovat přes `escapeHtml()`, `escapeDynamicHtml()`, `setElementHtmlIfChanged()` a konkrétní `getRakGames*DomHardeningHealth()` guardy.
- **Riziko regresí:** střední až vysoké při hromadném přepisu.
- **Automatické ověření:** DOM sink mapa, `node --check`, Playwright test na profil s `<b>Test</b>`.
- **Manuální ověření:** mobilní render profilů, Top score a modalu výsledku.

### 4. Export manifest jako release single point of failure

- **Kategorie:** stabilita / compliance
- **Závažnost:** P1
- **Pravděpodobnost:** střední
- **Dopad:** ZIP může chybět dokument, modul, CSS nebo ikona.
- **Kde přesně v systému:** `export.js`: `EXPORT_SOURCE_IDS`, `EXPORT_JS_FILES`, `EXPORT_TEXT_FILES`, `EXPORT_BINARY_FILES`, `validateRakExportManifestFiles()`.
- **Kořenová příčina:** seznam je ruční a rozdělený do více polí.
- **Projev v praxi:** export preflight selže nebo aplikace po nahrání hledá chybějící soubor.
- **Návrh opravy:** doplnit nově vzniklé docs a časem přidat Node kontrolu export manifestu.
- **Riziko regresí:** nízké při doplnění docs, střední při přepisování exportu.
- **Automatické ověření:** export manifest bez chybějících souborů, ZIP test, duplicitní cesty.
- **Manuální ověření:** export z aplikace, rozbalení ZIPu, kontrola root layoutu.

### 5. Mobilní výkon bez reálných měření

- **Kategorie:** výkon / UX
- **Závažnost:** P2
- **Pravděpodobnost:** vysoká
- **Dopad:** nelze objektivně říct, zda build zpomalil A14/A15 nebo starší zařízení.
- **Kde přesně v systému:** `ui.js`: `runRakDevicePerformanceProbe()`, `getRakDevicePerformanceStatus()`; `rak-performance-ci-audit.js`; `rak-mobile-smoke-audit.js`.
- **Kořenová příčina:** statický ZIP audit neobsahuje fyzické zařízení, GPU, scroll a viewport test.
- **Projev v praxi:** trhání her, pomalý dashboard, scroll pod spodní lištou.
- **Návrh opravy:** měřit cold startup, warm startup, route switch, hru, scroll a O aplikaci na minimálně 3 mobilech.
- **Riziko regresí:** nízké u měření, střední u optimalizací bez testu.
- **Automatické ověření:** Playwright základní route smoke.
- **Manuální ověření:** A14/A15/iPhone viewport + reálný Android Chrome/PWA.

### 6. Top score a časové zobrazení

- **Kategorie:** stabilita / UX
- **Závažnost:** P2
- **Pravděpodobnost:** střední
- **Dopad:** uživatel vidí špatné pořadí, milisekundy místo vteřin nebo datum bez času.
- **Kde přesně v systému:** `games-arcade.js`, `supabase-bridge.js`, helper `getRakGamesTopScoreSecondsHealth()`, docs `games-top-score-seconds-v923.md`.
- **Kořenová příčina:** rozdíl mezi interním přesným měřením a prezentačním formátem; vzdálená data a lokální cache mají jiné timestampy.
- **Projev v praxi:** Reaction Test zobrazí `180 ms` místo `0,18 s`, nebo Top score nerozliší hodinu/minutu.
- **Návrh opravy:** interně zachovat ms pro řazení, UI formátovat na sekundy; timestamp zobrazovat s hodinou a minutou.
- **Riziko regresí:** střední.
- **Automatické ověření:** unit skeleton pro formatter a fake Top score row.
- **Manuální ověření:** odehrát Reaction Test a Daily challenge, zkontrolovat Top score.

### 7. Externí CDN závislosti

- **Kategorie:** výkon / soukromí / stabilita
- **Závažnost:** P2
- **Pravděpodobnost:** střední
- **Dopad:** bez sítě nebo při CDN výpadku nemusí fungovat Excel export/import nebo ZIP export.
- **Kde přesně v systému:** `index.html`: `xlsx.full.min.js`, `jszip.min.js`, Google Fonts, `rakNoteExternalDependency()`.
- **Kořenová příčina:** statická aplikace načítá některé knihovny z CDN.
- **Projev v praxi:** export hlásí, že JSZip není dostupný; font fallback.
- **Návrh opravy:** pro produkční offline jistotu zvážit lokální vendoring JSZip/XLSX; CSP/SRI nejdřív report-only.
- **Riziko regresí:** střední u přesunu knihoven.
- **Automatické ověření:** external dependency status v diagnostice.
- **Manuální ověření:** offline export/import scénář podle cílového režimu.

### 8. Velikost a komplexita herních modulů

- **Kategorie:** stabilita / výkon / UX
- **Závažnost:** P1/P2
- **Pravděpodobnost:** střední
- **Dopad:** malá změna může ovlivnit více her nebo score flow.
- **Kde přesně v systému:** `games-arcade.js`, části Piškvorek v `ui.js`, Supabase score bridge.
- **Kořenová příčina:** historické přidávání her do jedné runtime vrstvy.
- **Projev v praxi:** oprava Reaction Testu nechtěně změní Daily challenge, Top score nebo profil.
- **Návrh opravy:** nejdřív mapovat kontrakty; pak oddělit score formatter, profile renderer a game shell lifecycle.
- **Riziko regresí:** vysoké při velkém refaktoru.
- **Automatické ověření:** smoke scénáře pro každou hru a leaderboard.
- **Manuální ověření:** odehrát konkrétní hry a potvrdit layout na mobilu.

## Quick wins do 1 dne

| Quick win | Dopad | Riziko | Ověření |
|---|---|---:|---|
| Node script pro verze `core/sw/package/export/supabase/changelog` | Méně release chyb | Nízké | `npm run check` |
| Node script pro export manifest existence + duplicitní SOURCE_IDS | Spolehlivější ZIP | Nízké | výpis chybějících souborů |
| Playwright smoke: načti app, zkontroluj verzi, projdi záložky | Zachytí hrubé UI chyby | Nízké | `npm run test:smoke` |
| Test formatteru Reaction Top score sekund | Ochrana opravy v923 | Nízké | unit skeleton |
| Manual checklist šablona pro mobil | Jasné potvrzení bez hádání | Nízké | ručně vyplněný záznam |

## Nejrizikovější místa pro regresi

| Místo | Proč rizikové | Jak ověřit |
|---|---|---|
| `ui.js` Piškvorky | Velká herní logika + DOM + online/offline | odehrát offline AI, online link, reset, výhra/prohra |
| `games-arcade.js` Top score/profily | Sdílené score flow pro více her | odehrát Reaction, Daily challenge, Tetris/Brick minimálně start/score |
| `supabase-bridge.js` realtime/session | Online flow závisí na DB a síti | dvě zařízení, create/accept/save |
| `sw.js` | Cache chyby se projeví až po nasazení | tvrdý reload, offline režim, verze v O aplikaci |
| CSS `styles-games.css` / overrides | Mobilní překryvy a scroll | Android/iPhone viewport, safe-area |

## Největší privacy/compliance rizika

| Riziko | Kategorie | Stav | Doporučení |
|---|---|---|---|
| Profilová jména a herní výsledky v Supabase | soukromí | klientská app s anon přístupem podle policies | neukládat citlivá data, jména normalizovat, policies měnit jen po smoke |
| Bug report může obsahovat text od uživatele a user agent | soukromí | lokální payload v `ui.js` | zobrazit uživateli obsah před odesláním; neposílat automaticky |
| Storage klíče v localStorage | soukromí / compliance | auditní klasifikace existuje | diagnostika nemá vypisovat hodnoty storage, jen názvy/kategorie |
| CDN požadavky | soukromí | Google Fonts/CDN JS | zvážit lokální assety, CSP/SRI report-only plán |

## Co opravit okamžitě před větším refaktorem

1. Nechat DB/policies freeze a nepokračovat v hardeningu Supabase bez reálného online smoke testu.
2. Doplnit automatickou release kontrolu verze a export manifestu.
3. Spustit existující Playwright smoke skeleton a uložit výstup.
4. Udělat ruční mobilní checklist pro Dashboard, O aplikaci, hry, Top score, PWA cache a export.
5. Pokračovat v DOM hardeningu jen po jedné skupině string rendererů.

## Co nelze ověřit bez mobilního testu a reálného Playwright běhu

- Skutečný layout na fyzickém Androidu/iPhonu, včetně safe-area, spodní lišty a scrollu.
- PWA update flow po nasazení na hostingu.
- Reálné načtení CDN na konkrétní síti.
- Online Piškvorky a Lodě mezi dvěma zařízeními.
- Výkon her při dotyku, scrollu a canvas animacích.
- Playwright status na skutečném lokálním/staging serveru.
