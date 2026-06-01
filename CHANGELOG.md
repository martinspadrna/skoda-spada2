## RaK 1.2 (1.100)

- Stabilizační uzavření série Dashboard CSS guardů: přidaný `RAK_DASHBOARD_CSS_GUARD_SERIES_CONTRACT_V1100`, který označuje guard sérii 1.90–1.100 jako uzavřenou.
- `npm run test:app-usage` nově hlídá kompletní řetěz Dashboard CSS pojistek od legacy inventury přes active owner registry až po release metadata guard.
- `styles-dashboard-polish.css` má novou dokumentační poznámku `Dashboard CSS guard series complete v1.100`, aby bylo jasné, že další Dashboard práce už má být konkrétní funkční/vizuální požadavek, ne další cleanup-only guard.
- Bez vizuální změny a bez zásahu do Dashboardu, spodní lišty, exportu Rozpisů, her nebo Supabase DB/policies.
- Release metadata sjednocená na `RaK 1.2 (1.100)`, technická verze `1.2.100`, cache `v1.2-1.100`.

## RaK 1.2 (1.99)

- Release metadata guard: přidaný `RAK_RELEASE_METADATA_CONTRACT_V199`, který drží pohromadě display verzi, package semver, cache verzi, realtime kanál, changelog a service worker metadata.
- `npm run test:app-usage` nově hlídá, že aktivní release soubory neobsahují staré build fragmenty z předchozí verze a že `APP_VERSION`, `package.json`, `sw.js`, `supabase-bridge.js`, `export.js` a `CHANGELOG.md` ukazují na stejný build.
- Bez vizuální změny a bez zásahu do Dashboardu, spodní lišty, exportu Rozpisů, her nebo Supabase DB/policies.
- Release metadata sjednocená na `RaK 1.2 (1.99)`, technická verze `1.2.99`, cache `v1.2-1.99`.

## RaK 1.2 (1.98)

- Dashboard CSS cleanup bez vizuální změny: přidaný `Dashboard release isolation guard v1.98`, který hlídá, že Dashboard vrstvy nezačnou obsahovat export Rozpisů ani herní CSS/selektory.
- `npm run test:app-usage` nově kontroluje chráněné markery exportu Rozpisů (`ROTATION_EXPORT_GLASS_THEME_V193`, glass helpery a stažení PNG) i herních CSS vrstev (`#games .gameBoard`, 2048, Had a Flappy Car board).
- `styles-dashboard-polish.css` má doplněnou dokumentační poznámku, že export Rozpisů a herní styly nepatří do Dashboard cleanup vrstev.
- Release metadata sjednocená na `RaK 1.2 (1.98)`, technická verze `1.2.98`, cache `v1.2-1.98`.

## RaK 1.2 (1.97)

- Dashboard CSS cleanup bez vizuální změny: přidaný `Dashboard scope guard v1.97`, který hlídá, že dashboard-fit/polish vrstvy nesahají mimo Dashboard scope.
- `npm run test:app-usage` nově kontroluje, že Dashboard CSS vrstvy neupravují spodní lištu, menu, admin přehled připojení ani obecné menu polish selektory.
- `styles-dashboard-polish.css` má doplněnou dokumentační poznámku, že spodní lišta, menu a admin přehled patří do vlastních vrstev, ne do Dashboard vrstev.
- Release metadata sjednocená na `RaK 1.2 (1.97)`, technická verze `1.2.97`, cache `v1.2-1.97`.

## RaK 1.2 (1.96)

- Dashboard CSS cleanup bez vizuální změny: přidaný `Dashboard no-new-hotfix lock v1.96` pro `styles-overrides.css`.
- `npm run test:app-usage` nově hlídá počet a SHA-256 podpis Dashboard selektorů ve `styles-overrides.css`, aby se tam omylem nevracely nové vizuální Dashboard hotfixy.
- Aktivní Dashboard změny mají dál patřit jen do `styles-dashboard-fit.css` / `styles-dashboard-polish.css`; `styles-overrides.css` zůstává historická inventura starých přepisů.
- Release metadata sjednocená na `RaK 1.2 (1.96)`, technická verze `1.2.96`, cache `v1.2-1.96`.

## RaK 1.2 (1.95)

