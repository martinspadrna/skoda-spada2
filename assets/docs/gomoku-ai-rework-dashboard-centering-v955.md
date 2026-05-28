# RaK v.1.5 (956) – Piškvorky AI rework + centrování absence

## Piškvorky

- Hrací pole zůstává 10 sloupců × 19 řad.
- Online PvP zůstává člověk proti člověku.
- AI proti počítači má novou bounded pipeline:
  - okamžitá výhra,
  - okamžitý blok,
  - vlastní forcing hrozby,
  - blok soupeřových open-four / fork / silných open-three hrozeb,
  - bezpečnostní root vyhodnocení odpovědí hráče,
  - legální fallback nejblíž středu.
- Ruleset Piškvorek navýšen na `gomoku-10col-19row-ai-rules-v5`, protože se mění obtížnost/logika AI.
- Deadline zůstává omezený, aby se AI nesekla.

## Dashboard

- Řádek „chybí“ je centrovaný vůči celé horní kartě.
- Pill už není natažený do jedné strany.
- Staré transform posuny jsou přebité finální CSS vrstvou.
