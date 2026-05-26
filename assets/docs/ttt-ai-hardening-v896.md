# RaK v.1.5 (896) – Piškvorky AI line-containment

- Po reálné výhře hráče ve 29. tahu přidaná další obranná vrstva AI proti hráči.
- Nový `tttLineVectorScore()` hodnotí pěticová a šestipolová okna, tedy i rozjeté rozbité linie a pozdější pasti.
- Nový `tttBestLineContainmentMove()` vybírá tah, který snižuje souhrnné riziko hráče po jeho nejlepší možné odpovědi.
- `tttTacticalPressureScore()` nově započítává line-vector riziko a otevřené dvojky.
- Online Piškvorky, role hráčů, zvací odkaz, ruční kód ani Supabase flow se tím nemění.
