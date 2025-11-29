import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'test2@test.com',
  password: 'testpass123',
};

test.beforeEach(async ({ context, page }) => {
  // Clear all cookies and storage to ensure clean state
  await context.clearCookies();
  await page.goto('/');
});

test('should redirect unauthenticated user to sign-in page', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL('/sign-in');
});

test('should display sign-in form', async ({ page }) => {
  await page.goto('/sign-in');

  await expect(page.getByRole('heading', { name: /welcome to scrm/i })).toBeVisible();
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByLabel(/password/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
});

test('should show error for invalid credentials', async ({ page }) => {
  await page.goto('/sign-in');

  await page.getByLabel(/email/i).fill('wrong@example.com');
  await page.getByLabel(/password/i).fill('wrongpassword');
  await page.getByRole('button', { name: /sign in/i }).click();

  // Wait for error message
  await expect(page.getByRole('alert')).toBeVisible();
});

test('should successfully sign in with valid credentials', async ({ page }) => {
  await page.goto('/sign-in');

  await page.getByLabel(/email/i).fill(TEST_USER.email);
  await page.getByLabel(/password/i).fill(TEST_USER.password);
  await page.getByRole('button', { name: /sign in/i }).click();

  // Wait for navigation to dashboard
  await page.waitForURL('/dashboard');

  // Should show dashboard content
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
});

test('should persist session after page reload', async ({ page }) => {
  // Sign in first
  await page.goto('/sign-in');
  await page.getByLabel(/email/i).fill(TEST_USER.email);
  await page.getByLabel(/password/i).fill(TEST_USER.password);
  await page.getByRole('button', { name: /sign in/i }).click();

  // Wait for navigation to dashboard
  await page.waitForURL('/dashboard');

  // Reload the page
  await page.reload();

  // Should still be on dashboard (not redirected to sign-in)
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
});

test('should redirect to dashboard if already signed in', async ({ page }) => {
  // Sign in first
  await page.goto('/sign-in');
  await page.getByLabel(/email/i).fill(TEST_USER.email);
  await page.getByLabel(/password/i).fill(TEST_USER.password);

  // Click sign in and wait for navigation to complete
  await Promise.all([
    page.waitForURL('/dashboard', { waitUntil: 'networkidle' }),
    page.getByRole('button', { name: /sign in/i }).click(),
  ]);

  // Verify we're authenticated and on dashboard
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

  // Try to access sign-in page again - should redirect to dashboard
  await page.goto('/sign-in');

  // Should be redirected back to dashboard by middleware
  await expect(page).toHaveURL('/dashboard');
});

test('should protect routes requiring authentication', async ({ page }) => {
  // Try to access protected route without signing in
  await page.goto('/dashboard');
  await expect(page).toHaveURL('/sign-in');
});
