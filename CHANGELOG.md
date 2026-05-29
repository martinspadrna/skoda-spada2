## v.1.5 (973)
- Hotfix spodní lišty: vrácena výška, pořadí ikon a rozměry podle v971.
- Aktivní glass zvýraznění se dál plynule přesouvá mezi ikonami, ale už nemění výšku panelu ani neprohazuje pořadí.
- Verze sjednocena na v.1.5 (973), cache na `v1.5-973`, realtime kanál na `rak-public-live-v973`, package na `1.5.973`.

## v.1.5 (972)
- Spodní lišta má nový aktivní glass panel přes celou výšku položky, který se mezi ikonami plynule přesouvá místo skokového „teleportu".
- Ikonky ve spodní liště jsou větší a zarovnané nad textem; „Více" zůstává úzké.
- Tlačítka Rozpisy/Statistiky v Rotaci jsou lehce větší a křížek v Rozpisech/Statistikách je opticky srovnaný s nadpisem.
- Dashboard má ještě větší ikonky v dlaždicích.
- Verze sjednocena na v.1.5 (972), cache na `v1.5-972`, realtime kanál na `rak-public-live-v972`, package na `1.5.972`.

## v.1.5 (971)
- Spodní lišta: ikonky jsou o něco větší a přesněji vycentrované nad textem.
- Spodní lišta: položka „Více“ zůstává úzká, je posunutá víc doprava a text se nemá ořezávat.
- Rotace: tlačítka „Rozpisy“ a „Statistiky“ jsou užší a nepůsobí jako plnošířkové panely.
- Dashboard: ikonky v dlaždicích jsou větší, bez změny pravidel Piškvorek nebo Supabase DB.

## v.1.5 (970)
- Rotace: v detailu po kliknutí na jméno jsou datum, označení směny a stroj na jednom řádku.
- Rotace: detail směn je znovu zkompaktněný bez změny velikosti textu.
- Spodní lišta: položka „Více“ má výrazně užší klikací panel, zůstává vpravo a její text je lehce posunutý doleva, aby byl vidět celý.

## v.1.5 (968)
- Layout hotfix: položka „Více“ ve spodní liště má užší klikací panel a ostatní tlačítka se roztahují do zbytku šířky.
- Dashboard se nově řídí reálnou výškou viewportu a spodní navigace, aby nezasahoval do nadpisu, nezajížděl pod lištu a nemusel scrollovat ani při viditelné systémové liště telefonu.
- Vrchní panel Dashboardu má znovu centrovaný řádek směny bez ručních posunů na šířkách 412 px a 430 px.
- Detail jména v Rotaci je nižší zhruba o 10 % a křížky v Rozpisech/Statistikách jsou centrované v tlačítku.

## v.1.5 (967)
- Hotfix spodní navigace: položka „Více“ je napevno umístěná v pátém sloupci a nesmí spadnout na druhý řádek.
- Hlavní čtyři položky spodní lišty se dál roztahují do zbylého prostoru, „Více“ zůstává užší.
- Piškvorky a ostatní funkce beze změny oproti v966.
- Verze sjednocena na v.1.5 (967), cache na `v1.5-967`, realtime kanál na `rak-public-live-v967`, package na `1.5.967`.

## v.1.5 (966)
- Piškvorky proti AI: přidaná vrstva `tttV966BestMove()` s prioritou vlastního forcing tahu před blokováním slabší / zavřené trojky soupeře.
- Ruleset Piškvorek navýšen na `gomoku-10col-19row-ai-rules-v14`; online PvP zůstává beze změny.
- Dashboard se adaptivně přizpůsobuje výšce displeje a lépe využívá volné místo nad spodní lištou.
- Rotace: výběr jmen se kotví nad spodní navigaci a Rozpisy/Statistiky mají křížek zpět na Rotace.
- Spodní navigace: „Více“ zůstává užší, ostatní hlavní panely se roztahují do zbylého místa a ikony jsou větší.
- Admin / Přehled připojení lépe zobrazuje rozlišení zařízení / viewport / DPR.
- O aplikaci: souhrny po cca 50 verzích jsou zkrácené na stručné bloky.
- Verze sjednocena na v.1.5 (966), cache na `v1.5-966`, realtime kanál na `rak-public-live-v966`, package na `1.5.966`.

## v.1.5 (964)
- Admin přehled připojení je přepojený na RPC `rak_usage_presence_touch` / `rak_usage_presence_admin`, které se podařilo nasadit do Supabase.
- Zachované šetrné anonymní logování zařízení bez surové IP.
- Online hry, Piškvorky a Lodě beze změny.
- Verze sjednocena na v.1.5 (964), cache na `v1.5-964`, realtime kanál na `rak-public-live-v964`, package na `1.5.964`.

## v.1.5 (962)
- Piškvorky proti AI: přidaná anti-fork vrstva `tttV962BestMove()` nad v961, aby AI dřív blokovala tahy hráče vedoucí k otevřené čtyřce se dvěma okamžitými výhrami.
- Doplňený killer scan pro gain square: AI hledá tah X, který by příště vytvořil dvojitou výhru nebo křížový fork, a obsadí skutečné taktické pole.
- Přidaný helper `getRakGomokuAiV962Health()` a lokální smoke script `gomoku-ai-smoke-v962.js` včetně testu rekonstruované pozice ze screenshotu.
- Ruleset Piškvorek navýšen na `gomoku-10col-19row-ai-rules-v12`; online PvP, Supabase DB a policies beze změny.
- Verze sjednocena na v.1.5 (962), cache na `v1.5-962`, realtime kanál na `rak-public-live-v962`, package na `1.5.962`.

