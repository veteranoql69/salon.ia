"use server";

import { createClient } from "@/lib/supabase/server";

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

  // 1. Create Organization
  const { data: orgData, error: orgError } = await supabase
    .from("brb_organizations")
    .insert([
      {
        owner_id: authData.user.id,
        name,
        rut: rut || null,
        phone_whatsapp: phone,
        business_type: businessType,
        address: location || null,
      }
    ])
    .select()
    .single();

  if (orgError) {
    console.error("Org Error:", orgError);
    return { error: "Hubo un inconveniente al registrar su salón. Verifique si el nombre o RUT ya están en uso." };
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

  return { success: true, orgId: orgData.id };
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

  return { success: true };
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
  const specialty = formData.get("specialty") as string;
  const phone = formData.get("phone") as string;

  // 1. Create a "Personal Organization" for the independent professional
  const { data: orgData, error: orgError } = await supabase
    .from("brb_organizations")
    .insert([
      {
        owner_id: authData.user.id,
        name: `${name} - Independiente`,
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

  return { success: true };
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
