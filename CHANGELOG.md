## v.1.1 (507)
- Fáze 2 calcPanel system uzavřena: finální sjednocení šířek, scroll ochrany a vnitřních stacků kalkulaček.
- Přidaný finální runtime audit kalkulaček: hlídá viditelnost neaktivních kalkulaček, chybějící výsledkové boxy a chybějící jednotné třídy tlačítek.
- Doplněné závěrečné CSS guard rails pro kalkulačkové stránky, aby panely neroztahovaly layout a nepřekrývala je spodní lišta.

## v.1.1 (506)
- Rotace: klikací seznam jmen je pevně ukotvený dole nad spodní lištou.
- Rotace: po kliknutí na jméno zůstává jen nápověda k QR kódu, bez popisku pro jedno klepnutí.
- Rotace: sjednocená barva jména/směny a stroje v přehledu/detailu.
- Fáze 2: doplněný finální guard pro dlouhé texty ve výsledcích kalkulaček.

## v.1.1 (505)
- Dashboard hero text mimo aktivní směnu zkrácený na „Další směna v práci…“ a samostatně „Začíná za…“.
- Rotace: klikací seznam jmen je posunutý dolů nad spodní lištu.
- Rotace přehled: jména a stroje jsou o něco menší a vizuálně odlišené.
- Fáze 2: doplněný další bezpečný calcPanel guard pro vnitřní stacky a výsledkové texty.

## v.1.1 (504)
- Fáze 2 pokračuje: sjednocené další bezpečné šířky a overflow guardy kalkulačkových panelů.
- Přesčasové nedělní noční směny zadané pro rok 2026 se nově promítají i do směnové logiky, nejen do kantýny/jídelny.
- Na přesčasovou neděli se nedělní noční směna počítá od 18:00 do 6:00, aby dashboard seděl s otevřením kantýny/jídelny.
- Dashboard: pole Výplata má kratší název a pevnější řádek s ikonou, aby název nespadl pod ikonku.
- Rotace: v přehledu příští směny se dole zobrazují jen přítomní lidé; chybějící jsou přesunutí nahoru do řádku „Přítomno… / Chybí…“.
- Rotace: přehled má větší písmo a seznam jmen je posunutý níž.

## v.1.1 (503)
- Opravená spodní lišta: pevně fixovaná dole, centrovaná a bez ujetí/odříznutí levého kraje.
- Vyčištěné poškozené CSS pravidlo ve starších overridech spodní lišty.
- Fáze 2 pokračuje: kalkulačkové stránky mají větší spodní rezervu a sbalené/rozbalené calcPanel detaily jsou sjednocené.

## v.1.1 (502)
- Fáze 2 calcPanel system: sjednocené reset chování kalkulaček.
- Reset u Frézek, Brusů a Pračky čistí i výsledkové karty.
- Prázdné výsledkové karty se neschovávají jako prázdné boxy v layoutu.
- Výsledky Frézek, Brusů a Pračky mají jednotnou strukturu title / hlavní řádky / doplňkový text.
- Přidaný další kompaktní guard pro zavřené details panely.

## v.1.1 (501)
- Fáze 2: opraven scope kalkulačkových stránek, aby se Soustruhy/Frézky/Brusy/Pračka nezobrazovaly dole na ostatních stránkách.
- Kalkulačkové stránky jsou nově viditelné jen jako `.page.active`, samotný `calcPage` už globálně nepřebíjí skrytí stránky.
- Přidaný lehký runtime audit `phase-2-calc-scope`, který hlídá únik neaktivních kalkulaček do layoutu.
- Pokračování sjednocení calcPanel systému: bezpečné šířky panelů, gridů a info karet v kalkulačkách.

## v.1.1 (500)
- Start Fáze 2: první společný calcPanel systém pro kalkulačky.
- Sjednocené kompaktní panely, tlačítka výpočtů, výsledkové karty a vstupy napříč Soustruhy, Frézky, Brusy a Pračka.
- Panely Frézky/Brusy mají společné CSS proměnné místo dalších náhodných výšek a odsazení.
- Bez zásahu do samotných výpočtů; cílem je stabilní základ pro další čištění kalkulaček.
- Verze sjednocena napříč aplikací a service worker cache navýšena.