## v.1.5 (961)
- Piškvorky proti AI: přidána nová vrchní pipeline `tttV961BestMove()` s přesným blokováním endpointů, gapů u broken-three a gain/cost polí.
- AI nově ověřuje 8–16 nejlepších kandidátů bezpečnostní kontrolou proti okamžité výhře hráče, open-four/fork tlaku a nejhorší odpovědi hráče.
- Posílené diagonální hrozby `\` i `/`: open-three, broken/split three, čtyřky a příští gain tahy hráče.
- Ruleset Piškvorek navýšen na `gomoku-10col-19row-ai-rules-v11`; změna se týká pravidel/obtížnosti, ne vzhledu.
- Přidaný helper `getRakGomokuAiV961Health()` a lokální smoke script `gomoku-ai-smoke-v961.js`.
- Verze sjednocena na v.1.5 (961), cache na `v1.5-961`, realtime kanál na `rak-public-live-v961`, package na `1.5.961`.

## v.1.5 (960)
- Piškvorky AI: posílená line-window obrana hlavně proti diagonálním build-upům po výhře kolem 23. tahu diagonálně; ruleset navýšen na `gomoku-10col-19row-ai-rules-v9`.
- Dashboard: jemné dorovnání textu horního směnového panelu pro viewporty 412×918 a 430×932 bez zásahu do viewportů, které už seděly.
- Aktualizační popup: větší a výraznější ikona.
- Verze sjednocena na v.1.5 (960), cache na `v1.5-960`, realtime kanál na `rak-public-live-v960`, package na `1.5.960`.

## v.1.5 (958)
- Daily challenge: top výsledky se nově filtrují podle právě vybrané denní hry (`daily_aim`, `daily_memory`, `daily_reaction`…), takže se nemíchají odehrané challenge různých her.
- Pexeso: opravený chybný čas 86400 s; neplatný 24h fallback se ignoruje a nově dohraná hra jej přepíše skutečným časem.
- Piškvorky AI: přidaný diagonální gain guard, který blokuje tahy hráče vedoucí k čtyřce/forku/forcing sekvenci ještě před tím, než vznikne hotová otevřená trojka.
- Piškvorky: ruleset verze navýšena na `gomoku-10col-19row-ai-rules-v8`, protože se měnila obtížnost/herní logika.
- Verze sjednocena na v.1.5 (958), cache na `v1.5-958`, realtime kanál na `rak-public-live-v958`, package na `1.5.958`.

## v.1.5 (956)
- Dashboard: řádek `chybí / bude chybět` v horním panelu je opravdu centrovaný vůči celé kartě, obal už nemá roztáhlé pozadí do jedné strany a na 360×800 drží spodní linku.
- Piškvorky AI: přidaná přímá detekce endpointů otevřených trojek; AI má blokovat skutečný konec hrozby, ne pole o krok vedle.
- Piškvorky: ruleset verze navýšena na `gomoku-10col-19row-ai-rules-v6`; změna se týká obtížnosti/logiky, ne vzhledu appky.
- Verze sjednocena na v.1.5 (956), cache na `v1.5-956`, realtime kanál na `rak-public-live-v956`, package na `1.5.956`.

## v.1.5 (955)
- Dashboard: řádek „chybí“ v horním směnovém panelu je centrovaný vůči celé kartě; pill už není natažený doleva.
- Piškvorky: AI proti počítači má předělanou bounded threat/safety pipeline, silnější blokování open-four/fork/open-three hrozeb a legální fallback proti zaseknutí.
- Piškvorky: hrací pole zůstává 10 sloupců × 19 řad, online PvP zůstává člověk proti člověku.
- Piškvorky: ruleset verze navýšena na `gomoku-10col-19row-ai-rules-v5`, protože se měnila obtížnost/herní logika.
- Verze sjednocena na v.1.5 (955), cache na `v1.5-955`, realtime kanál na `rak-public-live-v955`, package na `1.5.955`.

## v.1.5 (954)
- Dashboard: horní směnový panel má nově vycentrovaný i subřádek/popisek „kdo chybí“, včetně přepsání starších posunů na menších displejích.
- Piškvorky: hrací pole zůstává 10 sloupců × 19 řad; AI obtížnost má novou bounded tactical/safety vrstvu, kratší pevný deadline a nouzový legální fallback, aby se nezasekla.
- Piškvorky: ruleset verze navýšena na `gomoku-10col-19row-ai-rules-v4`, protože se měnila obtížnost/herní logika, ne vzhled aplikace.
- Verze sjednocena na v.1.5 (954), cache na `v1.5-954`, realtime kanál na `rak-public-live-v954`, package na `1.5.954`.

## v.1.5 (953)
- Dashboard: horní směnový panel má vycentrované texty pro aktuální směnu, odpočet, směnu D a absence napříč displeji.
- Přidán read-only helper `getRakDashboardHeroCenteringHealth()`.
- Verze sjednocena na v.1.5 (953), cache na `v1.5-953`, realtime kanál na `rak-public-live-v953`, package na `1.5.953`.

## v.1.5 (952)
- Piškvorky: oprava rozměru hracího pole zpět na 10 sloupců × 19 řad.
- Piškvorky AI: posílená promptová safety pipeline pro okamžité výhry, povinné bloky, fork/anti-fork, root safety ověření odpovědí a deadline fallback bez zaseknutí.
- Piškvorky: nová samostatná ruleset verze `gomoku-10col-19row-ai-rules-v3`; mění se kvůli pravidlům/obtížnosti, ne kvůli vzhledu appky.
- Online PvP Piškvorky zůstává člověk proti člověku; AI se nepouští do online tahu.
- Verze sjednocena na v.1.5 (952), cache na `v1.5-952`, realtime kanál na `rak-public-live-v952`, package na `1.5.952`.

## v.1.5 (951)
- Piškvorky: převedení hlavního rulesetu na 10×19 podle Gomocup/Piskvork notace `RECTSTART 19,10`; nové hry používají 10 řad × 19 sloupců a samostatnou verzi pravidel `gomoku-10x19-ai-rules-v2`.
- Piškvorky: AI tah používá jednotný deadline, okamžité taktické testy výhra/blok a bezpečný fallback nejblíže středu, aby se nezasekla ani na slabším zařízení.
- Online Piškvorky: do session payloadu se ukládá ruleset, rozměr desky a win length; klient odmítne nekompatibilní starou online hru místo tichého rozbití stavu.
- Žebříček poražené AI dál filtruje podle `ruleset_version`, takže změna obtížnosti/pravidel začne čistou tabulku bez vazby na verzi celé appky.
- Verze sjednocena na v.1.5 (951), cache na `v1.5-951`, realtime kanál na `rak-public-live-v951`, package na `1.5.951`.

## v.1.5 (950)
- Piškvorky: online žebříček výher se znovu zobrazuje v aplikaci; opravené načítání `gomoku_wins`, které dřív řadilo podle neexistujících sloupců `priority/updated_at`.
- Piškvorky: přidaná samostatná `GOMOKU_RULESET_VERSION`, oddělená od verze celé aplikace. Žebříček se filtruje podle aktuální verze pravidel/obtížnosti Piškvorek.
- Supabase: tabulka `gomoku_wins` má nový sloupec `ruleset_version` a index pro rychlé načítání aktuálního žebříčku.
- Verze sjednocena na v.1.5 (950), cache na `v1.5-950`, realtime kanál na `rak-public-live-v950`, package na `1.5.950`.

## v.1.5 (950)
- Dashboard oznámení je znovu globální online-first: administrace ukládá přes Supabase RPC a Dashboard preferuje online oznámení pro všechny uživatele.
- Lokální úložiště zůstává jen jako cache/fallback, aby oznámení nezmizelo při pomalejším startu nebo offline režimu.
- Supabase `announcements` je dočištěná na jedno aktivní oznámení, aby klienti nečetli duplicitní staré řádky.
- Verze sjednocena na v.1.5 (950), cache na `v1.5-950`, realtime kanál na `rak-public-live-v950`, package na `1.5.950`.

## v.1.5 (948)
- Dashboard: lokální oznámení se znovu vykreslí při každém refreshi Dashboardu, takže má zůstat viditelné i po vypnutí a zapnutí appky.
- Dashboard: čtení lokálního oznámení jde primárně přímo z localStorage, ne ze staré JSON cache.
- Dashboard: jemné viewport-fit doladění pro 412×892, kde ještě zůstával malý scroll.
- Verze sjednocena na v.1.5 (948), cache na `v1.5-948`, realtime kanál na `rak-public-live-v948`, package na `1.5.948`.

## v.1.5 (947)
- Administrace → Oznámení Dashboard: odstraněné samostatné online ukládání přímo z oznámení; oznámení je lokální nastavení a obecné tlačítko online synchronizace appky zůstává beze změny.
- Dashboard: jemný viewport-fit breakpoint pro 390×844, aby se odstranil malý scroll bez zbytečného zmenšení ostatních rozlišení.
- Verze sjednocena na v.1.5 (947), cache na `v1.5-947`, realtime kanál na `rak-public-live-v947`, package na `1.5.947`.

## v.1.5 (946)
- Administrace → Oznámení Dashboard: online ukládání opraveno přes Supabase RPC `rak_save_dashboard_announcement`; oznámení už nemá zůstávat jen lokálně a po restartu appky se má načíst z online cache/refresh.
- Supabase: doplněná RPC cesta pro save/clear oznámení, prázdný nadpis je povolený.
- Verze sjednocena na v.1.5 (946), cache na `v1.5-946`, realtime kanál na `rak-public-live-v946`, package na `1.5.946`.

## v.1.5 (945)
- Dashboard: ve viewport-fit režimu jsou běžné panely lehce větší, protože nad spodní lištou zůstávala rezerva skoro na další panel.
- Horní směnový panel zůstává chráněný proti přílišnému zmenšení.
- Verze sjednocena na v.1.5 (945), cache na `v1.5-945`, realtime kanál na `rak-public-live-v945`, package na `1.5.945`.

## v.1.5 (944)
- Dashboard: viewport-fit režim z v943 doladěn, aby na malých displejích nebyl horní směnový panel příliš zmenšený.
- Horní panel s informací kdo je v práci, kdy půjde směna D a kdo bude chybět je v kompaktním režimu čitelnější.
- Verze sjednocena na v.1.5 (944), cache na `v1.5-944`, realtime kanál na `rak-public-live-v944`, package na `1.5.944`.

## v.1.5 (943)
- Dashboard: přidaný viewport-fit režim pro 360×800 a podobné displeje; kompaktní layout se spíná podle šířky i výšky, ne jen podle šířky.
- Menší výška dashboard karet, menší mezery, kompaktnější hero karta, menší ikony a popisky jen na nízkých/úzkých displejích.
- Verze sjednocena na v.1.5 (943), cache na `v1.5-943`, realtime kanál na `rak-public-live-v943`, package na `1.5.943`.

## v.1.5 (942)
- Statistiky → Obsazenost strojů: jemné theme podbarvení je jen pod čárou grafu, ne přes celé pole; SVG výplň používá bezpečné `rgb(...)` + `fill-opacity` místo rizikového fallbacku.
- Přidán kritický CSS fallback v hlavičce aplikace, aby se při problémovém/pozdním načtení stylů nezobrazila bílá stránka s obřími ikonami.
- Verze sjednocena na v.1.5 (942), cache na `v1.5-942`, realtime kanál na `rak-public-live-v942`, package na `1.5.942`.

## v.1.5 (941)
- Statistiky → Obsazenost strojů: podbarvení grafu je nově jen pod čárou, tedy v místě původní černé plochy; celoplošný tint z v940 je vypnutý.
- Area fill používá explicitní inline `rgba(...)` z aktuálního theme, aby se nevrátil černý SVG fallback.
- Verze sjednocena na v.1.5 (941), cache na `v1.5-941`, realtime kanál na `rak-public-live-v941`, package na `1.5.941`.

## v.1.5 (940)
- Statistiky → Obsazenost strojů: měsíční graf už není ani černý, ani úplně prázdný; pole grafu má jemný theme tint přes celý chart box, ale bez rizikové area fill vrstvy pod čárou.
- Verze sjednocena na v.1.5 (940), cache na `v1.5-940`, realtime kanál na `rak-public-live-v940`, package na `1.5.940`.

## v.1.5 (939)

- Statistiky → Obsazenost strojů: měsíční graf už nemá černou výplň pod/mezi body; SVG plocha používá stabilní theme-aware `rgba(var(--theme-rgb), …)` místo rizikového fallbacku.
- Přidaný bezpečný Playwright monkey test `playwright-monkey.spec.js` a skript `npm run test:monkey`; test nekliká na destruktivní/admin/online akce.
- Přidané dokumenty `stats-monthly-chart-black-fill-v937.md`, `safe-monkey-test-v937.md`, `monkey-run-attempt-v937.md` a `about-50-version-summary-v937.md`.
- Verze sjednocena na v.1.5 (939), cache na `v1.5-939`, realtime kanál na `rak-public-live-v939`, package na `1.5.939`.

## v.1.5 (936)
- Administrace → Oznámení Dashboard: přepínače `Aktivní` a `Text má jezdit` jsou nově bez zbytečného panelového pozadí, čitelnější a pořád vedle sebe kvůli úspoře místa.
- Statistiky → Obsazenost strojů: měsíční graf už není černý box; karta, čára, plocha, body i mřížka používají barvy aktuálního theme.
- Přidaný helper `getRakStatsMonthlyThemeChartHealth()` a release gate `v936-stats-monthly-theme-chart`.
- Přidané dokumenty `dashboard-announcement-stats-theme-v936.md` a `about-50-version-summary-v936.md`.
- Verze sjednocena na v.1.5 (936), cache na `v1.5-936`, realtime kanál na `rak-public-live-v936`, package na `1.5.936`.

## v.1.5 (935)
- Dashboard zachovává tmavší odstín, ale panely jsou průhlednější a víc glass bez návratu k flekatým odleskům.
- Oznámení Dashboardu je online-first přes Supabase tabulku `announcements`; lokální úložiště zůstává jen fallback, když online zápis nepustí policy nebo je zařízení offline.
- Administrace ukládá/vypíná oznámení přes nové online helpery a zobrazí jasný stav, jestli proběhl online zápis, nebo jen lokální fallback.
- Přidané dokumenty `dashboard-online-announcement-glass-v935.md` a `about-50-version-summary-v935.md`.
- Verze sjednocena na v.1.5 (935), cache na `v1.5-935`, realtime kanál na `rak-public-live-v935`, package na `1.5.935`.

## v.1.5 (934)
- Dashboard je tmavší, jednotnější a průhlednější ve více iOS glass stylu bez flekatých lokálních odlesků.
- Aktivní ikonky spodního panelu a ikonky na Dashboardu víc přebírají barvu aktivního theme.
- Announcement editor: nadpis je volitelný, přepínače Aktivní / Text má jezdit jsou vedle sebe a ticker už neopakuje zadaný text dvakrát za sebou.
- Přidané dokumenty `dashboard-glass-announcement-polish-v934.md` a `about-50-version-summary-v934.md`.
- Verze sjednocena na v.1.5 (934), cache na `v1.5-934`, realtime kanál na `rak-public-live-v934`, package na `1.5.934`.

## v.1.5 (933)
- Dashboard glass styl je očištěný: méně flekatých lokálních odlesků, víc jednotné průhledné iOS sklo, theme barva hlavně v obrysu/glow.
- Ikonky na Dashboardu jsou bez vlastního pozadí/kapsle.
- Přidaný lokální admin announcement systém: text, platnost od–do, aktivní stav a jezdící ticker nad prvním panelem Dashboardu.
- Přidaný helper `getRakDashboardAnnouncementHealth()` a release gate `v933-dashboard-announcement-system`.
- Přidané dokumenty `dashboard-glass-clean-announcement-v933.md` a `about-50-version-summary-v933.md`.
- Verze sjednocena na v.1.5 (933), cache na `v1.5-933`, realtime kanál na `rak-public-live-v933`, package na `1.5.933`.

## v.1.5 (932)
- Korekce Frézky: přidané přepínače +/− také k naměřeným hodnotám C1/C2 vlevo/vpravo.
- Sjednocené vycentrování a výška všech +/− tlačítek ve frézkách, aby seděla stejně vůči inputům.
- Rozšířený read-only helper `getRakFrezkyCorrectionSignToggleHealth()` a release gate signál `v932-frezky-correction-sign-toggle`.
- Přidané dokumenty `frezky-measured-sign-toggle-v932.md` a `about-50-version-summary-v932.md`.
- Verze sjednocena na v.1.5 (932), cache na `v1.5-932`, realtime kanál na `rak-public-live-v932`, package na `1.5.932`.

## v.1.5 (931)

- Korekce → Frézky: u aktuální korekce `Konicita` a `fhβ` jsou nově přepínací tlačítka `+ / −` stejně jako u korekcí na soustruhách.
- Přepínač mění znaménko přímo v inputu, synchronizuje se i při ručním zápisu mínusu a při zobrazeném výsledku přepočítá výsledek.
- Přidaný read-only helper `getRakFrezkyCorrectionSignToggleHealth()` a release gate signál `v931-frezky-correction-sign-toggle`.
- Přidané dokumenty `frezky-correction-sign-toggle-v931.md` a `about-50-version-summary-v931.md`.
- Verze sjednocena na v.1.5 (931), cache na `v1.5-931`, realtime kanál na `rak-public-live-v931`, package na `1.5.931`.

## v.1.5 (930)

- Rotace: spodní panel se jmény už nepoužívá opožděné přeměřování pozice po otevření stránky; dock drží stabilní CSS rezervu, aby po přepnutí na Rotaci necukal.
- Rotace: dlaždice se jmény vrácené na větší velikost, aby nepůsobily zmenšeně po stabilizační vrstvě z v928.
- Dashboard: glass styl posunut víc do iOS vzhledu – průhlednější panely, silnější saturace/blur a jemnější theme-aware odlesky.
- Dashboard: ikonky v kartách už nemají vlastní barevnou kapsli/pozadí; zůstává samotná ikona bez dalšího panelu kolem.
- Láďův / lightweight režim pořád drží levnější fallback bez těžkého blur efektu.
- Přidané dokumenty `rotace-dock-dashboard-glass-v930.md` a `about-50-version-summary-v930.md`.
- Verze sjednocena na v.1.5 (930), cache na `v1.5-930`, realtime kanál na `rak-public-live-v930`, package na `1.5.930`.

## v.1.5 (929)

- Dashboard panely dostaly průhlednější glass styl: hero karta, dashboard shell i jednotlivé karty používají aktivní theme proměnné, border/glow podle tématu a jemný barevný overlay.
- Láďův / lightweight režim má vlastní levnější variantu bez těžkého blur efektu, aby glass styl nezhoršoval plynulost na slabším mobilu.
- Přidaný read-only helper `getRakDashboardGlassThemeHealth()` a release gate signál pro kontrolu theme-aware dashboard glass vrstvy.
- Přidané dokumenty `dashboard-glass-theme-v929.md` a `about-50-version-summary-v929.md`.
- Verze sjednocena na v.1.5 (929), cache na `v1.5-929`, realtime kanál na `rak-public-live-v929`, package na `1.5.929`.

## v.1.5 (928)

- Rotace: spodní seznam jmen je nově stabilní adaptivní dock podle skutečné výšky spodní navigace, aby po přepnutí na Rotaci necukal a zůstal viditelný na různých mobilech.
- Přidané měření `updateRotaceNamesDockMetrics()` / `scheduleRotaceNamesDockMetrics()` a rozšířený helper `getRakRotaceNamesDockHealth()`.
- Láďův režim dostal tvrdší výkonové odlehčení: méně blur/stínů/animací, pomalejší frame budget pro hry a delší throttling na slabších telefonech.
- Přidané dokumenty `rotace-names-dock-stability-v928.md`, `lada-mode-performance-v928.md` a `about-50-version-summary-v928.md`.
- Bez změn Supabase DB, policies, online Piškvorek, online Lodí, gameplay pravidel, dashboardu, rotací výpočtově a kalkulaček.
- Verze sjednocena na v.1.5 (928), cache na `v1.5-928`, realtime kanál na `rak-public-live-v928`, package na `1.5.928`.

## v.1.5 (927)

- Rozšířené achievementy pro všechny hry včetně D-směnových cílů; každá hra má vlastní odměny navázané na dokončení během aktivní směny D.
- Přidané syté odměnové motivy a pozadí: Hyper Magenta, Acid Cyber, Lava Core, Ultra Violet, Neon Carnival, Lava Neon, Acid Night a Violet Blackout.
- Aktivní téma a pozadí se při přihlášeném profilu ukládají do `account.uiSettings.themeId` a `account.uiSettings.backgroundId`; nový profil už nepřebírá vzhled po předchozím profilu.
- Témata a pozadí se odemykají jako odměny za počet her, achievementy nebo rank.
- Přidané read-only helpery `getRakGamesAchievementRewardHealth()` a `getRakProfileAppearanceRewardHealth()` a release gate signály pro odměnovou vrstvu.
- Doplněné dokumenty `games-achievement-rewards-v927.md`, `profile-appearance-rewards-v927.md`, validační dokumenty v927 a stručný souhrn `about-50-version-summary-v927.md`.
- Bez změn Supabase DB, policies, online Piškvorek, online Lodí a bez přepojení online flow.
- Verze sjednocena na v.1.5 (927), cache na `v1.5-927`, realtime kanál na `rak-public-live-v927`, package na `1.5.927`.

## v.1.5 (925)

- Navazuje na potvrzenou v924 a přidává praktický validační balíček pro ruční mobilní/browser smoke, skutečný Playwright běh a post-release/PWA kontrolu.
- Doplněné dokumenty `manual-validation-runbook-v925.md`, `playwright-real-run-readiness-v925.md`, `post-release-validation-v925.md`, `validation-readiness-closure-v925.md` a stručný souhrn `about-50-version-summary-v925.md`.
- Přidané read-only helpery `getRakManualValidationReadinessHealth()` a `getRakValidationReadinessClosureHealth()`; release gates ukazují připravené podklady jako OK a skutečné testy jako manual.
- Playwright smoke skeleton rozšířený o kontrolu v925 validačních helperů a čitelnosti release gate matrixu.
- Bez změn Supabase DB, policies, online Piškvorek, online Lodí, gameplaye, dashboardu, spodní lišty, rotací a kalkulaček.
- Verze sjednocena na v.1.5 (925), cache na `v1.5-925`, realtime kanál na `rak-public-live-v925`, package na `1.5.925`.

## v.1.5 (924)

- Doplněné finální prompt-compliance dokumenty: architektura, security/performance/stabilita/UX, refaktor/testy/CI/CD, rollout/monitoring/rollback a finální syntéza.
- Přidaný read-only helper `getRakPromptComplianceClosureHealth()` s dokumentačním stavem 100 % a ručními gate pro mobilní validaci a reálný Playwright běh.
- Release gates nově ukazují prompt compliance jako OK pro dokumenty a manual pro mobil/Playwright.
- Export manifest doplněný o nové dokumenty v924 a historii O aplikaci ponechanou ve stručném bloku v.1.5 901–950.
- Bez změn Supabase DB, policies, online Piškvorek, online Lodí, gameplaye, dashboardu, spodní lišty, rotací a kalkulaček.
- Verze sjednocena na v.1.5 (924), cache na `v1.5-924`, realtime kanál na `rak-public-live-v924`, package na `1.5.924`.

## v.1.5 (923)

- Top výsledky ve hrách: Reaction Test už v Top score nezobrazuje milisekundy, ale vteřiny s desetinnou čárkou.
- Přidaný read-only guard `getRakGamesTopScoreSecondsHealth()`.
- Přidaný dokument `assets/docs/games-top-score-seconds-v923.md`.
- Verze sjednocena na v.1.5 (923), cache na `v1.5-923`, realtime kanál na `rak-public-live-v923`, package na `1.5.923`.

## v.1.5 (923)

- Původní velké due diligence zadání uzavřeno na 100 % z hlediska dodaných podkladů.
- Přidaná Playwright/DOM smoke kostra: `playwright.config.js`, `playwright-smoke.spec.js` a skript `npm run test:smoke`.
- Piškvorky proti AI znovu přitvrzené po výhře hráče kolem 13. tahu: přidána vrstva `tttBestThirteenTurnClampMove()`, navýšená raná search depth a delší lock budgety.
- Přidané dokumenty `assets/docs/due-diligence-closure-v923.md`, `assets/docs/playwright-smoke-skeleton-v923.md` a `assets/docs/ttt-ai-hardening-v923.md`.
- Verze sjednocena na v.1.5 (923), cache na `v1.5-923`, realtime kanál na `rak-public-live-v923`, package na `1.5.923`.

## v.1.5 (923)

- Přidaný read-only modul `rak-mobile-smoke-audit.js` pro mobile/performance smoke plán a první Playwright/DOM smoke návrh.
- Přidané helpery `getRakMobilePerformanceSmokePlanHealth()`, `getRakPlaywrightDomSmokeDraftHealth()` a `getRakFinalAuditClosureHealth()`.
- Due diligence progress posunut na cca 96 % hotovo / 4 % zbývá; zbytek je hlavně reálné mobilní měření a skutečné spuštění smoke testů.
- Release gates nově sledují mobile/performance smoke plán, Playwright/DOM smoke návrh a finální closure stav velkého auditu.
- Přidané dokumenty `assets/docs/mobile-performance-smoke-v923.md`, `assets/docs/playwright-dom-smoke-draft-v923.md` a `assets/docs/due-diligence-closure-v923.md`.
- Verze sjednocena na v.1.5 (923), cache na `v1.5-923`, realtime kanál na `rak-public-live-v923`, package na `1.5.923`.

## v.1.5 (923)

- Přidaný finální sjednocený due diligence report `assets/docs/due-diligence-final-report-v923.md`.
- Report spojuje exekutivní shrnutí, architekturu, datové toky, prioritizované nálezy, quick wins, critical risks, refaktor vs rewrite vs strangler, doporučené nástroje, testy, CI/CD snippet, monitoring, rollback a mermaid diagramy.
- Due diligence progress posunutý cca na 91 % hotovo / 9 % zbývá.
- Zbývající největší položky: reálné mobilní měření výkonu a první Playwright/DOM smoke testy.
- Bez změn Supabase DB, policies, online flow, gameplaye a hotových UI částí.

## v.1.5 (923)

- Přidaný read-only výkonový audit `rak-performance-ci-audit.js`: skripty, CSS, DOM povrch, storage footprint a performance warningy.
- Přidaný test/CI strategy helper s minimálním GitHub Actions snippettem a rozlišením blocker/warning test vrstev.
- Due diligence progress posunutý cca na 82 % hotovo / 18 % zbývá.
- Release gates nově sledují výkon + CI/test closure.
- Přidané dokumenty `assets/docs/performance-budget-audit-v923.md`, `assets/docs/test-ci-strategy-v923.md` a `assets/docs/due-diligence-progress-v923.md`.
- Bez změn Supabase DB, policies, online flow a gameplaye.

## v.1.5 (923)

- Přidaný due diligence audit progress tracker podle původního velkého auditního promptu.
- Nové helpery `getRakDueDiligenceAuditProgressHealth()` a `getRakDueDiligenceRemainingWorkReport()`.
- Release gates nově ukazují, kolik procent auditního zadání je hotovo a kolik zbývá.
- Aktuální odhad: cca 72 % hotovo / 28 % zbývá.
- Přidaný dokument `assets/docs/due-diligence-progress-v923.md`.
- Verze sjednocena na v.1.5 (923), cache na `v1.5-923`, realtime kanál na `rak-public-live-v923`, package na `1.5.923`.

## v.1.5 (923)

- Pokračování malého DOM/security hardeningu ve hrách: přidaný read-only guard `getRakGamesOverlayResultDomHardeningHealth()` pro herní modaly, overlaye a výsledkové texty.
- Release gates nově hlídají warning gate `games-overlay-result-dom-hardening`.
- Přidaný dokument `assets/docs/games-overlay-result-dom-hardening-v923.md`.
- Verze sjednocena na v.1.5 (923), cache na `v1.5-923`, realtime kanál na `rak-public-live-v923`, package na `1.5.923`.

## v.1.5 (923)

- Pokračování malého DOM/security hardeningu ve hrách: přidaný read-only guard `getRakGamesActionTextDomHardeningHealth()` pro herní akční texty, tlačítka a toast/stavové popisky.
- Release gates nově hlídají warning gate `games-action-text-dom-hardening`.
- Bez změn Supabase DB/policies, online Piškvorek, Lodí a gameplaye.
- Přidaný dokument `assets/docs/games-action-text-dom-hardening-v923.md`.
- Verze sjednocena na v.1.5 (923), cache na `v1.5-923`, realtime kanál na `rak-public-live-v923`, package na `1.5.923`.

## v.1.5 (923)

- Navazuje na potvrzenou v.1.5 (923) a přidává read-only guard `getRakGamesPostFixScoreFlowHealth()` pro Reaction Test Top score a Denní challenge score bridge.
- Release gates nově hlídají, že opravy z v923 mají diagnostický signál před dalším ZIPem.
- Přidaný dokument `assets/docs/games-post-fix-score-flow-v923.md`.
- Verze sjednocena na v.1.5 (923), cache na `v1.5-923`, realtime kanál na `rak-public-live-v923`, package na `1.5.923`.

## v.1.5 (923)

- Reaction Test: upravený layout, aby Top 5 výsledků nezůstávaly schované pod spodní/neviditelnou vrstvou.
- Denní challenge: výsledek dnešní hry se ukládá do konkrétní hry i do samostatného Top score denní challenge.
- Denní challenge nově zobrazuje vlastní Top score, ne pouze Top score právě vybrané hry.
- Přidané diagnostiky `getRakDailyChallengeScoreBridgeHealth()` a `getRakReactionTopScoreVisibilityHealth()`.
- Přidané dokumenty `assets/docs/daily-challenge-score-bridge-v923.md` a `assets/docs/reaction-top-score-visibility-v923.md`.
- Verze sjednocena na v.1.5 (923), cache na `v1.5-923`, realtime kanál na `rak-public-live-v923`, package na `1.5.923`.

## v.1.5 (923)

- Pokračování malého DOM/security hardeningu ve hrách: Denní challenge normalizuje a escapuje název hry, popis výzvy a nadpis Top score.
- Přidaný guard `getRakGamesDailyChallengeDomHardeningHealth()` a release gate `games-daily-challenge-dom-hardening`.
- Bez změn Supabase DB/policies, online Piškvorek, Lodí a hotových provozních částí.
- Verze sjednocena na v.1.5 (923), cache na `v1.5-923`, realtime kanál na `rak-public-live-v923`, package na `1.5.923`.

## v.1.5 (923)

- Supabase výsledkové tabulky byly vyčištěné: `gomoku_wins = 0`, `game_stats = 0`; `game_accounts` zůstaly zachované.
- Piškvorky Top score nově zobrazuje `Datum a čas` včetně hodiny a minut, ne jen datum.
- Ukládání výhry nad AI do `gomoku_wins` posílá `created_at` z času dokončení výsledku, aby byl čas v Top score spolehlivě dostupný.
- Lokální reset herních výsledků posunut na `GAMES_PROFILE_RESET_VERSION = 912`, marker `games_score_reset_v923` a cutoff `2026-05-26T18:44:00+02:00`.
- „O aplikaci“ je zestručněné do větších souhrnů po cca 50 verzích.
- Přidané dokumenty `assets/docs/games-score-reset-v923.md`, `assets/docs/ttt-top-score-datetime-v923.md` a `assets/docs/about-50-version-summary-v923.md`.
- Verze sjednocena na v.1.5 (923), cache na `v1.5-923`, realtime kanál na `rak-public-live-v923`, package na `1.5.923`.

## v.1.5 (923)

- Otevírací doba: mimořádná nedělní část po rozkliknutí ukazuje jen časy, které se liší od běžné neděle. Stejné časy se už neopakují.
- Top score ve hrách znovu hlídá datum i čas včetně hodiny a minut.
- Pokračování DOM/security hardeningu: přidaný read-only guard `getRakGamesShipsMenuDomHardeningHealth()` pro menu Lodí, pozvánku a uložené vzájemné zápasy bez zásahu do online flow.
- „O aplikaci“: potvrzené pravidlo držet cca po 50 verzích stručný souhrn nejdůležitějších změn.
- Přidané dokumenty `assets/docs/food-overtime-diff-only-v923.md`, `assets/docs/games-top-score-datetime-v923.md`, `assets/docs/games-ships-menu-dom-hardening-v923.md` a `assets/docs/about-version-summary-policy-v923.md`.
- Verze sjednocena na v.1.5 (923), cache na `v1.5-923`, realtime kanál na `rak-public-live-v923`, package na `1.5.923`.

## v.1.5 (910)

- Hry: přidaný malý DOM/security hardening pro arcade HUD a fallback chybové hlášky.
- Arcade `gamesStatLine()` teď normalizuje, zkracuje a escapuje label i hodnotu přímo v `games-arcade.js`.
- Fallback karta `Hra se nenačetla` používá společný bezpečný formatter pro chybovou zprávu.
- Přidaný read-only guard `getRakGamesHudMessageDomHardeningHealth()` a release gate `games-hud-message-dom-hardening`.
- Přidaný dokument `assets/docs/games-hud-message-dom-hardening-v910.md`.
- Verze sjednocena na v.1.5 (910), cache na `v1.5-910`, realtime kanál na `rak-public-live-v910`, package na `1.5.910`.

## v.1.5 (909)

- Hry: přidaný malý DOM/security hardening pro profily, statistiky a achievementy.
- Jména profilů, ID, iniciály, názvy her, ranky, oblíbená hra a texty achievementů se normalizují před složením HTML.
- Číselné hodnoty v profilech a achievementech se převádějí na bezpečné rozsahy.
- Přidaný read-only guard `getRakGamesProfileDomHardeningHealth()` a release gate `games-profile-dom-hardening`.
- Přidaný dokument `assets/docs/games-profile-dom-hardening-v909.md`.
- Verze sjednocena na v.1.5 (909), cache na `v1.5-909`, realtime kanál na `rak-public-live-v909`, package na `1.5.909`.

## v.1.5 (908)

- Navázáno na potvrzenou v.1.5 (907).
- Přidaný první konkrétní DOM/security hardening pro herní Top score v `games-arcade.js`.
- Top score renderer teď normalizuje a escapuje jména hráčů, jednotky, hodnoty a čas přes společný helper.
- Přidaný read-only guard `getRakGamesTopScoreDomHardeningHealth()` a release gate warning pro Top score DOM hardening.
- Online Piškvorky, Lodě, Supabase DB/policies, dashboard a kalkulačky beze změny.
- Přidaný dokument `assets/docs/games-top-score-dom-hardening-v908.md`.
- Verze sjednocena na v.1.5 (908), cache na `v1.5-908`, realtime kanál na `rak-public-live-v908`, package na `1.5.908`.

## v.1.5 (907)

- Kantýna a jídelna byly srovnané podle dodaných fotek běžné a mimořádné provozní doby.
- Dashboard nově správně rozlišuje běžnou neděli a přesčasovou neděli podle seznamu `FOOD_SPECIAL_SUNDAY_DATES`.
- V detailu po rozkliknutí je běžná otevírací doba oddělená od mimořádné nedělní provozní doby a přesčas je jasně označený.
- Jídelna má upravenou sobotu: ranní okno `07:00–09:00` se v sobotu nepoužívá podle vyvěšené provozní doby.
- Přidaný dokument `assets/docs/food-hours-alignment-v907.md`.
- Verze sjednocena na v.1.5 (907), cache na `v1.5-907`, realtime kanál na `rak-public-live-v907`, package na `1.5.907`.

## v.1.5 (906)

- Přidaná read-only vrstva `rak-dom-security-hardening.js` pro nízkorizikové DOM/security hardening návrhy po jednotlivých sink skupinách.
- Přidané diagnostiky `getRakDomSafeHelperPolicy()`, `getRakDomSecurityHardeningPlan()` a `getRakDomSecurityHardeningClosureHealth()`.
- Release gate matice nově sleduje i DOM/security hardening closure jako warning gate.
- Přidané dokumenty `assets/docs/dom-security-hardening-plan-v906.md` a `assets/docs/dom-safe-helper-policy-v906.md`.
- Bez DB změn, bez Supabase policy změn, bez online-flow změn a bez přepisu renderu.
- Verze sjednocena na v.1.5 (906), cache na `v1.5-906`, realtime kanál na `rak-public-live-v906`, package na `1.5.906`.

## v.1.5 (905)
- Navázáno na potvrzenou v.1.5 (904).
- Přidána read-only release gating/checklist vrstva `rak-release-gates.js`, která skládá hotové diagnostiky do statusů `blocker`, `warning`, `manual` a `ok`.
- Nové helpery `getRakReleaseGatePolicy()`, `getRakReleaseGateMatrixHealth()` a `getRakReleaseGateClosureHealth()`; Diagnostika/O aplikaci ukazuje gate count, blockery, warningy, ruční kontroly a připravenost pro ZIP.
- Přidané dokumenty `assets/docs/release-gates-matrix-v905.md` a `assets/docs/release-gates-policy-v905.md`.
- Bez změn Supabase DB, Supabase policies, online flow, dashboardu, kalkulaček, rotací, statistik a Piškvorky AI.
- Verze sjednocena na v.1.5 (905), cache na `v1.5-905`, realtime kanál na `rak-public-live-v905`, package na `1.5.905`.

## v.1.5 (904)
- Navázáno na potvrzenou v.1.5 (903).
- AppSec/privacy baseline uzavřený na 100 %: přidána klasifikace storage klíčů bez čtení hodnot, statická inventura DOM sinků a report-only CSP/SRI plán.
- Přidané diagnostiky `appSecStorageKeys`, `appSecDomSurface` a `appSecCspSriPlan`; AppSec closure nově vrací fázi 100 %.
- Přidané dokumenty `assets/docs/appsec-privacy-completion-v904.md`, `assets/docs/storage-key-classification-v904.md` a `assets/docs/csp-sri-report-only-plan-v904.md`.
- Bez změn Supabase DB, Supabase policies, online flow, dashboardu, kalkulaček, rotací, statistik a Piškvorek AI.
- Verze sjednocena na v.1.5 (904), cache na `v1.5-904`, realtime kanál na `rak-public-live-v904`, package na `1.5.904`.

## v.1.5 (903)
- Piškvorky proti AI: po rychlé výhře hráče kolem 15. tahu přidána early-trap obrana `tttEarlyTrapRiskScore()` / `tttBestEarlyTrapLockMove()`, navýšená raná search depth a širší kandidáti. Online Piškvorky beze změny.
- Přidán read-only AppSec/privacy baseline `rak-appsec-privacy-audit.js` s helpery `getRakAppSecPrivacySurfaceHealth()`, `getRakAppSecPrivacyRiskRegister()` a `getRakAppSecPrivacyClosureHealth()`.
- Diagnostika / O aplikaci ukazuje AppSec/privacy stav, risk register a closure fáze.
- Přidané dokumenty `assets/docs/appsec-privacy-baseline-v903.md` a `assets/docs/ttt-ai-hardening-v903.md`.
- Verze sjednocena na v.1.5 (903), cache na `v1.5-903`, realtime kanál na `rak-public-live-v903`, package na `1.5.903`.

## v.1.5 (902)
- Build navazuje na potvrzenou v901 a přidává read-only release ops vrstvu bez DB změn, bez Supabase policies a bez zásahu do online flow.
- Přidán `rak-release-ops-audit.js` s helpery `getRakReleaseOpsChecklistHealth()`, `getRakMonitoringPlanHealth()`, `getRakRollbackPlaybookHealth()` a `getRakReleaseOpsClosureHealth()`.
- Diagnostika aplikace nově ukazuje release ops checklist, monitoring mapu, rollback playbook a closure stav.
- Release readiness / architektura / runtime health jsou napojené na release ops closure jako pasivní signál.
- Přidané dokumenty `assets/docs/release-ops-checklist-v902.md`, `assets/docs/monitoring-alerting-v902.md` a `assets/docs/rollback-playbook-v902.md`.
- Verze sjednocena na v.1.5 (902), cache na `v1.5-902`, realtime kanál na `rak-public-live-v902`, package na `1.5.902`.

## v.1.5 (901)
- Kantýna/jídelna: neděle bez přesčasu je nově vždy zavřeno; nedělní otevírací doba se bere jen ze seznamu přesčasových nedělí `FOOD_SPECIAL_SUNDAY_DATES`.
- Detail otevírací doby označuje přesčasové neděle textem „přesčas“ / „při přesčasu“ a doplňuje read-only guard `getFoodScheduleSundayGuardHealth()`.
- Online game create/accept/save contract audit uzavřen na 100 % přes `getRakOnlineGameContractClosureHealth()`, stále bez DB změn, bez policies a bez zásahu do online flow.
- Lokální herní reset marker posunut na `GAMES_PROFILE_RESET_VERSION = 901`; Supabase výsledkové tabulky zůstávají vyčištěné z v900.
- Přidané dokumenty `assets/docs/food-sunday-overtime-guard-v901.md`, `assets/docs/online-game-contract-audit-v901.md`, `assets/docs/online-game-contract-closure-v901.md`, `assets/docs/games-score-reset-v901.md`, `assets/docs/stats-occupancy-point-tooltip-v901.md` a `assets/docs/ttt-ai-hardening-v901.md`.
- Verze sjednocena na v.1.5 (901), cache na `v1.5-901`, realtime kanál na `rak-public-live-v901`, package na `1.5.901`.

## v.1.5 (900)
- Supabase vyčištění výsledků: po kontrolním SELECTu byly smazány pouze výsledkové řádky `game_stats` (3) a `gomoku_wins` (7); následná kontrola ukázala `game_stats = 0` a `gomoku_wins = 0`.
- Zachováno: `game_accounts` (10 řádků), `game_invites = 0`, `game_sessions = 0`; profily/účty, rozpisy, stroje, heartbeat, RLS ani policies se neměnily.
- Herní profily a Top score: lokální reset marker posunutý na `GAMES_PROFILE_RESET_VERSION = 900`, marker `games_score_reset_v900` a cutoff `2026-05-26T15:08:00+02:00`, aby i lokální cache na mobilech začínaly od nuly.
- Top tabulky dál zobrazují datum i čas včetně hodiny a minut.
- Read-only audit podle plánu: online game create/accept/save contract audit posunut na 75 %; pořád bez DB schema změn, bez policies a bez zásahu do online flow.
- Přidané dokumenty `assets/docs/games-score-reset-v900.md`, `assets/docs/ttt-ai-hardening-v900.md` a `assets/docs/online-game-contract-audit-v900.md`; historie v O aplikaci rozšířená na blok `v.1.5 851–900`.
- Verze sjednocena na v.1.5 (900), cache na `v1.5-900`, realtime kanál na `rak-public-live-v900`, package na `1.5.900`.

## v.1.5 (899)
- Herní profily a Top score: přidaný nový reset marker `GAMES_PROFILE_RESET_VERSION = 899`; lokální skóre, achievementy, leaderboard cache i staré reset markery se znovu vyčistí, jména a UI nastavení profilů zůstávají.
- Oprava skutečné příčiny návratu starých Top score: vzdálené výsledky se filtrují podle `last_played_at` / času odehrání výsledku, ne podle `updated_at`, protože starý řádek může dostat nové `updated_at` při pozdější synchronizaci.
- Vzdálené Top score / `game_stats`: klientský cutoff posunut na `2026-05-26T14:38:00+02:00`; Supabase DB ani policies se fyzicky nemažou.
- Top tabulky dál zobrazují datum i čas včetně hodiny a minut, nově prioritně podle času odehrání výsledku.
- Piškvorky proti AI: po další výhře hráče navýšen search depth a rozšířen časový rozpočet pressure/reply lockdown vrstev. Online Piškvorky zůstaly beze změny.
- Read-only audit podle plánu: online game create/accept/save contract audit posunut na 55 %; pořád bez DB změn, bez policies a bez zásahu do online flow.
- Přidané dokumenty `assets/docs/games-score-reset-v899.md`, `assets/docs/ttt-ai-hardening-v899.md` a `assets/docs/online-game-contract-audit-v899.md`; historie v O aplikaci rozšířená na blok `v.1.5 851–899`.
- Verze sjednocena na v.1.5 (899), cache na `v1.5-899`, realtime kanál na `rak-public-live-v899`, package na `1.5.899`.

## v.1.5 (897)
- Statistiky → Obsazenost strojů: důvod absence `N` se normalizuje jako `Neschopenka` i v souhrnu důvodů absencí, aby se v koláči/legendě neukazovalo jen holé `N`.
- Herní profily a výsledky: přidaný jednorázový reset `GAMES_PROFILE_RESET_VERSION = 897`; profily si nechají číslo, jméno a UI nastavení, ale hry, achievementy a lokální cache výsledků začínají od 0.
- Vzdálené Top score: starší záznamy `game_stats` se po resetu v klientovi odříznou přes nový cutoff, takže se staré výsledky nevrací z remote leaderboardů ani profilů. Supabase DB ani policies se nemění.
- Top tabulky skóre nově robustně zobrazují datum včetně hodiny a minut i u ISO timestampů ze Supabase.
- Piškvorky proti AI: po výhře hráče ve 33. tahu přidaná reply-lockdown obrana `tttReplyLockdownRisk()` a `tttBestReplyLockdownMove()`, která hodnotí nejhorší odpověď hráče a následnou protiodpověď AI.
- Online Piškvorky, Lodě, Supabase DB/policies, dashboard, spodní lišta, kalkulačky, navigace a hotové online flow zůstaly beze změny.
- Přidané dokumenty `assets/docs/games-score-reset-v897.md` a `assets/docs/ttt-ai-hardening-v897.md`; historie v O aplikaci rozšířená na blok `v.1.5 851–897`.
- Verze sjednocena na v.1.5 (897), cache na `v1.5-897`, realtime kanál na `rak-public-live-v897`, package na `1.5.897`.

## v.1.5 (896)
- Statistiky → Obsazenost strojů: Obsazenost a Důvody absencí zůstávají vedle sebe i na mobilu, aby se graf a koláč zbytečně neskládaly pod sebe a nezabíraly výšku stránky.
- Čárový graf obsazenosti dál používá dynamický rozsah od nejmenší započtené hodnoty po nejvyšší, ne pevný začátek od 0 %.
- Piškvorky proti AI: po výhře hráče ve 29. tahu přidaná line-containment obrana `tttLineVectorScore()` a `tttBestLineContainmentMove()`, která hlídá pěticová/šesticová okna, rozbité linie, pozdější pasti a nejhorší odpověď hráče.
- Online Piškvorky, Lodě, Supabase DB/policies, dashboard, spodní lišta, kalkulačky, navigace a hotové online flow zůstaly beze změny.
- Přidané dokumenty `assets/docs/stats-occupancy-layout-v896.md` a `assets/docs/ttt-ai-hardening-v896.md`; historie v O aplikaci rozšířená na blok `v.1.5 851–896`.
- Verze sjednocena na v.1.5 (896), cache na `v1.5-896`, realtime kanál na `rak-public-live-v896`, package na `1.5.896`.

## v.1.5 (895)
- Statistiky → Obsazenost strojů: čárový graf vývoje a koláč důvodů absencí jsou nově v jednom společném poli, aby nezabíraly dvě oddělené karty.
- Graf obsazenosti už neškáluje od 0 %, ale od nejnižší započtené hodnoty v roce po nejvyšší, takže menší rozdíly v obsazenosti jsou čitelnější.
- Piškvorky proti AI: přidaná tvrdší trap-brake obrana `tttBestHumanTrapBrakeMove()`, která přednostně vyhodnocuje dvoutahové pasti hráče, dvojité výhry, forky, otevřené trojky/dvojky a nejhorší odpověď hráče. Online Piškvorky zůstaly beze změny.
- Verze sjednocena na v.1.5 (895), cache na `v1.5-895`, realtime kanál na `rak-public-live-v895`, package na `1.5.895`.

## v.1.5 (894)
- Zahájen read-only audit kontraktů online her create/accept/save přes helpery `getRakOnlineGameContractAuditHealth()`, `getRakOnlineGameContractSmokeReport()` a `runRakOnlineGameContractSmokeReport()`.
- Audit kontroluje klientské bridge metody, legacy wrappery a lokální smoke evidenci zvlášť pro Piškvorky a Lodě; fallbacky a chybějící smoke jsou jen diagnostické warningy.
- Supabase DB, Supabase policies, online Piškvorky, Lodě, dashboard, spodní lišta, kalkulačky, navigace a render stránek beze změny.
- Přidaný dokument `assets/docs/online-game-contract-audit-v894.md`; historie v O aplikaci rozšířená na stručný blok `v.1.5 851–894`.
- Verze sjednocena na v.1.5 (894), cache na `v1.5-894`, realtime kanál na `rak-public-live-v894`, package na `1.5.894`.

## v.1.5 (893)
- Statistiky → box `Obsazenost strojů` je očištěný od dlouhého textu; vlevo je čárový graf vývoje obsazenosti, vpravo barevný koláč důvodů absencí.
- Absence kód `N` se nově zobrazuje jako `Neschopenka`; každý důvod absence má vlastní výkroj/barvu v koláči i legendě.
- Piškvorky proti AI jsou znovu tvrdší přes novou dvoutahovou bezpečnostní kontrolu `tttBestUltraSafetyMove()`, hlubší search a mírně delší časový limit AI.
- Online Piškvorky, Supabase DB/policies, dashboard, spodní lišta, kalkulačky, navigace a render stránek beze změny.
- Přidané dokumenty `assets/docs/stats-occupancy-charts-v893.md` a `assets/docs/ttt-ai-hardening-v893.md`; historie v O aplikaci zůstává ve stručném bloku `v.1.5 851–893`.
- Verze sjednocena na v.1.5 (893), cache na `v1.5-893`, realtime kanál na `rak-public-live-v893`, package na `1.5.893`.

## v.1.5 (892)
- Supabase client/offline queue audit uzavřený na 100 % přes nový read-only helper `getRakSupabaseQueueClosureHealth()`.
- Closure sjednocuje queue audit, smoke report a ruční guard a výslovně hlídá, že nejsou zapnuté DB změny, Supabase policy změny, automatický flush ani automatické mazání fronty.
- Release readiness, architecture baseline, namespace aliasy a Diagnostika / O aplikaci nově vidí `Supabase queue closure`.
- Přidaný dokument `assets/docs/supabase-client-queue-closure-v892.md`; historie v O aplikaci zůstává ve stručném bloku `v.1.5 851–892`.
- Verze sjednocena na v.1.5 (892), cache na `v1.5-892`, realtime kanál na `rak-public-live-v892`, package na `1.5.892`.
- Hry, online flow, Supabase DB/policies, dashboard, spodní lišta, kalkulačky, navigace a render stránek beze změny.

## v.1.5 (891)
- Piškvorky proti AI znovu přitvrzené: přidaný hlubší bezpečnostní tah proti forkům/dvojitým hrozbám, vyšší search depth ve střední fázi a mírně delší časový limit AI; online Piškvorky beze změny.
- Korekce → přehled: názvy zkrácené na „Soustruhy“ a „Frézky“ bez štítků „ve vývoji“ / „nutno doladit“.
- Statistiky → pod volbu roku přidaný přehled obsazenosti strojů: procento za započtené období, měsíční graf vývoje a koláč důvodů absencí.
- Supabase client/offline queue audit má nový read-only manual guard; automatický flush ani automatické mazání dat zůstává vypnuté.
- Přidané dokumenty `ttt-ai-hardening-v891.md`, `stats-year-occupancy-v891.md`, `corrections-labels-v891.md` a `supabase-client-queue-smoke-guard-v891.md`.
- Verze sjednocena na v.1.5 (891), cache na `v1.5-891`, realtime kanál na `rak-public-live-v891`, package na `1.5.891`.

## v.1.5 (890)
- Zahájen read-only audit Supabase klientské/offline queue vrstvy přes nový `rak-supabase-client-audit.js`.
- Přidané helpery `getRakSupabaseClientQueueAuditHealth()`, `getRakSupabaseQueueSmokeReport()` a `runRakSupabaseQueueSmokeReport()`; audit nic nemaže, nespouští flush fronty, nemění DB ani Supabase policies.
- Diagnostika / O aplikaci nově ukazuje stav `Supabase client/queue` a `Supabase queue smoke`; Release readiness bere výsledek jen jako warning signál.
- Přidaný dokument `assets/docs/supabase-client-queue-audit-v890.md`; historie v O aplikaci zůstává ve stručném bloku `v.1.5 851–890`.
- Verze sjednocena na v.1.5 (890), cache na `v1.5-890`, realtime kanál na `rak-public-live-v890`, package na `1.5.890`.

## v.1.5 (889)
- Storage / localStorage / offline sync audit je uzavřený na 100 % jako read-only diagnostická fáze bez automatického mazání dat.
- Přidaný helper `getRakStorageSyncClosureHealth()` sjednocuje storage audit, smoke report a manual cleanup guard do finální closure kontroly.
- Release/runtime readiness a Diagnostika / O aplikaci nově vidí `Storage/sync closure`; případné cleanup kandidáty dál ukazují jen jako návrh pro ruční kontrolu.
- Přidaný dokument `assets/docs/storage-sync-closure-v889.md`; historie v O aplikaci zůstává ve stručném bloku `v.1.5 851–889`.
- Verze sjednocena na v.1.5 (889), cache na `v1.5-889`, realtime kanál na `rak-public-live-v889`, package na `1.5.889`.
- Hry, online flow, Supabase DB/policies, dashboard, spodní lišta, kalkulačky, navigace a render stránek beze změny.

## v.1.5 (888)
- Storage/localStorage cleanup mapa je nově napojená do samostatného smoke reportu `getRakStorageSyncSmokeReport()` a ručního běhu `runRakStorageSyncSmokeReport()`.
- Přidaný ruční cleanup guard `getRakStorageManualCleanupGuard()` potvrzuje, že automatické mazání localStorage není zapnuté a cleanup kandidáti jsou jen návrh pro ruční kontrolu.
- Diagnostika / O aplikaci nově ukazuje `Storage/sync smoke` a `Storage cleanup guard`; release/runtime readiness bere smoke/guard jen jako warning signál.
- Přidaný dokument `assets/docs/storage-sync-smoke-guard-v888.md`; historie v O aplikaci zůstává ve stručném bloku `v.1.5 851–888`.
- Verze sjednocena na v.1.5 (888), cache na `v1.5-888`, realtime kanál na `rak-public-live-v888`, package na `1.5.888`.
- Hry, online flow, Supabase DB/policies, dashboard, spodní lišta, kalkulačky, navigace a render stránek beze změny.

## v.1.5 (887)
- Storage/localStorage audit nově mapuje kandidáty na ruční stale cleanup bez automatického mazání dat.
- `getRakStorageSyncAuditHealth()` vrací `staleCleanupCandidateCount`, odhad velikosti, bucket/risk/action souhrny a ukázku kandidátů pro ruční kontrolu.
- Diagnostika / O aplikaci u `Storage/sync audit` nově ukazuje počet kandidátů úklidu; jde jen o warning/read-only informaci, ne o mazání.
- Přidaný dokument `assets/docs/storage-sync-cleanup-map-v887.md`; historie v O aplikaci zůstává ve stručném bloku `v.1.5 851–887`.
- Verze sjednocena na v.1.5 (887), cache na `v1.5-887`, realtime kanál na `rak-public-live-v887`, package na `1.5.887`.
- Hry, online flow, Supabase DB/policies, dashboard, spodní lišta, kalkulačky, navigace a render stránek beze změny.

## v.1.5 (886)
- Zahájená nová read-only fáze `Storage / localStorage / offline sync audit` bez mazání nebo přepisování dat.
- Přidaný nový helper `rak-storage-sync-audit.js` a diagnostika `getRakStorageSyncAuditHealth()`, která mapuje localStorage klíče, JSON chyby, velké položky, offline/sync bucket a Supabase queue/cache snapshot.
- Diagnostika / O aplikaci nově ukazuje řádek `Storage/sync audit`; release/runtime readiness bere storage audit jako warning signál, ne jako zásah do funkce.
- Přidaný dokument `assets/docs/storage-sync-audit-v886.md`; historie v O aplikaci zůstává ve stručném bloku `v.1.5 851–886`.
- Verze sjednocena na v.1.5 (886), cache na `v1.5-886`, realtime kanál na `rak-public-live-v886`, package na `1.5.886`.

## v.1.5 (885)
- DOM/action registry audit je uzavřený na 100 % bez přepojování klikání, navigace, renderu, her nebo online flow.
- Release readiness nově čte `getRakDomActionSmokeReport()` a ukazuje DOM/action smoke stav jako warning signál, ne jako zásah do funkčnosti.
- `getRakDomActionRegistryHealth()` vrací `phasePercent: 100`, `phaseClosed: true` a closure metadata pro další bezpečný refactor směr.
- Přidaný helper `getRakDomActionRegistryClosureHealth()` a namespace alias `domActionClosure` jen pro read-only diagnostiku.
- Přidaný dokument `assets/docs/dom-action-registry-closure-v885.md`; historie v O aplikaci zůstává ve stručném bloku `v.1.5 851–885`.
- Verze sjednocena na v.1.5 (885), cache na `v1.5-885`, realtime kanál na `rak-public-live-v885`, package na `1.5.885`.
- Piškvorky AI, herní logika, online flow, Supabase DB/policies, dashboard, spodní lišta a kalkulačky beze změny.

## v.1.5 (884)
- DOM/action registry audit má nově smoke report: `getRakDomActionSmokeReport()` a ruční `runRakDomActionSmokeReport()`.
- Diagnostika / O aplikaci nově ukazuje poslední DOM/action smoke stav: počet akcí, target mapu, issue/warning počty a stav poslední kontroly.
- Namespace read-only mapa má nový alias `domActionSmokeReport`; staré globály zůstávají zachované a žádné klikání, navigace, render, hry ani online flow se nepřepojují.
- Přidaný dokument `assets/docs/dom-action-smoke-report-v884.md`; historie v O aplikaci zůstává ve stručném bloku `v.1.5 851–884`.
- Verze sjednocena na v.1.5 (884), cache na `v1.5-884`, realtime kanál na `rak-public-live-v884`, package na `1.5.884`.

## v.1.5 (883)
- DOM/action registry audit nově mapuje i cílové atributy akcí podle kategorií, hlavně pro kalkulačky, korekce a hry.
- `getRakDomActionRegistryHealth()` vrací `actionTargetMatrix`, `targetAttributeCategorySummary`, `targetCoveragePercent`, počty target warningů/issue a pravidlo pro budoucí bezpečný refactor handlerů.
- Opravená auditní kontrola přepínače znaménka u korekcí vrtáků: správný cílový atribut je `data-target-input`.
- Diagnostika / O aplikaci u DOM/action registry nově ukazuje i pokrytí target mapy a target warningy; historie zůstává v souhrnném bloku `v.1.5 851–883`.
- Přidaný dokument `assets/docs/dom-action-target-attribute-map-v883.md` a exportní manifest ho přibaluje do ZIPu.
- Verze sjednocena na v.1.5 (883), cache na `v1.5-883`, realtime kanál na `rak-public-live-v883`, package na `1.5.883`.
- Hry, Piškvorky AI, navigace, render, online flow, Supabase DB/policies, dashboard, spodní lišta a kalkulačky beze změny.

## v.1.5 (882)
- DOM/action registry audit nově třídí `data-action` prvky do kategorií: navigace, dashboard, externí odkazy, kalkulačky, korekce, hry, rotace/statistiky a nastavení/diagnostika.
- `getRakDomActionRegistryHealth()` vrací `categorySummary`, `actionCategoryCounts`, `categoryCount` a seznam nekategorizovaných akcí jen jako warning.
- Diagnostika / O aplikaci u DOM/action registry nově ukazuje i počet kategorií a souhrnný blok historie zůstává `v.1.5 851–882`.
- Přidaný dokument `assets/docs/dom-action-category-map-v882.md` a exportní manifest ho přibaluje do ZIPu.
- Verze sjednocena na v.1.5 (882), cache na `v1.5-882`, realtime kanál na `rak-public-live-v882`, package na `1.5.882`.
- Hry, navigace, render, online flow, Supabase DB/policies, dashboard, spodní lišta a kalkulačky beze změny.

## v.1.5 (881)
- Zahájena další bezpečná fáze: DOM/action registry audit bez přepojení navigace, renderu, her nebo online flow.
- Přidán `rak-dom-action-audit.js` s helperem `getRakDomActionRegistryHealth()`, který read-only mapuje `data-action`, allowlisty, spodní navigaci a vybrané cílové atributy.
- Diagnostika / O aplikaci nově ukazuje stav DOM/action registry a historie v O aplikaci zůstává shrnutá v bloku `v.1.5 851–881`.
- Exportní manifest, service worker, module readiness, boot audit a ZIP export počítají s novým helperem a dokumentem `assets/docs/dom-action-registry-audit-v881.md`.
- Verze sjednocena na v.1.5 (881), cache na `v1.5-881`, realtime kanál na `rak-public-live-v881`, package na `1.5.881`.

## v.1.5 (880)
- Export smoke report je nově napojený přímo do release readiness kontroly, aby finální release stav viděl i poslední ZIP/preflight výsledek.
- `getRakReleaseReadinessHealth()` hlídá stav `getRakExportSmokeReport()` a varuje jen při skutečně neúspěšné poslední kontrole; stav „zatím neběžel“ není blokace.
- `getRakExportReleaseToolingHealth()` uzavírá export/release tooling fázi na 100 % a vrací `phaseClosed: true`.
- Přidaný dokument `assets/docs/export-release-tooling-closure-v880.md`.
- Verze sjednocena na v.1.5 (880), cache na `v1.5-880`, realtime kanál na `rak-public-live-v880`, package na `1.5.880`.
- Hry, navigace, render, online flow, Supabase DB/policies, dashboard, spodní lišta a kalkulačky beze změny.

## v.1.5 (879)
- Přidaný exportní smoke report pro poslední předexportní/exportní kontrolu: `getRakExportSmokeReport()` a `runRakExportSmokeReport()`.
- `validateRakExportManifestFiles()` nově ukládá poslední preflight výsledek, aby byl vidět v Diagnostice bez dohledávání v konzoli.
- `exportCurrentHtml()` ukládá stav exportu od startu přes preflight až po úspěšné stažení/chybu, včetně počtu kontrolovaných textových a binárních souborů.
- Diagnostika/O aplikaci nově ukazuje řádek „Export smoke report“ se stavem poslední kontroly ZIP exportu.
- Přidaný dokument `assets/docs/export-smoke-report-v879.md`.
- Verze sjednocena na v.1.5 (879), cache na `v1.5-879`, realtime kanál na `rak-public-live-v879`, package na `1.5.879`.
- Hry, navigace, online flow, Supabase DB/policies, dashboard, spodní lišta a kalkulačky beze změny.

## v.1.5 (878)
- Exportní manifest z v877 se nově používá i pro předexportní kontrolu chybějících souborů přes `validateRakExportManifestFiles()`.
- Přidaný `getRakExportManifestDuplicateReport()` a `preflightValidation` signál v `getRakExportSourceInventoryHealth()`.
- `exportCurrentHtml()` nejdřív ověří textové, JS i binární soubory z manifestu a až potom skládá ZIP; chyba se tak objeví dřív a čitelněji.
- Binární assety mají jednoduchou exportní cache, aby se po preflightu nenačítaly zbytečně znovu.
- Přidaný dokument `assets/docs/export-manifest-preflight-v878.md`.
- Verze sjednocena na v.1.5 (878), cache na `v1.5-878`, realtime kanál na `rak-public-live-v878`, package na `1.5.878`.

## v.1.5 (877)
- Oddělený exportní manifest v `export.js`: ZIP export i audit teď používají stejný zdroj pravdy přes `getRakExportManifest()`.
- `getRakExportSourceInventoryHealth()` nově hlídá i manifest split, počet manifest cest a režim `export-manifest-split-v877`.
- „O aplikaci“ má zkrácenou historii po větších blocích cca po 50 verzích: aktuální úsek 851–877 je stručný souhrn místo dlouhého výpisu každé drobné verze.
- Diagnostika/O aplikaci má opravené zalamování dlouhých řádků, aby text nepřetékal mimo vyznačenou buňku na mobilu.
- Přidaný dokument `assets/docs/export-manifest-split-v877.md`.
- Verze sjednocena na v.1.5 (877), cache na `v1.5-877`, realtime kanál na `rak-public-live-v877`, package na `1.5.877`.
- Piškvorky AI, herní logika, online flow, Supabase DB/policies, dashboard, spodní lišta a kalkulačky beze změny.

## v.1.5 (876)
- Zahájená další bezpečná fáze: export/release tooling mapa po uzavření `window.RaK` namespace read-only vrstvy.
- Přidaný helper `rak-export-release-audit.js` a diagnostika `getRakExportReleaseToolingHealth()`.
- `export.js` nově vystavuje read-only inventuru ZIP zdrojů přes `getRakExportSourceInventoryHealth()`.
- Seznam binárních assetů v exportu ZIPu je deduplikovaný přes `Set`, aby se stejné soubory nepřibalovaly zbytečně vícekrát.
- Nový helper je přidaný do `index.html`, `sw.js`, `export.js`, `package.json`, boot auditů a dokumentace.
- Přidaný dokument `assets/docs/export-release-tooling-map-v876.md`.
- Verze sjednocena na v.1.5 (876), cache na `v1.5-876`, realtime kanál na `rak-public-live-v876`, package na `1.5.876`.
- Piškvorky AI, herní logika, online flow, Supabase DB/policies, dashboard, spodní lišta a kalkulačky beze změny.

## v.1.5 (875)
- Uzavřená `window.RaK` namespace read-only fáze na 100 %.
- `getRakNamespaceHealth()` a nová closure kontrola potvrzují uzavřenou mapu, fallback čtení a zachované legacy globály.
- `window.RaK.diagnostics.readWithFallback()` zůstává jen pro auditní čtení; navigace, render, hry a online flow se pořád nepřepojují.
- Přidaný dokument `assets/docs/rak-namespace-phase-closure-v875.md`.
- Verze sjednocena na v.1.5 (875), cache na `v1.5-875`, realtime kanál na `rak-public-live-v875`, package na `1.5.875`.

## v.1.5 (874)
- První malé auditní přepojení přes `window.RaK`: přidaný `window.RaK.diagnostics.readWithFallback(alias, fallbackGlobalName, args)`.
- `app.js`, `ui.js` a `rak-audit-baseline.js` používají nový read-only helper pro diagnostické čtení, ale při chybě dál padají zpět na původní legacy globály.
- Namespace diagnostika nově hlídá fallback čtení a poslední fallback alias.
- Navigace, render, hry, online flow, Supabase DB i policies zůstávají beze změny.
- Přidaný dokument `assets/docs/rak-namespace-audit-read-bridge-v874.md`.
- Verze sjednocena na v.1.5 (874), cache na `v1.5-874`, realtime kanál na `rak-public-live-v874`, package na `1.5.874`.

## v.1.5 (873)

- Uzavřená mapovací část `window.RaK` namespace fáze pro read-only diagnostiku a runtime snapshoty.
- Přidaný helper `getRakNamespaceReadOnlyMapHealth()` a kontrola `window.RaK.diagnostics.validateReadOnlyMap()`.
- Diagnostika / O aplikaci nově ukazuje, jestli je namespace mapa uzavřená a jestli read-only aliasy mají bezpečné fallbacky bez rizika mutace.
- Staré globály zůstávají zdroj pravdy; navigace, render, hry a online flow se pořád nepřepojují.
- Přidaný dokument `assets/docs/rak-namespace-map-closure-v873.md`.
- Verze sjednocena na v.1.5 (873), cache na `v1.5-873`, realtime kanál na `rak-public-live-v873`, package na `1.5.873`.
- Hry, online flow, Supabase DB/policies, dashboard, spodní lišta a kalkulačky beze změny.

## v.1.5 (872)

- Rozšířená read-only diagnostická mapa v `window.RaK.diagnostics.*` bez změny funkčnosti aplikace.
- Přidané aliasy pro storage, skripty, page shell, akce, formuláře, Láďův režim, game engine baseline, statistiky aktuálního roku a klientské Supabase readiness kontroly.
- Přidané `window.RaK.diagnostics.readMany()` a `window.RaK.diagnostics.summary()`; `summary()` aliasy nespouští, jen popisuje mapu.
- Staré globály zůstávají zdroj pravdy; navigace, render, hry a online flow se nepřepojují.
- Piškvorky AI zůstávají beze změny a potvrzené OK z v870/v871.
- Odstraněná duplicitní položka `assets/help/frezky-fhb-help.png` ze seznamu binárních souborů v exportu ZIPu.
- Přidaný dokument `assets/docs/rak-namespace-diagnostic-map-v872.md`.
- Verze sjednocena na v.1.5 (872), cache na `v1.5-872`, realtime kanál na `rak-public-live-v872`, package na `1.5.872`.
- Hry, online flow, Supabase DB/policies, dashboard, spodní lišta a kalkulačky beze změny.

## v.1.5 (871)

- Piškvorky proti AI jsou potvrzené jako OK po build v870; AI hardening se v tomto buildu nemění.
- `window.RaK` namespace bridge dostal read-only runtime aliasy přes `window.RaK.runtime.read(alias)`.
- Přidané aliasy pro nové auditní čtení: `appVersion`, `rotationBuild`, `externalDependencies` a bezpečný `appStateSnapshot`.
- `getRakNamespaceHealth()` nově hlídá i runtime reader a počet runtime aliasů.
- Staré globály zůstávají zdroj pravdy; navigace, render, hry a online flow se nepřepojují.
- Přidaný dokument `assets/docs/rak-namespace-runtime-aliases-v871.md`.
- Verze sjednocena na v.1.5 (871), cache na `v1.5-871`, realtime kanál na `rak-public-live-v871`, package na `1.5.871`.
- Supabase DB/policies, online hry, dashboard, spodní lišta a kalkulačky beze změny.

## v.1.5 (870)

- Piškvorky proti AI jsou přitvrzené: doplněný taktický tlak `tttTacticalPressureScore()`, bezpečnostní lookahead `tttBestLookaheadSafeMove()` a hlubší omezený search přes `tttSearch()`.
- AI lépe hlídá dvojité hrozby, fork situace, otevřené trojky/čtyřky a tahy, které by hráči nechaly okamžitou odpověď.
- Opening book se použije i v úvodu, když hráč začne středem; AI tak nezačíná měkkým náhodným okolním tahem.
- Timeout AI je mírně navýšený jen pro hard/AI režim, aby byl silnější, ale pořád bezpečný pro mobil.
- Přidaný dokument `assets/docs/ttt-ai-hardening-v870.md`.
- Verze sjednocena na v.1.5 (870), cache na `v1.5-870`, realtime kanál na `rak-public-live-v870`, package na `1.5.870`.
- Online Piškvorky, Lodě, Supabase DB/policies, dashboard, spodní lišta a kalkulačky beze změny.

## v.1.5 (869)

- Začaté bezpečné používání `window.RaK.diagnostics.*` pouze pro nové auditní čtení.
- `rak-namespace.js` má nový `window.RaK.diagnostics.read(alias)` a počítá read-only diagnostická čtení.
- `rak-audit-baseline.js`, `app.js` a diagnostika v menu čtou nové auditní helpery přes namespace reader s fallbackem na staré globály.
- Navigace, render stránky, hry, online flow a Supabase zůstávají přes původní legacy globály beze změny.
- Přidaný dokument `assets/docs/rak-namespace-diagnostics-v869.md`.
- Verze sjednocena na v.1.5 (869), cache na `v1.5-869`, realtime kanál na `rak-public-live-v869`, package na `1.5.869`.
- Hry, online flow, Supabase DB/policies, dashboard, spodní lišta a kalkulačky beze změny.

## v.1.5 (868)

- Doplněná mapa `window.RaK` namespace bridge bez změny funkčnosti aplikace.
- `rak-namespace.js` nově vrací `namespaceMap`, `namespacePlan`, `safeNowCount`, `laterCount`, `highRiskCount` a pravidlo dalšího refactoru.
- `getRakNamespaceHealth()` nově kontroluje nejen existenci bridge, ale i úplnost mapy aliasů a zachování starých globálů.
- Diagnostika / O aplikaci u RaK namespace nově umí zobrazit počet mapovaných položek a průběh fáze.
- Přidaný dokument `assets/docs/rak-namespace-map-v868.md`.
- Verze sjednocena na v.1.5 (868), cache na `v1.5-868`, realtime kanál na `rak-public-live-v868`, package na `1.5.868`.
- Hry, online flow, Supabase DB/policies, dashboard, spodní lišta a kalkulačky beze změny.

## v.1.5 (867)

- Zahájená další refactor fáze přes pasivní `window.RaK` namespace bridge bez změny funkčnosti aplikace.
- Přidaný nový soubor `rak-namespace.js`, který jen zrcadlí vybrané existující globální helpery a ponechává staré globály kvůli kompatibilitě.
- Přidaný helper `getRakNamespaceHealth()` a nový řádek „RaK namespace“ v Diagnostice / O aplikaci.
- `module-readiness.js`, `rak-boot-sequence-audit.js`, `rak-audit-baseline.js`, `index.html`, `sw.js`, `export.js` a `package.json` nově počítají s namespace bridge souborem.
- Přidaný dokument `assets/docs/rak-namespace-bridge-v867.md`.
- Verze sjednocena na v.1.5 (867), cache na `v1.5-867`, realtime kanál na `rak-public-live-v867`, package na `1.5.867`.
- Hry, online flow, Supabase DB/policies, dashboard, spodní lišta a kalkulačky beze změny.

## v.1.5 (866)

- Uzavřený architecture / boot baseline audit na 100 % bez změny funkčnosti aplikace.
- `getRakArchitectureBaselineHealth()` nově vrací `architectureBootAuditPercent: 100`, `architectureBootAuditClosed: true` a doporučení pro další fázi: postupné snižování globálního coupling přes `window.RaK` namespace.
- Auditní mode stringy sjednocené na v866, aby diagnostika odpovídala aktuálnímu buildu.
- Přidaný dokument `assets/docs/architecture-boot-baseline-v866.md` s potvrzeným stavem, dalším směrem a rollbackem.
- `export.js` nově přibaluje i dokumentaci v866.
- Verze sjednocena na v.1.5 (866), cache na `v1.5-866`, realtime kanál na `rak-public-live-v866`, package na `1.5.866`.
- Hry, online flow, Supabase DB/policies, dashboard, spodní lišta a kalkulačky beze změny.

## v.1.5 (865)

- Přidaný samostatný boot sequence audit do nového souboru `rak-boot-sequence-audit.js` bez změny funkčnosti aplikace.
- Nový helper `getRakBootSequenceHealth()` hlídá statické pořadí bootstrap souborů i dynamické načítání modulů podle `module-readiness.js`.
- Diagnostika / O aplikaci nově ukazuje řádek „Boot sekvence“ a architecture baseline bere boot audit jako další readiness signál.
- `index.html`, `sw.js`, `export.js`, `package.json`, `ui.js` a `rak-audit-baseline.js` nově počítají s boot audit helperem.
- Přidaný dokument `assets/docs/boot-sequence-audit-v865.md` s dopadem a rollbackem.
- Verze sjednocena na v.1.5 (865), cache na `v1.5-865`, realtime kanál na `rak-public-live-v865`, package na `1.5.865`.
- Hry, online flow, Supabase DB/policies, dashboard, spodní lišta a kalkulačky beze změny.

## v.1.5 (864)

- Oddělená další audit/runtime vrstva do nového souboru `rak-runtime-health.js` bez změny funkčnosti aplikace.
- Přidané helpery `getRakRuntimeGuardHealth()` a `getRakStatsYearScopeHealth()`: diagnostika nově vidí storage/PWA/module readiness a vysvětlí, když jsou v aktuálním roce nahrané budoucí měsíce, které se do statistik započítají až v daném měsíci.
- Statistiky u detailu člověka zobrazí krátkou poznámku, pokud jsou pro aktuální rok nahrané budoucí měsíce mimo aktuálně započtené období.
- `index.html`, `sw.js`, `export.js`, `package.json` a module readiness registry nově počítají s `rak-runtime-health.js`.
- Přidaný dokument `assets/docs/runtime-health-split-v864.md` s dopadem, statistikami a rollbackem.
- Verze sjednocena na v.1.5 (864), cache na `v1.5-864`, realtime kanál na `rak-public-live-v864`, package na `1.5.864`.
- Hry, online flow, Supabase DB/policies, dashboard, spodní lišta a kalkulačky beze změny.

## v.1.5 (863)

- Release readiness a architecture baseline helpery přesunuté z `app.js` do nového `rak-audit-baseline.js` bez změny funkčnosti.
- `index.html`, `sw.js`, `export.js` a `package.json` nově počítají s `rak-audit-baseline.js`.
- Module readiness registry hlídá i nový auditní helper, takže další refaktor má lepší boot kontrolu.
- Přidaný dokument `assets/docs/audit-baseline-split-v863.md` s dopadem a rollbackem.
- Verze sjednocena na v.1.5 (863), cache na `v1.5-863`, realtime kanál na `rak-public-live-v863`, package na `1.5.863`.
- Neměněny hry, Supabase DB/policies, dashboard, spodní lišta ani kalkulačky.

## v.1.5 (862)
- Zahájený malý in-place refactor audit/runtime helperů: module readiness registry je oddělený z `app.js` do nového `module-readiness.js`.
- `index.html`, `sw.js`, `export.js` a `package.json` nově počítají s `module-readiness.js`, takže boot diagnostika, precache, export ZIPu i npm kontrola drží stejný kontrakt.
- Přidaný dokument `assets/docs/module-readiness-split-v862.md` s popisem ověření a rollback-safe dopadu.
- Verze sjednocena na v.1.5 (862), cache na `v1.5-862`, realtime kanál na `rak-public-live-v862`, package na `1.5.862`.
- Hry, online flow, Supabase DB/policies, dashboard, spodní lišta a kalkulačky beze změny.

## v.1.5 (861)

- Přidaný bezpečný module readiness registry: aplikace nově eviduje načtení runtime modulů, pořadí bootu, chyby načtení a orientační dobu bootu.
- Diagnostika / O aplikaci nově ukazuje „Module readiness“ a architektura/boot audit ho bere jako další readiness signál.
- Přidaný dokument `assets/docs/module-readiness-audit-v861.md` s popisem, co registry hlídá a jak se má použít při dalším refactoru.
- Funkčnost her, online flow, Supabase DB, policies, dashboard, spodní lišta i kalkulačky zůstaly beze změny.
- Verze sjednocena na v.1.5 (861), cache na `v1.5-861`, realtime kanál na `rak-public-live-v861`, package na `1.5.861`.

## v.1.5 (860)
- Bezpečný architecture/boot baseline audit bez zásahu do funkční logiky her, DB nebo Supabase policies.
- Přidaný runtime health `getRakArchitectureBaselineHealth()`, který mapuje boot skripty, stylesheety, data-action prvky, duplicitní ID, chybějící globály a refactor backlog.
- Diagnostika v O aplikaci nově ukazuje architektura/boot baseline a coupling signály.
- Přidaný dokument `assets/docs/architecture-boot-audit-v860.md` s boot diagramem, runtime vrstvami, coupling body, prioritami a bezpečným refactor plánem.
- Verze sjednocena na v.1.5 (860), cache na `v1.5-860`, realtime kanál na `rak-public-live-v860`, package na `1.5.860`.

## v.1.5 (859)

- Finální uzavření PWA/release baseline fáze: doplněný checklist pro ZIP strukturu, app ikony, SW precache, CDN fallbacky, rollback a post-release ověření.
- Google Fonts link nově zapisuje `loaded/failed` signál do stejné boot diagnostiky jako XLSX, JSZip a Supabase; výpadek fontu je jen warning, ne blokace aplikace.
- Přidaný dokument `assets/docs/release-readiness-v859.md`; původní v858 dokumentace zůstává zachovaná jako samostatný historický krok.
- Verze sjednocena na v.1.5 (859), cache na `v1.5-859` a realtime kanál na `rak-public-live-v859`.
- Runtime her, online flow, Supabase DB, Supabase policies, dashboard, spodní lišta a kalkulačky beze změny.

## v.1.5 (858)

- Boot/CDN hardening: externí knihovny XLSX, JSZip a Supabase mají v HTML `onload/onerror` signály do `window.__RAK_EXTERNAL_DEP_STATUS__`.
- Release readiness diagnostika ukazuje stav CDN načtení a warning, když appka běží s omezením kvůli nedostupné externí knihovně.
- Přidaný dokument `assets/docs/release-readiness-v858.md` pro boot/CDN kontrolu.
- Verze sjednocena na v.1.5 (858), cache na `v1.5-858` a realtime kanál na `rak-public-live-v858`.
- Runtime her, Supabase DB a Supabase policies beze změny.

## v.1.5 (857)
- Finální release readiness krok po v856: doplněný runtime checklist pro manifest/app ikony/SW/ZIP/CDN a diagnostický řádek v O aplikaci.
- Opravený runtime readiness audit: formát verze už není natvrdo omezený na `v.1.1 (...)`, ale bere obecný formát `v.X.Y (build)`, takže v.1.5 nepadá na falešnou chybu verze.
- Přidaný dokument `assets/docs/release-readiness-v857.md` s release checklistem, rollback postupem a poznámkou k CDN fallbackům.
- Hry, online flow, Supabase DB a Supabase policies beze změny.
- Verze sjednocena na v.1.5 (857), cache na `v1.5-857` a realtime kanál na `rak-public-live-v857`.

## v.1.5 (856)
- Release hygiene po vlastní kontrole buildů: navazujeme na poslední reálně existující artefakt v.1.5 (855), předchozí neexistující v856/v857 se nepočítají jako platné buildy.
- Opravený `CHANGELOG.md`: druhý duplicitní blok `v.1.5 (855)` byl správně vrácen na `v.1.5 (854)`, aby historie odpovídala skutečným artefaktům.
- SQL auditní/migrační soubory byly přesunuté z kořene ZIPu do `assets/docs/sql/`, takže v kořeni zůstávají jen runtime/release soubory a jediná složka je dál `assets/`.
- Export ZIPu nově přibaluje SQL reference z `assets/docs/sql/`; runtime aplikace, online hry, Supabase DB a policies zůstaly beze změny.
- Verze sjednocena na v.1.5 (856), cache na `v1.5-856` a realtime kanál na `rak-public-live-v856`.

## v.1.5 (855)
- ZIP/source inventory audit po PWA assets úpravách: odstraněný prázdný soubor `assets/app-icons/1`, který nebyl runtime asset ani validní ikona.
- `package.json` má sjednocenou verzi `1.5.855`, aby neukazoval starý build.
- Service worker má novou cache `v1.5-855`, realtime kanál je `rak-public-live-v855` a PWA/assets audit mód je posunutý na v855.
- Online hry, Supabase policies, dashboard, spodní lišta a kalkulačky beze změny.

## v.1.5 (854)
- Asset/PWA/SW audit po přesunu app ikon: ověřené nové cesty `assets/app-icons/` v HTML, manifestu, service workeru a exportu bez návratu root ikon do kořene ZIPu.
- Service worker má novou cache `v1.5-854`, realtime kanál je `rak-public-live-v854` a diagnostika PWA nově hlídá app-icons audit/release checklist pro manifest, favicon, SW precache a ZIP export.
- ZIP export a výsledný archiv drží release pravidlo: soubory rovnou v kořeni, jediná složka `assets/`. Online hry, Supabase DB a policies beze změny.

## v.1.5 (853)
- Resetované herní výsledky: Supabase tabulky `game_stats`, `game_sessions`, `game_invites` a legacy `gomoku_wins` byly vyčištěné, herní účty `game_accounts` zůstaly zachované.
- Lokální herní profil má nový reset marker `GAMES_PROFILE_RESET_VERSION = 853`, takže se na mobilech vynulují lokální statistiky, achievementy a staré cache výsledků, ale zůstane přihlášení/profilové nastavení vzhledu.
- Piškvorky mají opravené měření času partie: čas se při první akci jistí přes herní clock a už nespadne na `Date.now() - Date.now()`, které zapisovalo výhru proti AI jako 0 s.
- Staré lokální queue položky herních výsledků před resetem se zahodí, aby po návratu online znovu nenahrály staré skóre. Verze sjednocena na v.1.5 (853), cache na v1.5-853 a Supabase realtime kanál na rak-public-live-v853.

## v.1.5 (852)
- Úklid assetů: všechny app ikony `icon-16/32/180/192/512/1024.png` jsou přesunuté z kořene do `assets/app-icons/`, aby v kořeni ZIPu nezůstávaly obrázky.
- Opravené odkazy na app ikony v `index.html`, `manifest.webmanifest`, `sw.js` a ZIP exportu. Service worker cachuje nové cesty a export už zahrnuje app ikony jen z `assets/app-icons/`.
- Funkce aplikace, hry, Supabase a DB policies beze změny. Verze sjednocena na v.1.5 (852), cache na v1.5-852 a Supabase realtime kanál na rak-public-live-v852.

## v.1.5 (851)
- Lodě: technicky funkční stav z v850 zůstává zachovaný, úprava je zaměřená na vzhled a využití obrazovky.
- Lodě příprava/střelba: herní pole je zvětšené přes maximum dostupné výšky, horní HUD a spodní akce jsou zmenšené/odlehčené a nepřekáží poli.
- Lodě: popisek k poli je nově přímo u herní plochy, bez zbytečných velkých bloků nahoře a dole.
- DB ani Supabase policies se v tomto buildu neměnily.
- Verze sjednocena na v.1.5 (851), cache na v1.5-851 a Supabase realtime kanál na rak-public-live-v851.

## v.1.5 (850)
- Lodě: větší mobil už nemá řezat spodní část automaticky položeného bitevního pole při vytváření flotily; setup pole je kompaktnější a bez vysoké spodní rezervy.
- Lodě online: po připojení přes zvací odkaz se při aktivní hře automaticky přepne na soupeřovo pole, refresh session víc hlídá změnu soupeře/stavu/tahu a při blokované střelbě se spustí rychlé obnovení stavu.
- Spodní ikonky zůstaly beze změny, protože byly potvrzené OK.
- DB/Supabase beze změny, policies se neměnily.
- Verze sjednocena na v.1.5 (850), cache na v1.5-850 a Supabase realtime kanál na rak-public-live-v850.

## v.1.5 (849)
- Lodě online: zvací odkaz `#games=ships&invite=1234` přepíná stránku na Hry a otevírá přímo shell Lodí, takže už nezůstane jen na hlavní RaK stránce.
- Lodě online: přidaná bootstrap pojistka pro případ, kdy se odkaz načte dřív než modul Lodí; po načtení modulu se pozvánka z URL znovu zpracuje.
- Lodě příprava flotily: hrací pole je v setupu o něco menší a layout má větší bezpečnou rezervu nad spodní lištou, aby nebyl schovaný spodní řádek pole.
- Spodní navigace: neaktivní ikonky jsou vrácené doleva o polovinu posledního posunu doprava; aktivní položka zůstává beze změny.
- DB ani Supabase policies se v tomto buildu neměnily.
- Verze sjednocena na v.1.5 (849), cache na v1.5-849 a Supabase realtime kanál na rak-public-live-v849.

