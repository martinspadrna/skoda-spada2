# RaK v.1.5 (916) – Mimořádná otevírací doba jen jako rozdíl

## Úprava

Detail otevírací doby kantýny a jídelny už v mimořádné nedělní části neopakuje časy, které jsou stejné jako v běžné neděli.

## Chování

- Běžná otevírací doba zůstává v hlavní části.
- Mimořádná nedělní provozní doba zobrazuje jen okna navíc nebo změněná okna.
- Dashboard dál používá `FOOD_SPECIAL_SUNDAY_DATES` jako přepínač přesčasového režimu.

## Příklad

- Jídelna: běžných `10:00–12:00` se v mimořádné části neopakuje, zobrazí se jen `21:30–23:30`.
- Kantýna: stejné běžné časy se neopakují, zůstávají jen změny jako `01:00–04:00` a `17:30–21:00`.
