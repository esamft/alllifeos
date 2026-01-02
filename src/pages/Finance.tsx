import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, parseISO, getDate } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Settings } from 'lucide-react';
import { InvestmentGoalTracker } from '@/components/finance/InvestmentGoalTracker';
import { CreditCardMonitor } from '@/components/finance/CreditCardMonitor';
import { ExpenseContainer } from '@/components/finance/ExpenseContainer';
import { WeeklyAllowance } from '@/components/finance/WeeklyAllowance';
import { RecentTransactions } from '@/components/finance/RecentTransactions';
import { FloatingActionButton } from '@/components/finance/FloatingActionButton';
import { AddTransactionModal } from '@/components/finance/AddTransactionModal';
import { CategoryManagement } from '@/components/finance/CategoryManagement';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { useBudgetConfig } from '@/hooks/useBudgetConfig';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { BUDGET_CONSTANTS } from '@/lib/budget-constants';

export default function Finance() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);

  const { categories, essentialsCategories, lifestyleCategories, isLoading: categoriesLoading } = useCategories();
  const { transactions, isLoading: transactionsLoading, deleteTransaction } = useTransactions();
  const { investmentTarget, essentialsCap, lifestyleCap, isLoading: configLoading } = useBudgetConfig();

  // Current month boundaries
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const currentDay = getDate(now);
  const currentWeekOfMonth = Math.ceil(currentDay / 7);

  // Filter transactions for current month
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const txDate = parseISO(tx.date);
      return txDate >= monthStart && txDate <= monthEnd;
    });
  }, [transactions, monthStart, monthEnd]);

  // Calculate credit card spending (for Semáforo)
  const creditCardSpending = useMemo(() => {
    return currentMonthTransactions
      .filter((tx) => tx.transaction_type === 'credit_card')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
  }, [currentMonthTransactions]);

  // Calculate free spending (Gastos Livres category)
  const freeSpendingThisMonth = useMemo(() => {
    const freeSpendingCategory = categories.find(c => c.name === 'Gastos Livres');
    if (!freeSpendingCategory) return 0;
    
    return currentMonthTransactions
      .filter((tx) => tx.category_id === freeSpendingCategory.id)
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
  }, [currentMonthTransactions, categories]);

  // Calculate spending by category for each group
  const essentialsCategoryProgress = useMemo(() => {
    return essentialsCategories.map((cat) => {
      const spent = currentMonthTransactions
        .filter((tx) => tx.category_id === cat.id)
        .reduce((sum, tx) => sum + Number(tx.amount), 0);

      return {
        id: cat.id,
        name: cat.name,
        spent,
        budget: Number(cat.budget_limit),
      };
    });
  }, [essentialsCategories, currentMonthTransactions]);

  const lifestyleCategoryProgress = useMemo(() => {
    return lifestyleCategories.map((cat) => {
      const spent = currentMonthTransactions
        .filter((tx) => tx.category_id === cat.id)
        .reduce((sum, tx) => sum + Number(tx.amount), 0);

      return {
        id: cat.id,
        name: cat.name,
        spent,
        budget: Number(cat.budget_limit),
      };
    });
  }, [lifestyleCategories, currentMonthTransactions]);

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction.mutateAsync(id);
      toast({
        title: 'Transação excluída',
        description: 'A transação foi removida.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const isLoading = categoriesLoading || transactionsLoading || configLoading;

  const formattedMonth = format(now, 'MMMM yyyy', { locale: ptBR });
  const capitalizedMonth = formattedMonth.charAt(0).toUpperCase() + formattedMonth.slice(1);

  return (
    <div className="min-h-full bg-background">
      <div className="container mx-auto px-4 py-6 pb-24 space-y-6 max-w-5xl">
        {/* Breadcrumb and Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Início / Finanças</p>
            <h1 className="text-2xl font-bold">Orçamento 2026 - Perfil Atleta</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => setCategoriesModalOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Categorias
          </Button>
        </div>

        {/* Month indicator */}
        <p className="text-sm text-muted-foreground">{capitalizedMonth}</p>

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
            <Skeleton className="h-48" />
          </div>
        ) : (
          <>
            {/* Row 1: Investment Goal + Credit Card Monitor */}
            <div className="grid gap-4 md:grid-cols-2">
              <InvestmentGoalTracker 
                investedAmount={0} 
                targetAmount={investmentTarget}
              />
              <CreditCardMonitor 
                totalCreditCardSpending={creditCardSpending}
              />
            </div>

            {/* Row 2: Expense Containers */}
            <div className="grid gap-4 md:grid-cols-2">
              <ExpenseContainer 
                group="essenciais"
                categories={essentialsCategoryProgress}
                cap={essentialsCap}
              />
              <div className="space-y-4">
                <ExpenseContainer 
                  group="estilo_de_vida"
                  categories={lifestyleCategoryProgress}
                  cap={lifestyleCap}
                />
                <WeeklyAllowance 
                  freeSpendingThisMonth={freeSpendingThisMonth}
                  currentWeekOfMonth={currentWeekOfMonth}
                />
              </div>
            </div>

            {/* Row 3: Recent Transactions */}
            <RecentTransactions
              transactions={transactions}
              onDelete={handleDeleteTransaction}
            />
          </>
        )}
      </div>

      <FloatingActionButton onClick={() => setAddModalOpen(true)} />

      <AddTransactionModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
      />

      <CategoryManagement
        open={categoriesModalOpen}
        onOpenChange={setCategoriesModalOpen}
      />
    </div>
  );
}
