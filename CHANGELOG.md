## v.1.1 (557)

- Fáze 6 — Supabase hardening posunuta na cca 78 %.
- Online herní session/pozvánky mají nově lokální cache podle kódu pozvánky.
- Když je slabý internet nebo offline stav, načtení online hry umí použít poslední známou session místo prázdného selhání.
- Uložení online herní session se při offline/slabém internetu uloží do Supabase fronty a odešle se později.
- Fronta nově podporuje typ `game_session` a deduplikuje ho podle kódu pozvánky, aby se neodesílal starý stav zbytečně víckrát.
- Diagnostika Supabase nově ukazuje session cache hity/zápisy, session fallbacky, queued save a session save chyby.
- Scroll reset z buildu 556 zůstává zachovaný beze změny.
- Výpočty, pravidla her, Theme/Pozadí, otevírací doba, Supabase datový model a spodní lišta jsou funkčně beze změny.

## v.1.1 (556)

- Při přepnutí hlavní stránky/podstránky se obsah nově nastaví na začátek stránky.
- Spodní navigace už nepoužívá vertikální `scrollIntoView`, které mohlo po přepnutí stáhnout stránku dolů.
- Aktivní položka spodní navigace se dál centruje jen vodorovně v rámci spodního panelu.
- Scroll reset se nespouští při refreshi stejné stránky ani v otevřené hře.
- Výpočty, pravidla her, Theme/Pozadí, otevírací doba, Supabase datový model a spodní lišta jsou funkčně beze změny.
- Fáze 6 — Supabase hardening zůstala cca 70 %.

## v.1.1 (555)

- Fáze 6 — Supabase hardening posunuta na cca 70 %.
- Supabase offline fronta se nově odesílá po menších dávkách, aby při větší frontě nezablokovala appku ani slabší mobil.
- Retry fronty má chytřejší plánování dalšího pokusu, včetně jemného jitteru, aby se po slabém internetu neposílaly všechny požadavky naráz.
- Když jsou položky ještě v backoff pauze, appka si zapamatuje nejbližší další retry čas a sama si naplánuje další flush.
- Diagnostika Supabase nově ukazuje dávkový limit fronty, plánované flush pokusy, batch stop stav a další retry čas.
- Funkce aplikace, výpočty, pravidla her, Theme/Pozadí, otevírací doba a spodní lišta beze změny.

## v.1.1 (554)

- Popup Kantýna/Jídelna nově zvýrazňuje aktuální otevřený časový blok, když je právě otevřeno.
- Když je zavřeno, zvýrazní se další nejbližší termín otevření jiným odstínem.
- Nad seznamem otevírací doby je nový přehledový glass box s informací „aktuální otevření“ nebo „teď zavřeno / další otevření“.
- Zvýraznění funguje i v běžné stránce Jídelní lístek, protože používá stejný render jako popup.
- Fáze 6 — Supabase hardening zůstává cca 64 %.
- Výpočty, pravidla her, Theme/Pozadí, spodní lišta a Supabase datový model beze změny.

## Přehled největších změn v.1.1 (500–557)
- Proběhlo velké stabilizační období před dalšími fázemi refactoru: Fáze 3 Láďův režim, Fáze 4 cleanup manager, Fáze 5 game performance a start Fáze 6 Supabase hardening.
- Dashboard se postupně ladil kvůli správnému zobrazení směny, ikon, kantýny/jídelny, odpočtů a menšímu riziku prázdných nebo pozdě načtených karet.
- Spodní navigace prošla opakovaným dorovnáním, hlavně položka „Více“ – má být užší, ale normálně mezi ostatními položkami a bez ukotvení vpravo.
- Rotace dostala stabilnější spodní dock jmen, lepší safe-area chování na menších displejích typu Samsung A15 a čistší zobrazení příští směny.
- Rozpisy mají zvýraznění aktuální a budoucí směny, užší sloupce datum/směna u Měkoty/Tvrdoty a víc prostoru pro tabulky.
- Statistiky dostaly kompaktnější dlaždice lidí/strojů, snahu vejít stroje do jednoho řádku a čistší souhrny práce/absence.
- Kalkulačky prošly sjednocením calcPanel systému, většími klikacími/navolovacími tlačítky a návratem barevných indexů u Brusů ve glass stylu.
- Všechny hry jsou přesunuté do „Ve vývoji“, herní hub dostal výrazné performance optimalizace, méně opakovaných renderů a lepší cache profilů/statistik.
- Supabase Realtime a offline/online sync se zpevňují: timeouty, retry, offline fronta, deduplikace, cache/fallback, session cache online her a diagnostika.
- Nastavení → Theme dostalo volbu pozadí, výrazná glass-friendly pozadí a postupný iOS glass polish napříč aplikací.

