import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import LandingPage from "./landing/page";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Sin sesión → mostrar landing directamente en "/"
  if (!user) {
    return <LandingPage />;
  }

  // Get user profile to determine role
  const { data: profile, error: profileError } = await supabase
    .from("brb_profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Critical RLS or Database error fetching profile:", profileError);
    // If it's the recursion error (code 42P17), we might still want to try 
    // to determine if they are an owner by some other means or just fail gracefully.
    // For now, if there is a profile error, we consider the person a client by default 
    // to avoid a full crash, but we log it clearly.
  }

  const role = profile?.role;
  const name = profile?.full_name || "Usuario";
  
  if (user) {
    console.log(`[Home Route] User ${user.email} accessed. Determined role from DB: ${role || 'MISSING'}`);
  }

  // Si no tiene rol asignado o es PENDING, forzamos Onboarding
  if (!role || role === "PENDING") {
    console.log(`[Home Route] Redirecting to /onboarding (Role: ${role || 'MISSING'})`);
    redirect("/onboarding");
  }

  // Redirigir a los especialistas/gerentes a su Dashboard Premium
  if (role === "OWNER" || role === "BARBER") {
    console.log(`[Home Route] Redirecting ${role} to /dashboard`);
    redirect("/dashboard");
  }

  // Vista para CLIENT
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl min-h-screen">
      <div className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4 backdrop-blur-md bg-background/50 p-6 rounded-3xl border border-white/5 shadow-2xl">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-2">
            Hola, <span className="text-primary">{name}</span>
          </h1>
          <p className="text-muted-foreground text-lg italic">
            Bienvenido a su experiencia exclusiva en Salon.IA
          </p>
        </div>
        <form action="/auth/signout" method="post">
          <Button type="submit" variant="outline" className="rounded-full px-6 bg-transparent border-white/10 hover:bg-white/5 backdrop-blur-sm transition-all duration-300">
            Cerrar Sesión
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">
        {/* Bento Box 1: Próxima Cita (Grande) */}
        <Card className="md:col-span-2 md:row-span-2 bg-background/60 backdrop-blur-xl border-white/10 shadow-2xl rounded-3xl overflow-hidden group hover:border-primary/50 transition-all duration-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">Mi Próxima Cita</CardTitle>
            <CardDescription className="text-base">Detalles de tu turno agendado</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] gap-6">
            <div className="h-24 w-24 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-10 h-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-muted-foreground">No tienes citas próximas agendadas.</p>
            <Link href="/reservar">
              <Button className="rounded-full px-8 h-12 text-md shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all duration-300">
                Agendar una nueva cita
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Bento Box 2: Actividad */}
        <Card className="bg-background/60 backdrop-blur-xl border-white/10 shadow-xl rounded-3xl overflow-hidden hover:bg-white/5 transition-colors duration-300">
          <CardHeader>
            <CardTitle>Actividad</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-center items-center h-[calc(100%-4rem)]">
            <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-amber-200">0</span>
            <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-[0.3em] font-black opacity-60">Visitas Realizadas</p>
          </CardContent>
        </Card>
        
        {/* Bento Box 3: Beneficios o Promociones */}
        <Card className="bg-gradient-to-br from-primary/20 to-background backdrop-blur-xl border-primary/20 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-primary">Membresía</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Acumula 5 visitas y obtenga un tratamiento de cortesía.</p>
            <div className="mt-4 h-2 w-full bg-black/40 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[0%] rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
