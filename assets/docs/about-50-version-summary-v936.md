# RaK v.1.5 – stručný souhrn 901–950 po v936

V blocích v.1.5 901–950 pokračuje hlavně stabilizace, auditní uzávěrka a ladění mobilního UI. v924 formálně uzavřela doplňovací auditní prompty a v925 přidala validační runbooky. v926 rozšířila herní achievementy a odměnové theme/pozadí navázané na profil. v927–v930 řešily mobilní stabilitu Rotace a glass vzhled Dashboardu. v931–v932 doplnily přepínání znaménka +/− u korekcí frézek. v933–v935 přidaly a vylepšily Dashboard announcement systém, postupně od lokální verze až po online-first Supabase režim. v936 čistí přepínače oznámení v administraci a měsíční graf obsazenosti strojů převádí do theme-aware glass stylu místo černého boxu.

## Stav po v936

- Dashboard announcement systém je online-first podle v935.
- Přepínače oznámení jsou čitelné a bez zbytečného panelu.
- Obsazenost strojů má měsíční graf ve stylu aktivního theme.
- Low-end/Láďův režim zůstává odlehčený.
- Supabase DB/policies se v buildu v936 nemění.

## Ruční ověření

- Administrace → Oznámení Dashboard: čitelnost přepínačů.
- Statistiky → Obsazenost strojů: graf ve stylu theme.
- Dashboard a Statistiky s více theme motivy.
- Reálný mobilní test a Playwright smoke zůstávají manual.
