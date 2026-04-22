# Plan Detallado — MicroSaaS Barber IA
> Fecha: 2024-04-18 | Versión: 1.1 | Stack: Next.js App Router + Supabase + Vercel AI SDK

---

> [!IMPORTANT]
> **Actualización Fase 2.1**: Reevaluación del flujo de Onboarding para evitar la asignación automática del rol `CLIENT` y forzar un "User Journey" de elección de perfil premium.

## 0. Roadmap de Ejecución (Sprints)

### Sprint 1: La Identidad & El Viaje (Onboarding Real)
- **Objetivo**: Que ningún usuario "nuevo" sea asumido como Cliente. Forzar elección de identidad.
- **Entregable**: Middleware de redirección a `/onboarding` + Selección de Rol UI + Wizard de Inicialización.
- **IA**: Integración de Vercel AI SDK para el "Luxury Concierge" en el registro.

### Sprint 2: El Motor Multi-Empresa (Core B2B)
- **Objetivo**: Estructura multi-sucursal y sillones.
- **Entregable**: Gestión de Organizaciones (`brb_organizations`) + Inventario de Sillones (`brb_chairs`).
- **Arquitectura**: Aislamiento total de datos por organización (RLS).

### Sprint 3: Ecosistema & Staff (Vinculación)
- **Objetivo**: Permitir que los profesionales (Barberos/Estilistas) se unan a salones o trabajen solos.
- **Entregable**: Invitaciones por código + Panel de Aprobaciones.

### Sprint 4: IA Vigilante & Observabilidad
- **Objetivo**: Poner el sistema en "piloto automático" y monitorear.
- **Entregable**: Agente de WhatsApp (LangChain/Vercel AI) + Integración con Langfuse Autohosteado.
- **Métrica**: Dashboard de Atribución IA.

---

## 1. Visión General del Producto

### 1.1 Concepto Central
MicroSaaS B2B2C para la industria de la belleza y cuidado personal: barberías, peluquerías, centros de estética, centros de belleza y profesionales independientes. La **IA es vigilante omnipresente** de cada módulo — monitorea, sugiere, alerta y automatiza en tiempo real.

### 1.2 Mercados Objetivo
| Segmento | Ejemplo | Particularidades |
|---|---|---|
| Profesional independiente | Peluquera que trabaja en casa o a domicilio | Sin sillones, sin staff, agenda propia |
| Salón pequeño | Barbería 2-3 sillones | Dueño = profesional activo |
| Salón mediano | Centro de belleza 4-8 sillones | Arriendo mixto (%, fijo, híbrido) |
| Salón grande / franquicia | Centro de estética 10+ puestos | Multi-sucursal, reportería consolidada |

### 1.3 Roles del Sistema
| Rol | Código BD | Acceso |
|---|---|---|
| **Pendiente** | `PENDING` | Acceso restringido: Solo Onboarding / Concierge IA |
| **Dueño** | `OWNER` | Dashboard completo, configuración salón, finanzas globales, sillones, CRM global, agenda de todos |
| **Profesional** (Barber/Estilista) | `BARBER` | Su agenda, sus clientes, su balance financiero, agendamiento rápido |
| **Cliente** | `CLIENT` | Reservar cita, ver historial, recibir notificaciones |

---

## 2. Onboarding — Diseño "Cero Fricción"

### 2.1 Problema a Resolver
En este mercado los usuarios **no tienen correos corporativos**. Una estilista agenda por WhatsApp, por audio, por Instagram DM. El onboarding debe ser ultra-rápido, premium en diseño, y resolver la validación de identidad organizacional sin fricciones.

### 2.2 Flujo de Autenticación Inicial

```
┌─────────────────────────────────────┐
│  Login con Google (Gmail/Workspace)  │
└──────────────┬──────────────────────┘
               │
       ┌───────▼───────┐
       │ ¿Primera vez?  │
       └───┬───────┬───┘
          NO      SÍ
           │       │
     Dashboard  Onboarding
                   │
         ┌─────────▼─────────┐
         │  ¿Qué eres?       │
         │  ○ Dueño/a        │
         │  ○ Profesional    │
         │  ○ Cliente        │
         └──┬─────┬─────┬───┘
            │     │     │
         Flujo  Flujo  Flujo
         Dueño  Prof.  Cliente
```

### 2.3 Detección Automática por Dominio de Email

**Correo corporativo** (`@salondiana.cl`, `@barbershop.com`):
- El sistema busca si existe una organización (`brb_organizations`) con ese dominio.
- Si existe → auto-asocia al usuario a esa organización.
- Si no existe → pregunta si quiere registrar la organización.

**Correo Gmail personal** (`@gmail.com`):
- Requiere el flujo de validación manual (ver sección 2.4 y 2.5).

### 2.4 Onboarding — Flujo Dueño/a

> Diseño: Wizard multi-paso con progress bar, glassmorphism, micro-animaciones en cada transición. Máximo 4 pasos visuales.

