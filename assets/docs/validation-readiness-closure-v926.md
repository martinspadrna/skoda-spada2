# RaK v.1.5 (926) – validační closure

v926 je funkční/profilový odměnový build. Dokumentačně a staticky je připravený k ručnímu testu, ale mobil/browser/Playwright/post-release část zůstává `manual`, dokud skutečně neproběhne.

## Stav

| Oblast | Stav |
|---|---:|
| Achievementy všech her | OK staticky |
| D-směnové achievementy všech her | OK staticky |
| Témata jako odměny | OK staticky |
| Pozadí jako odměny | OK staticky |
| Ukládání vzhledu na profil | OK staticky |
| Mobilní smoke | manual |
| Skutečný Playwright běh | manual |
| Post-release/PWA hosting validace | manual |

## Runtime helpery

- `getRakGamesAchievementRewardHealth()`
- `getRakProfileAppearanceRewardHealth()`
- `getRakReleaseGateMatrixHealth()`

## Další krok

Otestovat v926 na mobilu a zapsat konkrétní chyby do dalšího buildu.
