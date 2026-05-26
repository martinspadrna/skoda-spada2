# RaK v.1.5 (879) – exportní smoke report

## Cíl

Doplnit do export/release tooling vrstvy čitelný stav poslední předexportní kontroly a posledního ZIP exportu bez zásahu do her, navigace, renderu nebo online části.

## Co se změnilo

- `export.js` nově drží runtime stav `window.__RAK_EXPORT_SMOKE_REPORT__`.
- Přidaný read-only helper `getRakExportSmokeReport()` pro Diagnostiku / O aplikaci.
- Přidaný helper `runRakExportSmokeReport()`, který umí rychle ověřit duplicity manifestu a volitelně spustit plný preflight.
- `validateRakExportManifestFiles()` ukládá poslední preflight výsledek: počet kontrolovaných textových/binárních souborů, chybějící soubory a duplicity.
- `exportCurrentHtml()` ukládá průběh exportu od startu přes preflight až po spuštění stažení nebo chybu.
- `rak-export-release-audit.js` a `window.RaK.diagnostics` umí nový smoke report číst jako read-only signál.

## Bezpečnostní hranice

- Nezměněná herní logika.
- Nezměněný online invite/session flow.
- Nezměněná Supabase DB a policies.
- Nezměněná navigace a render stránek.

## Ověření

- `npm run check`
- JS syntax všech `.js`
- manifest JSON
- duplicitní ID v `index.html`
- CSS brace kontrola
- export manifest cesty
- ZIP test