**Paso 1 — Identifícate**
| Campo | Tipo | Obligatorio | Nota |
|---|---|---|---|
| Nombre completo | text | Sí | Pre-llenado desde Google |
| RUT del negocio | text + validación | Sí | Formato chileno, dígito verificador |
| Tipo de negocio | select | Sí | Barbería / Peluquería / Centro de Estética / Centro de Belleza / Otro |
| Nombre del salón | text | Sí | |
| Teléfono WhatsApp del salón | phone | Sí | Será el número principal del agente IA |

**Paso 2 — Tu Espacio de Trabajo**
| Campo | Tipo | Obligatorio | Nota |
|---|---|---|---|
| ¿Cuántos puestos de atención? | number stepper (1-30) | Sí | |
| ¿Trabajas desde casa/domicilio? | toggle | No | Si sí → skip configuración de sillones |
| Dirección del salón | text + autocomplete | Condicional | Solo si no es domicilio |
| Horario de atención | range picker (L-D) | Sí | Horario general del salón |

**Paso 3 — Modalidad de Arriendo**
> Solo aparece si puestos > 1

| Campo | Tipo | Nota |
|---|---|---|
| Modalidad por defecto | select | Arriendo fijo / % de venta / Mixto (fijo + %) |
| Monto fijo (si aplica) | currency CLP | Configurable por sillón después |
| Porcentaje (si aplica) | % slider (10-60%) | |
| Frecuencia de cobro | select | Diario / Semanal / Quincenal / Mensual |
| ¿Profesional usa sus propios productos? | toggle | Afecta el cálculo de comisión |
| ¿Profesional usa productos del salón? | toggle | Genera cargo adicional configurable |

**Paso 4 — Resumen + Confirmación**
- Vista tipo "tarjeta de presentación" del salón con toda la info ingresada.
- Botón "Lanzar mi Salón" con animación de confetti/celebración.
- Genera automáticamente: `brb_organizations`, `brb_chairs` (según cantidad), `brb_rental_configs`.

### 2.5 Onboarding — Flujo Profesional (Estilista/Barbero)

> El flujo debe validar que el profesional **realmente pertenece a un salón registrado** en la plataforma.

**Paso 1 — Identifícate**
| Campo | Tipo | Nota |
|---|---|---|
| Nombre completo | text | Pre-llenado |
| Teléfono WhatsApp personal | phone | Para notificaciones |
| Especialidad | multi-select | Corte / Color / Barba / Extensiones / Uñas / Maquillaje / Otro |

**Paso 2 — ¿Dónde trabajas?**

Tres opciones con UI tipo card-selector:

| Opción | Flujo |
|---|---|
| **"Trabajo independiente"** | Skip validación → Se crea como profesional sin organización |
| **"Me uno a un salón"** | Pide el RUT del salón → Match con `brb_organizations.rut` |
| **"Mi dueño/a me invitó"** | Ingresa código de invitación de 6 dígitos |

**Validación por RUT del Salón:**
1. El profesional ingresa el RUT del salón.
2. El sistema busca en `brb_organizations` si existe.
3. Si existe → muestra el nombre del salón para confirmar ("¿Es este tu salón? **Barbería Don Carlos**").
4. Si confirma → se crea una solicitud (`brb_join_requests`) que el dueño aprueba desde su dashboard.
5. El dueño recibe una notificación push/toast: "María González quiere unirse a tu salón como estilista".
6. El dueño aprueba → se asigna un sillón disponible → el profesional ya tiene acceso.

**Validación por Código de Invitación:**
1. El dueño genera un código desde su panel de sillones (ej: `BRB-X7K2`).
2. El profesional ingresa el código → match instantáneo → asignación automática al sillón pre-configurado.
3. Sin aprobación manual necesaria.

### 2.6 Onboarding — Flujo Cliente

> Ultra-minimalista. Máximo 1 paso después del login con Google.

- Se crea perfil automáticamente con el trigger existente `brb_handle_new_user`.
- Si viene desde un link de reserva (ej: `tubarber.app/reservar?salon=abc123`), va directo al flujo de reserva.
- Si viene orgánicamente, ve una landing con "Buscar un salón cerca de ti" o "Ingresar código de salón".

---

## 3. Módulo: Agenda — Vista por Perfil

### 3.1 Vista Dueño — Agenda Global

El dueño necesita ver **todo** de un vistazo. La agenda del dueño es un **centro de comando**.

