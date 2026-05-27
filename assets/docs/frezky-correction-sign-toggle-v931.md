# RaK v.1.5 (931) – Korekce Frézky: přepínače znaménka +/−

## Cíl

Build v931 doplňuje do korekcí na frézkách stejné ovládání znaménka, jaké už je u korekcí na soustruhách.

## Rozsah změny

| Oblast | Změna | Riziko |
|---|---|---|
| `index.html` | U polí aktuální korekce `Konicita` a `fhβ` přidané tlačítko `+ / −` před input. | Nízké |
| `soustruhy.js` | Přidané helpery pro přepínání znaménka frézek a read-only health helper. | Nízké |
| `app.js` | Delegovaný handler `toggle-frezky-correction-sign` a input listener pro synchronizaci tlačítka při ručním zápisu. | Nízké |
| `styles-overrides.css` | Přidaný stejný vizuální styl znaménkových tlačítek jako u soustruhů. | Nízké |
| `rak-dom-action-audit.js` | Doplněná kontrola povinného `data-target-input`. | Nízké |
| `rak-release-gates.js` | Doplněný release gate signál pro korekce frézek. | Nízké |

## Chování

- Tlačítko ukazuje `+`, pokud pole nemá záporné znaménko.
- Tlačítko ukazuje `−`, pokud hodnota začíná záporným znaménkem.
- Kliknutí na tlačítko přepne znaménko přímo v inputu.
- Ruční napsání `-` do inputu přepne stav tlačítka na `−`.
- Pokud už je zobrazený výsledek, po přepnutí znaménka se výpočet frézek přepočítá.

## Co zůstalo beze změny

- Logika výpočtu fhβ / konicity.
- Hodnoty presetů AF/AG/AH.
- Supabase DB, policies a online flow.
- Online Piškvorky a online Lodě.
- Dashboard, Rotace a kalkulačky mimo korekce frézek.

## Ruční ověření

1. Otevřít `Kalkulačky → Korekce → Frézky`.
2. U pole `Konicita` kliknout na `+`, ověřit změnu na `−` a zápis mínusu do inputu.
3. U pole `fhβ` udělat stejnou kontrolu.
4. Ručně napsat zápornou hodnotu a ověřit, že tlačítko ukazuje `−`.
5. Spočítat výsledek a zkontrolovat, že se korekce počítá podle skutečně zadaného znaménka.