## v.1.1 (499)
- Rotace: v detailu po kliknutí na jméno jsou řádky směn lehce užší/kompaktnější.
- Velikost textu v řádcích Rotace zůstává stejná jako ve v.1.1 (498).
- Verze sjednocena napříč aplikací a service worker cache navýšena.

## v.1.1 (498)
- Opraveno zarovnání spodního panelu: panel je níž u spodního okraje, centrovaný a neujíždí mimo levý kraj.
- Spodní navigace už se na mobilu nespoléhá na vodorovný posuv; položky se bezpečně rozpočítají do dostupné šířky.
- Zmenšené safe-area odsazení uvnitř panelu, aby bar nepůsobil zbytečně vysoko.

## v.1.1 (497)
- Post-F1 dokončovací balík pro Dashboard, Rotace a spodní panel.
- Dashboard znovu primárně drží aktuální směnu v práci a její odpočet do konce.
- Pod hlavním stavem je samostatný řádek pro směnu D: začátek/aktivní stav a absence.
- Rotace má ještě větší popisky datum/směna/stroj v detailu osoby.
- Spodní panel má finální jemný polish aktivní položky a čitelnější rozměry před přechodem na další fázi.

## v.1.1 (496)
- Dashboard znovu odděluje aktuální směnu od referenční směny D.
- Hlavní horní stav ukazuje, která směna je právě v práci a za jak dlouho končí.
- Pod tím je samostatná informace pro směnu D: kdy začíná a kdo bude chybět.
- Karta odpočtu už sleduje aktuálně běžící/nejbližší směnu všech týmů, ne pouze směnu D.
- V Rotaci jsou popisky data, směny a stroje v detailu jména zvětšené pro lepší čitelnost.

## v.1.1 (495)
- Dashboard je přepnutý na hlavní referenční směnu D: ukazuje, jestli je D právě v práci, nebo kdy D nastupuje příště.
- Karta „Zbývá/Začíná“ teď také sleduje směnu D, ne nejbližší libovolnou směnu.
- Jídelna a kantýna při otevřeném stavu ukazují i čas „otevřeno do“.
- Rotace: jmenný seznam dole je užší zhruba o 10 %, aby se 10 jmen lépe vešlo do dvou řádků.

## v.1.1 (494)
- Dashboard hero nově při pauze mezi směnami ukazuje nejbližší další směnu a za jak dlouho začne.
- Karta „Zbývá“ se mimo aktivní směnu přepne na „Začíná“ a ukáže odpočet + konkrétní směnu.
- Přidaný robustnější fallback pro delší odstávky/svátky, aby dashboard nekončil jen pomlčkou.

## v.1.1 (493)
- Rotace: detail po kliknutí na jméno teď ukazuje 7 směn dohromady: předchozí směnu a dalších 6 navazujících směn.
- Rotace: karta směny má vlevo datum + směnu a vpravo stroj/cíl.
- Rotace: zvětšené písmo v detailu směn pro lepší čitelnost na mobilu.

## v.1.1 (492)
- Post-F1 Rotace UX: po kliknutí na jméno se ukazuje čistší krátký výpis nejbližších směn bez rušivých souhrnných řádků „Minulá směna“ a „Aktuálně“.
- Výpis je zúžený na předchozí směnu + tři nejbližší směny, aby sekce na mobilu nebyla zbytečně dlouhá.
- QR kód se nově drží podle původního zadání až na třetí rychlé klepnutí na stejné jméno.
- Verze sjednocena v core.js, sw.js, komentáři buildu a changelogu.