```
┌──────────────────────────────────────────────────────────────┐
│  AGENDA — Vista Global                                [Hoy ▼]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐  ┌──────────────────────────────────────────┐   │
│  │Calendar │  │  Timeline Diaria (todos los sillones)    │   │
│  │  (mini) │  │  ┌──────┬──────┬──────┬──────┐          │   │
│  │         │  │  │ S1   │ S2   │ S3   │ S4   │          │   │
│  │         │  │  │María │Carlos│Vacío │Laura │          │   │
│  │         │  │  ├──────┼──────┼──────┼──────┤          │   │
│  │         │  │  │09:00 │09:00 │      │09:30 │          │   │
│  │         │  │  │Corte │Barba │      │Color │          │   │
│  │         │  │  │Ana P.│José M│      │Marta │          │   │
│  └─────────┘  │  └──────┴──────┴──────┴──────┘          │   │
│               └──────────────────────────────────────────┘   │
│                                                              │
│  ┌─ Próximas Citas ──────────────────────────────────────┐   │
│  │ 🔵 10:00 — María → Corte + Barba (Juan P.) — IA      │   │
│  │ 🟢 10:30 — Carlos → Fade (Pedro L.) — Manual         │   │
│  │ 🟡 11:00 — Laura → Color (Ana R.) — WhatsApp         │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ Insights IA ─────────────────────────────────────────┐   │
│  │ ⚡ "María tiene 2 huecos entre 14:00-16:00.           │   │
│  │    Sugerencia: activar campaña de último minuto"       │   │
│  │ 📊 "Ocupación hoy: 73%. Promedio semana: 68%"         │   │
│  │ 🔔 "3 clientes no confirmaron cita de mañana"         │   │
│  └───────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

**Datos que aporta la IA al dueño en Agenda:**
| Dato | Descripción | Valor de Negocio |
|---|---|---|
| Ocupación en tiempo real | % de sillones ocupados vs disponibles | Optimización de capacidad |
| Huecos detectados | Bloques libres > 30min entre citas | Oportunidad de llenado (campaña last-minute) |
| Tasa de no-show | % de citas sin confirmar/canceladas últimas 2 semanas | Decidir si cobrar seña |
| Predicción de demanda | Basado en histórico: "Los viernes a las 18h sueles llenar" | Ajuste de precios dinámicos |
| Fuente del agendamiento | IA WhatsApp / IA Instagram / Manual profesional / Web cliente | Medir ROI de cada canal |
| Alertas de confirmación | "5 citas de mañana sin confirmar — ¿enviar recordatorio?" | Reducir no-shows |
| Rendimiento por profesional | Citas completadas, canceladas, tiempo promedio | Evaluación de staff |

### 3.2 Vista Profesional — Mi Agenda

La estilista/barbero necesita **velocidad y simplicidad**. Su vista es **mobile-first**.

```
┌──────────────────────────────────┐
│  MI AGENDA — Hoy, Martes 15     │
│  ┌───────────────────────────┐   │
│  │  [+ Agendar Rápido]      │   │  ← Botón prominente
│  └───────────────────────────┘   │
│                                  │
│  09:00 ■■■■■■■ Corte — Ana P.   │  ← Tap para ver detalle
│  09:45 ░░░░░░░ Libre            │  ← Tap para agendar
│  10:30 ■■■■■■■ Color — Marta V. │
│  11:15 ■■■■■■■ Barba — José M.  │
│  12:00 ░░░░░░░ Libre            │
│  12:45 ████████ ALMUERZO        │  ← Bloqueado
│  ...                             │
│                                  │
│  ┌─ IA dice ─────────────────┐   │
│  │ "Tienes 3 horas libres    │   │
│  │  esta tarde. ¿Publico     │   │
│  │  disponibilidad en RRSS?" │   │
│  └───────────────────────────┘   │
│                                  │
│  Resumen del día:                │
│  Citas: 6/10 | Ingresos: $42K   │
│  Nuevos clientes hoy: 2         │
└──────────────────────────────────┘
```

**Agendamiento Rápido (Cero Fricción) — Flujo Profesional:**

El problema real: la estilista cerró una cita por WhatsApp personal o por audio. Necesita registrarla **en segundos**.

```
Flujo: [+ Agendar Rápido]
         │
    ┌────▼─────────────────────────────────────┐
    │  Pegar/escribir número WhatsApp           │
    │  [+56 9 _________ ]  [📋 Pegar contacto] │
    │                                           │
    │  → Busca en CRM automáticamente           │
    │    ✅ "Ana Pérez encontrada" → Continuar  │
    │    ❌ No encontrada → Mini-formulario:    │
    │       Nombre: [___________]               │
    │       (auto-completar desde contacto      │
    │        compartido si PWA lo permite)       │
    │                                           │
    │  Seleccionar hora: [Hoy ▼] [10:30 ▼]     │
    │  Servicio: [Corte ▼]                      │
    │  Duración: [45 min] (auto según servicio) │
    │                                           │
    │  [Agendar y Notificar por WhatsApp]       │
    │  [Agendar sin notificar]                  │
    └───────────────────────────────────────────┘
