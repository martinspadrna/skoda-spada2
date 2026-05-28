# v961 – Piškvorky AI tactical verification

Build v.1.5 (961) přidává nad offline AI Piškvorek novou vrchní vrstvu `tttV961BestMove()`.

Co hlídá:
- deska zůstává 19 řad × 10 sloupců,
- online PvP flow zůstává beze změny,
- pravidla Piškvorek jsou navýšená na `gomoku-10col-19row-ai-rules-v11`,
- AI nejdřív řeší terminální stav, vlastní okamžitou výhru a okamžitý blok hráče,
- blokování hrozeb používá skutečné defense square: endpoint, gap u broken-three nebo gain/cost pole,
- diagonální hrozby `\` i `/` mají vyšší prioritu,
- 8–16 root kandidátů prochází bezpečnostním ověřením proti okamžité výhře, open-four/fork tlaku a nejhorším odpovědím hráče,
- deadline je soft 1600 ms a hard 2200 ms, s legálním fallback tahem.

Lokální smoke test je připravený jako `gomoku-ai-smoke-v961.js` a ověřuje diagonální, horizontální, svislé bloky, vlastní okamžitou výhru, legalitu tahu a timeout.
