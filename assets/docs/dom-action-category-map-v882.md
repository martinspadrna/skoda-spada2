# RaK v.1.5 (882) – DOM/action category map

Cíl buildu: rozšířit DOM/action registry audit o bezpečnou kategorizaci akcí bez změny funkčnosti aplikace.

## Co je nové

- `rak-dom-action-audit.js` dál jen read-only mapuje DOM.
- Každý prvek s `data-action` nebo `data-rak-open-calendar` dostává auditní kategorii.
- Kategorie jsou: navigace, dashboard, externí odkazy, kalkulačky, korekce, hry, rotace/statistiky, nastavení/diagnostika a ostatní.
- `getRakDomActionRegistryHealth()` vrací `categorySummary`, `actionCategoryCounts`, `categoryCount`, `uncategorizedActionCount` a krátké vzorky prvků.
- Nekategorizované akce jsou warning, ne blokace. Slouží jen jako mapa pro další refactor.

## Co se nemění

- Navigace se nepřepojuje.
- Render stránek se nepřepojuje.
- Herní logika se nemění.
- Online flow a Supabase policies se nemění.

## Proč

Před budoucím refactorem klikacích akcí je potřeba vědět, které akce patří do které části aplikace. Díky tomu půjde později bezpečně rozdělovat obsluhu akcí po menších skupinách, ne jedním velkým riskantním přepisem.