## v.1.5 (848)
- Spodní navigace: neaktivní ikonky jsou posunuté přesněji doprava, aby seděly na střed vůči svému popisku.
- Aktivní položka spodní navigace zůstává beze změny, protože její zarovnání bylo v pořádku.
- Láďův režim, normální glass režim, DB a Supabase policies se v tomto buildu neměnily.
- Verze sjednocena na v.1.5 (848), cache na v1.5-848 a Supabase realtime kanál na rak-public-live-v848.

## v.1.5 (847)
- Láďův režim: spodní panel / bottom lišta je nově neprůhledná jen při zapnutém Láďově režimu, aby přes ni neprosvítal obsah.
- Normální režim spodní lišty zůstává beze změny.
- DB ani Supabase policies se v tomto buildu neměnily.
- Verze sjednocena na v.1.5 (847), cache na v1.5-847 a Supabase realtime kanál na rak-public-live-v847.

## v.1.5 (845)
- Lodě online: zvací odkaz `#games=ships&invite=1234` má v routeru přednost před obecnou invite logikou Piškvorek, takže otevření odkazu Lodí už nespouští Piškvorky.
- Lodě příprava flotily: hrací plocha je menší a layout je znovu srovnaný do pořadí potvrzení/menu, HUD, pole, spodní akce; spodní panel už nemá překrývat ani řezat spodní část pole.
- Lodě setup: odstraněné další zbytky fixního/panelového chování u spodních akcí, aby nevznikala neviditelná stěna nad spodní lištou.
- DB ani Supabase policies se v tomto buildu neměnily.
- Verze sjednocena na v.1.5 (845), cache na v1.5-845 a Supabase realtime kanál na rak-public-live-v845.

## v.1.5 (844)
- Piškvorky online: vzájemné skóre a online tabulka se po dohrané partii a po návratu do Online režimu obnovují hned, bez nutnosti ručně přepínat mimo Online a zpět.
- Lodě online: zvací overlay je sjednocený s Piškvorkami, obsahuje výrazný kód, skutečný zvací odkaz, Kopírovat odkaz a Sdílet. Link používá #games=ships&invite=1234.
- Lodě online: při přípravě/střelbě je vypnuté zbytečné scrollování, kód je odstraněný z horního HUDu a host při čekání na soupeře polluje session i v přípravě, takže overlay po připojení soupeře zmizí.
- DB a Supabase policies beze změny.
- Verze sjednocena na v.1.5 (844), cache na v1.5-844 a Supabase realtime kanál na rak-public-live-v844.

## v.1.5 (843)
- Supabase heartbeat v Diagnostice převádí čas posledního OK do českého lokálního času `Europe/Prague`, aby neukazoval matoucí UTC hodnotu.
- Lodě online mají zvací tabulku sjednocenou vzhledově s Piškvorkami: výrazný overlay přes hrací pole, 4místný kód, Kopírovat kód a Sdílet.
- Zvací overlay Lodí už není běžný blok v layoutu, takže nezabírá výšku mezi hrací plochou a spodními tlačítky.
- Příprava flotily v Lodích má finální CSS pojistku proti neviditelnému prostoru pod hracím polem; spodní ovládání je v normálním toku těsně pod polem.
- DB ani Supabase policies se v tomto buildu neměnily; online invite/session hardening zůstává v audit/RPC režimu.
- Verze sjednocena na v.1.5 (843), cache na v1.5-843 a Supabase realtime kanál na rak-public-live-v843.

## v.1.5 (842)
- O aplikaci už nezobrazuje samostatnou kartu Supabase heartbeat; stav zůstává jen v Diagnostice, aby se stejná informace neduplikovala.
- Z Diagnostiky byl odstraněný vysvětlovací popisek o přesunu heartbeat testu; zůstává přímo karta s tlačítkem, protože to je samo o sobě jasné.
- Piškvorky online opravují živé vzájemné skóre: opravené načítání head-to-head podle game_type a po dohrané online partii se skóre lokálně navýší hned, ne až po pozdějším reloadu tabulky.
- Lodě online dostaly výrazný banner s kódem pozvánky, tlačítkem Kopírovat kód a Sdílet, aby založení hry působilo podobně jako u Piškvorek.
- Příprava flotily v Lodích je kompaktnější: odstraněné zbytečné spodní místo, ovládací tlačítka jsou výš a layout lépe drží na větším mobilu bez nutnosti scrollovat.
- Logika připravenosti Lodí nově po každém potvrzení flotily přepočítá stav waiting/placing/active a po uložení provede krátký refresh session, aby se hra po potvrzení obou flotil spustila spolehlivěji.
- DB ani Supabase policies se v tomto buildu neměnily; online invite/session vrstva zůstává na bezpečné audit/RPC cestě z předchozích buildů.
- Verze sjednocena na v.1.5 (842), cache na v1.5-842 a Supabase realtime kanál na rak-public-live-v842.