## Přehled největších změn v.1 (450–499)
- Období příprav na větší stabilizační/refactor plán a sjednocení pravidel, že se má vždy pokračovat z posledního potvrzeného buildu.
- Začal se víc řešit technický dluh: duplicity, přebíjení stylů, přerůstající CSS/JS a potřeba bezpečnějších guardů místo náhodného ladění jednotlivých prvků.
- Postupně se dolaďovala mobilní použitelnost: safe-area, spodní lišta, výška panelů, mezery, čitelnost a stabilita na iPhonu i Androidu.
- Připravoval se směr k iOS/glassmorphism vzhledu, ale s důrazem na opatrný postup, aby se nerozbily funkce a výpočty.

## Přehled největších změn v.1 (400–449)
- Projekt přešel do rozsáhlejšího herního a účtového rozšiřování.
- Přibyly nebo se začaly sjednocovat hráčské profily, herní statistiky, leaderboardy, online ukládání a vazba na Supabase.
- Začal se řešit větší herní plán: Snake, Piškvorky, 2048, Flappy Car a příprava dalších her do jednotného hubu.
- Aplikace se víc posouvala k mobile-first rozložení a k tomu, aby hry i běžné části fungovaly bez rušivých reloadů.
- Supabase se postupně začalo používat jako základ pro online data, ale současně bylo potřeba víc řešit fallbacky a stabilitu při slabém internetu.

## Přehled největších změn v.1 (350–399)
- Výrazně se ladily hry, spodní lišta, Rotace a Statistiky.
- Přibylo víc herních modulů a společný herní hub, včetně leaderboardů a online invite flow.
- Piškvorky dostaly tvrdší AI, online režim a lepší návrat do rozehrané hry.
- Snake dostal mobilní ovládání/joystick, 2048 a další hry se ladily do kompaktního mobilního layoutu.
- Spodní lišta a aktivní stavy prošly více koly ladění kvůli iPhonu, safe-area a celkové čitelnosti.
- Rotace a Statistiky dostaly více tile prvků, menší rozestupy a lepší zobrazení jmen/strojů.

## Přehled největších změn v.1 (300–349)
- Vznikal stabilnější PWA základ: service worker, manifest, offline fallback, cache a aktualizační hooky.
- Rozdělovaly se části inline skriptů do samostatnějších modulů.
- Stabilizovala se herní sekce, invite flow a první větší online/offline sync vrstvy.
- Přibyly hry jako 2048, Snake a Flap Bird v mobilním layoutu.
- Dashboard, spodní lišta a přihlášení se ladily kvůli menšímu chaosu při načítání a přepínání stránek.

## Přehled největších změn v.1 (250–299)
- Dashboard se rozšiřoval o další směny, absenci, procenta průběhu, výplatu, kantýnu/jídelnu a přehlednější stavové karty.
- Jídelna a kantýna se sjednocovaly do přehlednějšího zobrazení s lepším výpočtem otevřeno/zavřeno a dalšího termínu.
- Kalkulačky pro Frézky a Brusy se postupně zpřesňovaly, včetně výpočtů času, dávek a hotových kusů.
- Mobilní layout se dál čistil, aby hlavní části aplikace byly použitelné bez nutnosti zoomu nebo posouvání mimo obrazovku.

## Přehled největších změn v.1 (200–249)
- Aplikace se posouvala z původního prototypu do stabilnější vícestránkové appky s Dashboardem, Rotací, Rozpisy, Statistikami a Kalkulačkami.
- Začalo se víc řešit ukládání dat, export, verze buildu a kontrola toho, aby změny nezmizely mezi jednotlivými ZIPy.
- Rozpisy a rotace se ladily podle reálného použití v práci, včetně směn, strojů, absencí a přehledů pro lidi.
- Přibývaly první větší úpravy vzhledu a použitelnosti na mobilu.

## Přehled největších změn v.0.xx až v.1 (199)
- Vznikl základ aplikace Rotace a kalkulačky: směnová logika, základní dashboard, první kalkulačky a pracovní přehledy.
- Přidávaly se stroje, jména, směny, první statistiky a základní exportní/logická vrstva.
- Hlavní priorita byla funkčnost výpočtů a ruční ladění podle testování, ne ještě finální vzhled ani čistá architektura.
- Postupně se ukázalo, že projekt potřebuje silnější pravidla pro verze, safepointy, navazování na poslední ZIP a pozdější refactor.

## Poslední jednotlivé buildy v.1.1 (548)
- Fáze 6 — Supabase hardening posunuta na cca 42 %.
- Herní účty a herní statistiky mají krátkou lokální cache/fallback, takže při slabém internetu nezmizí poslední známé výsledky do prázdna.
- Supabase čtení herních účtů/statistik se sdílí přes in-flight guard, aby více stejných požadavků neběželo paralelně.
- Po uložení herní statistiky se příslušná cache leaderboardu vyčistí, aby se po zápisu zbytečně nedržel starý výsledek.
- Přidané výraznější glass pozadí: Blue orbit a Magma lime.

