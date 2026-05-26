# RaK v.1.5 (911) – Lodě menu DOM/security guard

## Úprava

Přidaný read-only guard pro menu Lodí, pozvánku a uložené vzájemné zápasy.

## Zásady

- Nemění online flow.
- Nemění Supabase DB ani policies.
- Jen ověřuje, že texty v menu Lodí zůstávají escapované.

## Helper

- `getRakGamesShipsMenuDomHardeningHealth()`
