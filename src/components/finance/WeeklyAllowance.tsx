import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Wallet, Calendar, TrendingDown, TrendingUp } from 'lucide-react';
import { BUDGET_CONSTANTS } from '@/lib/budget-constants';

interface WeeklyAllowanceProps {
  freeSpendingThisMonth: number;
  currentWeekOfMonth: number;
}

export function WeeklyAllowance({ 
  freeSpendingThisMonth,
  currentWeekOfMonth,
}: WeeklyAllowanceProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const weeklyBudget = BUDGET_CONSTANTS.FREE_SPENDING_WEEKLY;
  const monthlyBudget = BUDGET_CONSTANTS.FREE_SPENDING_MONTHLY;
  
  // Orçamento acumulado até a semana atual
  const budgetUntilNow = weeklyBudget * currentWeekOfMonth;
  
  // Diferença entre orçamento e gasto
  const difference = budgetUntilNow - freeSpendingThisMonth;
  const isOnTrack = difference >= 0;
  
  // Quanto já usou do mês
  const monthlyPercentage = Math.min((freeSpendingThisMonth / monthlyBudget) * 100, 100);
  
  // Quanto deveria ter usado até agora
  const expectedPercentage = (currentWeekOfMonth / 4) * 100;

  return (
    <Card className="border-2 border-accent/50 bg-accent/5">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="rounded-full p-2 bg-accent/10">
            <Wallet className="h-5 w-5 text-accent-foreground" />
          </div>
          <CardTitle className="text-base font-semibold">Gastos Livres</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weekly breakdown */}
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((week) => {
            const weekBudget = weeklyBudget;
            const isPast = week < currentWeekOfMonth;
            const isCurrent = week === currentWeekOfMonth;
            const isFuture = week > currentWeekOfMonth;
            
            return (
              <div 
                key={week}
                className={`text-center p-2 rounded-lg transition-all ${
                  isCurrent 
                    ? 'bg-primary/10 border-2 border-primary ring-2 ring-primary/20' 
                    : isPast 
                      ? 'bg-muted/50' 
                      : 'bg-muted/20 opacity-50'
                }`}
              >
                <p className="text-xs text-muted-foreground">Sem {week}</p>
                <p className={`text-sm font-semibold ${isCurrent ? 'text-primary' : ''}`}>
                  {formatCurrency(weekBudget)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Current status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Semana {currentWeekOfMonth} de 4</span>
            </div>
            <span className="font-medium">
              Orçamento até agora: {formatCurrency(budgetUntilNow)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Gasto até agora:</span>
            <span className="font-semibold">{formatCurrency(freeSpendingThisMonth)}</span>
          </div>

          <Progress 
            value={monthlyPercentage} 
            className={`h-2 ${
              freeSpendingThisMonth > budgetUntilNow 
                ? '[&>div]:bg-destructive' 
                : '[&>div]:bg-primary'
            }`}
          />
          
          {/* Expected marker */}
          <div className="relative h-1">
            <div 
              className="absolute top-0 w-0.5 h-3 -mt-2 bg-muted-foreground/50 rounded"
              style={{ left: `${expectedPercentage}%` }}
            />
          </div>
        </div>

        {/* Status indicator */}
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          isOnTrack ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'
        }`}>
          {isOnTrack ? (
            <>
              <TrendingDown className="h-5 w-5" />
              <span className="text-sm font-medium">
                Folga de {formatCurrency(difference)} esta semana
              </span>
            </>
          ) : (
            <>
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-medium">
                Excedeu {formatCurrency(Math.abs(difference))} do previsto
              </span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
