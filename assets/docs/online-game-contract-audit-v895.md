# RaK v.1.5 (895) – Online game contract audit

Read-only auditní krok pro online hry nad Supabase vrstvou.

## Co kontroluje
- dostupnost `RotationSupabaseBridge` metod `createGameInvite`, `acceptGameInvite`, `loadGameSessionByInviteCode` a `saveGameSessionByInviteCode`,
- dostupnost legacy wrapperů pro stejné operace,
- lokální smoke evidenci `create/accept/save` zvlášť pro Piškvorky a Lodě,
- fallback záznamy, které by před dalším utažením policies znamenaly riziko.

## Co výslovně nedělá
- nemění Supabase DB,
- nemění Supabase policies,
- nespouští žádný create/accept/save zápis,
- nezasahuje do online Piškvorek ani Lodí,
- neutahuje `game_invites` ani `game_sessions`.

## Další bezpečný krok
Dál jen nasbírat reálný dvoumobilový smoke pro Piškvorky i Lodě: create, accept a save bez fallbacku. Teprve potom má smysl připravovat samostatný úzký návrh policies.
