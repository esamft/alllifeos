import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface Asset {
  id: string;
  bucket_id: string;
  user_id: string;
  ticker: string;
  name: string | null;
  quantity: number;
  target_percentage_in_bucket: number;
  is_manual: boolean;
  manual_price: number | null;
  last_price_fetch: number | null;
  updated_at: string;
}

export interface AssetFormData {
  bucket_id: string;
  ticker: string;
  name?: string;
  quantity: number;
  target_percentage_in_bucket: number;
  is_manual: boolean;
  manual_price?: number;
}

export function useAssets() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: assets = [], isLoading, error } = useQuery({
    queryKey: ['assets', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as Asset[];
    },
    enabled: !!user?.id,
  });

  const createAsset = useMutation({
    mutationFn: async (asset: AssetFormData) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('assets')
        .insert({
          user_id: user.id,
          bucket_id: asset.bucket_id,
          ticker: asset.ticker,
          name: asset.name || null,
          quantity: asset.quantity,
          target_percentage_in_bucket: asset.target_percentage_in_bucket,
          is_manual: asset.is_manual,
          manual_price: asset.is_manual ? asset.manual_price : null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast({ title: 'Ativo adicionado com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao adicionar ativo', description: error.message, variant: 'destructive' });
    },
  });

  const updateAsset = useMutation({
    mutationFn: async ({ id, ...asset }: Partial<AssetFormData> & { id: string }) => {
      const updateData: Record<string, unknown> = {};
      
      if (asset.bucket_id !== undefined) updateData.bucket_id = asset.bucket_id;
      if (asset.ticker !== undefined) updateData.ticker = asset.ticker;
      if (asset.name !== undefined) updateData.name = asset.name;
      if (asset.quantity !== undefined) updateData.quantity = asset.quantity;
      if (asset.target_percentage_in_bucket !== undefined) updateData.target_percentage_in_bucket = asset.target_percentage_in_bucket;
      if (asset.is_manual !== undefined) updateData.is_manual = asset.is_manual;
      if (asset.manual_price !== undefined) updateData.manual_price = asset.manual_price;
      
      const { data, error } = await supabase
        .from('assets')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast({ title: 'Ativo atualizado!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar ativo', description: error.message, variant: 'destructive' });
    },
  });

  const deleteAsset = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast({ title: 'Ativo excluído!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir ativo', description: error.message, variant: 'destructive' });
    },
  });

  const getAssetPrice = (asset: Asset): number => {
    if (asset.is_manual && asset.manual_price !== null) {
      return Number(asset.manual_price);
    }
    if (asset.last_price_fetch !== null) {
      return Number(asset.last_price_fetch);
    }
    return 0;
  };

  const getAssetValue = (asset: Asset): number => {
    return Number(asset.quantity) * getAssetPrice(asset);
  };

  const getAssetsByBucket = (bucketId: string): Asset[] => {
    return assets.filter(a => a.bucket_id === bucketId);
  };

  const getTotalValue = (): number => {
    return assets.reduce((sum, asset) => sum + getAssetValue(asset), 0);
  };

  return {
    assets,
    isLoading,
    error,
    createAsset,
    updateAsset,
    deleteAsset,
    getAssetPrice,
    getAssetValue,
    getAssetsByBucket,
    getTotalValue,
  };
}
