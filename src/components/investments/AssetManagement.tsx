import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InvestmentBucket } from '@/hooks/useInvestmentBuckets';
import { Asset, AssetFormData } from '@/hooks/useAssets';

interface AssetManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buckets: InvestmentBucket[];
  editingAsset: Asset | null;
  defaultBucketId?: string;
  onCreateAsset: (data: AssetFormData) => void;
  onUpdateAsset: (data: Partial<AssetFormData> & { id: string }) => void;
}

export function AssetManagement({
  open,
  onOpenChange,
  buckets,
  editingAsset,
  defaultBucketId,
  onCreateAsset,
  onUpdateAsset,
}: AssetManagementProps) {
  const [formData, setFormData] = useState<AssetFormData>({
    bucket_id: '',
    ticker: '',
    name: '',
    quantity: 0,
    target_percentage_in_bucket: 0,
    is_manual: false,
    manual_price: 0,
  });

  useEffect(() => {
    if (editingAsset) {
      setFormData({
        bucket_id: editingAsset.bucket_id,
        ticker: editingAsset.ticker,
        name: editingAsset.name || '',
        quantity: Number(editingAsset.quantity),
        target_percentage_in_bucket: Number(editingAsset.target_percentage_in_bucket),
        is_manual: editingAsset.is_manual,
        manual_price: Number(editingAsset.manual_price) || 0,
      });
    } else {
      setFormData({
        bucket_id: defaultBucketId || '',
        ticker: '',
        name: '',
        quantity: 0,
        target_percentage_in_bucket: 0,
        is_manual: false,
        manual_price: 0,
      });
    }
  }, [editingAsset, defaultBucketId, open]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (editingAsset) {
      onUpdateAsset({ ...formData, id: editingAsset.id });
    } else {
      onCreateAsset(formData);
    }
    handleClose();
  };

  const isValid = formData.bucket_id && formData.ticker && formData.quantity >= 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingAsset ? 'Editar Ativo' : 'Novo Ativo'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="asset-bucket">Classe</Label>
            <Select
              value={formData.bucket_id}
              onValueChange={(value) => setFormData({ ...formData, bucket_id: value })}
            >
              <SelectTrigger id="asset-bucket">
                <SelectValue placeholder="Selecione uma classe" />
              </SelectTrigger>
              <SelectContent>
                {buckets.map((bucket) => (
                  <SelectItem key={bucket.id} value={bucket.id}>
                    {bucket.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="asset-ticker">Ticker</Label>
              <Input
                id="asset-ticker"
                placeholder="Ex: PETR4, BTC"
                value={formData.ticker}
                onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset-name">Nome (opcional)</Label>
              <Input
                id="asset-name"
                placeholder="Ex: Petrobras"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="asset-quantity">Quantidade</Label>
              <Input
                id="asset-quantity"
                type="number"
                placeholder="0"
                value={formData.quantity || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  quantity: parseFloat(e.target.value) || 0 
                })}
                step="any"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset-target">Meta na Classe (%)</Label>
              <Input
                id="asset-target"
                type="number"
                placeholder="0"
                value={formData.target_percentage_in_bucket || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  target_percentage_in_bucket: parseFloat(e.target.value) || 0 
                })}
                step="0.1"
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label htmlFor="asset-manual" className="text-sm font-medium">
                Preço Manual
              </Label>
              <p className="text-xs text-muted-foreground">
                Ative para ativos sem cotação automática
              </p>
            </div>
            <Switch
              id="asset-manual"
              checked={formData.is_manual}
              onCheckedChange={(checked) => setFormData({ ...formData, is_manual: checked })}
            />
          </div>

          {formData.is_manual && (
            <div className="space-y-2">
              <Label htmlFor="asset-price">Preço Atual (R$)</Label>
              <Input
                id="asset-price"
                type="number"
                placeholder="0,00"
                value={formData.manual_price || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  manual_price: parseFloat(e.target.value) || 0 
                })}
                step="0.01"
                min="0"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            {editingAsset ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
