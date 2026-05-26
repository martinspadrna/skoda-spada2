# DOM/action registry closure – v.1.5 (885)

Tento build uzavírá read-only DOM/action registry audit fázi.

## Co je hotové

- `getRakDomActionRegistryHealth()` mapuje `data-action` prvky, kategorie, cílové atributy a warningy.
- `getRakDomActionSmokeReport()` drží poslední smoke stav DOM/action kontroly.
- `runRakDomActionSmokeReport()` umí ručně spustit stejnou kontrolu bez změny funkčnosti.
- Release readiness nově čte DOM/action smoke report jako warning signál.
- `window.RaK.diagnostics` má read-only aliasy pro registry, smoke report i closure stav.

## Co se záměrně nemění

- Žádné klikací handlery se nepřepojují.
- Navigace, render stránek, hry, online flow a Supabase policies zůstávají beze změny.
- Staré globální funkce zůstávají kompatibilní fallback.

## Další směr

Případné reálné přepojení DOM/action handlerů má být samostatná budoucí fáze po ručním ověření v prohlížeči a na mobilu.