- Dashboard CSS cleanup bez vizuální změny: zpřesněný audit rozdílu mezi legacy inventurou ve `styles-overrides.css` a aktivními Dashboard vlastníky v `styles-dashboard-fit.css` / `styles-dashboard-polish.css`.
- `styles-overrides.css` má nově popsaný `Dashboard legacy-only inventory`, aby bylo jasné, že staré Dashboard hotfixy v téhle vrstvě jsou jen historická stopa.
- `styles-dashboard-polish.css` má nově `Dashboard active owner registry`, kde jsou pojmenované hlavní aktivní selektory Dashboardu.
- `npm run test:app-usage` nově hlídá, že legacy-only selektory a active owner selektory nejsou smíchané dohromady a že aktivní vlastníci zůstávají v povolených dashboard vrstvách.
- Release metadata sjednocená na `RaK 1.2 (1.95)`, technická verze `1.2.95`, cache `v1.2-1.95`.

## RaK 1.2 (1.94)

- Dashboard CSS cleanup bez vizuální změny: přidaný `Dashboard CSS layer order contract v1.94`.
- `npm run test:app-usage` nově hlídá přesné pořadí lokálních CSS vrstev, aby se mezi `styles-overrides.css`, `styles-dashboard-fit.css` a finální `styles-dashboard-polish.css` omylem nevložila nová vítězná Dashboard vrstva.
- Guard zároveň kontroluje dokumentační poznámku přímo ve `styles-dashboard-polish.css`, takže je z kódu jasné, proč musí zůstat poslední lokální CSS vrstvou.
- Bez změny vzhledu Dashboardu, bez změny spodní lišty a bez zásahu do Supabase DB/policies.
- Release metadata sjednocená na `RaK 1.2 (1.94)`, technická verze `1.2.94`, cache `v1.2-1.94`.

## RaK 1.2 (1.93)

- Export PNG Rozpisů je upravený víc do iOS glass stylu: jemnější modro-bílé pozadí, měkčí stíny, průsvitné panely a lehčí tabulkové výplně.
- Panely `Tvrdota`, `Měkota` a `Absence` teď používají stejný modrý gradient hlavičky jako `Měsíční přehled`, aby export působil jednotně.
- Export dostal sdílený `ROTATION_EXPORT_GLASS_THEME_V193` contract a helpery pro glass shell/title bar, takže se vzhled drží na jednom místě a nebude se znovu rozjíždět po částech.
- `npm run test:app-usage` nově hlídá i glass export contract, sdílený title bar a to, že se do exportu nevrací staré jednobarevné tmavé headery.
- Release metadata sjednocená na `RaK 1.2 (1.93)`, technická verze `1.2.93`, cache `v1.2-1.93`.

## RaK 1.2 (1.92)

- Dashboard CSS cleanup bez vizuální změny: přidaný malý `no visual owner drift` guard pro aktivní Dashboard selektory.
- `npm run test:app-usage` nově hlídá, že poslední lokální CSS vlastník ručně laděných Dashboard pravidel zůstává jen ve `styles-dashboard-fit.css` nebo `styles-dashboard-polish.css`.
- Test zároveň potvrzuje, že `styles-dashboard-polish.css` zůstává poslední lokální CSS vrstva a že Dashboard CSS vrstvy nesahají na spodní lištu.
- Release metadata sjednocená na `RaK 1.2 (1.92)`, technická verze `1.2.92`, cache `v1.2-1.92`.

## RaK 1.2 (1.91)

- Dashboard CSS cleanup bez vizuální změny: rozšířená inventura bezpečně přebitých legacy selektorů ve `styles-overrides.css`.
- Přidaní další kandidáti s jasným pozdějším vlastníkem: ikonky Dashboard panelů, druhý řádek hero panelu, hero pill a konkrétní tečky Kantýna/Jídelna.
- `npm run test:app-usage` rozšířený o guard, že aktivní vlastníci zůstávají ve `styles-dashboard-fit.css` / `styles-dashboard-polish.css` a že cleanup zůstává bez mazání naslepo.
- Release metadata sjednocená na `RaK 1.2 (1.91)`, technická verze `1.2.91`, cache `v1.2-1.91`.

## RaK 1.2 (1.90)

