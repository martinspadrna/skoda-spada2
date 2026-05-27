# RaK v.1.5 (935) – Dashboard glass + online oznámení

## Cíl buildu

Build v935 navazuje na v934 a řeší dvě věci:

1. Dashboard má zůstat tmavší, ale působit průhledněji a víc jako glass.
2. Oznámení na Dashboardu nemá být jen lokální na jednom zařízení, ale online-first přes Supabase, aby mělo smysl pro všechny uživatele.

## Dashboard glass

Panely na Dashboardu jsou upravené tak, aby:

- měly tmavý sjednocený odstín,
- byly průhlednější než ve v934,
- neměly vlastní flekaté odlesky v každé buňce,
- barvu tématu používaly hlavně pro obrys, glow a ikonky,
- v Láďově / low-end režimu nepoužívaly těžký blur.

Hlavní změna je v `styles-overrides.css`, kde v935 přidává finální override nad předchozí v933/v934 vrstvu.

## Online announcement systém

Administrace nyní ukládá oznámení přes online-first helpery:

- `writeRakDashboardAnnouncement(payload)`
- `clearRakDashboardAnnouncement()`
- `saveRakDashboardAnnouncementOnline(payload)`
- `clearRakDashboardAnnouncementOnline()`
- `getRakDashboardAnnouncementOnlineStatus()`

Chování:

1. Admin nastaví text, platnost od–do, aktivní stav a marquee.
2. Aplikace si oznámení uloží lokálně jako fallback.
3. Pokud je Supabase klient dostupný a zařízení je online, pokusí se uložit oznámení do tabulky `announcements`.
4. Ostatní klienti čtou tabulku `announcements` přes existující `refreshPublicData()` a realtime kanál.
5. Pokud Supabase zápis odmítne policy nebo schéma, admin vidí hlášku, že oznámení zůstalo jen lokálně.

## Bezpečnostní hranice

V tomto buildu se nemění:

- Supabase DB schéma,
- Supabase policies,
- existující online hry,
- online Piškvorky,
- online Lodě.

Online announcement spoléhá na existující tabulku `announcements`. Pokud má tabulka pouze anon SELECT, aplikace to bezpečně zachytí a ponechá lokální fallback.

## Ověření

Ruční ověření:

1. Otevřít Administraci → Oznámení Dashboard.
2. Uložit aktivní oznámení bez nadpisu.
3. Ověřit, že se zobrazí nad prvním panelem Dashboardu.
4. Otevřít aplikaci na druhém zařízení / v jiném prohlížeči.
5. Ověřit, že se oznámení načte přes Supabase.
6. Vypnout oznámení a ověřit, že zmizí i na dalším zařízení po realtime/refreshi.

Co zůstává manual:

- reálný Supabase write policy test,
- mobilní test,
- reálný Playwright běh,
- PWA/cache test po nasazení.
