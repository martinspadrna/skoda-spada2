## RaK 1.2 (1.144)

- Hry / Sudoku: opravené ukládání dokončeného Sudoku do profilu a online Top score. Po vyřešení se zapisuje společné `sudoku` i varianta obtížnosti `sudoku_easy/medium/hard`.
- Dohrané Sudoku se počítá jako dokončení/výhra (`wins: 1`) a ukládá se s časem `bestTimeMs/timeMs/elapsedMs`, aby se správně propsalo do profilu hráče i tabule.
- Supabase klient: zvýšen klientský limit `p_points_delta` pro RPC `rak_record_game_stat_delta`, protože časové low-score hry ukládají rekord jako velké zakódované body `POINT_SCALE - čas_ms`; starý limit 5000 mohl Sudoku oříznout tak, že se výsledek nezobrazil.
- Profily hráčů nově dekódují online low-score body zpět na čas, takže Sudoku/Pexeso/Reaction nezobrazují nesmyslné body nebo počet her místo času.
- Formát časů v tabulkách výher sjednocený: časové hry jsou v sekundách, nad minutu jako `min + s`, Reaction Test jediný zůstává v `ms`.
- Supabase DB/policies beze změny.
- Release metadata sjednocená na `RaK 1.2 (1.144)`, technická verze `1.2.144`, cache `v1.2-1.144`.

## RaK 1.2 (1.141)

- Opravené sjednocení herního profilu/ranku mezi mobilem a PC: aktivní účet se nově při syncu doplňuje přímo přes `account_number`, ne jen z leaderboard/top-score limitů.
- Přidaný přímý Supabase read helper `loadGameStatsForAccount(accountNumber)`, který čte všechny statistiky aktivního účtu po reset cutoffu bez změny DB/policies.
- Uložené theme/pozadí profilu se už na novém zařízení nepřepisuje na default jen proto, že rank ještě nebyl stažený; dočasně se vizuálně použije default a po načtení statistik se uložený skin znovu aplikuje, pokud je odemčený.
- Release metadata sjednocená na `RaK 1.2 (1.141)`, technická verze `1.2.141`, cache `v1.2-1.141`.

## RaK 1.2 (1.140)
- Administrace / Export / import / XLSX rozpis pro kopírování: opravený výběr měsíce, aby se nemíchaly stejné měsíce z různých roků.
- Seznam měsíců pro Excel export je teď řazený chronologicky a skupinovaný podle roku přes `optgroup Rok`, takže 2025 a 2026 nejsou v jednom promíchaném seznamu.
- Stejné chronologické řazení používá i sdílený seznam měsíců v administraci, aby návazné výběry nepadaly na abecední/lexikální pořadí.
- Supabase DB/policies, import Excelu, ZIP export a logika rozpisů beze změny.
- Release metadata sjednocená na `RaK 1.2 (1.140)`, technická verze `1.2.140`, cache `v1.2-1.140`.

## RaK 1.2 (1.139)
- Administrace / Export / import: přidaný stejný XLSX export rozpisu jako v generátoru, včetně výběru měsíce a tlačítka `Stáhnout Excel rozpisu`.
- Export používá sdílenou funkci `adminRotationGeneratorDownloadExcel`, takže layout zůstává Tvrdota A:F, Měkota pod ní A:F a Absence od H dál.
- Import Excelu, ZIP export, Supabase DB/policies a online ukládání rozpisu beze změny.
- Release metadata sjednocená na `RaK 1.2 (1.139)`, technická verze `1.2.139`, cache `v1.2-1.139`.

## RaK 1.2 (1.138)

- Administrace / Rozpisy / Generátor: dolaďený XLSX export návrhu pro praktičtější kopírování do měsíční tabulky. Tvrdota zůstává v A:F, Měkota pod ní v A:F a Absence začínají od H.
- Absence v XLSX exportu mají nově jasnější hlavičky: H = datum absence, od I dál dvojice `Jméno` / `Kód`. Počet dvojic se generuje podle měsíce v bezpečném rozsahu 4–8, bez slučovaných buněk.
- Šířky sloupců XLSX exportu se nově staví podle reálné šířky exportovaných dat, takže nezůstávají zbytečné prázdné sloupce navíc a bloky se líp označují/kopírují.
- Supabase DB/policies beze změny.
- Release metadata sjednocená na `RaK 1.2 (1.138)`, technická verze `1.2.138`, cache `v1.2-1.138`.

