# RaK v.1.5 (874) – auditní read-only přepojení přes window.RaK

Build v874 dělá první malé přepojení, které už opravdu používá `window.RaK`, ale jen pro diagnostické čtení.

## Co se změnilo

- `rak-namespace.js` přidává `window.RaK.diagnostics.readWithFallback(alias, fallbackGlobalName, args)`.
- Auditní helpery v `app.js`, `ui.js` a `rak-audit-baseline.js` používají nový helper pro čtení diagnostiky.
- Když alias přes namespace není dostupný, helper spadne zpět na původní legacy globální funkci.
- Namespace diagnostika počítá i fallback čtení a poslední fallback alias.

## Co se neměnilo

- Navigace zůstává přes původní globály.
- Render zůstává přes původní globály.
- Hry a online flow zůstávají beze změny.
- Supabase DB a policies zůstávají beze změny.

## Bezpečnostní pravidlo

Tahle fáze smí přepojovat jen read-only auditní čtení. Žádné mutace stavu, navigace, ukládání, hry ani online flow přes `window.RaK` zatím nepřepojovat.
