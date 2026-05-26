# RaK module readiness audit – v.1.5 (861)

## Cíl

Tento build přidává pouze bezpečný runtime registry pro načítání modulů. Nemění funkční logiku aplikace, hry, online flow ani Supabase policies.

## Co registry sleduje

- očekávané runtime moduly z dynamického loaderu v `app.js`,
- modul `data.js`, který se načítá přímo z `index.html` před `app.js`,
- modul `app.js`, který vlastní boot loader,
- stav `loading`, `loaded`, `ready` nebo `error`,
- pořadí načtení modulů,
- orientační dobu načtení jednotlivých scriptů,
- poslední boot události pro diagnostiku.

## Nové runtime helpery

- `window.rakMarkModuleReady(name, status, meta)`
- `window.getRakModuleReadinessHealth(expectedOverride)`

## Proč je to důležité

Aplikace je stále statická PWA bez bundleru. Moduly se načítají postupně přes klientský loader. Před větším refactorem je potřeba vidět, jestli se opravdu načetlo vše, v jakém pořadí a jestli některý modul nepadá tiše.

## Readiness signály

Diagnostika nově ukazuje:

- počet očekávaných modulů,
- počet načtených modulů,
- chybějící moduly,
- moduly s chybou,
- orientační délku bootu,
- návaznost na architektura/boot baseline audit.

## Další bezpečný krok

Další refactor má být pořád in-place a po malých krocích. Registry se má použít jako guard před přesouváním logiky z `app.js` do menších modulů.
