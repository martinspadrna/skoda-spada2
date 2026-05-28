# v962 – Piškvorky AI anti-fork vrstva

Build v.1.5 (962) přidává nad offline AI Piškvorek vrstvu `tttV962BestMove()`.

Cíl změny je opravit situace, kdy hráč X vytvoří otevřenou čtyřku `.XXXX.` nebo křížový fork a AI pak už může zablokovat jen jeden konec.

Změna dělá hlavně toto:

- před útokem hledá tah X, který by příště vytvořil dvě okamžité výhry,
- blokuje skutečný gain square, ne jen blízké pole,
- drží rozměr hracího pole 10 sloupců × 19 řad,
- nemění online PvP, Supabase DB ani policies,
- navyšuje ruleset na `gomoku-10col-19row-ai-rules-v12`.

Lokální test je `gomoku-ai-smoke-v962.js`.
