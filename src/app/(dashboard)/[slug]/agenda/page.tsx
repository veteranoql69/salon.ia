'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createAppointment } from '@/modules/agenda/actions'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AgendaDashboardPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [startTime, setStartTime] = useState<string>('09:00')
  const [endTime, setEndTime] = useState<string>('10:00')

  const barberId = "11111111-1111-1111-1111-111111111111"

  const handleBlockTime = async () => {
    if (!date) return
    setLoading(true)

    const [startH, startM] = startTime.split(':')
    const startObj = new Date(date)
    startObj.setHours(parseInt(startH), parseInt(startM), 0, 0)

    const [endH, endM] = endTime.split(':')
    const endObj = new Date(date)
    endObj.setHours(parseInt(endH), parseInt(endM), 0, 0)

    if (endObj <= startObj) {
      toast.error('El fin debe ser mayor al inicio')
      setLoading(false)
      return
    }

    const result = await createAppointment({
      barber_id: barberId,
      customer_id: null,
      start_time: startObj.toISOString(),
      end_time: endObj.toISOString(),
      status: 'blocked'
    })

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Horario bloqueado exitosamente')
      setOpen(false)
    }
    setLoading(false)
  }

  const generateTimeOptions = () => {
    const opts = []
    for (let h = 9; h <= 19; h++) {
      for (let m = 0; m < 60; m += 15) {
        opts.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
      }
    }
    return opts
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mi Agenda</h1>
          <p className="text-muted-foreground">Gestiona tus citas y tu disponibilidad.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button variant="destructive" />}>
            Bloquear Horario Personal
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir Bloqueo de Horario</DialogTitle>
              <DialogDescription>
                Impide que clientes o la Inteligencia Artificial agenden en este tramo.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label>Hora de Inicio</label>
                  <Select value={startTime} onValueChange={(val) => val && setStartTime(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Inicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateTimeOptions().map(t => (
                        <SelectItem key={`start-${t}`} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label>Hora de Fin</label>
                  <Select value={endTime} onValueChange={(val) => val && setEndTime(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Fin" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateTimeOptions().map(t => (
                        <SelectItem key={`end-${t}`} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleBlockTime} disabled={loading} className="w-full">
                {loading ? 'Guardando...' : 'Confirmar Bloqueo'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Calendario</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              locale={es}
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              Citas para {date ? format(date, "EEEE d 'de' MMMM", { locale: es }) : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Las citas conectadas con Supabase y las validaciones de bloqueo aparecerán aquí.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
