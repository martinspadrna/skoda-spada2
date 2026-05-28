# RaK v.1.5 (937) – bezpečný monkey test

## Cíl
Přidat automatizovaný monkey smoke test, který náhodně prochází aplikaci a hledá pády, bílé obrazovky, závažné JS chyby a rozpad základní navigace.

## Bezpečnostní omezení
Monkey test nekliká na destruktivní nebo online akce podle textu a selektorů:
- mazání / reset,
- ukládání / odesílání,
- Supabase / online akce,
- admin akce,
- pozvánky a potvrzování online her.

## Spuštění
```bash
npm run test:monkey
```

Pro lokální běh bez Playwright browser installu lze použít systémový Chromium:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium RAK_WEB_COMMAND="python3 -m http.server 4173" npm run test:monkey
```

## Výstup
Test ověřuje:
- appka naběhne,
- projde několik sekcí,
- tělo stránky zůstane viditelné,
- nevzniknou závažné `pageerror` / console error chyby,
- release gate helper existuje,
- helper grafu vrací odstraněnou černou výplň.
