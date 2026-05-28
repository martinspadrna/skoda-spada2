# RaK v.1.5 (950) – Piškvorky: samostatná verze pravidel a žebříček

## Co se mění

Piškvorky mají vlastní verzi pravidel/obtížnosti `GOMOKU_RULESET_VERSION` oddělenou od verze celé aplikace.

- Vzhledová úprava aplikace nemění žebříček Piškvorek.
- Změna AI obtížnosti nebo pravidel Piškvorek má navýšit jen `GOMOKU_RULESET_VERSION`.
- Online tabulka `gomoku_wins` se načítá jen pro aktuální `ruleset_version`.

## Oprava viditelnosti výher

Původní načítání výsledků řadilo podle sloupců `priority` a `updated_at`, které tabulka `gomoku_wins` nemá. To mohlo vracet chybu a v aplikaci pak nebyly výsledky vidět, i když v Supabase existovaly.

Nově se čte:

- `ruleset_version = aktuální GOMOKU_RULESET_VERSION`,
- řazení z DB podle `created_at desc`,
- finální pořadí v UI podle tahů, času a data.

## DB změna

Do `public.gomoku_wins` byl přidaný sloupec `ruleset_version` a index `(ruleset_version, created_at desc)`.
