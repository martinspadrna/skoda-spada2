# Dashboard glass theme – v929

## Cíl
Dashboard panely mají působit jako průhledný glass styl a současně se barevně řídit aktivním tématem aplikace.

## Změna
- `#home .dashboardShell`, `.dashboardHeroCard` a `.dashboardCard` používají theme proměnné `--green`, `--green2`, `--panel`, `--panel2`, `--rakThemeGlow`, `--rakThemeBorder` a `--rakBgAccent`.
- Karty mají jemný průhledný overlay, barevný border/glow podle tématu a zachované čitelné hodnoty.
- Hover/aktivní stav používá aktuální theme barvu, ne natvrdo zelenou.
- Ikonové kapsle na dashboardu dostaly jemný theme tint.

## Výkonový guard
Láďův režim, `lightweightMode` a `lowEndDevice` mají levnější fallback:
- vypnutý těžký `backdrop-filter`,
- jednodušší background,
- menší stíny,
- bez pseudo-element shimmer/glow vrstev.

## Ověření
Read-only helper:

```js
getRakDashboardGlassThemeHealth()
```

Vrací aktivní theme, pozadí, theme proměnné a informaci, jestli běží plný glass nebo odlehčený režim.

## Ruční test
1. Otevřít Dashboard.
2. Přepnout několik témat včetně sytých reward témat.
3. Ověřit, že karty mění border/glow/tint podle tématu.
4. Zapnout Láďův režim a ověřit, že se vzhled nezasekává a texty zůstávají čitelné.
