# Storage/sync smoke report a ruční cleanup guard – v.1.5 (888)

Tento build napojuje storage/localStorage cleanup mapu do samostatného smoke reportu a přidává ruční cleanup guard.

## Co to dělá
- `getRakStorageSyncSmokeReport()` ukazuje poslední stav storage smoke kontroly.
- `runRakStorageSyncSmokeReport()` ručně spustí read-only kontrolu localStorage, JSON položek, cleanup kandidátů a guardu.
- `getRakStorageManualCleanupGuard()` potvrzuje, že automatické mazání dat není zapnuté.

## Bezpečnostní pravidlo
Tahle fáze nic sama nemaže. Automatický cleanup je vypnutý a guard vrací `autoCleanupEnabled: false`.

## Proč
Cílem je mít přehled o starých localStorage/cache položkách a připravit budoucí ruční úklid tak, aby nehrozila ztráta rozehraných her, offline fronty nebo profilových nastavení.
