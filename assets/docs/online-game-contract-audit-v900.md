# RaK v.1.5 (900) – Supabase score cleanup + online game contract audit

- Supabase výsledkové tabulky byly jednorázově vyčištěné mimo klienta: `game_stats` a `gomoku_wins` mají po kontrole 0 řádků.
- `game_accounts` zůstaly zachované, aby lidem zůstala čísla profilů/jména a nemusel se znovu zakládat účet.
- Online invite/session tabulky byly při kontrole prázdné a nebyly měněné.
- Policies, RLS ani schéma DB se neměnily.
- Klientský reset marker je posunutý na `GAMES_PROFILE_RESET_VERSION = 900`, aby se vyčistily i lokální cache/profilové statistiky na mobilech.
- Top tabulky dál zobrazují datum i čas a filtrují vzdálené výsledky podle času odehrání (`last_played_at` / relevantní herní timestamp), ne podle `updated_at`.
- Read-only online game contract audit je posunutý na 75 %; další bezpečný krok je reálný dvoumobilový smoke create/accept/save pro Piškvorky i Lodě bez fallbacku.
