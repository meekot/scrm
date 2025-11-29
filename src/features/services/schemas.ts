import { z } from 'zod';

export const serviceInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().nonnegative().optional(),
  duration: z.number().int().positive().optional(),
  description: z.string().max(500).optional(),
});

export type ServiceInput = z.infer<typeof serviceInputSchema>;
