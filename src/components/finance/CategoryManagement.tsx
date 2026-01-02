import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, AlertTriangle, Check, Home, Sparkles, Plus } from 'lucide-react';
import { Category, useCategories } from '@/hooks/useCategories';
import { toast } from '@/hooks/use-toast';
import { CategoryGroup, CATEGORY_GROUP_LABELS, DEFAULT_CATEGORIES } from '@/lib/budget-constants';

interface CategoryManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryManagement({ open, onOpenChange }: CategoryManagementProps) {
  const { categories, essentialsCategories, lifestyleCategories, uncategorizedCategories, updateCategory, deleteCategory, createCategory } = useCategories();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editGroup, setEditGroup] = useState<CategoryGroup | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleStartEdit = (category: Category) => {
    setEditingId(category.id);
    setEditValue(String(category.budget_limit));
    setEditGroup(category.category_group);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await updateCategory.mutateAsync({
        id,
        budget_limit: parseFloat(editValue) || 0,
        category_group: editGroup,
      });
      setEditingId(null);
      toast({
        title: 'Categoria atualizada',
        description: 'As alterações foram salvas.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (category: Category) => {
    try {
      await deleteCategory.mutateAsync(category.id);
      toast({
        title: 'Categoria excluída',
        description: `"${category.name}" foi removida.`,
      });
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'A categoria pode ter transações vinculadas.',
        variant: 'destructive',
      });
    }
  };

  const handleSeedCategories = async () => {
    setIsSeeding(true);
    try {
      for (const cat of DEFAULT_CATEGORIES) {
        // Check if category already exists
        const exists = categories.some(c => c.name.toLowerCase() === cat.name.toLowerCase());
        if (!exists) {
          await createCategory.mutateAsync({
            name: cat.name,
            budget_limit: cat.budget_limit,
            category_group: cat.category_group,
          });
        }
      }
      toast({
        title: 'Categorias criadas!',
        description: 'As categorias do Perfil Atleta foram adicionadas.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao criar categorias',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const renderCategoryItem = (category: Category) => (
    <div
      key={category.id}
      className={`flex items-center justify-between p-3 rounded-lg border ${
        category.budget_limit === 0 
          ? 'border-warning/50 bg-warning/5' 
          : 'border-border bg-secondary/30'
      }`}
    >
      <div className="flex items-center gap-2 flex-1">
        {category.budget_limit === 0 && (
          <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
        )}
        <span className="font-medium text-sm">{category.name}</span>
        {category.budget_limit === 0 && (
          <Badge variant="outline" className="text-xs text-warning border-warning">
            Sem teto
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        {editingId === category.id ? (
          <>
            <Select 
              value={editGroup || 'none'} 
              onValueChange={(v) => setEditGroup(v === 'none' ? null : v as CategoryGroup)}
            >
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue placeholder="Grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem grupo</SelectItem>
                <SelectItem value="essenciais">Essenciais</SelectItem>
                <SelectItem value="estilo_de_vida">Estilo de Vida</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">R$</span>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-20 h-8"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit(category.id);
                  if (e.key === 'Escape') setEditingId(null);
                }}
              />
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-primary"
              onClick={() => handleSaveEdit(category.id)}
            >
              <Check className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => handleStartEdit(category)}
            >
              {formatCurrency(category.budget_limit)}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => handleDelete(category)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
          <DialogDescription>
            Organize suas categorias nos grupos Essenciais e Estilo de Vida, e defina os tetos mensais.
          </DialogDescription>
        </DialogHeader>

        {categories.length === 0 ? (
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground text-sm">
              Nenhuma categoria criada ainda. Deseja criar as categorias padrão do Perfil Atleta?
            </p>
            <Button onClick={handleSeedCategories} disabled={isSeeding} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              {isSeeding ? 'Criando...' : 'Criar Categorias do Perfil Atleta'}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* Seed button if missing categories */}
            {categories.length < DEFAULT_CATEGORIES.length && (
              <Button 
                variant="outline" 
                onClick={handleSeedCategories} 
                disabled={isSeeding}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isSeeding ? 'Criando...' : 'Adicionar Categorias Faltantes'}
              </Button>
            )}

            {/* Essenciais Group */}
            {essentialsCategories.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="rounded-full p-1.5 bg-blue-500/10">
                    <Home className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-sm">{CATEGORY_GROUP_LABELS.essenciais}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {essentialsCategories.length} categorias
                  </Badge>
                </div>
                <div className="space-y-2">
                  {essentialsCategories.map(renderCategoryItem)}
                </div>
              </div>
            )}

            {/* Estilo de Vida Group */}
            {lifestyleCategories.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="rounded-full p-1.5 bg-purple-500/10">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-sm">{CATEGORY_GROUP_LABELS.estilo_de_vida}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {lifestyleCategories.length} categorias
                  </Badge>
                </div>
                <div className="space-y-2">
                  {lifestyleCategories.map(renderCategoryItem)}
                </div>
              </div>
            )}

            {/* Uncategorized */}
            {uncategorizedCategories.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-sm text-muted-foreground">Sem Grupo</h3>
                  <Badge variant="outline" className="text-xs">
                    {uncategorizedCategories.length} categorias
                  </Badge>
                </div>
                <div className="space-y-2">
                  {uncategorizedCategories.map(renderCategoryItem)}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
