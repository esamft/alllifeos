import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, AlertTriangle } from 'lucide-react';
import { BUDGET_CONSTANTS } from '@/lib/budget-constants';

interface CreditCardMonitorProps {
  totalCreditCardSpending: number;
}

type TrafficLightStatus = 'green' | 'yellow' | 'red';

export function CreditCardMonitor({ totalCreditCardSpending }: CreditCardMonitorProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatus = (): TrafficLightStatus => {
    if (totalCreditCardSpending >= BUDGET_CONSTANTS.CREDIT_CARD_RED_LIMIT) return 'red';
    if (totalCreditCardSpending >= BUDGET_CONSTANTS.CREDIT_CARD_YELLOW_LIMIT) return 'yellow';
    return 'green';
  };

  const status = getStatus();

  const statusConfig = {
    green: {
      bgClass: 'bg-green-500/10 border-green-500/50',
      textClass: 'text-green-600',
      lightClass: 'bg-green-500',
      message: 'Sob controle',
      icon: CreditCard,
    },
    yellow: {
      bgClass: 'bg-yellow-500/10 border-yellow-500/50',
      textClass: 'text-yellow-600',
      lightClass: 'bg-yellow-500',
      message: 'Atenção',
      icon: AlertTriangle,
    },
    red: {
      bgClass: 'bg-red-500/10 border-red-500/50',
      textClass: 'text-red-600',
      lightClass: 'bg-red-500',
      message: 'Alerta Crítico!',
      icon: AlertTriangle,
    },
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  // Calcular porcentagem até o limite vermelho
  const percentage = Math.min((totalCreditCardSpending / BUDGET_CONSTANTS.CREDIT_CARD_RED_LIMIT) * 100, 100);

  return (
    <Card className={`border-2 ${config.bgClass}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`rounded-full p-2 ${config.bgClass}`}>
              <IconComponent className={`h-5 w-5 ${config.textClass}`} />
            </div>
            <CardTitle className="text-base font-semibold">Semáforo do Cartão</CardTitle>
          </div>
          
          {/* Traffic Light Indicator */}
          <div className="flex gap-1.5">
            <div className={`w-4 h-4 rounded-full ${status === 'green' ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-green-500/30'}`} />
            <div className={`w-4 h-4 rounded-full ${status === 'yellow' ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' : 'bg-yellow-500/30'}`} />
            <div className={`w-4 h-4 rounded-full ${status === 'red' ? 'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse' : 'bg-red-500/30'}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between">
          <span className={`text-3xl font-bold ${config.textClass}`}>
            {formatCurrency(totalCreditCardSpending)}
          </span>
          <span className={`text-sm font-semibold ${config.textClass}`}>
            {config.message}
          </span>
        </div>

        {/* Progress bar with color zones */}
        <div className="relative h-3 rounded-full bg-muted overflow-hidden">
          {/* Zone markers */}
          <div 
            className="absolute top-0 h-full w-px bg-yellow-500/50" 
            style={{ left: `${(BUDGET_CONSTANTS.CREDIT_CARD_GREEN_LIMIT / BUDGET_CONSTANTS.CREDIT_CARD_RED_LIMIT) * 100}%` }}
          />
          <div 
            className="absolute top-0 h-full w-px bg-red-500/50" 
            style={{ left: `${(BUDGET_CONSTANTS.CREDIT_CARD_YELLOW_LIMIT / BUDGET_CONSTANTS.CREDIT_CARD_RED_LIMIT) * 100}%` }}
          />
          
          {/* Progress */}
          <div 
            className={`absolute top-0 left-0 h-full transition-all duration-500 ${config.lightClass}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Limits reference */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>🟢 &lt; R$ 5k</span>
          <span>🟡 &gt; R$ 6k</span>
          <span>🔴 ≥ R$ 7.1k</span>
        </div>
      </CardContent>
    </Card>
  );
}
