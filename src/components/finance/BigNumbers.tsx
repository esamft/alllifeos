import { Card, CardContent } from '@/components/ui/card';
import { TrendingDown, Target, Wallet } from 'lucide-react';

interface BigNumbersProps {
  remainingBudget: number;
  totalSpent: number;
  totalBudget: number;
}

export function BigNumbers({ remainingBudget, totalSpent, totalBudget }: BigNumbersProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const isOverBudget = remainingBudget < 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Main Card - Remaining Budget */}
      <Card className={`md:col-span-1 border-2 ${isOverBudget ? 'border-destructive/50 bg-destructive/5' : 'border-primary/50 bg-primary/5'}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-3 ${isOverBudget ? 'bg-destructive/10' : 'bg-primary/10'}`}>
              <Wallet className={`h-6 w-6 ${isOverBudget ? 'text-destructive' : 'text-primary'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Orçamento Restante</p>
              <p className={`text-2xl font-bold ${isOverBudget ? 'text-destructive' : 'text-primary'}`}>
                {formatCurrency(remainingBudget)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Spent */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full p-3 bg-warning/10">
              <TrendingDown className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Gasto no Mês</p>
              <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Budget */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full p-3 bg-secondary">
              <Target className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Tetos</p>
              <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}