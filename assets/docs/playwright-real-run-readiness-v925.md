# RaK v.1.5 (925) – Playwright skutečný běh

## Účel
v923 přidala první Playwright smoke skeleton. v925 k tomu doplňuje praktický runbook, aby se test dal spustit opakovaně a bez zásahu do produkční Supabase DB/policies.

## Doporučený postup
```bash
npm install
npx playwright install chromium
npm run check
npm run test:smoke
```

Pro test proti už běžícímu lokálnímu serveru:
```bash
RAK_SKIP_WEB_SERVER=1 RAK_BASE_URL=http://127.0.0.1:4173 npm run test:smoke
```

## Co test nesmí dělat
- nemazat Supabase data,
- neměnit policies,
- nezakládat ostré online zápasy bez jasného testovacího režimu,
- neklikat destruktivní reset uživatelských dat,
- netvrdit produkční připravenost, pokud proběhl jen lokální smoke.

## Aktuální smoke suite
| Test | Kryje | Stav |
|---|---|---|
| Dashboard boot | základní start appky, spodní lišta, kantýna, jídelna | připraveno |
| Games page opens | přepnutí na Hry bez blank screenu | připraveno |
| Due diligence diagnostics | existence final audit closure helperu | připraveno |
| v925 manual validation diagnostics | existence validačního helperu pro manual gates | připraveno |
| Release gate matrix | release gates musí být čitelné bez pádu | připraveno |

## Interpretace výsledku
| Výsledek | Co znamená | Další krok |
|---|---|---|
| `npm run check` OK, Playwright nespustitelný kvůli chybějícím browserům | statika OK, runtime neověřený | nainstalovat browsery a spustit znovu |
| Playwright fail na bootu | P0 blokér | opravit před testem na mobilu |
| Playwright fail jen na volitelném textu | P1/P2 podle dopadu | ručně ověřit, upravit selektor nebo UI |
| Playwright OK | dobrý signál | pořád ještě udělat mobilní smoke |

## Manual gate
Skutečný Playwright běh v tomto ZIP buildu neproběhl. Dokument pouze připravuje postup a testy. Stav tedy zůstává `manual`, dokud se test skutečně nespustí v prostředí s Playwright browserem.
