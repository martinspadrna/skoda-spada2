# RaK v.1.5 (905) – Release gate policy

## Statusy

| Status | Význam |
|---|---|
| `blocker` | Nesmí do ZIPu/release bez opravy nebo vědomého rollback plánu. |
| `warning` | Může do ZIPu jen po přečtení evidence a vědomém přijetí rizika. |
| `manual` | Staticky nelze potvrdit; musí ověřit člověk v mobilu/prohlížeči. |
| `ok` | Read-only kontrola nehlásí problém. |

## Doporučené release pravidlo

- `readyForZip = true`, když nejsou blockery.
- `readyForProduction = true` až po ručním mobil/browser smoke.
- Supabase policies neutahovat, dokud není potvrzený dvoumobilový smoke Piškvorek i Lodí.

## Minimální smoke před nasazením

1. Tvrdý reload / obnovení PWA cache.
2. Dashboard a kantýna/jídelna.
3. Top score a profily po resetu.
4. Piškvorky proti AI.
5. Online Piškvorky link i ruční kód.
6. Lodě online: založení, připojení, flotily, střelba.
7. Export ZIPu.
