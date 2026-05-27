# RaK v.1.5 (927) – Rotace: pozice seznamu jmen

Build v927 je malá optická oprava Rotace. Cíl je, aby spodní dock se seznamem jmen po přepnutí na Rotaci neležel těsně nad spodní navigací a aby aktivní položka spodního panelu vizuálně nezasahovala do seznamu.

## Změna

| Oblast | Úprava | Riziko | Ověření |
|---|---|---:|---|
| `styles-overrides.css` | Posunutí `#namesGrid` v aktivní Rotaci zhruba o 12 px výš (`bottom: 76px`, mobilně `72px`). | nízké | Ruční mobilní smoke |
| `#rotaceNamesPanel.active` | Navýšení spodní rezervy tak, aby fixní dock nepřekrýval obsah Rotace. | nízké | Otevřít Rotaci, vybrat jméno, zkontrolovat scroll |
| `ui.js` | Read-only helper `getRakRotaceNamesDockHealth()`. | nízké | Konzole / diagnostika |

## Co se nemění

- Nemění se data rotací.
- Nemění se výpočty směn.
- Nemění se Supabase DB, policies ani online flow.
- Nemění se online Piškvorky ani online Lodě.
- Nemění se herní achievementy ani profilové ukládání vzhledu z v926.

## Ruční ověření

1. Otevřít aplikaci na mobilu.
2. Klepnout na Rotace.
3. Zkontrolovat, že seznam jmen sedí nad spodním panelem a není na něj nalepený.
4. Vybrat jméno a ověřit, že detail osoby zůstává čitelný a spodní dock nic nepřekrývá.
5. Přepnout na jinou záložku a zpět na Rotace; seznam by měl zůstat opticky stabilní.

Skutečný mobilní test zůstává `manual`, protože ho statický audit v ZIPu neumí nahradit.
