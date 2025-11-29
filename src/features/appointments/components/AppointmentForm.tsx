"use client";

import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/supabase/types';
import { appointmentInputSchema, type AppointmentInput } from '../schemas';
import { useCreateAppointment } from '../hooks';
import { useServices } from '@/features/services/hooks';
import { useClients } from '@/features/clients/hooks';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Input } from '@/shared/ui/input';
import { InputCurrency } from '@/shared/ui/input-currency';
import { Button } from '@/shared/ui/button';
import { useToast } from '@/shared/ui/toast';

type Supabase = SupabaseClient<Database>;

type Props = {
  client: Supabase;
  entityId: string;
  onCreated?: () => void;
};

export function AppointmentForm({ client, entityId, onCreated }: Props) {
  const { data: services } = useServices(client, entityId);
  const { data: clients } = useClients(client, entityId);
  const createMutation = useCreateAppointment(client, entityId);
  const { addToast } = useToast();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<AppointmentInput>({
    resolver: zodResolver(appointmentInputSchema),
    defaultValues: {
      client_id: '',
      service_id: '',
      date: '',
      time: '',
      price: 0,
      status: 'scheduled',
    },
  });

  const onSubmit = async (values: AppointmentInput) => {
    setFormError(null);
    try {
      await createMutation.mutateAsync({ ...values, price: values.price ?? 0 });
      form.reset({
        client_id: '',
        service_id: '',
        date: '',
        time: '',
        price: 0,
        status: 'scheduled',
      });
      addToast({ title: 'Appointment created' });
      onCreated?.();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to create appointment');
    }
  };

  const serviceOptions = useMemo(() => services ?? [], [services]);
  const clientOptions = useMemo(() => clients ?? [], [clients]);

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientOptions.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        #{c.display_number} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="service_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceOptions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        #{s.display_number} {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <InputCurrency
                  value={field.value}
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

        {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Saving...' : 'Create appointment'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