## RaK 1.2 (1.137)

- Administrace / Rozpisy / Generátor: po vygenerování návrhu přidané tlačítko `Stáhnout Excel`.
- Excel export návrhu vytváří list ve stejném základním rozložení jako Martinova tabulka: vlevo Tvrdota, pod ní Měkota a vpravo Absence podle pracovních dnů, aby šly bloky jednoduše kopírovat do měsíčního Excelu.
- Export využívá stávající XLSX knihovnu z aplikace; bez změny Supabase DB/policies.
- Release metadata sjednocená na `RaK 1.2 (1.137)`, technická verze `1.2.137`, cache `v1.2-1.137`.

## RaK 1.2 (1.136)

- Generátor rozpisu / návaznost cyklu Synka, Třasáka a Střížka: opravené čtení historie z celého předchozího měsíce. Extra TNKS01 po už dokončeném bloku už neresetuje cyklus zpět na TNKS01.
- Příklad z června: když byli Třasák/Synek/Střížek v závěru měsíce na TNKS01 a blok je hotový, červenec má pokračovat na TPKW01, ne začít znovu TNKS01.
- Návaznost se dál dopočítává chronologicky z předchozích měsíců; poslední den měsíce s absencí nebo Měkotou nemá rozbít pokračování rotace.
- Supabase DB/policies beze změny.
- Release metadata sjednocená na `RaK 1.2 (1.136)`, technická verze `1.2.136`, cache `v1.2-1.136`.

## RaK 1.2 (1.135)

- Generátor rozpisu / Synek, Třasák, Střížek: tahle trojice už nevstupuje do měsíčního ani ročního dorovnání TNKS01. Drží vlastní návazný cyklus `TNKS01 → TPKW01 → TPKW02`.
- Generátor rozpisu: cyklus Synka/Třasáka/Střížka se nově dopočítává z předchozích měsíců, takže navazuje mezi měsíci stejně jako ostatní rotace.
- Generátor rozpisu: po dokončení bloku může vložit pracovní den mezery na Měkotě, když by návaznost udělala v měsíci přílišný náskok.
- Podmínka `stejný pracovník nesmí být na TNKS01 dvě pracovní směny po sobě` zůstává aktivní.
- Supabase DB/policies beze změny.
- Release metadata sjednocená na `RaK 1.2 (1.135)`, technická verze `1.2.135`, cache `v1.2-1.135`.

## RaK 1.2 (1.134)

- Generátor rozpisu / TNKS01: Synek, Střížek a Třasák jsou vyřazení z ročního tie-break dorovnání TNKS01; měsíční vyrovnání pro ně v této verzi ještě zůstalo.
- Přidaná podmínka, že stejný pracovník nesmí být na TNKS01 dvě pracovní směny po sobě.
- Administrace / Rozpisy: odstraněné duplicitní tlačítko `Uložit rozpis` v editoru; zůstalo jedno hlavní tlačítko nahoře.
- Vzhled: odstraněný theme `AMOLED černý` / `amoled-midnight`.
- Supabase DB/policies beze změny.
- Release metadata sjednocená na `RaK 1.2 (1.134)`, technická verze `1.2.134`, cache `v1.2-1.134`.

## RaK 1.2 (1.132)

- Nastavení vzhledu: světlé patternové pozadí z 1.131 jsou předělané tak, aby nebyly tak bílé. Zhruba polovina drží světlejší směr podobný `Světlému cikcaku`, druhá polovina je o něco tmavší a všechny mají výraznější linky/vzory, aby byly na pozadí líp vidět.
- Přidané dva AMOLED theme: `AMOLED modrý` a `AMOLED zelený`.
- Přidaná dvě AMOLED pozadí: `AMOLED mřížka` a `AMOLED pulse`.
- Administrace / Rozpisy / Generátor: když vybereš měsíc, který už má zadané pracovní dny a absence, průvodce si je teď převezme jako předvyplněný základ. Dá se tedy navázat na rozdělaný měsíc místo zadávání od nuly.
- `O aplikaci` nově začíná stručným souhrnem po větších blocích verzí; přidaný aktuální blok `v.1.2 1.30–1.49`.
- Supabase DB/policies beze změny.
- Release metadata sjednocená na `RaK 1.2 (1.132)`, technická verze `1.2.132`, cache `v1.2-1.132`.

