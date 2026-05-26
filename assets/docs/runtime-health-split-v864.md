# RaK v.1.5 (864) – Runtime health split

## Cíl

Bez změny funkčnosti oddělit další auditní/runtime vrstvu mimo `app.js`, aby další refaktor nebyl slepý zásah do hlavní logiky.

## Co je přidané

- nový soubor `rak-runtime-health.js`,
- nový helper `window.getRakRuntimeGuardHealth()`,
- nový helper `window.getRakStatsYearScopeHealth()`,
- module readiness registry sleduje i nový runtime helper,
- Diagnostika / O aplikaci ukazuje souhrn runtime health.

## Co runtime health hlídá

- zapisovatelnost `localStorage`,
- základní PWA/SW mismatch stav,
- release readiness stav,
- module readiness stav,
- jestli jsou v aktuálním roce nahrané budoucí měsíce, které se zatím správně nezapočítávají do statistik.

## Statistiky a budoucí měsíce

Statistiky u aktuálního roku záměrně počítají jen měsíce do aktuálního měsíce. Budoucí importované měsíce zůstávají dostupné pro plánování/rozpisy, ale do ročních statistik se započítají až v daném měsíci.

Důvod: nahraný budoucí rozpis ještě neznamená odpracovanou práci nebo skutečnou absenci.

## Bezpečnost změny

Neměněno:

- hry,
- online flow,
- Supabase DB,
- Supabase policies,
- dashboard,
- spodní lišta,
- kalkulačky.

## Rollback

Vrátit v864 znamená:

1. odebrat `rak-runtime-health.js` z `index.html`, `sw.js`, `export.js` a `package.json`,
2. vrátit verze/cache/realtime na předchozí build,
3. odstranit tento dokument z exportu.
