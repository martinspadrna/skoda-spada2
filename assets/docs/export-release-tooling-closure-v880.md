# RaK v.1.5 (880) – uzavření export/release tooling fáze

## Cíl buildu

Bez změny funkčnosti aplikace napojit exportní smoke report na hlavní release readiness diagnostiku a uzavřít export/release tooling auditní fázi.

## Hotovo

- `getRakReleaseReadinessHealth()` čte stav `getRakExportSmokeReport()`.
- Stav poslední exportní/preflight kontroly je součástí release readiness výstupu.
- Neúspěšný export smoke report je vedený jako warning, ne jako tvrdá blokace běhu aplikace.
- Stav `not-run` není chyba; znamená jen, že export v dané relaci ještě neběžel.
- `getRakExportReleaseToolingHealth()` vrací uzavřenou fázi `phasePercent: 100` a `phaseClosed: true`.

## Bezpečnost změny

Změna je pouze diagnostická/read-only. Nemění se:

- hry,
- online pozvánky/session flow,
- Supabase DB ani policies,
- navigace,
- render stránek,
- dashboard,
- spodní lišta,
- kalkulačky.

## Ověření

Před vydáním zkontrolovat:

- `npm run check`,
- syntax všech JS souborů,
- `manifest.webmanifest`,
- `package.json`,
- duplicitní ID,
- CSS brace kontrolu,
- ZIP bez vnitřní hlavní složky,
- jediná složka v kořeni ZIPu je `assets/`.

Browser/mobil smoke test je stále nutné udělat ručně po nasazení.
