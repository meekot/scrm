import { z } from 'zod';

export const appointmentInputSchema = z.object({
  client_id: z.string().min(1, 'Client is required'),
  service_id: z.string().min(1, 'Service is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  price: z.number().nonnegative(),
  status: z.enum(['scheduled', 'canceled', 'completed']),
});

export type AppointmentInput = z.infer<typeof appointmentInputSchema>;