```

**Pasos internos:**
1. Profesional pega número → query a `brb_customers.phone`.
2. Si no existe → crea contacto mínimo (nombre + teléfono). Se enriquece después.
3. Se crea la cita en `brb_appointments`.
4. Si "Notificar por WhatsApp" → dispara template message de confirmación vía Meta Cloud API.
5. Se registra la fuente: `source: 'manual_profesional'` en la cita.

### 3.3 Vista Cliente — Mis Citas

```
┌──────────────────────────────────┐
│  MIS CITAS                       │
│                                  │
│  Próxima cita:                   │
│  ┌────────────────────────────┐  │
│  │ Martes 15 Abril, 10:30    │  │
│  │ Corte + Barba con María    │  │
│  │ Barbería Don Carlos        │  │
│  │                            │  │
│  │ [Confirmar] [Re-agendar]   │  │
│  │ [Cancelar]                 │  │
│  └────────────────────────────┘  │
│                                  │
│  Historial:                      │
│  ● 01 Abr — Corte — María       │
│  ● 15 Mar — Color — Laura       │
└──────────────────────────────────┘
```

---

## 4. Módulo: Dashboard — Vista por Perfil

### 4.1 Dashboard Dueño — Centro de Comando

El dashboard del dueño es la **vitrina de todo el negocio en tiempo real**.

```
┌──────────────────────────────────────────────────────────────────┐
│  DASHBOARD — Barbería Don Carlos              [Hoy] [Semana] [Mes]│
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─ KPIs Principales ───────────────────────────────────────┐    │
│  │  Citas Hoy    Ingresos Hoy   Ocupación    No-Shows      │    │
│  │  ████ 12      ████ $185K     ████ 78%     ████ 2        │    │
│  │  +3 vs ayer   +12% vs sem    ↑ 5%         ↓ 1           │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─ Mapa de Sillones (Live) ────────────────────────────────┐    │
│  │                                                          │    │
│  │   [S1 🟢]   [S2 🔴]   [S3 ⚪]   [S4 🟢]               │    │
│  │   María      Carlos    Vacante    Laura                  │    │
│  │   Libre      Atendiendo           Libre en 15min         │    │
│  │                                                          │    │
│  │   🟢 Disponible  🔴 Ocupado  ⚪ Sin asignar  🟡 Pausa   │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─ Fuentes de Ingreso RRSS (Live) ─────────────────────────┐    │
│  │                                                          │    │
│  │  WhatsApp IA    Instagram IA    TikTok     Web Directa   │    │
│  │  ████ 45        ████ 23         ████ 8     ████ 12       │    │
│  │  leads hoy      leads hoy       leads      reservas      │    │
│  │                                                          │    │
│  │  Conversión IA: 34% (leads → citas agendadas)            │    │
│  │  Conversión Manual: 52%                                   │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─ Feed de Actividad IA (Realtime) ────────────────────────┐    │
│  │  ● 10:02 — IA agendó a Claudia (WhatsApp) con María     │    │
│  │  ● 09:45 — IA respondió consulta de precios (Instagram)  │    │
│  │  ● 09:30 — IA re-agendó a Pedro de 15:00 a 16:00        │    │
│  │  ● 09:12 — IA creó lead: Ana (TikTok DM)                │    │
│  │  ● 08:55 — IA envió recordatorio a 8 clientes de hoy    │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─ Atribución: Humano vs IA ────────────────────────────────┐   │
│  │                                                           │   │
│  │  [Gráfico de barras apiladas — últimos 7 días]            │   │
│  │                                                           │   │
│  │  Agendados por IA: ████████████ 67%                       │   │
│  │  Agendados manual: ████████ 33%                           │   │
│  │                                                           │   │
│  │  Contactos creados por IA: 23                             │   │
│  │  Contactos creados manual: 11                             │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─ Rendimiento por Profesional ─────────────────────────────┐   │
│  │  María  — 8 citas | $120K | 92% ocupación | 0 no-shows   │   │
│  │  Carlos — 6 citas | $85K  | 78% ocupación | 1 no-show    │   │
│  │  Laura  — 4 citas | $62K  | 65% ocupación | 1 no-show    │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─ Insights IA del Día ─────────────────────────────────────┐   │
│  │  💡 "Los martes tienes 25% menos ocupación que los lunes. │   │
│  │     Sugerencia: lanzar promo 'Martes 2x1 en barba'"      │   │
│  │  📈 "María ha incrementado su ticket promedio 15% este    │   │
│  │     mes gracias al upselling de tratamientos"              │   │
│  │  ⚠️ "3 clientes frecuentes no han reservado en 30+ días.  │   │
│  │     ¿Activar campaña de reactivación?"                    │   │
│  └───────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### 4.2 Dashboard Profesional

```
┌──────────────────────────────────────────────────┐
│  MI RESUMEN — María González           [Semana ▼]│
├──────────────────────────────────────────────────┤
│                                                  │
│  Hoy: 8 citas | $120K | Próxima: 10:30 (Corte)  │
│                                                  │
│  Esta semana:                                    │
│  ● Citas completadas: 32                         │
│  ● Ingresos generados: $480K                     │
│  ● Nuevos clientes: 5                            │
│  ● Clientes que repitieron: 18                   │
│                                                  │
│  Mi balance con el salón:                        │
│  Arriendo: $150K/mes | Pagado: $75K | Debe: $75K │
│  Próximo corte: 30 Abril                         │
│                                                  │
│  IA dice:                                        │
│  "Tu cliente frecuente Marta no ha reservado     │
│   en 3 semanas. ¿Le envío un mensaje?"           │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 5. Módulo: Sillones — Configuración Espacial

### 5.1 Editor Visual de Sillones

Herramienta drag-and-drop para que el dueño ubique los puestos de atención en un plano.

```
┌─────────────────────────────────────────────────────────────┐
│  CONFIGURAR MI SALÓN                                        │
│                                                             │
│  ┌─── Plano del Salón (drag & drop) ───────────────────┐   │
│  │                                                      │   │
│  │   ┌─────┐         ┌─────┐         ┌─────┐           │   │
│  │   │ S1  │         │ S2  │         │ S3  │           │   │
│  │   │María│         │Libre│         │Laura│           │   │
│  │   └─────┘         └─────┘         └─────┘           │   │
│  │                                                      │   │
│  │              ┌─────┐         ┌─────┐                 │   │
│  │              │ S4  │         │ S5  │                 │   │
│  │              │Carlos         │Libre│                 │   │
│  │              └─────┘         └─────┘                 │   │
│  │                                                      │   │
│  │   [Entrada]                          [Lavado]        │   │
│  │                                      [Caja]          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  Sillones: 5 configurados                                   │
│  Ocupados: 3 | Libres: 2                                    │
│                                                             │
│  [+ Agregar Sillón]  [Editar Arriendos]                     │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Configuración por Sillón

