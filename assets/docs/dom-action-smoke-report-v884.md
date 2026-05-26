# RaK v.1.5 (884) – DOM/action smoke report

Bezpečný read-only krok navazuje na DOM/action registry audit z v881–v883.

## Co build přidává

- nový smoke report `getRakDomActionSmokeReport()`,
- ruční spuštění přes `runRakDomActionSmokeReport()`,
- poslední stav DOM/action mapy je vidět v Diagnostice / O aplikaci,
- report sleduje počet akcí, kategorií, pokrytí target mapy, issue/warning počty a krátké vzorky problémů.

## Bezpečnostní pravidlo

Smoke report nic nepřepojuje a nemění funkční handler kliknutí. Pouze čte DOM a poslední výsledek ukládá do runtime diagnostického objektu `window.__RAK_DOM_ACTION_SMOKE_REPORT__`.

## Co zůstává beze změny

- navigace,
- render stránek,
- hry,
- online flow,
- Supabase DB a policies,
- kalkulačky a korekce.
