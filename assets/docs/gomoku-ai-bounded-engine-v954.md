# RaK v.1.5 (954) – Piškvorky: bounded AI engine

- AI Piškvorek zůstává na desce 10 sloupců × 19 řad.
- Ruleset navýšen na `gomoku-10col-19row-ai-rules-v4`, protože se mění obtížnost a rozhodovací logika.
- Nová vrstva `tttV954BestMove` má krátký pevný budget, taktické priority, okamžitou výhru, okamžitý blok, anti-fork a root safety vyhodnocení.
- Cíl je zabránit zaseknutí AI a současně zpřísnit obranu proti výhrám kolem 18. tahu.
- Online PvP zůstává člověk proti člověku; AI netahá v online režimu.