Al hacer click en un sillón:
```
┌───────────────────────────────────────────┐
│  Sillón #1 — María González               │
│                                           │
│  Estado: 🟢 Activo                        │
│  Profesional: María González              │
│  Desde: 01/03/2026                        │
│                                           │
│  Contrato de Arriendo:                    │
│  ● Modalidad: Mixto                       │
│  ● Fijo: $80.000/mes                      │
│  ● Variable: 15% sobre ventas             │
│  ● Frecuencia cobro: Quincenal            │
│  ● Productos: Usa propios ✅              │
│  ● Productos del salón: No ❌             │
│                                           │
│  Balance actual: -$40.000 (debe)          │
│  Próximo corte: 30/04/2026               │
│                                           │
│  [Ver Agenda]  [Ver Historial Pagos]      │
│  [Editar Contrato]  [Generar Invitación]  │
└───────────────────────────────────────────┘
```

### 5.3 Modelo de Datos — Nuevas Tablas Requeridas

```sql
-- Tabla: organizaciones / salones
CREATE TABLE brb_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES brb_profiles(id) NOT NULL,
  name TEXT NOT NULL,
  rut TEXT UNIQUE,                        -- RUT del negocio (validación)
  business_type TEXT CHECK (business_type IN (
    'barberia', 'peluqueria', 'centro_estetica', 'centro_belleza', 'independiente', 'otro'
  )),
  phone_whatsapp TEXT,                     -- Número WhatsApp del salón (agente IA)
  address TEXT,
  is_home_based BOOLEAN DEFAULT false,
  opening_hours JSONB,                     -- { "mon": { "open": "09:00", "close": "19:00" }, ... }
  email_domain TEXT,                       -- Para auto-match de correos corporativos
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: sillones / puestos de atención
CREATE TABLE brb_chairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES brb_organizations(id) ON DELETE CASCADE,
  label TEXT NOT NULL,                     -- "Sillón 1", "Puesto A"
  position_x FLOAT DEFAULT 0,             -- Para el editor visual
  position_y FLOAT DEFAULT 0,
  assigned_barber_id UUID REFERENCES brb_profiles(id),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: configuración de arriendo por sillón
CREATE TABLE brb_rental_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chair_id UUID REFERENCES brb_chairs(id) ON DELETE CASCADE,
  barber_id UUID REFERENCES brb_profiles(id),
  modality TEXT CHECK (modality IN ('fixed', 'percentage', 'mixed')),
  fixed_amount DECIMAL(10,2) DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,       -- ej: 15.00 = 15%
  billing_frequency TEXT CHECK (billing_frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
  barber_uses_own_products BOOLEAN DEFAULT true,
  barber_uses_salon_products BOOLEAN DEFAULT false,
  salon_product_surcharge DECIMAL(10,2) DEFAULT 0, -- Cargo extra por uso de productos del salón
  start_date DATE NOT NULL,
  end_date DATE,                           -- NULL = indefinido
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: solicitudes de unión al salón
CREATE TABLE brb_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES brb_organizations(id),
  requester_id UUID REFERENCES brb_profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  invite_code TEXT,                        -- Si fue por código de invitación
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Tabla: códigos de invitación
CREATE TABLE brb_invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES brb_organizations(id),
  code TEXT UNIQUE NOT NULL,               -- "BRB-X7K2"
  chair_id UUID REFERENCES brb_chairs(id), -- Pre-asigna sillón
  used_by UUID REFERENCES brb_profiles(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 6. Módulo: CRM — Contactos Inteligentes

### 6.1 Creación Rápida de Contactos

**Problema:** La estilista cierra una cita por WhatsApp/audio y necesita registrar al cliente en segundos.

**Solución — 3 vías de ingreso rápido:**

| Vía | Flujo | Fricción |
|---|---|---|
| **Pegar número** | Copia número de WhatsApp → pega en el campo → si existe muestra datos, si no abre mini-form | 5 segundos |
| **Compartir contacto** | Desde el celular, "Compartir contacto" → la PWA recibe el vCard → extrae nombre y teléfono | 3 segundos |
| **Desde agendamiento** | Al agendar, si el número no existe, crea el contacto inline | 0 segundos extra |

### 6.2 Modelo de Datos — Enriquecimiento del CRM

```sql
-- Agregar columnas a brb_customers
ALTER TABLE brb_customers ADD COLUMN
  full_name TEXT,
  source TEXT CHECK (source IN ('whatsapp_ia', 'instagram_ia', 'tiktok_ia', 'manual', 'web', 'referral')),
  org_id UUID REFERENCES brb_organizations(id),
  preferred_barber_id UUID REFERENCES brb_profiles(id),
  last_visit_at TIMESTAMPTZ,
  tags TEXT[],                             -- ['vip', 'frecuente', 'nuevo']
  instagram_handle TEXT,
  birthday DATE;
