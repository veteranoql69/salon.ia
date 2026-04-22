'use client'

import { useActionState, useState } from "react"
import { login, signup } from "./actions"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronRight, Scissors, Zap, Brain, Calendar } from "lucide-react"
import Link from "next/link"

// ─── Cinematic Backdrop (blurred photo bg) ─────────────────────────────────
function AuthBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Full-bleed background photo */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/pilar_barberia.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(40px) brightness(0.25) saturate(0.6)",
          transform: "scale(1.1)",
        }}
      />
      {/* Gold ambient blobs on top of photo */}
      <div
        className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full opacity-20"
        style={{ background: "#F59E0B", filter: "blur(120px)", animation: "blob 12s ease-in-out infinite" }}
      />
      <div
        className="absolute -bottom-48 -left-48 h-[600px] w-[600px] rounded-full opacity-15"
        style={{ background: "#F59E0B", filter: "blur(100px)", animation: "blob 16s ease-in-out infinite 5s" }}
      />
      {/* Blue tech glow */}
      <div
        className="absolute top-1/3 left-1/4 h-[300px] w-[300px] rounded-full opacity-10"
        style={{ background: "#8fd5ff", filter: "blur(100px)", animation: "blob 20s ease-in-out infinite 10s" }}
      />
    </div>
  )
}

// ─── Left Brand Panel ───────────────────────────────────────────────────────
function BrandPanel() {
  const highlights = [
    { icon: Brain, text: "IA que agenda mientras duermes" },
    { icon: Calendar, text: "Agenda multi-sillón en tiempo real" },
    { icon: Zap, text: "Respuesta WhatsApp en menos de 3s" },
  ]

  return (
    <div className="hidden lg:flex flex-col justify-between p-14 relative overflow-hidden" style={{ minHeight: "520px" }}>
      {/* Background photo blurred */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/pilar_spa.png')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          filter: "blur(2px) brightness(0.3) saturate(0.7)",
          transform: "scale(1.05)",
        }}
      />
      {/* Gradient overlay for text legibility */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(160deg, rgba(19,19,19,0.45) 0%, rgba(19,19,19,0.7) 50%, rgba(19,19,19,0.96) 100%)" }}
      />
      {/* Gold shimmer right border */}
      <div
        className="absolute top-0 right-0 w-px h-full"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(245,158,11,0.3), transparent)" }}
      />

      {/* Logo */}
      <Link href="/" className="relative flex items-center gap-2 group self-start">
        <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20">
          <Scissors className="h-4.5 w-4.5 text-[#F59E0B]" />
        </div>
        <span
          className="text-2xl font-black tracking-tight text-white uppercase"
          style={{ fontFamily: "var(--font-manrope)" }}
        >
          Salon<span className="text-[#F59E0B]">.IA</span>
        </span>
      </Link>

      {/* Center copy */}
      <div className="relative flex flex-col gap-8">
        <div>
          <p
            className="text-xs font-bold uppercase tracking-[0.2em] text-[#F59E0B] mb-4"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Luxury Concierge · 2026
          </p>
          <h2
            className="text-5xl font-black text-white tracking-tight leading-[0.95]"
            style={{ fontFamily: "var(--font-manrope)", letterSpacing: "-0.02em" }}
          >
            Bienvenido
            <br />
            al{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #ffc174 0%, #F59E0B 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Futuro
            </span>
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {highlights.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div
                className="h-8 w-8 flex items-center justify-center rounded-xl bg-[#F59E0B]/10 flex-shrink-0"
                style={{ backdropFilter: "blur(8px)", border: "1px solid rgba(245,158,11,0.2)" }}
              >
                <Icon className="h-4 w-4 text-[#F59E0B]" />
              </div>
              <p
                className="text-sm text-white/80"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom quote */}
      <p
        className="relative text-xs text-white/30 leading-relaxed"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        © 2026 Salon.IA · Tu IA vigilante nunca duerme
      </p>
    </div>
  )
}

