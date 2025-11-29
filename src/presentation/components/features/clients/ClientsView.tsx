'use client'

import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Plus, Search, MoreHorizontal, Loader2 } from 'lucide-react'
import type { ClientDTO } from '@/application/client/dto/ClientDTO'
import { useActiveEntity } from '@/presentation/contexts/EntityContext'
import { clientFormSchema, type ClientFormValues } from '@/presentation/validators/clientSchemas'
import { Button } from '@/presentation/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Input } from '@/presentation/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/presentation/components/ui/table'
import { Badge } from '@/presentation/components/ui/badge'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/presentation/components/ui/form'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'

const CLIENT_QUERY_ROOT = ['clients'] as const

export function ClientsView() {
  const entity = useActiveEntity()
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientDTO | null>(null)
  const queryClient = useQueryClient()

  const queryKey = useMemo(() => [...CLIENT_QUERY_ROOT, entity?.id, deferredSearch] as const, [entity?.id, deferredSearch])

  const {
    data: clients,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey,
    queryFn: () => fetchClients(entity!.id, deferredSearch),
    enabled: Boolean(entity?.id),
  })

  const createClientMutation = useMutation({
    mutationFn: (values: ClientFormValues) => createClient(entity!.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_ROOT })
      toast.success('Client added')
      setIsCreateOpen(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const updateClientMutation = useMutation({
    mutationFn: ({ clientId, values }: { clientId: string; values: ClientFormValues }) =>
      updateClient(entity!.id, clientId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_ROOT })
      toast.success('Client updated')
      setEditingClient(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteClientMutation = useMutation({
    mutationFn: (clientId: string) => deleteClient(entity!.id, clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_ROOT })
      toast.success('Client deleted')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  if (!entity) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No entity selected</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            We could not find an active entity for your account. Please complete onboarding before managing
            clients.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            {entity.name ? `${entity.name} • ` : ''}Manage your client database
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search by name, phone, or Instagram handle..."
                className="pl-10"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Button variant="outline" disabled>
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Lead Source</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <SkeletonRows />
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <p className="text-destructive text-sm">{(error as Error)?.message ?? 'Failed to load clients'}</p>
                  </TableCell>
                </TableRow>
              ) : !clients || clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="text-center text-muted-foreground text-sm py-6">No clients found</div>
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="font-medium">{client.name}</div>
                      <p className="text-muted-foreground text-xs">#{formatDisplayNumber(client.displayNumber)}</p>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{client.phone?.formatted ?? '—'}</div>
                      <p className="text-muted-foreground text-xs">{client.instagram?.handle ?? '—'}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{client.leadSource || 'other'}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(client.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingClient(client)}>Edit client</DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => deleteClientMutation.mutate(client.id)}
                          >
                            {deleteClientMutation.isPending && deleteClientMutation.variables === client.id ? (
                              <span className="flex items-center gap-2">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Deleting...
                              </span>
                            ) : (
                              'Delete'
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ClientFormDialog
        title="Add Client"
        description="Capture contact info and lead source for quick follow-ups."
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={(values) => createClientMutation.mutateAsync(values)}
        loading={createClientMutation.isPending}
      />

      <ClientFormDialog
        title="Edit Client"
        description="Update contact details or lead source."
        open={Boolean(editingClient)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingClient(null)
          }
        }}
        initialValues={editingClient ? mapClientToFormValues(editingClient) : undefined}
        onSubmit={(values) =>
          editingClient ? updateClientMutation.mutateAsync({ clientId: editingClient.id, values }) : Promise.resolve()
        }
        loading={updateClientMutation.isPending}
      />
    </div>
  )
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          <TableCell colSpan={5}>
            <Skeleton className="h-10 w-full" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

function ClientFormDialog({
  title,
  description,
  open,
  onOpenChange,
  onSubmit,
  loading,
  initialValues,
}: {
  title: string
  description: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: ClientFormValues) => Promise<void>
  loading?: boolean
  initialValues?: ClientFormValues
}) {
  const baseValues = useMemo<ClientFormValues>(
    () =>
      initialValues ?? {
        name: '',
        phone: '',
        instagram: '',
        leadSource: '',
      },
    [initialValues]
  )

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: baseValues,
  })

  useEffect(() => {
    if (open) {
      form.reset(baseValues)
    }
  }, [open, baseValues, form])

  const handleSubmit = async (values: ClientFormValues) => {
    await onSubmit(values)
    form.reset(baseValues)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Client full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <Input placeholder="@handle" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="leadSource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lead Source</FormLabel>
                  <FormControl>
                    <Input placeholder="instagram, referral, walk in..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

async function fetchClients(entityId: string, search?: string) {
  const params = new URLSearchParams()
  if (search && search.trim()) {
    params.set('search', search.trim())
  }

  const response = await fetch(`/api/clients${params.toString() ? `?${params.toString()}` : ''}`, {
    headers: {
      'x-entity-id': entityId,
    },
  })

  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload.error ?? 'Failed to fetch clients')
  }

  return (payload.data ?? []) as ClientDTO[]
}

async function createClient(entityId: string, values: ClientFormValues) {
  const response = await fetch('/api/clients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-entity-id': entityId,
    },
    body: JSON.stringify(mapFormValues(values)),
  })

  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload.error ?? 'Failed to create client')
  }

  return payload.data as ClientDTO
}

async function updateClient(entityId: string, clientId: string, values: ClientFormValues) {
  const response = await fetch(`/api/clients/${clientId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-entity-id': entityId,
    },
    body: JSON.stringify(mapFormValues(values)),
  })

  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload.error ?? 'Failed to update client')
  }

  return payload.data as ClientDTO
}

async function deleteClient(entityId: string, clientId: string) {
  const response = await fetch(`/api/clients/${clientId}`, {
    method: 'DELETE',
    headers: {
      'x-entity-id': entityId,
    },
  })

  if (!response.ok) {
    const payload = await response.json()
    throw new Error(payload.error ?? 'Failed to delete client')
  }
}

function mapFormValues(values: ClientFormValues) {
  const sanitize = (input?: string | null) => {
    const trimmed = input?.trim()
    return trimmed && trimmed.length > 0 ? trimmed : null
  }

  const leadSource = values.leadSource?.trim()

  return {
    name: values.name.trim(),
    phone: sanitize(values.phone ?? null),
    instagram: sanitize(values.instagram ?? null),
    leadSource: leadSource && leadSource.length > 0 ? leadSource : undefined,
  }
}

function mapClientToFormValues(client: ClientDTO): ClientFormValues {
  return {
    name: client.name,
    phone: client.phone?.value ?? '',
    instagram: client.instagram?.handle ?? '',
    leadSource: client.leadSource ?? '',
  }
}

function formatDisplayNumber(value: number) {
  return value.toString().padStart(4, '0')
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso))
}
