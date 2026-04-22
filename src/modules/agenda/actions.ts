'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CreateAppointmentInput } from './schema'

export async function createAppointment(data: CreateAppointmentInput) {
  const supabase = await createClient()

  // Verify concurrency: Check if the slot is still fully available
  // This looks for any overlapping appointment that is NOT cancelled
  const { data: overlapping, error: checkError } = await supabase
    .from('brb_appointments')
    .select('id')
    .eq('barber_id', data.barber_id)
    .neq('status', 'cancelled')
    // We check if the requested time overlaps with any existing time:
    // existing_start < new_end AND existing_end > new_start
    .lt('start_time', data.end_time)
    .gt('end_time', data.start_time)
    .limit(1)

  if (checkError) {
    return { error: 'Error al verificar disponibilidad' }
  }

  if (overlapping && overlapping.length > 0) {
    return { error: 'El horario seleccionado ya no está disponible. Alguien más lo reservó.' }
  }

  // Insert the appointment
  const { data: newAppt, error: insertError } = await supabase
    .from('brb_appointments')
    .insert([data])
    .select('id')
    .single()

  if (insertError) {
    return { error: insertError.message }
  }

  revalidatePath('/agenda')
  revalidatePath('/reservar')
  return { success: true, appointmentId: newAppt.id }
}

export async function getAppointments(barberId: string, date: string) {
  const supabase = await createClient()

  const startDate = new Date(`${date}T00:00:00.000Z`).toISOString()
  const endDate = new Date(`${date}T23:59:59.999Z`).toISOString()

  const { data, error } = await supabase
    .from('brb_appointments')
    .select('*')
    .eq('barber_id', barberId)
    .gte('start_time', startDate)
    .lte('end_time', endDate)

  if (error) {
    throw new Error(error.message)
  }

  return data
}
