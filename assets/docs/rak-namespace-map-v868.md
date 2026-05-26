# RaK v.1.5 (868) – mapa `window.RaK` namespace bridge

## Cíl

Zpevnit pasivní `window.RaK` bridge z v867 tak, aby bylo jasné, které staré globální funkce lze později bezpečně číst přes namespace a které části se zatím nesmí hromadně přepojovat.

## Co se změnilo

- `rak-namespace.js` nově obsahuje interní mapu aliasů.
- `window.RaK.getNamespaceMap()` vrací kopii mapy pro diagnostiku a audit.
- `window.RaK.namespacePlan` popisuje aktuální pravidla refactoru.
- `getRakNamespaceHealth()` nově kontroluje:
  - existenci namespace skupin,
  - existenci aliasů,
  - dostupnost starých globálů,
  - úplnost mapy,
  - počet položek bezpečných hned / později / vysoce rizikových.

## Důležité pravidlo

Staré globály zůstávají zdroj pravdy. `window.RaK` je zatím jen pasivní čtecí/zrcadlící vrstva.

Bez samostatného testu se nesmí hromadně přepojovat:

- navigace,
- render aktuální stránky,
- hlavní `app` state,
- online/Supabase flow,
- hry.

## Nízké riziko

Přes namespace lze později psát hlavně nové auditní nebo diagnostické čtení:

- release readiness,
- architecture baseline,
- runtime health,
- boot sequence,
- module readiness.

## Rollback

Rollback je jednoduchý: vrátit `rak-namespace.js` na verzi z v867 a odstranit dokument `assets/docs/rak-namespace-map-v868.md` z exportu. Protože staré globály nebyly odstraněné ani přepsané, runtime dopad je nízký.

## Další krok

V dalším buildu lze přidat jen bezpečné čtení diagnostiky přes `window.RaK.diagnostics.*`. Funkční logiku navigace/renderu ponechat na starých globálech, dokud nebude browser smoke test.
