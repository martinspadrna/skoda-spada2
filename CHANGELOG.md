## 1.2 (1.21)
- Runtime guardy aplikace oddělené z `app.js` do nového modulu `app-runtime-guards.js`.
- Přesunutá ochrana proti výběru textu, numerická klávesnice kalkulaček a lokální zachytávání chyb.
- Nový modul doplněný do loaderu, module readiness, export manifestu, service workeru a release kontrol.
- Bez zásahu do Supabase DB/policies, online her, spodní lišty a výpočtové logiky kalkulaček.

## 1.2 (1.20)
- Větší refactor aplikačních akcí: delegované klikací/change handlery jsou přesunuté z `app.js` do nového modulu `app-actions.js`.
- `app.js` se zmenšil a zůstává víc jako boot/load/runtime shell; pořadí načítání drží `app-actions.js` až po `app-menu.js`, před herním/exportním závěrem.
- Release manifesty, service worker, module readiness, boot audit, export audit, app-usage smoke test a `npm run check` počítají s novým modulem.
- Bez změny Supabase DB/policies, online flow, online her, kalkulačkové logiky, Rotace logiky a spodní lišty.

## 1.2 (1.18)
- Rotace: políčka se jmény jsou dotažená do hodně průhledného glass vzhledu bez šedé výplně.
- Rotace: doplněné silnější selektory i pro dock/portal režim a lightweight/low-end režim, aby starší vrstvy nevracely šedé pozadí za jmény.
- CSS cleanup: přidaná finální stabilizační vrstva pro jmenné dlaždice místo zásahu do citlivé logiky Rotace.
- Supabase DB, policies, online flow, online hry a spodní lišta beze změny.

## 1.2 (1.17)
- Rotace: políčka se jmény jsou dotažená do čistšího průhledného glass stylu bez barevné/zelené výplně; aktivní jméno má jen jemné theme ohraničení.
- Kalkulačky: rozbalené plochy „Kolik ještě stihnu“ a „Kdy bude hotovo“ u Brusy/Frézky mají průhlednější glass vzhled; Soustruhy dostaly stejný glass polish pro aktivní plochy a rozbalovací sekce.
- Bezpečný CSS cleanup: starý obecný 1.15 override Soustruhů byl nahrazen poznámkou, protože skutečnou opravu drží cílená třída `.soustruhChoiceBtn` z 1.16.
- Bez zásahu do Supabase DB, policies, online flow, spodní lišty a her.

## 1.2 (1.16)
- Soustruhy: volby Lis / Volné 126ks / Volné 106ks / Kombinace a související volby v kombinaci mají vlastní třídu a tvrdou výšku podle aktuálních voleb brusu/indexu, aby je nepřebíjela obecná vysoká `.bbtn` vrstva.
- Rotace: jmenný dock i samotná políčka se jmény jsou víc průhledný glass bez zelené výplně; theme zůstává jen jemně v ohraničení aktivního jména.
- Bez zásahu do Supabase DB, policies, online flow, spodní lišty a her.

## 1.2 (1.15)

- Soustruhy: všechny navolovací volby jsou sjednocené na stejnou výšku jako volba brusu/indexu v kalkulačce Brusy.
- Rotace: spodní panel jmen a dlaždice jmen jsou víc průhledný glass bez zelené výplně; theme zůstává jen jemně v ohraničení/aktivním zvýraznění.
- Pokračování bezpečného CSS cleanupu: místo mazání starých historických bloků je přidaný finální release override pro konkrétní dvě opravy.
- Bez změny Supabase DB/policies, spodní lišty, online herního flow a výpočtové logiky kalkulaček.

## 1.2 (1.14)

- Větší refactor navigačního/home shellu: spodní aktivní indikátor, swipe-back, `showPage`, home refresh, externí dashboard odkazy a dashboard modaly jsou přesunuté z `ui.js` do nového `app-navigation.js`.
- `ui.js` se zmenšil přibližně z 1864 na 1173 řádků a zůstává víc jako koordinační UI modul.
- Release manifesty, service worker, module readiness, `npm run check` a app-usage smoke test počítají s novým modulem `app-navigation.js`.
- Bez změny Supabase DB/policies, spodní lišty, Rotace, kalkulaček, herní logiky a online flow.

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