```

### 6.3 IA en CRM

| Capacidad IA | Descripción |
|---|---|
| **Auto-clasificación** | Al crear contacto, la IA clasifica: nuevo / recurrente / VIP / en riesgo |
| **Detección de churn** | Si un cliente frecuente no reserva en X días → alerta + sugerencia de campaña |
| **Enriquecimiento** | A partir de conversaciones WhatsApp, la IA extrae: preferencias, cumpleaños mencionado, profesional favorito |
| **Scoring** | Score de valor del cliente basado en: frecuencia, ticket promedio, puntualidad, referidos |

---

## 7. Módulo: Finanzas — Modelo de Arriendo Variable

### 7.1 Liquidación Automática

El sistema calcula automáticamente basándose en `brb_rental_configs`:

```
Ejemplo: María — Arriendo Mixto — Quincenal
─────────────────────────────────────────────
Fijo:     $80.000
Variable: 15% de ventas del período

Ventas 1-15 Abril:
  32 cortes × $15.000 = $480.000
  Variable: $480.000 × 15% = $72.000

Total a pagar: $80.000 + $72.000 = $152.000
Pagado:    $75.000
Saldo:     $77.000
```

### 7.2 Datos IA en Finanzas

| Dato IA | Descripción |
|---|---|
| Proyección de ingresos | Basado en agenda confirmada de la semana |
| Alerta de morosidad | Si un profesional acumula > 2 períodos sin pago |
| Comparativa de rendimiento | Ingresos por sillón, margen por modalidad |
| Sugerencia de precios | "El corte fade tiene 40% más demanda que el corte clásico. Sugiero ajustar precio" |

---

## 8. IA Vigilante — Concepto Transversal

### 8.1 Principio
La IA no es un módulo aislado. Es una **capa de inteligencia** que observa cada acción en cada módulo y genera:
- **Alertas** (reactivas): algo pasó que requiere atención
- **Insights** (analíticos): patrones detectados
- **Sugerencias** (proactivas): acciones recomendadas
- **Automatizaciones** (autónomas): acciones que ejecuta sola (con permiso)

### 8.2 Mapa de Vigilancia IA por Módulo

| Módulo | La IA observa... | La IA sugiere/actúa... |
|---|---|---|
| **Agenda** | Huecos, cancelaciones, no-shows, horarios pico | Campañas last-minute, recordatorios, re-agendamiento |
| **CRM** | Clientes inactivos, patrones de visita, preferencias | Reactivación, upselling, felicitaciones cumpleaños |
| **Finanzas** | Tendencias de ingreso, morosidad, márgenes | Ajuste de precios, alertas de cobro, proyecciones |
| **Sillones** | Ocupación por sillón, rotación de profesionales | Optimización de asignación, alertas de sillones vacíos |
| **WhatsApp/RRSS** | Volumen de leads, tasa de conversión, sentimiento | Optimización de respuestas, escalamiento a humano |

### 8.3 Feed de Actividad IA (Componente Global)

Visible en todos los módulos como un panel lateral colapsable:

```
┌─ Actividad IA ──────────────────────┐
│ ● Pulse animado (live)              │
│                                     │
│ Hace 2 min:                         │
│ "Agendé a Claudia M. con María     │
│  para mañana 10:30 (vía WhatsApp)"  │
│                                     │
│ Hace 15 min:                        │
│ "Respondí consulta de precios       │
│  a @juanito_style (Instagram)"      │
│                                     │
│ Hace 1 hora:                        │
│ "Detecté que Pedro canceló 3 veces  │
│  este mes. Lo marqué como           │
│  'requiere seña obligatoria'"       │
│                                     │
│ [Ver todo el historial →]           │
└─────────────────────────────────────┘
```

### 8.4 Observabilidad con Langfuse
- **Instancia**: Autohosteada (Local/Docker).
- **Integración**: Los trazos (traces) de cada interacción con la IA (Vercel AI SDK) se enviarán a Langfuse para evaluar latencia, costo y calidad de respuesta.
- **Claves**: Se usarán `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY` y `LANGFUSE_HOST` en el `.env`.

### 8.5 Tabla de Logs IA

```sql
CREATE TABLE brb_ai_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES brb_organizations(id),
  module TEXT CHECK (module IN ('agenda', 'crm', 'finanzas', 'sillones', 'whatsapp', 'instagram', 'tiktok')),
  action_type TEXT CHECK (action_type IN ('alert', 'insight', 'suggestion', 'automation')),
  action TEXT NOT NULL,                    -- Descripción legible
  metadata JSONB,                          -- Datos estructurados del evento
  target_user_id UUID REFERENCES brb_profiles(id), -- ¿A quién le interesa?
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 9. Integraciones RRSS — Fuentes de Ingreso

