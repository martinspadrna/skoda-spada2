# RaK v.1.5 (934) – Dashboard glass polish + announcement editor

Build v934 navazuje na v933 a řeší připomínky po vizuálním testu Dashboardu a lokálního announcement editoru.

## Změny

| Oblast | Úprava | Důvod |
|---|---|---|
| Dashboard glass | Karty jsou tmavší, jednotnější a průhlednější. | Předchozí varianta působila pořád moc lokálně prosvětleně. |
| Dashboard ikony | Ikony přebírají barvu aktivního tématu. | Vzhled profilu je konzistentnější. |
| Spodní panel | Aktivní ikona a její glow jsou více napojené na theme. | Aktivní stav už nepůsobí jako samostatná barva mimo téma. |
| Announcement nadpis | Nadpis už není povinný. | Pro krátká hlášení stačí jen text. |
| Announcement přepínače | „Aktivní“ a „Text má jezdit“ jsou vedle sebe. | Menší výška admin formuláře. |
| Announcement ticker | Text se už neskládá dvakrát za sebou. | Zobrazuje se jen zadaný text a po něm mezera. |

## Bezpečnost změny

Změna je klientská a vizuální. Nepřidává zápis do Supabase, nemění DB, policies, online Piškvorky ani online Lodě.

## Ruční ověření

1. Otevřít Dashboard s výchozím tématem.
2. Přepnout na syté téma a ověřit, že barva ikon a aktivní spodní ikony reaguje na theme.
3. V administraci vytvořit oznámení bez nadpisu.
4. Ověřit, že se na Dashboardu ukáže jen text bez povinného štítku.
5. Zapnout jezdící text a ověřit, že se neopakuje dvakrát za sebou.
6. Ověřit Láďův / low-end režim, že nepřibyl těžký blur.
