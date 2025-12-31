import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { addMonths, format } from 'date-fns';

export interface Transaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  date: string;
  category_id: string | null;
  transaction_type: 'pix' | 'credit_card' | 'debit_card';
  installment_current: number;
  installment_total: number;
  created_at: string;
}

export interface TransactionWithCategory extends Transaction {
  categories?: {
    name: string;
  } | null;
}

export function useTransactions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select('*, categories(name)')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as TransactionWithCategory[];
    },
    enabled: !!user,
  });

  const createTransaction = useMutation({
    mutationFn: async (input: {
      description: string;
      amount: number;
      date: string;
      category_id: string;
      transaction_type: 'pix' | 'credit_card' | 'debit_card';
      installments?: number;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { installments = 1, ...baseData } = input;
      const installmentAmount = input.amount / installments;

      const transactionsToInsert = [];
      for (let i = 0; i < installments; i++) {
        const installmentDate = addMonths(new Date(input.date), i);
        transactionsToInsert.push({
          ...baseData,
          user_id: user.id,
          amount: Number(installmentAmount.toFixed(2)),
          date: format(installmentDate, 'yyyy-MM-dd'),
          installment_current: i + 1,
          installment_total: installments,
        });
      }

      const { error } = await supabase
        .from('transactions')
        .insert(transactionsToInsert);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  return {
    transactions,
    isLoading,
    createTransaction,
    deleteTransaction,
  };
}