import { Calendar, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Focus() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-1">Início / Agenda</p>
        <h1 className="text-2xl font-bold">Agenda & Foco</h1>
        <p className="text-muted-foreground">Módulo em desenvolvimento</p>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex gap-4 mb-6">
            <div className="p-4 rounded-full bg-muted">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="p-4 rounded-full bg-muted">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Em Breve</h2>
          <p className="text-muted-foreground max-w-md">
            Em breve você poderá gerenciar seu tempo e sessões de foco aqui. 
            Planeje seu dia, defina blocos de Deep Work e acompanhe sua produtividade.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
