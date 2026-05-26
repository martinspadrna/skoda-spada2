# RaK v.1.5 (901) – Lokální herní reset marker

- Po potvrzeném vyčištění Supabase ve v900 je lokální reset marker posunutý na `GAMES_PROFILE_RESET_VERSION = 901`.
- Cíl je odstranit případné staré lokální herní statistiky/cache na mobilech.
- Vzdálené výsledkové tabulky `game_stats` a `gomoku_wins` už byly jednorázově vyčištěné mimo klienta.
