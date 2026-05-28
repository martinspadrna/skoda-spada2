# RaK v.1.5 (936) – Oznámení bez panelu + theme graf obsazenosti

Build v936 navazuje na v935 a řeší dvě konkrétní vizuální připomínky:

1. v administraci oznámení nebyly dobře vidět popisky přepínačů „Aktivní“ a „Text má jezdit“, protože kolem nich zůstal zbytečný panelový vzhled,
2. měsíční graf v obsazenosti strojů působil moc černě a nebyl dost navázaný na aktuální theme.

## Oznámení Dashboard

| Oblast | Změna | Výsledek |
|---|---|---|
| Přepínače | `.adminAnnouncementCheck` už nemá vlastní panel, border ani tmavé pozadí. | Popisky jsou čitelné a neztrácí se v kartě. |
| Rozložení | `.adminAnnouncementToggleRow` je flex řádek s oběma přepínači vedle sebe. | Šetří místo a drží přirozený vzhled. |
| Checkbox | Checkbox používá `accent-color` podle theme. | Přepínače vizuálně sedí ke zbytku appky. |

## Obsazenost strojů

| Oblast | Změna | Výsledek |
|---|---|---|
| Karta přehledu | Roční karta obsazenosti má theme-aware glass pozadí. | Graf už nepůsobí jako cizí černý blok. |
| Měsíční graf | Čára, plocha, body, mřížka a texty berou barvu z aktuálního theme. | Vzhled odpovídá zvolenému motivu. |
| Low-end/Láďův režim | Blur se vypíná, zůstává lehký theme podklad. | Výkon zůstává bezpečný i na slabším telefonu. |

## Ověření

- Otevřít Administrace → Oznámení Dashboard.
- Zkontrolovat, že přepínače „Aktivní“ a „Text má jezdit“ jsou čitelné a bez extra panelu.
- Otevřít Statistiky → Obsazenost strojů.
- Zkontrolovat měsíční graf s více theme motivy, hlavně sytými.
- Zkontrolovat Láďův režim, že graf nezpůsobuje sekání.

## Poznámka

Supabase DB ani policies se v tomhle buildu nemění. Online oznámení zůstává podle v935 a navazuje na už nastavenou tabulku `announcements`.
