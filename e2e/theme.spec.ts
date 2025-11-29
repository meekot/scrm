import { test, expect } from '@playwright/test';

const THEME_STORAGE_KEY = 'scrm-theme-preference';

test.beforeEach(async ({ context, page }) => {
  await context.clearCookies();
  await page.goto('/');
});

test('theme switcher toggles and persists theme', async ({ page }) => {
  await page.goto('/sign-in');

  await page.waitForFunction(() => document.documentElement.getAttribute('data-theme') !== null);

  const initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  const nextTheme = initialTheme === 'dark' ? 'light' : 'dark';

  await page.getByRole('button', { name: /switch to (dark|light) theme/i }).click();

  await page.waitForFunction(
    (expected) => document.documentElement.getAttribute('data-theme') === expected,
    nextTheme
  );

  const storedTheme = await page.evaluate((key) => window.localStorage.getItem(key), THEME_STORAGE_KEY);
  expect(storedTheme).toBe(nextTheme);

  await page.reload();

  await page.waitForFunction(
    (expected) => document.documentElement.getAttribute('data-theme') === expected,
    nextTheme
  );

  const reloadedTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  expect(reloadedTheme).toBe(nextTheme);
});
