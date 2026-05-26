# Supabase client/offline queue audit – v.1.5 (890)

## Cíl

Zahájit bezpečný read-only audit Supabase klientské vrstvy, offline queue a fallback cache bez DB změn, bez policies a bez automatického mazání/flushování.

## Co audit čte

- `getSupabaseHardeningStatus()`
- `getSupabaseSyncStatus()`
- lokální queue klíč `rotace_supabase_queue_v1`
- dostupnost `flushSupabaseSyncQueue`
- stav `navigator.onLine`
- realtime stav a základní queue health hodnoty

## Co audit nedělá

- nemění databázi,
- neutahuje RLS policies,
- nemaže localStorage,
- nespouští flush fronty,
- nepřepisuje herní ani online flow.

## Nové helpery

- `getRakSupabaseClientQueueAuditHealth()`
- `getRakSupabaseQueueSmokeReport()`
- `runRakSupabaseQueueSmokeReport()`

## Další bezpečný krok

Doplnit detailnější smoke report a closure guard pro offline queue. Případný ruční zásah do fronty až po výslovném potvrzení a po zobrazení přesné ukázky kandidátů.
