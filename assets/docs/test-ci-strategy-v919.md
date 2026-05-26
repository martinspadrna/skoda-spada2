# RaK v.1.5 (920) – Test / CI strategy

## Minimální bezpečný krok

1. Ponechat `npm run check` jako blocking gate.
2. Přidat samostatnou kontrolu verzí až v dalším kroku.
3. Playwright zavést jen na 3–5 kritických cest, ne na celou aplikaci najednou.

## Kritické test vrstvy

- syntax a JSON smoke,
- manifest / service worker / verze,
- DOM boot smoke,
- dashboard route,
- hry route + Top score,
- PWA update smoke,
- rollback validation.

## CI snippet

```yaml
name: RaK checks
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci || npm install
      - run: npm run check
```

Online hry netestovat proti produkční DB, dokud nebude staging/test projekt.
