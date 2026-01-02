import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, parseISO, getDate, getDaysInMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Settings } from 'lucide-react';
import { BudgetSummaryCards } from '@/components/finance/BudgetSummaryCards';
import { SpendingPieChart } from '@/components/finance/SpendingPieChart';
import { SpendingByGroupChart } from '@/components/finance/SpendingByGroupChart';
import { MonthlyTrendChart } from '@/components/finance/MonthlyTrendChart';
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

export default function Finance() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);

  const { categories, essentialsCategories, lifestyleCategories, isLoading: categoriesLoading } = useCategories();
  const { transactions, isLoading: transactionsLoading, deleteTransaction } = useTransactions();
  const { essentialsCap, lifestyleCap, isLoading: configLoading } = useBudgetConfig();

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

  // Calculate totals for summary cards
  const totalSpent = useMemo(() => {
    return currentMonthTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
  }, [currentMonthTransactions]);

  const totalBudget = essentialsCap + lifestyleCap;

  const essentialsSpent = useMemo(() => {
    return essentialsCategoryProgress.reduce((sum, cat) => sum + cat.spent, 0);
  }, [essentialsCategoryProgress]);

  const lifestyleSpent = useMemo(() => {
    return lifestyleCategoryProgress.reduce((sum, cat) => sum + cat.spent, 0);
  }, [lifestyleCategoryProgress]);

  // Data for pie charts
  const allCategorySpending = useMemo(() => {
    return [
      ...essentialsCategoryProgress.map(c => ({ ...c, group: 'essenciais' as const })),
      ...lifestyleCategoryProgress.map(c => ({ ...c, group: 'estilo_de_vida' as const })),
    ];
  }, [essentialsCategoryProgress, lifestyleCategoryProgress]);

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
      <div className="container mx-auto px-4 py-6 pb-24 space-y-6 max-w-6xl">
        {/* Breadcrumb and Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Início / Finanças</p>
            <h1 className="text-2xl font-bold">Orçamento</h1>
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
            <Skeleton className="h-48" />
          </div>
        ) : (
          <>
            {/* Row 1: Summary Cards */}
            <BudgetSummaryCards
              totalSpent={totalSpent}
              totalBudget={totalBudget}
              daysPassed={currentDay}
            />

            {/* Row 2: Pie Charts */}
            <div className="grid gap-4 md:grid-cols-2">
              <SpendingByGroupChart
                essentialsSpent={essentialsSpent}
                lifestyleSpent={lifestyleSpent}
              />
              <SpendingPieChart categories={allCategorySpending} />
            </div>

            {/* Row 3: Weekly Trend */}
            <MonthlyTrendChart transactions={currentMonthTransactions} />

            {/* Row 4: Expense Containers */}
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

            {/* Row 5: Recent Transactions */}
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
