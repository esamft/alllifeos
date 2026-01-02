import { Card, CardContent } from '@/components/ui/card';
import { TrendingDown, TrendingUp, Wallet, CalendarDays } from 'lucide-react';

interface BudgetSummaryCardsProps {
  totalSpent: number;
  totalBudget: number;
  daysPassed: number;
}

export function BudgetSummaryCards({ totalSpent, totalBudget, daysPassed }: BudgetSummaryCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const remaining = totalBudget - totalSpent;
  const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const dailyAverage = daysPassed > 0 ? totalSpent / daysPassed : 0;

  const isOverBudget = remaining < 0;
  const isWarning = percentUsed > 75 && percentUsed < 100;

  const cards = [
    {
      title: 'Total Gasto',
      value: formatCurrency(totalSpent),
      icon: TrendingDown,
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-500',
    },
    {
      title: 'Restante',
      value: formatCurrency(remaining),
      icon: Wallet,
      iconBg: isOverBudget ? 'bg-red-500/10' : 'bg-green-500/10',
      iconColor: isOverBudget ? 'text-red-500' : 'text-green-500',
      valueColor: isOverBudget ? 'text-red-500' : 'text-green-600',
    },
    {
      title: '% Utilizado',
      value: `${percentUsed.toFixed(1)}%`,
      icon: TrendingUp,
      iconBg: isOverBudget ? 'bg-red-500/10' : isWarning ? 'bg-yellow-500/10' : 'bg-blue-500/10',
      iconColor: isOverBudget ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-blue-500',
      valueColor: isOverBudget ? 'text-red-500' : isWarning ? 'text-yellow-600' : undefined,
    },
    {
      title: 'Média Diária',
      value: formatCurrency(dailyAverage),
      icon: CalendarDays,
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${card.iconBg}`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">{card.title}</p>
                <p className={`text-lg font-bold truncate ${card.valueColor || ''}`}>
                  {card.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
