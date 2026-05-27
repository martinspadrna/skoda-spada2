# RaK v.1.5 (925) – ruční validační runbook

## Účel
Tento dokument navazuje na formální prompt-compliance uzávěrku v924. v925 nemění Supabase DB, policies, online flow, gameplay, dashboard, spodní lištu, rotace ani kalkulačky. Smyslem je připravit jasný postup pro reálný test, který Martin udělá později na mobilu/prohlížeči.

## Stav
- Dokumentační auditní/prompty: hotovo.
- Statický ZIP/preflight: ověřuje se při buildu.
- Reálný mobilní smoke: manual.
- Skutečný Playwright běh: manual.
- PWA/hosting post-release validace: manual.

## P0 smoke scénáře
| ID | Oblast | Postup | Očekávaný výsledek | Blokuje release? |
|---|---|---|---|---|
| M-01 | Start aplikace | Otevřít appku po tvrdém reloadu. | Nezůstane bílá obrazovka, načte se Home/Dashboard. | ano |
| M-02 | Spodní lišta | Proklikat Home, Rotace, Kalkulačky, Rozpisy, Statistiky, Hry, Více. | Aktivní položka se zvýrazní, stránka se nepřekrývá spodní lištou. | ano |
| M-03 | Kantýna/jídelna | Zkontrolovat karty i rozklik. | Běžná otevírací doba a přesčasové rozdíly dávají smysl, rozdíly se neopakují zbytečně. | ano |
| M-04 | Hry Top score | Otevřít Hry a Top výsledky. | Časy bez milisekund, datum + čas tam, kde se má zobrazovat. | ano |
| M-05 | Reaction Test | Odehrát krátký test. | Top score není schované za spodní/neviditelnou vrstvou. | ano |
| M-06 | Denní challenge | Odehrát challenge. | Výsledek se propíše i do Top score Denní challenge. | ano |
| M-07 | Piškvorky offline AI | Odehrát pár tahů na nejtěžší obtížnost. | Offline AI běží, UI nezamrzne, online Piškvorky zůstaly beze změny. | ano |
| M-08 | Online Piškvorky | Jen pokud je čas a druhý mobil: vytvořit link/kód a připojit se. | Create/accept/realtime stále funguje. | ano pro produkci |
| M-09 | Online Lodě | Jen pokud je čas a druhý mobil: vytvořit a přijmout hru. | Online flow se nerozbilo. | ano pro produkci |
| M-10 | Export ZIP | Spustit export v aplikaci. | Název ZIPu odpovídá v925, export nespadne. | ano |
| M-11 | O aplikaci | Otevřít historii. | Historie je stručná po blocích, ne dlouhý mikrovýpis. | ne |
| M-12 | Diagnostika/release gates | Otevřít dostupné diagnostické informace. | Dokumenty OK, mobil/Playwright manual. | ne |

## Doporučená zařízení
| Zařízení | Viewport / cíl | Priorita |
|---|---:|---|
| Samsung A15/A14 třída | cca 360 × 800 | P0 |
| iPhone 13 Pro Max třída | cca 428 × 926 | P1 |
| Edge desktop F12 | responsive + desktop | P1 |

## Co si poznamenat při testu
- přesný build, který se testoval: `v.1.5 (925)`,
- zařízení a prohlížeč,
- jestli šlo o novou instalaci, tvrdý reload nebo aktualizaci přes cache,
- krok, kde chyba vznikla,
- screenshot nebo krátký popis,
- zda chyba blokuje použití appky.

## Výsledek testu
Dokud nebude test reálně provedený, výsledek zůstává `manual`. Tohle je záměrně poctivější než tvrdit, že mobilní/browser validace proběhla jen na základě statického auditu.
