// RaK v.1.5 (922) – první DOM smoke kostra.
// Instalace/spuštění mimo hotfix: npx playwright install chromium && npm run test:smoke
const { test, expect } = require('@playwright/test');

async function openApp(page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toBeVisible();
}

test('dashboard boots and bottom nav is visible', async ({ page }) => {
  await openApp(page);
  await expect(page.locator('#bottomNav, .bottomNav, nav').first()).toBeVisible();
  await expect(page.locator('#dashKantyna')).toBeVisible();
  await expect(page.locator('#dashJidelna')).toBeVisible();
});

test('games page opens without blank screen', async ({ page }) => {
  await openApp(page);
  const gamesNav = page.locator('[data-tab="games"], [data-action="show-games"], [data-page="games"]').first();
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
