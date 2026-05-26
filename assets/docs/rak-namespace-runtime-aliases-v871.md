# RaK v.1.5 (871) – read-only runtime aliasy v window.RaK

## Cíl

Pokračování namespace/refactor fáze bez zásahu do funkční logiky aplikace.

## Co se změnilo

- `window.RaK.runtime.read(alias)` umí číst vybrané runtime hodnoty pouze read-only.
- Přidané aliasy:
  - `appVersion`,
  - `rotationBuild`,
  - `externalDependencies`,
  - `appStateSnapshot`.
- `appStateSnapshot` vrací ořezaný diagnostický snapshot hlavního `app` stavu bez mutace.
- Staré globály zůstávají zdroj pravdy.

## Co se záměrně neměnilo

- navigace,
- render,
- hry,
- online flow,
- Supabase DB a policies,
- dashboard,
- spodní lišta,
- kalkulačky.

## Riziko

Nízké. Bridge jen čte existující hodnoty a nic nepřepisuje.

## Rollback

Vrátit `rak-namespace.js`, `CHANGELOG.md`, `ui.js`, `export.js`, `sw.js`, `core.js`, `app.js`, `package.json` a související verze na předchozí build.