## RaK 1.2 (1.130)

- Rozpisy / Absence: tabulka absencí v měsíčním rozpisu nově zobrazuje všechny pracovní dny/směny, i když v daný den nikdo nechybí. Prázdné dny mají v kolonkách jméno/důvod pomlčku, aby byl přehled kompletní.
- Export obrázku rozpisu: tabulka Absence nově také drží všechny pracovní dny/směny včetně dnů bez absence.
- Export obrázku rozpisu: `Roční přehled` i tabulka `Nýtování a úklid [rok]` jsou omezené podle exportovaného měsíce. Export května počítá leden–květen, export srpna leden–srpen, bez ohledu na aktuální datum exportu.
- Generátor rozpisu: dorovnání nýtovačky/TNKS01 nově při výběru bere v úvahu nejen měsíční rozložení, ale i celkové roční počty před generovaným měsícem, aby nedával další nýtovačku člověku, který už je v roce výrazně napřed.
- V Nastavení vzhledu přidaný základní odemčený světlý theme `Světlý hnědý` a základní odemčené pozadí `Světlý cikcak` s bílým podkladem a jemnými úzkými cikcak čárkami.
- Supabase DB/policies beze změny; ukládání rozpisů a přesčasů dál přes stávající mechanismy.
- Release metadata sjednocená na `RaK 1.2 (1.130)`, technická verze `1.2.130`, cache `v1.2-1.130`.

## RaK 1.2 (1.129)

- Administrace / Rozpisy / Přesčasy: doplněný výchozí seznam 12 přesčasů pro rok 2025 podle upřesnění: 12.1., 26.1., 16.2., 2.3., 16.3., 30.3., 5.10., 19.10., 9.11., 23.11., 30.11. a 14.12.2025.
- Přesčasy 2025 se chovají jako výchozí TO/tvrdota, takže TNKS01/TPKW01 se na nich standardně půlí, dokud u konkrétního data nevypneš přepínač TO.
- Přidaná seed/migrační ochrana `ROTATION_OVERTIME_DEFAULT_SEED_VERSION = 129`, aby se nově doplněné defaulty 2025 zobrazily i uživatelům se starším uloženým nastavením, ale po novém uložení se už ručně smazané defaulty nevracely.
- Supabase DB/policies beze změny; ukládání dál přes `ROTATION_OVERTIME_SETTINGS`.
- Release metadata sjednocená na `RaK 1.2 (1.129)`, technická verze `1.2.129`, cache `v1.2-1.129`.

## RaK 1.2 (1.128)

- Administrace / Rozpisy / Přesčasy: filtr směn přebarvený do aktuálního theme/glass stylu aplikace, aby nebyl světlý a hůř čitelný.
- U každého roku v Přesčasech přidaný přehled počtů přesčasů podle směn A/B/C/D. Přehled se přepočítává i při ruční změně data nebo vyčištění řádku.
- Logika TO/MO, statistiky TNKS01/TPKW01, generátor i Supabase DB/policies beze změny.
- Release metadata sjednocená na `RaK 1.2 (1.128)`, technická verze `1.2.128`, cache `v1.2-1.128`.

## RaK 1.2 (1.127)

- V Administraci / Rozpisy / Přesčasy upravený filtr směn: místo `Moje D` jsou čisté volby `Vše`, `A`, `B`, `C`, `D`.
- Filtrování dál jen vizuálně skrývá řádky jiných směn, takže se při uložení nemažou.
- Logika TO/MO a ukládání přes `ROTATION_OVERTIME_SETTINGS` beze změny.
- Release metadata sjednocená na `RaK 1.2 (1.127)`, technická verze `1.2.127`, cache `v1.2-1.127`.

## RaK 1.2 (1.126)

