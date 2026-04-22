import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardRootPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("brb_profiles")
    .select("role, full_name")
    .eq("id", user?.id)
    .maybeSingle();

  const name = profile?.full_name || "Usuario";

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl min-h-full">
      <div className="mb-10 backdrop-blur-md bg-white/5 p-6 rounded-3xl border border-white/5 shadow-2xl">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-1">
          Hola, <span className="text-primary">{name}</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Resumen general de tu negocio hoy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">
        {/* B2B Bento: Atenciones de Hoy */}
        <Card className="md:col-span-2 bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-xl border-white/10 shadow-2xl rounded-3xl relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-700"></div>
          <CardHeader>
            <CardTitle className="text-xl font-normal text-muted-foreground">Citas para Hoy</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end gap-4">
            <span className="text-7xl font-black text-foreground">0</span>
            <span className="text-lg text-muted-foreground mb-2">reservas pendientes</span>
          </CardContent>
        </Card>

        {/* B2B Bento: Ingresos */}
        <Card className="bg-background/60 backdrop-blur-xl border-white/10 shadow-xl rounded-3xl">
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">Ingresos Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-4xl font-bold text-green-400">$0</span>
          </CardContent>
        </Card>

        {/* B2B Bento: Actividad IA */}
        <Card className="md:col-span-3 bg-black/40 backdrop-blur-2xl border-white/5 shadow-inner rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <CardTitle className="text-base font-medium">Asistente IA (WhatsApp)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              <div className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                <div className="p-2 rounded-xl bg-primary/20 text-primary">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">IA agendó a Juan Pérez a las 15:00</p>
                  <p className="text-xs text-muted-foreground">Hace 1 hora vía WhatsApp</p>
                </div>
              </div>
              <div className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                <div className="p-2 rounded-xl bg-white/5 text-muted-foreground">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">IA re-agendó a Carlos a las 17:00</p>
                  <p className="text-xs text-muted-foreground">Hace 3 horas vía WhatsApp</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}