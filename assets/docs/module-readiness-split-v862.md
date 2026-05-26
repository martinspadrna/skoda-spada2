# RaK module readiness split – v.1.5 (862)

Cíl buildu: bezpečně oddělit první auditní/runtime helper z hlavního `app.js` bez změny chování aplikace.

## Co se změnilo

- `module-readiness.js` je nový samostatný runtime helper.
- Původní module readiness registry už není vložený na začátku `app.js`.
- `index.html` načítá `module-readiness.js` hned po `data.js` a před `app.js`.
- `app.js` se po načtení jen zaregistruje přes `window.rakMarkModuleReady('app.js', 'loaded')`.
- Service worker precache i export ZIPu nově obsahují `module-readiness.js`.

## Proč je to bezpečné

- Nezměnil se datový model, hry, Supabase policies ani online flow.
- Registry zůstává dostupný přes stejné globální API:
  - `window.__rakModuleReadinessRegistry`
  - `window.rakMarkModuleReady()`
  - `window.getRakModuleReadinessHealth()`
- Module readiness expected list nově počítá i `module-readiness.js`, takže diagnostika vidí i samotný oddělený helper.

## Ověření po nasazení

V Diagnostice zkontrolovat:

- `Module readiness` má být OK.
- `module-readiness.js` má být mezi načtenými moduly.
- `app.js` má být načtený až po registry.
- `Architektura/boot` nesmí hlásit chybějící `module-readiness.js`.

Browser/mobil smoke test v kontejneru neproběhl, je potřeba ověřit po nahrání aplikace na mobil.
