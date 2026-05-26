# RaK v.1.5 (902) – Rollback playbook

Build v902 přidává read-only rollback playbook přes `getRakRollbackPlaybookHealth()`.

## Základní pravidlo

Poslední potvrzený ZIP je rollback bod. Nový ZIP se považuje za čekající, dokud není potvrzený slovem „ok“.

## Postup rollbacku

1. Zastavit další změny.
2. Určit rozsah problému: klient, PWA cache, Supabase, konkrétní modul.
3. Zkontrolovat Diagnostiku.
4. Vrátit poslední potvrzený ZIP.
5. DB rollback dělat jen cíleně a po SELECT kontrole.
6. Po rollbacku spustit ruční smoke.

## Post-rollback smoke

- Verze v O aplikaci sedí.
- Service worker nemá starou cache.
- Top score neukazuje staré výsledky.
- Online Piškvorky fungují přes link i ruční kód.
- Lodě umí založení, připojení, potvrzení flotil a střelbu.
- Kantýna/jídelna: běžná neděle zavřeno, přesčasová neděle označená.

## Ověření

```js
window.getRakRollbackPlaybookHealth()
```
