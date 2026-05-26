# Storage/sync audit – v.1.5 (886)

Bezpečný read-only audit localStorage/offline/sync vrstvy.

## Co kontroluje

- dostupnost localStorage bez zápisu testovací položky,
- počet položek a orientační velikost,
- větší klíče nad 180 kB,
- JSON položky s nevalidním obsahem,
- základní bucket mapu: Supabase, hry, profil/vzhled, rotace/statistiky, offline/sync a diagnostika,
- základní Supabase queue/cache/sync snapshot, pokud je klientský hardening helper dostupný.

## Co záměrně nedělá

- nic nemaže,
- nic nepřepisuje,
- nespouští DB změny,
- nepřepíná online flow ani herní logiku.

## Další krok

V další verzi má smysl doplnit mapu stale cleanup kandidátů. Pořád jen jako návrh/diagnostika, ne automatické mazání dat.
