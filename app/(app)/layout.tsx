import Link from 'next/link';
import { redirect } from 'next/navigation';
import { MainNav } from '@/components/navigation/MainNav';
import { primaryNavItems } from '@/shared/config/navigation';
import { ThemeSwitcher } from '@/shared/ui/theme-switcher';
import { createClient } from '@/shared/supabase/client-server';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r bg-card/40 md:flex">
          <div className="flex items-center px-6 py-5 text-lg font-semibold">
            <Link href="/dashboard">SCRM</Link>
          </div>
          <MainNav items={primaryNavItems} orientation="sidebar" />
        </aside>

        <div className="flex w-full flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between px-4 py-4 md:px-8">
              <Link href="/dashboard" className="text-lg font-semibold md:hidden">
                SCRM
              </Link>
              <div className="ml-auto flex items-center gap-2">
                <ThemeSwitcher />
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-10">
            {children}
          </main>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 px-2 shadow-lg backdrop-blur md:hidden">
        <MainNav items={primaryNavItems} orientation="bottom" />
      </div>
    </div>
  );
}
