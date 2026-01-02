import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { BUDGET_CONSTANTS } from '@/lib/budget-constants';

export interface BudgetConfig {
  id: string;
  user_id: string;
  base_income: number;
  investment_percentage: number;
  essentials_percentage: number;
  lifestyle_percentage: number;
  free_spending_amount: number;
  created_at: string;
  updated_at: string;
}

export function useBudgetConfig() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: budgetConfig, isLoading } = useQuery({
    queryKey: ['budget_config', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('budget_config')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      // Se não existe configuração, retornar valores padrão
      if (!data) {
        return {
          base_income: BUDGET_CONSTANTS.BASE_INCOME,
          investment_percentage: BUDGET_CONSTANTS.INVESTMENT_PERCENTAGE,
          essentials_percentage: BUDGET_CONSTANTS.ESSENTIALS_PERCENTAGE,
          lifestyle_percentage: BUDGET_CONSTANTS.LIFESTYLE_PERCENTAGE,
          free_spending_amount: BUDGET_CONSTANTS.FREE_SPENDING_MONTHLY,
        } as Partial<BudgetConfig>;
      }
      
      return data as BudgetConfig;
    },
    enabled: !!user,
  });

  const upsertConfig = useMutation({
    mutationFn: async (config: Partial<BudgetConfig>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('budget_config')
        .upsert({
          user_id: user.id,
          ...config,
        }, { onConflict: 'user_id' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget_config'] });
    },
  });

  // Valores calculados com base na configuração
  const calculatedValues = {
    investmentTarget: budgetConfig 
      ? (budgetConfig.base_income ?? BUDGET_CONSTANTS.BASE_INCOME) * 
        ((budgetConfig.investment_percentage ?? BUDGET_CONSTANTS.INVESTMENT_PERCENTAGE) / 100)
      : BUDGET_CONSTANTS.INVESTMENT_TARGET,
    essentialsCap: budgetConfig
      ? (budgetConfig.base_income ?? BUDGET_CONSTANTS.BASE_INCOME) * 
        ((budgetConfig.essentials_percentage ?? BUDGET_CONSTANTS.ESSENTIALS_PERCENTAGE) / 100)
      : BUDGET_CONSTANTS.ESSENTIALS_CAP,
    lifestyleCap: budgetConfig
      ? (budgetConfig.base_income ?? BUDGET_CONSTANTS.BASE_INCOME) * 
        ((budgetConfig.lifestyle_percentage ?? BUDGET_CONSTANTS.LIFESTYLE_PERCENTAGE) / 100)
      : BUDGET_CONSTANTS.LIFESTYLE_CAP,
    freeSpendingMonthly: budgetConfig?.free_spending_amount ?? BUDGET_CONSTANTS.FREE_SPENDING_MONTHLY,
    freeSpendingWeekly: (budgetConfig?.free_spending_amount ?? BUDGET_CONSTANTS.FREE_SPENDING_MONTHLY) / 4,
  };

  return {
    budgetConfig,
    isLoading,
    upsertConfig,
    ...calculatedValues,
  };
}