- Administrace / Rozpisy / Přesčasy: přidaný automatický sloupec `Směna`, který z data přesčasu dopočítá směnu podle rotačního cyklu.
- Přidaný filtr přesčasů podle směny: `Vše`, `Moje D`, `A`, `B`, `C`; filtr jen vizuálně skrývá řádky, takže uložené přesčasy jiných směn se při ukládání neztratí.
- U ručně zadávaného data se badge směny přepočítá průběžně, bez ručního vyplňování směny.
- Logika `TO` zůstává stejná: zapnuto = tvrdota a půlení TNKS01/TPKW01, vypnuto = MO bez půlení.
- Release metadata sjednocená na `RaK 1.2 (1.126)`, technická verze `1.2.126`, cache `v1.2-1.126`.

## RaK 1.2 (1.125)

- Administrace / Rozpisy: přidané tlačítko `Přesčasy` pro samostatnou správu přesčasových nedělí podle roků.
- U každého přesčasu je přepínač `TO`: zapnuto = přesčas jde na tvrdotu a TNKS01/TPKW01 se půlí 0,5 + 0,5; vypnuto = přesčas nejde na tvrdotu a každý má +1 na zapsaném stroji.
- Přesčasy se ukládají přes stávající machine settings řádek `ROTATION_OVERTIME_SETTINGS`, takže není potřeba měnit Supabase DB ani policies.
- Statistiky, generátor i kontrolní přehled používají nově dynamické nastavení přesčasů; výchozí stav dál obsahuje 1.3.2026 jako `TO` vypnuto / jen MO.
- Release metadata sjednocená na `RaK 1.2 (1.125)`, technická verze `1.2.125`, cache `v1.2-1.125`.

## RaK 1.2 (1.118)

- Administrace/Rozpisy: odstraněné duplicitní tlačítko `OK, odeslat`, protože dělalo stejnou akci jako `Uložit rozpis` a mátlo to.
- Editor rozpisu i návrh z generátoru používají jako jedinou finální akci `Uložit rozpis`; v náhledu generátoru zůstává jen `Otevřít rozpis`.
- Přidaný contract `RAK_ROTATION_SAVE_BUTTON_CONTRACT_V1118` a guard v `npm run test:app-usage`, aby se duplicitní tlačítko nevrátilo.
- Release metadata sjednocená na `RaK 1.2 (1.118)`, technická verze `1.2.118`, cache `v1.2-1.118`.

## RaK 1.2 (1.117)

- Generátor rozpisů: zesílené vyrovnání nýtovačky/TNKS01 podle společného pravidla TNKS01/TPKW01 = 0,5 + 0,5, aby nevznikal stav, kdy má někdo 1,5 a někdo 0.
- Generátor rozpisů: přidané dorovnání poměru MFKF/MSKC, aby člověk nebyl jen na frézkách a jiný jen na soustruhách, pokud existuje rozumný prohoz ve stejném dni.
- Kontrolní přehled po vygenerování je otočený: jména jsou v řádcích, stroje ve sloupcích. Přidané souhrnné sloupce TO a MO.
- Přidaný contract `RAK_ROTATION_GENERATOR_RULES_V1116` a guardy v `npm run test:app-usage`.
- Release metadata sjednocená na `RaK 1.2 (1.117)`, technická verze `1.2.117`, cache `v1.2-1.117`.

## RaK 1.2 (1.115)

- Generátor rozpisu upravený víc podle reálného Martinova postupu: nejdřív návazně rozepíše lidi z Tvrdoty podle toho, kde skončili v minulých měsících, potom řeší základ Měkoty, výměny, absence a až nakonec vyrovnávání.
- Tvrdotní rotace nově používá pořadí `TBKR01 → TNKS01 → TBKR07 → TPKW01 → TPKW02` a drží návaznost přes `previousHardMachine` / `hardCycleCursor`.
- Když Synek/Třasák/Střížek z Měkoty jdou na Tvrdotu, člověk vytlačený z Tvrdoty jde ten den na Měkotu, přednostně na frézky.
- Špadrna a Novotný jsou v generátoru výslovně vedení jako vyrovnávací lidé pro Tvrdotu a zbytek dní spíš pro Měkotu/frézky.
- Přidaný contract `RAK_ROTATION_GENERATOR_RULES_V1115` a test guard pro lidský postup generátoru.
- Release metadata sjednocená na `RaK 1.2 (1.115)`, technická verze `1.2.115`, cache `v1.2-1.115`.

