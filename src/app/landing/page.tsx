import Link from "next/link";
import { Check, Scissors } from "lucide-react";

export const metadata = {
  title: "Salon.IA | La Inteligencia que Embellece tu Negocio",
  description: "Lleva la inteligencia artificial a tu peluquería, barbería o centro de estética. El futuro de tu negocio empieza aquí.",
};

const pilares = [
  { tag: "Heritage", name: "Barberia",  color: "#ffc174", img: "/pilar_barberia.png",  desc: "Arte y precisión en cada corte" },
  { tag: "Zenith",   name: "Spa",       color: "#8fd5ff", img: "/pilar_spa.png",       desc: "Tecnología al servicio del bienestar" },
  { tag: "Detail",   name: "Manicure",  color: "#f0bd82", img: "/pilar_manicure.png",  desc: "Perfección hasta el último detalle" },
  { tag: "Future",   name: "Estetica",  color: "#a78bfa", img: "/pilar_estetica.png",  desc: "Resultados que transforman" },
];

const modulos = [
  { title: "Agenda Inteligente",     desc: "Optimización de flujos de trabajo que elimina solapamientos y maximiza cada minuto de tus especialistas." },
  { title: "CRM de Lujo",            desc: "Perfiles de clientes ultra-detallados con historial visual y preferencias de estilo personalizadas." },
  { title: "Finanzas Claras",        desc: "Reportes en tiempo real de ingresos, comisiones y gastos con claridad quirúrgica." },
  { title: "Análisis de Crecimiento",desc: "Visualiza el futuro de tu negocio con gráficas proyectadas por IA." },
];

