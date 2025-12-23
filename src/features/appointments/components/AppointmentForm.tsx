"use client";

import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import type { Supabase } from '@/shared/supabase';
import { formatCurrency } from '@/shared/lib/formatters';
import { appointmentInputSchema, type AppointmentInput } from '../schemas';
import { useCreateAppointment, useUpdateAppointment } from '../hooks';
import { useServices } from '@/features/services/hooks';
import { useClients, useCreateClient } from '@/features/clients/hooks';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { InputCurrency } from '@/shared/ui/input-currency';
import { DatePicker } from '@/shared/ui/date-picker';
import { TimePicker } from '@/shared/ui/time-picker';
import { Button } from '@/shared/ui/button';
import { useToast } from '@/shared/ui/toast';
import { Input } from '@/shared/ui/input';
import { InputPhone } from '@/shared/ui/input-phone';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/utils';

type Props = {
  client: Supabase;
  entityId: string;
  mode?: 'create' | 'edit';
  appointmentId?: string;
  defaultValues?: Partial<AppointmentInput>;
  onSuccess?: () => void;
};

const today = new Date();


/**
 * Get today's date in YYYY-MM-DD format for date input default
 */
function getTodayDate(): string {
  return today.toISOString().split('T')[0];
}

export function AppointmentForm({
  client,
  entityId,
  mode = 'create',
  appointmentId,
  defaultValues,
  onSuccess,
}: Props) {
  const { data: services, isLoading: servicesLoading } = useServices(client, entityId);
  const { data: clients, isLoading: clientsLoading } = useClients(client, entityId);
  const createClientMutation = useCreateClient(client, entityId);
  const createMutation = useCreateAppointment(client, entityId);
  const updateMutation = useUpdateAppointment(client, entityId);
  const { addToast } = useToast();
  const [formError, setFormError] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientInstagram, setNewClientInstagram] = useState('');

  const isEdit = mode === 'edit';

  const form = useForm<AppointmentInput>({
    resolver: zodResolver(appointmentInputSchema),
    defaultValues: {
      client_id: defaultValues?.client_id ?? '',
      service_id: defaultValues?.service_id ?? '',
      date: defaultValues?.date ?? getTodayDate(),
      time: defaultValues?.time ?? '12:00',
      price: defaultValues?.price ?? 0,
      status: defaultValues?.status ?? 'scheduled',
      notes: defaultValues?.notes ?? '',
    },
  });

  const serviceOptions = useMemo(() => services ?? [], [services]);
  const clientOptions = useMemo(() => clients ?? [], [clients]);

  const normalizePhone = (value: string | null | undefined) =>
    (value ?? '').replace(/[^\d+]/g, '');

  const derivedPhone =
    !isEdit || !defaultValues?.client_id || !clients?.length
      ? ''
      : clients.find((c) => c.id === defaultValues.client_id)?.phone ?? '';

  const effectivePhone = phoneTouched ? phone : derivedPhone;

  const isPhoneValid = effectivePhone ? isValidPhoneNumber(effectivePhone) : false;
  const matchedClient = useMemo(() => {
    if (!isPhoneValid || !clients?.length) return null;
    const target = normalizePhone(effectivePhone);
    return clients.find((c) => normalizePhone(c.phone) === target) ?? null;
  }, [clients, effectivePhone, isPhoneValid]);

  // Auto-fill price when service is selected
  const selectedServiceId = useWatch({
    control: form.control,
    name: 'service_id',
  });
  useEffect(() => {
    if (!selectedServiceId || isEdit) return; // Don't auto-fill in edit mode

    const service = serviceOptions.find((s) => s.id === selectedServiceId);
    if (service && service.price !== null) {
      form.setValue('price', service.price, { shouldValidate: false });
    }
  }, [selectedServiceId, serviceOptions, form, isEdit]);

  useEffect(() => {
    if (matchedClient) {
      form.setValue('client_id', matchedClient.id, { shouldValidate: true });
    } else if (isPhoneValid) {
      form.setValue('client_id', '', { shouldValidate: true });
    }
  }, [form, matchedClient, isPhoneValid]);

  const handleNewClientReset = () => {
    setNewClientName('');
    setNewClientInstagram('');
  };

  const onSubmit = async (values: AppointmentInput) => {
    setFormError(null);
    try {
      let clientId = values.client_id;

      if (!isEdit) {
        if (!isPhoneValid) {
          setFormError('Enter a valid phone number first.');
          return;
        }

        if (matchedClient) {
          clientId = matchedClient.id;
        } else {
          if (!newClientName.trim()) {
            setFormError('Name is required for a new client.');
            return;
          }

          const created = await createClientMutation.mutateAsync({
            name: newClientName.trim(),
            phone: effectivePhone,
            instagram: newClientInstagram.trim() || undefined,
            lead_source: 'appointment',
          });
          clientId = created.id;
          handleNewClientReset();
        }
      }

      const payload: AppointmentInput = {
        ...values,
        client_id: clientId,
      };

      if (isEdit && appointmentId) {
        await updateMutation.mutateAsync({ id: appointmentId, input: payload });
        addToast({ title: 'Appointment updated' });
      } else {
        await createMutation.mutateAsync(payload);
        form.reset({
          client_id: '',
          service_id: '',
          date: getTodayDate(),
          time: '',
          price: 0,
          status: 'scheduled',
          notes: '',
        });
        setPhone('');
        setPhoneTouched(false);
        handleNewClientReset();
        addToast({ title: 'Appointment created' });
      }
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save appointment';
      setFormError(message);
    }
  };

  // Loading state
  if (servicesLoading || clientsLoading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  // Empty states
  if (!serviceOptions.length) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-destructive">No services found.</p>
        <p className="text-sm text-muted-foreground">Please create a service first before scheduling appointments.</p>
      </div>
    );
  }

  if (!clientOptions.length) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-destructive">No clients found.</p>
        <p className="text-sm text-muted-foreground">Please add a client first before scheduling appointments.</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client phone</FormLabel>
              <FormControl>
                <InputPhone
                  value={effectivePhone}
                  onChange={(val) => {
                    setPhoneTouched(true);
                    setPhone(val ?? '');
                    field.onChange('');
                  }}
                  id="client-phone"
                  name="client-phone"
                />
              </FormControl>
              <FormMessage />
              {isPhoneValid ? (
                matchedClient ? (
                  <div className="mt-2 rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
                    <p className="font-medium">
                      Existing client matched: #{matchedClient.display_number} {matchedClient.name}
                    </p>
                    <p className="text-muted-foreground">{matchedClient.phone}</p>
                    {matchedClient.instagram ? (
                      <p className="text-muted-foreground">@{matchedClient.instagram}</p>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-2 space-y-3 rounded-md border border-border/80 p-3">
                    <p className="text-sm font-medium">New client</p>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name</label>
                      <Input
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        placeholder="Client name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Instagram (optional)</label>
                      <div className="relative">
                        <span className="-translate-y-1/2 absolute top-1/2 left-3 text-sm text-muted-foreground">
                          @
                        </span>
                        <Input
                          className="pl-7"
                          value={newClientInstagram}
                          onChange={(e) => setNewClientInstagram(e.target.value)}
                          placeholder="username"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Enter only the nickname (no @ or link).</p>
                    </div>
                  </div>
                )
              ) : (
                <p className="text-sm text-muted-foreground">Enter a valid phone number to find or create a client.</p>
              )}
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
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceOptions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        #{s.display_number} {s.name}
                        {s.price !== null ? ` (${formatCurrency(s.price)})` : ''}
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
                  <DatePicker
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => {
                      field.onChange(date && format(date, "yyyy-MM-dd"));
                    }}
                    closeOnSelect={true}
                    defaultMonth={field.value ? new Date(field.value) : today}
                    placeholder="Pick a date"
                    modifiersClassNames={{
                      today: cn("border", "bg-primary/5", "border-primary", "text-primary", "font-bold"),
                    }}
                  />
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
                  <TimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select time"
                    modal={true}
                  />
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

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any notes about this appointment..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending
              ? isEdit
                ? 'Updating...'
                : 'Creating...'
              : isEdit
                ? 'Update appointment'
                : 'Create appointment'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
