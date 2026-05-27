# RaK v.1.5 (928) – Rotace: stabilní adaptivní seznam jmen

Build v928 řeší situaci, kdy spodní seznam jmen v Rotaci po přepnutí na záložku ještě malinko „povyskočil“. Předchozí v927 posunula panel výš staticky, ale neřešila kořen problému: dock měl několik historických CSS přepisů a používal pevné hodnoty, které nesedí stejně na každém mobilu.

## Co se změnilo

| Oblast | Úprava | Dopad | Riziko |
|---|---|---|---:|
| `styles-overrides.css` | Přidaná finální v928 vrstva pro `#rotaceNamesPanel #namesGrid`. | Dock má pevné finální chování a nepřebírá staré pozice z historických vrstev. | nízké |
| `ui.js` | Přidané měření skutečné výšky spodní navigace přes `updateRotaceNamesDockMetrics()`. | Pozice docku se počítá podle reálného mobilu, ne podle pevného odhadu. | nízké |
| `showPage('rotace')` | Měření se spouští před renderem, po renderu a ještě po krátkém dosednutí layoutu. | Omezuje viditelné cuknutí při přepnutí na Rotaci. | nízké |
| resize / otočení displeje | Přidaný listener pro `resize`, `orientationchange` a `visualViewport.resize`. | Dock zůstává viditelný i po změně viewportu nebo po otevření systémových lišt. | nízké |
| health helper | `getRakRotaceNamesDockHealth()` vrací měřené hodnoty docku. | Jednodušší diagnostika v konzoli. | nízké |

## Princip

Aplikace nastaví CSS proměnné:

- `--rak-rotace-names-dock-bottom`
- `--rak-rotace-names-dock-max-height`
- `--rak-rotace-names-content-bottom`

Ty se počítají z výšky spodní navigace a aktuální velikosti viewportu. Na menších displejích se dock automaticky zmenší, ale pořád zůstává nad spodním panelem.

## Co se nemění

- Nemění se výpočty rotací.
- Nemění se data směn.
- Nemění se Supabase DB, policies ani online flow.
- Nemění se hry ani achievementy.
- Nemění se dashboard, kalkulačky ani spodní navigace jako taková.

## Ruční ověření

1. Otevřít aplikaci na mobilu.
2. Klepnout na Rotace.
3. Sledovat, jestli seznam jmen už necukne nahoru po načtení stránky.
4. Vyzkoušet malý displej / Samsung A15 / iPhone emulaci.
5. Vybrat jméno a zkontrolovat, že detail osoby nejde pod dock.
6. Přepnout na jinou záložku a zpět na Rotace.
7. Otočit displej a vrátit zpět.

Skutečný mobilní test zůstává `manual`, protože statická kontrola ZIPu neumí nahradit chování konkrétního telefonu.
