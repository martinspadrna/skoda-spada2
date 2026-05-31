## 1.2 (1.13)

- Větší refactor menu: hlavní sekce Více, O aplikaci, Nastavení, Pošli mi chybu a admin menu shell přesunuty z `ui.js` do nového `app-menu.js`.
- `ui.js` se zmenšil zhruba z 3225 na 1864 řádků a zůstává víc pro navigaci, dashboard/modaly a základní koordinaci.
- Release manifesty, service worker, kontroly a app-usage smoke test počítají s novým modulem `app-menu.js`.
- Bez změny Supabase DB, spodní lišty, Rotace, herní logiky a online flow.

## 1.2 (1.11)
- Rotace: spodní panel jmen sjednocený do glass stylu appky, dlaždice jmen jsou cca o 10 % vyšší.
- Větší refactor: oddělené herní profily/leaderboardy do `games-profile.js`.
- Oddělené theme, pozadí a profilové UI nastavení do `appearance-theme.js`.
- ZIP pojmenování přechází na formát `RaK_v1.2_1.11.zip`.

- Větší refactor: Piškvorky / Gomoku oddělené z hlavního `ui.js` do samostatného `games-gomoku.js`.
- `ui.js` se zmenšil o velkou herní část a zůstává víc jako koordinátor UI.
- Rotace: panel jmen se při otevření stránky nejdřív stabilizuje skrytě a až potom se ukáže ve finální poloze, aby nebylo vidět poskočení.
- Aktualizované release manifesty, service worker, smoke test Piškvorek a kontrola načtených modulů pro nový soubor.
- Supabase DB, policies ani online flow beze změny.
