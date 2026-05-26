# RaK v.1.5 (920) – Performance budget audit

Read-only audit doplňuje původní due diligence zadání o výkonovou část.

## Kontroluje

- počet lokálních a externích skriptů,
- počet stylesheetů,
- orientační DOM povrch,
- počet prvků s `data-action`,
- velikost localStorage podle délek hodnot,
- dostupné `performance.getEntriesByType("resource")` metriky,
- varování pro slabší mobilní zařízení.

## Nemění

- gameplay,
- DOM strukturu,
- Supabase DB,
- Supabase policies,
- service worker strategii.

## Další krok

Reálné měření na mobilu: cold load, warm load, route switch a spuštění hry.
