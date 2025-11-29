import { z } from 'zod';
import { parsePhoneNumberFromString } from 'libphonenumber-js/min';

export const clientInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z
    .string()
    .min(1, 'Phone is required')
    .refine(
      (value) => {
        const parsed = parsePhoneNumberFromString(value || '');
        return parsed?.isValid() ?? false;
      },
      'Invalid phone number'
    ),
  instagram: z
    .string()
    .optional()
    .refine((value) => (value ? !value.startsWith('@') : true), 'Do not include "@" in username'),
  lead_source: z.string().optional(),
});

export type ClientInput = z.infer<typeof clientInputSchema>;
