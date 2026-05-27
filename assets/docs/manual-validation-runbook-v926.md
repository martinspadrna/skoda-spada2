# RaK v.1.5 (926) – ruční validační runbook

v926 navazuje na validační balíček v925 a doplňuje hlavně herní achievementy, odměnová témata/pozadí a profilové ukládání aktivního vzhledu.

## P0 checklist

| ID | Oblast | Postup | Očekávání | Blokuje release? |
|---|---|---|---|---:|
| M-01 | Start appky | Otevřít aplikaci po tvrdém reloadu. | Appka naběhne bez bílé obrazovky. | ano |
| M-02 | Verze | Otevřít O aplikaci / diagnostiku. | Vidět `v.1.5 (926)`. | ano |
| M-03 | Profilový vzhled | Profil A nastaví téma+pozadí, profil B se přepne. | Profil B nepřebírá vzhled A. | ano |
| M-04 | Odměnové zamykání | Kliknout na zamčené téma/pozadí. | Neaktivuje se. | ano |
| M-05 | Syté vzhledy | Odemčený výrazný skin aktivovat. | UI zůstává čitelné a bez rozbitých kontrastů. | ne |
| M-06 | Achievementy | Otevřít herní achievementy. | Každá hra má vlastní cíle a D-směnové cíle. | ano |
| M-07 | D progress | V čase směny D dokončit vybranou hru. | Přibude D-směnový progress. | ano |
| M-08 | Mimo D | Mimo směnu D dokončit hru. | Běžný progress ano, D progress ne. | ano |
| M-09 | Online hry | Zkusit existující online Piškvorky/Lodě smoke. | Online flow se nechová jinak než před v926. | ano |
| M-10 | Export | Spustit export ZIP. | ZIP odpovídá v926, export nespadne. | ano |

## Poznámka

Bez skutečného mobilního průchodu zůstává stav `manual`. Statický audit jen potvrzuje, že potřebné helpery a manifesty existují.
