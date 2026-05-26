# RaK v.1.5 (923) – Piškvorky AI hardening

Důvod: hráč znovu porazil nejtěžší AI kolem 13. tahu.

## Změny

- Přidána vrstva `tttBestThirteenTurnClampMove()`.
- AI víc penalizuje rané dvoutahové pasti, forky, open-two/open-three tlak a nejhorší odpověď hráče.
- Raný a střední minimax search depth navýšen.
- Delší budgety pro rané lock vrstvy.
- Online Piškvorky beze změny.

## Ověření

Statická syntax kontrola proběhla přes `npm run check`. Reálná síla AI čeká na test hráčem.
