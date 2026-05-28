# RaK v.1.5 (949) – Globální Dashboard oznámení

- Oznámení na Dashboardu je znovu online-first a má ho vidět každý uživatel po otevření appky.
- Administrace ukládá přes Supabase RPC `rak_save_dashboard_announcement`.
- Dashboard preferuje online oznámení ze Supabase a localStorage používá jen jako cache/fallback.
- Lokální režim už není hlavní zdroj pravdy.
- V Supabase je doplněno pravidlo, aby zůstalo jen jedno aktivní oznámení.
