# Supabase client/offline queue smoke + guard – v.1.5 (891)

Build doplňuje read-only guard pro Supabase offline queue.

## Pravidlo

- Žádné DB změny.
- Žádné změny policies.
- Žádný automatický flush fronty.
- Žádné automatické mazání dat.

Případný budoucí ruční flush nebo cleanup musí být výslovně potvrzený.
