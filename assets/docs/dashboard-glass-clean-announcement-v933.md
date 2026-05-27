# RaK v.1.5 (933) – Dashboard glass cleanup + announcement ticker

Build v933 řeší dvě věci na Dashboardu:

1. čistší průhlednější glass styl bez toho, aby každá karta měla vlastní flekaté světlo/stín,
2. lokální admin announcement systém s platností od–do a jezdícím textem nad prvním panelem Dashboardu.

## Dashboard glass

| Oblast | Změna | Důvod | Riziko |
|---|---|---|---|
| `styles-overrides.css` | Přidaná finální v933 vrstva pro `#home .dashboardHeroCard` a `#home .dashboardCard`. | Sjednotit karty do průhledného iOS glass vzhledu. | Nízké, čistě vizuální. |
| `styles-overrides.css` | Vypnuté lokální `::before/::after` odlesky na jednotlivých dashboard kartách. | Odstranit flekatý vzhled, kdy každá buňka měla vlastní světlejší/tmavší místa. | Nízké. |
| `styles-overrides.css` | Barva tématu zůstává hlavně v obrysu, společném glow a jemném skle. | Dashboard se dál přizpůsobuje aktivnímu theme, ale nepůsobí přeplácaně. | Nízké. |
| `styles-overrides.css` | Ikonky na Dashboardu zůstávají bez vlastního pozadí/kapsle. | Uživatel chtěl odstranit pozadí kolem ikonek. | Nízké. |
| `styles-overrides.css` | Láďův/low-end fallback vypíná těžký blur. | Udržet plynulost na slabším mobilu. | Nízké. |

## Announcement ticker

| Soubor | Změna | Poznámka |
|---|---|---|
| `index.html` | Přidaný `#dashboardAnnouncementBar` mezi titulkem Dashboardu a hero panelem. | Ticker se zobrazí nad prvním panelem. |
| `dashboard.js` | Přidané helpery pro lokální oznámení, platnost od–do, aktivní výběr a render tickeru. | Bez změny Supabase DB/policies. |
| `ui.js` | V administraci přidaná sekce „Oznámení Dashboard“. | Admin nastaví nadpis, text, od, do, aktivitu a ježdění textu. |
| `styles-overrides.css` | Přidaný glass ticker a marquee animace. | Respektuje reduced motion a Láďův režim. |
| `rak-release-gates.js` | Přidaný release gate `v933-dashboard-announcement-system`. | Ruční ověření zůstává potřeba. |

## Storage

Lokální nastavení se ukládá do:

```text
${APP_KEY}:dashboardAnnouncementV1
```

Supabase zápis se v tomto buildu záměrně nepřidává, protože by vyžadoval potvrzení existujících sloupců a zápisových policies pro tabulku `announcements`. Stávající veřejné čtení oznámení přes `getSupabaseAnnouncement()` zůstává podporované jako read-only vstup.

## Helpery

```js
readRakLocalDashboardAnnouncement()
writeRakLocalDashboardAnnouncement(payload)
clearRakLocalDashboardAnnouncement()
getRakActiveDashboardAnnouncement(now)
renderRakDashboardAnnouncement(now)
getRakDashboardAnnouncementHealth()
```

## Ruční ověření

1. Odemknout administraci.
2. Otevřít Administrace → Oznámení Dashboard.
3. Napsat text a uložit.
4. Vrátit se na Dashboard.
5. Ověřit, že se ticker zobrazí nad prvním panelem.
6. Nastavit čas „Od“ do budoucna a ověřit, že ticker zmizí.
7. Nastavit platný interval a ověřit, že se znovu zobrazí.
8. Smazat oznámení a ověřit, že zmizí.
9. Ověřit Dashboard v běžném i Láďově režimu.

## Neověřeno staticky

- Reálné chování na mobilu.
- Čitelnost s každým tématem a pozadím.
- Skutečný Playwright běh.
- Online globální announcement přes Supabase zápis.
