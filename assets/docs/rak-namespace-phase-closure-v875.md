# RaK v.1.5 (875) – uzavření window.RaK namespace read-only fáze

Tento build uzavírá první namespace fázi na 100 %.

## Co je hotové

- `window.RaK` existuje jako pasivní kompatibilní bridge.
- Read-only diagnostické aliasy mají mapu i fallback na původní legacy globály.
- `readWithFallback()` je dostupný pro auditní čtení bez mutace stavu.
- Staré globály zůstávají zdroj pravdy.
- Navigace, render, hry a online flow nejsou přepojené.

## Bezpečnostní pravidlo

Namespace vrstva v této fázi nesmí měnit stav aplikace. Slouží jen pro čtení diagnostiky a pro přípravu budoucího refactoru.

## Další bezpečný směr

Další fáze má řešit jen oddělení export/release tooling vrstvy od runtime aplikace. Navigace, render, herní logika a online hry mají zůstat beze změny, dokud nebude hotová samostatná kontrola.
