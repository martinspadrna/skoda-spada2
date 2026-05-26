# RaK v.1.5 (907) – Safe helper policy

## Doporučená pravidla pro další změny

1. Čistý text patří do `textContent` nebo `createTextNode`.
2. HTML šablony používat jen tam, kde je struktura pevná a dynamické hodnoty jsou escapované.
3. URL zapisovat jen přes allowlist a s kontrolou protokolu.
4. Nové klikací prvky nepřidávat přes inline `onclick`, ale přes existující handler/data-action přístup.

## Ověření

Každý konkrétní převod ověřit ručně v mobilu a doplnit malý DOM smoke scénář pro hodnoty s diakritikou a znaky `<`, `>`, `&`, uvozovky.
