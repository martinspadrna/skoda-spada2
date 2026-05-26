# RaK v.1.5 (923) – Playwright/DOM smoke kostra

Přidané soubory:

- `playwright.config.js`
- `playwright-smoke.spec.js`

## Spuštění

```bash
npx playwright install chromium
npm run test:smoke
```

## Co smoke hlídá

- Aplikace nabootuje a `body` je viditelné.
- Spodní navigace a dashboard prvky existují.
- Hry se otevřou bez prázdné obrazovky.
- Diagnostika vrací finální due diligence closure.

Test je připravený jako minimální bezpečný krok. Není automaticky blokující v běžném `npm run check`, aby se nerozbil jednoduchý ZIP build bez instalovaného Playwrightu.
