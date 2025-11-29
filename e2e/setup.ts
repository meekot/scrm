import { config } from 'dotenv';
import { createClient } from './supabaseClient';

// Load environment variables
config({ path: '.env.local' });

const TEST_USER = {
  email: 'test2@test.com',
  password: 'testpass123',
};

async function setup() {
  const supabase = createClient();

  console.log('Setting up test user...');

  // Try to find and delete existing test user by email
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const users = existingUsers?.users ?? [];
  const existingUser = (users as Array<{ id: string; email?: string }>).find(
    user => user.email === TEST_USER.email
  );

  if (existingUser) {
    await supabase.auth.admin.deleteUser(existingUser.id);
    console.log('Deleted existing test user');
  }

  // Create test user
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: TEST_USER.email,
    password: TEST_USER.password,
    email_confirm: true,
    user_metadata: {},
  });

  if (userError) {
    console.error('Failed to create test user:', userError);
    process.exit(1);
  }

  console.log('Created test user:', userData.user.email);
  console.log('User ID:', userData.user.id);

  console.log('\n✅ Test user created successfully!');
  console.log(`Email: ${TEST_USER.email}`);
  console.log(`Password: ${TEST_USER.password}`);
  console.log(`\n📝 Next step: Create an entity for this user in Supabase Studio or via SQL`);
}

setup();
