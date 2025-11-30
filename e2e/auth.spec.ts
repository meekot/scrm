import { test, expect } from '@playwright/test';
import { createSupabaseClient } from './supabaseClient';

const client = createSupabaseClient();

const PASSWORD = 'Testpass123!';

const created: Array<{ userId: string; entityId: string}> = [];


async function createUserWithEntity() {
  const email = `e2e-${Date.now()}-${Math.random().toString(16).slice(2)}@test.com`;

  const { data: userData, error: userError } = await client.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
  });

  if (userError || !userData?.user) {
    throw userError ?? new Error('Failed to create user');
  }

  const { data: entityData, error: entityError } = await client
    .from('entity')
    .insert({ name: 'Client E2E Entity', display_number: 0 })
    .select('id')
    .single();
  if (entityError || !entityData?.id) throw entityError ?? new Error('Failed to create entity');

  const { error: membershipError } = await client.from('entity_members').insert({
    entity_id: entityData.id,
    user_id: userData.user.id,
    role: 'OWNER',
  });
  if (membershipError) throw membershipError;

  created.push({userId: userData.user.id, entityId: entityData.id})

  return { email, password: PASSWORD, userId: userData.user.id };
}


test.beforeEach(async ({ context, page }) => {
  // Clear all cookies and storage to ensure clean state
  await context.clearCookies();
  await page.goto('/');
});

test.afterEach(async () => {
  for (const entry of created.splice(0)) {
    await client.from('entity').delete().eq('id', entry.entityId);
    await client.auth.admin.deleteUser(entry.userId);
  }
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
  const user = await createUserWithEntity()
  await page.goto('/sign-in');

  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/password/i).fill(user.password);
  await page.getByRole('button', { name: /sign in/i }).click();

  // Wait for navigation to dashboard
  await page.waitForURL('/dashboard');
});

test('should persist session after page reload', async ({ page }) => {
  const user = await createUserWithEntity()
  
  await page.goto('/sign-in');
  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/password/i).fill(user.password);
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
  const user = await createUserWithEntity()

  await page.goto('/sign-in');
  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/password/i).fill(user.password);

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
