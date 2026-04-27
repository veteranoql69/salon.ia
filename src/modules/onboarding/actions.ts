"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { generateSlug } from "@/lib/utils/slug";
import { sendInviteEmail } from "@/lib/email/invite";

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "BRB-";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function generateUniqueSlug(supabase: Awaited<ReturnType<typeof createClient>>, name: string): Promise<string> {
  const base = generateSlug(name)
  const { data } = await supabase
    .from('brb_organizations')
    .select('slug')
    .like('slug', `${base}%`)

  if (!data || data.length === 0) return base

  const existing = data.map((r: { slug: string }) => r.slug)
  if (!existing.includes(base)) return base

  let n = 2
  while (existing.includes(`${base}-${n}`)) n++
  return `${base}-${n}`
}

export async function createOrganizationAction(formData: FormData) {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return { error: "No autorizado" };
  }

  const name = formData.get("name") as string;
  const rut = formData.get("rut") as string;
  const phone = formData.get("phone") as string;
  const businessType = formData.get("businessType") as string;
  const location = formData.get("location") as string;
  const chairsCount = parseInt(formData.get("chairs") as string) || 1;
  const inviteEmails = formData.getAll("inviteEmails") as string[];

  // Ensure brb_profiles row exists before inserting org (FK requirement).
  // Uses admin client to bypass RLS — new users have no profile row yet.
  const admin = createAdminClient();
  const { error: profileUpsertError } = await admin.from("brb_profiles").upsert(
    {
      id: authData.user.id,
      full_name:
        authData.user.user_metadata?.full_name ||
        authData.user.user_metadata?.name ||
        authData.user.email,
      email: authData.user.email,
    },
    { onConflict: "id", ignoreDuplicates: true }
  );
  if (profileUpsertError) {
    console.error("Profile upsert error:", profileUpsertError);
    return { error: "No se pudo crear tu perfil." };
  }

  const slug = await generateUniqueSlug(supabase, name)

  const orgPayload: Record<string, unknown> = {
    owner_id: authData.user.id,
    name,
    slug,
    rut: rut || null,
    phone_whatsapp: phone,
    business_type: businessType,
    address: location || null,
  }

  // 1. Create Organization
  let { data: orgData, error: orgError } = await supabase
    .from("brb_organizations")
    .insert([orgPayload])
    .select()
    .single();

  // If slug column doesn't exist yet (migration pending), retry without it
  if (orgError && (orgError.code === '42703' || orgError.message?.includes('slug'))) {
    const { slug: _slug, ...payloadWithoutSlug } = orgPayload;
    void _slug;
    ({ data: orgData, error: orgError } = await supabase
      .from("brb_organizations")
      .insert([payloadWithoutSlug])
      .select()
      .single());
  }

  if (orgError) {
    console.error("Org Error code:", orgError.code, "| message:", orgError.message, "| details:", orgError.details, "| hint:", orgError.hint);
    return { error: `DB error ${orgError.code}: ${orgError.message}` };
  }

  // 2. Update user profile explicitly to set role to OWNER and associate org
  const { error: profileError } = await supabase
    .from("brb_profiles")
    .update({ 
      role: 'OWNER',
      org_id: orgData.id,
      onboarding_completed: true
    })
    .eq('id', authData.user.id);

  if (profileError) {
    console.error("Profile Error:", profileError);
    return { error: "Organización creada, pero falló la actualización del rol." };
  }

  // 3. Create Chairs based on count
  if (chairsCount > 0) {
    const chairsToInsert = Array.from({ length: chairsCount }).map((_, i) => ({
      org_id: orgData.id,
      label: `Sillón ${i + 1}`
    }));

    const { error: chairsError } = await supabase
      .from("brb_chairs")
      .insert(chairsToInsert);

    if (chairsError) {
      console.error("Chairs error", chairsError);
    }
  }

  // 4. Create invite codes and send emails
  const validEmails = inviteEmails.filter((e) => e && e.includes("@"));
  if (validEmails.length > 0) {
    const { data: ownerProfile } = await supabase
      .from("brb_profiles")
      .select("full_name")
      .eq("id", authData.user.id)
      .maybeSingle();

    const inviterName = ownerProfile?.full_name || authData.user.email || "El dueño";

    for (const email of validEmails) {
      const code = generateInviteCode();
      const { error: inviteInsertError } = await supabase.from("brb_invite_codes").insert({
        org_id: orgData.id,
        code,
        invited_email: email,
        sent_at: new Date().toISOString(),
      });
      if (inviteInsertError) {
        console.error("[invite insert] email:", email, "error:", inviteInsertError);
      }
      const emailResult = await sendInviteEmail({ to: email, inviterName, salonName: name, code });
      if (emailResult?.error) {
        console.error("[sendInviteEmail] failed for", email, emailResult.error);
      } else {
        console.log("[sendInviteEmail] sent to", email);
      }
    }
  }

  return { success: true, orgId: orgData.id, slug: orgData.slug };
}

