# RaK release readiness checklist – v.1.5 (857)

Tento soubor je release/auditní dokumentace. Není potřeba pro runtime běh aplikace.

## Před nasazením

- Ověřit, že ZIP nemá vnitřní hlavní složku.
- Ověřit, že jediná složka v kořeni ZIPu je `assets/`.
- Spustit `npm run check` nebo ručně `node --check` nad všemi `.js` soubory.
- Ověřit `manifest.webmanifest` jako validní JSON.
- Ověřit nulový počet duplicitních `id` v `index.html`.
- Ověřit CSS brace kontrolu všech `.css`.
- Ověřit, že v kořeni nejsou `supabase_*.sql`; SQL auditní archiv patří do `assets/docs/sql/`.
- Ověřit, že app ikony jsou jen v `assets/app-icons/` a staré root icon cesty nejsou v manifestu ani SW precache.
- Ověřit, že `sw.js` má aktuální `CACHE_VERSION` a `SW_APP_VERSION`.

## Po nasazení

- Otevřít aplikaci v běžném prohlížeči a udělat tvrdý refresh.
- V PWA nebo mobilním prohlížeči ověřit, že se načte nová verze v „O aplikaci“.
- Ověřit, že „Vyčistit cache“ obnoví appku bez zaseknutí na starém SW.
- Ověřit favicon a instalovanou PWA ikonu.
- Ověřit offline otevření po prvním úspěšném načtení.
- Ověřit, že online části při výpadku Supabase/CDN nespustí pád celé aplikace, ale přejdou do offline/fallback režimu.

## CDN / externí závislosti

Aktuální externí runtime závislosti v `index.html`:

- Google Fonts `Kalam` – pouze vzhled písma. Výpadek nemá zastavit aplikaci.
- CDN `xlsx` – potřebné pro Excel import/export. Výpadek má omezit import/export, ne zbytek appky.
- CDN `jszip` – potřebné pro ZIP export. Výpadek má omezit ZIP export, ne zbytek appky.
- CDN `@supabase/supabase-js@2` – potřebné pro online sync. Výpadek má nechat aplikaci běžet v offline/fallback režimu.

## Rollback

- Při runtime regresi vrátit poslední potvrzený ZIP.
- Po rollbacku navýšit SW/cache verzi, aby se klientům neponechal rozbitý cache stav.
- Supabase policies neměnit jako součást rollbacku, pokud problém není prokazatelně v DB vrstvě.
- Při problému jen v PWA cache nejdřív použít uživatelské „Vyčistit cache“ a ověřit, zda se problém neopakuje na čistém načtení.

## Poznámka k v857

V857 nemění hry, online invite/session logiku, Supabase DB ani policies. Zásah je release/auditní: checklist, diagnostika a oprava obecné kontroly formátu verze.
