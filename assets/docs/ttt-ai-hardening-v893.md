# RaK v.1.5 (893) – Piškvorky AI hardening

- AI proti hráči má přidanou dvoutahovou bezpečnostní kontrolu `tttBestUltraSafetyMove()`.
- Kontrola simuluje nejlepší reakce hráče a penalizuje tahy, které vedou k výhře, dvojitým hrozbám, forkům nebo otevřeným trojkám hráče.
- Zvýšená je hloubka searchu v rané/střední fázi a mírně prodloužený časový limit pro režim proti AI.
- Online Piškvorky ani ukládání online zápasů se nemění.
