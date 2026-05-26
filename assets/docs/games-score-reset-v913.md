# RaK v.1.5 (916) – Reset herních výsledků a Top score

Supabase bylo fyzicky vyčištěné jen ve výsledkových tabulkách:

- `gomoku_wins = 0`
- `game_stats = 0`
- `game_accounts` zůstávají zachované

Lokální reset marker je posunutý na `games_score_reset_v916`, aby se vyčistily i lokální cache a profily výsledků na telefonech.
