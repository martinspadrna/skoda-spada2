# RaK v.1.5 (902) – Release ops checklist

Build v902 doplňuje read-only release ops vrstvu. Cíl je mít v aplikaci i v ZIPu jasnou kontrolu před vydáním, aniž by se měnil běh hotových funkcí.

## Rozsah

- Přidán helper `getRakReleaseOpsChecklistHealth()`.
- Helper pouze čte existující diagnostiky a vrací gate seznam.
- Bez Supabase DB změn.
- Bez Supabase policy změn.
- Bez zásahu do online Piškvorek, Lodí, dashboardu, rotací nebo kalkulaček.

## Gate kategorie

1. Release readiness helper.
2. Verze / cache / realtime kanál.
3. Module readiness.
4. Export ZIP / manifest.
5. DOM/action closure.
6. Storage/offline sync closure.
7. Supabase queue closure.
8. Online hry create/accept/save kontrakty.
9. Kantýna/jídelna neděle.
10. Ruční browser/mobil smoke.
11. Rollback bod.

## Pravidla

- `readyForZip` může být true i bez browser smoke, pokud nejsou blockery.
- `readyForProduction` zůstává false, dokud neproběhne ruční browser/mobil smoke.
- Ruční kontroly nejsou chyba buildu; jsou záměrný release gate.

## Ověření

V konzoli nebo přes Diagnostiku:

```js
window.getRakReleaseOpsChecklistHealth()
window.getRakReleaseOpsClosureHealth()
```
