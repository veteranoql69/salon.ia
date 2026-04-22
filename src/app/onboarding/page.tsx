import { ConciergeGreeting } from "./components/concierge-greeting";
import { ClientOnboardingLink } from "./components/client-onboarding-link";
import Link from "next/link";
import { Store, UserCircle } from "lucide-react";

export default function OnboardingSelection() {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <ConciergeGreeting />
      
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mb-8" />
        <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic italic">
          Salon<span className="text-primary">.IA</span>
        </h1>
        <p className="text-muted-foreground text-lg uppercase tracking-[0.2em] font-bold opacity-70">Seleccione su Perfil Premium</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Link href="/onboarding/owner" className="group">
          <div className="h-full border border-white/10 rounded-3xl p-8 hover:border-primary/50 transition-all duration-500 cursor-pointer bg-white/5 backdrop-blur-xl flex flex-col items-center text-center shadow-2xl hover:shadow-primary/5">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-primary/20">
              <Store className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-3">Gerente de Salón</h2>
            <p className="text-xs text-muted-foreground leading-relaxed uppercase tracking-wider opacity-60">
              Configuración de marca, gestión de sillones, control financiero y analítica IA de alto nivel.
            </p>
          </div>
        </Link>

        <Link href="/onboarding/professional" className="group">
          <div className="h-full border border-white/10 rounded-3xl p-8 hover:border-primary/50 transition-all duration-500 cursor-pointer bg-white/5 backdrop-blur-xl flex flex-col items-center text-center shadow-2xl hover:shadow-primary/5">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-primary/20">
              <UserCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-3">Especialista</h2>
            <p className="text-xs text-muted-foreground leading-relaxed uppercase tracking-wider opacity-60">
              Gestión de agenda personal, atención VIP y vinculación a salones mediante códigos exclusivos.
            </p>
          </div>
        </Link>
      </div>

      <div className="text-center mt-8">
        <ClientOnboardingLink />
      </div>
    </div>
  );
}
