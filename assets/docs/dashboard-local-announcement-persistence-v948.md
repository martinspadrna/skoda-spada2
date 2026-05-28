# RaK v.1.5 (948) – Lokální oznámení Dashboard: obnova po restartu

- Oznámení Dashboard zůstává lokální, bez samostatného online ukládání v editoru oznámení.
- Dashboard při každém `updateDashboard()` znovu zavolá `renderRakDashboardAnnouncement()`, takže se uložené oznámení obnoví i po vypnutí a zapnutí appky.
- Čtení lokálního oznámení jde primárně přímo přes `localStorage.getItem`, aby ho nezdržel starý JSON cache stav.
- Obecná online synchronizace aplikace zůstává beze změny.
