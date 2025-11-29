import { config } from 'dotenv';
import { expect, test } from '@playwright/test';
import { createSupabaseClient } from './supabaseClient';

config({ path: '.env.local' });

const client = createSupabaseClient();
const PASSWORD = 'Testpass123!';

type CreatedRecord = { userId: string; entityId: string; serviceId?: string };
const created: CreatedRecord[] = [];

async function createUserWithEntity(options: { seedService?: boolean; seedAppointment?: boolean }) {
  const email = `svc-${Date.now()}-${Math.random().toString(16).slice(2)}@test.com`;

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
    .insert({ name: 'E2E Services Entity', display_number: 0 })
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

  let serviceId: string | undefined;

  if (options.seedService) {
    const { data: serviceData, error: serviceError } = await client
      .from('services')
      .insert({
        entity_id: entityData.id,
        name: 'Seed Service',
        price: 25,
        duration: 30,
        description: 'Seeded description',
        display_number: 0,
      })
      .select('id')
      .single();

    if (serviceError || !serviceData?.id) {
      throw serviceError ?? new Error('Failed to seed service');
    }
    serviceId = serviceData.id;
  }

  if (options.seedAppointment && serviceId) {
    const { error: appointmentError } = await client.from('appointments').insert({
      entity_id: entityData.id,
      client_id: null,
      service_id: serviceId,
      display_number: 0,
      date: '2025-01-01',
      price: 0,
      status: 'scheduled',
    });
    if (appointmentError) {
      throw appointmentError;
    }
  }

  created.push({ userId: userData.user.id, entityId: entityData.id, serviceId });

  return { email, password: PASSWORD };
}

test.beforeEach(async ({ context, page }) => {
  await context.clearCookies();
  await page.goto('/');
});

test.afterEach(async () => {
  for (const entry of created.splice(0)) {
    if (entry.entityId) {
      await client.from('services').delete().eq('entity_id', entry.entityId);
      await client.from('entity').delete().eq('id', entry.entityId);
    }
    if (entry.userId) {
      await client.auth.admin.deleteUser(entry.userId);
    }
  }
});

test('user can create, edit, and delete a service', async ({ page }) => {
  const user = await createUserWithEntity({ seedService: false, seedAppointment: false });

  // Sign in
  await page.goto('/sign-in');
  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/password/i).fill(user.password);
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.waitForURL('/dashboard');
  await page.goto('/services');

  await expect(page.getByRole('heading', { name: /services/i })).toBeVisible();
  await expect(page.getByText(/no services yet/i)).toBeVisible();

  // Create service
  await page.getByRole('button', { name: /create service/i }).click();
  await page.getByLabel(/^name$/i).fill('Test Service');
  await page.getByLabel(/^price$/i).fill('75');
  await page.getByLabel(/duration/i).fill('60');
  await page.getByLabel(/description/i).fill('Description here');
  await page.getByRole('button', { name: /^create service$/i }).click();

  await expect(page.getByText(/test service/i)).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/60 min/)).toBeVisible();
  await expect(page.getByText(/description here/i)).toBeVisible();

  // Edit service
  await page.getByRole('button', { name: /edit test service/i }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel(/^name$/i).fill('Updated Service');
  await dialog.getByLabel(/^price$/i).fill('120');
  await dialog.getByLabel(/duration/i).fill('90');
  await dialog.getByLabel(/description/i).fill('Updated description');
  await dialog.getByRole('button', { name: /save changes/i }).click();

  await expect(page.getByText(/updated service/i)).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/90 min/)).toBeVisible();
  await expect(page.getByText(/updated description/i)).toBeVisible();

  // Delete service
  await page.getByRole('button', { name: /delete updated service/i }).click();
  await page.getByRole('button', { name: /^delete$/i }).click();
  await expect(page.getByText(/updated service/i)).not.toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/no services yet/i)).toBeVisible({ timeout: 10000 });
});

test('cannot delete service linked to appointments', async ({ page }) => {
  const user = await createUserWithEntity({ seedService: true, seedAppointment: true });

  // Sign in
  await page.goto('/sign-in');
  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/password/i).fill(user.password);
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.waitForURL('/dashboard');
  await page.goto('/services');

  // Attempt to delete seeded service should show error
  await page.getByRole('button', { name: /delete seed service/i }).click();
  await page.getByRole('button', { name: /^delete$/i }).click();
  await expect(page.getByText(/cannot delete service that is used in appointments/i)).toBeVisible();
});
