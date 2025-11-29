import { redirect } from 'next/navigation';
import { createClient } from '@/shared/supabase/client-server';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/sign-in');
  }
}