## v.1.5 (841)
- Online pozvánky/session už se v diagnostice neberou jako čistě piškvorková vrstva, ale jako společná vrstva online her.
- Supabase RPC smoke pro `game_invites/game_sessions` nově rozlišuje herní typ zvlášť pro Piškvorky (`gomoku`) a Lodě (`battleship`).
- Readiness před dalším utažením policies nově vyžaduje `create/accept/save` bez fallbacku pro Piškvorky i Lodě, ne jen obecný součet.
- Diagnostika ukazuje samostatné pokrytí „Piškvorky c/a/s“ a „Lodě c/a/s“ a vypisuje konkrétní chybějící kroky.
- DB ani Supabase policies se v tomto buildu neměnily; změna je klientská diagnostika/audit a bezpečnější plánování dalšího hardeningu.
- Verze sjednocena na v.1.5 (841), cache na v1.5-841 a Supabase realtime kanál na rak-public-live-v841.

## v.1.5 (840)
- UI úklid Supabase heartbeatu: stručný heartbeat popisek byl odstraněný z Nastavení aplikace, protože stejný stav je dostupný v Diagnostice.
- Tlačítko `Otestovat heartbeat teď` bylo přesunuté z O aplikaci přímo do Diagnostiky, aby bylo u technických kontrol a neduplikovalo běžný přehled aplikace.
- O aplikaci dál ukazuje kartu Supabase heartbeat jen jako přehled stavu bez ručního testovacího tlačítka.
- Diagnostika se nově zobrazuje jako čitelná karta v menu s heartbeat testem nahoře a kompletním diagnostickým výpisem pod ní.
- DB ani Supabase policies se v tomto buildu neměnily; online pozvánky/session vrstva zůstává ve stavu v839.
- Verze sjednocena na v.1.5 (840), cache na v1.5-840 a Supabase realtime kanál na rak-public-live-v840.
- Aktuální fáze: UI cleanup heartbeatu hotovo. Následuje ověřit na mobilu, že Diagnostika ukáže tlačítko testu a že O aplikaci už ho nemá.

## v.1.5 (839)
- Přidaná bezpečná RPC cesta `rak_accept_game_invite` pro přijetí online pozvánky a napojení hráče do `game_sessions` včetně `board_state`, role hráče a aktivního stavu hry.
- Klient při přijetí pozvánky nejdřív zkusí RPC `rak_accept_game_invite`; přímý update `game_invites/game_sessions` zůstává jen jako kompatibilní fallback, aby se znovu nerozbily online Piškvorky.
- Supabase session/pozvánky RPC smoke nově sleduje pokrytí kroků `create / accept / save`, počítá fallbacky podle typu a readiness nepustí dál, dokud nejsou všechny tři kroky ověřené bez fallbacku.
- Diagnostika v O aplikaci ukazuje `Supabase session RPC pokrytí: create · accept · save` a jasně vypíše, který krok ještě chybí.
- DB migrace přidala/finálně ponechala kanonickou tříparametrovou funkci `rak_accept_game_invite(text, text, jsonb)`; starý mezikrok dvouparametrové signatury byl odstraněný.
- `game_invites` a `game_sessions` policies se v tomto buildu neutahovaly; Piškvorky link/kód zůstávají na ověřené funkční cestě.
- Verze sjednocena na v.1.5 (841), cache na v1.5-841 a Supabase realtime kanál na rak-public-live-v841.
- Aktuální fáze: Supabase invite/session RPC smoke příprava hotovo. Následuje reálný dvoumobilový smoke test create/accept/save a kontrola, že fallbacky zůstávají 0.

## v.1.5 (837)
- Opravený Supabase heartbeat po reálném testu v.1.5 (836): když appka ještě nemá žádný úspěšný heartbeat a v lokální diagnostice zůstala stará RLS chyba, už se nečeká 12 hodin na interval, ale zápis se zkusí znovu přes RPC.
- RPC funkce `rak_app_keepalive` zůstává bezpečná cesta klienta a tabulka `app_keepalive` má vlastní úzké RLS/grant pravidlo jen pro heartbeat zápisy.
- Diagnostika heartbeatu nově ukazuje i cestu zápisu a typ výsledku/chyby, aby bylo hned vidět, jestli appka opravdu používá RPC cestu.
- Přidaný SQL soubor `supabase_keepalive_rpc_v837.sql`; `game_invites`, `game_sessions` ani online Piškvorky policies se neměnily.
- Verze sjednocena na v.1.5 (837), cache na v1.5-837 a Supabase realtime kanál na rak-public-live-v837.

## v.1.5 (836)
- Opravený první pokus Supabase heartbeatu přes RPC: místo přímého `upsert` do tabulky `app_keepalive` se začala používat funkce `rak_app_keepalive`, protože přímý zápis blokovala RLS policy hláškou `new row violates row-level security policy`.
- Přidaný SQL soubor `supabase_keepalive_rpc_v836.sql`; v dalším buildu v837 byl nahrazen bezpečnější aktuální migrací `supabase_keepalive_rpc_v837.sql`.
- `game_invites`, `game_sessions` ani online Piškvorky policies se neměnily; Piškvorky přes link i ruční kód jsou označené jako potvrzené OK.
- Verze sjednocena na v.1.5 (836), cache na v1.5-836 a Supabase realtime kanál na rak-public-live-v836.

## v.1.5 (835)
- Supabase heartbeat je nově vidět přímo v O aplikaci v samostatné kartě, ne jen hluboko v dlouhé diagnostice.
- Do Nastavení aplikace přibyl stručný řádek `Supabase heartbeat`, aby šlo hned poznat stav OK / nedostupná / možná paused.
- Diagnostika teď dává heartbeat hned nahoru mezi první řádky, takže se neztratí za dlouhým výpisem Supabase struktury.
- Přidané tlačítko `Otestovat heartbeat teď`, které spustí bezpečný ruční ping přes stejnou `app_keepalive` tabulku.
- Piškvorky přes link i ruční kód jsou po Martinově testu brané jako ověřené OK; žádné policies pro `game_invites/game_sessions` se v tomto buildu neměnily.
- Verze sjednocena na v.1.5 (835), cache na v1.5-835 a Supabase realtime kanál na rak-public-live-v835.

## v.1.5 (834)
- Přidaný bezpečný Supabase heartbeat přes samostatnou tabulku `app_keepalive`, mimo herní data a bez zásahu do policies online Piškvorek.
- Heartbeat se plánuje po startu aplikace, po návratu online/viditelnosti/focusu, ale vzdálený ping se na jednom zařízení spustí maximálně 1× za 12 hodin.
- Heartbeat je best-effort: neblokuje start, při offline/stalled/paused Supabase jen zapíše stav do lokální diagnostiky a aplikace dál funguje z cache/offline.
- Diagnostika v O aplikaci ukazuje Supabase stav OK / nedostupná / možná paused, poslední úspěšný heartbeat, poslední chybu, počet pokusů a interval.
- Přidaný SQL soubor `supabase_keepalive_v834.sql`; migrace vytváří tabulku app_keepalive s RLS jen pro anon/auth INSERT/UPDATE.
- Verze sjednocena na v.1.5 (834), cache na v1.5-834 a Supabase realtime kanál na rak-public-live-v834.

## v.1.5 (833)
- Online Piškvorky mají čitelnější move guard: když tah nejde udělat kvůli čekání na soupeře, chybějící roli nebo tomu, že není tah aktuálního hráče, appka už jen tiše neignoruje kliknutí, ale ukáže důvod.
- Při blokovaném online tahu se do lokální diagnostiky zapíše důvod, role, aktuální tah, session/pozvánka a flow link/manual; Diagnostika v O aplikaci nově ukazuje počet blokovaných tahů.
- Move guard při podezřelém stavu automaticky spustí rychlý resync online session, aby se link/deep-link stav mohl sám dorovnat bez obcházení pravidel tahu.
- Pravidla tahu zůstávají zachovaná: bez platné role X/O nebo mimo vlastní tah se pořád nedá hrát, takže nevzniká možnost hrát za oba hráče.
- Ruční kód, zvací link i společná `tttJoinInviteSession()` cesta zůstávají zachované; Supabase `game_invites/game_sessions` policies se dál neutahují, dokud nebude potvrzený dvoumobilový test.
- Verze sjednocena na v.1.5 (833), cache na v1.5-833 a Supabase realtime kanál na rak-public-live-v833.
- Aktuální fáze: online TTT move guard diagnostika hotovo. Následuje dvoumobilový smoke test link/kód a až potom návrat k opatrnému Supabase hardeningu.

## v.1.5 (832)
- Online Piškvorky mají odolnější vstup přes zvací odkaz: kód pozvánky se nově čte nejen z `#games=ttt&invite=1234`, ale i z query tvarů jako `?invite=1234`, `?code=1234`, `?tttInvite=1234` nebo `?ttt=1234`.
- Po úspěšném přijetí pozvánky se invite parametry uklidí z URL, aby se stejná pozvánka po návratu do aplikace zbytečně nespouštěla znovu.
- Deep-link diagnostika rozlišuje zdroj `hash` / `query`, propisuje ho do společného `tttJoinInviteSession()` flow a move guard už ukládá chybu pod skutečným flow link/manual.
- Přidaná `popstate` kontrola pro případy, kdy PWA nebo prohlížeč změní adresu existující aplikace bez klasického reloadu.
- Supabase `game_invites/game_sessions` policies se dál neutahují, dokud nebude potvrzený reálný dvoumobilový test přes link i ruční kód.
- Verze sjednocena na v.1.5 (832), cache na v1.5-832 a Supabase realtime kanál na rak-public-live-v832.
- Aktuální fáze: online TTT deep-link resilience hotovo. Následuje dvoumobilový smoke test link/kód a až potom návrat k opatrnému Supabase hardeningu.

## v.1.5 (831)
- Online Piškvorky mají runtime pojistku role podle session/účtu: když vzdálená session jasně ukáže, že aktuální profil patří hráči X nebo O, lokální klient si roli bezpečně opraví.
- Tah v online režimu už nejde udělat bez platné lokální role X/O, takže se neotevírá cesta hrát omylem za oba hráče; zároveň se tím líp odhalí špatný link/deep-link stav.
- Diagnostika v O aplikaci nově ukazuje počet automatických oprav role, aby šlo po dvoumobilovém testu poznat, jestli link potřeboval runtime opravu nebo prošel čistě.
- Ruční zadání kódu a společná `tttJoinInviteSession()` cesta zůstávají zachované; Supabase `game_invites/game_sessions` policies se dál neutahují, dokud nebude potvrzený reálný test přes link i kód.
- Verze sjednocena na v.1.5 (831), cache na v1.5-831 a Supabase realtime kanál na rak-public-live-v831.
- Aktuální fáze: online TTT runtime role guard hotovo. Následuje dvoumobilový smoke test link/kód a až potom návrat k opatrnému Supabase hardeningu.

## v.1.5 (830)
- Bez zásahu do Supabase policies doplněná klientská diagnostika online Piškvorek pro vstup přes zvací odkaz i ruční 4místný kód.
- Join flow si nově lokálně ukládá poslední pokus/úspěch/chybu, rozlišuje `link` vs `manual`, zapisuje režim `pvp`, roli hráče, aktuální tah, session/pozvánku a informaci, jestli klient může právě hrát.
- Diagnostika v O aplikaci nově ukazuje „Piškvorky online join“ a „Piškvorky online stav“, aby šlo po dvoumobilovém testu rychle poznat, jestli druhý mobil skončil jako hráč O a ne jako spectator/AI flow.
- Link i ruční kód dál používají společnou `tttJoinInviteSession()` cestu; výsledná hláška se po přijetí drží podle skutečné role a tahu, ne podle obecného textu.
- Supabase `game_invites/game_sessions` hardening zůstává pozastavený, dokud nebude potvrzený reálný test přes odkaz i kód.
- Verze sjednocena na v.1.5 (830), cache na v1.5-830 a Supabase realtime kanál na rak-public-live-v830.
- Aktuální fáze: online TTT testovatelnost/diagnostika hotovo. Následuje dvoumobilový smoke test a teprve po potvrzení návrat k opatrnému Supabase hardeningu.

## v.1.5 (829)
- Hotfix online Piškvorek přes zvací odkaz: vstup z linku nově nastaví stejný `pvp`/join stav jako ruční zadání 4místného kódu.
- Opravená kořenová příčina: link sice načetl session a realtime desku, ale lokální klient mohl zůstat v režimu AI/start flow, takže druhý hráč po prvním tahu X nemohl položit O.
- `tttJoinInviteSession()` teď před přijetím pozvánky sjednotí lokální stav na online režim, nastaví invite URL/code a po načtení session zobrazí stav podle skutečného tahu hráče O.
- Ruční zadání kódu zůstává na stejné cestě a Supabase policies pro `game_invites/game_sessions` se znovu neutahovaly.
- Verze sjednocena na v.1.5 (829), cache na v1.5-829 a Supabase realtime kanál na rak-public-live-v829.
- Aktuální fáze: online TTT link hotfix hotovo. Následuje dvoumobilový smoke test: vytvořit pozvánku, otevřít odkaz na druhém mobilu, odehrát tah O a ověřit zápis výsledku/Top 5/profil.

## v.1.5 (828)
- Hotfix online Piškvorek: v DB byly odstraněné restriktivní policies `game_invites_insert_rpc_only_v826`, `game_invites_update_rpc_only_v826`, `game_sessions_insert_rpc_only_v826` a `game_sessions_update_rpc_only_v826`, protože po nich online hra přestala fungovat.
- Přímé INSERT/UPDATE pro `game_invites` a `game_sessions` jsou dočasně obnovené kvůli kompatibilitě online pozvánek/session; veřejné DELETE policies zůstávají odstraněné.
- `game_stats` hardening z v824 zůstává zachovaný, protože běžné score má RPC cestu.
- Bug reports hardening se pozastavuje, dokud se neověří online Piškvorky na dvou mobilech.
- Přidaný kontrolní SQL soubor `supabase_rpc_hardening_v828.sql` s ověřením rollbacku restriktivních online policies.
- Verze sjednocena na v.1.5 (828), cache na v1.5-828 a Supabase realtime kanál na rak-public-live-v828.
- Aktuální fáze: online TTT rollback hotfix hotovo. Následuje ruční dvoumobilový smoke test online Piškvorek; teprve potom pokračovat v Supabase hardeningu.

## v.1.5 (826)
- Fáze 2E-J Supabase hardening: přímé veřejné INSERT/UPDATE cesty u `game_invites` a `game_sessions` jsou nově omezené restriktivními policies `*_rpc_only_v826`.
- Změna je nedestruktivní: data se nemažou, public SELECT zůstává kvůli realtime/čtení a online zápisy mají jít přes RPC `rak_create_game_invite_session` a `rak_save_game_session_by_invite_code`.
- Opraveno klientské volání RPC `rak_save_game_ui_settings`, které mohlo kvůli špatně předaným parametrům padat do fallbacku.
- Přidaný kontrolní SQL soubor `supabase_rpc_hardening_v826.sql` s ověřením restriktivních policies a rollback poznámkou.
- Verze sjednocena na v.1.5 (826), cache na v1.5-826 a Supabase realtime kanál na rak-public-live-v826.
- Aktuální fáze: 2E-J hotovo. Následuje 2E-K – po mobilním ověření online Piškvorek/pozvánek řešit bug_reports SELECT/UPDATE a následně rotation_state/machine_settings write cesty.

## v.1.5 (825)
- Fáze 2E-I Supabase hardening: přidané RPC scaffold cesty pro `game_invites` a `game_sessions`.
- Appka nově u vytvoření online pozvánky a ukládání online session zkouší RPC-first cestu a až při selhání ponechává původní přímý fallback.
- Přidané perzistentní smoke metriky pro online session/pozvánky, aby bylo vidět, jestli RPC opravdu funguje bez fallbacků.
- Přímé INSERT/UPDATE policies u `game_sessions` a `game_invites` zatím zůstávají zapnuté kvůli kompatibilitě online her.
- Přidaný kontrolní SQL soubor `supabase_rpc_hardening_v825.sql`.
- Verze sjednocena na v.1.5 (825), cache na v1.5-825 a Supabase realtime kanál na rak-public-live-v825.
- Aktuální fáze: 2E-I hotovo. Následuje 2E-J – po mobilním ověření online Piškvorek/pozvánek bez fallbacků začít opatrně omezovat přímé INSERT/UPDATE u `game_sessions` a `game_invites`.

## v.1.5 (824)
- Fáze 2E-H Supabase hardening: přímé veřejné INSERT/UPDATE cesty u `game_stats` jsou nově omezené restriktivními policies `game_stats_insert_rpc_only_v824` a `game_stats_update_rpc_only_v824`.
- Změna je nedestruktivní: data se nemažou, public SELECT zůstává kvůli Top 5/profilům a zápisy mají jít přes RPC `rak_record_game_stat_delta` a `rak_save_game_ui_settings`.
- Šlo se bez `DROP POLICY`, protože ten krok nástroj dřív blokoval; staré permisivní policies fyzicky zůstávají, ale restriktivní policies blokují přímý public write.
- Přidaný kontrolní SQL soubor `supabase_rpc_hardening_v824.sql`, který ověřuje RPC funkce, restriktivní policies a obsahuje rollback poznámku.
- Verze sjednocena na v.1.5 (824), cache na v1.5-824 a Supabase realtime kanál na rak-public-live-v824.
- Aktuální fáze: 2E-H hotovo. Následuje 2E-I – po mobilním ověření bez fallbacků připravit podobné RPC/omezení pro `game_sessions` a `game_invites`.

## v.1.5 (814)
- Fáze 2E-C Supabase hardening: herní RPC smoke metriky pro `game_stats` jsou nově perzistentní v zařízení, takže po mobilním hraní zůstane vidět počet RPC pokusů, úspěchů a fallbacků i po návratu do diagnostiky.
- Přímé `INSERT/UPDATE` policies u `game_stats` zatím zůstávají zapnuté. Bez reálného mobilního ověření by jejich zúžení bylo zbytečně rizikové pro hry, Top 5 a profily.
- Přidaný kontrolní SQL soubor `supabase_rpc_hardening_v814.sql`, který ověřuje existenci tří RPC funkcí a že veřejné DELETE policies u herních tabulek zůstávají odstraněné.
- Verze sjednocena na v.1.5 (814), cache na v1.5-814 a Supabase realtime kanál na rak-public-live-v814.
- Aktuální fáze: 2E-C připravená k mobilnímu ověření. Následuje 2E-D – po potvrzení RPC zápisů bez fallbacků začít bezpečně zužovat přímé INSERT/UPDATE policies u `game_stats`.

## v.1.5 (813)
- Opravený přehled otevírací doby jídelny pro nedělní přesčas: pokud je aktuální týden v seznamu mimořádných nedělních nočních směn, neděle v modalu/přehledu ukazuje i 21:30–23:30.
- Kořenová příčina: stav otevřeno/zavřeno používal speciální nedělní override, ale přehled otevírací doby skládal řádky jen ze statického týdenního rozpisu `location.days`, takže u jídelny chybělo přesčasové okno.
- Kantýna beze změny, protože její nedělní přehled už večerní okno obsahoval.
- Verze sjednocena na v.1.5 (813), cache na v1.5-813 a Supabase realtime kanál na rak-public-live-v813.
- Aktuální fáze: 2E-B/2E-C pozastavená kvůli funkční opravě otevírací doby. Následuje návrat na 2E-C – po mobilním ověření zužovat přímé INSERT/UPDATE policies u `game_stats`.

## v.1.5 (812)
- Fáze 2E-B Supabase hardening: game_stats RPC cesta má runtime smoke metriky pro pokusy, úspěšné zápisy a fallbacky.
- Přímé INSERT/UPDATE fallbacky zůstávají zapnuté kvůli kompatibilitě, dokud nebude na mobilu potvrzené, že herní zápisy přes RPC fungují.
- Spodní panel: aktivní glass bublina kolem záložky je o trochu nižší a širší, bez změny velikosti nebo polohy panelu.
- Přidaný aktuální SQL kontrolní soubor `supabase_rpc_hardening_v812.sql` pro ověření RPC funkcí a odstraněných DELETE policies.
- Verze sjednocena na v.1.5 (812), cache na v1.5-812 a Supabase realtime kanál na rak-public-live-v812.
- Aktuální fáze: 2E-B hotová po stránce klienta. Následuje 2E-C – po mobilním ověření začít zužovat přímé INSERT/UPDATE policies u `game_stats`.

## v.1.5 (811)
- Fáze 2E-A Supabase hardening: do DB byla přidaná a ověřená RPC funkce `rak_record_game_stat_delta` pro bezpečnější přírůstkové zápisy skóre do `game_stats`.
- Aplikace u běžných herních statistik nově zkouší RPC cestu jako první a přímý `INSERT/UPDATE` fallback nechává jen kvůli kompatibilitě, dokud neproběhne mobilní smoke test.
- Spodní panel: aktivní glass bublina je o něco nižší a širší, aby líp seděla kolem aktivní záložky.
- Verze sjednocena na v.1.5 (811), cache na v1.5-811 a Supabase realtime kanál na rak-public-live-v811.
- Aktuální fáze: 2E-A hotovo. Následuje 2E-B – ověřit zápisy her přes RPC na mobilu a potom teprve zužovat přímé INSERT/UPDATE policies.

## v.1.5 (810)
- Fáze 2D Supabase hardening: v databázi byly odstraněné veřejné DELETE policies u `game_stats`, `game_sessions` a `game_invites`.
- Změna je nedestruktivní: žádná data se nemažou a veřejné SELECT/INSERT/UPDATE policies zatím zůstávají kvůli kompatibilitě online hraní, Top 5 a profilů.
- Ověřeno přes `pg_policies`: počet zbývajících DELETE policies pro tyto tři tabulky je 0.
- RPC-first zápisy z v.1.5 (809) zůstávají zachované; další fáze 2E má řešit zúžení přímých INSERT/UPDATE cest a RPC validace herních zápisů.
- Verze sjednocena na v.1.5 (810), cache na v1.5-810 a Supabase realtime kanál na rak-public-live-v810.

## v.1.5 (809)
- Fáze 2C Supabase hardening: RPC funkce `rak_save_rotation_state` a `rak_save_machine_settings` byly aplikované do Supabase a ověřené přes `pg_proc`.
- Klient zůstává bezpečně RPC-first: nejdřív zkusí RPC a při problému spadne na původní přímý upsert, aby se nerozbily rozpisy ani administrace strojů.
- Přímé veřejné write/delete policies zatím nebyly zúžené; zůstanou až do dalšího reálného smoke testu jako kompatibilní fallback.
- Diagnostika Supabase nově ukazuje fázi 2C, potvrzené RPC funkce a další fázi 2D.
- Verze sjednocena na v.1.5 (809), cache na v1.5-809 a Supabase realtime kanál na rak-public-live-v809.

## v.1.5 (808)
- Fáze 2B Supabase hardening: přidaná RPC-first klientská příprava pro `rotation_state` a `machine_settings`.
- Zápisy se nejdřív pokusí použít plánované úzké RPC (`rak_save_rotation_state`, `rak_save_machine_settings`) a pokud RPC v databázi zatím není dostupné, bezpečně spadnou zpět na dosavadní přímý upsert, takže se nerozbije administrace ani rozpisy.
- Přidaný soubor `supabase_rpc_hardening_v808.sql` jako přesný návrh DB migrace pro další krok. Migrace v tomto běhu nebyla aplikovaná, protože Supabase nástroj SQL zablokoval bezpečnostní kontrolou.
- Diagnostika Supabase nově ukazuje RPC hardening stav, aktuální fázi 2B a další fázi 2C.
- Verze sjednocena na v.1.5 (808), cache na v1.5-808 a Supabase realtime kanál na rak-public-live-v808.

## v.1.5 (807)
- Supabase/RLS audit: přidaná klientská diagnostika posledního live policy auditu bez zásahu do databáze.
- Diagnostika v „O aplikaci“ nově ukazuje počet P0/P1/P2 rizik, počet veřejných write tabulek, destruktivní policies a aktuální/další fázi Supabase hardeningu.
- Potvrzená live rizika: veřejné/anon write policies u rotation_state, machine_settings, game_stats, game_sessions, game_invites, bug_reports a gomoku_wins. Databáze v tomto buildu nebyla měněná, aby se neriskovala funkčnost.
- Další fáze po tomto buildu: 2B – připravit a bezpečně otestovat úzké RPC/RLS úpravy pro nejrizikovější write cesty.
- Verze sjednocena na v.1.5 (807), cache na v1.5-807 a Supabase realtime kanál na rak-public-live-v807.

## v.1.5 (806)
- Audit stabilizační build po rozboru RaK: ROTATION_BUILD už nepoužívá Date.now() a loadRotationData nezahazuje lokální rozpis jen kvůli změně buildu.
- Admin odemčení se už neukládá do localStorage; při startu se starý adminUnlocked z localStorage maže a odemčení platí jen pro aktuální relaci.
- Destruktivní klientský reset online herního progresu je vypnutý, chráněný explicitním maintenance flagem a už se nevystavuje jako veřejný window helper.
- Profil hráče se při online synchronizaci doplňuje z více typů herních statistik včetně Pampucha a Lodí, ne jen z Piškvorek.
- Verze sjednocena na v.1.5 (806), cache na v1.5-806 a Supabase realtime kanál na rak-public-live-v806.

## v.1.5 (805)
- Piškvorky mají ještě upravenou hrací plochu přímo podle výšky spodní lišty; board se může lehce zmenšit, aby spodní řada nebyla za panelem.
- Spodní lišta: ikonky jsou znovu o chlup větší a aktivní ikonka je posazená nad popisek, aby nelezla do textu.
- Herní profily nově při skládání přehledu berou online Top score/cache ze všech her, ne jen Piškvorky, takže profil hráče lépe odpovídá výsledkům viditelným v Top 5.
- Denní challenge ponechává Top score podle aktuální dnešní hry a v názvu score ukazuje, ke které hře patří.
- Verze sjednocena na v.1.5 (805), cache na v1.5-805 a Supabase realtime kanál na rak-public-live-v805.

## v.1.5 (804)
- Spodní lišta: ikonky jsou zvětšené a aktivní ikonka se už nemá posouvat nahoru; zvětší se na svém místě. Aktivní „Více“ má tečky centrované, aby neutíkaly doprava.
- Piškvorky: oprava spodního prostoru je posílená i v runtime patchi Piškvorek, který dřív přepisoval statické CSS; hrací plocha se počítá podle reálné výšky spodní lišty a má končit nad panelem.
- Denní challenge: přehled score na úvodní obrazovce nově ukazuje jen výsledky aktuální dnešní hry a v titulku score je přímo napsané, pro kterou hru to je.
- Verze sjednocena na v.1.5 (804), cache na v1.5-804 a Supabase realtime kanál na rak-public-live-v804.

## v.1.5 (803)
- Piškvorky: hrací plocha má silnější spodní rezervu nad pevným spodním panelem, aby spodní řada/políčka neležely za lištou.
- Spodní lišta: velikost ani umístění panelu se nemění; aktivní glass zvýraznění je jen malinko širší a aktivní ikonka je větší na stejném místě.
- „O aplikaci“ je zkrácené a řada v.1.5 751–800 je seskupená do většího přehledového bloku.
- Verze sjednocena na v.1.5 (803), cache na v1.5-803 a Supabase realtime kanál na rak-public-live-v803.

## v.1.5 (802)
- Spodní lišta: panel je ještě průhlednější, ale velikost ani umístění panelu zůstaly zachované proti potvrzenému stavu.
- Ikonky ve spodní liště jsou zvětšené a původní sada ikon zůstává zachovaná.
- Aktivní položka má vyšší a užší glass zvýraznění, které může lehce přesahovat panel; aktivní ikonka je vytažená nahoru, aby se neschovávala za spodkem panelu.
- Verze sjednocena na v.1.5 (802), cache na v1.5-802 a Supabase realtime kanál na rak-public-live-v802.

## v.1.5 (801)
- Spodní lišta: panel zůstává stejně velký a na stejném místě, jen je ještě průhlednější.
- Ikonky jsou větší; aktivní ikonka je větší také, ale už nemá ujíždět dolů mimo panel.
- Aktivní glass zvýraznění je roztažené víc do krajů položky a skoro přes celou výšku panelu.
- Verze sjednocena na v.1.5 (801), cache na v1.5-801 a Supabase realtime kanál na rak-public-live-v801.

## v.1.5 (800)
- Spodní lišta: velikost ani umístění panelu se nemění proti potvrzené v.1.5 (799).
- Panel je vizuálně ještě průhlednější, aby víc zapadl do pozadí aplikace.
- Ikonky ve spodní liště jsou lehce zvětšené, aktivní ikonka je zvětšená výrazněji.
- Aktivní glass zvýraznění je nově centrované na položku a natažené skoro přes celou výšku panelu, aby nepůsobilo jako malá bublina mimo ikonu.
- Verze sjednocena na v.1.5 (800), cache na v1.5-800 a Supabase realtime kanál na rak-public-live-v800.

## v.1.5 (799)
- Spodní lišta: vrácené původní PNG ikonky místo SVG ikon z v.1.5 (798).
- Do buildu jsou doplněné chybějící soubory `assets/nav-icons/*.png`, aby ikonky nebyly závislé jen na cache prohlížeče.
- Neaktivní položky lišty mají tvrdší CSS reset podkladů, rámečků, stínů a pseudo-vrstev.
- Aktivní položka už nemá kulatou bublinu; má větší jemnou glass kapsli za ikonou a popiskem.
- Velikost ani umístění spodního panelu se neměnilo proti v.1.5 (798).
- Verze sjednocena na v.1.5 (799), cache na v1.5-799 a Supabase realtime kanál na rak-public-live-v799.

## v.1.5 (798)
- Spodní lišta: velikost ani umístění panelu se nemění proti v.1.5 (797).
- Neaktivní ikony jsou převedené na čisté inline SVG bez PNG podkladů, aby kolem nich nezůstávaly staré tmavé rámečky ani cached ikony s vlastním ohraničením.
- Aktivní zvýraznění už není kulatá bublina mimo/uvnitř ikonky; je nahrazené jemnou glass kapslí za aktivní položkou.
- Panel je ještě lehce průhlednější, ale spodní rezerva obsahu a fixní ukotvení zůstávají zachované.
- Verze sjednocena na v.1.5 (798), cache na v1.5-798 a Supabase realtime kanál na rak-public-live-v798.

## v.1.5 (797)
- Spodní lišta: velikost a umístění panelu z v.1.5 (796) zůstávají beze změny.
- Neaktivní ikonky jsou dočištěné bez tmavého podkladu, stínu, rámečku a pseudo-vrstev kolem sebe.
- Aktivní ikona má větší vnější kulaté glass zvýraznění kolem celé ikonky; samotná ikonka už nemá malou bublinu uvnitř.
- Panel spodní lišty je ještě o něco průhlednější, ale zůstává čitelný a pevně ukotvený dole.
- Verze sjednocena na v.1.5 (797), cache na v1.5-797 a Supabase realtime kanál na rak-public-live-v797.

## v.1.5 (796)
- Spodní lišta: velikost a umístění z v.1.5 (795) zůstává beze změny.
- Neaktivní ikonky na spodní liště mají odstraněné vlastní ohraničení, stíny a podkladové rámečky.
- Aktivní ikonka má jen jemné kulaté glass ohraničení kolem samotné ikonky.
- Panel spodní lišty je ještě průhlednější, ale zůstává čitelný a pevně ukotvený dole.
- Verze sjednocena na v.1.5 (796), cache na v1.5-796 a Supabase realtime kanál na rak-public-live-v796.

## v.1.5 (795)
- Spodní lišta je přepracovaná do průhlednějšího glass dock stylu podle návrhu: neaktivní ikony jsou čisté bez tvrdého ohraničení.
- Aktivní položka má větší ikonu a kulaté jemné glass zvýraznění s decentním neonovým glow efektem.
- Lišta zůstává pevně ukotvená dole, obsah aplikace dál končí nad ní a Piškvorky si drží spodní rezervu nad panelem.
- U tlačítka Více je dorovnaná velikost, aby opticky sedělo k nové liště a nerozbíjelo zarovnání.
- Verze sjednocena na v.1.5 (795), cache na v1.5-795 a Supabase realtime kanál na rak-public-live-v795.

