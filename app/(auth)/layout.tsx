import { redirect } from 'next/navigation';
import { ThemeSwitcher } from '@/shared/ui/theme-switcher';
import { createClient } from '@/shared/supabase/client-server';
import { AuthProviders } from '@/shared/providers';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If user is already authenticated, redirect to dashboard
  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <AuthProviders>
      <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10">
        <div className="absolute right-4 top-4">
          <ThemeSwitcher />
        </div>
        <div className="w-full max-w-md rounded-2xl border bg-card/80 p-8 shadow-lg backdrop-blur">
          {children}
        </div>
      </div>
    </AuthProviders>
  );
}
