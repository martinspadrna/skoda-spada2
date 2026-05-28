# RaK v.1.5 (937) – pokus o monkey test v kontejneru

## Stav
Bezpečný Playwright monkey test byl připraven a pokusil se spustit v kontejneru nad systémovým Chromium.

## Výsledek v tomto prostředí
Běh neproběhl do aplikace, protože Chromium v kontejneru odmítlo otevřít lokální `http://127.0.0.1` i `file://` URL chybou:

```text
net::ERR_BLOCKED_BY_ADMINISTRATOR
```

Předtím bylo nutné doinstalovat `@playwright/test`. Pokus o stažení Playwright Chromium browseru nevyšel kvůli nedostupnosti `cdn.playwright.dev` z kontejneru.

## Závěr
Test skript je připravený, syntakticky ověřený a má bezpečnostní filtry proti destruktivním akcím. Reálný monkey průchod je potřeba spustit v běžném lokálním prostředí / CI, kde Chromium nemá administrátorský blok lokálních URL.
