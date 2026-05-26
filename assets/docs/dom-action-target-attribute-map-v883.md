# RaK v.1.5 (883) – DOM/action target attribute map

Bezpečný read-only audit navazuje na DOM/action registry z v881–v882.

## Cíl

Zmapovat nejen samotné `data-action` prvky a jejich kategorie, ale i cílové atributy, bez kterých by budoucí přepojení handlerů mohlo být rizikové.

## Co se hlídá

- navigace: `data-page`,
- hry: `data-game`,
- brusy: `data-machine`, `data-prog`,
- soustruhy: `data-soustruh-mode`, `data-startsize`, `data-combo-*`,
- korekce vrtáků: `data-lathe-axis-machine`, `data-target-input`,
- frézky fhβ: `data-fhb-key`, `data-fhb-left`, `data-fhb-right`,
- nápovědy: `data-help-type`,
- reset tlačítka: explicitní `data-reset-fields` / `data-reset-results` jen jako warning, protože některé reset akce mohou být kontextové.

## Bezpečnost změny

Audit nic nepřepíná a nemění chování kliknutí. Staré event handlery zůstávají zdroj pravdy. Výstup slouží jen jako mapa pro další refactor.

## Poznámka

Opravená je i kontrola přepínače znaménka u korekcí vrtáků: správný atribut je `data-target-input`, ne starší auditní očekávání `data-target`.
