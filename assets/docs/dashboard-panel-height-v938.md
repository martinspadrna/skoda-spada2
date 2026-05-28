# RaK v.1.5 (938) – Dashboard panely cca o 5 % nižší

## Cíl

Úprava řeší požadavek na lehce nižší panely na Dashboardu bez zásahu do dat, Supabase, navigace nebo výpočtové logiky.

## Změna

- Běžné Dashboard karty mají snížený `min-height` zhruba o 5 %.
- Padding je mírně zmenšený, aby výška působila kompaktněji, ale texty a ikony zůstaly čitelné.
- Glass styl, theme barvení ikon a online announcement zůstávají zachované.
- V Láďově / low-end režimu je panel také lehce kompaktnější, pořád bez těžkého blur efektu.

## Ověření

Ručně zkontrolovat hlavně Dashboard na mobilu:

1. všechny karty jsou vidět,
2. hodnoty nejsou useknuté,
3. ikonky nejsou natlačené na text,
4. announcement bar zůstává nad kartami,
5. spodní navigace se nepřekrývá s obsahem.

## Nezměněno

- Supabase DB ani policies.
- Online Piškvorky / Lodě.
- Dashboard logika a výpočty.
- Rotace, statistiky a kalkulačky.
