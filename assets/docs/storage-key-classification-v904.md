# Storage key classification v904

Stav: read-only katalog storage klíčů bez čtení hodnot.

## Kategorie

- `app-state` – hlavní lokální stav aplikace.
- `ui-preferences` – vzhled, pozadí, výkon zařízení a lokální UI volby.
- `game-profile-score` – herní profily, výsledky a reset markery.
- `supabase-offline-cache` – lokální cache a fronta pro Supabase/offline režim.
- `supabase-diagnostics` – smoke/heartbeat diagnostika.
- `ttt-score-diagnostics` – Piškvorky a online diagnostika.
- `app-diagnostics-state` – runtime logy a update stav.
- `legacy-admin-local` – historický `adminUnlocked`, který se má při startu odstranit.
- `session-admin-gate` – pouze session guard, nikdy persistentní oprávnění.

## Zásady

- Hodnoty se v auditu nečtou.
- Neznámé klíče se nemažou automaticky.
- Klientské storage hodnoty nesmí být brané jako skutečná autorita pro oprávnění.
- Cleanup se smí dělat jen přes přesně určený marker/reset nebo ruční servisní krok.
