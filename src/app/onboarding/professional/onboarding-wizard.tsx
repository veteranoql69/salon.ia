"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  joinProfessionalAction, 
  joinOrganizationByRutAction, 
  createIndependentProfessionalAction 
} from "@/modules/onboarding/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  UserCircle, 
  Store, 
  QrCode, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle,
  Briefcase
} from "lucide-react";

export function ProfessionalOnboardingWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    specialty: "",
    workMode: "", // 'independent', 'join_rut', 'join_code'
    rut: "",
    inviteCode: ""
  });
  
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  async function handleFinalSubmit() {
    setLoading(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    
    try {
      let res;
      if (formData.workMode === 'independent') {
        res = await createIndependentProfessionalAction(data);
      } else if (formData.workMode === 'join_rut') {
        res = await joinOrganizationByRutAction(data);
      } else {
        // join_code
        data.append('code', formData.inviteCode);
        res = await joinProfessionalAction(data);
      }

      if (res?.error) throw new Error(res.error);
      
      if (formData.workMode === 'join_rut') {
        toast.success(`Solicitud enviada a ${(res as any).salonName}. Espere aprobación.`);
        router.push("/onboarding/pending-approval");
      } else {
        toast.success("¡Bienvenido al ecosistema Salon.IA!");
        router.push(`/${(res as any).slug}/dashboard`);
      }
    } catch (error: any) {
      toast.error(error.message || "Error al procesar su perfil");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Progress Indicator */}
      <div className="flex justify-center gap-4 mb-8">
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={`h-1.5 rounded-full transition-all duration-500 ${step === s ? 'w-12 bg-primary' : s < step ? 'w-6 bg-primary/40' : 'w-6 bg-white/10'}`} 
          />
        ))}
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-white italic uppercase tracking-tight">
          {step === 1 && "Identidad"}
          {step === 2 && "¿Dónde Trabajas?"}
          {step === 3 && "Confirmación"}
        </h1>
        <p className="text-muted-foreground/80 font-medium tracking-wide">
          {step === 1 && "Configure su perfil profesional"}
          {step === 2 && "Vincúlese a un salón o trabaje libre"}
          {step === 3 && "Active su experiencia VIP"}
        </p>
      </div>

      <div className="min-h-[300px] py-6">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-widest font-bold opacity-70">Nombre Completo</Label>
              <Input 
                name="name" value={formData.name} onChange={handleInputChange}
                placeholder="Su nombre artístico o profesional" 
                className="h-14 rounded-2xl bg-white/5 border-white/10 text-lg px-6"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-widest font-bold opacity-70">WhatsApp Personal</Label>
                <Input 
                  name="phone" value={formData.phone} onChange={handleInputChange}
                  placeholder="+56 9 XXXX XXXX" 
                  className="h-14 rounded-2xl bg-white/5 border-white/10 px-6"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-widest font-bold opacity-70">Especialidad</Label>
                <select 
                  name="specialty" value={formData.specialty} onChange={handleInputChange}
                  className="h-14 w-full rounded-2xl bg-white/5 border-white/10 px-6 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                >
                  <option value="" className="bg-zinc-900">Seleccione...</option>
                  <option value="barbero" className="bg-zinc-900">Barbero</option>
                  <option value="estilista" className="bg-zinc-900">Estilista / Colorista</option>
                  <option value="manicurista" className="bg-zinc-900">Manicurista</option>
                  <option value="esteticista" className="bg-zinc-900">Esteticista</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <button 
              onClick={() => setFormData(prev => ({ ...prev, workMode: 'independent' }))}
              className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 flex items-center gap-6 ${formData.workMode === 'independent' ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${formData.workMode === 'independent' ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-white'}`}>
                <UserCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white">Trabajo Independiente</h3>
                <p className="text-xs text-muted-foreground">Gestiono mi propia agenda y clientes.</p>
              </div>
              {formData.workMode === 'independent' && <CheckCircle className="ml-auto text-primary" />}
            </button>

            <button 
              onClick={() => setFormData(prev => ({ ...prev, workMode: 'join_rut' }))}
              className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 flex items-center gap-6 ${formData.workMode === 'join_rut' ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${formData.workMode === 'join_rut' ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-white'}`}>
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white">Me uno a un Salón</h3>
                <p className="text-xs text-muted-foreground">Vincularme usando el RUT del negocio.</p>
              </div>
              {formData.workMode === 'join_rut' && <CheckCircle className="ml-auto text-primary" />}
            </button>

            <button 
              onClick={() => setFormData(prev => ({ ...prev, workMode: 'join_code' }))}
              className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 flex items-center gap-6 ${formData.workMode === 'join_code' ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${formData.workMode === 'join_code' ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-white'}`}>
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white">Mi dueño/a me invitó</h3>
                <p className="text-xs text-muted-foreground">Tengo un código de acceso exclusivo.</p>
              </div>
              {formData.workMode === 'join_code' && <CheckCircle className="ml-auto text-primary" />}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {formData.workMode === 'join_rut' && (
              <div className="space-y-4">
                <Label className="text-xs uppercase tracking-widest font-bold opacity-70">RUT del Salón</Label>
                <Input 
                  name="rut" value={formData.rut} onChange={handleInputChange}
                  placeholder="76.000.000-K" 
                  className="h-16 rounded-2xl bg-white/5 border-white/10 text-2xl text-center font-black tracking-widest"
                />
                <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest">
                  Se enviará una solicitud de vinculación al Gerente.
                </p>
              </div>
            )}

            {formData.workMode === 'join_code' && (
              <div className="space-y-4">
                <Label className="text-xs uppercase tracking-widest font-bold opacity-70 text-center block">Código de Invitación</Label>
                <Input 
                  name="inviteCode" value={formData.inviteCode} onChange={handleInputChange}
                  placeholder="BRB-XXXX" 
                  maxLength={8}
                  className="h-20 rounded-2xl bg-white/5 border-white/10 text-4xl text-center font-black tracking-[0.2em] text-primary"
                />
                <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest">
                  Acceso instantáneo al sillón asignado.
                </p>
              </div>
            )}

            {formData.workMode === 'independent' && (
              <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-10 text-center space-y-6">
                <Briefcase className="w-16 h-16 text-primary mx-auto animate-bounce" />
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Listo para su Independencia</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Crearemos un espacio exclusivo para su marca profesional. Podrá gestionar su agenda y clientes sin depender de un salón externo.
                  </p>
                </div>
              </div>
            )}
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
        {step < 3 ? (
          <Button 
            onClick={nextStep}
            disabled={(step === 1 && (!formData.name || !formData.phone || !formData.specialty)) || (step === 2 && !formData.workMode)}
            className="h-14 flex-[2] rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_20px_rgba(245,158,11,0.3)] font-bold uppercase tracking-[0.2em] text-xs transition-all"
          >
            Continuar <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        ) : (
          <Button 
            onClick={handleFinalSubmit}
            disabled={loading || (formData.workMode === 'join_rut' && !formData.rut) || (formData.workMode === 'join_code' && !formData.inviteCode)}
            className="h-14 flex-[2] rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_25px_rgba(245,158,11,0.4)] font-bold uppercase tracking-[0.2em] text-xs transition-all"
          >
            {loading ? "PROCESANDO..." : "ACTIVAR ACCESO PREMIUM"}
          </Button>
        )}
      </div>
    </div>
  );
}
