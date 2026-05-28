# RaK v.1.5 (946) – Dashboard oznámení online přes RPC

- Online ukládání oznámení už nejede primárně přes křehký přímý INSERT/UPDATE do `announcements`.
- Appka používá Supabase RPC `rak_save_dashboard_announcement` a `rak_clear_dashboard_announcement`.
- DB má povolený prázdný `title`, takže nadpis oznámení může zůstat nepovinný.
- RPC deaktivuje starší aktivní oznámení a vloží nové jako jeden bezpečnější serverový krok.
- Přímý zápis do tabulky zůstává jen jako fallback, kdyby RPC nebyla dostupná.
- Lokální oznámení zůstává jen fallback/cache, ne primární zdroj po úspěšném online uložení.

## Ověření

- V Supabase existují security definer funkce `rak_save_dashboard_announcement` a `rak_clear_dashboard_announcement`.
- Ručně ověřit: Administrace → Oznámení Dashboard → Uložit online → restart appky → oznámení běží znovu.
