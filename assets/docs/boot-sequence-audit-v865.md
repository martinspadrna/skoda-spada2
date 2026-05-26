# RaK v.1.5 (865) – Boot sequence audit

## Cíl

Doplnit samostatný audit boot sekvence bez změny funkčnosti aplikace. Smyslem je vidět, jestli se statické helpery a dynamicky načítané runtime moduly načítají ve správném pořadí dřív, než se začne dělat další refaktor `app.js`.

## Změna

- Přidán nový soubor `rak-boot-sequence-audit.js`.
- Helper poskytuje `window.getRakBootSequenceHealth()`.
- Kontroluje statické pořadí:
  - `data.js`,
  - `module-readiness.js`,
  - `rak-audit-baseline.js`,
  - `rak-runtime-health.js`,
  - `rak-boot-sequence-audit.js`,
  - `app.js`.
- Kontroluje dynamické pořadí hlavních runtime modulů podle `module-readiness.js`.
- Diagnostika / O aplikaci nově ukazuje řádek „Boot sekvence“.

## Dopad

Jen auditní vrstva. Nemění hry, online flow, Supabase, dashboard, spodní lištu ani kalkulačky.

## Ověření

- `rak-boot-sequence-audit.js` je v `index.html` před `app.js`.
- Soubor je v `sw.js` APP_SHELL.
- Soubor je v `export.js` ZIP exportu.
- Soubor je v `package.json` syntax kontrole.
- `getRakArchitectureBaselineHealth()` bere boot sequence jako další readiness signál.

## Rollback

Vrátit v865 znamená odstranit `rak-boot-sequence-audit.js` z `index.html`, `sw.js`, `export.js`, `package.json`, `ui.js` a `rak-audit-baseline.js`. Protože helper nemění business logiku, rollback nemá dopad na data ani funkčnost.