const planes = [
  { name: "Prueba Gratuita",   desc: "Descubre el poder de la IA sin fricciones ni compromisos.",         badge: null,          items: ["30 días gratis","Sin tarjeta de crédito","Configuración asistida"], cta: "Empezar gratis",      highlight: false },
  { name: "Plan Profesional",  desc: "Para salones y barberías en crecimiento constante.",                 badge: "Más Popular",  items: ["Agenda Inteligente","CRM de Lujo","Automatización básica"],       cta: "Elegir Profesional",  highlight: true  },
  { name: "Plan Elite",        desc: "El ecosistema completo para líderes del sector.",                    badge: null,          items: ["Todo lo de Profesional","IA Concierge","Análisis de Crecimiento"], cta: "Contactar ventas",    highlight: false },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen" style={{ background: "#131313", color: "#e2e2e2" }}>

      {/* ── Cinematic Backdrop ─────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-10" style={{ background:"#F59E0B", filter:"blur(130px)", animation:"blob 14s ease-in-out infinite" }} />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full opacity-8" style={{ background:"#F59E0B", filter:"blur(150px)", animation:"blob 18s ease-in-out infinite 6s" }} />
        <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] rounded-full opacity-5" style={{ background:"#8fd5ff", filter:"blur(130px)", animation:"blob 22s ease-in-out infinite 12s" }} />
      </div>

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-16 py-4" style={{ background:"rgba(19,19,19,0.8)", backdropFilter:"blur(24px)", borderBottom:"1px solid rgba(160,142,122,0.1)" }}>
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl" style={{ background:"rgba(245,158,11,0.12)", border:"1px solid rgba(245,158,11,0.2)" }}>
            <Scissors size={14} color="#F59E0B" />
          </div>
          <span className="font-black text-lg tracking-tight text-white uppercase" style={{ fontFamily:"var(--font-manrope)" }}>
            Salon<span style={{ color:"#F59E0B" }}>.IA</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {["Servicios","IA Concierge","Precios"].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(" ","-")}`} className="text-sm font-medium no-underline transition-colors hover:text-white" style={{ color:"#d8c3ad", fontFamily:"var(--font-inter)" }}>{l}</a>
          ))}
        </div>

        <Link href="/login" id="nav-cta" className="text-sm font-bold no-underline rounded-full px-5 py-2.5 transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]" style={{ background:"linear-gradient(135deg,#ffc174,#F59E0B)", color:"#2a1700", fontFamily:"var(--font-manrope)" }}>
          Empezar
        </Link>
      </nav>

      <main>
        {/* ── Hero ───────────────────────────────────────────────── */}
        <section className="pt-28 pb-20 px-6 lg:px-16">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left: copy */}
            <div className="flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 self-start rounded-full px-4 py-1.5" style={{ background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background:"#F59E0B", animation:"pulse-gold 2s ease-in-out infinite" }} />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color:"#F59E0B", fontFamily:"var(--font-inter)" }}>IA Omnipresente · 2026</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.95] tracking-tight text-white" style={{ fontFamily:"var(--font-manrope)", letterSpacing:"-0.025em" }}>
                La Inteligencia que{" "}
                <span style={{ background:"linear-gradient(135deg,#ffc174,#F59E0B)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                  Embellece
                </span>{" "}
                tu Negocio
              </h1>

              <p className="text-base lg:text-lg leading-relaxed max-w-xl" style={{ color:"#d8c3ad", fontFamily:"var(--font-inter)", lineHeight:"1.7" }}>
                Lleva la inteligencia artificial a tu peluquería, barbería o centro de estética. Seas una gran cadena o un profesional independiente, nuestra asistencia operativa es simple, accesible y sin complicaciones.
              </p>

              {/* KPI */}
              <div className="flex items-center gap-5 rounded-2xl p-5 self-start" style={{ background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.15)" }}>
                <div>
                  <p className="font-black text-5xl leading-none" style={{ color:"#F59E0B", fontFamily:"var(--font-manrope)" }}>+45%</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color:"#d8c3ad", fontFamily:"var(--font-inter)" }}>Productividad</p>
                </div>
                <p className="text-sm leading-relaxed max-w-[220px]" style={{ color:"#d8c3ad", fontFamily:"var(--font-inter)" }}>
                  Los salones que usan Salon.IA reportan hasta un 45% más de eficiencia operativa en el primer trimestre.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/login" id="hero-cta-primary" className="flex items-center justify-center gap-2 rounded-full font-black text-base no-underline transition-all hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95 px-8 py-4" style={{ background:"linear-gradient(135deg,#ffc174,#F59E0B)", color:"#2a1700", fontFamily:"var(--font-manrope)" }}>
                  Empieza el Futuro — Es gratis
                </Link>
                <a href="#servicios" id="hero-cta-secondary" className="flex items-center justify-center rounded-full font-semibold text-sm no-underline transition-all px-6 py-4" style={{ background:"transparent", border:"1px solid rgba(160,142,122,0.2)", color:"#d8c3ad", fontFamily:"var(--font-inter)" }}>
                  Ver en acción
                </a>
              </div>
            </div>

            {/* Right: glassmorphic card (desktop only) */}
            <div className="hidden lg:flex flex-col gap-4 rounded-3xl p-6" style={{ background:"rgba(57,57,57,0.35)", backdropFilter:"blur(40px)", border:"1px solid rgba(245,158,11,0.1)", boxShadow:"0 60px 120px -20px rgba(0,0,0,0.6)", animation:"float 6s ease-in-out infinite" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color:"rgba(226,226,226,0.4)", fontFamily:"var(--font-inter)" }}>Centro de Comando · En Vivo</span>
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background:"#F59E0B", animation:"pulse-gold 2s ease-in-out infinite" }} />
                  <span className="w-2 h-2 rounded-full" style={{ background:"#10b981" }} />
                </div>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-3 gap-3">
                {[{l:"Citas Hoy",v:"12",d:"+3"},{l:"Ocupación",v:"78%",d:"↑5%"},{l:"Ingresos",v:"$185K",d:"+12%"}].map(({l,v,d})=>(
                  <div key={l} className="rounded-2xl p-3 flex flex-col gap-1" style={{ background:"rgba(255,255,255,0.04)" }}>
                    <p className="text-xl font-black text-white" style={{ fontFamily:"var(--font-geist-mono)" }}>{v}</p>
                    <p className="text-[9px] uppercase tracking-wider" style={{ color:"rgba(226,226,226,0.4)", fontFamily:"var(--font-inter)" }}>{l}</p>
                    <p className="text-[10px] font-bold" style={{ color:"#10b981" }}>{d}</p>
                  </div>
                ))}
              </div>

              {/* AI Feed */}
              <div className="rounded-2xl p-4" style={{ background:"rgba(245,158,11,0.05)", border:"1px solid rgba(245,158,11,0.1)" }}>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color:"#8fd5ff", fontFamily:"var(--font-inter)" }}>● IA Vigilante</p>
                {["Agendé a Claudia con María (WhatsApp)","Respondí consulta de precios (Instagram)","Detecté 3 clientes sin visita en 30 días"].map(m=>(
                  <p key={m} className="text-xs mb-1.5" style={{ color:"rgba(226,226,226,0.6)", fontFamily:"var(--font-inter)" }}>{m}</p>
                ))}
              </div>

              {/* Sillones */}
              <div className="grid grid-cols-4 gap-2">
                {[{l:"S1 · María",s:"green"},{l:"S2 · Carlos",s:"red"},{l:"S3 · Libre",s:"gray"},{l:"S4 · Laura",s:"green"}].map(({l,s})=>(
                  <div key={l} className="rounded-xl p-2 text-center" style={{ background:s==="green"?"rgba(16,185,129,0.1)":s==="red"?"rgba(244,63,94,0.1)":"rgba(255,255,255,0.04)", border:`1px solid ${s==="green"?"rgba(16,185,129,0.2)":s==="red"?"rgba(244,63,94,0.2)":"rgba(255,255,255,0.06)"}` }}>
                    <p className="text-[9px] leading-tight" style={{ color:"rgba(226,226,226,0.6)", fontFamily:"var(--font-inter)" }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats Bar ──────────────────────────────────────────── */}
        <section className="px-6 lg:px-16 pb-6">
          <div className="max-w-7xl mx-auto rounded-3xl p-6 lg:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8" style={{ background:"rgba(31,31,31,0.9)", border:"1px solid rgba(255,255,255,0.05)" }}>
            {[{v:"+1.200",l:"Profesionales activos"},{v:"94%",l:"Reducción de no-shows"},{v:"67%",l:"Citas agendadas por IA"},{v:"3s",l:"Tiempo de respuesta IA"}].map(({v,l})=>(
              <div key={l} className="flex flex-col items-center gap-1 text-center">
                <p className="text-3xl lg:text-4xl font-black text-white" style={{ fontFamily:"var(--font-manrope)" }}>{v}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color:"rgba(226,226,226,0.4)", fontFamily:"var(--font-inter)" }}>{l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Pilares ────────────────────────────────────────────── */}
        <section id="servicios" className="px-6 lg:px-16 py-20">
          <div className="max-w-7xl mx-auto">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color:"#F59E0B", fontFamily:"var(--font-inter)" }}>Experiencia Multidimensional</p>
            <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-3 text-white" style={{ fontFamily:"var(--font-manrope)", letterSpacing:"-0.02em" }}>
              Cuatro pilares de maestría técnica<br className="hidden lg:block" /> y elegancia visual
            </h2>
            <p className="text-sm lg:text-base mb-10" style={{ color:"#d8c3ad", fontFamily:"var(--font-inter)" }}>para cada rincón de tu establecimiento.</p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {pilares.map(({ tag, name, color, img, desc }) => (
                <Link
                  key={name}
                  href="/login"
                  className="relative rounded-2xl overflow-hidden group cursor-pointer block no-underline"
                  style={{ height: "280px", border: `1px solid ${color}22` }}
                >
                  {/* Background image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${img})` }}
                  />
                  {/* Dark overlay gradient */}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.9) 100%)" }} />
                  {/* Color line on top */}
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
                  {/* Tag badge top-left */}
                  <div className="absolute top-4 left-4">
                    <span
                      className="text-[9px] font-black uppercase tracking-[0.2em] rounded-full px-3 py-1"
                      style={{ background: `${color}22`, border: `1px solid ${color}44`, color, backdropFilter: "blur(8px)", fontFamily: "var(--font-inter)" }}
                    >
                      {tag}
                    </span>
                  </div>
                  {/* Content bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-xl font-black text-white mb-1" style={{ fontFamily: "var(--font-manrope)", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>{name}</p>
                    <p className="text-[11px] leading-tight opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: "#d8c3ad", fontFamily: "var(--font-inter)" }}>{desc}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* IA Concierge Card */}
            <div id="ia-concierge" className="rounded-2xl p-5 lg:p-6" style={{ background:"rgba(245,158,11,0.05)", border:"1px solid rgba(245,158,11,0.15)" }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background:"#8fd5ff", animation:"pulse-gold 2s ease-in-out infinite" }} />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color:"#8fd5ff", fontFamily:"var(--font-inter)" }}>Sugerencia de Agenda</span>
              </div>
              <p className="text-sm lg:text-base italic leading-relaxed" style={{ color:"#e2e2e2", fontFamily:"var(--font-inter)" }}>
                &ldquo;Hemos detectado un hueco el martes. ¿Deseas ofrecer un descuento &lsquo;Flash&rsquo; a tus clientes VIP?&rdquo;
              </p>
            </div>
          </div>
        </section>

        {/* ── Director de Operaciones ────────────────────────────── */}
        <section className="px-6 lg:px-16 py-20" style={{ background:"#1b1b1b" }}>
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color:"#F59E0B", fontFamily:"var(--font-inter)" }}>Tu Nuevo</p>
              <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-5 text-white" style={{ fontFamily:"var(--font-manrope)", letterSpacing:"-0.02em", lineHeight:"1.05" }}>
                Director de Operaciones Invicto.
              </h2>
              <p className="text-sm lg:text-base leading-relaxed mb-6" style={{ color:"#d8c3ad", fontFamily:"var(--font-inter)", lineHeight:"1.7" }}>
                No es solo software; es una entidad inteligente que aprende de tus clientes, optimiza tus tiempos muertos y predice tendencias de consumo antes de que ocurran.
              </p>
              {["Automatización total de citas vía WhatsApp IA.","Gestión de inventario predictivo."].map(item => (
                <div key={item} className="flex items-start gap-3 mb-3">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 mt-0.5" style={{ background:"rgba(245,158,11,0.15)" }}>
                    <Check size={10} color="#F59E0B" />
                  </div>
                  <p className="text-sm lg:text-base" style={{ color:"#e2e2e2", fontFamily:"var(--font-inter)" }}>{item}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {modulos.map(({ title, desc }) => (
                <div key={title} className="rounded-2xl p-5 transition-all hover:scale-[1.02]" style={{ background:"#1f1f1f", border:"1px solid rgba(83,68,52,0.25)" }}>
                  <p className="text-base font-black text-white mb-2" style={{ fontFamily:"var(--font-manrope)" }}>{title}</p>
                  <p className="text-xs leading-relaxed" style={{ color:"#d8c3ad", fontFamily:"var(--font-inter)", lineHeight:"1.6" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Planes ─────────────────────────────────────────────── */}
        <section id="precios" className="px-6 lg:px-16 py-20">
          <div className="max-w-7xl mx-auto">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color:"#F59E0B", fontFamily:"var(--font-inter)" }}>Planes que Crecen Contigo</p>
            <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-3 text-white" style={{ fontFamily:"var(--font-manrope)", letterSpacing:"-0.02em" }}>Una inversión transparente.</h2>
            <p className="text-sm lg:text-base mb-10" style={{ color:"#d8c3ad", fontFamily:"var(--font-inter)" }}>Sin compromisos ocultos, solo tecnología de primer nivel.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {planes.map(({ name, desc, badge, items, cta, highlight }) => (
                <div key={name} className="relative rounded-3xl p-6 lg:p-8 flex flex-col gap-4" style={{ background: highlight ? "rgba(245,158,11,0.06)" : "#1f1f1f", border: highlight ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(83,68,52,0.25)" }}>
                  {highlight && <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-3xl" style={{ background:"linear-gradient(90deg,transparent,rgba(245,158,11,0.7),transparent)" }} />}
                  {badge && (
                    <span className="self-start text-[10px] font-bold uppercase tracking-[0.12em] rounded-full px-3 py-1" style={{ background:"rgba(245,158,11,0.15)", border:"1px solid rgba(245,158,11,0.3)", color:"#F59E0B", fontFamily:"var(--font-inter)" }}>{badge}</span>
                  )}
                  <div>
                    <p className="text-lg font-black text-white mb-1" style={{ fontFamily:"var(--font-manrope)" }}>{name}</p>
                    <p className="text-xs leading-relaxed" style={{ color:"#d8c3ad", fontFamily:"var(--font-inter)" }}>{desc}</p>
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    {items.map(item => (
                      <div key={item} className="flex items-center gap-2">
                        <Check size={12} color="#F59E0B" />
                        <span className="text-sm" style={{ color:"#e2e2e2", fontFamily:"var(--font-inter)" }}>{item}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/login" className="block text-center rounded-full py-3 font-bold text-sm no-underline transition-all hover:scale-105 active:scale-95 mt-2" style={{ background: highlight ? "linear-gradient(135deg,#ffc174,#F59E0B)" : "transparent", color: highlight ? "#2a1700" : "#d8c3ad", border: highlight ? "none" : "1px solid rgba(160,142,122,0.25)", fontFamily:"var(--font-manrope)" }}>
                    {cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Final ──────────────────────────────────────────── */}
        <section className="px-6 lg:px-16 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden p-10 lg:p-20 text-center flex flex-col items-center gap-6" style={{ background:"#1f1f1f", border:"1px solid rgba(245,158,11,0.12)" }}>
              <div className="absolute inset-0 pointer-events-none" style={{ background:"radial-gradient(ellipse 70% 50% at 50% 0%, rgba(245,158,11,0.1), transparent)" }} />
              <p className="relative text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color:"#F59E0B", fontFamily:"var(--font-inter)" }}>Únete a la Evolución</p>
              <h2 className="relative text-3xl lg:text-6xl font-black tracking-tight text-white" style={{ fontFamily:"var(--font-manrope)", letterSpacing:"-0.025em", lineHeight:"1.05" }}>
                Tu salón merece el estándar de oro<br className="hidden lg:block" /> de la tecnología.
              </h2>
              <p className="relative text-sm lg:text-lg max-w-xl" style={{ color:"#d8c3ad", fontFamily:"var(--font-inter)", lineHeight:"1.7" }}>
                No dejes para mañana el futuro que puedes liderar hoy.
              </p>
              <Link href="/login" id="final-cta" className="relative inline-block rounded-full font-black text-base lg:text-lg no-underline transition-all hover:shadow-[0_0_60px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95 px-10 py-5" style={{ background:"linear-gradient(135deg,#ffc174,#F59E0B)", color:"#2a1700", fontFamily:"var(--font-manrope)" }}>
                Empieza el Futuro — Es gratis
              </Link>
              <p className="relative text-xs" style={{ color:"#a08e7a", fontFamily:"var(--font-inter)" }}>Sin tarjeta de crédito · Configuración en 5 minutos</p>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="px-6 lg:px-16 py-10" style={{ borderTop:"1px solid rgba(83,68,52,0.2)" }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Scissors size={14} color="#F59E0B" />
              <span className="font-black text-sm text-white uppercase" style={{ fontFamily:"var(--font-manrope)" }}>Salon<span style={{ color:"#F59E0B" }}>.IA</span></span>
            </div>
            <p className="text-xs italic" style={{ color:"#a08e7a", fontFamily:"var(--font-inter)" }}>Elevando los estándares de la estética a través de la computación emocional.</p>
          </div>
          <div className="flex flex-wrap gap-5">
            {["Servicios","IA Concierge","Precios","Privacidad"].map(l => (
              <a key={l} href="#" className="text-xs no-underline transition-colors hover:text-white" style={{ color:"#d8c3ad", fontFamily:"var(--font-inter)" }}>{l}</a>
            ))}
          </div>
          <p className="text-[10px]" style={{ color:"rgba(160,142,122,0.5)", fontFamily:"var(--font-inter)" }}>© 2026 Salon.IA. The Cinematic Alchemist Experience.</p>
        </div>
      </footer>
    </div>
  );
}
