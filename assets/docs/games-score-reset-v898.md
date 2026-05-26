# RaK v.1.5 (898) – reset herních výsledků a Top score

- Lokální profily se při prvním spuštění buildu v898 přepnou na `GAMES_PROFILE_RESET_VERSION = 898`.
- Herní skóre, achievementy a leaderboard cache se znovu vynulují, ale jména/profilové UI nastavení zůstává zachované.
- Vzdálené `game_stats` a online head-to-head záznamy starší než `2026-05-26T14:17:00+02:00` se klientsky odfiltrují.
- Supabase DB ani policies se tímto buildem fyzicky nemažou ani nemění.
