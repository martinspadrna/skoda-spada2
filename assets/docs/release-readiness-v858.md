# RaK boot / CDN readiness checklist – v.1.5 (858)

## Cíl

Kontrola boot sekvence a externích CDN závislostí. Build nemění hry, Supabase DB ani policies.

## Co hlídá aplikace

- `window.__RAK_EXTERNAL_DEP_STATUS__` drží stav načtení externích knihoven.
- `xlsx`, `jszip` a `supabase` zapisují `loaded` nebo `failed`.
- Release readiness diagnostika ukazuje počet externích skriptů, warningy a fallback stav.

## Dopad výpadku CDN

- XLSX nedostupné: omezený import/export Excelu.
- JSZip nedostupné: nejde export ZIP buildu přímo z aplikace.
- Supabase CDN nedostupné: online sync jede jen offline/fallback režimem.
- Základní lokální aplikace má zůstat použitelná.

## Kontrola po nasazení

1. Otevřít aplikaci po čistém reloadu.
2. V Diagnostice zkontrolovat `Release readiness`.
3. Ověřit, že warningy pro XLSX/JSZip/Supabase nejsou aktivní, pokud CDN funguje.
4. Ověřit instalaci PWA a favicon/app ikony.
5. Ověřit export ZIPu jen pokud je JSZip dostupný.

## Rollback

Rollback je bezpečný na v.1.5 (857), protože v858 mění jen HTML signalizaci externích knihoven, release diagnostiku, verze a dokumentaci.
