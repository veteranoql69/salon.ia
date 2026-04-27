"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { joinProfessionalAction, getInviteInfoAction } from "@/modules/onboarding/actions";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronRight, CheckCircle } from "lucide-react";

const SPECIALTIES = [
  { value: "barbero", label: "Barbero", emoji: "✂️" },
  { value: "estilista", label: "Estilista / Colorista", emoji: "💇" },
  { value: "manicurista", label: "Manicurista", emoji: "💅" },
  { value: "esteticista", label: "Esteticista", emoji: "✨" },
];

type OrgInfo = { name: string; slug: string | null };

export default function InvitedOnboarding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "";

  const [step, setStep] = useState<"welcome" | "specialty" | "joining">("welcome");
  const [specialty, setSpecialty] = useState("");
  const [orgInfo, setOrgInfo] = useState<OrgInfo | null>(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    if (!code) { setInvalid(true); return; }

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function loadInvite() {
      const [inviteResult, { data: { user } }] = await Promise.all([
        getInviteInfoAction(code),
        supabase.auth.getUser(),
      ]);

      if ("error" in inviteResult) { setInvalid(true); return; }
      setOrgInfo({ name: inviteResult.name, slug: inviteResult.slug });

      const name =
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        user?.email?.split("@")[0] ||
        "";
      setUserName(name.split(" ")[0]);
    }

    loadInvite();
  }, [code]);

  async function handleJoin() {
    setLoading(true);
    setStep("joining");
    const data = new FormData();
    data.append("code", code);
    data.append("specialty", specialty);

    try {
      const res = await joinProfessionalAction(data);
      if (res?.error) throw new Error(res.error);
      toast.success(`¡Bienvenido/a a ${orgInfo?.name}!`);
      const slug = (res as any).slug;
      router.push(slug ? `/${slug}/dashboard` : "/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Error al unirte al salón");
      setStep("specialty");
    } finally {
      setLoading(false);
    }
  }

  if (invalid) {
    return (
      <div className="text-center space-y-4 py-12">
        <p className="text-3xl">⚠️</p>
        <h1 className="text-xl font-bold text-white">Código inválido o ya utilizado</h1>
        <p className="text-muted-foreground text-sm">
          El enlace de invitación expiró o ya fue usado.
          Pídele a tu encargado que te envíe uno nuevo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Progress */}
      <div className="flex gap-2">
        {["welcome", "specialty", "joining"].map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              ["welcome", "specialty", "joining"].indexOf(step) >= i
                ? "bg-primary"
                : "bg-white/10"
            }`}
          />
        ))}
      </div>

      {/* STEP: Welcome */}
      {step === "welcome" && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold opacity-60">
                Invitación aceptada
              </p>
              <h1 className="text-2xl font-black text-white">
                {userName ? `¡Hola, ${userName}! 👋` : "¡Hola! 👋"}
              </h1>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold opacity-60">
              Fuiste invitado/a a
            </p>
            <p className="text-2xl font-black text-white">
              {orgInfo?.name ?? "cargando..."}
            </p>
            {orgInfo?.slug && (
              <p className="text-xs font-mono text-primary/60">
                salon.ia/{orgInfo.slug}
              </p>
            )}
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed">
            El equipo de <strong className="text-white">{orgInfo?.name}</strong> te
            está esperando. En Salon.IA vas a gestionar tu agenda, tus citas y tus
            clientes — todo desde un solo lugar.
          </p>

          <Button
            onClick={() => setStep("specialty")}
            disabled={!orgInfo}
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_20px_rgba(245,158,11,0.3)] font-bold uppercase tracking-[0.2em] text-xs"
          >
            Unirme al equipo <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      )}

      {/* STEP: Specialty */}
      {step === "specialty" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">
              ¿Cuál es tu especialidad?
            </h1>
            <p className="text-muted-foreground text-sm">
              Esto personaliza tu panel en {orgInfo?.name}.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {SPECIALTIES.map((s) => (
              <button
                key={s.value}
                onClick={() => setSpecialty(s.value)}
                className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 flex flex-col gap-3 ${
                  specialty === s.value
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                    : "border-white/5 bg-white/[0.03] hover:border-white/10 hover:bg-white/5"
                }`}
              >
                <span className="text-2xl">{s.emoji}</span>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-white text-sm">{s.label}</p>
                  {specialty === s.value && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <Button
            onClick={handleJoin}
            disabled={!specialty || loading}
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_25px_rgba(245,158,11,0.4)] font-bold uppercase tracking-[0.2em] text-xs"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Activando acceso...
              </span>
            ) : (
              <>Activar mi acceso <ChevronRight className="ml-2 w-4 h-4" /></>
            )}
          </Button>
        </div>
      )}

      {/* STEP: Joining (loading state) */}
      {step === "joining" && (
        <div className="flex flex-col items-center justify-center py-16 gap-6 animate-in fade-in duration-500">
          <div className="w-16 h-16 border-2 border-white/10 border-t-primary rounded-full animate-spin" />
          <div className="text-center space-y-2">
            <p className="text-white font-bold">Configurando tu espacio...</p>
            <p className="text-muted-foreground text-sm">
              Preparando tu acceso a {orgInfo?.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
