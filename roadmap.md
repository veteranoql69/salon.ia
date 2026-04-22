# Roadmap de Implementación (Sprints Actualizados) — BarberSaaS IA

Basado en la revisión del repositorio, **el andamiaje inicial (Next.js, Tailwind, Shadcn, módulos base y conexión a Supabase) ya está construido**. Además, ya existe la migración inicial (`20240101000000_init.sql`) con los roles base (`OWNER`, `BARBER`, `CLIENT`), el manejo de RLS en `brb_profiles` y las tablas de `brb_appointments` y `brb_ledgers`.

Por lo tanto, este Roadmap se ajusta para **iniciar directamente desde la transformación B2B del modelo (Sillones y Organizaciones)** propuesto en el `PLAN_MICROSAAS_DETALLADO.md`.

---

## 🟢 Sprint 1 (Sprint Actual): Fundación B2B y Onboarding
**Objetivo:** Transicionar de un modelo "Single-Tenant" a un modelo "Multi-Tenant" (Organizaciones/Salones) y crear el onboarding "Cero Fricción".

### ✅ Completado
- **Migración de Base de Datos:** Creadas las migraciones SQL para `brb_organizations`, `brb_chairs`, `brb_rental_configs`, `brb_join_requests`, `brb_invite_codes` y corrección de RLS v2.
- **Actualización de Modelos:** `org_id` agregado a perfiles, clientes, citas y ledgers. RLS multi-tenant activo.
- **Fix de Onboarding Identity:** Middleware que fuerza elección de rol (`PENDING`) antes de acceder al dashboard.
- **Design System "Editorial Futurism 2026":** Tokens de color (Amber Gold `#F59E0B`, Absolute Dark `#131313`), fuentes (Manrope + Inter), animaciones cinéticas y glassmorphism configurados en `globals.css` y `layout.tsx`.
- **Landing Page Pública (`/landing`):** Página de marketing "Cinematic Alchemist" con:
  - Hero asimétrico con headline de display-lg, CTA "Empieza el Futuro" → `/login`
  - Glassmorphic "Command Card" animada (datos live, sillones, feed IA)
  - Stats bar (1.200 profesionales, 94% reducción no-shows, etc.)
  - Bento Grid de funciones (IA Vigilante, WhatsApp IA, Agenda, CRM, Finanzas)
  - Cinematic Backdrop con blobs animados
  - Footer editorial
- **Login / Auth Page (`/login`) Rediseñada:** Panel dividido (brand left + form right) coherente con la landing. Google OAuth como acción primaria, inputs minimalistas, sin bordes duros, paleta idéntica a la landing.
- **Routing Público:** La ruta raíz `/` redirige a `/landing` si el usuario no está autenticado.

### 🔲 Pendiente
- **Flujo de Onboarding UI:** Completar wizards de registro (`/onboarding/owner` y `/onboarding/professional`) con animaciones y validación Zod.
- **Lógica de Asociación:** Validación de código de invitación (`brb_invite_codes`) y búsqueda por RUT.
- **Pantalla `/onboarding/pending-approval`:** Vista de espera para aprobación del dueño.
- **🤖 Skills Activos:** `postgres-best-practices`, `database-design`, `react-patterns`, `zod-validation-expert`.

## 🟡 Sprint 2: Agenda Global y "Quick Book"
**Objetivo:** Entregar el valor central operativo a los profesionales (agendar en segundos) y al dueño (control total).
- **Vista de Dueño (Command Center):** Timeline multi-sillón consolidada.
- **Vista de Profesional (Mobile-First):** Componente "Agendar Rápido" con reconocimiento de números / pre-llenado en 2 taps.
- **Refactor Server Actions:** Optimización de concurrencia y validación de overbookings sobre `brb_appointments`.
- **Integración Temprana CRM:** Creación de cliente paralelo durante el Quick Book.
- **🤖 Skills Activos:** `react-state-management`, `senior-frontend`, `ui-ux-pro-max`, `backend-security-coder`.

## 🟡 Sprint 3: Módulo Sillones y Motor Financiero
**Objetivo:** Activar el modelo de negocio core de la barbería (arriendos y porcentajes) integrando el esquema visual.
- **Editor Visual:** Interfaz "Drag & Drop" para ubicar sillones en la vista de dueño.
- **Contratos (Soft Contracts):** UI para definir `brb_rental_configs` (arriendo fijo, variable, insumos).
- **Liquidadores Automáticos:** Unir el historial de la agenda con `brb_ledgers` para calcular la "deuda/pago" automático a fin de quincena/semana.
- **🤖 Skills Activos:** `typescript-pro`, `react-patterns`.

## 🟡 Sprint 4: La "IA Vigilante" (Whatsapp y Hub)
**Objetivo:** Desarrollar e integrar el Agente Cognitivo para recepción de consultas por WhatsApp y generación de Insights.
- **Agente Bot y Webhooks:** Setup del `POST /api/whatsapp` y verificación Meta Cloud API (Tiempos de respuesta < 3s).
- **Vercel AI + Tools:** Implementar Tools para que el LLM agende turnos leyendo el inventario de la DB en tiempo real.
- **Activity Log Base:** Tabla `brb_ai_activity_log` para persistir *Insights* ("Carlos lleva 3 meses sin venir").
- **🤖 Skills Activos:** `whatsapp-api-expert`, `gemini-api-dev`, `ai-engineer`, `agent-tool-builder`.

## 🟡 Sprint 5: Dashboard de Impacto y Realtime
**Objetivo:** Terminar la vista gerencial con analíticas puras procesadas.
- **Métricas Vivas:** Dashboards con `recharts` que calculen la Tasa de Conversión y la Ocupación.
- **Atribución de IA:** Gráficas que demuestran qué porcentaje del ingreso semanal fue generado orgánicamente por la IA vs Manual.
- **Panel Lateral IA:** UI de notificaciones/feed de acciones de la IA con animaciones pulse.
- **🤖 Skills Activos:** `kpi-dashboard-design`, `recharts-expert`, `analytics-tracking`, `antigravity-design-expert`.

## 🟡 Sprint 6: End-to-End Testing y Estabilización
**Objetivo:** Certificar el producto mediante pruebas automatizadas críticas antes de onboarding de usuarios reales.
- **Suite E2E Playwright:** Automatización del flujo: Dueño crea Salón -> Profesional se une -> Cliente agenda vía Bot -> Salón cobra.
- **Optimización de Producción:** Web vitals, refinamiento de metadata.
- **🤖 Skills Activos:** `e2e-testing`, `testing-patterns`, `docker-expert`.
