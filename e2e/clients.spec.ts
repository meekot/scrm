import { config } from 'dotenv';
import { test, expect } from '@playwright/test';
import { createSupabaseClient } from './supabaseClient';

config({ path: '.env.local' });

const client = createSupabaseClient();
const PASSWORD = 'Testpass123!';

type CreatedRecord = { userId: string; entityId: string; clientId?: string; appointmentId?: string };
const created: CreatedRecord[] = [];

async function seedUserEntity(options: { withClient?: boolean; withAppointment?: boolean }) {
  const email = `client-e2e-${Date.now()}-${Math.random().toString(16).slice(2)}@test.com`;

  const { data: userData, error: userError } = await client.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
  });
  if (userError || !userData?.user) throw userError ?? new Error('Failed to create user');

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

  let clientId: string | undefined;
  let appointmentId: string | undefined;

  if (options.withClient) {
    const { data: clientData, error: clientError } = await client
      .from('clients')
      .insert({
        entity_id: entityData.id,
        name: 'Seeded Client',
        phone: '+33612345678',
        display_number: 0,
      })
      .select('id')
      .single();
    if (clientError || !clientData?.id) throw clientError ?? new Error('Failed to seed client');
    clientId = clientData.id;

    if (options.withAppointment) {
      const { data: apptData, error: apptError } = await client
        .from('appointments')
        .insert({
          entity_id: entityData.id,
          client_id: clientId,
          display_number: 0,
          date: '2025-01-01',
          price: 50,
          status: 'scheduled',
        })
        .select('id')
        .single();
      if (apptError || !apptData?.id) throw apptError ?? new Error('Failed to seed appointment');
      appointmentId = apptData.id;
    }
  }

  created.push({ userId: userData.user.id, entityId: entityData.id, clientId, appointmentId });

  return { email, password: PASSWORD };
}

test.beforeEach(async ({ context, page }) => {
  await context.clearCookies();
  await page.goto('/');
});

test.afterEach(async () => {
  for (const entry of created.splice(0)) {
    if (entry.appointmentId) {
      await client.from('appointments').delete().eq('id', entry.appointmentId);
    }
    if (entry.clientId) {
      await client.from('clients').delete().eq('id', entry.clientId);
    }
    await client.from('entity').delete().eq('id', entry.entityId);
    await client.auth.admin.deleteUser(entry.userId);
  }
});

test('create client with phone and view stats', async ({ page }) => {
  const user = await seedUserEntity({ withClient: false, withAppointment: false });

  await page.goto('/sign-in');
  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/password/i).fill(user.password);
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.waitForURL('/dashboard');
  await page.goto('/clients');

  await page.getByRole('button', { name: /add client/i }).click();
  await page.getByLabel(/^name$/i).fill('Playwright Client');
  await page.getByLabel(/phone/i).fill('+33612345679');
  await page.getByRole('button', { name: /create client/i }).click();

  await page.waitForTimeout(500);
  await expect(page.getByText(/#1 playwright client/i)).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/total appointments: 0/i)).toBeVisible();
});

test('cannot delete client with appointments', async ({ page }) => {
  const user = await seedUserEntity({ withClient: true, withAppointment: true });

  await page.goto('/sign-in');
  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/password/i).fill(user.password);
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.waitForURL('/dashboard');
  await page.goto('/clients');

  await page.getByRole('button', { name: /delete seeded client/i }).click();
  await page.getByRole('button', { name: /^delete$/i }).click();
  await expect(page.getByText(/cannot delete client that has appointments/i)).toBeVisible();
});
