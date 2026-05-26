# RaK v.1.5 (905) – Release gate matrix

Cíl: převést dosavadní read-only closure audity do jednoho pohledu před ZIPem. Matice jen čte existující diagnostiky a vrací statusy `blocker`, `warning`, `manual` a `ok`.

## Helpery

- `getRakReleaseGateMatrixHealth()` – souhrn gate matice.
- `getRakReleaseGateClosureHealth()` – closure fáze K.
- `getRakReleaseGatePolicy()` – pravidla, kdy je něco blocker/warning/manual.

## Statické blockery

- nesedící verze/cache/realtime/package/export,
- chybějící nebo chybový modul v module readiness,
- rozbitý export manifest,
- nečekaná DB/policy mutace v buildu, který ji neměl dělat.

## Ruční kontroly

- mobil/browser smoke,
- PWA cache tvrdý reload,
- online Piškvorky link + ruční kód na dvou mobilech,
- Lodě create/accept/save na dvou mobilech,
- Top score po resetu,
- kantýna/jídelna: běžná neděle zavřeno, přesčasová neděle označená.

## Bezpečnostní pravidlo

Vrstva je read-only. Nemaže data, nemění Supabase DB, nemění policies, nepřepojuje online flow a nesahá do herní logiky.
