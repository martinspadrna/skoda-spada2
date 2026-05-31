## 1.2 (1.61)

## RaK 1.2 (1.61)
- Dokončen aktuální refactor/cleanup balík: poslední bezpečný CSS úklid menu/O aplikaci/diagnostiky do `styles-menu-polish.css`.
- Přesunuté jen existující vzhledové vrstvy pro O aplikaci, diagnostiku, zamčené vzhledy a admin přehled připojení; bez změny spodní lišty, Supabase DB a online her.
- Release metadata sjednocená na `RaK 1.2 (1.61)`, technická verze `1.2.61`.

- CSS cleanup: dashboard compact/viewport-fit polish oddělený ze `styles-overrides.css` do nové vrstvy `styles-dashboard-fit.css`.
- Pořadí kaskády zachováno: nový soubor se načítá hned po `styles-overrides.css`, před admin/stats/theme/release/dashboard polish vrstvami.
- Bez zásahu do Supabase DB/policies, online her, výpočtové logiky, Rotace logiky a vizuálních pravidel spodní lišty.
- Verze, cache, realtime kanál, service worker, export metadata a GitHub hlavičky sjednocené na `RaK 1.2 (1.61)`.

## 1.2 (1.40)
- CSS cleanup: viewport/iOS/PWA start stabilizační vrstva přesunutá ze `styles-overrides.css` do `styles-viewport-polish.css`.
- Zachováno pořadí kaskády před theme/release/dashboard polish vrstvami, bez vizuální změny spodní lišty.
- Verze, cache, realtime kanál, service worker, export metadata a GitHub hlavičky sjednocené na `RaK 1.2 (1.40)`.

## 1.2 (1.39)
- Dashboard: panely na Home jsou průhlednější a víc matně glass, bez zásahu do spodní lišty.
- Kantýna/jídelna: v druhém řádku už se zbytečně neopakuje „Přesčas“ před „Další“; další přesčas se píše jen jako „Další: Přesčas HH:MM–HH:MM“.
- Přidaný samostatný `styles-dashboard-polish.css` jako finální dashboard polish vrstva načtená po ostatních CSS polish souborech.
- Verze, cache, realtime kanál, service worker, export metadata a GitHub hlavičky sjednocené na `RaK 1.2 (1.39)`.

## 1.2 (1.38)
- Větší CSS cleanup: statistiky/obsazenost strojů oddělené ze `styles-overrides.css` do nové vrstvy `styles-stats-polish.css`.
- Pořadí CSS drží bezpečný chain: overrides → admin polish → stats polish → theme polish → release polish.
- Verze, cache, realtime kanál, service worker, export metadata a GitHub hlavičky sjednocené na `RaK 1.2 (1.38)`.

## 1.2 (1.37)
- Větší CSS cleanup: admin/rozpis polish oddělený ze `styles-overrides.css` do nového `styles-admin-polish.css`.
- Pořadí CSS zachované: overrides → admin polish → theme polish → release polish.
- Verze, cache, realtime kanál, service worker, export metadata a GitHub hlavičky sjednocené na `RaK 1.2 (1.37)`.
- Supabase DB, online flow, online hry, kalkulačky, Rotace logika a spodní lišta beze změny.

## 1.2 (1.36)
- CSS cleanup pokračuje větším krokem: finální theme/background polish je přesunutý ze `styles-overrides.css` do samostatného `styles-theme-polish.css`.
- Pořadí načítání zůstává zachované: `styles-overrides.css` → `styles-theme-polish.css` → `styles-release-polish.css`, takže se nemění vzhledová priorita posledních vrstev.
- Verze, cache, realtime kanál, service worker, export metadata a GitHub hlavičky sjednocené na `RaK 1.2 (1.36)`.
- Bez zásahu do Supabase DB/policies, online her, kalkulačkové logiky, Rotace logiky a spodní lišty.

## 1.2 (1.35)
- CSS cleanup: pozdní release polish pravidla přesunutá ze `styles-overrides.css` do samostatného `styles-release-polish.css`, aby historický override soubor začal postupně hubnout bez změny vizuálního pořadí.
- Nový CSS soubor doplněný do HTML, service workeru, export manifestu a release auditů.
- Verze, cache, realtime kanál, service worker, export metadata a GitHub hlavičky sjednocené na `RaK 1.2 (1.35)`.

