import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { CategoryGroup } from '@/lib/budget-constants';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  budget_limit: number;
  category_group: CategoryGroup | null;
  created_at: string;
}

export function useCategories() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Category[];
    },
    enabled: !!user,
  });

  const createCategory = useMutation({
    mutationFn: async ({ 
      name, 
      budget_limit = 0,
      category_group = null,
    }: { 
      name: string; 
      budget_limit?: number;
      category_group?: CategoryGroup | null;
    }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('categories')
        .insert({ name, budget_limit, category_group, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ 
      id, 
      budget_limit,
      category_group,
    }: { 
      id: string; 
      budget_limit?: number;
      category_group?: CategoryGroup | null;
    }) => {
      const updateData: Partial<Category> = {};
      if (budget_limit !== undefined) updateData.budget_limit = budget_limit;
      if (category_group !== undefined) updateData.category_group = category_group;
      
      const { error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  // Helpers para filtrar por grupo
  const essentialsCategories = categories.filter(c => c.category_group === 'essenciais');
  const lifestyleCategories = categories.filter(c => c.category_group === 'estilo_de_vida');
  const uncategorizedCategories = categories.filter(c => !c.category_group);

  return {
    categories,
    essentialsCategories,
    lifestyleCategories,
    uncategorizedCategories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
