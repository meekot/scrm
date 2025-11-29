import { createSupabaseServerClient } from '@/infrastructure/persistence/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/presentation/components/layouts/Sidebar'
import { BottomNav } from '@/presentation/components/layouts/BottomNav'
import { EntityProvider } from '@/presentation/contexts/EntityContext'
import type { Database } from '@/infrastructure/persistence/supabase/types'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  type MembershipRow = Database['public']['Tables']['entity_members']['Row'] & {
    entity?: Pick<Database['public']['Tables']['entity']['Row'], 'name' | 'display_number'> | null
  }

  const { data: activeMembership } = await supabase
    .from('entity_members')
    .select('entity_id, entity:entity (name, display_number)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle<MembershipRow>()

  const activeEntity = activeMembership
    ? {
        id: activeMembership.entity_id,
        name: activeMembership.entity?.name ?? null,
        displayNumber: activeMembership.entity?.display_number ?? null,
      }
    : null

  return (
    <EntityProvider value={activeEntity}>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
            <div className="container mx-auto px-4 py-6 md:px-8">{children}</div>
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </EntityProvider>
  )
}