## v.1.1 (491)
- Fáze 1 uzavřena finálním runtime auditem základních DOM prvků, CSS vazeb a duplicitních ID.
- Service worker má doplněné pozdě načítané CSS soubory a lokální ikonky dashboardu/spodní lišty do app shell cache.
- Doplněné poslední bezpečné safe-area guard rails pro spodní lištu a scroll na mobilu.
- Export ZIPu doplněn o lifecycle.js, games-arcade.js, pozdě načítané CSS soubory a lokální ikonky.
- Verze sjednocena napříč core.js, sw.js, komentářem buildu a exportem.

## v.1.1 (488)
- Exact duplicate CSS rule blocks were removed from styles-inline-legacy.css a styles-games.css, aby se snížil override noise.
- Build metadata, cache i assets byly srovnány na `485`.
- HTML/JS cleanup pokračuje bez zásahu do layout baseline.


## v.1.1 (457)
- Sjednocené build metadata: verze, cache a viditelnější komentáře teď sedí napříč HTML, JS, CSS i changelogem.
- Kalendář, E-portal a jídelní lístek zůstávají na stabilním napojení; bez zásahu do layoutu.
- CSS cleanup pokračuje bez rozbití baseline UI.

## v.1.1 (454)
- Kalendář na dashboardu je napojený přes samostatný binding s lockem proti dvojímu spuštění a bez inline onclick.
- E-portal a jídelní lístek zůstávají přes tvrdý externí handler s pevným cílovým odkazem.
- Verze a cache byly posunuty na 449.

## v.1.1 (448)

- E-portal fix + in-app calendar iframe + CSS stabilization: poslední override vrstva byla vytažená do samostatného souboru.
- Zatím bez změny layoutu, bottom nav i kalkulačky zůstávají v baseline stavu.
- Připravený základ pro další CSS stabilizační krok bez rozbití UI.

## v.1.1 (441)

- Spodní panel má menší tlačítka a těsnější mezery mezi nimi.
- Kalkulačky na Frézkách a Brusech jsou znovu vyrovnané: sbalené bloky sedí pod sebou, Brusy mají stejné navolení brusu i indexu a panel s aktivním brusem/indexem je kompaktnější.
- Pole pro přesnější výpočet je větší a přehlednější.

## v.1.1 (428)

- Spodní lišta je na iPhonech (vč. 13 Pro Max) blíž ke spodnímu okraji a po stranách – konec zbytečně velkého rámu kolem nav baru.
- Sbalená rozklikávací pole parametrů kalkulaček (brusy + frézky) jsou výrazně nižší a kompaktnější, aby zabírala méně místa.

## v.1.1 (427)

- Spodní lišta je přizpůsobená víc na šířku, položka „Více“ je užší a zbytek tlačítek se rozprostírá přirozeněji.
- Aktivní první položka už není useknutá vlevo a lišta drží líp na menších displejích.
- V administraci rozpisů jsou roky a měsíce oddělené do dvou rozklikávacích menu s aktuálním měsícem předvybraným v základu.
- Z editovatelných rozpisů mizí ruční křížky a odstranění jména je řešené rovnou klikem na konkrétní vyplněné pole.
- Verze, cache i build labely jsou posunuté na novou 427.

# Rotace a kalkulačky

## v.1.1 (418)

- Dashboardové ikonky jsou větší a výraznější, včetně výplaty, a spodní lišta má o něco větší záložky.
- V Rotaci jde kliknout do prázdného prostoru a vrátit se zpět do přehledu; po výběru jména se ukazuje i jedna minulá směna.
- Kalkulačky Brusy a Frézky jsou kompaktnější: dvouřádkový přehled, menší rozklikávací bloky a těsnější layout.
- Herní profily a achievementy se rozšiřují na všechny hry a profilový systém se připravuje na rank/XP vrstvu.
- O aplikaci má jemnější skupiny verzí a jasnější popisky od nejnovějších buildů po nejstarší.
- Supabase propojení a sync flow zůstávají zkontrolované.


# Rotace a kalkulačky

