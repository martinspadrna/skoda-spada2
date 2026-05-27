# RaK v.1.5 (925) – validační closure

## Shrnutí
v925 navazuje na v924. V924 formálně uzavřela auditní/prompty dokumentačně. V925 připravuje praktickou validační vrstvu: ruční mobilní runbook, Playwright runbook, post-release checklist a runtime helpery, které jasně rozlišují `OK` pro připravené podklady a `manual` pro věci, které musí proběhnout reálně.

## Co je hotové
| Oblast | Stav | Evidence |
|---|---|---|
| Dokumentační prompt compliance | OK | finální dokumenty v924 |
| Ruční mobilní runbook | OK | `assets/docs/manual-validation-runbook-v925.md` |
| Playwright runbook | OK | `assets/docs/playwright-real-run-readiness-v925.md` |
| Post-release validace | OK | `assets/docs/post-release-validation-v925.md` |
| Runtime helper pro validační připravenost | OK | `getRakManualValidationReadinessHealth()` |
| Closure helper | OK | `getRakValidationReadinessClosureHealth()` |

## Co zůstává manual
| Oblast | Důvod |
|---|---|
| Mobilní test | Vyžaduje skutečný telefon/prohlížeč. |
| Browser smoke | Vyžaduje skutečné spuštění appky v prohlížeči. |
| Playwright běh | Vyžaduje nainstalované Playwright browsery. |
| Hosting/PWA update flow | Vyžaduje reálné nasazení nebo staging. |
| Online hry na dvou zařízeních | Vyžaduje dva klienty a Supabase realtime. |

## Bezpečnostní hranice buildu
- bez změn Supabase DB,
- bez změn Supabase policies,
- bez změn online Piškvorek,
- bez změn online Lodí,
- bez změn gameplaye,
- bez rewrite aplikace,
- bez bundleru.

## Nejlepší další krok
Nahrát `RaK_v1_5_925.zip`, otevřít ho na mobilu a projít P0 checklist z `manual-validation-runbook-v925.md`. Pokud se objeví chyba, další build má být co nejmenší oprava konkrétního problému.