export async function getInviteInfoAction(code: string) {
  if (!code) return { error: "Código vacío" };
  const admin = createAdminClient();

  const { data: invite } = await admin
    .from("brb_invite_codes")
    .select("org_id")
    .eq("code", code)
    .is("used_by", null)
    .maybeSingle();

  if (!invite) return { error: "Código inválido o ya utilizado" };

  const { data: org } = await admin
    .from("brb_organizations")
    .select("name, slug")
    .eq("id", invite.org_id)
    .maybeSingle();

  if (!org) return { error: "Organización no encontrada" };

  return { name: org.name, slug: org.slug };
}

export async function joinProfessionalAction(formData: FormData) {
  const supabase = await createClient();
  
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return { error: "No autorizado" };
  }

  const inviteCode = formData.get("code") as string;
  if (!inviteCode) return { error: "Código vacío" };

  // 1. Find invite code
  const { data: inviteData, error: inviteErr } = await supabase
    .from("brb_invite_codes")
    .select("*")
    .eq("code", inviteCode)
    .single();

  if (inviteErr || !inviteData) {
    return { error: "Código inválido o expirado." };
  }

  // Check if used
  if (inviteData.used_by) {
    return { error: "Este código ya fue utilizado." };
  }

  // 2. Update profile to BARBER and associate with org
  const { error: profileError } = await supabase
    .from("brb_profiles")
    .update({ 
      role: 'BARBER',
      org_id: inviteData.org_id,
      onboarding_completed: true
    })
    .eq('id', authData.user.id);

  if (profileError) {
    return { error: "No se pudo actualizar el perfil del profesional." };
  }

  // 3. Mark invite as used
  await supabase
    .from("brb_invite_codes")
    .update({ used_by: authData.user.id })
    .eq('id', inviteData.id);

  // If the invite pre-assigned a chair, we could update the chair here too
  if (inviteData.chair_id) {
    await supabase
      .from("brb_chairs")
      .update({ assigned_barber_id: authData.user.id, status: 'occupied' })
      .eq('id', inviteData.chair_id);
  }

  // Fetch org slug for redirect
  const { data: org } = await supabase
    .from('brb_organizations')
    .select('slug')
    .eq('id', inviteData.org_id)
    .maybeSingle()

  return { success: true, slug: org?.slug };
}

export async function joinOrganizationByRutAction(formData: FormData) {
  const supabase = await createClient();
  
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return { error: "No autorizado" };
  }

  const rut = formData.get("rut") as string;
  if (!rut) return { error: "RUT vacío" };

  // 1. Find organization by RUT
  const { data: orgData, error: orgErr } = await supabase
    .from("brb_organizations")
    .select("id, name")
    .eq("rut", rut)
    .single();

  if (orgErr || !orgData) {
    return { error: "No se encontró ningún salón con ese RUT." };
  }

  // 2. Create join request
  const { error: requestErr } = await supabase
    .from("brb_join_requests")
    .insert([
      {
        org_id: orgData.id,
        requester_id: authData.user.id,
        status: 'pending'
      }
    ]);

  if (requestErr) {
    return { error: "Ya has enviado una solicitud a este salón o hubo un error." };
  }

  return { success: true, salonName: orgData.name };
}

export async function createIndependentProfessionalAction(formData: FormData) {
  const supabase = await createClient();
  
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return { error: "No autorizado" };
  }

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;

  const orgName = `${name} - Independiente`
  const slug = await generateUniqueSlug(supabase, orgName)

  // 1. Create a "Personal Organization" for the independent professional
  const { data: orgData, error: orgError } = await supabase
    .from("brb_organizations")
    .insert([
      {
        owner_id: authData.user.id,
        name: orgName,
        slug,
        business_type: 'independiente',
        phone_whatsapp: phone,
      }
    ])
    .select()
    .single();

  if (orgError) {
    return { error: "Error al crear su espacio independiente." };
  }

  // 2. Update profile
  const { error: profileError } = await supabase
    .from("brb_profiles")
    .update({ 
      role: 'BARBER', // They are a barber/professional
      org_id: orgData.id,
      onboarding_completed: true
    })
    .eq('id', authData.user.id);

  if (profileError) {
    return { error: "Error al actualizar su perfil." };
  }

  // 3. Create a default chair for themselves
  await supabase
    .from("brb_chairs")
    .insert([
      {
        org_id: orgData.id,
        label: "Mi Puesto",
        assigned_barber_id: authData.user.id,
        status: 'occupied'
      }
    ]);

  return { success: true, slug: orgData.slug };
}

export async function completeClientOnboardingAction() {
  const supabase = await createClient();
  
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return { error: "No autorizado" };
  }

  const { error: profileError } = await supabase
    .from("brb_profiles")
    .update({ 
      role: 'CLIENT',
      onboarding_completed: true
    })
    .eq('id', authData.user.id);

  if (profileError) {
    return { error: "Error al actualizar su perfil de cliente." };
  }

  return { success: true };
}
