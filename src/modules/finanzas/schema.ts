import { z } from "zod";

export const LedgerTypeSchema = z.enum(['charge', 'payment']);

export const LedgerSchema = z.object({
  id: z.string().uuid().optional(),
  barber_id: z.string().uuid(),
  amount: z.number().positive("El monto debe ser positivo"),
  type: LedgerTypeSchema,
  description: z.string().min(3, "La descripción es muy corta").optional().nullable(),
  created_at: z.string().datetime().optional(),
});

export const CreateLedgerEntrySchema = LedgerSchema.omit({ id: true, created_at: true });

export type Ledger = z.infer<typeof LedgerSchema>;
export type CreateLedgerEntryInput = z.infer<typeof CreateLedgerEntrySchema>;

export const PaymentStatusSchema = z.enum(['pending', 'approved', 'rejected', 'refunded']);

export const PaymentSchema = z.object({
  id: z.string().uuid().optional(),
  appointment_id: z.string().uuid(),
  amount: z.number().positive("El monto debe ser positivo"),
  currency: z.string().default('CLP'),
  status: PaymentStatusSchema.default('pending'),
  mp_preference_id: z.string().optional().nullable(),
  mp_payment_id: z.string().optional().nullable(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const CreatePaymentInputSchema = PaymentSchema.omit({ id: true, created_at: true, updated_at: true });

export type Payment = z.infer<typeof PaymentSchema>;
export type CreatePaymentInput = z.infer<typeof CreatePaymentInputSchema>;
