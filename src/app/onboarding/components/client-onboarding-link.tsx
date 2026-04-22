"use client";

import { completeClientOnboardingAction } from "@/modules/onboarding/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function ClientOnboardingLink() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClientOnboarding() {
    setLoading(true);
    try {
      const res = await completeClientOnboardingAction();
      if (res?.error) throw new Error(res.error);
      
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Error al activar perfil de cliente");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button 
      onClick={handleClientOnboarding}
      disabled={loading}
      className="text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground hover:text-primary transition-all disabled:opacity-50"
    >
      {loading ? "CONFIGURANDO..." : "Acceso como Cliente Externo"}
    </button>
  );
}