## RaK 1.2 (1.114)

- Generátor rozpisu: Synek/Třasák/Střížek se v 3denním bloku Měkoty na Tvrdotu nově přeskupují podle dostupnosti. Když je někdo dostupný jen první dny a potom má absenci, má jít na Tvrdotu dřív, aby se tvrdotě nevyhnul.
- Generátor rozpisu: přidané vyrovnání samostatných frézek. Samostatná obsluha se počítá jako `MFKF10` s prázdnou `MFKF06` a po vygenerování se prohazuje tak, aby někdo nebyl sám na frézkách opakovaně a jiný vůbec.
- Výsledek generátoru nově vrací `soloMillBalanceSwaps` a pravidla jsou označená jako `1.114`.
- `npm run test:app-usage` hlídá dostupnostní prioritu Měkoty na Tvrdotě i vyrovnání samostatných frézek.
- Release metadata sjednocená na `RaK 1.2 (1.114)`, technická verze `1.2.114`, cache `v1.2-1.114`.

## RaK 1.2 (1.113)

- Generátor rozpisu: kontrolní tabulka stroje × jména teď počítá TNKS01/TPKW01 podle reálného střídání jako 0,5 + 0,5 mimo běžnou neděli; běžná neděle ranní/noční zůstává jako celá směna na zapsaném stroji, přesčasová neděle se střídá.
- Generátor rozpisu: Synek, Třasák a Střížek chodí z Měkoty na Tvrdotu jen na TNKS01/TPKW01/TPKW02 po blocích 3 pracovních dnů na stejný stroj; při absenci se pořadí v bloku přeskupí, aby se tomu člověk nevyhnul.
- Generátor rozpisu: základní soustruhy Měkoty jsou Synek MSKC04, Střížek MSKC03 a Třasák MSKC01, pokud jsou dostupní a nejsou zrovna na Tvrdotě.
- Průvodce generátorem po vygenerování ukazuje náhled celého rozpisu Tvrdota/Měkota a umožňuje návrat na měsíc, dny nebo absence bez naklikání od začátku.
- Přidaný contract `RAK_ROTATION_GENERATOR_RULES_V1113` a testy pro 0,5 přehled, 3denní bloky Měkoty, základní soustruhy a náhled celého rozpisu.
- Release metadata sjednocená na `RaK 1.2 (1.113)`, technická verze `1.2.113`, cache `v1.2-1.113`.

## RaK 1.2 (1.112)

- Generátor rozpisu: výběr měsíce je teď řazený podle roku/měsíce a seskupený podle roku, aby se nepletly měsíce z 2025 a 2026.
- Generátor rozpisu: po vygenerování běží vyrovnání `TNKS01` / nýtovačky. Když někdo vyjde na TNKS01 víckrát a někdo v měsíci vůbec, generátor se pokusí prohodit člověka na TNKS01 s člověkem z tvrdoty dočasně napsaným na Měkotě.
- Přidaný contract `RAK_ROTATION_GENERATOR_MONTH_BALANCE_CONTRACT_V1112` a browser/app-usage guard pro řazení měsíců a rovnoměrnější rozdělení TNKS01.
- Release metadata sjednocená na `RaK 1.2 (1.112)`, technická verze `1.2.112`, cache `v1.2-1.112`.

## RaK 1.2 (1.111)

- Administrace / Rozpisy / generátor: opravené finální `Vygenerovat rozpis` z průvodce, které ve wizard DOMu omylem četlo prázdný editor a tím vytvořilo prázdný návrh / nulový přehled stroje × jména.
- Generátor teď čte `readAdminRotationFromDom` jen v reálném editoru `#adminRotationEditor`; v průvodci používá připravený měsíc ze stavu aplikace.
- Browser smoke nově reálně kliká na `Vygenerovat rozpis` v průvodci a hlídá, že výsledný návrh i kontrolní tabulka stroje × jména mají nenulové hodnoty.
- Release metadata sjednocená na `RaK 1.2 (1.111)`, technická verze `1.2.111`, cache `v1.2-1.111`.

## RaK 1.2 (1.109)

