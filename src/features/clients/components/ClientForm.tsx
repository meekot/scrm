"use client";

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import { InputPhone } from '@/shared/ui/input-phone';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/supabase/types';
import { clientInputSchema, type ClientInput } from '../schemas';
import { useCreateClient, useUpdateClient } from '../hooks';
import { useToast } from '@/shared/ui/toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';

type Supabase = SupabaseClient<Database>;

type ClientFormProps = {
  client: Supabase;
  entityId: string;
  mode?: 'create' | 'edit';
  clientId?: string;
  defaultValues?: Partial<ClientInput>;
  onCreated?: () => void;
  onSaved?: () => void;
};

export function ClientForm({
  client,
  entityId,
  mode = 'create',
  clientId,
  defaultValues,
  onCreated,
  onSaved,
}: ClientFormProps) {
  const form = useForm<ClientInput>({
    resolver: zodResolver(clientInputSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      phone: defaultValues?.phone ?? '',
      instagram: defaultValues?.instagram ?? '',
      lead_source: defaultValues?.lead_source ?? '',
    },
  });

  const createMutation = useCreateClient(client, entityId);
  const updateMutation = useUpdateClient(client, entityId);
  const { addToast } = useToast();
  const [formError, setFormError] = useState<string | null>(null);
  const isSubmitting = mode === 'create' ? createMutation.isPending : updateMutation.isPending;

  const onSubmit = async (values: ClientInput) => {
    setFormError(null);
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(values);
        form.reset();
        addToast({ title: 'Client created', description: `${values.name} was added.` });
        onCreated?.();
      } else if (mode === 'edit' && clientId) {
        await updateMutation.mutateAsync({ id: clientId, input: values });
        addToast({ title: 'Client updated', description: `${values.name} was updated.` });
        onSaved?.();
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to create client');
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Client name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <InputPhone
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? '')}
                  id="phone"
                  name="phone"
                />
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
                <Input placeholder="@username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lead_source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lead source</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="ads">Ads</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create client' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
