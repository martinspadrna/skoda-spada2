# RaK v.1.5 (926) – post-release validace

## Release den

| Krok | Kontrola | Očekávání |
|---:|---|---|
| 1 | Nahrát ZIP v926. | Root ZIPu obsahuje soubory přímo a jedinou složku `assets/`. |
| 2 | Tvrdý reload. | `APP_VERSION` je `v.1.5 (926)`. |
| 3 | Service worker. | Cache je `v1.5-926`, staré cache se uklidí. |
| 4 | Profilový vzhled. | Aktivní téma/pozadí drží konkrétní profil. |
| 5 | Hry. | Achievementy a odměny jsou viditelné bez pádu stránky. |
| 6 | Online flow. | Online Piškvorky/Lodě smoke bez změny pravidel. |

## Rollback trigger

Rollback na předchozí potvrzený ZIP udělat, pokud:

- appka po reloadu nenaběhne,
- nejde přepínat profil,
- online Piškvorky/Lodě přestanou fungovat,
- výběr vzhledu rozbije UI tak, že nejde použít nastavení.