- Administrace / Rozpisy / Generátor: opraveno přidávání další absence ve stejný den. Kliknutí na `+ Přidat jméno` už nemaže vyplněná jména ani kódy v kroku Absence.
- Sběr absencí v průvodci teď používá pracovní dny uložené ve stavu průvodce, protože v kroku Absence už v DOMu nejsou pole z kroku Dny.
- Během editace se zachovávají i prázdné řádky absencí; ignorují se až při přípravě poznámek pro generátor.
- `npm run test:app-usage` a `npm run test:browser-smoke` nově hlídají, že přidání druhého jména ve stejný den zachová už vyplněnou absenci.
- Release metadata sjednocená na `RaK 1.2 (1.109)`, technická verze `1.2.109`, cache `v1.2-1.109`.

## RaK 1.2 (1.108)

- Administrace / Rozpisy: mini přehled Tvrdoty už nezkracuje názvy strojů o první `T`, takže `TNKS01`, `TBKR07`, `TPKW01`, `TPKW02`, `TBKR01` zůstávají celé.
- Administrace / Rozpisy / Absence: přidané tlačítko `+ Přidat další absenci`, aby šlo zadat víc lidí bez ručního boje s jedním řádkem.
- `Vygenerovat návrh` nově otevírá průvodce: volba měsíce, kontrola pracovních dnů, mazání dnů křížkem, přidání dne přes `+`, zadání absencí pro dny a až potom vygenerování návrhu.
- Po vygenerování návrhu se ukáže soukromý kontrolní přehled `stroje × jména`, kde je vidět, kolikrát kdo v daném měsíci vychází na jednotlivé stroje.
- Generátor dál ukládá jen lokální návrh; online uložení zůstává až po ručním kliknutí na `Uložit rozpis`.
- Release metadata sjednocená na `RaK 1.2 (1.108)`, technická verze `1.2.108`, cache `v1.2-1.108`.

## RaK 1.2 (1.107)

- Administrace / Rozpisy: generátor návrhu teď počítá podle pravidel Měkota/Tvrdota místo čistého historického doplnění.
- Před generováním se počítá s tím, že nejdřív doplníš absence a zkontroluješ dny měsíce; generátor čte rozepsané absence přímo z editoru před výpočtem.
- Pravidla generátoru: Střížek, Synek, Třasák, Špadrna a Novotný jsou prioritně Měkota; ostatní zpravidla Tvrdota.
- Měkota lidé se střídají na tvrdotních strojích TNKS01 / TPKW01 / TPKW02; tvrdota drží cyklus TNKS01 / TBKR07 / TPKW01 / TPKW02 / TBKR01.
- Pravidlo absencí: kdykoliv je na frézkách jen jeden člověk, MFKF06 se píše jako neobsazená a člověk na MFKF10 reálně hlídá obě frézky.
- Při dvou absencích generátor nechává MFKF06 i MSKC01 prázdné: jeden člověk na frézkách, dva lidé na soustruhách.
- Generátor umí vynechat den označený v absencích jako svátek / odstávka / bez směny.
- `npm run test:app-usage` a `npm run test:browser-smoke` hlídají pravidlový generátor v1.107 včetně prázdné MFKF06 a MSKC01 při dvou absencích.
- Release metadata sjednocená na `RaK 1.2 (1.107)`, technická verze `1.2.107`, cache `v1.2-1.107`.

## RaK 1.2 (1.106)

- Administrace / Rozpisy: přidané tlačítko `Vygenerovat návrh`, které po zvolení měsíce vytvoří první návrh rozpisu podle historicky vyplněných rotací.
- Generátor vychází z předchozích měsíců, preferuje loňský stejný měsíc jako vzor, hlídá jedno jméno nejvýš jednou v jednom dni, respektuje absence v daný den a snaží se držet historické vazby lidí na stroje.
- Návrh se uloží jen lokálně do rozepsaného rozpisu; online se odešle až po ruční kontrole a kliknutí na `Uložit rozpis`. Obsazený měsíc se před přepsáním ptá na potvrzení.
- Přidaný guard `RAK_ROTATION_GENERATOR_CONTRACT_V1106`, aby generátor zůstal v Administraci/Rozpisech, chránil existující data a neukládal online bez ručního potvrzení.
- Release metadata sjednocená na `RaK 1.2 (1.106)`, technická verze `1.2.106`, cache `v1.2-1.106`.