## v.1.1 (407)
- Dashboardové ikonky Kalendář a Jídelna jsou přiblížené původnímu stylu a jsou jednodušší, aby nepůsobily rozsypaně.
- Herní statistiky se po této verzi resetují na nulu, hráč 4157 je z profilu vyhozený a další sync už tenhle starý balast netahá zpátky.
- Profily, achievementy i herní statistiky mají stejný obal a po přihlášení se správně odemykají.
- Spodní lišta drží pevně dole i na stránkách se scrollováním.
- Eportal ikonka zůstává ve zjednodušeném neonovém stylu.
- Update manager a popup zůstávají aktivní pro novou cache.

## v.1(387)
- Statistiky už neukazují popisky typu „Klepni na …“.
- Spodní lišta je posunutá o chlup níž a rozpisy mají víc prostoru pod sebou.
- Administrace má užší a sjednocenější pole pro stroje i rozpisy, včetně měsíční kontroly volných jmen.

## v.1(386)
- Rozpisy v administraci jsou kompaktnější a líp se vejdou na šířku.
- Nové hry mají bezpečnější druhý pokus při vykreslení, aby se hned po otevření neukázala prázdná obrazovka.
- U absencí je zadávání jednodušší: zůstalo to hlavně na datum, jméno a kód.
- V rozpisových polích jsou nápovědy jmen podle dne, takže se snáz hlídají kolize.
- Verze i cache jsou posunuté na 386.


## v.1(383)
- Opravené centrování spodní lišty na širších displejích.
- Vrácené a zúžené šířky rozpisů pro tvrdotu, měkotu i absence.
- Hry už se nenačítají do prázdna a mají bezpečnější render fallback.
- Verze i cache jsou posunuté na 383.

## v.1(382)
- Ve hrách přibyly všechny plánované nové moduly v jednotném glass/iOS stylu, včetně hubu, statistik a leaderboardů.
- Aim Trainer, Reaction Test, Tetris, Space Shooter, Brick Breaker, Doodle Jump, Bubble Shooter, Sudoku, Minesweeper, Memory, Bomberman mini i denní challenge jsou nově součástí herní části.
- Verze i cache jsou posunuté na 382.

## v.1(375)
- Frézky i Brusy jsou po otevření zavřené a jejich rozbalování je přehlednější.
- U Brusů má teď i sekce „Kdy bude hotovo“ vlastní přesnější výpočet, nejen odkaz na horní kalkulačku.
- Verze i cache jsou posunuté na 375.

## v.1(372)
- Statistiky mají ještě menší rozestupy mezi stroji, aby se vešlo všech 6 do jednoho řádku.
- Build a cache verze jsou srovnané na 372.

# Changelog

## v.1(370)
- Spodní panel je ještě o chlup čistší, s rovnoměrnějším vnitřním odsazením a lepším safe-area odstupem na iPhonu.
- Rotace drží příští směnu nahoře v jedné řádce a pod ní ukazuje jméno + stroj.
- Statistiky mají těsnější rozestupy mezi stroji a součet práce + absence drží 73 i u částečných absencí.
- Ve hrách se jméno účtu dotahuje ze Supabase i při přepnutí na jiný účet a druhý blok s přihlášením je pryč.

## v.1(369)
- Spodní lišta má upravené bloky, aktivní stav a menší mezeru u iPhonu.
- Rotace teď ukazuje příští směnu jako jeden řádek a pod ní jména s jejich stroji.
- Statistiky počítají částečné absence jako 0,5 práce a 0,5 absence a úpravy mezer jsou těsnější.
- Hry umí dohledat i jiné účty ze Supabase a Snake má joystick posunutý výš.

## v.1(368)
- Přihlášení ve hrách teď dovolí přepsat aktivní účet bez schovávání formuláře.
- Spodní lišta je na iPhonu výš, ale vypadá kompaktněji; bloky jsou o něco menší.
- Rotace ukazuje příští směnu čistěji vedle nadpisu, Statistiky mají menší mezery mezi stroji.
- Snake má viditelný a funkční virtuální joystick, který není schovaný za lištou.

