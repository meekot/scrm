"use client";

import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import type { ServiceInput } from '../schemas';
import { serviceInputSchema } from '../schemas';
import { useCreateService, useUpdateService } from '../hooks';
import type { Supabase } from '@/shared/supabase';
import { Textarea } from '@/shared/ui/textarea';
import { InputCurrency } from '@/shared/ui/input-currency';

type ServiceFormProps = {
  client: Supabase;
  entityId: string;
  defaultValues?: Partial<ServiceInput>;
  mode: 'create' | 'edit';
  serviceId?: string;
  onSuccess?: () => void;
  onCreated?: () => void;
};

export function ServiceForm({
  client,
  entityId,
  defaultValues,
  mode,
  serviceId,
  onSuccess,
  onCreated,
}: ServiceFormProps) {
  const form = useForm<ServiceInput>({
    resolver: zodResolver(serviceInputSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      price: defaultValues?.price ?? 0,
      duration: defaultValues?.duration,
      description: defaultValues?.description ?? '',
    },
  });

  const createMutation = useCreateService(client, entityId);
  const updateMutation = useUpdateService(client, entityId);
  const [formError, setFormError] = useState<string | null>(null);

  const isSubmitting = useMemo(
    () => createMutation.isPending || updateMutation.isPending,
    [createMutation.isPending, updateMutation.isPending]
  );

  const handleSubmit = async (values: ServiceInput) => {
    setFormError(null);
    const price = Number.isFinite(values.price) ? values.price : 0;
    const duration = Number.isFinite(values.duration) ? values.duration : undefined;

    const payload: ServiceInput = {
      name: values.name,
      price,
      duration,
      description: values.description?.trim() || undefined,
    };

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(payload);
        onCreated?.();
        form.reset();
      } else if (mode === 'edit' && serviceId) {
        await updateMutation.mutateAsync({ id: serviceId, input: payload });
      }
      onSuccess?.();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Service name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <InputCurrency
                  placeholder="0"
                  value={field.value ?? 0}
                  onChange={(event) => {
                    const value = event.target.value === '' ? 0 : Number(event.target.value);
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (minutes)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 60"
                  value={field.value ?? ''}
                  onChange={(event) => {
                    const value = event.target.value === '' ? undefined : Number(event.target.value);
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Optional description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create service' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
