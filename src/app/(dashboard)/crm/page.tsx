import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CrmPlaceholderPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl min-h-full">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-1">
          CRM (Clientes)
        </h1>
        <p className="text-muted-foreground text-lg">
          Gestiona la base de datos de tus clientes y su historial.
        </p>
      </div>
      <Card className="bg-background/60 backdrop-blur-xl border-white/10 shadow-2xl rounded-3xl">
        <CardHeader>
          <CardTitle className="text-xl font-normal text-muted-foreground">Próximamente...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Módulo de gestión de clientes programado para el Sprint 5.</p>
        </CardContent>
      </Card>
    </div>
  );
}