## v.1(366)
- Spodní lišta je nižší, ale ikonky jsou výraznější a aktivní položka víc vystupuje.
- Rotace má menší text ve výběru jmen, Statistiky širší a přehlednější tile prvky a Snake posunuté ovládání výš.
- Piškvorky se dají opustit přes spodní lištu bez křížku, mají upravenější menu a jasnější invite flow.

## v.1(365)
- Zmenšená lišta, větší ikonky, upravená Rotace a Statistiky.
- Snake dostal funkční virtuální joystick mimo herní plochu.
- Piškvorky mají oddělené menu režimů a lepší online invite flow s přímým otevřením z odkazu.

## v.1(363)

- Dashboard teď u kantýny a jídelny skrývá dnešní datum, zítra ukazuje jako „Zítra“ a další termín drží na vlastním řádku.
- Spodní lišta dostala větší ikonky, kompaktnější vyvážení a výraznější aktivní stav.
- Rotace a Statistiky mají srovnanější výšku tile prvků, plus seznam ve spodku rotace je posunutý výš nad lištu.
- Snake dostal skutečně vložený joystick i tvrdší swipe/touch ovládání.
- Piškvorky se po otevření vrací do menu, umí pokračovat v rozehrané hře a AI víc hlídá hrozby.

## v.1(364)

- Doty u kantýny a jídelny jsou větší a červená je výraznější fosforově rudá.
- Spodní lišta dostala ještě větší ikonky a „Více“ zůstalo úzké a vycentrované.
- Rotace má menší spodní seznam jmen a Statistiky větší tile prvky.
- Herní přehled na první stránce se teď dotahuje i z online dat, aby všichni viděli aktuální stav.

# Rotace a kalkulačky

## v.1(367)
- Dashboard a spodní lišta dostaly další kompaktější ladění, titul Rotace a Kalkulačky je zřetelněji rozdělený do dvou řádků.
- Rotace má vyšší výběrové bloky jmen a přehled příští směny je čistší: nahoře je jedna souhrnná budoucí směna, pod ní už jen bloky jméno + stroj.
- Statistiky mají užší stroje, menší písmo a Piškvorky dostaly upravený invite flow, těsnější hrací pole a výš posunuté Snake ovládání.

## v.1(362)
- Ztišily se zbytečné alerty v herní části a admin ukládání běží víc inline.
- Piškvorky, 2048, Snake i Flap Bird zůstávají v kompaktním mobile-first layoutu.
- Herní sync, leaderboardy a Supabase napojení dál drží poslední stabilní základ.

## v.1(345)–v.1(350)
- Hry jsou kompaktnější, mobilnější a bez zbytečných ovládacích křížů.
- Piškvorky mají online sync, top 10 leaderboardy a tvrdší AI blokování.
- Supabase dostal další cleanup, indexy pro herní lookupy a bezpečnější napojení.
- Changelog je zkrácený do větších milníků místo dlouhého seznamu každé verze.

## v.1(323)–v.1(344)
- Stabilizovala se herní sekce, invite flow a herní statistiky.
- Přibyly 2048, Snake a Flap Bird v mobilním layoutu.
- Spodní lišta, přihlášení a online/offline sync dostaly kompaktnější chování.
- Inline skripty se začaly rozdělovat do samostatných modulů.

## v.1(310)–v.1(322)
- Service worker, manifest a offline fallback se ustálily do PWA základu.
- Přibyly online/offline refresh hooky a sync queue.
- Rotace a kalkulačky se dál refaktorovaly do stabilnějšího runtime.

## v.1(291)–v.1(309)
- Dashboard dostal čistší loading stavy a menší vizuální chaos.
- Piškvorky se průběžně ladily proti zamrznutí po tahu AI.
- Layout aplikace se dál zjemňoval pro mobil.

## v.1(250)–v.1(289)
- Jídelna a kantýna se sjednocovaly do přehlednějšího zobrazení.
- Dashboard ukazoval další směny, absenci a procenta průběhu.
- Kalkulačky pro frézky a brusy se postupně zpřesňovaly.
