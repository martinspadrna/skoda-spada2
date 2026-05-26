# RaK v.1.5 (902) – Monitoring a alerting mapa

Build v902 přidává read-only mapu metrik přes `getRakMonitoringPlanHealth()`.

## Sledované oblasti

- Release readiness warningy a issue.
- Supabase offline queue délka.
- Supabase read/write chyby.
- Supabase heartbeat / keepalive.
- Fallbacky online her.
- PWA cache verze a mismatch.
- Leaderboard cache / Top score po resetu.
- Kantýna/jídelna nedělní guard.
- Supabase cache churn.

## Doporučené alerty

- P0: staré Top score po resetu.
- P0: online Piškvorky nebo Lodě nejdou založit/přijmout.
- P1: běžná neděle ukáže kantýnu/jídelnu jako otevřenou.
- P1: service worker drží starý build po tvrdém reloadu.
- P2: offline queue roste nad bezpečný limit.

## Ověření

```js
window.getRakMonitoringPlanHealth()
```

Výstup je jen diagnostický. Neodesílá data ven, nemaže cache a nemění Supabase.