- Dashboard CSS cleanup: označené první prokazatelně přebité legacy Dashboard selektory jako inventura, bez mazání a bez vizuální změny.
- Aktivní vlastníci Dashboardu zůstávají v `styles-dashboard-fit.css` a `styles-dashboard-polish.css`.
- `npm run test:app-usage` rozšířený o guard, aby se nové Dashboard hotfixy nepřidávaly zpět do staré overrides vrstvy bez ověření.
- Release metadata sjednocená na `RaK 1.2 (1.90)`, technická verze `1.2.90`, cache `v1.2-1.90`.

## RaK 1.2 (1.89)

- Appearance/theme audit: přidaný `RAK_APPEARANCE_READABILITY_CONTRACT_V189`, který hlídá čitelnost odemykaných theme a pozadí na Dashboardu, v Přehledu připojení, Nastavení vzhledu a herních žebříčcích.
- Contract drží povinné theme proměnné, tmavý background základ pro glass panely a minimální kontrast `--soft` / `--muted` proti `--bg`.
- `npm run test:app-usage` rozšířený o statickou kontrolu kontrastu theme a tmavosti `--rakBgBase` u všech pozadí.
- Release metadata sjednocená na `RaK 1.2 (1.89)`, technická verze `1.2.89`, cache `v1.2-1.89`.

## RaK 1.2 (1.88)

- Administrace → Přehled připojení: doplněný silnější avatar contract pro dvoupísmenné iniciály, aby zůstaly přesně uprostřed ikonky i na malých mobilech.
- CSS už výslovně hlídá, že avatar nesmí zdědit sloupcové řazení textového wrapperu ani obecné `summary span` pravidlo.
- `npm run test:app-usage` rozšířený o guard proti návratu obecného `#menu .adminUsageSummary span` pravidla, které dřív umělo rozhodit centrování avataru.
- Release metadata sjednocená na `RaK 1.2 (1.88)`, technická verze `1.2.88`, cache `v1.2-1.88`.

## RaK 1.2 (1.87)

- Export PNG Rozpisů: zjednodušený `Měsíční přehled` je uzamčený contractem `ROTATION_EXPORT_MONTH_SUMMARY_LABELS_V187` na 4 řádky — `Směn celkem`, `Ranní směny`, `Noční směny`, `Obsazenost`.
- Popisek prvního řádku sjednocený na `Směn celkem`, aby export zněl obecně a přirozeně.
- `npm run test:app-usage` hlídá, že měsíční přehled vzniká z contract labelů a že se nevrátí staré podrobné položky.
- Release metadata sjednocená na `RaK 1.2 (1.87)`, technická verze `1.2.87`, cache `v1.2-1.87`.

## RaK 1.2 (1.86)

- Export PNG Rozpisů: Měsíční přehled je zjednodušený jen na to hlavní — počet směn, ranní směny, noční směny a obsazenost.
- Z pravého souhrnu zmizely detailní položky a vysvětlivka, takže obrázek působí čistěji a je rychlejší na přečtení.
- `npm run test:app-usage` upravený tak, aby hlídal jednoduchý obsah Měsíčního přehledu a nevracel zpátky staré detailní položky.
- Release metadata sjednocená na `RaK 1.2 (1.86)`, technická verze `1.2.86`, cache `v1.2-1.86`.

## RaK 1.2 (1.85)

- Export PNG Rozpisů: Měsíční přehled má sdílený výpočet výšky karty, takže výška canvasu odpovídá skutečně vykreslenému souhrnu.
- Přidaná bezpečná mezera před footerem, aby se pravý sloupec s Absencemi a Měsíčním přehledem nepřiblížil k poznámce vpravo dole ani u měsíců s delším seznamem absencí.
- `npm run test:app-usage` rozšířený o guard pro výpočet výšky Měsíčního přehledu a footer safe gap.
- Release metadata sjednocená na `RaK 1.2 (1.86)`, technická verze `1.2.86`, cache `v1.2-1.86`.

## RaK 1.2 (1.84)

- Export PNG Rozpisů: Měsíční přehled dostal krátkou vysvětlivku přímo do karty, aby bylo jasné, že `Plán` je obsazení z rozpisu a `Po absencích` je plán mínus absence směn.
- Layout exportu počítá i s výškou vysvětlivky, takže se footer nepřekryje se souhrnem.
- `npm run test:app-usage` rozšířený o guard, že vysvětlivka zůstává v exportní kartě a že plán/po absencích zůstávají oddělené.
- Release metadata sjednocená na `RaK 1.2 (1.84)`, technická verze `1.2.84`, cache `v1.2-1.84`.

