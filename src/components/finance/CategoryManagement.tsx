import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, AlertTriangle, Check } from 'lucide-react';
import { Category, useCategories } from '@/hooks/useCategories';
import { toast } from '@/hooks/use-toast';

interface CategoryManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryManagement({ open, onOpenChange }: CategoryManagementProps) {
  const { categories, updateCategory, deleteCategory } = useCategories();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleStartEdit = (category: Category) => {
    setEditingId(category.id);
    setEditValue(String(category.budget_limit));
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await updateCategory.mutateAsync({
        id,
        budget_limit: parseFloat(editValue) || 0,
      });
      setEditingId(null);
      toast({
        title: 'Teto atualizado',
        description: 'O limite da categoria foi salvo.',
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Sort categories: those with budget_limit = 0 first
  const sortedCategories = [...categories].sort((a, b) => {
    if (a.budget_limit === 0 && b.budget_limit !== 0) return -1;
    if (a.budget_limit !== 0 && b.budget_limit === 0) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
          <DialogDescription>
            Ajuste os tetos (limites mensais) de cada categoria. Categorias sem teto definido aparecem primeiro.
          </DialogDescription>
        </DialogHeader>

        {categories.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4">
            Nenhuma categoria criada ainda. Adicione um gasto para criar sua primeira categoria.
          </p>
        ) : (
          <div className="space-y-3 mt-4">
            {sortedCategories.map((category) => (
              <div
                key={category.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  category.budget_limit === 0 
                    ? 'border-warning/50 bg-warning/5' 
                    : 'border-border bg-secondary/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  {category.budget_limit === 0 && (
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  )}
                  <span className="font-medium">{category.name}</span>
                  {category.budget_limit === 0 && (
                    <Badge variant="outline" className="text-xs text-warning border-warning">
                      Sem teto
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {editingId === category.id ? (
                    <>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">R$</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-24 h-8"
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
                        className="h-8"
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
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}