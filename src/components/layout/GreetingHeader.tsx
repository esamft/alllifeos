import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function GreetingHeader() {
  const now = new Date();
  const greeting = getGreeting();
  const formattedDate = format(now, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <div className="space-y-1">
      <h1 className="text-3xl font-bold tracking-tight">{greeting}</h1>
      <p className="text-muted-foreground">{capitalizedDate}</p>
    </div>
  );
}
