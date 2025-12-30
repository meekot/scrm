"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Supabase } from '@/shared/supabase';
import type { ClientWithStats } from '../queries';
import type { ClientSort } from '../queries';
import { useDeleteClient, useInfiniteClients } from '../hooks';
import { formatCurrency, formatDate, formatDateTime } from '@/shared/lib/formatters';
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
import { ClientUpsertDialog } from './ClientUpsertDialog';
type ClientListProps = {
  client: Supabase;
  entityId: string;
};

export function ClientList({ client, entityId }: ClientListProps) {
  const deleteMutation = useDeleteClient(client, entityId);
  const [editingClient, setEditingClient] = useState<ClientWithStats | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ClientWithStats | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<ClientSort>('created_desc');
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const normalizedSearch = search.trim();

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteClients(client, entityId, { search: normalizedSearch, sortBy });

  const clients = useMemo(
    () => (data?.pages.flat() as ClientWithStats[]) ?? [],
    [data?.pages]
  );

  useEffect(() => {
    if (!hasNextPage) return;
    const node = loadMoreRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const isInitialLoading = isLoading && !clients.length;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
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

      {isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load clients'}
        </p>
      ) : null}
      {isInitialLoading ? (
        <p className="text-sm text-muted-foreground">Loading clients...</p>
      ) : null}
      {!isInitialLoading && !isError && !clients.length ? (
        <p className="text-sm text-muted-foreground">No clients yet. Add your first one.</p>
      ) : null}
      {!isInitialLoading && !isError
        ? clients.map((clientItem) => (
            <ClientCard
              key={clientItem.id}
              client={clientItem}
              onEdit={() => setEditingClient(clientItem)}
              onDelete={() => {
                setDeleteError(null);
                setPendingDelete(clientItem);
              }}
            />
          ))
        : null}
      {deleteError ? <p className="text-sm text-destructive">{deleteError}</p> : null}

      <ClientUpsertDialog
        client={client}
        entityId={entityId}
        mode="edit"
        open={Boolean(editingClient)}
        onOpenChange={(open) => !open && setEditingClient(null)}
        clientId={editingClient?.id}
        defaultValues={
          editingClient
            ? {
                name: editingClient.name,
                phone: editingClient.phone ?? '',
                instagram: editingClient.instagram ?? '',
                lead_source: editingClient.lead_source ?? '',
              }
            : undefined
        }
        onSaved={() => setEditingClient(null)}
      />

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

      {!isError ? <div ref={loadMoreRef} /> : null}
      {isFetchingNextPage ? (
        <p className="text-sm text-muted-foreground">Loading more clients...</p>
      ) : null}
      {!hasNextPage && clients.length ? (
        <p className="text-sm text-muted-foreground">All clients loaded.</p>
      ) : null}
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
  const appointmentCount = client.appointment_count ?? 0;
  const totalSpent = client.total_spent ?? 0;
  const lastAppointment = client.last_appointment_at;

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
            <p>Created: {formatDate(client.created_at)}</p>
            <p>Total appointments: {appointmentCount}</p>
            <p>Total spent: {formatCurrency(totalSpent)}</p>
            {lastAppointment ? (
              <p>
                Last appointment: {formatDateTime(lastAppointment, { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            ) : (
              <p>Last appointment: -</p>
            )}
          </CardContent>
        </>
    
    </Card>
  );
}
