# Piškvorky AI hardening – v.1.5 (891)

AI proti hráči byla znovu přitvrzená po hlášení, že se dala porazit kolem 25. tahu.

## Změny

- Přidaný hlubší bezpečnostní tah `tttBestDeepSafetyMove()`.
- AI před vlastním útokem víc testuje, jestli hráči po odpovědi nevznikne výhra, dvojitá hrozba nebo silný fork.
- Search depth je u tvrdé AI zvýšený v rané/střední fázi hry.
- Časový limit AI je lehce navýšený, aby zvládla víc kandidátů bez zásahu do online hry.

Online Piškvorky, zápis výsledků a Supabase flow se neměnily.
