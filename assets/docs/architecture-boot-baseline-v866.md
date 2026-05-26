# RaK v.1.5 (866) – Architecture / boot baseline uzavření

## Cíl

Uzavřít auditní fázi architecture / boot baseline na 100 % bez změny funkčnosti aplikace.

## Co je potvrzené

- Boot pořadí je hlídané přes `rak-boot-sequence-audit.js`.
- Načítání modulů je hlídané přes `module-readiness.js`.
- Release a architecture audit jsou oddělené v `rak-audit-baseline.js`.
- Runtime/storage/PWA/statistiky scope health je oddělený v `rak-runtime-health.js`.
- `app.js` už nenese tyto čistě auditní helpery jako hlavní balast.

## Stav po v866

Architecture / boot baseline audit je uzavřený jako stabilní diagnostická vrstva. Další refaktor nemá dál přesouvat náhodné funkce naslepo, ale má jít přes jasný kontrakt a malé kroky.

## Další fáze

Další bezpečný směr je **Phase C – postupné snižování globálního coupling přes `window.RaK` namespace**.

Navržený postup:

1. Přidat pasivní namespace bridge bez změny veřejných globálů.
2. Jen zrcadlit vybrané helpery do `window.RaK.*`.
3. Diagnostikou ověřit, že staré globály i nový namespace ukazují na stejnou funkci.
4. Až po potvrzení začít postupně přepojovat nové kódy na namespace.

## Rollback

Rollback je jednoduchý: vrátit `rak-audit-baseline.js`, `CHANGELOG.md`, `export.js`, `sw.js`, `core.js`, `package.json` a `supabase-bridge.js` na předchozí build. Runtime funkce aplikace nebyla měněná.

## Co se záměrně neměnilo

- hry,
- online flow,
- Supabase DB,
- Supabase policies,
- dashboard,
- spodní lišta,
- kalkulačky.
