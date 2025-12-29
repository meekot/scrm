"use client";

import type { ReactNode } from 'react';
import type { Supabase } from '@/shared/supabase';
import type { ClientInput } from '../schemas';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { ClientForm } from './ClientForm';

type ClientUpsertDialogProps = {
  client: Supabase;
  entityId: string;
  mode?: 'create' | 'edit';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  clientId?: string;
  defaultValues?: Partial<ClientInput>;
  onCreated?: () => void;
  onSaved?: () => void;
};

export function ClientUpsertDialog({
  client,
  entityId,
  mode = 'create',
  open,
  onOpenChange,
  trigger,
  clientId,
  defaultValues,
  onCreated,
  onSaved,
}: ClientUpsertDialogProps) {
  const isEdit = mode === 'edit';
  const title = isEdit ? 'Edit client' : 'Add client';
  const description = isEdit ? 'Update client details.' : 'Phone number is required (international format).';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {isEdit && !clientId ? null : (
          <ClientForm
            client={client}
            entityId={entityId}
            mode={mode}
            clientId={clientId}
            defaultValues={defaultValues}
            onCreated={onCreated}
            onSaved={onSaved}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
