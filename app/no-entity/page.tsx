import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AuthProviders } from '@/shared/providers';
import { createClient } from '@/shared/supabase/client-server';

export default async function NoEntityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <AuthProviders>
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 py-12 text-center text-foreground">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">No entity assigned</h1>
          <p className="text-sm text-muted-foreground">
            Your account is not linked to an entity yet. Please contact an administrator to be added.
          </p>
        </div>
        <Link
          href="/sign-in"
          className="rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
        >
          Return to sign-in
        </Link>
      </div>
    </AuthProviders>
  );
}
