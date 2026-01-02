import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Home, Sparkles } from 'lucide-react';
import { CategoryGroup, CATEGORY_GROUP_LABELS } from '@/lib/budget-constants';

interface CategoryItem {
  id: string;
  name: string;
  spent: number;
  budget: number;
}

interface ExpenseContainerProps {
  group: CategoryGroup;
  categories: CategoryItem[];
  cap: number;
}

export function ExpenseContainer({ group, categories, cap }: ExpenseContainerProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const overallPercentage = cap > 0 ? Math.min((totalSpent / cap) * 100, 100) : 0;
  const isOverBudget = totalSpent > cap;

  const groupConfig = {
    essenciais: {
      icon: Home,
      colorClass: 'text-blue-600',
      bgClass: 'bg-blue-500/10',
      borderClass: 'border-blue-500/30',
      progressClass: '[&>div]:bg-blue-500',
    },
    estilo_de_vida: {
      icon: Sparkles,
      colorClass: 'text-purple-600',
      bgClass: 'bg-purple-500/10',
      borderClass: 'border-purple-500/30',
      progressClass: '[&>div]:bg-purple-500',
    },
  };

  const config = groupConfig[group];
  const IconComponent = config.icon;

  return (
    <Card className={`border-2 ${config.borderClass} ${config.bgClass}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`rounded-full p-2 ${config.bgClass}`}>
              <IconComponent className={`h-5 w-5 ${config.colorClass}`} />
            </div>
            <CardTitle className="text-base font-semibold">
              {CATEGORY_GROUP_LABELS[group]}
            </CardTitle>
          </div>
          <Badge variant={isOverBudget ? 'destructive' : 'secondary'} className="text-xs">
            Teto: {formatCurrency(cap)}
          </Badge>
        </div>
        
        {/* Overall progress */}
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total gasto</span>
            <span className={`font-medium ${isOverBudget ? 'text-destructive' : ''}`}>
              {formatCurrency(totalSpent)} / {formatCurrency(cap)}
            </span>
          </div>
          <Progress 
            value={overallPercentage} 
            className={`h-2 ${isOverBudget ? '[&>div]:bg-destructive' : config.progressClass}`}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma categoria neste grupo ainda.
          </p>
        ) : (
          categories.map((category) => {
            const percentage = category.budget > 0 
              ? Math.min((category.spent / category.budget) * 100, 100) 
              : (category.spent > 0 ? 100 : 0);
            const isCategoryOverBudget = category.spent > category.budget && category.budget > 0;
            const hasNoBudget = category.budget === 0;

            return (
              <div key={category.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{category.name}</span>
                    {hasNoBudget && (
                      <Badge variant="outline" className="text-xs text-warning border-warning py-0 px-1.5">
                        Sem teto
                      </Badge>
                    )}
                    {isCategoryOverBudget && (
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(category.spent)} / {formatCurrency(category.budget)}
                  </span>
                </div>
                <Progress 
                  value={percentage} 
                  className={`h-1.5 ${isCategoryOverBudget ? '[&>div]:bg-destructive' : config.progressClass}`}
                />
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
