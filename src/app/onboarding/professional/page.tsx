"use client";

import { ProfessionalOnboardingWizard } from "./onboarding-wizard";

export default function ProfessionalOnboarding() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-black/40 border border-white/10 rounded-[3rem] p-8 md:p-12 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        <ProfessionalOnboardingWizard />
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold opacity-40">
          Salon.IA &copy; 2026 — Protocolo de Vinculación Profesional
        </p>
      </div>
    </div>
  );
}