## v.1.5 (794)
- Spodní lišta je posazená níž k samotné spodní hraně displeje: safe-area odsazení je omezené, aby panel nebyl zbytečně vysoko, ale pořád zůstal použitelný na různých mobilech.
- Rezerva obsahu nad spodní lištou je přepočítaná podle reálné výšky panelu, takže stránky nemají zalézat pod lištu.
- Piškvorky mají hrací plochu dotaženou těsně nad spodní panel; spodní řada se nemá schovávat pod lištu ani zbytečně utíkat nahoru.
- Verze sjednocena na v.1.5 (794), cache na v1.5-794 a Supabase realtime kanál na rak-public-live-v794.

## v.1.5 (793)
- Spodní lišta je upravená natvrdo jako pevný prvek u úplného spodku obrazovky, bez plavání a bez zbytečného odsazení odspodu.
- Odstraněné je průběžné přepočítávání pozice lišty při `visualViewport` scrollu, které mohlo na mobilech působit jako poskakování lišty.
- Obsah aplikace dostává pevnou spodní rezervu nad lištou, aby pod ni nezalézaly stránky ani hry; Piškvorky mají znovu zajištěný spodní prostor pro hrací pole.
- Verze sjednocena na v.1.5 (793), cache na v1.5-793 a Supabase realtime kanál na rak-public-live-v793.

## v.1.5 (792)
- Spodní lišta je nově globálně pevně ukotvená ke spodku obrazovky přes celou aplikaci, s podporou safe-area pro různé iPhony a Android/Samsung telefony.
- Obsah stránek dostává dynamickou spodní rezervu podle skutečné výšky lišty, aby neležel pod navigací.
- Piškvorky mají přepočítaný spodní prostor hrací plochy podle skutečné spodní lišty, aby spodní řádek/políčko nebylo schované za lištou.
- Přidaný runtime měřič spodní lišty, který aktualizuje `--bottom-nav-h` a `--rak-fixed-bottom-space` po resize/orientaci/visualViewport změně.
- Verze sjednocena na v.1.5 (792), cache na v1.5-792 a Supabase realtime kanál na rak-public-live-v792.

## v.1.5 (791)
- Administrace → Rozpisy: po kliknutí na obsazené jméno se ve sticky horní liště zobrazí bezpečné tlačítko „Odebrat vybrané“, které smaže vybranou buňku bez plovoucí bubliny nad tabulkou.
- Do ruční editace rozpisu je přidaný kompaktní „Přehled měsíce“ jako statická mini tabulka pro rychlou orientaci, aby šlo vidět větší část rozpisu najednou.
- Editor dál zůstává lokální: změny se do aplikace a Supabase ukládají až po kliknutí na „Uložit rozpis“.
- Stabilizační úpravy z v.1.5 (790) proti iOS auto-zoomu a rychlému scrollu zůstávají zachované.
- Verze sjednocena na v.1.5 (791), cache na v1.5-791 a Supabase realtime kanál na rak-public-live-v791.

## v.1.5 (790)
- Administrace → Rozpisy: ruční editor se chová víc jako lokální rozepsaná tabulka; změny se do Supabase posílají až po kliknutí na Uložit rozpis.
- Přidaná pevná/sticky akční lišta přímo v editoru rozpisů, aby bylo tlačítko Uložit rozpis pořád po ruce i při dlouhé tabulce.
- Editor je znovu kompaktnější: pole si nechávají 16px proti iOS auto-zoomu, ale výšky, mezery a šířky buněk jsou stažené kvůli lepšímu přehledu.
- Vypnuté těžké datalist našeptávání pro každou buňku a při rychlém scrollu se zavírá jen malé Odebrat okno; přepočet kontroly měsíce je odlehčený.
- Verze sjednocena na v.1.5 (790), cache na v1.5-790 a Supabase realtime kanál na rak-public-live-v790.

## v.1.5 (789)
- Administrace → Rozpisy: opravená hlavní příčina pádu na iPhonu při ruční editaci. Pole v tabulkách už nemají malé písmo 9–11 px, které na iOS po kliknutí automaticky přibližovalo stránku.
- Ruční editor rozpisu má při otevření uzamčený viewport proti iOS auto-zoomu a při změně visual viewportu jen bezpečně zavře rychlé Odebrat místo rozbití celé obrazovky.
- Tabulky v ruční editaci jsou raději širší a horizontálně scrollovatelné, aby inputy mohly mít bezpečných 16 px a Safari je nepřibližovalo.
- Rychlé tlačítko Odebrat po kliknutí na obsazené jméno zůstává zachované.
- Verze sjednocena na v.1.5 (789), cache na v1.5-789 a Supabase realtime kanál na rak-public-live-v789.

## v.1.5 (788)
- Administrace → Rozpisy: po kliknutí na vyplněné jméno se znovu hned nabízí rychlá akce Odebrat, tentokrát jako vlastní malé tlačítko nad polem, ne jen přes systémový datalist.
- Našeptávání jmen v ručním editoru už nepřestavuje datalisty zbytečně celé dokola při každém focusu; aktualizuje jen změněné seznamy, aby se editor na mobilu nechoval těžce.
- Přidaná ochrana proti problematickému pinch/zoom oddálení v ruční editaci rozpisu, které na mobilu mohlo shodit stránku do bílé obrazovky.
- Výpočet korekcí, hry a ostatní části aplikace zůstávají beze změny proti v.1.5 (787).
- Verze sjednocena na v.1.5 (788), cache na v1.5-788 a Supabase realtime kanál na rak-public-live-v788.

## v.1.5 (787)
- Administrace → Rozpisy: ruční editace je stabilnější. Klepnutí do vyplněného pole už nespouští potvrzovací mazací okno, takže se na mobilu dá normálně upravovat text.
- Kontrola jmen a našeptávání u ruční editace rozpisu se po psaní přepočítává odlehčeně se zpožděním místo okamžitě při každém znaku; tím se snižuje riziko bílé obrazovky/resetu na mobilu.
- Přidaná ochrana, aby chyba v pomocné kontrole rozpisu neshodila administraci ani nerozbila rozepsané změny.
- Opravené čtení data u řádků absence v administraci rozpisů a zpevněné čtení prázdných/neúplných řádků.
- Verze sjednocena na v.1.5 (787), cache na v1.5-787 a Supabase realtime kanál na rak-public-live-v787.

## v.1.5 (786)
- Korekce → Soustruhy → Poloha vrtáků v ose X: textový popisek „Kde hledat…“ nad zadáváním hodnot je odstraněný; zůstává jen samotný otazník.
- Po rozkliknutí otazníku zůstává obrázková nápověda zachovaná a její doprovodný text nově říká, že jde o 3D protokol, kde se hledají hodnoty pro vrták 3 a vrták 7.
- Výpočet korekce, obrázek nápovědy i ostatní části panelu zůstávají beze změny proti v.1.5 (785).
- Verze sjednocena na v.1.5 (786), cache na v1.5-786 a Supabase realtime kanál na rak-public-live-v786.

## v.1.5 (785)
- Korekce → Soustruhy → Poloha vrtáků v ose X má nad zadáváním hodnot nový otazník s obrázkovou nápovědou, aby bylo hned vidět, kde v protokolu hledat hodnoty pro vrták 3 a vrták 7.
- Do buildu je přibalený nový pomocný obrázek `assets/help/soustruhy-vrtaky-x-help.png`; je zahrnutý i do service worker cache a exportu ZIPu pro offline použití.
- Výpočet korekce vrtáků, přepínače +/− i výsledný text zůstávají beze změny proti v.1.5 (784).
- Verze sjednocena na v.1.5 (785), cache na v1.5-785 a Supabase realtime kanál na rak-public-live-v785.

## v.1.5 (784)
- Korekce → Soustruhy → Poloha vrtáků v ose X: zavřený rozklikávací panel je vyšší a má o něco větší nadpis, aby šel na mobilu líp trefit i přečíst.
- Odstraněný doplňkový popisek pod nadpisem panelu, zůstává jen čistý název „Poloha vrtáků v ose X“.
- Výpočet korekce vrtáků zůstává beze změny proti potvrzené v.1.5 (783).
- Verze sjednocena na v.1.5 (784), cache na v1.5-784 a Supabase realtime kanál na rak-public-live-v784.

## v.1.5 (783)
- Korekce → Soustruhy → Poloha vrtáků v ose X: výsledek je zkrácený jen na zvolený stroj, výraznou větu s korekcí do osy X na vrtácích a očekávaný výsledek.
- Z výsledku je odstraněná hodnota před násobením i další vysvětlovací řádky, aby se obsluha nemátla.
- Výpočet korekce zůstává stejný jako v potvrzené v.1.5 (782).
- Verze sjednocena na v.1.5 (783), cache na v1.5-783 a Supabase realtime kanál na rak-public-live-v783.

## v.1.5 (782)
- Korekce → Soustruhy → Poloha vrtáků v ose X: přepínače +/− u polí jsou dorovnané na stejnou výšku jako zadávací pole.
- Odstraněný zbytečný popis pod zadáváním hodnot a zjednodušený výsledek: výrazně ukazuje hlavně korekci, kterou zadat do X, směr a očekávaný stav vrtáků po korekci.
- Výpočet samotný zůstává beze změny proti v.1.5 (781).
- Verze sjednocena na v.1.5 (782), cache na v1.5-782 a Supabase realtime kanál na rak-public-live-v782.

## v.1.5 (781)
- Korekce → Soustruhy → Poloha vrtáků v ose X má u polí Vrták 3 a Vrták 7 přepínač znaménka +/− přímo u zadávacího pole, aby šlo zadat minus i na mobilní numerické klávesnici.
- Zpřesněné popisky logiky: vrták 3 je vlevo od středu, vrták 7 vpravo od středu a vrtáky se hýbou jen společně doleva/doprava. Výsledek ukazuje i posun před násobením a korekci X po násobení ×2.
- Verze sjednocena na v.1.5 (781), cache na v1.5-781 a Supabase realtime kanál na rak-public-live-v781.

## v.1.5 (780)
- Korekce → Soustruhy: panel Poloha vrtáků v ose X má nově výpočet pro vrták 3 vlevo a vrták 7 vpravo.
- Výpočet převádí znaménka podle strany obrobku, najde společný posun obou vrtáků, zohlední rozdílný směr osy X pro MSKC01/03/04 a MSKC02 a výslednou korekci násobí ×2 kvůli průměrovému zadání.
- Přidaná dvě vstupní pole, výsledek korekce X, směr pohybu a očekávané hodnoty po korekci.
- Verze sjednocena na v.1.5 (780), cache na v1.5-780 a Supabase realtime kanál na rak-public-live-v780.

## v.1.5 (779)
- Sudoku: panel s volbou obtížnosti je posunutý o kousek níž a má viditelný horní okraj i při menší výšce displeje.
- Úprava je přidaná jak do runtime stylu her, tak do finální override vrstvy, aby ji nepřebily starší Sudoku pojistky.
- Verze sjednocena na v.1.5 (779), cache na v1.5-779 a Supabase realtime kanál na rak-public-live-v779.

## v.1.5 (778)
- Piškvorky online: přidaná pojistka proti duplicitnímu započítání jedné online partie po realtime refreshi, reloadu nebo otevření výsledku na obou telefonech.
- Lokální zobrazení výsledku Piškvorek už při online hře neposílá samostatný přímý zápis do `game_stats`; online statistiku má řídit jedna dokončená session.
- Klíč lokálního uložení výsledku online Piškvorek je navázaný hlavně na session/kód + roli + výsledek, ne na proměnlivou revizi.
- Supabase fallback při zápisu výsledku nejdřív označí session jako zapsanou a teprve potom přičítá statistiku hráčům.
- Verze sjednocena na v.1.5 (778), cache na v1.5-778 a Supabase realtime kanál na rak-public-live-v778.

## v.1.5 (777)
- Sjednocený XP/rank systém napříč hrami: každá dokončená hra dává podobný základ XP bez ohledu na surové skóre.
- Skóre, čas a výhra nově přidávají jen omezený bonus, takže Space Shooter nebo jiné bodové hry už nemají násobně větší vliv než Piškvorky, Sudoku nebo Pexeso.
- Variantní výsledky Pexesa/Sudoku se nepočítají do XP duplicitně; pro rank se bere základní hra, Top výsledky podle obtížnosti zůstávají zachované.
- Ranky dál berou v potaz achievementy, ale férověji vůči všem hrám.
- Verze sjednocena na v.1.5 (777), cache na v1.5-777 a Supabase realtime kanál na rak-public-live-v777.

## v.1.5 (770)
- Sudoku: spodní nabídka čísel má větší bezpečný prostor nad spodní lištou.
- Korekce: reset a křížek v horním panelu jsou znovu ukotvené vpravo a Frézky mají pojistku pro názvy indexů.
- Verze sjednocena na v.1.5 (770), cache na v1.5-770 a Supabase realtime kanál na rak-public-live-v770.

## v.1.5 (769)
- Korekce → Frézky: u polí Konicita a fhβ jsou nově otazníky s obrázkovou nápovědou.
- Kliknutí na otazník otevře modal s připravenou fotkou, kde je zvýrazněná aktuální hodnota korekce i tlačítko Změnit.
- Obrázky jsou přibalené do PWA/ZIPu jako offline assety a zahrnuté v service worker cache i exportu ZIPu.
- Verze sjednocena na v.1.5 (769), cache na v1.5-769 a Supabase realtime kanál na rak-public-live-v769.

## v.1.5 (768)
- Denní výzva: Bomberman mini má při spuštění z Daily vlastní stav a znovu navázané ovládání, takže se nezasekne na starém běžném Bombermanovi.
- Bomberman v Daily používá vlastní bind body/shellu, aby dotykový joystick a klávesy fungovaly i po přepnutí mezi běžnou hrou a denní výzvou.
- Verze sjednocena na v.1.5 (768), cache na v1.5-768 a Supabase realtime kanál na rak-public-live-v768.

## v.1.5 (767)
- Piškvorky: hrací pole má spodní okraj pevně nad spodním panelem/navigací, aby do něj nelezlo a neztrácelo se pod lištou.
- Kalkulačky: hlavní menu Kalkulačky, Výpočet kusů a Korekce mají sjednocenou výšku nadpisového panelu i mezeru pod ním.
- Korekce: nadpisy Soustruhy / Frézky / Brusy používají stejnou výšku jako stránky Výpočtu kusů.
- Verze sjednocena na v.1.5 (767), cache na v1.5-767 a Supabase realtime kanál na rak-public-live-v767.

## v.1.5 (766)
- Kalkulačky: sjednocení horních nadpisových panelů a mezery pod nadpisem podle hlavního menu Kalkulačky.
- O aplikaci a changelog průběžně aktualizované pro aktuální stav.
- Verze sjednocena na v.1.5 (766), cache na v1.5-766 a Supabase realtime kanál na rak-public-live-v766.

## v.1.5 (763)
- Výpočet kusů má nový stroj Pračka v přehledu kalkulaček.
- Pračka počítá „Kolik ještě stihnu“ podle výroby 30 s/ks, přičítá volitelný počet z počítadla a přepočítává výsledek na dávky po 32 ks.
- Pračka má nově „Kdy bude hotovo“ podle počtu zbývajících dávek a kusů hotových v aktuální dávce, stejnou logikou rozdělané dávky jako u Brusů.
- Administrace umí upravit čas Pračky a středy fhβ pro frézky přes Supabase `machine_settings`.
- Verze sjednocena na v.1.5 (763), cache na v1.5-763 a Supabase realtime kanál na rak-public-live-v763.

## v.1.5 (761)
- Piškvorky: při otevřené hře se pod spodní lištou už nezobrazuje stránka s ostatními hrami.
- Piškvorky: podklad stránky je při hře skrytý a scroll pod hrou je uzamčený, aby nešlo posouvat jinou stránku za overlayem.
- Korekce → Frézky: mezi horním nadpisem a kalkulačkou je nově malá mezera podobně jako u Výpočtu kusů, ne nalepené a ne velká volná plocha.
- Verze sjednocena na v.1.5 (761), cache na v1.5-761 a Supabase realtime kanál na rak-public-live-v761.

## v.1.5 (760)
- Korekce → Frézky: odstraněná volná plocha mezi horním nadpisem a kalkulačkou; korekční stránky se už v gridu neroztahují přes výšku.
- Korekce → Frézky: AF/AG tlačítka mají pozadí správně zleva modré pro AF a zprava zelené pro AG, včetně volných variant.
- Verze sjednocena na v.1.5 (760), cache na v1.5-760 a Supabase realtime kanál na rak-public-live-v760.

## v.1.5 (759)
- Korekce → Frézky: AF je nově modré a AG zelené, AH zůstává oranžové; volné varianty používají tlumenější odstíny.
- Korekce → Frézky: karta s volbou indexu je dotažená těsněji pod horní nadpis bez zbytečné volné plochy.
- Korekce → přehled: „Frézky ve vývoji“ přejmenováno na „Frézky (nutno doladit)“.
- Verze sjednocena na v.1.5 (759), cache na v1.5-759 a Supabase realtime kanál na rak-public-live-v759.

## v.1.5 (758)
- Korekce: nadpisy strojů po rozkliknutí jsou centrované, včetně Frézek.
- Přehled strojů v sekci Korekce je vycentrovaný a zůstává po jednom stroji na řádek.
- Korekce → Frézky: karta s volbou indexu je blíž k nadpisu a indexová tlačítka mají barvy podle stylu brusů; AF/AG používá zeleno-modré značení, AH oranžové, volné varianty tlumené odstíny.
- Verze sjednocena na v.1.5 (758), cache na v1.5-758 a Supabase realtime kanál na rak-public-live-v758.

## v.1.5 (757)
- Korekce → Frézky: konicita i fhβ jsou sjednocené do jedné kalkulačky.
- Zadávají se dvě aktuální korekce ze stroje: Konicita a fhβ. Samostatná karta „fhβ posun celé strany“ je odstraněná.
- Vyhodnocení samo řekne, jestli hýbat konicitou, fhβ, nebo obojím, a ukáže konkrétní hodnoty „Zadej konicitu“ / „Zadej fhβ“.
- Očekávané hodnoty po korekci se počítají pro C1 i C2 zvlášť, bez průměrování kol.
- Verze sjednocena na v.1.5 (757), cache na v1.5-757 a Supabase realtime kanál na rak-public-live-v757.

## v.1.5 (755)
- Korekce → Frézky: ruční pole „Má být“ nahrazená tlačítkovou volbou indexů AF/AG lis, AH lis, AF/AG volné a AH volné.
- Vyhodnocení frézek nově porovnává posun celého středu a konicitu a samo doporučí, jestli řešit spíš fhβ posun celé strany, nebo konicitu.
- U konicity zůstává návrh „Zadej korekci“, u fhβ posunu aplikace zatím ukáže směr a orientační první odhad, protože citlivost se bude dál ladit z praxe.
- Verze sjednocena na v.1.5 (755), cache na v1.5-755 a Supabase realtime kanál na rak-public-live-v755.

## v.1.5 (754)
- Korekce → Frézky → fhβ: text návrhu zůstává „Zadej korekci“, ale hodnota korekce se znovu ukazuje v desetinném tvaru, např. 0,035.
- Očekávané hodnoty fhβ po korekci se nově zobrazují v celých číslech bez desetinných míst.
- C1 a C2 se dál vyhodnocují samostatně, bez průměrování kol.
- Verze sjednocena na v.1.5 (754), cache na v1.5-754 a Supabase realtime kanál na rak-public-live-v754.

## v.1.5 (752)
- Korekce → Frézky → fhβ: výsledná navržená korekce se zobrazuje jako celé korekční číslo, například „Zadej korekci: 30“.
- Výsledek je zkrácený jen na doporučenou korekci a očekávané hodnoty fhβ po korekci.
- Formulář fhβ a výsledková karta jsou nižší, aby byl výsledek vidět bez zbytečného scrollování.
- Vstup aktuální korekce nově snese zápis jako 35 i jako 0,035.
- Verze sjednocena na v.1.5 (752), cache na v1.5-752 a Supabase realtime kanál na rak-public-live-v752.

## v.1.5 (751)
- Korekce → Frézky → fhβ: odstraněný horní vysvětlující text ve formuláři.
- Návrh korekce je stručnější: ukazuje hlavně konkrétní hodnotu korekce a očekávané fhβ po korekci.
- C1 a C2 se už neprůměrují; každé kolo se kontroluje samostatně pro levou i pravou stranu, aby průměr neschoval jedno kolo mimo toleranci.
- Korekce → Soustruhy / Frézky / Brusy jsou v přehledu označené štítkem „ve vývoji“.
- Sekce O aplikaci průběžně aktualizovaná pro aktuální stav korekcí.
- Verze sjednocena na v.1.5 (751), cache na v1.5-751 a Supabase realtime kanál na rak-public-live-v751.

## v.1.5 (750)
- Korekce Frézky → fhβ: upravená logika směru podle spodního sbíhání/rozbíhání čar v protokolu, ne jen podle obecného průměru.
- Když je měřený rozdíl P−L větší než cílový, aplikace doporučí korekci dolů a sbližování čar.
- Když je měřený rozdíl P−L menší než cílový, doporučí korekci nahoru a rozevírání čar.
- Citlivost je oddělená pro směr dolů a nahoru podle prvních reálných příkladů: dolů cca 1,8 µm / 0,001, nahoru cca 1,45 µm / 0,001.
- Verze sjednocena na v.1.5 (750), cache na v1.5-750 a Supabase realtime kanál na rak-public-live-v750.

## v.1.5 (749)
- Korekce Frézky → fhβ: výpočet návrhu korekce teď míří vždy na střed z hodnot „Má být“ bez tolerance.
- Tolerance ±10 zůstává jen pro vyhodnocení OK/NOK, neovlivňuje cílový střed ani doporučený směr korekce.
- Výsledek nově výslovně ukazuje cílový střed L/P a rozdíl P−L proti středu.
- Verze sjednocena na v.1.5 (749), cache na v1.5-749 a Supabase realtime kanál na rak-public-live-v749.

## v.1.5 (748)
- Korekce → Frézky → fhβ: doplněný praktický návrh, kam hnout korekcí podle ručně zadaných hodnot z protokolu.
- Výpočet už nebere korekci jako 1:1; používá první průměrnou kalibraci z reálných měření, kde 0,001 korekce posune rozdíl levá/pravá přibližně o 1,6 µm.
- Výsledek ukazuje směr přidat/ubrat, odhad na střed a opatrný první krok, aby šlo po korekci přeměřit a doladit.
- Pole „Změněno na“ odebrané z ručního zadání, protože novou hodnotu má navrhnout aplikace.
- Verze sjednocena na v.1.5 (748), cache na v1.5-748 a Supabase realtime kanál na rak-public-live-v748.

## v.1.5 (747)
- Korekce → Frézky: přidaný první formulář pro fhβ / sklon ozubení.
- Formulář má předepsané hodnoty levé a pravé struny „Má být“ s tolerancí ±10.
- Přidané naměřené hodnoty C1 levá/pravá a C2 levá/pravá.
- Doplněné volitelné pole aktuální korekce a změněno na, aby šlo zapisovat reálné pokusy.
- Vyhodnocení fhβ zatím dává orientační průměry, odchylky a směr podle příkladů; přesný automatický návrh korekce se doplní později podle indexů.
- Korekční horní panel je zpevněný do jednoho řádku stejně jako u Výpočtu kusů.
- Verze sjednocena na v.1.5 (747), cache na v1.5-747 a Supabase realtime kanál na rak-public-live-v747.

## v.1.5 (746)
- Kalkulačky: stroje v sekcích Výpočet kusů i Korekce jsou v přehledu vždy po jednom na řádek.
- Korekční stránky Soustruhy, Frézky a Brusy mají sjednocený horní panel jako výpočet kusů: název na jeden řádek, reset a křížek vpravo.
- Z korekčních stránek odstraněné připravené výpočty a formuláře, aby se konkrétní korekce doplnily postupně.
- Verze sjednocena na v.1.5 (746), cache na v1.5-746 a Supabase realtime kanál na rak-public-live-v746.

## v.1.5 (745)
- Kalkulačky: hlavní přehled rozdělený do rozbalovacích sekcí „Výpočet kusů“ a „Korekce“.
- Sekce Korekce používá stejné stroje a ikonky jako výpočty kusů: Soustruhy, Frézky a Brusy.
- Přidané základní korekční výpočty pro stroje: rozdíl cíle proti naměřené hodnotě, nová korekce, u soustruhu i půlka na rádius a u brusu přepočet na kroky.
- Výkon zařízení: tlačítko „Zapnout Láďův“ změněné na „Láďův režim“, texty v tlačítkách jsou centrované a zapnutý Láďův režim je výrazněji zvýrazněný.
- Export ZIPu přejmenovaný na formát „RaK v1.5(745).zip“ a obsah ZIPu je přímo v kořeni bez další složky.

## v.1.5 (744)
- Více → Nastavení: zmenšená karta Profil a přihlášení, zúžená karta Výkon zařízení a kratší texty.
- Z Nastavení aplikace odebrané duplicitní tlačítko Láďův režim, protože zůstává ve Výkonu zařízení.
- Tlačítka Nastavení aplikace a Theme/Pozadí jsou kompaktnější a drží dvě položky vedle sebe i na mobilu.
- Tlačítko Zpět je samostatně až pod Theme / barvy aplikace a Pozadí.

## v.1.5 (743)
- Přechod aktuální build řady na v.1.5 (743), cache na v1.5-743 a Supabase realtime kanál na rak-public-live-v743.
- Sekce „O aplikaci“ přepracovaná do stručného přehledu po blocích cca 50 verzí.
- Z popisu „O aplikaci“ odstraněné zbytečné vysvětlivky o aktuálním buildu, changelogu, theme a pozadí.
- V Nastavení aplikace a v Theme odstraněné zbytečné popisky; zůstaly samotné volby.

## v.1.1 (742)
- Lodě: opravené umístění spodních tlačítek při rozmisťování flotily.
- Tlačítka Přehodit automaticky a Otočit vybranou jsou nově v běžném toku pod hrací plochou a nad spodní lištou, ne jako sticky vrstva přes board.
- Board se dopočítává menší podle dostupné výšky, aby se ovládání vešlo pod něj i na větších mobilech.
- Verze sjednocena na v.1.1 (742), cache na v1.1-742 a Supabase realtime kanál na rak-public-live-v742.

## v.1.1 (735)
- Opravené roční statistiky: u uzavřeného/importovaného roku se pro každého pracovníka drží roční fond 164, takže karta „Práce + absence“ vychází 164 místo hodnot převzatých z aktuálního období.
- Aktuální rok se dál počítá průběžně podle vyplněných měsíců, takže např. 5/26 nezvedá uměle celý rok na 164.
- Zkontrolované pravidlo TNKS01/TPKW01: mimo neděli se počítá 0,5 směny na TNKS01 a 0,5 směny na TPKW01; v neděli se nepůlí a bere se skutečný stroj.
- Verze sjednocena na v.1.1 (735), cache na v1.1-735 a Supabase realtime kanál na rak-public-live-v735.

## v.1.1 (734)
- Opravené přepínání roku v Rozpisech: render už nepřepisuje ručně vybraný rok zpět na aktuální rok, takže po volbě 2025 se zobrazují měsíce roku 2025.
- Opravené přepínání roku ve Statistikách: změna roku okamžitě překreslí statistiky podle vybraného roku a detailní výpočty se už nemíchají s posledním/aktuálním rokem.
- Doplněný handler pro výběr měsíce v Rozpisech, aby změna v rozbalovacím seznamu rovnou načetla správný měsíc a držela k němu správný rok.
- Verze sjednocena na v.1.1 (734), cache na v1.1-734 a Supabase realtime kanál na rak-public-live-v734.

## v.1.1 (732)
- Opravené online ukládání importovaných rozpisů: v Supabase byla doplněná minimální práva a RLS policy pro tabulku rotation_state, protože import padal na `permission denied for table rotation_state`.
- Z formuláře Import Excelu odstraněné pole „Rok pro starší listy bez roku“, protože správné měsíce se berou přímo z názvů listů typu 01.2025 / 01/2025 / 01/25.
- Import dál ukládá rozpis lokálně i online; při chybě má zůstat lokální kopie a v konzoli je vidět konkrétní Supabase chyba.
- Verze sjednocena na v.1.1 (732), cache na v1.1-732 a Supabase realtime kanál na rak-public-live-v732.

## v.1.1 (731)
- Import Excelu ověřený proti souborům Rotace týmu 2025.xlsx i Rotace týmu 2026.xlsx. Parser bere jen měsíční listy pojmenované 01.2025 / 01/2025 / 01-2025 a pomocné listy Souhrn/Datumy se nepoužívají.
- Po importu se rozpis uloží pod správný klíč měsíce a roku podle názvu listu, například 01.2026 -> 1/26. Rozpis i statistiky se po importu rovnou přepnou na rok importovaného Excelu.
- Import si ukládá metainformaci o zdrojovém listu a počtech řádků tvrdoty, měkoty a absencí, aby šlo později dohledat, co se z Excelu načetlo.
- Verze sjednocena na v.1.1 (731), cache na v1.1-731 a Supabase realtime kanál na rak-public-live-v731.

## v.1.1 (730)
- Import Excelu je doladěný podle reálného souboru Rotace týmu 2025.xlsx: měsíce se berou jen z názvů listů typu 01.2025 / 01/2025 / 01/25, takže už se nechytají falešné hodnoty jako 1/10 nebo 6/10 z pomocných tabulek.
- Pomocné listy typu Souhrn a Datumy se při importu přeskočí; do rozpisů se čtou jen měsíční listy.
- Parser nově hledá bloky podle nadpisů Rotace tvrdota, Rotace měkota a Dovolená/neschopenka, ne podle pevných řádků, takže zvládne rozdílný počet pracovních dnů v měsících.
- Měkota přebírá skutečné názvy strojů z daného listu, takže zvládne i měsíc, kde je v Excelu místo MFKF06 jiný stroj, například MSKC02.
- Verze sjednocena na v.1.1 (730), cache na v1.1-730 a Supabase realtime kanál na rak-public-live-v730.

## v.1.1 (729)
- Opravený Export / import v administraci: tlačítka teď používají správné `data-admin-action`, takže export ZIP i import Excelu skutečně reagují na kliknutí.
- Import Excelu je nově dvoukrokový: nejdřív se vybere soubor, appka ho načte, zobrazí nalezené měsíce v rozbalovacím menu a potom jde importovat celý načtený Excel/rok nebo jen vybraný měsíc.
- Importované rozpisy se po potvrzení dál ukládají lokálně i online přes Supabase, aby je po synchronizaci viděli všichni.
- Export ZIP má přímý veřejný helper `triggerRakZipExport()` / `exportCurrentHtml()` a stavovou hlášku, takže se neschovává za nefunkční skryté tlačítko.
- Verze sjednocena na v.1.1 (729), cache na v1.1-729 a Supabase realtime kanál na rak-public-live-v729.

## v.1.1 (728)
- Opravený import Excelu v administraci: jde zvolit import celého Excelu/roku nebo jen jednoho měsíce zadaného jako např. 1/25 nebo 1/2025.
- Import Excelu nově po načtení rozpis uloží lokálně i online přes Supabase, aby se rozpis promítl všem po synchronizaci.
- Doplněný parser Excelu pro měsíční listy: poznává názvy měsíců/listů, tabulky tvrdota/měkota podle strojů a základní poznámky/absence.
- Export ZIP nově používá zdrojový index.html a stahuje se jako RaK_v1_1_728.zip, aby byl co nejblíž buildu, který posíláme ručně.
- Verze sjednocena na v.1.1 (728), cache na v1.1-728 a Supabase realtime kanál na rak-public-live-v728.

## v.1.1 (726)
- Pampuch je předělaný z původní skákačky na bludišťovou retro hru ve stylu odkázaného Pampucha: body v mapě, bonus body, duchové, životy, levely a Total/Best/Points HUD.
- Ovládání je mobile-first bez šipkových tlačítek: swipe kdekoliv po herní ploše, na PC fungují klávesové šipky/WASD a mezerník pro pauzu.
- Přidané 4 vlastní bludišťové levely, level přepínače, bonus režim pro lov duchů, Top 5 pod hrou a dokončené zápisy statistik/XP jen po konci hry.
- Achievementy Pampucha jsou upravené na body v bludišti, combo, dokončení a skóre.
- Verze sjednocena na v.1.1 (726), cache na v1.1-726 a Supabase realtime kanál na rak-public-live-v726.