## 1.2 (1.34)
- Větší refactor boot shellu: spodní navigace a její bezpečné metriky jsou oddělené z `app.js` do `app-bottom-nav.js`.
- Post-load audit orchestrace je oddělená do `app-postload-audits.js`, takže `app.js` zůstává víc jen loader/orchestrátor.
- Release metadata, cache, realtime kanál, service worker, export manifest a GitHub hlavičky sjednocené na `RaK 1.2 (1.34)`.

## 1.2 (1.33)
- Větší refactor startu aplikace: online synchronizace rozpisů je oddělená z `app-init.js` do nového `app-rotation-sync.js`.
- Startovací vazby voleb Rotace a Excel importu jsou oddělené z `app-init.js` do nového `app-rotation-controls.js`.
- `app-init.js` zůstává už hlavně jako krátký startovací orchestrátor; nové moduly jsou doplněné do loaderu, module readiness, export manifestu, service workeru a auditů.
- Bez zásahu do Supabase DB/policies, online her, spodní lišty, kalkulaček, Rotace logiky a Statistik.

## 1.2 (1.32)
- Home boot sekvence oddělená z `app-init.js` do nového modulu `app-home-boot.js`.
- `app-init.js` zůstává víc pro startovací formulářové vazby, Excel import bridge a Supabase synchronizaci rozpisů.
- Nový modul je doplněný do loaderu, module readiness, export manifestu, service workeru, boot auditu, export auditu a app-usage smoke testu.
- Bez zásahu do Supabase DB/policies, online her, spodní lišty, kalkulaček, Rotace a Statistik.

## 1.2 (1.31)
- Admin odemčení přes 3 tapnutí na „Více“ je oddělené z `app-init.js` do nového modulu `app-admin-unlock.js`.
- `app-init.js` se zmenšil a zůstává víc pro startovací vazby, Excel import bridge a online synchronizaci rozpisů.
- Nový modul je doplněný do loaderu, module readiness, export manifestu, service workeru a release kontrol.
- Bez zásahu do Supabase DB/policies, online her, spodní lišty, kalkulaček a Rotace.

## 1.2 (1.30)
- Rotace: písmo v dlaždicích jmen je ještě lehce zmenšené, aby se vešla i delší jména.
- Výška dlaždic a průhledný glass vzhled jmen zůstaly zachované.
- Build byl záměrně malý a stabilizační kvůli následnému ručnímu testu.
- Bez zásahu do Supabase DB/policies, online her, spodní lišty a výpočtové logiky.

## 1.2 (1.29)
- Stabilizované release/version metadata: aktivní diagnostické fallbacky, namespace bridge a release gates už nepoužívají staré `v.1.5` jako aktuální verzi.
- Release gate kontrola verze je navázaná na aktuální řadu `1.2`, aby Diagnostika nehlásila starý blok kvůli historickému řetězci.
- GitHub hlavičky, `APP_VERSION`, package semver, cache verze, service worker, realtime kanál a export metadata sjednocené na aktuální build.
- Bez zásahu do Supabase DB/policies, online her, spodní lišty, kalkulaček a Rotace.

## 1.2 (1.23)
- Opravené a sjednocené release značení po upozornění, že GitHub může v aktivních zdrojových souborech ukazovat matoucí starý zápis 1.2 (1.14).
- Aktivní zdrojové komentáře s historickým 1.2 (1.14) byly převedené na neutrální refactor poznámky, aby nepůsobily jako aktuální verze.
- Sjednocená aktuální verze aplikace, package.json, cache, service worker, realtime kanál a exportní metadata na RaK 1.2 (1.23).

## 1.2 (1.22)
- Health/audit helpery aplikace oddělené z `app.js` do nového modulu `app-health-audits.js`.
- `app.js` zůstává víc jako boot/runtime shell; phase audity, runtime health helpery a post-stabilization kontroly jsou v samostatném modulu.
- Do Supabase DB/policies, online her ani spodní lišty se nesahalo.

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
