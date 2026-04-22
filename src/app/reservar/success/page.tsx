export default function ReservarSuccessPage({
  searchParams,
}: {
  searchParams: { appt_id?: string }
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="max-w-md space-y-4">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <svg className="h-12 w-12 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold">¡Pago Exitoso!</h1>
        <p className="text-muted-foreground">
          Tu reserva ha sido confirmada. Hemos recibido la seña correctamente.
          {searchParams.appt_id && ` (ID Cita: ${searchParams.appt_id})`}
        </p>
        <div className="pt-6">
          <a href="/" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
            Volver al Inicio
          </a>
        </div>
      </div>
    </div>
  )
}