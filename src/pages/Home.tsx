import { useMemo } from 'react';
import { Wallet, Clock, Heart, TrendingUp, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { GreetingHeader } from '@/components/layout/GreetingHeader';
import { BentoCard } from '@/components/layout/BentoCard';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useFocusTasks } from '@/hooks/useFocusTasks';

export default function Home() {
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { scheduledTasks, isLoading: tasksLoading } = useFocusTasks();

  // Calculate financial summary for current month
  const financialSummary = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    });

    const totalSpent = monthlyTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalBudget = categories.reduce((sum, c) => sum + Number(c.budget_limit || 0), 0);
    const remaining = totalBudget - totalSpent;

    return {
      totalSpent,
      totalBudget,
      remaining,
      hasData: totalBudget > 0,
    };
  }, [transactions, categories]);

  // Calculate tasks for today
  const todayTasksCount = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return scheduledTasks.filter(
      (t) => t.scheduled_date === today && t.status !== 'completed'
    ).length;
  }, [scheduledTasks]);

  const completedTodayCount = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return scheduledTasks.filter(
      (t) => t.scheduled_date === today && t.status === 'completed'
    ).length;
  }, [scheduledTasks]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Build live data strings
  const financeLiveData = financialSummary.hasData
    ? `${formatCurrency(financialSummary.remaining)} restantes`
    : 'Configure seus tetos de gastos';

  const focusLiveData = todayTasksCount > 0
    ? `${todayTasksCount} tarefa${todayTasksCount !== 1 ? 's' : ''} para hoje`
    : completedTodayCount > 0
    ? `${completedTodayCount} tarefa${completedTodayCount !== 1 ? 's' : ''} concluída${completedTodayCount !== 1 ? 's' : ''} hoje`
    : 'Nenhuma tarefa agendada';

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <GreetingHeader />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Finance Card - Large emphasis */}
        <BentoCard
          icon={<Wallet className="h-5 w-5" />}
          title="Gestão Financeira"
          subtitle="Controle de gastos e tetos"
          to="/finance"
          variant="success"
          size="large"
          liveData={financeLiveData}
          liveDataLoading={transactionsLoading || categoriesLoading}
        />

        {/* Focus Card - Medium emphasis */}
        <BentoCard
          icon={<Clock className="h-5 w-5" />}
          title="Produtividade"
          subtitle="Planejamento e Deep Work"
          to="/focus"
          variant="primary"
          liveData={focusLiveData}
          liveDataLoading={tasksLoading}
        />

        {/* Coming Soon Card */}
        <BentoCard
          icon={<Heart className="h-5 w-5" />}
          title="Hábitos & Saúde"
          subtitle="Acompanhe sua rotina"
          disabled
          disabledLabel="Em Breve"
        />
      </div>

      {/* Quick Stats Section */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">Resumo Rápido</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 rounded-xl bg-card border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Orçamento do Mês</p>
                {categoriesLoading ? (
                  <div className="h-5 w-20 bg-muted animate-pulse rounded mt-1" />
                ) : (
                  <p className="font-semibold">{formatCurrency(financialSummary.totalBudget)}</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-card border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Wallet className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Gastos do Mês</p>
                {transactionsLoading ? (
                  <div className="h-5 w-20 bg-muted animate-pulse rounded mt-1" />
                ) : (
                  <p className="font-semibold">{formatCurrency(financialSummary.totalSpent)}</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-card border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tarefas Hoje</p>
                {tasksLoading ? (
                  <div className="h-5 w-10 bg-muted animate-pulse rounded mt-1" />
                ) : (
                  <p className="font-semibold">{todayTasksCount} pendente{todayTasksCount !== 1 ? 's' : ''}</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-card border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Concluídas Hoje</p>
                {tasksLoading ? (
                  <div className="h-5 w-10 bg-muted animate-pulse rounded mt-1" />
                ) : (
                  <p className="font-semibold">{completedTodayCount} tarefa{completedTodayCount !== 1 ? 's' : ''}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
