import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Settings } from 'lucide-react';
import { BigNumbers } from '@/components/finance/BigNumbers';
import { CategoryProgress } from '@/components/finance/CategoryProgress';
import { RecentTransactions } from '@/components/finance/RecentTransactions';
import { FloatingActionButton } from '@/components/finance/FloatingActionButton';
import { AddTransactionModal } from '@/components/finance/AddTransactionModal';
import { CategoryManagement } from '@/components/finance/CategoryManagement';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export default function Finance() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);

  const { categories, isLoading: categoriesLoading } = useCategories();
  const { transactions, isLoading: transactionsLoading, deleteTransaction } = useTransactions();

  // Current month boundaries
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Filter transactions for current month
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const txDate = parseISO(tx.date);
      return txDate >= monthStart && txDate <= monthEnd;
    });
  }, [transactions, monthStart, monthEnd]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalSpent = currentMonthTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
    const totalBudget = categories.reduce((sum, cat) => sum + Number(cat.budget_limit), 0);
    const remainingBudget = totalBudget - totalSpent;

    return { totalSpent, totalBudget, remainingBudget };
  }, [currentMonthTransactions, categories]);

  // Calculate spending by category
  const categoryProgress = useMemo(() => {
    return categories.map((cat) => {
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
  }, [categories, currentMonthTransactions]);

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

  const isLoading = categoriesLoading || transactionsLoading;

  const formattedMonth = format(now, 'MMMM yyyy', { locale: ptBR });
  const capitalizedMonth = formattedMonth.charAt(0).toUpperCase() + formattedMonth.slice(1);

  return (
    <div className="min-h-full bg-background">
      <div className="container mx-auto px-4 py-6 pb-24 space-y-6 max-w-5xl">
        {/* Breadcrumb and Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Início / Finanças</p>
            <h1 className="text-2xl font-bold">Gestão Financeira</h1>
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
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
            <Skeleton className="h-48" />
            <Skeleton className="h-64" />
          </div>
        ) : (
          <>
            <BigNumbers
              remainingBudget={totals.remainingBudget}
              totalSpent={totals.totalSpent}
              totalBudget={totals.totalBudget}
            />

            <CategoryProgress categories={categoryProgress} />

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