## v.1.1 (724)
- Přidané měření výkonu zařízení přímo v Nastavení: appka změří FPS, nejhorší snímek, počet dropů a podle toho doporučí normální, odlehčený nebo Láďův turbo režim.
- Výsledek měření se ukládá lokálně a napojuje se do automatické detekce slabšího zařízení, takže appka umí po měření sama přidat Láďův režim bez ručního hledání.
- Nastavení má novou kartu Výkon zařízení s aktuálním režimem, důvody detekce, posledním měřením a rychlým přepnutím na Automatiku nebo Láďův režim.
- Diagnostika aplikace nově vypisuje skóre výkonu zařízení, doporučený profil a stav posledního měření.
- Verze sjednocena na v.1.1 (724), cache na v1.1-724 a Supabase realtime kanál na rak-public-live-v724.

## v.1.1 (723)
- Přidaná servisní část administrace: rychlý přehled počtů hráčů, statistik, profilového vzhledu, pozvánek, session a nových reportů.
- Administrace umí vynutit synchronizaci rozpisu/herních statistik, ruční kontrolu aktualizace PWA a bezpečný úklid prošlých pozvánek přes Supabase funkci.
- Online stav vpravo nahoře na dashboardu je nově klikací: vynutí synchronizaci rozpisu, herních profilů/statistik, profilového theme/pozadí a kontrolu nové verze/cache.
- Ověřeno napojení theme/pozadí na online profil: kvůli kompatibilitě se ukládá přes speciální řádek v game_stats s game_type __profile_ui, ne přes samostatnou tabulku.
- PWA update kontrola dostala veřejné helpery pro ruční kontrolu service workeru, cache statusu a precache repair z dashboardu i administrace.
- Verze sjednocena na v.1.1 (723), cache na v1.1-723 a Supabase realtime kanál na rak-public-live-v723.

## v.1.1 (722)
- Láďův režim dostal turbo výkonový profil pro slabší mobily: appka ukládá profil do datasetů, diagnostika ukazuje frame throttle, canvas DPR, resize throttle a úroveň profilu.
- Canvas hry v Láďově režimu běží šetrněji: requestAnimationFrame se brzdí přibližně na 30 FPS, delta čas se víc hlídá a canvas resize se necpe do každého snímku.
- Herní online refresh, idle render statistik a leaderboard cache jsou v Láďově režimu delší/klidnější, aby appka zbytečně netahala data a nepřekreslovala UI.
- CSS pojistka pro Láďův režim tvrdě vypíná náročné blur efekty, stíny, animace, přechody, filtry a skryté stránky dostávají content-visibility.
- Text v nastavení a diagnostika „O aplikaci“ popisují úspornější FPS a nový turbo profil.
- Verze sjednocena na v.1.1 (722), cache na v1.1-722 a Supabase realtime kanál na rak-public-live-v722.

## v.1.1 (721)
- Herní profily po ostrém spuštění začínají od nuly: lokální XP, odehrané hry, skóre a achievementy se resetují přes novou profileVersion 720, ale theme/pozadí profilu zůstává zachované.
- Přidán online reset ochranné vrstvy pro Supabase: staré game_stats/game_sessions před reset cutoffem se ignorují v žebříčcích/profilu a aplikace se je po online startu pokusí v Supabase vynulovat/označit jako reset.
- Ranky jsou výrazně těžší a XP přibývá pomaleji, aby postup po ostrém spuštění nebyl hned hotový.
- Rozšířené achievementy: více cílů pro jednotlivé hry, online hraní s někým, online výhry, Lodě, denní challenge, směna D a další směnové/časové výzvy.
- Časové hry kromě Reaction Testu zobrazují výsledky v sekundách; Reaction Test zůstává v milisekundách.
- Verze sjednocena na v.1.1 (721), cache na v1.1-721 a Supabase realtime kanál na rak-public-live-v721.

## v.1.1 (719)
- Lodě online: vypnuté scrollování v herní obrazovce, aby se hra chovala víc jako appka.
- Přepínač Moje flotila / Střílet na soupeře se nově zobrazuje i zakládajícímu hráči po přijetí soupeře, i když soupeř ještě připravuje flotilu.
- Doplněná čekací plocha pro soupeřovo pole, když je protihráč připojený, ale flotilu ještě nepotvrdil.
- Verze sjednocena na v.1.1 (719), cache na v1.1-719 a Supabase realtime kanál na rak-public-live-v719.

## v.1.1 (718)
- Lodě online: kód pozvánky je nově čistě číselný 4místný kód, aby seděl se Supabase normalizací a nehledala se špatná pozvánka.
- Opravené přijetí protihráče a ukládání stavu Lodí po připojení, aby hra nezůstávala na „Čekání na protihráče“.
- Ve hře se po načtení soupeřovy flotily zobrazuje přepínání Moje flotila / Střílet na soupeře.
- Tlačítko Vytvořit hru má čistý zaoblený styl bez hranatého ohraničení.
- Verze sjednocena na v.1.1 (718), cache na v1.1-718 a Supabase realtime kanál na rak-public-live-v718.

## v.1.1 (717)
- Lodě online: tlačítka Potvrdit flotilu a Zpět do menu jsou nově nad horním panelem s kódem.
- Horní panel Lodí je zhuštěný a pole Loď má víc prostoru, aby byl vidět celý název vybrané lodi.
- Zachované předchozí doladění: obrazovky Lodí jsou mírně níž, Vytvořit hru má zaoblený RaK styl a z přípravy i souboje se jde vrátit do menu Lodí.
- Verze sjednocena na v.1.1 (717), cache na v1.1-717 a Supabase realtime kanál na rak-public-live-v717.

## v.1.1 (715)
- Lodě online: ubrané prázdné místo nahoře a herní pole je lépe vycentrované.
- Opraven výběr lodí v přípravě flotily: první klik vybere loď, druhý klik ji přesune, potom jde znovu vybrat jiná loď.
- Příprava i čekání po potvrzení drží stejnou velikost hracího pole, aby se layout po potvrzení nezmenšoval.
- Verze sjednocena na v.1.1 (715), cache na v1.1-715 a Supabase realtime kanál na rak-public-live-v715.

## v.1.1 (709)
- Rozpisy: jmenné sloupky v běžných tabulkách zúžené o dalších cca 5 %, aby se lépe vešly na mobil.
- Hry: přidaná nová online-only hra Lodě online / Battleship. Vytvoření hry, přijetí 4místné pozvánky a tahy běží přes stejnou online session logiku jako Piškvorky.
- Lodě mají automaticky rozmístěnou flotilu, dvě 10×10 pole, střídání tahů, zásah/voda/potopení a výsledek se zapisuje do herního profilu až po dokončení hry.
- Supabase bridge nově umí vytvářet a ukládat game_sessions i pro jiný typ online hry než gomoku, bez rozbití Piškvorek.
- Verze sjednocena na v.1.1 (709), cache na v1.1-709 a Supabase realtime kanál na rak-public-live-v709.

## v.1.1 (705)
- Kalkulačky: číselné vstupy dostávají `inputmode=decimal`, aby se na mobilu otevírala číselná klávesnice místo běžné.
- Reaction Test: herní plocha je o něco snížená, aby šly pod ní vidět Top výsledky.
- Bubble Shooter: sjíždění řádků se během hry zrychluje výrazněji podle počtu střel.
- Sudoku: odstraněné označování/chyby jako nápověda; číselník je kompaktnější pod hrou.
- Bomberman: tlačítko Nová hra v koncovém overlayi má přímé napojení, aby reagovalo spolehlivěji.
- Celá app: zesílený app-like zákaz označování textu mimo vstupní pole.
- Verze sjednocena na v.1.1 (705), cache na v1.1-705 a Supabase realtime kanál na rak-public-live-v705.

## v.1.1 (704)

- Hry: Reaction Test má výrazně vyšší herní plochu, aby šla lépe trefovat na mobilu.
- Bubble Shooter má postupně častější sjíždění řádků podle počtu střel, takže obtížnost víc roste v průběhu hry.
- Sudoku má tlačítko Nová hra nad hrací plochou a číselník pevně pod hrou, užší na šířku tlačítek a vycentrovaný.
- Bomberman má spolehlivější tlačítko Nová hra v koncovém overlayi, aby se nechytalo pod herní joystick/redraw.
- Celá appka dostala tvrdší app-like zákaz označování textu mimo vstupní pole, aby se při dotykovém ovládání nechytal text na obrazovce.
- Verze sjednocena na v.1.1 (704), cache na v1.1-704 a Supabase realtime kanál na rak-public-live-v704.

## v.1.1 (703)

- Hry: společný QA/sjednocovací build pro všechny hotové hry najednou, bez přidávání dalších her.
- Sjednocené horní HUDy, aby se score/čas/pohyby/ostatní údaje držely v kompaktních řádcích i na menších mobilech.
- Top výsledky mají jednotné vlastní scroll boxy, aby nepřekážely hře a neposouvaly omylem celou stránku během hraní.
- Přidané finální touch-action/overscroll pojistky pro canvas a logické herní plochy, aby se při hraní nechtěně nehýbala stránka.
- Doladěné společné vizuální pojistky pro Sudoku číselník, Miny vlajky, Pexeso karty a Bomberman zdi/truhly.
- Přidána interní funkce runArcadeGamesFullAudit()/getArcadeGamesFullAudit() pro rychlou kontrolu napojení všech hlavních her.
- Verze sjednocena na v.1.1 (703), cache na v1.1-703 a Supabase realtime kanál na rak-public-live-v703.

## v.1.1 (701)

- Hry: jméno profilu a rank jsou nahoře dvě samostatná okénka místo jednoho společného badge.
- Rank modal: zavírací křížek je vycentrovaný v kulatém tlačítku.
- Bomberman: HUD Score/Příšerky/Bomby/Síla je zhuštěný do jednoho řádku.
- Bomberman: tlačítko Nová hra už není pod hrou během hraní; objeví se až po konci hry přímo přes plochu spolu se shrnutím.
- Verze sjednocena na v.1.1 (701), cache na v1.1-701 a Supabase realtime kanál na rak-public-live-v701.

## v.1.1 (700)
- Hry: jméno přihlášeného profilu se nově propisuje i přímo vedle ranku v horním řádku Her, aby nezmizelo při pozdějším přerenderování nebo starším CSS.
- Bomberman mini: panáček už se nepřekresluje celý při každém kroku; zůstává ve vrstvě a plynule přechází po jednotlivých políčkách místo teleportování.
- Bomberman joystick dál drží směr podle prstu, ale provádí vždy jen krok po mřížce.
- Verze sjednocena na v.1.1 (700), cache na v1.1-700 a Supabase realtime kanál na rak-public-live-v700.

## v.1.1 (699)
- Hry: horní profil v menu je zjednodušený zpět na jméno vlevo a klikací rank vpravo; průběh k dalšímu ranku zůstává dostupný v tabulce po klepnutí na rank.
- Bomberman mini: zdi a truhly/bedny jsou výraznější, čitelnější a mají pevnější kontrast v herním bludišti.
- Verze sjednocena na v.1.1 (699), cache na v1.1-699 a Supabase realtime kanál na rak-public-live-v699.

## v.1.1 (697)
- Miny: dlouhé podržení na poli nově přidá nebo sundá vlajku, krátký klik dál otevírá pole.
- Vlajka má výrazné zvýraznění přímo v herní mřížce a neotevírá pole omylem.
- Verze sjednocena na v.1.1 (697), cache na v1.1-697 a Supabase realtime kanál na rak-public-live-v697.

## v.1.1 (695)
- Sudoku: ve hře odstraněné Top výsledky i tlačítko obtížnosti, tlačítko Nová hra vrací zpět na menu s výběrem obtížnosti a číselník 1–9 je výrazně větší pro pohodlné klepání.
- Miny: přidané pojistky proti long-press/context menu chování, aby dlouhé podržení nedělalo vlajku ani systémové menu.
- Hry: klik na rank vedle jména v herním menu otevře přehled ranků a potřebných XP.
- Bomberman mini a Denní challenge přesunuté mezi hlavní/hotové hry; Bomberman má dotykové ovládání bez šipkových tlačítek.
- Verze sjednocena na v.1.1 (695), cache na v1.1-695 a Supabase realtime kanál na rak-public-live-v695.

## v.1.1 (693)
- Přidána Administrace → Reporty chyb: v odemčené administraci jde načíst reporty ze Supabase, rozkliknout detail a označit je jako Viděno / Hotovo / Ignorovat.
- Sekce Pošli mi chybu zůstává pro uživatele jednoduchá: jen typ, popis a tlačítko Odeslat; report se ukládá do Supabase nebo offline fronty.
- Sudoku, Minesweeper a Memory/Pexeso přesunuté mezi hlavní/hotové hry; mají mobile-first čistší vzhled, Top 5 ve vlastním scroll boxu a completed-only zápis statistik/XP.
- Přidané těžší achievementy pro Sudoku, Minesweeper a Memory/Pexeso.
- Verze sjednocena na v.1.1 (693), cache na v1.1-693 a Supabase realtime kanál na rak-public-live-v693.

## v.1.1 (690)
- Tetris: score/řádky/level přesunuté do pravého panelu pod náhled dalších 3 kostek, herní plocha může být vyšší a Top 5 je hned pod hrou.
- Space Shooter: Top 5 je pod hrou ve vlastním scroll boxu, loď se neteleportuje po klepnutí a hra dostala space-opera styl lodí/nepřátel, power-upy, vícesměrné střely, štít, rychlopalbu, silnější zbraň, bosse a nové achievementy za bosse/upgrady/výzbroj.
- Brick Breaker: Top 5 je ve vlastním scroll boxu pod hrou, plocha zůstává užší pro pohodlnější ovládání palcem a canvas blokuje nechtěný scroll stránky při hraní.
- Verze sjednocena na v.1.1 (690), cache na v1.1-690 a Supabase realtime kanál na rak-public-live-v690.


## v.1.1 (688)
- Tetris: odstraněné šikmé čáry z herní plochy, přidané jasnější ohraničení hracího pole a ukázka dalších 3 kostek vedle hry.
- Tetris / Space Shooter / Brick Breaker: horní score řádek je kompaktnější na jeden řádek a top výsledky jsou přesunuté pod herní plochu.
- Space Shooter: loď už se po klepnutí neteleportuje; pohyb je relativní jen při tažení prstem a střelba běží automaticky až při aktivním tažení.
- Brick Breaker: pálka už se po klepnutí neteleportuje, ovládá se relativním tažením; plocha je užší a drží pohodlnější šířku i na širších mobilech.
- Verze sjednocena na v.1.1 (688), cache na v1.1-688 a Supabase realtime kanál na rak-public-live-v688.

## v.1.1 (687)
- Hry / Aim Trainer a Reaction Test: odstraněný černý horní pruh nad HUDem a herní plochou u arcade her. Zůstává jen malé plovoucí tlačítko Zpět bez titulkového bloku.
- Reaction Test: stav „TEĎ!“ má výraznou změnu barvy reakčního pole podle aktuálního theme, aby byl signál jasně vidět.
- Verze sjednocena na v.1.1 (687), cache na v1.1-687 a Supabase realtime kanál na rak-public-live-v687.

## v.1.1 (685)
- Hry: Aim Trainer a Reaction Test přesunuté mezi hlavní/hotové hry vedle Piškvorek, 2048, Snake a Flappy Car.
- Aim Trainer přepracovaný pro dotyk: větší plocha, targety přes theme/pozadí, čistý HUD, start/konec overlay a zápis jen po dokončeném kole.
- Reaction Test přepracovaný pro mobil: velká reakční karta, 5kolový test, čistý HUD bez zbytečného titulku a zápis jen po dokončené sérii.
- Přidané těžší achievementy pro Aim a Reaction: skóre, combo, přesnost, počet dokončení, rychlé reakce, průměr a čisté série.
- Verze sjednocena na v.1.1 (685), cache na v1.1-685 a Supabase realtime kanál na rak-public-live-v685.

## v.1.1 (684)
- Flappy Car: přepracovaná do mobile-first podoby s čistým touch ovládáním přes celou herní plochu, overlayem start/konec a tlačítkem Nová hra.
- Flappy Car: canvas kreslí pozadí, překážky i auto podle aktuálního theme/pozadí aplikace místo tvrdého zeleného vzhledu.
- Flappy Car: přesunutá mezi hlavní/hotové hry vedle Piškvorek, 2048 a Snake; ve složce Ve vývoji už nezůstává.
- Flappy Car: přidané další achievementy pro score 25/50/75/100/150 a dokončené jízdy 25/100.
- Statistiky Flappy Car se zapisují jen po dokončené jízdě, aby otevření/zavření hry nepřidávalo XP ani achievementy.
- Verze sjednocena na v.1.1 (684), cache na v1.1-684 a Supabase realtime kanál na rak-public-live-v684.

## v.1.1 (683)
- Piškvorky: finální oprava zeleno-černé hrací plochy. Přidaná runtime pojistka `tttThemeBoardPatch`, která se vloží až po starém interním `tttStyles` a přebije staré zelené pozadí, mřížku i pseudo-vrstvy.
- Piškvorky: hrací plocha nově používá neutrální glass/panel vrstvu navázanou na globální theme a pozadí aplikace; barvy X/O zůstaly beze změny.
- Verze sjednocena na v.1.1 (683), cache na v1.1-683 a Supabase realtime kanál na rak-public-live-v683.

## v.1.1 (682)
- Piškvorky: finální přepis hrací plochy tak, aby už nepřebíjela zvolený theme/pozadí tvrdým zeleno-černým vzhledem; X/O barvy zůstaly beze změny.
- 2048 a Snake: horní trojice HUD polí je přes celou šířku panelu.
- Snake: swipe reaguje dřív už při pohybu prstem, ne až po puštění; směr se pořád zamyká jen na vodorovnou nebo svislou osu.
- Verze sjednocena na v.1.1 (682), cache na v1.1-682 a Supabase realtime kanál na rak-public-live-v682.

## v.1.1 (681)
- Piškvorky a Snake: herní plochy přeladěné víc podle aktuálního theme/pozadí; barvy X/O v Piškvorkách zůstaly beze změny.
- Snake: HUD zjednodušený na Score / Délka / Nejlepší a odstraněné pole „Hraje se“.
- Snake: zpevněná skutečná 18×18 mřížka a přísnější osa swipu pro čistě vodorovný/svislý směr.
- Achievementy: přidané chytré podmínky podle času, dne, víkendu, směny a hraní napříč směnami.
- Verze sjednocena na v.1.1 (681), cache na v1.1-681 a Supabase realtime kanál na rak-public-live-v681.

## v.1.1 (680)
- Hry: horní herní profil zjednodušený na jméno, rank a procenta k dalšímu ranku; blok Vzhled her odstraněný, protože Theme a Pozadí se nastavují globálně v Nastavení.
- Piškvorky, 2048 a Snake víc drží aktuální theme/pozadí aplikace i po spuštění herního módu; barvy X/O v Piškvorkách zůstávají beze změny.
- 2048 a Snake mají čistší herní obrazovku bez horního titulkového bloku; hrací plocha může být výš a nepůsobí tak stísněně.
- Snake: zpřesněné dotykové ovládání jen na jednu osu, aby had jel čistě horizontálně nebo vertikálně a nereagoval zmateně na šikmé tahy.
- Statistiky, XP a achievementy se mají počítat jen z dokončených her; XP/ranky jsou výrazně těžší a achievementy jsou rozdělené do rozbalovacích skupin Hotové / Rozdělané / Nenačaté.
- Verze sjednocena na v.1.1 (680), cache na v1.1-680 a Supabase realtime kanál na rak-public-live-v680.

## v.1.1 (679)
- Snake přepracovaný jako mobile-first hra: čistý HUD, větší dotyková plocha a ovládání hlavně swipem po herní ploše.
- Snake už se při každém kroku celý nepřekresluje; deska se vytvoří jednou a během hry se aktualizují jen buňky, skóre a výsledkový overlay.
- Odstraněný joystick z herní obrazovky Snake; zůstává swipe a tlačítko Nová hra, aby obrazovka byla čistší podobně jako u 2048.
- Snake je přesunutý mezi hlavní/hotové hry vedle Piškvorek a 2048; ve složce „Ve vývoji“ zůstávají jen rozpracované hry.
- Verze sjednocena na v.1.1 (679), cache na v1.1-679 a Supabase realtime kanál na rak-public-live-v679.

## v.1.1 (678)
- 2048: odstraněné viditelné nápovědní pole pod HUDem a odstraněné náhradní ovládací šipky; hra zůstává ovládaná swipem po ploše.
- Herní obrazovka 2048 má lepší horní safe-area odsazení, aby se název nepřekrýval s časem/notchem na iPhonu.
- 2048 je přesunutá mezi hlavní/hotové hry vedle Piškvorek; ve složce „Ve vývoji“ zůstávají jen rozpracované hry.
- Piškvorky dostaly stejné safe-area pravidlo a čistší start obrazovku bez zbytečných vysvětlujících poznámek; barvy X a O zůstaly beze změny.
- Verze sjednocena na v.1.1 (678), cache na v1.1-678 a Supabase realtime kanál na rak-public-live-v678.

## v.1.1 (677)
- Opravena 2048: hra už nepadá do arcade rendereru bez vlastního vykreslovače a otevírá se přes původní 2048 shell s novým mobilním ovládáním.
- Na základní obrazovku Her přidaný rychlý blok Vzhled her s aktuálním Theme a Pozadím a tlačítky pro otevření stejného nastavení jako v aplikaci.
- Verze sjednocena na v.1.1 (677), cache na v1.1-677 a Supabase realtime kanál na rak-public-live-v677.

## v.1.1 (676)
- 2048 je přepracovaná jako mobil-first hra: nový HUD, větší a čitelnější herní plocha, výsledkový overlay a náhradní šipkové ovládání.
- Swipe ovládání je tolerantnější na prst, uzamyká posun stránky při tahu po herní ploše a lépe bere i méně přesné diagonální pohyby.
- Logika 2048 nově hlídá konec hry i při tahu, který už nejde provést, zvýrazňuje nové/sloučené kameny a dává jemnou haptickou odezvu tam, kde ji zařízení podporuje.
- Sekce „O aplikaci“ má zkrácený aktuální přehled, aby se historie buildů držela stručněji a nepřerůstala do dlouhého changelogu.
- Verze sjednocena na v.1.1 (676), cache na v1.1-676 a Supabase realtime kanál na rak-public-live-v676.

## v.1.1 (675)
- Piškvorky online: tlačítka „Kopírovat odkaz“ a „Sdílet“ jsou odstraněná z online menu před startem.
- Kopírování a sdílení pozvánky zůstává jen přímo ve hře v čekacím okně na protihráče.
- Úvodní shell Piškvorek už nekopíruje obecný odkaz; navádí na vytvoření online pozvánky až ve hře.
- Manifest PWA dostal `launch_handler` s `navigate-existing`, aby podporované prohlížeče mohly otevřít pozvánku v nainstalované aplikaci, pokud je odkaz v rámci scope.
- Verze sjednocena na v.1.1 (675), cache na v1.1-675 a Supabase realtime kanál na rak-public-live-v675.

## v.1.1 (674)
- Kalkulačky: opravené rozjetí názvu Soustruhy po zvětšení původních ikon.
- Dlaždice kalkulaček mají znovu pevný sloupec pro ikonu vlevo a text bezpečně uvnitř druhého sloupce.
- Verze sjednocena na v.1.1 (674), cache na v1.1-674 a Supabase realtime kanál na rak-public-live-v674.

## v.1.1 (672)
- Kalkulačky: vrácené původní linkové ikony Soustruhy / Frézky / Brusy, jen jsou větší a bez pozadí.
- Nastavení profilu: po přihlášení je vidět jen přihlášený profil a tlačítko Odhlásit; přihlašovací pole se ukáže až po odhlášení.
- Odstraněné zbytečné texty pod přihlášením v nastavení profilu.
- Verze sjednocena na v.1.1 (672), cache na v1.1-672 a Supabase realtime kanál na rak-public-live-v672.

## v.1.1 (669)
- Piškvorky: při přepnutí na Proti AI nebo Na jednom mobilu se už nepřebírá online rozehraná hra.
- Tlačítko Hrát proti AI / Hrát na mobilu zakládá vždy čistou novou partii.
- Volba Pokračovat v rozehrané hře se už u AI/lokální hry nezobrazuje kvůli online partii.
- Profily při online refreshi přebírají i vzdálené TTT statistiky z game_stats, aby byly vidět hry ostatních hráčů.
- Nová hra ve výsledkovém panelu má finálně bílý, kontrastní text.
- Vzájemné skóre online Piškvorek dál běží přes game_sessions a vítěz další online hru začíná prvním tahem.
- Verze sjednocena na v.1.1 (669), cache na v1.1-669 a Supabase realtime kanál na rak-public-live-v669.

## v.1.1 (668)
- Piškvorky online: kód pozvánky se při čekání zobrazuje velkým panelem přes hrací pole a zmizí po přijetí soupeřem.
- Horní řádek online hry nově ukazuje vzájemné skóre ve formátu hráč X 2:2 hráč O.
- Opravené zapisování online výsledků do `game_stats` pro oba hráče, aby se odehrané hry objevily i ve Statistikách a Profilech na druhém mobilu.
- Tlačítko Nová hra ve výsledkovém panelu má bílý čitelný text.
- Smazané staré online výhry proti AI z tabulky `gomoku_wins`, protože patřily k jiné obtížnosti.
- Verze sjednocena na v.1.1 (668), cache na v1.1-668 a Supabase realtime kanál na rak-public-live-v668.

## v.1.1 (665)
- Piškvorky online: kód pozvánky je nově jednoduchý 4místný číselný kód.
- Opravené ukládání online session v Supabase bez `upsert(... onConflict: invite_id)`, protože tabulka nemusí mít unikátní constraint na `invite_id`. Nově se session nejdřív dohledá a potom update/insert.
- Opravená rekurze `closeGameShellProxy`, která způsobovala `Maximum call stack size exceeded`.
- Výsledkové tlačítko „Nová hra“ je výraznější a čitelnější.
- Online statistiky her se po zápisu obnovují s vynuceným refreshem, aby spoluhráč viděl aktuálnější odehrané hry.
- Doplněn `mobile-web-app-capable` meta tag a Phase 1 audit už nekontroluje staré neexistující `#stats`.
- Verze sjednocena na v.1.1 (665), cache na v1.1-665 a Supabase realtime kanál na rak-public-live-v665.

## v.1.1 (664)
- Piškvorky: tlačítko Nová hra je přesunuté až do výsledkového panelu po skončení hry.
- Piškvorky: X/O mají vynucené fosforové barvy přímo při renderu i finálním CSS overridem: X červené, O zelené.
- Piškvorky: spodní footer s tlačítkem Nová hra je skrytý/odstraněný z běžné hry.
- Verze sjednocena na v.1.1 (664), cache na v1.1-664 a Supabase realtime kanál na rak-public-live-v664.

## v.1.1 (663)
- Piškvorky: doplněný silnější pravý uzavírací okraj hrací mřížky přes samostatnou overlay linku, aby byl vidět konec krajních políček.
- Piškvorky: X změněno na fosforově svítící červenou a O na fosforově svítící zelenou.
- Výherní políčka si nechávají výrazné zvýraznění, ale X/O už zůstávají barevně rozlišené.

- Piškvorky: doplněná pravá krajní čára a zpevněná souvislá mřížka bez mezer mezi buňkami.
- X/O mají nové výrazné fosforové barvy: X tyrkysově neonové, O růžovo-fialové neonové.
- Přidaná velká výsledková hláška přes hrací pole při výhře, prohře nebo remíze.

- Piškvorky: opravená skutečná příčina mezer — globální iOS/glass styl tlačítek přepisoval buňky hry.
- Klikací pole jsou teď natvrdo bez glass pozadí, bez stínů, bez marginů a dotýkají se přesně hranami.
- Čáry mřížky jsou kreslené přímo hranami buněk, takže hrací plocha vypadá jako souvislý čtverečkovaný papír v RaK stylu.

- Piškvorky: čáry jsou teď přímo svázané s klikacími poli, takže mřížka a klikací zóny se nerozcházejí.
- Mřížka se už nekreslí samostatnou vrstvou na pozadí, ale přímo hranami buněk.
- Zvětšené X/O a ponechané kratší texty žebříčku „Kdo porazil AI“ / „Žebříček online .“.

- Piškvorky: hrací plocha je opravená na skutečnou souvislou mřížku z čar bez viditelných klikacích čtverců/dlaždic.
- Klikací buňky jsou průhledné nad mřížkou; čáry tvoří políčka a značky X/O se kreslí dovnitř polí.
- Odstraněný celý popisný blok „AI režim“.
- Text žebříčku změněn na „Kdo porazil AI“ a „Žebříček online .“.
- AI má tvrdší obranu proti dřívějším hrozbám a fork situacím; výherní pětice, výsledková karta, zápis skóre a shrnutí partie zůstávají zachované.
- Verze sjednocena na v.1.1 (663), cache na v1.1-663 a Supabase realtime kanál na rak-public-live-v663.

## v.1.1 (658)
- Piškvorky mají souvislou RaK mřížku z jedné vrstvy čar bez mezer mezi buňkami; klikací pole jsou průhledná a neviditelná.
- AI je přitvrzená přes danger-reduction a anti-fork kontrolu, aby lépe blokovala dvojité hrozby a přípravy na pětici.
- Přidaná výsledková hláška se shrnutím tahů, času, X/O počtu a stavem zápisu výsledku.
- Výherní znaky jsou zvýrazněné výraznějším neonovým glow efektem a kroužkem kolem znaku.
- Verze sjednocena na v.1.1 (658), cache na v1.1-658 a Supabase realtime kanál na rak-public-live-v658.

## v.1.1 (657)
- Piškvorky: klikací buňky jsou nově opticky uvnitř čtverců, ne na křížení čar.
- Mřížka je kreslená hranami průhledných buněk, takže nejsou vidět žádné extra klikací dlaždice.
- X/O jsou zvětšené a čitelnější pro pohodlnější hraní na mobilu.
- Hratelnost, AI, pravidla 10 × 18 a výhra 5 v řadě zůstávají zachované.
- Verze sjednocena na v.1.1 (657), cache na v1.1-657 a Supabase realtime kanál na rak-public-live-v657.

## v.1.1 (656)
- Piškvorky jsou nově ve stylu aplikace: čistá tmavá RaK mřížka z čar bez papírového vzhledu, bez mezer a bez dlaždic.
- X/O zůstávají dobře čitelné v neonovém app stylu, výherní řada a poslední tah mají jemné zvýraznění.
- AI je tvrdší: lépe hodnotí vlastní útok, blokování nebezpečných hrozeb, fork situace a krátké časově hlídané hledání.
- Automaticky otestováno herním průchodem AI logiky hraným na výhru; test po 100 tazích neskončil výhrou hráče ani zamrznutím.
- Verze sjednocena na v.1.1 (656), cache na v1.1-656 a Supabase realtime kanál na rak-public-live-v656.


## v.1.1 (654)

- Navazuje na potvrzenou verzi v.1.1 (651).
- Přidán Supabase strukturální audit `getSupabaseStructureHealth()` pro kontrolu klientského kontraktu tabulek, realtime napojení, queue typů a helperů.
- Audit drží checklist očekávaných RLS/GRANT/policies signálů pro tabulky používané aplikací: rozpisy, machine_settings, herní profily, session, statistiky a legacy gomoku_wins.
- `getSupabaseHardeningStatus()` nově vrací i `structureHealth`, takže je kontrola vidět společně se Supabase frontou, cache a výkonem.
- Finální readiness summary a post-stabilizační kontrola nově zahrnují bod Supabase struktura.
- Diagnostika v O aplikaci nově ukazuje Supabase struktura/RLS a GRANT/policies checklist.
- Vzhled, výpočty a zamčené části beze změny.
- Verze sjednocena na v.1.1 (654), cache na v1.1-654 a Supabase realtime kanál na rak-public-live-v654.

## v.1.1 (651)

- Navazuje na potvrzenou verzi v.1.1 (650).
- Přidán Supabase read/write optimizer pro plynulejší provoz před laděním her.
- Sdílené čtení se nově používá i pro announcements, machine_settings, rotation_state, rotation_entries a gomoku_wins, takže stejné paralelní dotazy se slučují.
- Přidán optimalizovaný zápis runOptimizedSupabaseWrite(): stejné souběžné zápisy se sdílí a krátce opakované totožné zápisy se přeskočí jako hotové.
- Optimalizace je nasazená pro machine_settings, rozpisy, rotation_state, gomoku_wins, game_stats, game_ui_settings a game_sessions.
- Diagnostika Supabase výkonu nově ukazuje write guard: kontroly, starty, joiny, skipy, aktivní zápisy a peak.
- Vzhled, výpočty a zamčené části beze změny.
- Verze sjednocena na v.1.1 (651), cache na v1.1-651 a Supabase realtime kanál na rak-public-live-v651.

