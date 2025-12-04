import { test, expect } from '@playwright/test';

const THEME_STORAGE_KEY = 'theme';

test.beforeEach(async ({ context, page }) => {
  await context.clearCookies();
  await page.goto('/');
});

test('theme switcher toggles and persists theme', async ({ page }) => {
  await page.goto('/sign-in');

  // Wait for theme to be applied (next-themes uses class attribute)
  await page.waitForFunction(() => {
    const classList = document.documentElement.classList;
    return classList.contains('dark') || classList.contains('light');
  });

  const initialTheme = await page.evaluate(() => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });
  const nextTheme = initialTheme === 'dark' ? 'light' : 'dark';

  // Click theme switcher button
  await page.getByRole('button', { name: /toggle theme/i }).click();

  // Select the next theme from the dropdown
  await page.getByRole('menuitem', { name: new RegExp(nextTheme, 'i') }).click();

  // Wait for theme to change
  await page.waitForFunction(
    (expected) => document.documentElement.classList.contains(expected),
    nextTheme
  );

  // Verify theme is stored in localStorage
  const storedTheme = await page.evaluate((key) => window.localStorage.getItem(key), THEME_STORAGE_KEY);
  expect(storedTheme).toBe(nextTheme);

  // Reload and verify theme persists
  await page.reload();

  await page.waitForFunction(
    (expected) => document.documentElement.classList.contains(expected),
    nextTheme
  );

  const reloadedTheme = await page.evaluate(() => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });
  expect(reloadedTheme).toBe(nextTheme);
});
