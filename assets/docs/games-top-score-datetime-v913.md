# RaK v.1.5 (913) – Datum i čas v Top score

## Úprava

Top score ve hrách znovu hlídá, aby se u výsledků zobrazovalo datum i čas včetně hodiny a minut.

## Technicky

`gamesNormalizeLeaderboardRow()` doplňuje `playedText` z časových polí `playedAt`, `lastPlayedAt`, `last_played_at`, `updatedAt`, `updated_at`, `createdAt` nebo `created_at`, pokud předaný text nemá čas.

## Bezpečnost

Text času pořád prochází přes bezpečný textový formatter a při vložení do HTML přes `escapeHtml`.
