# RaK v.1.5 (930) – Rotace dock jmen a Dashboard iOS glass

## Cíl buildu

Build v930 řeší dvě vizuální připomínky z reálného používání:

1. Panel jmen v Rotaci po přepnutí na stránku stále lehce poskakoval a dlaždice jmen byly po předchozí stabilizaci menší, než mají být.
2. Dashboard má jít víc do průhledného iOS glass stylu a ikonky v kartách nemají mít vlastní barevnou kapsli/pozadí.

## Změny v Rotaci

| Oblast | Úprava | Důvod | Riziko |
| --- | --- | --- | --- |
| `ui.js` | `scheduleRotaceNamesDockMetrics()` už nedělá opožděný `requestAnimationFrame`/`setTimeout` přepis pozice. | Pozdní přepočet `bottom`/`max-height` byl pravděpodobný zdroj viditelného doskoku po otevření Rotace. | Nízké, helper zůstává read-only diagnostika. |
| `ui.js` | `updateRotaceNamesDockMetrics()` čte stav a ukládá diagnostiku, ale nepřepisuje layoutové CSS proměnné. | Pozice docku je stabilní CSS pravidlo, ne proměnlivý runtime výpočet. | Nízké. |
| `styles-overrides.css` | Přidaná finální v930 CSS vrstva s pevnou stabilní rezervou nad spodní navigací. | Panel má zůstat vidět na různých mobilech bez cuknutí. | Nízké až střední – nutný mobilní vizuální smoke. |
| `styles-overrides.css` | Dlaždice jmen vrácené na větší velikost. | Předchozí v928 vrstva je na menších displejích moc zmenšila. | Nízké. |

## Změny v Dashboardu

| Oblast | Úprava | Důvod | Riziko |
| --- | --- | --- | --- |
| Dashboard karty | Silnější průhledný iOS glass vzhled, theme-aware tint, border a glow. | Vzhled má být modernější a víc propojený s aktivním tématem. | Nízké. |
| Ikony | Odstraněná vlastní kapsle/pozadí kolem ikon. | Ikonka má být čistá, bez dalšího panelu uvnitř panelu. | Nízké. |
| Láďův / low-end režim | Zachovaný fallback bez těžkého blur efektu. | Glass nesmí zhoršit plynulost slabšího telefonu. | Nízké. |

## Ověření

Automaticky lze ověřit pouze syntaxi, manifesty, export a přítomnost helperů. Ručně je potřeba ověřit:

- Rotace na mobilu po přepnutí ze spodní lišty: panel jmen nesmí poskočit.
- Rotace na menším mobilu: panel musí zůstat vidět nad spodním panelem.
- Dlaždice se jmény mají být zase větší a čitelné.
- Dashboard v několika tématech: panely mají být průhlednější iOS glass.
- Ikonky na Dashboardu už nesmí mít vlastní barevné pozadí.
- Láďův režim: Dashboard se nesmí znatelně sekat.

## Záměrně beze změny

- Supabase DB a policies.
- Online Piškvorky a online Lodě.
- Gameplay pravidla.
- Výpočty rotací.
- Dashboard obsah, pořadí karet a navigace.
