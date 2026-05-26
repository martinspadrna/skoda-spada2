# Storage/sync cleanup mapa – v.1.5 (887)

Cíl buildu: rozšířit read-only storage/localStorage audit o mapu kandidátů na ruční stale cleanup bez automatického mazání dat.

## Co je nové

- `rak-storage-sync-audit.js` nově počítá `staleCleanupCandidateCount`.
- Přidává přehled podle bucketů, rizika a doporučené akce.
- Kandidáti se pouze vypisují v diagnostice; aplikace je sama nemaže.
- Neplatný JSON zůstává issue, velké nebo staré diagnostické/cache položky jsou warning.
- Diagnostika / O aplikaci ukazuje počet kandidátů úklidu přímo v řádku `Storage/sync audit`.

## Bezpečnostní pravidlo

V887 je pořád čistě auditní. Žádný `localStorage.removeItem()` nebyl přidán do storage cleanup toku.

## Další bezpečný krok

Napojit mapu kandidátů do storage smoke reportu a připravit ruční cleanup guard, který nejdřív ukáže konkrétní položky a až po potvrzení dovolí smazání bezpečných diagnostických/cache klíčů.
