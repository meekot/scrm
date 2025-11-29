"use client";

import { useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/supabase/types';
import type { ClientWithStats } from '../queries';
import { useClients, useDeleteClient } from '../hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Separator } from '@/shared/ui/separator';
import { Button } from '@/shared/ui/button';
import { PhoneCall, Instagram, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { ClientForm } from './ClientForm';

type Supabase = SupabaseClient<Database>;
type ClientListProps = {
  client: Supabase;
  entityId: string;
};

export function ClientList({ client, entityId }: ClientListProps) {
  const { data, isLoading, isError, error } = useClients(client, entityId);
  const deleteMutation = useDeleteClient(client, entityId);
  const clients = useMemo(() => (data as ClientWithStats[]) ?? [], [data]);
  const [editingClient, setEditingClient] = useState<ClientWithStats | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ClientWithStats | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<
    'created_desc' | 'display_asc' | 'last_appointment_desc' | 'appointment_count_desc' | 'spent_desc'
  >('created_desc');

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading clients...</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : 'Failed to load clients'}
      </p>
    );
  }

  if (!clients.length) {
    return <p className="text-sm text-muted-foreground">No clients yet. Add your first one.</p>;
  }

  const filtered = clients.filter((clientItem) => {
    const query = search.toLowerCase();
    if (!query) return true;
    return (
      clientItem.name.toLowerCase().includes(query) ||
      (clientItem.phone ?? '').toLowerCase().includes(query) ||
      clientItem.display_number.toString().includes(query) ||
      (clientItem.instagram ?? '').toLowerCase().includes(query)
    );
  });

  const sorted = filtered.sort((a, b) => {
    const lastA = getLastAppointmentDate(a);
    const lastB = getLastAppointmentDate(b);
    const countA = a.appointments?.length ?? 0;
    const countB = b.appointments?.length ?? 0;
    const spentA = getTotalSpent(a);
    const spentB = getTotalSpent(b);
    switch (sortBy) {
      case 'display_asc':
        return a.display_number - b.display_number;
      case 'last_appointment_desc':
        if (lastA && lastB) return lastB - lastA;
        if (lastA) return -1;
        if (lastB) return 1;
        return 0;
      case 'appointment_count_desc':
        return countB - countA;
      case 'spent_desc':
        return spentB - spentA;
      case 'created_desc':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">Total clients: {clients.length}</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            placeholder="Search by name, phone, number, instagram"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:w-64"
          />
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
            <span className="text-sm text-muted-foreground">Sort:</span>
            <Select value={sortBy} onValueChange={(val) => setSortBy(val as typeof sortBy)}>
              <SelectTrigger className="sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_desc">Created (newest)</SelectItem>
                <SelectItem value="display_asc">Display number</SelectItem>
                <SelectItem value="last_appointment_desc">Last appointment</SelectItem>
                <SelectItem value="appointment_count_desc">Total appointments</SelectItem>
                <SelectItem value="spent_desc">Total spent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {sorted.map((clientItem) => (
        <ClientCard
          key={clientItem.id}
          client={clientItem}
          onEdit={() => setEditingClient(clientItem)}
          onDelete={() => {
            setDeleteError(null);
            setPendingDelete(clientItem);
          }}
        />
      ))}
      {deleteError ? <p className="text-sm text-destructive">{deleteError}</p> : null}

      <Dialog open={Boolean(editingClient)} onOpenChange={(open) => !open && setEditingClient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit client</DialogTitle>
            <DialogDescription>Update client details.</DialogDescription>
          </DialogHeader>
          {editingClient ? (
            <ClientForm
              client={client}
              entityId={entityId}
              mode="edit"
              clientId={editingClient.id}
              defaultValues={{
                name: editingClient.name,
                phone: editingClient.phone ?? '',
                instagram: editingClient.instagram ?? '',
                lead_source: editingClient.lead_source ?? '',
              }}
              onSaved={() => setEditingClient(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete client?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={async () => {
                if (!pendingDelete) return;
                setDeleteError(null);
                try {
                  await deleteMutation.mutateAsync(pendingDelete.id);
                  setPendingDelete(null);
                } catch (mutationError) {
                  setDeleteError(
                    mutationError instanceof Error
                      ? mutationError.message
                      : 'Unable to delete client.'
                  );
                }
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ClientCard({
  client,
  onEdit,
  onDelete,
}: {
  client: ClientWithStats;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const instaHandle = client.instagram?.startsWith('@')
    ? client.instagram.slice(1)
    : client.instagram ?? '';
  const appointmentCount = client.appointments?.length ?? 0;
  const totalSpent = getTotalSpent(client);
  const lastAppointment = getLastAppointmentDate(client);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>
            #{client.display_number} {client.name}
          </span>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon-sm" aria-label={`Call ${client.name}`}>
              <a href={`tel:${client.phone}`}>
                <PhoneCall className="size-4" />
              </a>
            </Button>
            {instaHandle ? (
              <Button
                asChild
                variant="ghost"
                size="icon-sm"
                aria-label={`Open Instagram for ${client.name}`}
              >
                <a href={`https://instagram.com/${instaHandle}`} target="_blank" rel="noreferrer">
                  <Instagram className="size-4" />
                </a>
              </Button>
            ) : null}
            <Button variant="ghost" size="icon-sm" aria-label={`Edit ${client.name}`} onClick={onEdit}>
              <Pencil className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label={`Delete ${client.name}`} onClick={onDelete}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{client.phone}</p>
      </CardHeader>
        <>
          <Separator />
          <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
            {client.instagram ? <p>Instagram: {client.instagram}</p> : null}
            {client.lead_source ? <p>Lead source: {client.lead_source}</p> : null}
            <p>Created: {new Date(client.created_at).toLocaleDateString()}</p>
            <p>Total appointments: {appointmentCount}</p>
            <p>Total spent: €{totalSpent.toFixed(2)}</p>
            {lastAppointment ? (
              <p>
                Last appointment:{' '}
                {new Date(lastAppointment).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            ) : (
              <p>Last appointment: -</p>
            )}
          </CardContent>
        </>
    
    </Card>
  );
}

function getTotalSpent(client: ClientWithStats) {
  return (client.appointments ?? []).reduce((sum, app) => sum + (Number(app.price) || 0), 0);
}

function getLastAppointmentDate(client: ClientWithStats) {
  return (client.appointments ?? [])
    .map((app) => new Date(`${app.date}T${app.time ?? '00:00'}`).getTime())
    .sort((a, b) => b - a)[0];
}
