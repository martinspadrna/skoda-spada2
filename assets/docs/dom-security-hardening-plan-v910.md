# RaK v.1.5 (910) – DOM/security hardening plán

## Cíl

Přidat nízkorizikový plán pro postupné zpevnění DOM renderů bez hromadného refaktoru a bez zásahu do hotových funkcí.

## Rozsah

- `games-arcade.js` – nejvyšší priorita kvůli jménům, skóre a leaderboardům.
- `ui.js` – centrální diagnostika, modaly a stavové texty.
- `stats.js` – grafy, tooltipy a legendy.
- `qr.js` – QR payloady a modaly.
- `dashboard.js` – externí odkazy a allowlist.

## Pravidlo

Neměnit masově `innerHTML`. Každý další zásah má být malý, ověřitelný a krytý regression testem. Nové textové hodnoty se mají vkládat přes `textContent`, větší historické šablony přes kontrolované `escapeHtml()` / whitelist formattery.

## Bezpečnost

Tento build nepřepisuje render, nehookuje DOM sinky, nemění online flow, nemění Supabase DB ani policies.