// ─── Main Login Page ─────────────────────────────────────────────────────────
export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [state, formAction, isPending] = useActionState(isLogin ? login : signup, null)
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        queryParams: { prompt: 'select_account' }
      },
    })
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "#131313" }}
    >
      <AuthBackdrop />

      {/* Split panel card */}
      <div
        className="relative w-full max-w-5xl mx-4 rounded-3xl overflow-hidden grid lg:grid-cols-[1fr_1fr]"
        style={{
          background: "rgba(19,19,19,0.95)",
          border: "1px solid rgba(245,158,11,0.1)",
          boxShadow: "0 60px 120px -20px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(245,158,11,0.05)",
        }}
      >
        {/* Top gold line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.5), transparent)" }}
        />

        {/* Left Panel: Brand */}
        <div
          className="relative"
          style={{
            background: "rgba(245,158,11,0.03)",
            borderRight: "1px solid rgba(245,158,11,0.08)",
          }}
        >
          <BrandPanel />
        </div>

        {/* Right Panel: Auth Form */}
        <div className="flex flex-col justify-center p-8 md:p-12">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <Scissors className="h-5 w-5 text-[#F59E0B]" />
            <span
              className="text-xl font-black tracking-tight text-white uppercase"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              Salon<span className="text-[#F59E0B]">.IA</span>
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1
              className="text-3xl font-black text-white tracking-tight"
              style={{ fontFamily: "var(--font-manrope)", letterSpacing: "-0.02em" }}
            >
              {isLogin ? "Ingreso Exclusivo" : "Crear Cuenta"}
            </h1>
            <p
              className="text-sm text-white/40 mt-1"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {isLogin
                ? "Accede a tu centro de comando"
                : "Únete a la revolución del sector belleza"}
            </p>
          </div>

          {/* Google OAuth — Primary action */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            id="google-oauth-btn"
            className="group relative w-full flex items-center justify-center gap-3 h-13 rounded-2xl font-bold text-white text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] mb-6"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              fontFamily: "var(--font-manrope)",
              padding: "0.875rem 1.5rem",
            }}
          >
            {/* Hover glow */}
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "rgba(245,158,11,0.06)" }}
            />
            <svg className="relative h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className="relative">Continuar con Google</span>
            <ChevronRight className="relative h-4 w-4 text-white/30 group-hover:text-[#F59E0B] transition-colors" />
          </button>

          {/* Divider with "No-Line" rule: use spacing, not a hard line */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            <p
              className="text-[11px] uppercase tracking-[0.2em] font-bold text-white/25"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              o con email
            </p>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>

          {/* Email/Password form */}
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-bold uppercase tracking-[0.12em] text-white/40"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nombre@ejemplo.com"
                required
                className="h-12 rounded-xl text-sm bg-transparent text-white placeholder:text-white/25 transition-all duration-200 focus:ring-1"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "2px solid rgba(255,255,255,0.08)",
                  fontFamily: "var(--font-inter)",
                  outline: "none",
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="password"
                className="text-xs font-bold uppercase tracking-[0.12em] text-white/40"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Contraseña
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="h-12 rounded-xl text-sm bg-transparent text-white placeholder:text-white/25 transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "2px solid rgba(255,255,255,0.08)",
                  fontFamily: "var(--font-inter)",
                }}
              />
            </div>

            {state?.error && (
              <div
                className="rounded-xl p-3 text-sm text-center"
                style={{
                  background: "rgba(244,63,94,0.08)",
                  border: "1px solid rgba(244,63,94,0.2)",
                  color: "#F43F5E",
                  fontFamily: "var(--font-inter)",
                }}
              >
                {state.error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isPending}
              id="email-submit-btn"
              className="w-full h-12 rounded-2xl font-bold text-sm transition-all duration-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:scale-[1.02] active:scale-[0.98] mt-2"
              style={{
                background: "linear-gradient(135deg, #ffc174 0%, #F59E0B 100%)",
                color: "#2a1700",
                fontFamily: "var(--font-manrope)",
                border: "none",
              }}
            >
              {isPending
                ? "Procesando..."
                : isLogin
                ? "Ingreso Exclusivo"
                : "Crear Cuenta Premium"}
            </Button>
          </form>

          {/* Toggle login/signup */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <p
              className="text-xs text-white/30"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {isLogin ? "¿Nuevo en Salon.IA?" : "¿Ya tienes cuenta?"}
            </p>
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              id="toggle-auth-mode"
              className="text-xs font-bold text-[#F59E0B] hover:text-[#ffc174] transition-colors underline underline-offset-2"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {isLogin ? "Regístrate gratis" : "Inicia sesión"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
