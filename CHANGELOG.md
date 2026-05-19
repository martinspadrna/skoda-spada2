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
