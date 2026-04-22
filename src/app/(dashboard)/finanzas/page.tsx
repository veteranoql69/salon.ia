import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FinanzasPlaceholderPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl min-h-full">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-1">
          Finanzas
        </h1>
        <p className="text-muted-foreground text-lg">
          Historial de pagos, ingresos por señas y reportes financieros.
        </p>
      </div>
      <Card className="bg-background/60 backdrop-blur-xl border-white/10 shadow-2xl rounded-3xl">
        <CardHeader>
          <CardTitle className="text-xl font-normal text-muted-foreground">Configurado en Backend (Sprint 3)</CardTitle>
        </CardHeader>
        <CardContent>
          <p>La lógica de cobro con MercadoPago está activa en las reservas. La visualización de caja y métricas aparecerán aquí.</p>
        </CardContent>
      </Card>
    </div>
  );
}