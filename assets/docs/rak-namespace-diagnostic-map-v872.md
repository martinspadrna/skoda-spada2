# RaK v.1.5 (872) – rozšířená read-only diagnostická mapa v window.RaK

## Cíl

Build v872 pokračuje v bezpečné fázi snižování globálního couplingu. Nezasahuje do navigace, renderu, her, online flow ani Supabase policies.

## Změna

`rak-namespace.js` nově mapuje větší část existujících diagnostických helperů do `window.RaK.diagnostics.*` jako read-only aliasy. Staré globální funkce zůstávají zdroj pravdy.

Nově přidané diagnostické aliasy zahrnují zejména storage, skripty, page shell, formuláře, akce, Láďův režim, herní engine baseline, statistiky aktuálního roku a klientské Supabase readiness kontroly.

## Bezpečnostní pravidla

- Alias nesmí mutovat stav aplikace.
- Navigace, render, hry a online flow se zatím nepřepojují.
- Supabase aliasy jsou pouze klientský/read-only audit, bez DB změn a bez změny policies.
- `summary()` jen popisuje mapu aliasů a automaticky je nespouští.

## Ověření

- `getRakNamespaceHealth()` hlídá existenci `read`, `readMany`, `summary`, runtime readeru a počty aliasů.
- Staré globály zůstávají zachované pro kompatibilitu.
- Build je pořád rollback-safe: odstranění `rak-namespace.js` by vrátilo diagnostiku na legacy globály/fallbacky.
