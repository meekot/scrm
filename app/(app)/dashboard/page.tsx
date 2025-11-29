import { createClient } from '@/shared/supabase/client-server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.email}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Clients</h3>
          <p className="text-2xl font-bold">-</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Appointments Today</h3>
          <p className="text-2xl font-bold">-</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Services</h3>
          <p className="text-2xl font-bold">-</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Monthly Revenue</h3>
          <p className="text-2xl font-bold">-</p>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Dashboard metrics will be implemented next</p>
      </div>
    </div>
  );
}
