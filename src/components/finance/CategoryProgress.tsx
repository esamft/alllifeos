import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

interface CategoryProgressItem {
  id: string;
  name: string;
  spent: number;
  budget: number;
}

interface CategoryProgressProps {
  categories: CategoryProgressItem[];
}

export function CategoryProgress({ categories }: CategoryProgressProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progresso por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Nenhuma categoria criada ainda. Adicione um gasto para começar!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Progresso por Categoria</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map((category) => {
          const percentage = category.budget > 0 
            ? Math.min((category.spent / category.budget) * 100, 100) 
            : (category.spent > 0 ? 100 : 0);
          const isOverBudget = category.spent > category.budget && category.budget > 0;
          const hasNoBudget = category.budget === 0;

          return (
            <div key={category.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{category.name}</span>
                  {hasNoBudget && (
                    <Badge variant="outline" className="text-xs text-warning border-warning">
                      Sem teto
                    </Badge>
                  )}
                  {isOverBudget && (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(category.spent)} / {formatCurrency(category.budget)}
                </span>
              </div>
              <div className="relative">
                <Progress 
                  value={percentage} 
                  className={`h-2 ${isOverBudget ? '[&>div]:bg-destructive' : '[&>div]:bg-primary'}`}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}