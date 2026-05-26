# RaK v.1.5 (867) – pasivní window.RaK namespace bridge

## Cíl

Zahájit další refactor fázi bez změny funkčnosti aplikace: postupně snížit závislost na volných globálních funkcích přes jeden bezpečný namespace `window.RaK`.

## Co se změnilo

- Přidaný nový soubor `rak-namespace.js`.
- `window.RaK` pouze zrcadlí vybrané existující globální helpery.
- Staré globály zůstávají zachované kvůli kompatibilitě.
- Přidaný helper `getRakNamespaceHealth()`.
- Diagnostika / O aplikaci ukazuje stav `RaK namespace`.
- Boot audit a module readiness počítají s novým statickým souborem.

## Co se záměrně neměnilo

- hry,
- online flow,
- Supabase DB,
- Supabase policies,
- dashboard,
- spodní lišta,
- kalkulačky.

## Rollback

Rollback je jednoduchý: odebrat `rak-namespace.js` z `index.html`, `sw.js`, `export.js` a `package.json`, vrátit verzi na předchozí build. Protože staré globály nebyly přepojené ani odebrané, runtime dopad rollbacku je nízký.

## Další krok

Po ověření v prohlížeči lze nové čisté interní kódy postupně psát přes `window.RaK.*`, ale existující volání se zatím nemají hromadně přepojovat.
