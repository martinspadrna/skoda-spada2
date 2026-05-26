# RaK v.1.5 (897) – reset herních výsledků a čas v Top score

- Lokální profily se při prvním spuštění buildu v897 přepnou na `GAMES_PROFILE_RESET_VERSION = 897`.
- Zachovává se číslo profilu, jméno a UI nastavení profilu; herní statistiky a achievementy se vynulují.
- Lokální cache `rotace_supabase_game_stats_v856:*`, legacy `gomoku_wins` a lokální záznamy výsledků Piškvorek se vyčistí.
- Starší vzdálené `game_stats` řádky se v klientovi nezobrazují díky cutoffu `2026-05-26T13:49:00+02:00`.
- Top score formát času přijímá timestamp i ISO string a zobrazuje datum včetně hodiny a minut.
- DB ani Supabase policies se tímto buildem nemažou ani nemění.
