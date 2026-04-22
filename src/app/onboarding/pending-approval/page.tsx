import { Clock, MessageSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
          <div className="relative bg-black border border-white/10 w-24 h-24 rounded-full flex items-center justify-center shadow-2xl">
            <Clock className="w-10 h-10 text-primary animate-pulse" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Solicitud <span className="text-primary">Enviada</span></h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold leading-relaxed">
            Hemos notificado al Gerente del Salón sobre su interés en unirse al equipo.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
          <p className="text-xs text-muted-foreground leading-relaxed italic">
            "Su perfil será activado tan pronto como el Gerente apruebe su solicitud desde su panel de control. Recibirá una notificación una vez que el proceso se haya completado."
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Button asChild variant="outline" className="h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 font-bold uppercase tracking-widest text-xs">
            <Link href="/onboarding">
              <ArrowLeft className="mr-2 w-4 h-4" /> Volver al Inicio
            </Link>
          </Button>
          
          <Button asChild className="h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-xs">
            <Link href="https://wa.me/56912345678" target="_blank">
              <MessageSquare className="mr-2 w-4 h-4" /> Contactar Soporte
            </Link>
          </Button>
        </div>

        <p className="text-[10px] text-muted-foreground/40 uppercase tracking-[0.3em] font-bold">
          Salon.IA &copy; 2026 — Protocolo de Espera Activa
        </p>
      </div>
    </div>
  );
}
