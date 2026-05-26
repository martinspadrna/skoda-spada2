# RaK v.1.5 (863) – audit baseline split

## Cíl

Oddělit čistě auditní/runtime helpery z `app.js` do samostatného souboru `rak-audit-baseline.js` bez změny chování aplikace.

## Co bylo přesunuto

- `getRakReleaseReadinessHealth()`
- `getRakArchitectureBaselineHealth()`

## Proč

`app.js` dál zůstává hlavním boot/loader souborem, ale auditní helpery už neleží přímo v něm. Tím se snižuje coupling a připravuje se bezpečná cesta pro pozdější dělení runtime logiky po malých krocích.

## Bezpečnost a dopad

- Bez změny her.
- Bez změny Supabase DB.
- Bez změny Supabase policies.
- Bez změny dashboardu, spodní lišty, rotací, rozpisů, statistik a kalkulaček.
- Nový soubor je načtený po `module-readiness.js` a před `app.js`.
- Service worker a export ZIPu nový soubor zahrnují.

## Rollback

Vrátit `rak-audit-baseline.js` zpět do `app.js`, odstranit jeho script tag z `index.html`, odebrat ho ze `sw.js`, `export.js` a `package.json` checku.
