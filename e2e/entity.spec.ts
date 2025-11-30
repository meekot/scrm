import { expect, test } from '@playwright/test';
import { createSupabaseClient } from './supabaseClient';

const client = createSupabaseClient();

const PASSWORD = 'Testpass123!';

async function createUserWithEntity(options: { withEntity: boolean }) {
  const email = `e2e-${Date.now()}-${Math.random().toString(16).slice(2)}@test.com`;

  const { data: userData, error: userError } = await client.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
  });

  if (userError || !userData?.user) {
    throw userError ?? new Error('Failed to create user');
  }

  let entityId: string | null = null;

  if (options.withEntity) {
    const { data: entityData, error: entityError } = await client
      .from('entity')
      .insert({ name: 'E2E Entity', display_number: 0 })
      .select('id')
      .single();

    if (entityError || !entityData?.id) {
      throw entityError ?? new Error('Failed to create entity');
    }

    const { error: membershipError } = await client.from('entity_members').insert({
      entity_id: entityData.id,
      user_id: userData.user.id,
      role: 'OWNER',
    });

    if (membershipError) {
      throw membershipError;
    }

    entityId = entityData.id;
  }

  return { email, password: PASSWORD, entityId, userId: userData.user.id };
}

const createdUsers: Array<{ userId: string; entityId: string | null }> = [];

test.beforeEach(async ({ context, page }) => {
  await context.clearCookies();
  await page.goto('/');
});

test.afterEach(async () => {
  // Cleanup created users and entities to keep DB tidy
  for (const entry of createdUsers.splice(0)) {
    if (entry.entityId) {
      await client.from('entity').delete().eq('id', entry.entityId);
    }
    await client.auth.admin.deleteUser(entry.userId);
  }
});

test('redirects user without entity membership to /no-entity', async ({ page }) => {
  const user = await createUserWithEntity({ withEntity: false });
  createdUsers.push({ userId: user.userId, entityId: user.entityId });

  await page.goto('/sign-in');
  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/password/i).fill(user.password);
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.waitForURL('/no-entity');
  await expect(page).toHaveURL('/no-entity');
  await expect(page.getByRole('heading', { name: /no entity assigned/i })).toBeVisible();
});

test('allows user with entity membership to reach dashboard', async ({ page }) => {
  const user = await createUserWithEntity({ withEntity: true });
  createdUsers.push({ userId: user.userId, entityId: user.entityId });

  await page.goto('/sign-in');
  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/password/i).fill(user.password);
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.waitForURL('/dashboard');
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
});
