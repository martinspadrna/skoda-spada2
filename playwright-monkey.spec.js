// RaK v.1.5 (949) – bezpečný monkey smoke test bez destruktivních kliků.
// Spouští se ručně přes: npm run test:monkey
const { test, expect } = require('@playwright/test');

const SAFE_NAV_ACTIONS = ['home', 'rotace', 'kalkulacky', 'rozpisy', 'statistiky', 'games', 'menu'];
const BLOCKED_TEXT = /smazat|vymazat|reset|uložit|odeslat|delete|clear|supabase|online|pozvat|přijmout|odmítnout|admin|administrace/i;
const BLOCKED_SELECTORS = [
  '[data-action*="delete" i]',
  '[data-action*="reset" i]',
  '[data-action*="save" i]',
  '[data-action*="online" i]',
  '[data-action*="supabase" i]',
  '[data-action*="admin" i]',
  '.adminPanel button',
  '.adminSection button',
  '#admin button',
  '[type="submit"]'
];

function pseudoRandom(seed) {
  let value = seed || 937;
  return () => {
    value = (value * 48271) % 0x7fffffff;
    return value / 0x7fffffff;
  };
}

async function openApp(page) {
  await page.goto((process.env.RAK_BASE_URL && process.env.RAK_BASE_URL.startsWith('file:')) ? process.env.RAK_BASE_URL : '/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toBeVisible();
  await page.waitForTimeout(350);
}

async function collectConsole(page, bucket) {
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error' || /uncaught|typeerror|referenceerror|syntaxerror/i.test(text)) {
      bucket.push({ type, text: text.slice(0, 500) });
    }
  });
  page.on('pageerror', (err) => {
    bucket.push({ type: 'pageerror', text: String(err && err.message || err).slice(0, 500) });
  });
}

async function safeClickRandomElement(page, rnd) {
  const candidates = await page.locator('button, [role="button"], a[href], input, select, textarea').evaluateAll((nodes, blockedSelectors) => {
    const blockedText = /smazat|vymazat|reset|uložit|odeslat|delete|clear|supabase|online|pozvat|přijmout|odmítnout|admin|administrace/i;
    return nodes.map((node, index) => {
      const rect = node.getBoundingClientRect();
      const text = (node.innerText || node.value || node.getAttribute('aria-label') || node.getAttribute('title') || '').trim();
      const tag = node.tagName.toLowerCase();
      const type = String(node.getAttribute('type') || '').toLowerCase();
      const hidden = rect.width < 4 || rect.height < 4 || rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth;
      const disabled = !!node.disabled || node.getAttribute('aria-disabled') === 'true';
      const destructive = blockedText.test(text) || type === 'submit' || blockedSelectors.some(sel => {
        try { return node.matches(sel) || !!node.closest(sel); } catch (err) { return false; }
      });
      return { index, tag, text, hidden, disabled, destructive, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }).filter(item => !item.hidden && !item.disabled && !item.destructive);
  }, BLOCKED_SELECTORS);

  if (!candidates.length) return { skipped: true };
  const choice = candidates[Math.floor(rnd() * candidates.length) % candidates.length];
  await page.mouse.click(choice.x, choice.y);
  return { skipped: false, text: choice.text.slice(0, 80), tag: choice.tag };
}

test('v937 safe monkey navigation does not crash the app', async ({ page }) => {
  const errors = [];
  await collectConsole(page, errors);
  await openApp(page);

  const rnd = pseudoRandom(Number(process.env.RAK_MONKEY_SEED || 937));
  const steps = Number(process.env.RAK_MONKEY_STEPS || 80);
  const visited = new Set();

  for (let i = 0; i < steps; i += 1) {
    const roll = rnd();
    if (roll < 0.48) {
      const action = SAFE_NAV_ACTIONS[Math.floor(rnd() * SAFE_NAV_ACTIONS.length) % SAFE_NAV_ACTIONS.length];
      const nav = page.locator(`[data-action="${action}"], [data-page="${action}"]`).first();
      if (await nav.count()) {
        await nav.click({ timeout: 2000 }).catch(() => {});
        visited.add(action);
      }
    } else if (roll < 0.72) {
      await page.mouse.wheel(0, Math.round((rnd() - 0.35) * 900));
    } else if (roll < 0.86) {
      const field = page.locator('input:not([type="hidden"]), textarea').filter({ hasNotText: BLOCKED_TEXT }).first();
      if (await field.count()) {
        await field.fill(String(Math.round((rnd() * 2000) - 1000) / 100).replace('.', ',')).catch(() => {});
      }
    } else {
      await safeClickRandomElement(page, rnd).catch(() => ({ skipped: true }));
    }
    await page.waitForTimeout(45);
    await expect(page.locator('body')).toBeVisible();
  }

  const runtime = await page.evaluate(() => ({
    version: window.APP_VERSION || null,
    releaseGate: typeof window.getRakReleaseGateMatrixHealth === 'function' ? window.getRakReleaseGateMatrixHealth() : null,
    chart: typeof window.getRakStatsMonthlyThemeChartHealth === 'function' ? window.getRakStatsMonthlyThemeChartHealth() : null,
    bodyText: String(document.body && document.body.innerText || '').slice(0, 1000)
  }));

  const seriousErrors = errors.filter((item) => !/favicon|supabase|failed to fetch|network/i.test(item.text));
  expect(runtime.version).toContain('937');
  expect(runtime.releaseGate).toBeTruthy();
  expect(runtime.chart).toBeTruthy();
  expect(runtime.chart.blackAreaFillRemoved).toBeTruthy();
  expect(visited.size).toBeGreaterThanOrEqual(3);
  expect(seriousErrors).toEqual([]);
});
