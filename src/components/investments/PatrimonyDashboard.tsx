import { TrendingUp, Plus, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PatrimonyDashboardProps {
  totalValue: number;
  isValidAllocation: boolean;
  onNewContribution: () => void;
}

export function PatrimonyDashboard({ 
  totalValue, 
  isValidAllocation,
  onNewContribution 
}: PatrimonyDashboardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Patrimônio Total</p>
              <p className="text-3xl font-bold text-foreground">
                {formatCurrency(totalValue)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between h-full">
            <div className="flex-1">
              {!isValidAllocation && (
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">Metas não somam 100%</span>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Simule um novo aporte e veja onde investir
              </p>
            </div>
            <Button onClick={onNewContribution} className="ml-4">
              <Plus className="h-4 w-4 mr-2" />
              Novo Aporte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
