// RaK v.1.5 (927) – DOM smoke kostra rozšířená o validační readiness helpery.
// Instalace/spuštění mimo hotfix: npx playwright install chromium && npm run test:smoke
const { test, expect } = require('@playwright/test');

async function openApp(page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toBeVisible();
}

test('dashboard boots and bottom nav is visible', async ({ page }) => {
  await openApp(page);
  await expect(page.locator('.bottomNav, nav[aria-label="Spodní navigace"]').first()).toBeVisible();
  await expect(page.locator('#dashKantyna')).toBeVisible();
  await expect(page.locator('#dashJidelna')).toBeVisible();
});

test('games page opens without blank screen', async ({ page }) => {
  await openApp(page);
  const gamesNav = page.locator('[data-action="games"], [data-page="games"], [data-tab="games"]').first();
  if (await gamesNav.count()) await gamesNav.click();
  await expect(page.locator('body')).toContainText(/Hry|Piškvorky|Denní challenge/i);
});

test('diagnostics expose due diligence closure', async ({ page }) => {
  await openApp(page);
  const closure = await page.evaluate(() => {
    if (typeof window.getRakFinalAuditClosureHealth !== 'function') return null;
    return window.getRakFinalAuditClosureHealth();
  });
  expect(closure).toBeTruthy();
  expect(closure.percentComplete).toBeGreaterThanOrEqual(100);
});

test('v927 validation readiness helpers are exposed', async ({ page }) => {
  await openApp(page);
  const readiness = await page.evaluate(() => {
    if (typeof window.getRakManualValidationReadinessHealth !== 'function') return null;
    return window.getRakManualValidationReadinessHealth();
  });
  expect(readiness).toBeTruthy();
  expect(readiness.readyForUserTesting).toBeTruthy();
  expect(readiness.realMobileTestDone).toBeFalsy();
  expect(readiness.realPlaywrightRunDone).toBeFalsy();
});

test('release gates stay readable and keep manual gates explicit', async ({ page }) => {
  await openApp(page);
  const matrix = await page.evaluate(() => {
    if (typeof window.getRakReleaseGateMatrixHealth !== 'function') return null;
    return window.getRakReleaseGateMatrixHealth();
  });
  expect(matrix).toBeTruthy();
  expect(matrix.gateCount).toBeGreaterThan(0);
  expect(matrix.manualCount).toBeGreaterThan(0);
});


test('v927 games reward helpers are exposed', async ({ page }) => {
  await openApp(page);
  const rewards = await page.evaluate(() => {
    if (typeof window.getRakGamesAchievementRewardHealth !== 'function') return null;
    return window.getRakGamesAchievementRewardHealth();
  });
  expect(rewards).toBeTruthy();
  expect(rewards.gamesCovered).toBeGreaterThanOrEqual(18);
  expect(rewards.totalAchievementDefs).toBeGreaterThan(40);
  expect(rewards.shiftDRewards).toBeGreaterThanOrEqual(36);
});

test('v927 profile appearance rewards are exposed', async ({ page }) => {
  await openApp(page);
  const appearance = await page.evaluate(() => {
    if (typeof window.getRakProfileAppearanceRewardHealth !== 'function') return null;
    return window.getRakProfileAppearanceRewardHealth();
  });
  expect(appearance).toBeTruthy();
  expect(appearance.profileThemeStorage).toContain('uiSettings.themeId');
  expect(appearance.profileBackgroundStorage).toContain('uiSettings.backgroundId');
  expect(appearance.themes.total).toBeGreaterThan(1);
  expect(appearance.backgrounds.total).toBeGreaterThan(1);
});
