import { z } from "zod";

export const CustomerSchema = z.object({
  id: z.string().uuid().optional(),
  profile_id: z.string().uuid().optional().nullable(),
  phone: z.string().min(8, "Teléfono inválido").optional().nullable(),
  notes: z.string().optional().nullable(),
  total_visits: z.number().int().min(0).default(0),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const CreateCustomerSchema = CustomerSchema.omit({ id: true, created_at: true, updated_at: true, total_visits: true });

export type Customer = z.infer<typeof CustomerSchema>;
export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;
