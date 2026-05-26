# RaK final release baseline checklist – v.1.5 (859)

## Cíl

Uzavřít PWA / release / ZIP inventory fázi jako stabilní baseline před dalším větším auditem nebo refactorem. Build nemění hry, Supabase DB, Supabase policies, dashboard, spodní lištu ani kalkulačky.

## Finální kontrola baseline

- App verze, cache verze a Supabase realtime kanál musí odpovídat buildu v859.
- ZIP musí být bez vnitřní hlavní složky.
- Jediná složka v kořeni ZIPu má být `assets/`.
- Root ZIPu nemá obsahovat žádné `supabase_*.sql`; SQL reference patří do `assets/docs/sql/`.
- Manifest, favicon a apple-touch ikony mají používat `assets/app-icons/`.
- Service worker precache má obsahovat aktuální app shell a app ikony v `assets/app-icons/`.
- Release readiness má hlídat kritické externí knihovny a upozornit na fallback režim.

## Externí závislosti

- Google Fonts / Kalam: pouze vzhled písma; výpadek nesmí zastavit aplikaci.
- XLSX: import/export Excelu.
- JSZip: ZIP export z aplikace.
- Supabase JS: online sync, online hry a heartbeat.

## Ověření po nasazení

1. Otevřít aplikaci v čistém okně nebo po vymazání cache.
2. Ověřit, že se načte Dashboard bez ručního přepínání.
3. V O aplikaci / Diagnostice zkontrolovat Release readiness a PWA/SW stav.
4. Ověřit, že app ikona, favicon a instalace PWA ukazují nové asset cesty.
5. Spustit ruční export ZIPu jen pokud je dostupný JSZip.
6. Na mobilu ověřit otevření po zavření aplikace a po návratu online/offline.

## Rollback

Bezpečný rollback bod je v.1.5 (858), protože v859 uzavírá release baseline, přidává Google Fonts load/error signál, dokumentaci a verze. Neobsahuje DB zásah ani změnu policies.

## Poznámka k resetu her

`GAME_PROGRESS_RESET_VERSION` zůstává záměrně na resetovacím markeru v856. Není to aktuální verze aplikace; brání tomu, aby se herní statistiky resetovaly při každém dalším buildu.
