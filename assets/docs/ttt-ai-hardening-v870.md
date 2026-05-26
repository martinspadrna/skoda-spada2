# RaK v.1.5 (870) – Piškvorky AI hardening

Cíl: ztížit režim „Proti AI“ bez zásahu do online flow, Supabase policies nebo ostatních her.

## Co se změnilo

- Přidaný `tttTacticalPressureScore()` pro lepší odhad hrozeb obou stran.
- Přidaný `tttBestLookaheadSafeMove()`, který hledá tahy, po kterých hráč nedostane snadnou dvojitou hrozbu nebo okamžitou výhru.
- `tttHardMoveSearchScore()` nově zapojuje omezený minimax/search přes existující `tttSearch()`.
- AI více penalizuje tahy, které nechávají hráči výherní odpověď, otevřenou čtyřku nebo fork.
- Opening book se používá i v prvních tazích při obsazeném středu.

## Bezpečnost změny

- Nemění se online Piškvorky ani ukládání online session.
- Nemění se Supabase DB ani RLS policies.
- Nemění se dashboard, spodní lišta, kalkulačky ani ostatní hry.
- Timeout AI je jen mírně vyšší, aby se zlepšila síla bez zbytečného rizika zamrzání na mobilu.

## Ověření

- Syntax všech JS souborů.
- Statický test AI funkcí.
- Logický self-play/smoke test Piškvorek proti simulovanému greedy hráči.
