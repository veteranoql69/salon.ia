import { ReactNode } from "react";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Cinematic Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ 
          backgroundImage: 'url("/salonia_hero_hair_1776524970357.png")',
          filter: 'brightness(0.3) saturate(1.1)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />
      
      <div className="relative z-10 w-full max-w-2xl bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl p-8 md:p-12 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        {children}
      </div>
    </div>
  );
}
