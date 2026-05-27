# RaK v.1.5 (926) – achievementy a odměny her

Build v926 sjednocuje herní progres tak, aby každá hra měla vlastní cíle a aby směna D nebyla jen obecná statistika, ale reálná sada odměn. Změna je klientská a read-only vůči Supabase DB/policies; online Piškvorky ani online Lodě nejsou přepojené.

## Co je ověřeno staticky

| Oblast | Stav | Poznámka |
|---|---:|---|
| Vlastní achievementy pro hry | OK | Každá hra má minimálně několik vlastních milestone cílů. |
| D-směnové achievementy | OK | Každá hra má dvojici D-směnových cílů: 5 a 20 dokončených her ve směně D. |
| Kontext směny | OK | Kontext se ukládá do statistik hry přes `gamesAttachCompletionContext()`. |
| Online flow | beze změny | Online Piškvorky a Lodě zůstávají bez změny síťového toku. |
| DB/policies | beze změny | Žádná migrace ani policy změna. |

## Nové D-směnové cíle

Každá hra dostala dvojici odměn ve stylu `*_d_5` a `*_d_20`. Patří sem Piškvorky, 2048, Snake, Flappy, Aim Trainer, Reaction Test, Tetris, Space Shooter, Brick Breaker, Doodle Jump, Bubble Shooter, Sudoku, Minesweeper, Memory, Bomberman mini, Pampuch, Lodě a Denní challenge.

## Runtime helper

`getRakGamesAchievementRewardHealth()` vrací počty achievementů, počet pokrytých her a počet D-směnových odměn. Je to kontrolní helper bez zápisu do dat.

## Ruční ověření

1. Přihlásit profil.
2. Otevřít Hry → Statistiky/achievementy.
3. Zkontrolovat, že u každé hry existují běžné i D-směnové cíle.
4. V době aktivní směny D odehrát testovací dokončení hry a ověřit, že přibývá D progress.
5. Bez aktivní směny D ověřit, že běžný progress přibývá, ale D progress ne.

## Nelze potvrdit bez reálného testu

- skutečné přičtení progressu při běžícím mobilním hraní,
- přesnost detekce směny D v konkrétní čas,
- vizuální průchod achievement gridem na malém displeji.
