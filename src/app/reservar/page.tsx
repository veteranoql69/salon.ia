'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createAppointment } from '@/modules/agenda/actions'
import { createPaymentPreference } from '@/modules/finanzas/actions'
import { generateAvailableSlots } from '@/modules/agenda/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function ReservarPage() {
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [loading, setLoading] = useState(false)
  const [slots, setSlots] = useState<{ startTime: Date; endTime: Date; available: boolean }[]>([])
  
  // En un entorno real, barberId vendría de props o parámetros URL
  // Usamos un UUID ficticio válido o un selector
  const barberId = "11111111-1111-1111-1111-111111111111" 

  // Simulación de carga de slots. Debería venir de un Server Component o de una llamada a la API
  const handleDateSelect = async (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    if (!selectedDate) return

    setLoading(true)
    // Simulamos la obtención de turnos (en producción llamaríamos a un Server Action para traer los de la DB)
    const formattedDate = format(selectedDate, 'yyyy-MM-dd')
    
    // Por simplicidad en la UI client, generamos slots ficticios asumiendo que no hay nada agendado
    // Lo ideal: `const appointments = await getAppointments(barberId, formattedDate)`
    const newSlots = generateAvailableSlots(formattedDate, [])
    setSlots(newSlots)
    setLoading(false)
  }

  const handleBooking = async (startTime: Date, endTime: Date) => {
    setLoading(true)
    
    // UUID dummy para el customer (necesita estar en la DB)
    // En real, vendría de la sesión si el B2C está logueado, o se crearía al momento
    const result = await createAppointment({
      barber_id: barberId,
      customer_id: "22222222-2222-2222-2222-222222222222", 
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: 'pending'
    })

    if (result?.error) {
      toast.error(result.error)
      setLoading(false)
    } else if (result?.appointmentId) {
      toast.success('Horario reservado. Redirigiendo al pago de seña...')
      
      // Llamamos al action financiero para generar la preferencia en MercadoPago
      // Se asume un valor de seña fijo para el MVP (ej. $5.000 CLP)
      const paymentResult = await createPaymentPreference(result.appointmentId, 5000)
      
      if (paymentResult?.checkoutUrl) {
        // Redirigimos a MercadoPago
        router.push(paymentResult.checkoutUrl)
      } else {
        toast.error('Ocurrió un error al generar el link de pago.')
        setLoading(false)
      }
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Reserva tu Hora</h1>
        <p className="text-muted-foreground">Selecciona un día y un horario disponible para atenderte.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>1. Selecciona un Día</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              className="rounded-md border"
              locale={es}
              disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Horarios Disponibles</CardTitle>
            <CardDescription>
              {date ? format(date, "EEEE d 'de' MMMM", { locale: es }) : 'Selecciona una fecha primero'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {date && slots.length === 0 && !loading && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Haz click en el día para cargar los horarios.
              </p>
            )}
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-2">
              {slots.map((slot, i) => (
                <Button
                  key={i}
                  variant={slot.available ? "outline" : "secondary"}
                  disabled={!slot.available || loading}
                  className="w-full"
                  onClick={() => handleBooking(slot.startTime, slot.endTime)}
                >
                  {format(slot.startTime, 'HH:mm')}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
