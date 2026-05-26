# RaK v.1.5 (923) – Top výsledky her ve vteřinách

## Změna

Reaction Test pořád interně počítá reakci v milisekundách, protože to je pro přesnost měření správné. V Top výsledcích se ale hodnota zobrazuje už jen ve vteřinách s desetinnou čárkou, například `0,18 s` místo `184 ms`.

## Proč

V Top score je milisekundový zápis zbytečně technický. Pro běžné porovnání výsledků stačí čitelný zápis ve vteřinách.

## Riziko

Nízké. Mění se jen formát zobrazení hodnoty, ne ukládání výsledku ani výpočet pořadí.
