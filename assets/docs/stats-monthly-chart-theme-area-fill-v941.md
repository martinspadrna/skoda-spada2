# RaK v.1.5 (942) – Obsazenost strojů: theme výplň jen pod čárou

- Celoplošný tint grafu z v940 je vypnutý.
- Jemné podbarvení je pouze v polygonu pod čárou grafu, tedy přesně v místě, kde předtím vznikala černá plocha.
- Barva se vypočítá z aktuálního theme jako explicitní inline `rgba(...)`, aby SVG nespadlo do černého fallbacku přes CSS proměnné.
- Čára, body a mřížka zůstávají theme-aware.
