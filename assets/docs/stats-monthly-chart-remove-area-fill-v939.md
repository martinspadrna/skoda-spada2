# RaK v.1.5 (939) – Obsazenost strojů: odstranění černé SVG výplně grafu

Důvod buildu: na reálném mobilním zobrazení zůstávala v měsíčním grafu obsazenosti strojů černá plocha pod/mezi body. Podle screenshotu nešlo o pozadí celé karty, ale o SVG area path pod čárou grafu.

## Oprava

- Riziková vrstva `statsOccupancyLineArea` se už do SVG nevkládá jako viditelný prvek.
- Area path má navíc bezpečnostní atributy `fill="transparent"`, `stroke="none"`, `opacity="0"` a `display:none`.
- CSS fallback vrstvu také vypíná přes `display:none !important`.
- Theme vzhled grafu zůstává na čáře, bodech a mřížce.

## Proč ne další poloprůhledná výplň

SVG bez explicitního validního fillu umí spadnout na výchozí černou výplň. U některých kombinací CSS proměnných, `rgba(var(...))` a mobilního WebView je bezpečnější výplň úplně vypnout než ji dál ladit přes fallbacky.

## Ověření

Ručně ověřit ve Statistiky → Obsazenost strojů, že pod čárou grafu není černá plocha a graf pořád vizuálně sedí k aktivnímu theme.
