import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/shared/supabase/types';

// Load environment variables
config({ path: '.env.local' });

const TEST_USER = {
  email: 'test2@test.com',
  password: 'testpass123',
};

async function setup() {
  // Create admin client using service role key (bypasses RLS)
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      db: {
        schema: 'public',
      },
    }
  );

  console.log('Setting up test user...');

  // Try to find and delete existing test user by email
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users.find(u => u.email === TEST_USER.email);

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