## Poslední jednotlivé buildy v.1.1 (547)
- Fáze 6 — Supabase hardening posunuta na cca 34 %.
- Herní pozvánky a online session operace používají společný Supabase timeout/retry guard.
- Theme/Pozadí má pojistku pro opětovné aplikování po reloadu, pageshow, focusu a návratu do appky.
- Přidané výraznější glass pozadí: Aurora punch, Violet storm, Sunset plasma a Polar mint.
- Diagnostika aplikace ukazuje i aktuální zvolené pozadí.

## Poslední jednotlivé buildy v.1.1 (546)
- Nastavení → Theme/Pozadí: opravené klikání na varianty pozadí.
- Přidané výraznější glass-friendly pozadí: Neon lagoon, Electric lime, Škoda electric a Candy glass.
- Aktivní karta pozadí má výraznější glass zvýraznění podle akcentu zvoleného pozadí.
- Tlačítko Aktualizovat je kontrastnější a víc navázané na akcent aktuálního pozadí.

## Poslední jednotlivé buildy v.1.1 (545)
- Nastavení → Theme má sekci Pozadí pro volbu glass-friendly pozadí aplikace.
- Přidané varianty pozadí: iOS mesh, Škoda glass, Světle zelená, Deep aurora, Ember glass a Původní RaK.
- Pozadí mění atmosféru a kontrast glass prvků, ne rozložení ani velikosti.
- Láďův režim / low-end režim používá jednodušší statické pozadí bez náročné dodatečné vrstvy.

## Poslední jednotlivé buildy v.1.1 (544)
- Kalkulačky / Brusy: vrácené barevné rozlišení indexů AD / AE / AH / AD volné / AE volné.
- Barvy indexů jsou sladěné s průhledným iOS glass stylem.
- Výpočty, Supabase logika, hry ani rozložení spodní lišty beze změny.

## Poslední jednotlivé buildy v.1.1 (543)
- Přidán timeout guard pro Supabase čtení/zápisy, aby požadavky nemohly na mobilu viset donekonečna.
- Zápisy přes Supabase mají u přechodných chyb jeden bezpečný retry a potom fallback do offline fronty.
- Přidán krátký online write cooldown při čerstvě frontovaných změnách, aby se při slabém internetu neposílalo více zápisů najednou.
- Diagnostika aplikace ukazuje Supabase timeouty, retry pokusy, fallbacky do fronty a cooldown skipy.

## Poslední jednotlivé buildy v.1.1 (542)
- Fáze 6 Supabase hardening zahájená bez změny databázového schématu.
- Offline Supabase fronta má ochranný limit 120 položek, deduplikaci posledních změn a ochranu proti příliš velkým položkám v localStorage.
- Realtime připojení dostalo guard proti duplicitnímu připojování.
- Diagnostika umí zobrazit délku fronty, limit, stav realtime a počty ořezaných/sloučených/odmítnutých položek.

## Poslední jednotlivé buildy v.1.1 (541)
- Fáze 5 game performance uzavřená na 100 %.
- Globální live refresh už nespouští herní leaderboardy, pokud uživatel není přímo v herním hubu.
- iOS glass polish pokračuje napříč aplikací: panely, karty, dlaždice, modaly, navigační prvky a herní sekce jsou průhlednější a víc rozmazávají pozadí.
- Láďův režim / low-end režim náročnější blur vrstvy dál vypíná.

## Poslední jednotlivé buildy v.1.1 (540)
- MutationObserver pro herní launch tiles je omezený hlavně na herní stránku, takže nesleduje zbytečně celou aplikaci.
- Přidaný online refresh guard pro návrat internetu: profily/leaderboardy se obnoví jen při otevřeném herním hubu.
- Diagnostika rozšířená o rendery profilů/statistik/achievementů, cache hity leaderboardů, fresh loady, online refresh a ignorované observer změny.

## Poslední jednotlivé buildy v.1.1 (539)
- Tišší MutationObserver pro launch tiles – rychlé změny DOM se sloučí a dlaždice se nepřekreslují při každé drobné změně.
- Sync profilů lépe pozná offline stav, skrytou/neaktivní herní stránku a zbytečný opakovaný sync.
- Přidaný postupný iOS glass polish pro vstupy, menší akční prvky a herní skládací sekce.

## Poslední jednotlivé buildy v.1.1 (538)
- Přidaný úsporný sync hráčských profilů – opakované online načtení se slučuje a používá krátkou cache.
- Profily a achievementy se nepřekreslují, pokud se jejich HTML obsah nezměnil.
- Leaderboard refresh má in-flight pojistku a v pozadí se zbytečně nespouští.

## Poslední jednotlivé buildy v.1.1 (537)
- Herní hub se nepřekresluje zbytečně, když se obsah nezměnil.
- Launch tiles mají ochranu proti opakovanému renderu.
- Herní statistiky mají lehčí odložený render.
- Diagnostika počítá přeskočené rendery herních dlaždic/statistik a odložené rendery statistik.
