# RaK v.1.5 (903) – Piškvorky AI early-trap lock

Po rychlé výhře hráče kolem 15. tahu byla přidaná další obranná vrstva proti raným pastem.

## Změny
- Nové vyhodnocení `tttEarlyTrapRiskScore()`.
- Nový výběr tahu `tttBestEarlyTrapLockMove()`.
- AI dřív simuluje nejsilnější odpověď hráče a protiodpověď AI.
- Lehce navýšená search depth v rané/střední fázi.

## Omezení
Online Piškvorky se nemění. Reálnou sílu AI musí potvrdit mobilní hra.
