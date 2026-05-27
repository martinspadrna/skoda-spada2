# RaK v.1.5 (932) – Korekce Frézky: +/− i u Naměřeno

## Rozsah změny

Build v932 doplňuje znaménkové přepínače +/− také k naměřeným hodnotám ve frézkách:

- C1 · levá
- C1 · pravá
- C2 · levá
- C2 · pravá

Zůstávají i přepínače u aktuální korekce ve stroji:

- Konicita
- fhβ

## Chování

Tlačítko mění jen znaménko příslušného inputu. Výpočet dál čte hodnotu přímo z pole, takže ruční zápis mínusu a přepnutí tlačítkem dávají stejný výsledek.

## UI sjednocení

Všech šest přepínačů používá stejnou třídu `calcFrezkySignedInput`, stejnou výšku a stejné centrování. Cílem je, aby tlačítka +/− nebyla vůči inputům posunutá nahoru/dolů a působila stejně jako u soustruhů.

## Ověření

Staticky ověřeno v DOM/CSS/JS. Reálný mobilní test neproběhl.