## v.1.1 (649)
- Post-stabilization pokračování po dokončené Fázi 10: přidán audit Láďova režimu a výkonových pojistek.
- Přidán `getLadaPerformanceHealth()` a `runLadaPerformanceAudit()` pro kontrolu aktivního odlehčeného režimu, `reduceMotion`, canvas DPR limitu, vzorků blur efektů a animací.
- Readiness summary nově zahrnuje kontrolu `Láďův režim výkon`, aby šlo rychleji poznat, jestli odlehčený režim opravdu drží výkonový profil.
- Diagnostika v O aplikaci nově ukazuje řádky Láďův režim výkon a Láďův režim efekty.
- Přidaná finální CSS pojistka pro `ladaMode` / `lowEndDevice`: vypíná náročný backdrop blur, animace, přechody, pseudo glass vrstvy a zbytečné filtry u obrázků/canvasu.
- Běžný režim, výpočty a zamčené části beze změny.
- Verze sjednocena na v.1.1 (649), cache na v1.1-649 a Supabase realtime kanál na rak-public-live-v649.

## v.1.1 (648)
- Post-stabilization safe helper guard navazuje na dokončenou Fázi 10 a baseline watch.
- Přidán `getPostStabilizationSafeHelperHealth()`, který hlídá dostupnost klíčových safe DOM / safe URL / audit helperů po načtení aplikace.
- Readiness summary nově zahrnuje kontrolu safe helperů, aby šla rychleji odhalit regrese po dalších úpravách.
- Diagnostika v O aplikaci nově ukazuje řádek Post-stabilizace helpery.
- Vzhled, výpočty a zamčené části beze změny.
- Verze sjednocena na v.1.1 (648), cache na v1.1-648 a Supabase realtime kanál na rak-public-live-v648.

## v.1.1 (647)
- Post-stabilization baseline watch navazuje na dokončenou Fázi 10.
- Přidán `getPostStabilizationBaselineHealth()`, který hlídá, že finální stabilizace zůstává kompletní, readiness summary běží a verze aplikace sedí.
- Diagnostika v O aplikaci nově ukazuje řádek Post-stabilizace s režimem a počtem bodů ke kontrole.
- Vzhled, výpočty a zamčené části beze změny.
- Verze sjednocena na v.1.1 (647), cache na v1.1-647 a Supabase realtime kanál na rak-public-live-v647.

## v.1.1 (646)
- Fáze 10 — final stabilization dokončena na 100 %.
- Přidán finální readiness summary audit `getPhaseTenRuntimeReadinessHealth()`, který sjednocuje výsledky kontrol verze, Fáze 9, PWA/SW, storage, modulů, navigace, page shellu, akcí/odkazů a formulářů.
- Diagnostika v O aplikaci nově ukazuje souhrn finální připravenosti včetně počtu splněných kontrol a případných bodů ke kontrole.
- Vzhled, výpočty a zamčené části beze změny.
- Verze sjednocena na v.1.1 (646), cache na v1.1-646 a Supabase realtime kanál na rak-public-live-v646.

## v.1.1 (644)
- Fáze 10 — final stabilization posunuta cca na 84 %.
- Přidán runtime audit `getPhaseTenActionHealth()` pro kontrolu `data-action` prvků, allowlistu, povinných akcí, datových cílů a externích dashboard odkazů.
- Legacy self-test už také nekontroluje staré neexistující `#stats`, ale reálný `#rotaceStatsPanel`, aby nevznikal falešný zápis do error logu.
- Diagnostika v O aplikaci nově ukazuje stav akcí/odkazů.
- Vzhled, výpočty a zamčené části beze změny.
- Verze sjednocena na v.1.1 (644), cache na v1.1-644 a Supabase realtime kanál na rak-public-live-v644.

## v.1.1 (643)
- Fáze 10 — final stabilization pokračuje auditem page shellu a hlavních panelů aplikace.
- Přidán `getPhaseTenPageShellHealth()`, který hlídá hlavní stránky, aktivní stránku a klíčové panely bez zásahu do UI.
- Runtime audit nově sleduje počet stránek, počet aktivních stránek, přítomnost hlavních dashboard/rotace/kalkulačka/herních panelů a případné chybějící prvky.
- Finální audit už nekontroluje staré neexistující `#stats`, ale reálný panel `#rotaceStatsPanel`, aby diagnostika neházela falešné varování.
- Diagnostika v O aplikaci nově ukazuje stav page shellu, počet stránek, aktivní stránku, počet hlavních panelů a chybějící části.
- Vzhled, výpočty ani zamčené části aplikace beze změny.
- Verze sjednocena na v.1.1 (643), cache na v1.1-643 a Supabase realtime kanál na rak-public-live-v643.

## v.1.1 (642)
- Fáze 10 — final stabilization pokračuje auditem načtených modulů a scriptů.
- Přidán `getPhaseTenScriptLoadHealth()`, který kontroluje, jestli jsou klíčové JS moduly aplikace opravdu načtené.
- Runtime audit nově sleduje chybějící moduly, duplicitně načtené lokální moduly a neočekávané lokální JS soubory.
- Diagnostika v O aplikaci nově ukazuje stav načtení modulů, počet chybějících modulů, duplicity a případné lokální JS navíc.
- Vzhled, výpočty ani zamčené části aplikace beze změny.
- Verze sjednocena na v.1.1 (642), cache na v1.1-642 a Supabase realtime kanál na rak-public-live-v642.

## v.1.1 (640)
- Fáze 10 — final stabilization pokračuje storage/runtime health auditem.
- Přidán `getPhaseTenStorageHealth()`, který bezpečně ověřuje dostupnost a zapisovatelnost `localStorage` bez změny dat aplikace.
- Runtime audit nově sleduje počet položek v úložišti, větší uložené klíče, online stav a viditelnost stránky.
- Diagnostika v O aplikaci nově ukazuje stav localStorage, počet položek a počet větších klíčů.
- Vzhled, výpočty ani zamčené části aplikace beze změny.
- Verze sjednocena na v.1.1 (640), cache na v1.1-640 a Supabase realtime kanál na rak-public-live-v640.

## v.1.1 (639)
- Fáze 10 — final stabilization pokračuje bezpečným runtime auditem DOM a stavového logu.
- Audit nově hlídá duplicitní `id` prvky v aktuálním DOM, aby se rychleji odhalily regresní chyby v navigaci, panelech a modalech.
- Přidány pomocné kontroly `getPhaseTenDuplicateDomIds()` a `getPhaseTenErrorLogCount()` pro přehled stavu bez zásahu do běhu aplikace.
- Diagnostika v O aplikaci nově ukazuje počet duplicitních DOM ID a velikost error logu.
- Vzhled, výpočty ani zamčené části aplikace beze změny.
- Verze sjednocena na v.1.1 (639), cache na v1.1-639 a Supabase realtime kanál na rak-public-live-v639.

## v.1.1 (638)
- Fáze 10 — final stabilization zahájena prvním bezpečným runtime auditem.
- Přidán `runPhaseTenFinalStabilizationAudit()`, který po startu kontroluje klíčové DOM prvky, bezpečné helpery, verzi aplikace, stav Fáze 9 a dostupnost datové optimalizace.
- Nový `getFinalStabilizationStatus()` ukládá výsledek posledního auditu pro diagnostiku a rychlejší hledání regresí.
- Diagnostika v O aplikaci nově ukazuje řádky Finální stabilizace, počet auditů, případné chybějící části a stav PWA mismatch.
- Vzhled, výpočty ani zamčené části aplikace beze změny.
- Verze sjednocena na v.1.1 (638), cache na v1.1-638 a Supabase realtime kanál na rak-public-live-v638.

## v.1.1 (637)
- Fáze 9 — security/render cleanup dokončena na 100 %.
- Přidán centrální bezpečný helper pro přepis/mazání DOM dětí: `replaceElementChildrenSafely()` a `clearElementChildrenSafely()`.
- `setElementChildrenIfChanged()` a `setSelectOptionsIfChanged()` používají jednotný safe DOM replace postup místo přímého `replaceChildren()` bez evidence.
- Diagnostika v O aplikaci nově ukazuje safe DOM replace/clear/fallback počítadla.
- Vzhled, výpočty ani zamčené části aplikace beze změny.
- Verze sjednocena na v.1.1 (637), cache na v1.1-637 a Supabase realtime kanál na rak-public-live-v637.

## v.1.1 (636)
- Fáze 9 — security/render cleanup pokračuje dalším bezpečným dočištěním bez změny vzhledu a výpočtů.
- Fallback render výběrových polí nově maže staré položky přes DOM místo `innerHTML = ""`.
- `setSelectOptionsIfChanged()` má bezpečnější nouzovou větev pro `<select>` prvky a dál vytváří položky přes `createElement` + `textContent`.
- Kontrola měsíce v administraci rozpisů (`overwriteMonth`) má bezpečnější fallback a zachovává vybranou hodnotu, když existuje.
- Fáze 9 posunuta přibližně na 94 %.
- Verze sjednocena na v.1.1 (636), cache na v1.1-636 a Supabase realtime kanál na rak-public-live-v636.

## v.1.1 (635)
- Fáze 9 — security/render cleanup pokračuje dalším bezpečným krokem bez změny vzhledu a výpočtů.
- Detail vybraného jména ve Statistikách se nově skládá přes DOM prvky a `textContent` místo přímého HTML renderu.
- Detail vybraného stroje ve Statistikách se také skládá bezpečněji přes DOM prvky a `textContent`.
- Souhrnné dlaždice a tabulka ve statistikách zachovávají stejné třídy, texty i pořadí sloupců.
- Fáze 9 posunuta přibližně na 90 %.
- Verze sjednocena na v.1.1 (635), cache na v1.1-635 a Supabase realtime kanál na rak-public-live-v635.

## v.1.1 (634)
- Fáze 9 — security/render cleanup pokračuje dalším bezpečným krokem bez změny vzhledu a výpočtů.
- Dlaždice jmen a strojů ve Statistikách se nově skládají přes DOM prvky a `textContent` místo přímého `innerHTML` renderu.
- Aktivní zvýraznění, klikání i ovládání přes klávesnici zůstává stejné.
- `statsNameGrid` a `statsMachineGrid` používají bezpečný `setElementChildrenIfChanged()` helper a při stejném obsahu zbytečně nepřekreslují dlaždice.
- Fáze 9 posunuta přibližně na 84 %.
- Verze sjednocena na v.1.1 (634), cache na v1.1-634 a Supabase realtime kanál na rak-public-live-v634.

## v.1.1 (633)
- Fáze 9 — security/render cleanup pokračuje dalším bezpečným krokem bez změny vzhledu a výpočtů.
- Modal směn v Rotaci se už neskládá přes `innerHTML`, ale přes DOM prvky a `textContent`.
- Tabulka směn v modalu zachovává stejné sloupce Datum / Směna / Cíl i zvýraznění aktuálního řádku.
- Základní shell modalu se nově vytváří přes DOM místo vkládání HTML řetězce.
- Fáze 9 posunuta přibližně na 78 %.
- Verze sjednocena na v.1.1 (633), cache na v1.1-633 a Supabase realtime kanál na rak-public-live-v633.

## v.1.1 (632)
- Fáze 9 — security/render cleanup pokračuje dalším bezpečným krokem bez změny vzhledu a výpočtů.
- Jmenné dlaždice v Rotaci se už neskládají přes `innerHTML`, ale přes DOM prvky a `textContent`.
- Aktivní výběr jména, klikání i ovládání klávesnicí zůstává zachované.
- `namesGrid` nově používá bezpečný `setElementChildrenIfChanged()` helper a při stejném obsahu zbytečně nepřekresluje.
- Fáze 9 posunuta přibližně na 72 %.
- Verze sjednocena na v.1.1 (632), cache na v1.1-632 a Supabase realtime kanál na rak-public-live-v632.

## v.1.1 (631)
- Fáze 9 — security/render cleanup pokračuje dalším bezpečným krokem bez změny vzhledu a výpočtů.
- Kontrola měsíce v administraci rozpisů se už neskládá přes HTML řetězec, ale přes bezpečné DOM prvky a `textContent`.
- Našeptávače jmen v administraci rozpisů nově vytvářejí `<option>` prvky přes DOM místo vkládání HTML.
- Dynamické texty jmen a dnů zůstávají stejné, jen se bezpečněji zapisují do stránky.
- Fáze 9 posunuta přibližně na 66 %.
- Verze sjednocena na v.1.1 (631), cache na v1.1-631 a Supabase realtime kanál na rak-public-live-v631.

## v.1.1 (630)
- Fáze 9 — security/render cleanup pokračuje dalším bezpečným krokem bez změny vzhledu a výpočtů.
- Výběr měsíce ve statistikách už se neskládá přes HTML řetězec, ale přes bezpečné DOM `option` prvky.
- `monthSelect` nově používá společný `setSelectOptionsIfChanged()` helper, takže se při stejných datech zbytečně nepřepisuje.
- Fallback bez helperu také používá `textContent` místo vkládání HTML.
- Fáze 9 posunuta přibližně na 60 %.
- Verze sjednocena na v.1.1 (630), cache na v1.1-630 a Supabase realtime kanál na rak-public-live-v630.

## v.1.1 (629)
- Fáze 9 — security/render cleanup pokračuje dalším bezpečným krokem bez změny vzhledu a výpočtů.
- Přidán allowlist pro externí URL používané dlaždicemi aplikace.
- Externí odkazy se nově normalizují přes bezpečný helper a hlídají povolené domény.
- Dashboard odkazy na jídelní lístek a Eportal mají bezpečně synchronizované `href`, `target` a `rel`.
- Diagnostika v O aplikaci ukazuje URL allowlist a bezpečné href zápisy/skipy.
- Fáze 9 posunuta přibližně na 54 %.
- Verze sjednocena na v.1.1 (629), cache na v1.1-629 a Supabase realtime kanál na rak-public-live-v629.

## v.1.1 (628)
- Fáze 9 — security/render cleanup pokračuje dalším opatrným krokem bez změny vzhledu a výpočtů.
- Přidán společný helper `setElementChildrenIfChanged()` pro bezpečnější skládání DOM uzlů přes `textContent` místo přímého HTML tam, kde stačí čistý text.
- Brusy / horní info panel stroje a indexu se nově skládá přes DOM uzly, takže text stroje/indexu už nejde vložit jako HTML.
- Diagnostika O aplikaci nově ukazuje i safe DOM build/skip, aby bylo vidět, kdy se bezpečný DOM render skutečně provedl a kdy se přeskočil.
- Fáze 9 posunuta přibližně na 48 %.
- Verze sjednocena na v.1.1 (628), cache na v1.1-628 a Supabase realtime kanál na rak-public-live-v628.

## v.1.1 (627)
- Fáze 9 — security/render cleanup pokračuje dalším bezpečným krokem.
- Delegované klikací/klávesové akce přes `data-action` nově prochází allowlist guardem; neznámé nebo divně zapsané akce se ignorují a zapisují do diagnostiky.
- Diagnostika O aplikaci nově ukazuje kontroly/blokace delegovaných akcí a režim `allowlist-data-action`.
- Verze sjednocena na v.1.1 (627), cache na v1.1-627 a Supabase realtime kanál na rak-public-live-v627.

## v.1.1 (626)
- Dashboard / Kalendář zkracuje zápis ISO kalendářního týdne na formát `21.KT`, aby se za něj vešly poznámky jako Brusy- spálení nebo Roznýtování- laborka.
- Výpočet ISO týdne zůstává stejný; mění se jen text zobrazený v kartě kalendáře.
- Verze sjednocena na v.1.1 (626), cache na v1.1-626 a Supabase realtime kanál na rak-public-live-v626.

## v.1.1 (625)
- Dashboard / Kalendář nově ukazuje skutečný ISO kalendářní týden; pro 19.5.2026 vychází týden 21.
- Původní výrobní týden byl nahrazen kalendářním týdnem, aby v tom nebyl zmatek.
- Poznámky „Brusy- spálení“ a „Roznýtování- laborka“ zůstávají nezávislé na směně D a řídí se kalendářem/ranní směnou.
- Verze sjednocena na v.1.1 (625), cache na v1.1-625 a Supabase realtime kanál na rak-public-live-v625.

## v.1.1 (624)
- Brusy / TBKR07 / AH: doba orovnání změněna na 6m00s / 360 s; čas výroby zůstává 1m03s a orovnává po 88 ks.
- Online hodnota v Supabase `machine_settings` pro `TBKR07-AH` byla přepsaná na 360 s i ve `settings_json`.
- Opraveno `permission denied for table machine_settings`: doplněný databázový GRANT pro zápis a samostatné RLS policy pro INSERT/UPDATE z appky.
- Lokální fallback v appce má stejnou hodnotu jako online data, aby se po offline startu nevracelo starých 6m40s.
- Verze sjednocena na v.1.1 (624), cache na v1.1-624 a Supabase realtime kanál na rak-public-live-v624.

## v.1.1 (623)
- Dashboard / Kalendář nově ukazuje aktuální výrobní týden; aktuální nastavení vychází pro 19.5.2026 jako týden 19.
- Každé pondělí během ranní směny se v kalendáři ukáže poznámka „Brusy- spálení“.
- Každou první ranní směnu v měsíci se v kalendáři ukáže poznámka „Roznýtování- laborka“.
- Obě nové poznámky se řídí kalendářem/ranní směnou a nejsou navázané na to, jestli má zrovna směnu D.
- Verze sjednocena na v.1.1 (623), cache na v1.1-623 a Supabase realtime kanál na rak-public-live-v623.

## v.1.1 (622)
- Opraveny parametry pro Brusy: TBKR07 / AH má čas výroby 1m03s, orovnává po 88 ks a doba orovnání je 6m40s.
- Opraveno načítání uložených parametrů Brusů: výpočty už hledají stejné klíče stroj/index, jaké ukládá nastavení strojů (`TBKR07-AH` místo staré varianty s podtržítkem).
- Výpočet Brusů nově umí použít hodnoty z horních sloupců `cycle_time`, `speed`, `dress_count`, `dress_time` i ze `settings_json`, takže nespadne na staré výchozí hodnoty.
- Supabase RLS pro `machine_settings` upravená tak, aby šlo ukládat nastavení strojů z appky a nepadalo to na access denied.
- Verze sjednocena na v.1.1 (622), cache na v1.1-622 a Supabase realtime kanál na rak-public-live-v622.

## v.1.1 (621)
- Fáze 9 — security/render cleanup pokračuje čtvrtým bezpečným krokem.
- Update toast pro novou verzi už se nevykresluje přes `innerHTML`; skládá se přes DOM uzly a `textContent`, takže text ze service workeru nejde omylem vložit jako HTML.
- Přidána diagnostika bezpečných DOM sestavení: `safeDomBuilds` a `lastSafeDomKey`.
- O aplikaci / diagnostika nově ukazuje i poslední bezpečně sestavený DOM blok.
- Verze sjednocena na v.1.1 (621), cache na v1.1-621 a Supabase realtime kanál na rak-public-live-v621.

## v.1.1 (620)
- Fáze 9 — security/render cleanup pokračuje třetím bezpečným krokem.
- Společné HTML renderování přes `setElementHtmlIfChanged()` nově prochází lehkou kontrolou rizikových šablon: `script` tagy, inline `on...` události, `javascript:` URL a embed/frame prvky.
- Kontrola zatím nic neblokuje, aby se nerozbilo UI; zapisuje jen diagnostiku pro další cílený úklid renderů.
- Diagnostika O aplikaci nově ukazuje HTML guard zápisy/skipy/rizika a poslední kontrolovaný HTML render.
- Verze sjednocena na v.1.1 (620), cache na v1.1-620 a Supabase realtime kanál na rak-public-live-v620.

## v.1.1 (619)
- Fáze 9 — security/render cleanup pokračovala druhým bezpečným krokem.
- Přidán společný URL guard `normalizeSafeExternalUrl()` pro externí odkazy otevírané z aplikace; povolí jen `http`/`https` a neplatné nebo nebezpečné schéma potichu zablokuje.
- Otevření Eportalu / Výplaty dál používá `noopener,noreferrer`.
- Diagnostika nově ukazuje počet kontrol externích URL, počet blokovaných URL a poslední kontrolovaný externí odkaz.
- Verze sjednocena na v.1.1 (619), cache na v1.1-619 a Supabase realtime kanál na rak-public-live-v619.

## v.1.1 (618)
- Fáze 8 — PWA / Service Worker hardening dokončena na 100 %.
- Service worker nově vrací finální offline readiness stav: `phase8CompletionMode`, `phase8Ready` a poměr připravenosti app shell cache.
- Diagnostika aplikace nově ukazuje, jestli je app shell připravený pro offline spuštění a na kolik procent je cache kompletní.
- Verze sjednocena na v.1.1 (618), cache na v1.1-618 a Supabase realtime kanál na rak-public-live-v618.

## v.1.1 (616)
- Fáze 8 / PWA: statické cache-first soubory mimo cache už při slabé síti nepadají do nekonečného čekání, ale používají stejný timeout jako ostatní síťový fallback.
- Diagnostika PWA nově ukazuje režim `staticCacheFirstTimeoutMode`.
- Verze sjednocena na v.1.1 (616), cache na v1.1-616 a Supabase realtime kanál na rak-public-live-v616.

## v.1.1 (615)
- Fáze 8 — PWA/SW: navigace a same-origin požadavky mají časový limit pro rychlejší návrat do cache při slabé nebo zaseklé síti.
- Service worker při navigaci čeká krátce na navigation preload a potom přejde na běžný fetch s timeoutem; při selhání použije offline/cache fallback jako dřív.
- Diagnostika PWA nově ukazuje režim `network-timeout-cache-fallback` a časové limity síťového fallbacku.
- Fáze 8 — PWA / Service Worker hardening posunuta na cca 92 %.
- Verze sjednocena na v.1.1 (615), cache na v1.1-615 a Supabase realtime kanál na rak-public-live-v615.

## v.1.1 (614)
- Láďův režim / low-end zařízení: automatické zapnutí odlehčeného profilu je spolehlivější i po starším uloženém nastavení, pokud ho uživatel ručně nevypnul.
- Přidána společná třída `ladaMode`, aby hry, dashboard i obecné UI používaly stejný výkonový profil.
- V Láďově režimu se vypíná další těžký blur, zjemňují se stíny, ruší se přechody/animace a canvas hry používají DPR limit 1 pro slabší zařízení.
- Verze sjednocena na v.1.1 (614), cache na v1.1-614 a Supabase realtime kanál na rak-public-live-v614.

## v.1.1 (613)
- Fáze 8 — PWA/SW: při aktivaci service workeru se runtime cache bezpečně ořeže na povolený limit.
- Diagnostika PWA ukazuje režim runtime trimu a počty položek před/po ořezu.
- Verze sjednocena na v.1.1 (613), cache na v1.1-613 a Supabase realtime kanál na rak-public-live-v613.

## v.1.1 (612)
- PWA / Service Worker hardening: ukládání do cache má nově společný guard, který pouští jen bezpečně cacheovatelné odpovědi.
- App shell precache, runtime cache i navigační fallback už neukládají částečné/problematičtější odpovědi typu HTTP 206 nebo neplatné response objekty.
- Diagnostika nově vrací `cacheableResponseMode` a O aplikaci ho ukazuje v PWA/SW diagnostice.
- Fáze 8 — PWA / Service Worker hardening posunuta na cca 84 %.
- Verze sjednocena na v.1.1 (612), cache na v1.1-612 a Supabase realtime kanál na rak-public-live-v612.

## v.1.1 (611)
- PWA / Service Worker hardening: úklid cache při aktivaci je nově omezený jen na staré RaK cache `rotace-static-*` a `rotace-runtime-*`.
- Service worker už nemaže všechny ostatní cache na stejné doméně, takže je bezpečnější při běhu vedle dalších projektů nebo testovacích verzí.
- Diagnostika nově vrací `staleCacheCleanupMode`, počty spravovaných/starých RaK cache a počet smazaných starých cache.
- Fáze 8 — PWA / Service Worker hardening posunuta na cca 80 %.
- Verze sjednocena na v.1.1 (611), cache na v1.1-611 a Supabase realtime kanál na rak-public-live-v611.

## v.1.1 (610)
- PWA / Service Worker hardening: service worker při aktivaci automaticky zkontroluje, jestli v precache nechybí povinné položky app shellu.
- Pokud je precache neúplná, zkusí chybějící položky sám doplnit ještě během aktivace a stav rovnou pošle otevřeným oknům appky.
- Diagnostika nově vrací `activatePrecacheRepairMode`, `activatePrecacheRepairTriggered`, čas poslední aktivační opravy a případnou chybu.
- Fáze 8 — PWA / Service Worker hardening posunuta na cca 76 %.
- Verze sjednocena na v.1.1 (610), cache na v1.1-610 a Supabase realtime kanál na rak-public-live-v610.

## v.1.1 (609)
- PWA / Service Worker hardening: dotazy appky na stav cache service workeru jsou nově hlídané krátkým throttlingem, aby se při návratu do appky neposílalo víc stejných `GET_CACHE_STATUS` zpráv najednou.
- Důležité kontroly po registraci, aktualizaci, `controllerchange` a návratu online zůstávají vynucené, takže se neztratí kontrola nové cache ani automatická oprava precache.
- Diagnostika PWA nově sleduje `swCacheStatusRequestSkips`, `swCacheStatusRequestMode` a čas posledního požadavku na stav cache.
- Fáze 8 — PWA / Service Worker hardening posunuta na cca 72 %.
- Verze sjednocena na v.1.1 (609), cache na v1.1-609 a Supabase realtime kanál na rak-public-live-v609.

## v.1.1 (608)
- PWA / Service Worker hardening: appka umí po zjištění chybějících položek app shellu požádat service worker o automatickou opravu precache.
- Service worker nově podporuje zprávu `REPAIR_PRECACHE`, znovu stáhne jen chybějící položky a uloží je pod čisté stabilní cache klíče.
- Diagnostika nově vrací `precacheRepairMode`, počty opravovaných položek a výsledek poslední opravy.
- Fáze 8 — PWA / Service Worker hardening posunuta na cca 68 %.
- Verze sjednocena na v.1.1 (608), cache na v1.1-608 a Supabase realtime kanál na rak-public-live-v608.

## v.1.1 (607)
- Brusy / Kdy bude hotovo: popisek pole je upravený na „Kolik dávek ještě – včetně načaté“, aby bylo jasné, že se počítá i rozdělaná dávka.
- PWA / Service Worker hardening: diagnostika precache nově kontroluje, jestli v app shell cache nechybí některá povinná položka.
- Service worker vrací `precacheIntegrityMode`, `precacheMissingCount` a ukázku chybějících položek, aby šlo snáz poznat neúplně uloženou offline verzi.
- Fáze 8 — PWA / Service Worker hardening posunuta na cca 64 %.
- Verze sjednocena na v.1.1 (607), cache na v1.1-607 a Supabase realtime kanál na rak-public-live-v607.

## v.1.1 (606)
- Soustruhy / Kombinace: výsledek je nově v jednom větším čitelnějším bloku místo tří menších okýnek.
- Soustruhy / Kombinace: seznamy dávek zůstávají zabalené zvlášť pod výsledkem.
- Brusy / Kdy bude hotovo: zůstalo jen zadání celých dávek; samostatný rozbalovací „Přesnější výpočet“ je odstraněný.
- Brusy / Kdy bude hotovo: hotové kusy v rozdělané dávce a kusy do orovnání jsou nově přímo v hlavním zadání času dokončení.
- Verze sjednocena na v.1.1 (606), cache na v1.1-606 a Supabase realtime kanál na rak-public-live-v606.

## v.1.1 (605)
- Soustruhy / Kombinace: u 2. části se nově zadává jen číslo první dávky.
- Plán je nově samostatný celkový plán pro Lis + Volné; appka odečte kusy z 1. části a 2. část dopočítá jen ze zbytku.
- Nastavení Volné je v Kombinaci otevřené hned nahoře u volby pořadí, aby bylo po zvolení Volného po ruce.
- Výsledek ukazuje celkový plán, kolik po 1. části zbývalo pro 2. část a na jaké dávce druhá část skončí.
- Kalírenské dopočítání po 4 dávkách zůstává dole a počítá se jen z části Volné.
- Verze sjednocena na v.1.1 (605), cache na v1.1-605 a Supabase realtime kanál na rak-public-live-v605.

## v.1.1 (604)
- Soustruhy / Kombinace: zadávání je předělané podle reálného postupu práce. Vybere se, co jede jako první: Lis nebo Volné.
- U 1. části se zadává číslo první a poslední dávky, takže appka bere známý hotový rozsah.
- U 2. části se zadává číslo první dávky a plán; appka dopočítá, čím budeš u druhé části končit.
- Kalírenské dopočítání po 4 dávkách zůstává dole v rozbalovacím bloku a počítá se jen z části Volné, ať už jede jako první nebo druhá.
- Verze sjednocena na v.1.1 (604), cache na v1.1-604 a Supabase realtime kanál na rak-public-live-v604.

## v.1.1 (603)
- Soustruhy: pole „První kalírenská dávka“ je přesunuté dolů přímo do rozbalovacího bloku „Dopočítání kalírenské dávky po 4 dávkách“, aby zadání i výsledek byly u sebe.
- Soustruhy: přidaná čtvrtá volba „Kombinace“ pro výpočet části směny na Lisu a části směny na Volné 126/106.
- Soustruhy / Kombinace: výsledek ukazuje zvlášť Lis, Volné i celkem, seznamy dávek jsou zabalené a kalírenské čtveřice se počítají jen z části Volné.
- Verze sjednocena na v.1.1 (603), cache na v1.1-603 a Supabase realtime kanál na rak-public-live-v603.

## v.1.1 (602)
- Soustruhy / Volné 126 a Volné 106: kalírenské čtveřice jsou nově zabalené v rozbalovacím bloku jako přesnější výpočet u Brusů.
- Pro kalírenské čtveřice se zadává samostatně číslo první kalírenské dávky, protože začátek čtveřice může vycházet z jiného stroje.
- Výpočet pořád počítá jen dávky vyrobené na soustruhu; položky mimo tenhle výpočet jsou označené zvlášť a doplnění ze soustruhu se ukazuje jen u poslední čtveřice.
- Verze sjednocena na v.1.1 (602), cache na v1.1-602 a Supabase realtime kanál na rak-public-live-v602.

## v.1.1 (600)
- Kalkulačky / Soustruhy: u Volné 126 ks a Volné 106 ks je dopočítání kalírenských volných nově součástí hlavního výpočtu dávek.
- Už se nezadává zvlášť číslo první průvodky pro kalírnu; výpočet bere číslo první dávky na soustruhu a podle hotového plánu rovnou vypíše kalírenské čtveřice po 4 průvodkách.
- Poslední kalírenská čtveřice se dopočítá do celé čtveřice: pokud plán skončí např. po 1–3 dávkách v poslední skupině, výsledek ukáže, které další vozíky se mají ještě doplnit ze soustruhu, aby kalírna dostala 4.
- Tabulka kalírenských volných nově ukazuje sloupec „Doplnit“ a průvodky dopočítané mimo aktuální plán označí hvězdičkou.
- Výpočty kusů pro Volné 126/106 zůstávají stejné, změněné je jen napojení kalírenské logiky na hlavní výsledek.
- Fáze 8 — PWA / Service Worker hardening zůstává cca 60 %, protože jde o cílenou úpravu Soustruhů bez změny PWA/SW jádra.

## v.1.1 (599)
- Dashboard: když je směna D právě v práci, horní zvýrazněné pole už neopakuje text „Směna D je právě v práci“, protože stejná informace je hned nad ním.
- Ve zvýrazněném poli při aktivní směně D zůstává jen informace „chybí: …“.
- Když směna D právě v práci není, zobrazení zůstává stejné jako ve v.1.1 (598): ukáže za jak dlouho D začíná a kdo bude chybět.
- Výpočty, kalkulačky, profil, hry, Supabase datový model a service worker jsou beze změny.
- Fáze 8 — PWA / Service Worker hardening zůstává cca 60 %, protože jde o cílené doladění Dashboardu bez změny PWA/SW jádra.

