import { useState } from 'react';
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InvestmentBucket, BucketFormData } from '@/hooks/useInvestmentBuckets';

interface BucketManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buckets: InvestmentBucket[];
  totalTargetPercentage: number;
  isValidAllocation: boolean;
  onCreateBucket: (data: BucketFormData) => void;
  onUpdateBucket: (data: BucketFormData & { id: string }) => void;
  onDeleteBucket: (id: string) => void;
}

export function BucketManagement({
  open,
  onOpenChange,
  buckets,
  totalTargetPercentage,
  isValidAllocation,
  onCreateBucket,
  onUpdateBucket,
  onDeleteBucket,
}: BucketManagementProps) {
  const [editingBucket, setEditingBucket] = useState<InvestmentBucket | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<BucketFormData>({
    name: '',
    target_percentage: 0,
  });

  const handleOpenForm = (bucket?: InvestmentBucket) => {
    if (bucket) {
      setEditingBucket(bucket);
      setFormData({
        name: bucket.name,
        target_percentage: Number(bucket.target_percentage),
      });
    } else {
      setEditingBucket(null);
      setFormData({ name: '', target_percentage: 0 });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBucket(null);
    setFormData({ name: '', target_percentage: 0 });
  };

  const handleSubmit = () => {
    if (editingBucket) {
      onUpdateBucket({ ...formData, id: editingBucket.id });
    } else {
      onCreateBucket(formData);
    }
    handleCloseForm();
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Configurar Carteira</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {!isValidAllocation && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  A soma das metas é {totalTargetPercentage.toFixed(1)}%. 
                  Deve ser exatamente 100%.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              {buckets.map((bucket) => (
                <div
                  key={bucket.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-foreground">{bucket.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Meta: {Number(bucket.target_percentage).toFixed(1)}%
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleOpenForm(bucket)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir classe?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Todos os ativos desta classe também serão excluídos.
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDeleteBucket(bucket.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={() => handleOpenForm()} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Nova Classe
            </Button>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total das Metas:</span>
                <span className={`font-medium ${isValidAllocation ? 'text-green-500' : 'text-destructive'}`}>
                  {totalTargetPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBucket ? 'Editar Classe' : 'Nova Classe'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bucket-name">Nome</Label>
              <Input
                id="bucket-name"
                placeholder="Ex: Ações BR, FIIs, Crypto..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bucket-target">Meta (%)</Label>
              <Input
                id="bucket-target"
                type="number"
                placeholder="0"
                value={formData.target_percentage || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  target_percentage: parseFloat(e.target.value) || 0 
                })}
                step="0.1"
                min="0"
                max="100"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.name}>
              {editingBucket ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
