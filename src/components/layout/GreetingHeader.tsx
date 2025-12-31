import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function GreetingHeader() {
  const { user } = useAuth();
  const now = new Date();
  const greeting = getGreeting();
  const formattedDate = format(now, "EEEE, d 'de' MMMM", { locale: ptBR });
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  
  // Extract name from email or use generic greeting
  const userName = user?.email?.split('@')[0] || '';
  const displayName = userName ? `, ${userName.charAt(0).toUpperCase() + userName.slice(1)}` : '';

  return (
    <div className="space-y-1">
      <h1 className="text-3xl font-bold tracking-tight">
        {greeting}{displayName}
      </h1>
      <p className="text-muted-foreground">{capitalizedDate}</p>
    </div>
  );
}