## RaK 1.2 (1.83)

- Export PNG Rozpisů: měsíční přehled je rozšířený o oddělenou plánovanou obsazenost a obsazenost po absencích.
- Přehled nově ukazuje plán obsazeno/volno, plán obsazenost, po absencích obsazeno/volno, obsazenost měsíce, absence záznamů a absence směn.
- Karta měsíčního přehledu má kompaktnější řádky, aby se delší souhrn vešel vedle Absencí bez zbytečného nafukování obrázku.
- `npm run test:app-usage` rozšířený o guard pro oddělení plánované a výsledné obsazenosti v exportním přehledu.
- Release metadata sjednocená na `RaK 1.2 (1.83)`, technická verze `1.2.83`, cache `v1.2-1.83`.

## RaK 1.2 (1.82)

- Administrace → Přehled připojení: opravené centrování iniciál v avatar ikonách, textová část má vlastní wrapper a dvoupísmenné iniciály sedí uprostřed ikonky.
- Export PNG Rozpisů: přidaný nový blok `Měsíční přehled` pod tabulku Absence. Ukazuje směny do práce, ranní/noční směny, dny se směnou, místa celkem, obsazená/volná místa, měsíční obsazenost a absence směn.
- `npm run test:app-usage` rozšířený o guard pro centrovaný avatar Přehledu připojení a pro nový měsíční přehled v exportu Rozpisů.
- Release metadata sjednocená na `RaK 1.2 (1.82)`, technická verze `1.2.82`, cache `v1.2-1.82`.

## RaK 1.2 (1.81)

- Appearance systém: přidaný interní reward contract pro budoucí theme a pozadí, aby nové skiny nebyly jen podobné přebarvené varianty.
- Contract drží pravidlo, že vždy dostupný je jen základní theme a základní pozadí, výrazné skiny se mají odemykat přes hry, achievementy nebo rank.
- `npm run test:app-usage` rozšířený o guard pro appearance contract, vyřazené podobné ID a postupné odemykání.
- Release metadata sjednocená na `RaK 1.2 (1.81)`, technická verze `1.2.81`, cache `v1.2-1.81`.

## RaK 1.2 (1.80)

- Dashboard: vrchní směnový panel je vyšší cca o 10 %, běžné panely a spodní lišta beze změny.
- Theme/pozadí: vyřazené nejpodobnější nové varianty, ponechané výrazné kusy jsou znovu postupně odemykané rankem nebo achievementy.
- `npm run test:app-usage` rozšířený o guard pro 1.80 hero height a appearance reward contract.
- Release metadata sjednocená na `RaK 1.2 (1.80)`, technická verze `1.2.80`, cache `v1.2-1.80`.

## 1.2 (1.79)

## RaK 1.2 (1.79)
- Dashboard CSS stabilizace bez viditelného redesignu: doplněný viewport stack contract guard pro ručně laděné rozměry 360×800, 390×844, 428×926, 430×932 a desktop základ.
- `npm run test:app-usage` rozšířený o kontrolu, že jednotlivé viewport stacky mají pořád pozdní vlastníky ve `styles-dashboard-fit.css` / `styles-dashboard-polish.css` a že 1.79 guard zůstává až za 1.77 výškovou vrstvou.
- Release metadata sjednocená na `RaK 1.2 (1.79)`, technická verze `1.2.79`, cache `v1.2-1.79`.
- Bez zásahu do Supabase DB/policies, spodní lišty, online her, exportu Rozpisů a výpočtové logiky kalkulaček.

## 1.2 (1.77)

## RaK 1.2 (1.77)

- Dashboard: běžné panely jsou opatrně zvýšené maximálně zhruba o 5 % podle viewportu, bez změny spodní lišty a bez redesignu glass stylu.
- `npm run test:app-usage` rozšířený o guard, který hlídá nové výšky panelů a poznámku k 1.77 stabilizační vrstvě.
- Bez zásahu do Supabase DB/policies, online her, exportu Rozpisů, Rotací, Statistik a Kalkulaček.
- Release metadata sjednocená na `RaK 1.2 (1.77)`, technická verze `1.2.77`, cache `v1.2-1.77`.

