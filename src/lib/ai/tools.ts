import { z } from "zod";
import { tool } from "ai";
import { createClient } from "@supabase/supabase-js";

export const getClientTransactionLogs = tool({
  description: "Obtiene el historial detallado de un cliente, incluyendo sus citas pasadas, su estado (completado, cancelado) y sus notas (CRM). Úsalo antes de agendar para conocer el contexto del cliente.",
  inputSchema: z.object({
    searchTerm: z.string().describe("El teléfono o email del cliente para buscar su historial."),
    limit: z.number().optional().default(5).describe("Cantidad de citas históricas a recuperar.")
  }),
  execute: async ({ searchTerm, limit }: { searchTerm: string, limit: number }) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    try {
      // 1. Buscar al cliente cruzando brb_customers y brb_profiles
      const { data: customers, error } = await supabase
        .from('brb_customers')
        .select(`
          id, 
          phone, 
          notes,
          brb_profiles!inner(email, full_name)
        `)
        .or(`phone.eq.${searchTerm},brb_profiles.email.eq.${searchTerm}`)
        .limit(1);

      if (error || !customers || customers.length === 0) {
        return { success: false, message: "No se encontró historial para este cliente." };
      }

      const customer = customers[0];

      // 2. Extraer las citas recientes
      const { data: appointments } = await supabase
        .from('brb_appointments')
        .select('start_time, status, barber_id')
        .eq('customer_id', customer.id)
        .order('start_time', { ascending: false })
        .limit(limit);

      return {
        success: true,
        customerContext: {
          fullName: (customer.brb_profiles as any).full_name || "Desconocido",
          phone: customer.phone,
          crmNotes: customer.notes
        },
        recentAppointments: appointments || []
      };
    } catch (e) {
      return { success: false, message: "Error interno al consultar la base de datos." };
    }
  }
});
