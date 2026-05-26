# RaK v.1.5 (901) – Kantýna/jídelna neděle jen při přesčasu

- Neděle bez přesčasu se pro kantýnu i jídelnu vrací jako zavřeno.
- Přesčasová nedělní otevírací doba se bere jen ze seznamu `FOOD_SPECIAL_SUNDAY_DATES`.
- V detailu otevírací doby je nedělní přesčas označený textem „přesčas“ / „při přesčasu“.
- Přidaný read-only guard `getFoodScheduleSundayGuardHealth()` ověřuje běžnou neděli a vzorovou přesčasovou neděli.
