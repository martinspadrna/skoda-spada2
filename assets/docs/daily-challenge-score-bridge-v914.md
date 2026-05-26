# RaK v.1.5 (916) – Denní challenge score bridge

## Oprava

Denní challenge už nepoužívá jen Top score konkrétní hry. Po dokončení dnešní hry se výsledek uloží:

- do konkrétní hry, například Reaction Test,
- zároveň do samostatného `daily` leaderboardu.

## Důvod

Uživatel po odehrání viděl výsledek přímo u hry, ale ne v Denní challenge. Příčinou bylo, že denní karta renderovala Top score vybrané hry a chyběl most do `daily` statistik.

## Riziko

Nízké. Nezasahuje do online flow Piškvorek/Lodí, Supabase policies ani DB schématu.