## v.1.1 (598)
- Kalkulačky / Soustruhy: u Volné 126 ks a Volné 106 ks přibylo okýnko „Dopočítání kalírenské dávky“.
- Nový výpočet má pole „Číslo první průvodky v kalírenské dávce“ a po kliknutí vypíše kalírenské volné po 4 našich průvodkách v jednom řádku, např. 3, 4, 5, 6.
- Výpočet vychází z plánu výroby: nejdřív dopočítá, kolik našich dávek je potřeba pro plán kusů, a potom vypíše kalírenské skupiny až do konce plánu.
- U Volné 126 ks respektuje volbu začátku 32/31 ks, u Volné 106 ks používá zadané počty kusů v prvních čtyřech dávkách.
- PWA / Service Worker hardening: same-origin fallback při výpadku nově používá stejné normalizované hledání v runtime i statické cache místo jen přesného runtime klíče.
- Diagnostika service workeru nově vrací `sameOriginFallbackMode`, aby bylo vidět, že běží novější fallback režim.
- Fáze 8 — PWA / Service Worker hardening posunuta na cca 60 %.

## v.1.1 (597)
- Fáze 8 — PWA / Service Worker hardening posunuta na cca 56 %.
- Service worker nově ukládá runtime cache pod čisté kanonické klíče bez query parametrů, takže stejný soubor nevzniká v cache ve více zbytečných variantách.
- Chytřejší cache lookup z předchozích buildů tím dostal i stejně předvídatelné ukládání, což zlepšuje offline spuštění po updatech a drží runtime cache štíhlejší.
- Diagnostika service workeru nově vrací `runtimeStoreMode`, aby bylo poznat, že běží kanonické ukládání runtime cache.
- UI, kalkulačky, profil/přihlášení, hry, Supabase datový model, Dashboard, Rotace, Rozpisy, Statistiky a spodní lišta jsou beze změny.

## v.1.1 (596)
- Fáze 8 — PWA / Service Worker hardening posunuta na cca 52 %.
- Service worker při instalaci app shellu nově stahuje precache soubory s cache-busting parametrem `__rak_precache`, aby se po nasazení nové verze nesáhlo po staré prohlížečové kopii.
- Soubory se dál ukládají pod čisté stabilní app-shell klíče bez query parametru, takže offline lookup z v.1.1 (595) zůstává kompatibilní.
- Diagnostika service workeru nově vrací `precacheFetchMode`, aby bylo poznat, že běží bezpečnější precache režim.
- UI, kalkulačky, profil/přihlášení, hry, Supabase datový model, Dashboard, Rotace, Rozpisy, Statistiky a spodní lišta jsou beze změny.

## v.1.1 (595)
- Fáze 8 — PWA / Service Worker hardening posunuta na cca 48 %.
- Service worker nově hledá položky app shellu v cache přes normalizované kandidáty: původní request, absolutní URL bez query, relativní `./soubor` a variantu bez `./`.
- Offline fallback navigace nově používá stejnou cache lookup logiku, takže má větší šanci najít `index.html` i po spuštění appky z jiné cesty nebo s query parametrem.
- Diagnostika service workeru vrací `cacheLookupMode`, aby bylo v cache statusu poznat, že běží novější normalizované hledání.
- UI, kalkulačky, profil/přihlášení, hry, Supabase datový model, Dashboard, Rotace, Rozpisy, Statistiky a spodní lišta jsou beze změny.

## v.1.1 (594)
- Hry: karta Přihlášení byla přesunutá z horní části záložky Hry do Více → Nastavení jako karta Profil a přihlášení.
- Hry teď nahoře ukazují jen stručný stav herního profilu a tlačítko Nastavení, takže herní hub není zahlcený přihlašovacím formulářem.
- Profilová logika, herní statistiky, achievementy, Theme/Pozadí ukládané k profilu a Supabase sync zůstávají zachované.
- O aplikaci: aktualizovaný rychlý přehled aktuálního buildu; Fáze 8 zůstává cca 44 %, protože jde o přesun existující profilové UI bez změny PWA/SW jádra.

## v.1.1 (593)
- Kalkulačky / Brusy: zmenšená mezera mezi volbou brusu TBKR01/TBKR07 a blokem indexů, bez změny výpočtů a bez zásahu do výšek tlačítek z v.1.1 (592).
- PWA / Service Worker hardening: statické soubory app shellu se při offline načítání hledají i ve statické precache, nejen v runtime cache. Offline spuštění by tak mělo být odolnější po aktivaci nové cache.
- O aplikaci: aktualizovaný rychlý přehled aktuálního buildu a posun Fáze 8 na cca 44 %.

## v.1.1 (592)
- Fáze 8 — PWA / Service Worker hardening zůstává cca na 40 %, protože jde o cílenou opravu Brusů po testu v.1.1 (591).
- Kalkulačky / Brusy: volby brusu TBKR01/TBKR07 a běžné indexy AD/AE/AH dostaly vlastní třídy `brusMachineBtn` a `brusIndexBtn`, aby je už nepřebíjely starší obecné `.bbtn` vrstvy.
- Brusy a běžné indexy jsou nově nastavené na viditelně menší střední výšku mezi nízkými volnými indexy a původními vysokými tlačítky.
- Volné indexy AD volné / AE volné mají vlastní třídu `brusFreeIndexBtn` a zůstávají kompaktnější jako spodní vizuální hranice.
- Grid a wrapper volných indexů zůstávají přirozené bez pevného překrývání; barevné glass rozlišení i výpočty jsou beze změny.
- Dashboard, spodní lišta, Rotace, Rozpisy, Statistiky, Výplata, hry, Theme/Pozadí a Supabase datový model jsou beze změny.

## v.1.1 (591)
- Fáze 8 — PWA / Service Worker hardening zůstává cca na 40 %, protože jde o rychlé doladění Brusů po testu v.1.1 (590).
- Kalkulačky / Brusy: volba brusu, běžné indexy i volné indexy mají nově jednu společnou střední velikost přes finální proměnnou úplně na konci CSS.
- Brusy TBKR01/TBKR07 a indexy AD/AE/AH jsou zmenšené směrem k volným indexům, ale volné indexy už netvoří odlišně nízkou variantu.
- Grid zůstává přirozený bez pevně zamčených řádků, aby se indexy nepřekrývaly.
- Barevné glass rozlišení indexů a výpočty v Brusech jsou beze změny.
- Dashboard, spodní lišta, Rotace, Rozpisy, Statistiky, Výplata, hry, Theme/Pozadí a Supabase datový model jsou beze změny.

## v.1.1 (590)
- Fáze 8 — PWA / Service Worker hardening zůstává cca na 40 %, protože jde o rychlou korekci Brusů po testu v.1.1 (589).
- Kalkulačky / Brusy: opraveno překrývání indexů po dorovnání výšek ve v.1.1 (589).
- Grid volby brusu a indexů už nemá natvrdo zamčené řádky ani pevný max-height wrapperu volných indexů; řádky se můžou dopočítat přirozeně.
- Všechna klikací tlačítka v Brusech dál drží sjednocenou kompaktní minimální výšku: TBKR01/TBKR07, AD/AE/AH i AD volné/AE volné.
- Barevné glass rozlišení indexů a výpočty v Brusech jsou beze změny.
- Dashboard, spodní lišta, Rotace, Rozpisy, Statistiky, Výplata, hry, Theme/Pozadí a Supabase datový model jsou beze změny.

## v.1.1 (589)
- Fáze 8 — PWA / Service Worker hardening zůstává cca na 40 %, protože jde o rychlou korekci Brusů po testu v.1.1 (588).
- Kalkulačky / Brusy: volné indexy AD volné / AE volné už nemají vlastní nižší výšku než volba brusu a běžné indexy.
- Výška je nově držená přes jednu společnou proměnnou pro volbu brusu, běžné indexy i wrapper volných indexů, takže se nemůže lišit jen kvůli `.freeWrap` vrstvě.
- Volné indexy jsou v Brusech stále ve vlastním řádku přes celou šířku, ale tlačítka drží stejnou výšku jako ostatní volby.
- Barevné glass rozlišení indexů a výpočty v Brusech jsou beze změny.
- Dashboard, spodní lišta, Rotace, Rozpisy, Statistiky, Výplata, hry, Theme/Pozadí a Supabase datový model jsou beze změny.

## v.1.1 (588)
- Fáze 8 — PWA / Service Worker hardening posunuta na cca 40 %.
- Kalkulačky / Brusy: klikací volby dostaly vlastní cílové třídy pro skutečnou strukturu Brusů, aby je nepřebíjely obecné vrstvy kalkulaček.
- Kalkulačky / Brusy: proběhl pokus o sjednocení výšky pro oba brusy, běžné indexy AD/AE/AH i volné indexy AD volné/AE volné.
- Po testu se ukázalo, že volné indexy přes `.freeWrap` zůstaly vizuálně nižší než ostatní volby; navazuje oprava v.1.1 (589).
- Barevné glass rozlišení indexů a výpočty v Brusech jsou beze změny.
- Dashboard, spodní lišta, Rotace, Rozpisy, Statistiky, Výplata, hry, Theme/Pozadí a Supabase datový model jsou beze změny.

## v.1.1 (587)
- Fáze 8 — PWA / Service Worker hardening posunuta na cca 36 %.
- Kalkulačky: v detailu kalkulaček je vpravo nová kompaktní dvojice ovládání — reset a křížek pro návrat na přehled kalkulaček.
- Kalkulačky / Brusy: volby brusu a indexu jsou ještě nižší, přibližně o dalších 20 %, ale barevné glass rozlišení zůstává zachované.
- PWA/SW diagnostika nově hlídá nesoulad mezi očekávanou cache verzí aktuální appky a aktivní verzí service worker cache.
- Pokud appka zjistí starší cache/service worker verzi, spustí bezpečný vynucený update check s ochranným throttlem.
- Výpočty, hry, Theme/Pozadí, Supabase datový model, rozpisy, rotace logika, Výplata a spodní lišta jsou beze změny.

## v.1.1 (585)
- Fáze 8 — PWA / Service Worker hardening posunuta na cca 28 %.
- Kalkulačky / Brusy: naklikávací volby brusu a indexu jsou zhruba o 20 % nižší, aby na mobilu nezabíraly tolik výšky.
- Kantýna/Jídelna: v popupu otevírací doby zmizel horní stavový box typu „Teď zavřeno / Další otevření / Otevírá…“.
- Kantýna/Jídelna: ze zvýrazněného času zmizel malý popisek „teď/další“, zůstává jen čisté barevné zvýraznění aktuálního nebo nejbližšího budoucího bloku.
- Horní názvy stránek mimo Home mají novou kulatější iOS glass lištu bez ostrých rohů.
- Diagnostika PWA/SW nově doplňuje počet otevřených klientů a stav navigation preload z aktivního service workeru.
- Výpočty, hry, Theme/Pozadí, Supabase datový model, rozpisy, rotace logika, Výplata a spodní lišta jsou beze změny.

## v.1.1 (584)
- Fáze 8 — PWA / Service Worker hardening posunuta na cca 20 %.
- Service worker nově ukládá metadata o precache app shellu: počet úspěšně uložených položek, počet chyb a krátký seznam přeskočených souborů.
- Appka si umí od aktivního service workeru vyžádat cache status přes zprávu `GET_CACHE_STATUS`.
- Diagnostika nově ukazuje aktivní SW/cache verzi, počet položek ve static/runtime cache, úspěšnost precache a počet cache status požadavků.
- Aktivace service workeru posílá zpět i cache status, takže se lépe pozná, jestli běží správná cache verze.
- Výpočty, hry, Theme/Pozadí, Supabase datový model, rozpisy, rotace, Výplata a spodní lišta jsou beze změny.

## v.1.1 (583)
- Fáze 8 — PWA / Service Worker hardening začala zhruba na 10 %.
- Service worker má bezpečnější instalaci cache: app shell se ukládá po jednotlivých položkách a jedna nepovedená položka neshodí celé přednačtení.
- Navigace využívá `navigationPreload`, pokud ho prohlížeč podporuje.
- Runtime cache má limit a průběžný úklid nejstarších položek.
- Kontrola aktualizace service workeru má throttle/in-flight guard, aby se při focusu/pageshow nespouštělo víc kontrol za sebou.
- Diagnostika nově ukazuje základní PWA/SW údaje.

## v.1.1 (582)
- Fáze 7 — Data optimization dokončena na 100 %.
- Lokální read/JSON cache má nově malý LRU limit, aby při dlouhém používání appky zbytečně nerostla v paměti.
- Často používané klíče v cache zůstávají, nejstarší nepoužívané položky se bezpečně ořežou.
- Diagnostika aplikace nově ukazuje velikost read/json cache, nastavené limity, počty úklidů a ořezaných položek.
- Chování appky, výpočty, hry, Theme/Pozadí, Supabase datový model, rozpisy, rotace, Výplata a spodní lišta jsou beze změny.

## v.1.1 (581)
- Fáze 7 — Data optimization posunuta na cca 92 %.
- Přidaný bezpečný style guard `setStylePropertyIfChanged()` pro opakované CSS/inline styly.
- Theme a Pozadí už při návratu do appky/pageshow/focus zbytečně nepřepisují stejné CSS proměnné, pokud se nezměnily.
- Spodní lišta / tlačítko Více používá style guard pro opakované dorovnání rozměrů, takže stejné inline styly se při resize/orientaci nepíšou pořád dokola.
- Diagnostika aplikace nově ukazuje i DOM style zápisy/skipy, chyby a poslední optimalizovaný styl.
- Výpočty, hry, Theme/Pozadí nabídka, Supabase datový model, rozpisy, rotace, Výplata a spodní lišta funkčně beze změny.

## v.1.1 (580)
- Fáze 7 — Data optimization posunuta na cca 88 %.
- Přidaný bezpečný class toggle guard `toggleElementClassIfChanged()` pro aktivní stavy tlačítek/panelů.
- Kalkulačky / Brusy a Soustruhy už při opakovaném renderu zbytečně nepřepisují stejné aktivní třídy u naklikávacích voleb.
- Výsledkové panely kalkulaček používají společný `setCalcOutputHtml()` guard, takže se stejné výsledky zbytečně nepřepisují do DOM.
- Diagnostika aplikace nově ukazuje i DOM toggle zápisy/skipy, chyby a poslední optimalizovaný toggle.
- Výpočty, pravidla her, Theme/Pozadí, Supabase datový model, rozpisy, rotace logika, Výplata a spodní lišta beze změny.

## v.1.1 (579)
- Fáze 7 — Data optimization posunuta na cca 84 %.
- Rokové a měsíční selecty v Rotaci/Statistikách/Importu nově používají bezpečný `setSelectOptionsIfChanged()` guard.
- Při opakovaném refreshi už se stejné možnosti selectů zbytečně nemažou a nevytváří znovu.
- Diagnostika aplikace nově ukazuje i DOM select zápisy/skipy a poslední upravený select.
- Výpočty, hry, Theme/Pozadí, Supabase datový model, rozpisy, rotace logika, Výplata a spodní lišta beze změny.

## v.1.1 (578)
- Fáze 7 — Data optimization posunuta na cca 80 %.
- Otevírací doba Kantýny/Jídelny a stránka Jídelní lístek nově používají společný DOM guard `setElementHtmlIfChanged()`.
- Nadpisy v Otevírací době používají `setElementTextIfChanged()`, takže se při opakovaném refreshi méně sahá do DOMu.
- Zvýraznění aktuálního/dalšího otevření zůstává beze změny, jen se stejné HTML nepřepisuje pořád dokola.
- Výpočty, hry, Theme/Pozadí, Výplata, rozpisy, rotace, Supabase datový model i spodní lišta jsou beze změny.

## v.1.1 (577)
- Fáze 7 — Data optimization posunuta na cca 76 %.
- Přidané společné DOM guardy `setElementTextIfChanged()` a `setElementClassNameIfChanged()` pro úspornější změny textu a tříd.
- Dashboardové helpery nově používají společné text/class guardy, takže opakovaný refresh méně zapisuje stejné hodnoty do DOM.
- Theme/Pozadí a přihlášený herní účet používají úspornější textové zápisy při opakovaném otevření nastavení nebo návratu do appky.
- Diagnostika aplikace nově ukazuje i DOM text/class zápisy a skipy.
- Výpočty, hry, rozpisy, rotace logika, Theme/Pozadí nabídka, Supabase datový model, Výplata a spodní lišta beze změny.

## v.1.1 (575)
- Fáze 7 — Data optimization posunuta na cca 68 %.
- Dashboard nově používá bezpečný DOM guard `setElementHtmlIfChanged()` pro hero panel a informační karty.
- Opakované home refresh běhy už nepřepisují stejné HTML karet, pokud se zobrazený obsah nezměnil.
- Sync badge na dashboardu mění text/třídu jen při skutečné změně, takže se při rychlých refreshích dělá méně drobných DOM zásahů.
- Úpravy z 574 zůstávají zachované: sjednocené písmo detailu Rotace a nižší naklikávací volby Brusů.
- Výpočty, pravidla her, Theme/Pozadí, Supabase datový model, rozpisy, Výplata a spodní lišta beze změny.


## v.1.1 (574)
- Fáze 7 — Data optimization posunuta na cca 64 %.
- Rotace: po kliknutí na jméno je velikost písma v detailu směn sjednocená s přehledem Rotace, aby detail nepůsobil zbytečně přerostle.
- Kalkulačky / Brusy: naklikávací okénka pro volbu brusu a indexu jsou snížená zhruba o 15 %, barvy indexů a glass styl zůstávají zachované.
- Brusy info karta nově používá `setElementHtmlIfChanged()`, takže se nepřepisuje zbytečně, pokud se zobrazené parametry nezměnily.
- Výpočty, pravidla her, Theme/Pozadí, Supabase datový model, rozpisy, Výplata a spodní lišta beze změny.


## v.1.1 (573)
- Fáze 7 — Data optimization posunuta na cca 60 %.
- Bezpečný DOM HTML guard `setElementHtmlIfChanged()` je rozšířený i do Rotace.
- Rotace nově nepřepisuje zbytečně stejné HTML u náhledu příští směny, detailu vybraného jména, měsíční tabulky a těla QR/seznamového modalu.
- Při rychlém přepínání záložek nebo opakovaném refreshi by se mělo dělat méně zbytečných DOM zápisů, ale klikání, zvýraznění aktuální/příští směny i QR logika zůstávají stejné.
- Výpočty, pravidla her, Theme/Pozadí, Supabase datový model, rozpisy, Výplata a spodní lišta beze změny.


## v.1.1 (572)
- Fáze 7 — Data optimization posunuta na cca 54 %.
- Přidaný bezpečný DOM HTML guard `setElementHtmlIfChanged()`: vybrané prvky se nepřepisují přes `innerHTML`, když je výsledný obsah stejný jako předchozí render.
- Optimalizace se dotkla hlavně přehledu měsíců a detailních panelů ve Statistikách, kde při refreshi často vzniká stejný HTML výstup.
- Diagnostika Fáze 7 nově ukazuje DOM zápisy/skipy, chyby a poslední optimalizovaný prvek.
- Výpočty, pravidla her, Theme/Pozadí, Supabase datový model, rozpisy, rotace, Výplata a spodní lišta beze změny.


## v.1.1 (571)
- Fáze 7 — Data optimization posunuta na cca 48 %.
- `scheduleHomeRefresh()` dostal dávkovací guard: při startu, návratu do appky nebo rychlém přepnutí se více požadavků na refresh dashboardu sloučí do jedné řízené sekvence.
- Diagnostika Fáze 7 ukazuje plánované/sloučené home refresh běhy, skutečné refresh běhy a skipy při otevřeném modalu.
- Výpočty, pravidla her, Theme/Pozadí, Supabase datový model, rozpisy, rotace, Výplata a spodní lišta beze změny.

## v.1.1 (570)
- Fáze 7 — Data optimization posunuta na cca 42 %.
- Startovní načtení rotací nově používá sdílenou lokální read/JSON cache, takže se velký stav při init kontrole nečte a neparsuje zbytečně víckrát.
- Menší herní preference používají stejný zápis jen při změně: online výsledky piškvorek, zapamatované jméno a joystick hada.
- Diagnostika Fáze 7 dál ukazuje lokální čtení/zápisy, cache hity, parse hity a přeskočené stejné zápisy.
- Výpočty, pravidla her, Theme/Pozadí, Supabase datový model, rozpisy, rotace, Výplata a spodní lišta beze změny.

## v.1.1 (569)

- Fáze 7 — Data optimization posunuta na cca 36 %.
- Supabase lokální cache, offline fronta a profilové UI cache nově používají společnou lokální read/JSON cache z Fáze 7.
- `safeReadJson()` už zbytečně neopakuje přímé čtení a JSON parse stejných hodnot z `localStorage`, pokud je k dispozici společná cache.
- `safeWriteJson()` nově využívá zápis jen při změně, takže se stejná Supabase cache/fronta nepřepisuje pořád dokola.
- Diagnostika Supabase cacheGuard nově ukazuje delegované lokální JSON čtení, zápisy a přeskočené stejné zápisy.
- Výpočty, hry, Theme/Pozadí, Výplata, rozpisy, rotace, otevírací doba, Supabase datový model a spodní lišta jsou beze změny.

## v.1.1 (568)

- Fáze 7 — Data optimization posunuta na cca 32 %.
- Láďův režim je víc odlehčený: těžký glass blur se vypíná šířeji napříč appkou, stíny jsou slabší, efektní pseudo-vrstvy se schovají a pozadí používá jednodušší statickou variantu.
- Hry s canvasem v Láďově režimu / na slabším zařízení používají nižší DPR limit, takže se na mobilech nemusí renderovat zbytečně velké plátno.
- Detekce slabšího zařízení je citlivější hlavně pro Androidy se 4 GB RAM, slabší CPU/RAM kombinací, Data Saverem, pomalejší sítí nebo malým displejem s vysokým DPR.
- Diagnostika aplikace nově ukazuje výkonový profil, důvod detekce, ruční zapnutí Láďova režimu, DPR limit canvasu, DPR/šířku zařízení a typ sítě.
- Výpočty, rozpisy, rotace, hry, Theme/Pozadí, Výplata, Supabase datový model a spodní lišta jsou beze změny.

## v.1.1 (567)

- Fáze 7 — Data optimization posunuta na cca 26 %.
- UI preference, Theme/Pozadí a herní profil nově používají společnou lokální read/JSON cache, takže se při otevření nastavení nebo přepínání vzhledu méně opakovaně parsuje `localStorage`.
- Ukládání UI preferencí, Theme/Pozadí a herního profilu nově používá zápis jen při skutečné změně, takže se neukládá zbytečně stejná hodnota pořád dokola.
- Profilové nastavení vzhledu dál zůstává navázané na herní profil; změna je jen úspornější a bezpečnější pro slabší mobil/prohlížeč.
- Diagnostika Fáze 7 dál ukazuje čtení, zápisy, skipy, cache hity a odhad přečtených/zapsaných bajtů.
- Výpočty, pravidla her, Theme/Pozadí nabídka, rozpisy, rotace, otevírací doba, Výplata, Supabase datový model a spodní lišta jsou beze změny.

## v.1.1 (566)

- Fáze 7 — Data optimization posunuta na cca 18 %.
- Přidaná lehká cache pro opakované čtení stejných hodnot z `localStorage`, aby se při obnovení vstupů nesahalo zbytečně pořád do úložiště.
- Přidaná cache pro JSON parse lokálních hodnot; uložené počty soustruhu `soustruh106Counts` se v `restoreInputs()` parsují jen jednou a dál se používá stejná hodnota.
- `setLocalStorageIfChanged()` nově pracuje i s read cache, takže po zápisu se cache hned aktualizuje a po změně JSON hodnoty se starý parse cache zahodí.
- Při změně `localStorage` z jiné záložky/okna se lokální read/JSON cache pro daný klíč vyčistí, aby se nepoužila stará hodnota.
- Diagnostika Fáze 7 nově ukazuje lokální čtení, read cache hity, JSON parse běhy/cache hity/chyby, odhad přečtených bajtů a poslední čtený klíč.
- Výpočty, pravidla her, Theme/Pozadí, rozpisy, rotace, otevírací doba, Výplata, Supabase datový model a spodní lišta jsou beze změny.

## v.1.1 (565)

- Fáze 7 — Data optimization zahájena, aktuálně cca 10 %.
- Lokální ukládání stavu nově používá deduplikaci: `localStorage` zápis se provede jen tehdy, když se hodnota opravdu změnila.
- Velký stav rotací/kalkulaček se při opakovaných kliknutích nebo refreshech zbytečně nepřepisuje pořád dokola.
- `saveRotationData()` nově signalizuje změnu jen při skutečném zápisu, takže se omezí část následných refresh/sync reakcí.
- Diagnostika nově ukazuje počty provedených a přeskočených lokálních zápisů, odhad zapsaných/přeskočených bajtů a poslední klíč zápisu/skipu.
- Výpočty, pravidla her, Theme/Pozadí, rozpisy, rotace, otevírací doba, Výplata, Supabase datový model a spodní lišta jsou beze změny.

## v.1.1 (564)

- Fáze 6 — Supabase hardening dokončena na 100 %.
- Supabase Realtime má nově self-heal reconnect guard: po `CHANNEL_ERROR`, `TIMED_OUT`, `CLOSED`, návratu internetu, `pageshow`, focusu nebo návratu do viditelné appky se umí bezpečně znovu naplánovat připojení.
- Reconnect má vlastní guard proti duplicitám, aby se při slabším internetu nevytvářely paralelní realtime bindy.
- Diagnostika nově počítá naplánované realtime reconnecty, skutečné reconnect běhy, skipy a chyby reconnectu.
- Funkce aplikace, výpočty, pravidla her, Theme/Pozadí, rozpisy, rotace, otevírací doba, Výplata a spodní lišta jsou beze změny.

## v.1.1 (563)

- Fáze 6 — Supabase hardening posunuta na cca 96 %.
- Supabase offline fronta má nově diagnostiku zdraví fronty: stáří nejstarší položky, nejnovější položku, počty podle typu úlohy, maximální retry count a počet podezřele starých/varovných položek.
- Queue health se přepočítá při probuzení fronty, při flushi fronty i v diagnostice, takže bude jednodušší poznat, jestli se sync opravdu jen čeká na retry/backoff, nebo je ve frontě starý problém.
- Diagnostika Supabase nově ukazuje i warning/critical stav podle stáří fronty, bez automatického mazání dat.
- Funkce aplikace, výpočty, pravidla her, Theme/Pozadí, rozpisy, rotace, otevírací doba, Výplata a spodní lišta jsou beze změny.

## v.1.1 (562)

- Karta Výplata na dashboardu je nově klikací.
- Po kliknutí otevře Škoda eMA/EV odkaz pro výplatu v novém okně/záložce.
- Používá stejný bezpečný externí open guard jako Jídelní lístek a Eportal.
- Výpočty, hry, Theme/Pozadí, Supabase datový model, rozpisy, rotace a spodní lišta beze změny.
- Fáze 6 — Supabase hardening zůstala cca 90 %.

## v.1.1 (561)

- Opravený výpočet v `Kalkulačky → Brusy → Kolik ještě stihnu`.
- Hodnota z přesnějšího výpočtu „hotových kusů v rozdělaném vozíku/dávce“ se nově používá jen pro přepočet dávek/vozíků.
- Tyto kusy se už znovu nepřičítají do celkového počtu kusů, protože mají být zahrnuté v poli „Celkem zatím nabroušeno“.
- Ve výsledku je doplněná poznámka, aby bylo jasné, že rozdělaný vozík slouží jen pro dávky, ne pro navyšování celku.
- Výpočty `Kdy bude hotovo`, hry, Theme/Pozadí, Supabase datový model, rozpisy, rotace a spodní lišta beze změny.
- Fáze 6 — Supabase hardening zůstala cca 90 %.

## v.1.1 (560)

- Fáze 6 — Supabase hardening posunuta na cca 90 %.
- Supabase offline fronta má nově wake/resume guard: po návratu do appky, `pageshow`, focusu nebo obnovení internetu se čekající fronta bezpečně probudí a naplánuje podle retry/backoff času.
- Realtime připojení se při návratu do appky umí znovu navázat, ale s guardem proti spamování duplicitních bindů.
- Init větev už nespouští duplicitní realtime bind volání.
- Diagnostika Supabase nově ukazuje wake požadavky, skipy, offline skipy, noop stavy a wake bindy realtime kanálu.
- Výpočty, pravidla her, Theme/Pozadí, rozpisy, rotace, otevírací doba, Supabase datový model a spodní lišta beze změny.

## v.1.1 (559)

- Fáze 6 — Supabase hardening posunuta na cca 84 %.
- Supabase offline fronta má nový hidden-page guard: když je appka skrytá/neaktivní, flush fronty se nespouští zbytečně a odloží se.
- Po návratu do appky se čekající fronta automaticky znovu naplánuje, pokud je internet a existují čekající položky.
- Diagnostika nově ukazuje odložené flush pokusy na skryté stránce, flush po návratu do viditelného stavu a delay pro hidden retry.
- Oprava z v.1.1 (558) pro scroll v Brusech a zvýraznění směn zůstává zachovaná.
- Výpočty, pravidla her, Theme/Pozadí, rozpisy, rotace, otevírací doba, Supabase datový model a spodní lišta beze změny.

## v.1.1 (558)

- Opravené / zpevněné scrollování v `Kalkulačky → Brusy` pro zařízení, kde se stránka mohla zaseknout a nešlo ji posouvat prstem.
- Přidaný bezpečný scroll guard pro kalkulačkové stránky, hlavně pro Brusy: stránka se má dál posouvat přes běžný body scroll a dlouhé otevřené panely nesmí pohltit tah prstem.
- V `Rozpisy` se nově zvýrazňuje vždy jen jedna směna: když právě běží směna, zvýrazní se aktuální; když zrovna nejsme v práci, zvýrazní se nejbližší další.
- U zvýraznění v rozpisech jsou odstraněné textové popisky typu „teď“ / „další“, zůstává jen barevné zvýraznění řádku.
- V `Rotace` po kliknutí na jméno dostala aktuální směna trochu výraznější zvýraznění; když dotyčný zrovna není v práci, zvýrazní se nejbližší další pracovní směna.
- Pokud má člověk zrovna absenci, zvýraznění v detailu jména se snaží vybrat další pracovní směnu, ne samotnou absenci.
- Výpočty, pravidla her, Theme/Pozadí, Supabase datový model a spodní lišta jsou funkčně beze změny.
- Fáze 6 — Supabase hardening zůstává cca 78 %.

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

## Přehled největších změn v.1.1 (500–594)
- Proběhlo velké stabilizační období před dalšími fázemi refactoru: Fáze 3 Láďův režim, Fáze 4 cleanup manager, Fáze 5 game performance, dokončený Supabase hardening, dokončená Fáze 7 Data optimization a začátek Fáze 8 PWA / Service Worker hardening včetně úspornějších DOM renderů v Dashboardu, Rotaci, Statistikách, Otevírací době, rokových/měsíčních selectech, aktivních stavech kalkulačních voleb, závěrečného LRU úklidu lokální cache a bezpečnější service worker cache a čistší drobné UI doladění Brusů, Otevírací doby a horních názvů stránek.
- Dashboard se postupně ladil kvůli správnému zobrazení směny, ikon, kantýny/jídelny, odpočtů, klikací výplatě a menšímu riziku prázdných nebo pozdě načtených karet.
- Spodní navigace prošla opakovaným dorovnáním, hlavně položka „Více“ – má být užší, ale normálně mezi ostatními položkami a bez ukotvení vpravo.
- Rotace dostala stabilnější spodní dock jmen, lepší safe-area chování na menších displejích typu Samsung A15 a čistší zobrazení příští směny.
- Rozpisy mají zvýraznění aktuální a budoucí směny, užší sloupce datum/směna u Měkoty/Tvrdoty a víc prostoru pro tabulky.
- Statistiky dostaly kompaktnější dlaždice lidí/strojů, snahu vejít stroje do jednoho řádku a čistší souhrny práce/absence.
- Kalkulačky prošly sjednocením calcPanel systému, většími klikacími/navolovacími tlačítky a návratem barevných indexů u Brusů ve glass stylu.
- Všechny hry jsou přesunuté do „Ve vývoji“, herní hub dostal výrazné performance optimalizace, méně opakovaných renderů a lepší cache profilů/statistik.
- Supabase Realtime a offline/online sync se zpevnily: timeouty, retry, offline fronta, deduplikace, cache/fallback, session cache online her, diagnostika a self-heal reconnect.
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