### 9.1 Canales de Entrada

| Canal | Input | Agente IA | Output |
|---|---|---|---|
| **WhatsApp** (principal) | Mensajes, audios, contactos compartidos | Agente conversacional 24/7 | Citas agendadas, leads creados, recordatorios |
| **Instagram** | DMs, comentarios, Stories replies | Agente que responde y deriva | Leads calificados, citas |
| **TikTok** | Comentarios, DMs | Agente básico + link a WhatsApp | Leads |
| **Web directa** | Formulario de reserva público | Auto-agendamiento | Citas con pago de seña |

### 9.2 Dashboard de RRSS (Vista Dueño)

```
┌─ Rendimiento de Canales — Últimos 7 días ──────────────────┐
│                                                            │
│  Canal         Leads   Agendados   Conversión   Ingresos   │
│  ─────────────────────────────────────────────────────────  │
│  WhatsApp IA    45       28          62%         $420K     │
│  Instagram IA   23       11          48%         $165K     │
│  TikTok          8        3          38%          $45K     │
│  Web directa    12       10          83%         $150K     │
│  Manual prof.   34       34         100%         $510K     │
│  ─────────────────────────────────────────────────────────  │
│  TOTAL         122       86          70%        $1.290K    │
│                                                            │
│  [Gráfico de tendencia semanal]                            │
│  [Gráfico de embudo: Lead → Contacto → Cita → Pago]       │
└────────────────────────────────────────────────────────────┘
```

---

## 10. Notificaciones y Alertas

### 10.1 Sistema de Alertas en Tiempo Real

Usando **Supabase Realtime** + toasts/push notifications:

| Evento | Destinatario | Canal |
|---|---|---|
| Nueva cita agendada (IA o manual) | Profesional + Dueño | Push + Toast in-app |
| Cliente nuevo creado | Profesional | Toast in-app |
| Solicitud de unión al salón | Dueño | Push + Email |
| Cita cancelada | Profesional + Dueño | Push + Toast |
| Pago recibido | Dueño + Profesional | Push |
| Recordatorio de cita (24h antes) | Cliente | WhatsApp |
| Recordatorio de cita (1h antes) | Cliente + Profesional | WhatsApp + Push |
| No-show detectado | Profesional + Dueño | Toast + registro IA |
| Morosidad detectada | Dueño | Push + alerta dashboard |

---

## 11. Diseño UX/UI — Principios Rectores

### 11.1 Filosofía "App del Futuro 2026"

| Principio | Implementación |
|---|---|
| **Glassmorphism** | Paneles con `backdrop-blur`, bordes `border-white/10`, fondos `bg-white/5` |
| **Micro-animaciones** | Framer Motion en transiciones de página, entrada de cards, hover states |
| **Dark-first** | Tema oscuro como default (ya implementado), light mode como opción |
| **Bento Grid** | Layout asimétrico tipo bento box para dashboards (ya iniciado) |
| **Datos vivos** | Números que se actualizan en tiempo real con animaciones de conteo |
| **Pulse indicators** | Puntos animados `animate-pulse` para indicar actividad en vivo de la IA |
| **Cero fricción** | Máximo 2 taps para cualquier acción frecuente |
| **Mobile-first para profesionales** | La vista del barbero/estilista se diseña primero para móvil |
| **Desktop-first para dueños** | La vista del dueño aprovecha pantallas grandes con bento grids |

### 11.2 Paleta de Colores Sugerida

| Uso | Color | Token |
|---|---|---|
| Primary (acento) | Amber/Gold `#F59E0B` | `--primary` |
| Background | Near-black `#0A0A0B` | `--background` |
| Surface | Dark glass `rgba(255,255,255,0.05)` | `--card` |
| Success | Emerald `#10B981` | `--success` |
| Danger | Rose `#F43F5E` | `--destructive` |
| IA accent | Cyan/Electric blue `#06B6D4` | `--ai-accent` |
| Text primary | White 90% `rgba(255,255,255,0.9)` | `--foreground` |
| Text muted | White 50% `rgba(255,255,255,0.5)` | `--muted-foreground` |

### 11.3 Tipografía

| Elemento | Font | Peso |
|---|---|---|
| Headings | Inter | 700-900 (bold/black) |
| Body | Inter | 400 |
| Números/KPIs | JetBrains Mono o Geist Mono | 700 |
| Badges/Tags | Inter | 500 (medium) |

---

