import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target } from 'lucide-react';
import { BUDGET_CONSTANTS } from '@/lib/budget-constants';

interface InvestmentGoalTrackerProps {
  investedAmount: number;
  targetAmount?: number;
}

export function InvestmentGoalTracker({ 
  investedAmount, 
  targetAmount = BUDGET_CONSTANTS.INVESTMENT_TARGET 
}: InvestmentGoalTrackerProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const percentage = Math.min((investedAmount / targetAmount) * 100, 100);
  const remaining = Math.max(targetAmount - investedAmount, 0);
  const isComplete = investedAmount >= targetAmount;

  return (
    <Card className={`border-2 ${isComplete ? 'border-green-500/50 bg-green-500/5' : 'border-primary/50 bg-primary/5'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className={`rounded-full p-2 ${isComplete ? 'bg-green-500/10' : 'bg-primary/10'}`}>
            <TrendingUp className={`h-5 w-5 ${isComplete ? 'text-green-500' : 'text-primary'}`} />
          </div>
          <CardTitle className="text-base font-semibold">Meta de Investimento</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <span className={`text-3xl font-bold ${isComplete ? 'text-green-500' : 'text-primary'}`}>
              {formatCurrency(investedAmount)}
            </span>
            <span className="text-muted-foreground text-sm ml-2">
              / {formatCurrency(targetAmount)}
            </span>
          </div>
          <span className={`text-sm font-medium ${isComplete ? 'text-green-500' : 'text-muted-foreground'}`}>
            {percentage.toFixed(0)}%
          </span>
        </div>

        <Progress 
          value={percentage} 
          className={`h-3 ${isComplete ? '[&>div]:bg-green-500' : '[&>div]:bg-primary'}`}
        />

        {!isComplete && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            <span>Faltam {formatCurrency(remaining)} para atingir a meta</span>
          </div>
        )}

        {isComplete && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span>Meta atingida! 🎉</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
