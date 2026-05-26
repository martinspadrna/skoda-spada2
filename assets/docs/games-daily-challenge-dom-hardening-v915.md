# RaK v.1.5 (916) – Denní challenge DOM hardening

## Co se mění

- Denní challenge má malý bezpečný formatter pro název dnešní hry, popis výzvy a nadpis Top score.
- Texty se před vložením do HTML normalizují, zkracují a escapují.
- Přidaný read-only guard `getRakGamesDailyChallengeDomHardeningHealth()`.

## Co se nemění

- Online hry.
- Supabase DB a policies.
- Volba dnešní hry podle data.
- Top score výpočty.

## Ověření

- `npm run check`
- Diagnostika / release gates: `games-daily-challenge-dom-hardening`
