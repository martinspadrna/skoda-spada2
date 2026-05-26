# RaK v.1.5 (903) – AppSec/privacy baseline

Read-only audit klientského povrchu bez mutací a bez čtení citlivých hodnot z localStorage.

## Přidané helpery
- `getRakAppSecPrivacySurfaceHealth()`
- `getRakAppSecPrivacyRiskRegister()`
- `getRakAppSecPrivacyClosureHealth()`

## Kontrolované oblasti
- CSP meta/header připravenost.
- Externí CDN skripty/styly a SRI stav.
- Počet inline scriptů.
- `target=_blank` bez `noopener`.
- Názvy podezřelých localStorage klíčů bez čtení hodnot.
- Supabase veřejný klient: anon/publishable klíč není tajemství, ale zápisy musí hlídat RLS/RPC.

## Důležité
Tento build nemění Supabase DB, policies, online flow ani uložená data. Jde o diagnostiku a risk register pro další bezpečné kroky.
