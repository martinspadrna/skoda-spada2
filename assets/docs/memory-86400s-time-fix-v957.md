# RaK v.1.5 (957) – Pexeso: oprava chybného času 86400 s

- Pexeso ignoruje neplatný rekordní čas `86400000 ms`, který vznikal jako denní/fallback hodnota místo skutečného času hry.
- Nově dohraná hra přepíše takový špatný čas reálným elapsed časem.
- Platí pro `memory`, varianty `memory_4x4/6x6/8x8` a Daily Pexeso `daily_memory`.
