import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface InvestmentBucket {
  id: string;
  user_id: string;
  name: string;
  target_percentage: number;
  created_at: string;
}

export interface BucketFormData {
  name: string;
  target_percentage: number;
}

export function useInvestmentBuckets() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: buckets = [], isLoading, error } = useQuery({
    queryKey: ['investment_buckets', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('investment_buckets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as InvestmentBucket[];
    },
    enabled: !!user?.id,
  });

  const createBucket = useMutation({
    mutationFn: async (bucket: BucketFormData) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('investment_buckets')
        .insert({
          user_id: user.id,
          name: bucket.name,
          target_percentage: bucket.target_percentage,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment_buckets'] });
      toast({ title: 'Classe criada com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar classe', description: error.message, variant: 'destructive' });
    },
  });

  const updateBucket = useMutation({
    mutationFn: async ({ id, ...bucket }: BucketFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('investment_buckets')
        .update({
          name: bucket.name,
          target_percentage: bucket.target_percentage,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment_buckets'] });
      toast({ title: 'Classe atualizada!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar classe', description: error.message, variant: 'destructive' });
    },
  });

  const deleteBucket = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('investment_buckets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment_buckets'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast({ title: 'Classe excluída!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir classe', description: error.message, variant: 'destructive' });
    },
  });

  const totalTargetPercentage = buckets.reduce((sum, b) => sum + Number(b.target_percentage), 0);
  const isValidAllocation = Math.abs(totalTargetPercentage - 100) < 0.01;

  return {
    buckets,
    isLoading,
    error,
    createBucket,
    updateBucket,
    deleteBucket,
    totalTargetPercentage,
    isValidAllocation,
  };
}
