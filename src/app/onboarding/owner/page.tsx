"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrganizationAction } from "@/modules/onboarding/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, ChevronRight, ChevronLeft, Store, Phone, Users, CheckCircle } from "lucide-react";

export default function OwnerOnboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    rut: "",
    phone: "",
    businessType: "peluqueria",
    chairs: "1",
    teamSize: "1",
    location: ""
  });
  
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  async function handleFinalSubmit() {
    setLoading(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    
    try {
      const res = await createOrganizationAction(data);
      if (res?.error) throw new Error(res.error);
      
      toast.success("¡Experiencia Salon.IA activada con éxito!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Error al configurar su espacio");
    } finally {
      setLoading(false);
    }
  }

  const stepsMetadata = [
    { title: "Identidad", subtitle: "Defina el nombre de su marca", icon: Store },
    { title: "Contacto", subtitle: "Canales de comunicación", icon: Phone },
    { title: "Capacidad", subtitle: "Infraestructura y equipo", icon: Users },
    { title: "IA Concierge", subtitle: "Activación de servicios inteligentes", icon: Sparkles }
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Step Indicator */}
      <div className="flex justify-between items-center relative mb-12">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -z-10" />
        {stepsMetadata.map((s, i) => {
          const isCurrent = step === i + 1;
          const isPast = step > i + 1;
          const StepIcon = s.icon;
          return (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border shadow-lg ${isCurrent ? 'bg-primary text-primary-foreground border-primary scale-110' : isPast ? 'bg-primary/20 text-primary border-primary/30' : 'bg-black/60 text-muted-foreground border-white/10'}`}>
                {isPast ? <CheckCircle className="w-6 h-6" /> : <StepIcon className="w-6 h-6" />}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isCurrent ? 'text-primary' : 'text-muted-foreground/50'}`}>
                {s.title}
              </span>
            </div>
          );
        })}
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-white italic uppercase tracking-tight">
          {stepsMetadata[step - 1].title}
        </h1>
        <p className="text-muted-foreground/80 font-medium tracking-wide">
          {stepsMetadata[step - 1].subtitle}
        </p>
      </div>

      <div className="min-h-[300px] py-6">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-xs uppercase tracking-widest font-bold opacity-70">Nombre del Salón / Marca</Label>
              <Input 
                id="name" name="name" 
                value={formData.name} onChange={handleInputChange}
                placeholder="Ej: Elegance Studio" 
                required 
                className="h-14 rounded-2xl bg-white/5 border-white/10 text-lg font-medium px-6 focus:ring-primary/50 transition-all"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="rut" className="text-xs uppercase tracking-widest font-bold opacity-70">RUT Empresa (Opcional)</Label>
                <Input 
                  id="rut" name="rut" placeholder="76.000.000-K" 
                  value={formData.rut} onChange={handleInputChange}
                  className="h-14 rounded-2xl bg-white/5 border-white/10 px-6"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="businessType" className="text-xs uppercase tracking-widest font-bold opacity-70">Tipo de Experiencia</Label>
                <select 
                  id="businessType" name="businessType"
                  value={formData.businessType} onChange={handleInputChange}
                  className="h-14 w-full rounded-2xl bg-white/5 border-white/10 px-6 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                >
                  <option value="barberia" className="bg-zinc-900">Barbería de Lujo</option>
                  <option value="peluqueria" className="bg-zinc-900">Peluquería Integral</option>
                  <option value="centro_estetica" className="bg-zinc-900">Spa & Estética</option>
                  <option value="manicura" className="bg-zinc-900">Nail Studio</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-3">
              <Label htmlFor="phone" className="text-xs uppercase tracking-widest font-bold opacity-70">WhatsApp de Atención</Label>
              <Input 
                id="phone" name="phone" placeholder="+56 9 XXXX XXXX" 
                value={formData.phone} onChange={handleInputChange}
                className="h-14 rounded-2xl bg-white/5 border-white/10 text-lg px-6"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="location" className="text-xs uppercase tracking-widest font-bold opacity-70">Ubicación / Dirección</Label>
              <Input 
                id="location" name="location" placeholder="Calle, Número, Ciudad" 
                value={formData.location} onChange={handleInputChange}
                className="h-14 rounded-2xl bg-white/5 border-white/10 px-6"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="chairs" className="text-xs uppercase tracking-widest font-bold opacity-70">Cantidad de Sillones / Puestos</Label>
                <Input 
                  id="chairs" name="chairs" type="number" min="1"
                  value={formData.chairs} onChange={handleInputChange}
                  className="h-14 rounded-2xl bg-white/5 border-white/10 px-6 text-xl text-center font-bold"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="teamSize" className="text-xs uppercase tracking-widest font-bold opacity-70">Nº de Especialistas (Plan)</Label>
                <Input 
                  id="teamSize" name="teamSize" type="number" min="1"
                  value={formData.teamSize} onChange={handleInputChange}
                  className="h-14 rounded-2xl bg-white/5 border-white/10 px-6 text-xl text-center font-bold"
                />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest text-center opacity-60">
              Podrá reubicar y configurar sus estaciones visualmente en el panel de sillones.
            </p>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 text-center">
            <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-8 relative overflow-hidden">
              <Sparkles className="mx-auto w-12 h-12 text-primary animate-pulse-gold mb-6" />
              <h3 className="text-xl font-bold text-white mb-2">Activando IA Concierge</h3>
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                "Estamos preparando su panel inteligente. Al finalizar, Salon.IA comenzará a monitorear su ocupación y detectar oportunidades VIP de forma proactiva."
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-primary/70">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
              Algoritmos de Optimización Listos
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 pt-10 border-t border-white/5">
        {step > 1 && (
          <Button 
            variant="outline" 
            onClick={prevStep}
            className="h-14 flex-1 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 transition-all font-bold uppercase tracking-widest text-xs"
          >
            <ChevronLeft className="mr-2 w-4 h-4" /> Anterior
          </Button>
        )}
        {step < 4 ? (
          <Button 
            onClick={nextStep}
            disabled={step === 1 && !formData.name}
            className="h-14 flex-[2] rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_20px_rgba(245,158,11,0.3)] font-bold uppercase tracking-[0.2em] text-xs transition-all"
          >
            Continuar <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        ) : (
          <Button 
            onClick={handleFinalSubmit}
            disabled={loading}
            className="h-14 flex-[2] rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_25px_rgba(245,158,11,0.4)] font-bold uppercase tracking-[0.2em] text-xs transition-all"
          >
            {loading ? "Iniciando Sistemas..." : "Finalizar Configuración Premium"}
          </Button>
        )}
      </div>
    </div>
  );
}
