# RaK v.1.5 (910) – Srovnání provozní doby kantýny a jídelny

## Co je upravené

- Do aplikace byly promítnuté dodané fotky běžné a mimořádné provozní doby.
- Dashboard teď vyhodnocuje kantýnu a jídelnu podle toho, jestli je neděle běžná nebo je v seznamu mimořádných přesčasových nedělí.
- Rozklik otevírací doby nově odděluje:
  - běžnou otevírací dobu,
  - mimořádnou nedělní provozní dobu při přesčasu.

## Běžný režim

### Kantýna – Kiosek M2
- Pondělí–sobota: `01:00–04:00`, `05:30–09:00`, `10:00–12:00`, `13:00–16:00`, `17:30–21:00`, `22:00–00:00`
- Neděle: `05:30–09:00`, `10:00–12:00`, `21:30–00:00`, `01:00–03:00`

### Jídelna – Restaurace Vrchlabí
- Pondělí: `01:30–03:00`, `07:00–09:00`, `10:30–12:30`, `15:00–16:30`, `22:30–00:00`
- Úterý–pátek: `07:00–09:00`, `10:30–12:30`, `15:00–16:30`, `22:30–00:00`
- Sobota: `10:30–12:30`, `15:00–16:30`, `22:30–00:00`
- Neděle: `10:00–12:00`

## Mimořádná neděle při přesčasu

### Kantýna – Kiosek M2
- `01:00–04:00`, `05:30–09:00`, `10:00–12:00`, `17:30–21:00`, `21:30–00:00`

### Jídelna – Restaurace Vrchlabí
- `10:00–12:00`, `21:30–23:30`

## Poznámka

Seznam přesčasových nedělí zůstává uložený v `FOOD_SPECIAL_SUNDAY_DATES` a používá se jen jako přepínač pro mimořádný nedělní režim.
