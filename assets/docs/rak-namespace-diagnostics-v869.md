# RaK v.1.5 (869) – `window.RaK.diagnostics.*` read-only krok

Tento build je první praktický krok po pasivním `window.RaK` namespace bridge.

## Cíl

Začít používat `window.RaK.diagnostics.*` pouze pro nové auditní čtení. Staré globály zůstávají zdroj pravdy kvůli kompatibilitě.

## Co se změnilo

- `rak-namespace.js` má nový helper `window.RaK.diagnostics.read(alias)`.
- Helper umí bezpečně zavolat diagnostické aliasy z namespace a při chybě vrátit kontrolovaný výsledek místo pádu.
- `getRakArchitectureBaselineHealth()` čte module readiness, boot sequence a namespace health přes namespace reader s fallbackem na staré globály.
- Diagnostika v menu čte nové auditní helpery přes `window.RaK.diagnostics.read()`.
- `getPhaseTenRuntimeReadinessHealth()` používá namespace reader pro auditní helpery, ale runtime navigace/render/hry se nepřepojovaly.

## Co se záměrně neměnilo

- žádné přepojení navigace,
- žádné přepojení renderu stránky,
- žádný zásah do her,
- žádný zásah do online flow,
- žádný zásah do Supabase policies,
- žádný zásah do dashboardu, spodní lišty nebo kalkulaček.

## Stav fáze

Globální coupling / `window.RaK` namespace fáze: přibližně 50 %.

Další bezpečný krok je pokračovat jen v auditních helper read-only vazbách a teprve později řešit menší runtime aliasy po samostatném testu.
