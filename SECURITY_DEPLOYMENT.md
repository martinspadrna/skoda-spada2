# Bezpecne nasazeni RaK 1.337

Tento postup je soucast obnovy a predani aplikace. Nikdy do repozitare
nevkladat hesla, service-role klic ani soukromou adresu kalendare.

## Pred nasazenim

1. Overit lokalni zalohu dat a pocet radku v tabulkach.
2. Nasadit klient 1.337 se Supabase Auth.
3. Ve Vercelu overit standardni promenne Supabase integrace
   (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
   Samostatne nastavit `RAK_ABSENCE_ICS_URL`; `RAK_ALLOWED_ORIGIN` je volitelne
   zprisneni pro jednu pevnou produkcni domenu.
4. V Supabase Auth vytvorit potvrzeny ucet `9811@admin.rak.local` a v jeho
   app metadata nastavit `{"rak_account_id":"9811","rak_role":"owner"}`.
5. Pouzit stavajici heslo vlastnika pouze pri vytvoreni Auth uctu. Po overeni
   prihlaseni ho zmenit a nikde ho nezapisovat do dokumentace.

## Poradi migraci

Migrace v `supabase/migrations` jsou serazene takto:

1. profily, role, admin relace a audit,
2. revize rozpisu a chranene zalohy,
3. reporty, historie a servisni prehled,
4. provozni admin zapisy a retence zaloh,
5. konecne vypnuti PIN RPC a verejnych zapisu.

Posledni migraci aplikovat az po overeni prihlaseni vlastnika v klientu 1.337.
Po migraci musi `rak_admin_auth_capabilities()` vracet `enforced: true`.

## Overeni

1. Bez prihlaseni nacist Home, Rotace, Kalkulacky a Hry.
2. Overit, ze bezny ucet nevidi Administraci a nemuze menit rozpis ani nastaveni.
3. Prihlasit ucet 9811, zavrit PWA, znovu ji otevrit a overit trvalou relaci.
4. Ulozit testovaci nastaveni, rozpis a oznameni; zkontrolovat Historii zmen.
5. Obnovit testovaci zalohu rozpisu a stahnout zalohu nastaveni.
6. Nacist absence z kalendare a overit, ze odpoved API ma `Cache-Control: no-store`.
7. Vlastnikem odhlasit druhe zarizeni a overit, ze ztrati pristup k admin RPC i API.
8. Spustit `pnpm run check`, `pnpm run test:app-usage`, `pnpm run test:gomoku-ai`
   a `pnpm run test:browser-smoke`.

## Navrat zpet

Pri chybe nejprve neprepisovat rozpis. Zachovat lokalni navrh a pouzit zalohu
rozpisu z doby pred poslednim ulozenim. Databazove migrace nevracet smazanim
tabulek; obnovit data ze safety backupu do noveho schematu a opravit klienta
pro Supabase Auth.

Soukromou ICS adresu po tomto bezpecnostnim prechodu znovu vygenerovat v Google
Kalendari, protoze puvodni adresa byla drive soucasti klientskych zdroju.
