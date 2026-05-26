# RaK v.1.5 (877) – exportní manifest jako jeden zdroj pravdy

Cíl buildu: zmenšit technický dluh v exportní vrstvě bez změny funkce aplikace.

## Co je hotové

- `export.js` má nový helper `getRakExportManifest()`.
- ZIP export i auditní inventura používají stejný manifest souborů.
- Manifest vrací samostatně:
  - JS soubory,
  - textové/runtime soubory,
  - binární assety.
- `getRakExportSourceInventoryHealth()` hlídá manifest split a počty manifest cest.
- Diagnostika má opravené zalamování dlouhých řádků, aby nepřetékaly mimo buňku.
- „O aplikaci“ má aktuální historii zkrácenou do souhrnných bloků po větších verzových úsecích.

## Záměrně beze změny

- Piškvorky AI.
- Herní logika.
- Online flow.
- Supabase DB/policies.
- Dashboard.
- Spodní lišta.
- Kalkulačky.

## Další bezpečný krok

Pokračovat v export/release tooling fázi: ověřit, jestli lze auditní manifest použít i pro kontrolu chybějících souborů před exportem.
