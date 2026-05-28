# RaK v.1.5 (937) – měsíční graf obsazenosti bez černé výplně

## Problém
V měsíčním grafu obsazenosti strojů zůstávala pod / mezi body tmavá až černá výplň. Působilo to mimo aktivní theme a při některých prohlížečích mohlo dojít k fallbacku SVG výplně na černou barvu.

## Úprava
- SVG plocha grafu má explicitně průhledné pozadí.
- Plocha pod linkou používá stabilní `rgba(var(--theme-rgb), …)` místo `color-mix(..., transparent)`, které může u SVG fallbackovat špatně.
- Čára, body, mřížka i focus stav používají aktuální theme.
- Low-end / Láďův režim má lehčí výplň bez těžkých efektů.

## Ověření
- `getRakStatsMonthlyThemeChartHealth()` vrací `blackAreaFillRemoved: true` a `svgAreaUsesStableRgba: true`.
- Ručně ověřit ve Statistikách → Obsazenost strojů, že graf nemá černou plochu pod/mezi body.
