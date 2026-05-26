# RaK v.1.5 (923) – První Playwright/DOM smoke návrh

## Cíl

Připravit minimální testovací kostru bez zavedení nové závislosti do aktuálního buildu.

## Navržené smoke testy

1. Aplikace nabootuje bez prázdné stránky.
2. Spodní navigace je vidět a aktivní karta se mění.
3. Dashboard zobrazí hlavní karty.
4. Hry se otevřou a karty her jsou viditelné.
5. Reaction Test po dohrání ukáže Top score nad spodní lištou.
6. Denní challenge po výsledku propíše score do vlastní tabulky.
7. O aplikaci / Diagnostika ukáže release gates a due diligence progress.

## Poznámka

Playwright zatím nepřidávat do package.json jako povinnou závislost. Nejmenší bezpečný krok je samostatná testovací větev nebo lokální smoke složka mimo produkční DB.
