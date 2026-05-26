# RaK v.1.5 (878) – předexportní kontrola manifestu

Cíl buildu: navázat na oddělený exportní manifest z v877 a použít ho jako skutečný zdroj pravdy i před samotným skládáním ZIPu.

## Co se změnilo

- `getRakExportManifest()` nově obsahuje i `indexFile` a příznak `preflightValidation`.
- Přidaný `getRakExportManifestDuplicateReport()` pro rychlou kontrolu duplicit v textových/binárních cestách.
- Přidaný `validateRakExportManifestFiles()` pro předexportní kontrolu, že všechny textové, JS a binární soubory z manifestu jdou načíst.
- `exportCurrentHtml()` nejdřív spustí preflight kontrolu a teprve potom skládá ZIP.
- Binární soubory mají jednoduchou cache, aby se při exportu po preflightu zbytečně nenačítaly znovu.

## Bezpečnostní dopad

Změna nemění runtime logiku aplikace, hry, navigaci, online flow ani Supabase policies. Zasahuje pouze do exportní/release vrstvy a diagnostiky.

## Ověření

Předexportní kontrola má selhat dřív a čitelněji, pokud v manifestu zůstane cesta na soubor, který už v release ZIPu nebo nasazené appce není dostupný.
