# RaK v.1.5 (899) – tvrdý klientský reset Top score

- Lokální profily se při prvním spuštění buildu v899 přepnou na `GAMES_PROFILE_RESET_VERSION = 899`.
- Vynulují se lokální herní statistiky, achievementy, leaderboard cache a staré reset markery; jména hráčů a UI nastavení profilu zůstávají.
- Vzdálené `game_stats` se dál nemažou fyzicky ze Supabase, ale klient je nově filtruje podle `last_played_at` / času odehrání výsledku.
- Příčina předchozího návratu starých výsledků: některé staré řádky mohly mít nové `updated_at` po dodatečné synchronizaci, a proto starý cutoff podle `updated_at` nebyl dostatečný.
- Nový cutoff: `2026-05-26T14:38:00+02:00`.
- Supabase DB ani policies se v tomto buildu nemění.
