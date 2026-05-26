# CSP/SRI report-only plan v904

Stav: návrh bez vynucení, bez změny CDN a bez zásahu do hotových funkcí.

## Doporučený směr

1. Nasadit CSP nejdřív jen jako `Content-Security-Policy-Report-Only` na hostingu/stagingu.
2. Nasbírat reporty pro Supabase REST/realtime, JSDelivr knihovny, Google Fonts a PWA režim.
3. Přesunout inline `onload/onerror` dependency handlery do lokálního JS, nebo je dočasně ponechat pod report-only režimem.
4. Rozhodnout u CDN knihoven: přesný pin + SRI, nebo lokální `assets/vendor` kopie.
5. Teprve potom připravit samostatný enforcement build s rollbackem.

## Proč ne enforce hned

Aplikace má externí CDN dependency a inline dependency handlery. Přímé vynucení CSP by mohlo rozbít načítání exportu, Supabase klienta, fontů nebo PWA cache. Proto je bezpečný první krok jen report-only.
