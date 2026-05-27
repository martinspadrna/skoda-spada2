# RaK v.1.5 – stručný souhrn 901–950 po v935

Blok v.1.5 901–950 drží historii stručně po větších změnách, ne po každém mikrobuildu.

## Hlavní změny v bloku 901–950

- Auditní a release readiness dokumenty byly formálně uzavřené ve v924.
- v925 přidala praktické validační checklisty pro mobil, browser, Playwright a post-release kontrolu.
- v926 rozšířila achievementy, odměnová témata/pozadí a profilové ukládání vzhledu.
- v927–v930 ladily Rotace dock, Láďův výkonový režim a Dashboard glass styl.
- v931–v932 sjednotily přepínání znaménka +/− u korekcí frézek.
- v933 přidala announcement ticker na Dashboardu.
- v934 vylepšila tmavší jednotný Dashboard, volitelný nadpis oznámení, ticker bez zdvojeného textu a theme barvy ikon.
- v935 dělá Dashboard průhlednější při zachování tmavšího odstínu a mění oznámení na online-first Supabase režim s lokálním fallbackem.

## Ruční ověření po v935

- Ověřit glass vzhled Dashboardu na více tématech.
- Ověřit Láďův / low-end režim.
- Ověřit online uložení a vypnutí oznámení na více zařízeních.
- Pokud Supabase zápis neprojde, ověřit policy pro tabulku `announcements` mimo build aplikace.
