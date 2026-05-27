# RaK v.1.5 (926) – Playwright readiness

Playwright skeleton zůstává smoke kontrolou, ne náhradou mobilního testu. Pro v926 má navíc ověřit dostupnost helperů pro achievement/odměnovou vrstvu.

## Doporučené doplnění smoke testů

```js
test('v926 reward helpers are exposed', async ({ page }) => {
  await openApp(page);
  const rewards = await page.evaluate(() => window.getRakGamesAchievementRewardHealth?.());
  expect(rewards).toBeTruthy();
  expect(rewards.gamesCovered).toBeGreaterThanOrEqual(18);
  const appearance = await page.evaluate(() => window.getRakProfileAppearanceRewardHealth?.());
  expect(appearance).toBeTruthy();
  expect(appearance.themes.total).toBeGreaterThan(1);
  expect(appearance.backgrounds.total).toBeGreaterThan(1);
});
```

## Skutečný běh

```bash
npm run check
npx playwright install chromium
npm run test:smoke
```

## Nelze potvrdit staticky

- reálné klikání na konkrétním mobilním viewportu,
- přesné přičítání D progressu v konkrétní čas,
- PWA cache refresh na hostingu.
