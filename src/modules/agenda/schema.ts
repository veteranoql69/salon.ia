import { z } from "zod";

export const AppointmentStatusSchema = z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'blocked']);

export const AppointmentSchema = z.object({
  id: z.string().uuid().optional(),
  customer_id: z.string().uuid().nullable().optional(),
  barber_id: z.string().uuid(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  status: AppointmentStatusSchema.default('pending'),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const CreateAppointmentSchema = AppointmentSchema.omit({ id: true, created_at: true, updated_at: true }).refine(
  (data) => new Date(data.end_time) > new Date(data.start_time),
  {
    message: "El horario de fin debe ser mayor al de inicio",
    path: ["end_time"],
  }
).refine(
  (data) => {
    if (data.status !== 'blocked' && !data.customer_id) {
      return false;
    }
    return true;
  },
  {
    message: "El cliente es obligatorio para una cita real",
    path: ["customer_id"],
  }
);

export type Appointment = z.infer<typeof AppointmentSchema>;
export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;