## 1.2 (1.76)

## RaK 1.2 (1.76)
- Dashboard CSS stabilizace: doplněný legacy inventory guard pro staré dashboard override bloky ve `styles-overrides.css`.
- `npm run test:app-usage` nově hlídá, že historické Dashboard override bloky zůstávají označené jako legacy a že vítězné selektory drží dedikované vrstvy `styles-dashboard-fit.css` / `styles-dashboard-polish.css`.
- Bez viditelného redesignu Dashboardu, bez zásahu do spodní lišty, exportu Rozpisů, herního online flow a Supabase DB/policies.
- Release metadata sjednocená na `RaK 1.2 (1.76)`, technická verze `1.2.76`, cache `v1.2-1.76`.

## 1.2 (1.75)

## RaK 1.2 (1.75)

- Administrace → Přehled připojení: avatar u profilu už nepoužívá jen jedno písmeno, ale dvoupísmenné iniciály. U jména se dvěma částmi bere první písmeno z prvních dvou částí, u jednoslovného profilu první dvě písmena.
- Iniciály jsou převáděné přes české locale, aby zůstala přirozená diakritika, a avatar je dorovnaný přes střed ikony.
- `npm run test:app-usage` rozšířený o kontrolu generování dvoupísmenných iniciál v Přehledu připojení.
- Release metadata sjednocená na `RaK 1.2 (1.75)`, technická verze `1.2.75`, cache `v1.2-1.75`.

## 1.2 (1.74)

## RaK 1.2 (1.74)

- Navázání na potvrzený build 1.73: bez viditelného redesignu, bez změny Dashboard vzhledu a bez zásahu do spodní lišty.
- Rozšířený `npm run test:app-usage` o pevnější Dashboard CSS contract guard: kontroluje poslední CSS vrstvu, jedinečné načtení klíčových polish souborů, pořadí všech dashboard-relevantních CSS vrstev a vlastnictví hlavních dashboard selektorů.
- Přidaná pojistka, že finální dashboard polish vrstva znovu nekreslí shell pseudo-elementy a nesahá do spodní navigace.
- Release metadata sjednocená na `RaK 1.2 (1.74)`, technická verze `1.2.74`, cache `v1.2-1.74`.

## 1.2 (1.73)

## RaK 1.2 (1.73)

- Technická stabilizace Dashboard CSS po dlouhém mobilním ladění: bez viditelného redesignu, bez změny spodní lišty a bez zásahu do exportu Rozpisů.
- Rozšířený `npm run test:app-usage` o statické hlídání Dashboardu, pořadí CSS vrstev a pokrytí hlavních viewportů 360×800, 390×844, 428×926 / 430×932 + desktop základ.
- Přidaná pojistka, že dashboardové CSS vrstvy nezačnou upravovat spodní navigaci.
- Release metadata sjednocená na `RaK 1.2 (1.73)`, technická verze `1.2.73`, cache `v1.2-1.73`.

## 1.2 (1.72)

## RaK 1.2 (1.72)
- Dokončen aktuální refactor/cleanup balík: poslední bezpečný CSS úklid menu/O aplikaci/diagnostiky do `styles-menu-polish.css`.
- Přesunuté jen existující vzhledové vrstvy pro O aplikaci, diagnostiku, zamčené vzhledy a admin přehled připojení; bez změny spodní lišty, Supabase DB a online her.
- Release metadata sjednocená na `RaK 1.2 (1.72)`, technická verze `1.2.72`.

- CSS cleanup: dashboard compact/viewport-fit polish oddělený ze `styles-overrides.css` do nové vrstvy `styles-dashboard-fit.css`.
- Pořadí kaskády zachováno: nový soubor se načítá hned po `styles-overrides.css`, před admin/stats/theme/release/dashboard polish vrstvami.
- Bez zásahu do Supabase DB/policies, online her, výpočtové logiky, Rotace logiky a vizuálních pravidel spodní lišty.
- Verze, cache, realtime kanál, service worker, export metadata a GitHub hlavičky sjednocené na `RaK 1.2 (1.72)`.

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
