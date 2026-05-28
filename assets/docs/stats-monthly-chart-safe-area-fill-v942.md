# RaK v.1.5 (942) – Obsazenost strojů: bezpečná theme výplň jen pod čárou

- Vrácené jemné podbarvení pouze do oblasti pod čárou grafu.
- Barva se nastavuje jako explicitní `rgb(...)` plus `fill-opacity`, ne jako `rgba(...)` ve SVG atributu.
- Tím se snižuje riziko černého SVG fallbacku na mobilních WebView.
