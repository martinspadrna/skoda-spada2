# RaK v.1.5 (876) – export/release tooling mapa

Cíl buildu: zahájit další bezpečnou fázi po uzavření `window.RaK` read-only namespace vrstvy.

## Co je nové

- Přidaný helper `rak-export-release-audit.js`.
- Přidaná diagnostika `getRakExportReleaseToolingHealth()`.
- `export.js` vystavuje read-only inventuru ZIP zdrojů přes `getRakExportSourceInventoryHealth()`.
- Binární exportní assety jsou deduplikované přes `Set`.
- Helper je zapojený do `index.html`, `sw.js`, `export.js`, `package.json`, boot auditů a dokumentace.

## Záměrně beze změny

- Piškvorky AI.
- Herní logika.
- Online flow.
- Supabase DB/policies.
- Dashboard.
- Spodní lišta.
- Kalkulačky.

## Další krok

Oddělit exportní manifest mimo tělo `exportCurrentHtml()`, aby ZIP export i audit používaly jeden společný zdroj pravdy.