## 12. Estructura de Archivos — Nuevos Módulos

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx          # Existente — expandir
│   │   ├── agenda/page.tsx             # Existente — expandir
│   │   ├── crm/page.tsx               # Existente — expandir
│   │   ├── finanzas/page.tsx           # Existente — expandir
│   │   ├── sillones/page.tsx           # Existente — expandir
│   │   └── configuracion/page.tsx      # NUEVO — Config del salón
│   ├── onboarding/
│   │   ├── page.tsx                    # NUEVO — Router de onboarding
│   │   ├── owner/page.tsx              # NUEVO — Wizard dueño
│   │   ├── professional/page.tsx       # NUEVO — Wizard profesional
│   │   └── components/
│   │       ├── step-indicator.tsx       # Progress bar del wizard
│   │       ├── business-type-selector.tsx
│   │       ├── chair-count-stepper.tsx
│   │       ├── rental-config-form.tsx
│   │       └── salon-summary-card.tsx
│   ├── auth/                           # Existente
│   ├── login/                          # Existente
│   └── reservar/                       # Existente
├── modules/
│   ├── agenda/                         # Existente — expandir
│   ├── crm/                            # Existente — expandir
│   ├── finanzas/                       # Existente — expandir
│   ├── sillones/                       # Existente — expandir
│   ├── onboarding/                     # NUEVO
│   │   ├── actions.ts                  # Server actions para onboarding
│   │   ├── schema.ts                   # Validación Zod
│   │   └── utils.ts
│   ├── organizations/                  # NUEVO
│   │   ├── actions.ts
│   │   ├── schema.ts
│   │   └── queries.ts
│   ├── notifications/                  # NUEVO
│   │   ├── actions.ts
│   │   └── realtime.ts
│   └── ai-monitor/                     # NUEVO
│       ├── actions.ts                  # Log de actividad IA
│       ├── insights.ts                 # Motor de insights
│       └── schema.ts
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx                 # Existente
│   │   └── ai-activity-panel.tsx       # NUEVO — Panel lateral de actividad IA
│   ├── ui/                             # Existente (shadcn)
│   ├── agenda/
│   │   ├── quick-book-dialog.tsx       # NUEVO — Agendamiento rápido
│   │   ├── timeline-view.tsx           # NUEVO — Vista timeline multi-sillón
│   │   └── appointment-card.tsx        # NUEVO
│   ├── dashboard/
│   │   ├── kpi-card.tsx                # NUEVO
│   │   ├── channel-stats.tsx           # NUEVO — Stats por RRSS
│   │   ├── chair-map-live.tsx          # NUEVO — Mapa de sillones live
│   │   └── ai-feed.tsx                 # NUEVO
│   └── sillones/
│       ├── chair-editor.tsx            # NUEVO — Editor drag & drop
│       ├── chair-detail-sheet.tsx      # NUEVO
│       └── rental-config-form.tsx      # NUEVO
└── types/
    ├── supabase.ts                     # Existente — regenerar con nuevas tablas
    └── enums.ts                        # NUEVO — tipos compartidos
```

---

## 13. Priorización — Roadmap de Implementación

### Fase 1 — Fundación Organizacional (Sprint actual)
1. Migración SQL: `brb_organizations`, `brb_chairs`, `brb_rental_configs`, `brb_join_requests`, `brb_invite_codes`
2. Agregar `org_id` a `brb_profiles` y actualizar RLS
3. Flujo de onboarding completo (Owner + Professional)
4. Detección de dominio de email

### Fase 2 — Agenda Diferenciada por Rol
1. Vista Dueño: timeline multi-sillón con agenda global
2. Vista Profesional: agenda personal mobile-first con "Agendar Rápido"
3. Integración WhatsApp para notificación de citas
4. Creación rápida de contactos desde agenda

### Fase 3 — Dashboard Inteligente
1. KPIs en tiempo real (Supabase Realtime)
2. Mapa de sillones live
3. Feed de actividad IA
4. Stats de canales RRSS

### Fase 4 — Sillones y Finanzas B2B
1. Editor visual de sillones (drag & drop)
2. Configuración de contratos de arriendo
3. Liquidación automática
4. Sistema de invitaciones

### Fase 5 — IA Vigilante
1. `brb_ai_activity_log` + panel lateral global
2. Motor de insights (huecos, churn, proyecciones)
3. Alertas y sugerencias proactivas
4. Atribución Humano vs IA

### Fase 6 — Integraciones RRSS
1. Agente WhatsApp completo (Meta Cloud API)
2. Agente Instagram (Meta Graph API)
3. Dashboard unificado de canales
4. Embudo de conversión cross-channel

---

## 14. Métricas de Éxito

| Métrica | Target | Cómo se mide |
|---|---|---|
| Tiempo de onboarding (dueño) | < 3 minutos | Timestamp inicio → fin wizard |
| Tiempo de agendamiento rápido | < 10 segundos | Timestamp abrir dialog → confirmar |
| % citas agendadas por IA | > 50% | `brb_appointments.source` |
| Tasa de no-show | < 10% | Citas `cancelled`/`no_show` vs total |
| NPS del profesional | > 8/10 | Encuesta in-app trimestral |
| Ocupación promedio de sillones | > 75% | Horas ocupadas / horas disponibles |

---

> Este plan es un documento vivo. Cada fase se detallará en su propio plan de implementación técnica antes de comenzar el desarrollo.
