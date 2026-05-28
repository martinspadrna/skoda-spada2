# RaK v.1.5 (952) – Piškvorky / Gomoku 10×19 engine

## Cíl
Převést Piškvorky na determinističtější 10×19 pravidlovou vrstvu podle zadání `RECTSTART 19,10` a zpřísnit online kompatibilitu.

## Změny
- `TTT_ROWS = 10`, `TTT_COLS = 19`, `TTT_WIN_LENGTH = 5`.
- Samostatný ruleset: `gomoku-10x19-ai-rules-v2`.
- AI používá jednotný deadline, okamžité výhry/bloky a nouzový tah nejblíže středu.
- Online session payload nese `rulesetVersion`, `rows`, `cols`, `winLength` a `engineProfile`.
- Klient odmítne staré/nekompatibilní online session místo tichého převzetí špatně dlouhé desky.

## Poznámka
Online PvP zůstává human-vs-human. Engine automaticky netahá za protihráče; používá se pro pravidla, validaci kompatibility a AI režim.