## RaK 1.2 (1.105)

- Rotace: prázdný stav u přehledu příští směny používá stejnou přirozenou větu jako Dashboard — `Nikdo nebude chybět.`
- Nastavení vzhledu: opravená migrace chybějícího profilového pozadí po aktualizaci. Když profil ještě nemá `uiSettings.backgroundId`, použije se uložené lokální pozadí místo okamžitého návratu na základní `ios-mesh`.
- Přidané guardy `RAK_ROTACE_EMPTY_ABSENCE_TEXT_CONTRACT_V1105` a `RAK_APPEARANCE_UPDATE_PERSISTENCE_CONTRACT_V1105`, aby se prázdný stav Rotace ani pozadí po update nevrátily zpět.
- Release metadata sjednocená na `RaK 1.2 (1.105)`, technická verze `1.2.105`, cache `v1.2-1.105`.

## RaK 1.2 (1.104)

- Přidaný reálný browser smoke test `npm run test:browser-smoke` přes lokální Chromium/CDP.
- Test spouští appku v lokálním Chromiu přes CDP; kvůli policy blokaci localhost/file v sandboxu používá inline `about:blank` načtení celé appky a projíždí mobilní viewporty iPhone 13/14 Pro Max, Samsung A15 / běžný Android a úzký mobil 360×800.
- Browser smoke ověřuje boot aplikace, verzi, spodní navigaci, Dashboard karty, Rotace export canvas, výšku voleb v Brusech proti Frézky presetům, Hry, Menu/Více a pevné pozadí.
- Browser smoke zároveň odhalil, že volné indexy Brusy v reálném layoutu zůstávaly na 48 px; doplněný pozdní selector je dorovnal na 58 px stejně jako ostatní volby a Frézky presety.
- Přidaný `RAK_BROWSER_SMOKE_CONTRACT_V1103` a `npm run test:app-usage` hlídá, že browser smoke test zůstává součástí balíčku i release kontrol.
- Release metadata sjednocená na `RaK 1.2 (1.104)`, technická verze `1.2.104`, cache `v1.2-1.104`.

## RaK 1.2 (1.102)

- Rotace / volba jmen: delší jména v klikacích políčkách se na užších displejích líp vejdou díky menšímu adaptivnímu písmu, povolenému zalomení a zrušení ořezávání textu.
- Statistiky / volba jmen: stejné fit pravidlo je přidané i pro jmenné dlaždice ve Statistikách, bez změny výpočtů nebo logiky výběru.
- Přidaný contract `RAK_NAME_CHOICE_FIT_CONTRACT_V1102` a guard v `npm run test:app-usage`, aby se jména nevrátila k ořezávání/ellipsis.
- Bez zásahu do spodní lišty, Dashboardu, výpočtů, exportu Rozpisů, her nebo Supabase DB/policies.
- Release metadata sjednocená na `RaK 1.2 (1.102)`, technická verze `1.2.102`, cache `v1.2-1.102`.

## RaK 1.2 (1.101)

- Kalkulačky / Výpočet kusů / Brusy: volby `TBKR01`, `TBKR07`, `AD`, `AE`, `AH`, `AD volné` a `AE volné` jsou dorovnané velikostí na preset tlačítka z Korekce / Frézky.
- Pozadí celé appky je pevně ukotvené vůči viewportu: při scrollování se hýbe obsah nad pozadím, ne pozadí samotné, aby glass panely a ikonky působily přirozeněji.
- Přidané contracty `RAK_BRUSY_CHOICE_SIZE_CONTRACT_V1101` a `RAK_FIXED_APP_BACKGROUND_CONTRACT_V1101`.
- `npm run test:app-usage` hlídá sjednocenou velikost voleb Brusy a pevné pozadí celé appky.
- Browser smoke test z plánovaného kroku byl odložený, protože do buildu šly konkrétní UI úpravy.
- Release metadata sjednocená na `RaK 1.2 (1.101)`, technická verze `1.2.101`, cache `v1.2-1.101`.

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
