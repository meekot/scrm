import { z } from 'zod';

export const appointmentInputSchema = z.object({
  client_id: z.string().min(1, 'Client is required'),
  service_id: z.string().min(1, 'Service is required'),
  date: z
    .string()
    .min(1, 'Date is required')
    .refine(
      (dateStr) => {
        const selectedDate = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      },
      { message: 'Date cannot be in the past' }
    ),
  time: z.string().min(1, 'Time is required'),
  price: z.number().nonnegative('Price must be positive'),
  status: z.enum(['scheduled', 'canceled', 'completed']),
  notes: z.string().optional(),
});

export type AppointmentInput = z.infer<typeof appointmentInputSchema>;
