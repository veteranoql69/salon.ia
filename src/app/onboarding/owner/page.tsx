"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createOrganizationAction } from "@/modules/onboarding/actions";
import { generateSlug } from "@/lib/utils/slug";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBrowserClient } from "@supabase/ssr";
import { Scissors, Sparkles, ChevronRight, ChevronLeft, Mail, Plus, X, Zap } from "lucide-react";

const SPECIALTIES: { value: string; label: string; emoji: string; desc: string }[] = [
  { value: "barberia", label: "Barbería", emoji: "✂️", desc: "Cortes y arreglos masculinos" },
  { value: "peluqueria", label: "Peluquería", emoji: "💇", desc: "Cortes, coloración y tratamientos" },
  { value: "centro_estetica", label: "Salón de Belleza", emoji: "✨", desc: "Belleza integral y cuidado personal" },
  { value: "spa", label: "Spa & Estética", emoji: "🌿", desc: "Relajación, masajes y faciales" },
  { value: "manicura", label: "Nail Studio", emoji: "💅", desc: "Manicura, pedicura y nail art" },
  { value: "independiente", label: "Independiente", emoji: "🎨", desc: "Trabajo en solitario, mi propio espacio" },
];

export default function OwnerOnboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [inviteEmails, setInviteEmails] = useState<string[]>([""]);
  const router = useRouter();

  const slug = generateSlug(workspaceName);
  const isIndependent = specialty === "independiente";
  const showInviteStep = !isIndependent && specialty !== "";

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.getUser().then(({ data: { user } }) => {
      const name =
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        user?.email?.split("@")[0] ||
        "tú";
      setUserName(name.split(" ")[0]);
    });
  }, []);

  function addEmail() {
    setInviteEmails((prev) => [...prev, ""]);
  }

  function removeEmail(i: number) {
    setInviteEmails((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateEmail(i: number, val: string) {
    setInviteEmails((prev) => prev.map((e, idx) => (idx === i ? val : e)));
  }

  const validEmails = inviteEmails.filter((e) => e.trim().length > 0);

  async function handleActivate() {
    setLoading(true);
    const data = new FormData();
    data.append("name", workspaceName);
    data.append("businessType", specialty);
    data.append("chairs", "1");
    validEmails.forEach((email) => data.append("inviteEmails", email.trim()));

    try {
      const res = await createOrganizationAction(data);
      if (res?.error) throw new Error(res.error);
      toast.success("¡Tu espacio está listo!");
      router.push(`/${res.slug}/dashboard`);
    } catch (err: any) {
      toast.error(err.message || "Error al activar tu espacio");
    } finally {
      setLoading(false);
    }
  }

  const canAdvanceStep1 = workspaceName.trim().length >= 3 && slug.length >= 3;
  const canAdvanceStep2 = specialty !== "";
  const effectiveSteps = showInviteStep ? 4 : 3;

  function nextStep() {
    setStep((s) => Math.min(s + 1, effectiveSteps));
  }
  function prevStep() {
    setStep((s) => Math.max(s - 1, 1));
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Progress bar */}
      <div className="flex gap-2">
        {Array.from({ length: effectiveSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              i < step ? "bg-primary" : i === step - 1 ? "bg-primary/60" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      {/* STEP 1: Workspace name */}
      {step === 1 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold opacity-60">
                  Primera vez
                </p>
                <h1 className="text-2xl font-black text-white">
                  {userName ? `¡Hola, ${userName}! 👋` : "¡Hola! 👋"}
                </h1>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              Vamos a configurar tu espacio en{" "}
              <span className="text-primary font-bold">Salon.IA</span>. Aquí
              gestionarás tu agenda, equipo y finanzas — todo en un solo lugar.
            </p>
            <p className="text-muted-foreground/70 text-sm">
              Empieza por darle un nombre a tu espacio de trabajo.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest font-bold opacity-70">
                Nombre de tu espacio
              </Label>
              <Input
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Ej: Barbería Vintage, Studio Élite..."
                className="h-14 rounded-2xl bg-white/5 border-white/10 text-lg font-medium px-6 focus:ring-primary/50"
                autoFocus
              />
            </div>

            {/* Slug preview */}
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                slug
                  ? "bg-primary/5 border border-primary/20"
                  : "bg-white/[0.03] border border-white/5"
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground opacity-60 mb-0.5">
                  Tu URL privada
                </p>
                <p className="text-sm font-mono text-foreground/80 truncate">
                  salon.ia/
                  <span className={slug ? "text-primary font-bold" : "text-muted-foreground"}>
                    {slug || "tu-espacio"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Specialty */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">¿En qué te especializas?</h1>
            <p className="text-muted-foreground text-sm">
              Personalizamos tu experiencia según tu tipo de negocio.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {SPECIALTIES.map((s) => (
              <button
                key={s.value}
                onClick={() => setSpecialty(s.value)}
                className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 flex flex-col gap-2 ${
                  specialty === s.value
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                    : "border-white/5 bg-white/[0.03] hover:border-white/10 hover:bg-white/5"
                }`}
              >
                <span className="text-2xl">{s.emoji}</span>
                <div>
                  <p className="font-bold text-white text-sm">{s.label}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight opacity-70">
                    {s.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: Invite team (only for non-independent) */}
      {step === 3 && showInviteStep && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">Invita a tu equipo</h1>
            <p className="text-muted-foreground text-sm">
              Añade los correos de tu staff. Te generamos un código de acceso
              para cada uno — puedes saltarte esto si prefieres hacerlo después.
            </p>
          </div>

          <div className="space-y-3">
            {inviteEmails.map((email, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => updateEmail(i, e.target.value)}
                    placeholder={`correo${i + 1}@ejemplo.com`}
                    className="h-12 rounded-2xl bg-white/5 border-white/10 pl-11 pr-4"
                  />
                </div>
                {inviteEmails.length > 1 && (
                  <button
                    onClick={() => removeEmail(i)}
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={addEmail}
              className="flex items-center gap-2 text-sm text-primary/80 hover:text-primary transition-colors px-2 py-1"
            >
              <Plus className="w-4 h-4" />
              Agregar otro correo
            </button>
          </div>

          {validEmails.length > 0 && (
            <p className="text-xs text-muted-foreground opacity-60">
              Se crearán {validEmails.length} código
              {validEmails.length > 1 ? "s" : ""} de acceso al activar tu espacio.
            </p>
          )}
        </div>
      )}

      {/* STEP final: Activation summary */}
      {step === effectiveSteps && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">¡Todo listo!</h1>
            <p className="text-muted-foreground text-sm">
              Revisá los detalles antes de activar tu espacio.
            </p>
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Scissors className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-widest opacity-60 mb-0.5">
                  Tu espacio
                </p>
                <p className="font-bold text-white truncate">{workspaceName}</p>
                <p className="text-xs font-mono text-primary/70 mt-0.5">
                  salon.ia/{slug}
                </p>
              </div>
            </div>

            <div className="h-px bg-white/5" />

            <div className="flex items-center gap-4">
              <span className="text-2xl">
                {SPECIALTIES.find((s) => s.value === specialty)?.emoji}
              </span>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest opacity-60 mb-0.5">
                  Especialidad
                </p>
                <p className="font-bold text-white">
                  {SPECIALTIES.find((s) => s.value === specialty)?.label}
                </p>
              </div>
            </div>

            {validEmails.length > 0 && (
              <>
                <div className="h-px bg-white/5" />
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest opacity-60 mb-1">
                      Invitaciones
                    </p>
                    {validEmails.map((e) => (
                      <p key={e} className="text-sm text-foreground/80">
                        {e}
                      </p>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
            <Zap className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tu IA Concierge estará lista para recibir reservas por WhatsApp
              desde el primer día.
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        {step > 1 && (
          <Button
            variant="outline"
            onClick={prevStep}
            className="h-14 flex-1 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 font-bold uppercase tracking-widest text-xs"
          >
            <ChevronLeft className="mr-2 w-4 h-4" />
            Atrás
          </Button>
        )}

        {step < effectiveSteps ? (
          <Button
            onClick={() => {
              if (step === 3 && showInviteStep) nextStep();
              else nextStep();
            }}
            disabled={
              (step === 1 && !canAdvanceStep1) ||
              (step === 2 && !canAdvanceStep2)
            }
            className="h-14 flex-[2] rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_20px_rgba(245,158,11,0.3)] font-bold uppercase tracking-[0.2em] text-xs"
          >
            {step === 3 && showInviteStep && validEmails.length === 0
              ? "Saltar"
              : "Continuar"}
            <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleActivate}
            disabled={loading}
            className="h-14 flex-[2] rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_25px_rgba(245,158,11,0.4)] font-bold uppercase tracking-[0.2em] text-xs"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Activando...
              </span>
            ) : (
              <>
                <Zap className="mr-2 w-4 h-4" />
                Activar mi Espacio
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
