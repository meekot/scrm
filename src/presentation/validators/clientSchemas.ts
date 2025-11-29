import { z } from 'zod'

const blankableString = z
  .string()
  .max(120)
  .optional()
  .or(z.literal(''))

export const clientFormSchema = z.object({
  name: z.string().min(2, 'Client name must be at least 2 characters').max(120),
  phone: blankableString,
  instagram: blankableString,
  leadSource: blankableString,
})

export type ClientFormValues = z.infer<typeof clientFormSchema>
