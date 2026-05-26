# RaK v.1.5 (920) – Reaction/Denní challenge score flow guard

## Cíl

Build přidává read-only kontrolu návaznosti oprav z v.1.5 (920):

- Reaction Test musí mít Top score viditelné nad spodní lištou.
- Denní challenge musí zapisovat výsledek i do vlastního leaderboardu `daily`.
- Top score renderer musí dál zobrazovat datum i čas a escapovat texty.
- Denní challenge DOM texty musí zůstat escapované.

## Bezpečnost

Guard je pouze diagnostický. Nic neukládá, nemaže, nemění Supabase policies a nesahá do online flow Piškvorky/Lodě.
