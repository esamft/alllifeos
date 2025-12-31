import { useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Asset } from '@/hooks/useAssets';
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

interface AssetRowProps {
  asset: Asset;
  assetValue: number;
  bucketValue: number;
  onUpdatePrice: (id: string, price: number) => void;
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
}

export function AssetRow({ 
  asset, 
  assetValue, 
  bucketValue,
  onUpdatePrice,
  onEdit,
  onDelete 
}: AssetRowProps) {
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [tempPrice, setTempPrice] = useState(String(asset.manual_price || 0));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const price = asset.is_manual 
    ? (asset.manual_price || 0) 
    : (asset.last_price_fetch || 0);

  const currentPercentage = bucketValue > 0 
    ? (assetValue / bucketValue) * 100 
    : 0;
  const targetPercentage = Number(asset.target_percentage_in_bucket);
  const difference = currentPercentage - targetPercentage;
  const isAboveTarget = difference > 0;
  const isBelowTarget = difference < -5;

  const handleSavePrice = () => {
    const newPrice = parseFloat(tempPrice);
    if (!isNaN(newPrice) && newPrice >= 0) {
      onUpdatePrice(asset.id, newPrice);
      setIsEditingPrice(false);
    }
  };

  const handleCancelPrice = () => {
    setTempPrice(String(asset.manual_price || 0));
    setIsEditingPrice(false);
  };

  return (
    <div className="flex items-center gap-4 py-3 px-4 bg-muted/30 rounded-lg">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{asset.ticker}</span>
          {asset.name && (
            <span className="text-sm text-muted-foreground truncate">
              ({asset.name})
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          Qtd: {Number(asset.quantity).toLocaleString('pt-BR', { maximumFractionDigits: 8 })}
        </div>
      </div>

      <div className="w-32 text-right">
        {asset.is_manual ? (
          isEditingPrice ? (
            <div className="flex items-center gap-1">
              <Input
                type="number"
                value={tempPrice}
                onChange={(e) => setTempPrice(e.target.value)}
                className="h-8 w-20 text-right text-sm"
                step="0.01"
              />
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSavePrice}>
                <Check className="h-4 w-4 text-green-500" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancelPrice}>
                <X className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingPrice(true)}
              className="text-sm text-foreground hover:text-primary cursor-pointer underline-offset-2 hover:underline"
            >
              {formatCurrency(price)}
            </button>
          )
        ) : (
          <span className="text-sm text-foreground">{formatCurrency(price)}</span>
        )}
      </div>

      <div className="w-28 text-right">
        <span className="font-medium text-foreground">{formatCurrency(assetValue)}</span>
      </div>

      <div className="w-40">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className={isBelowTarget ? 'text-destructive' : isAboveTarget ? 'text-green-500' : 'text-muted-foreground'}>
            {currentPercentage.toFixed(1)}%
          </span>
          <span className="text-muted-foreground">Meta: {targetPercentage.toFixed(1)}%</span>
        </div>
        <Progress 
          value={Math.min(currentPercentage, 100)} 
          className="h-2"
        />
        <div className="text-xs mt-1 text-center">
          {isBelowTarget && <span className="text-destructive">Comprar</span>}
          {isAboveTarget && <span className="text-green-500">Aguardar</span>}
          {!isBelowTarget && !isAboveTarget && <span className="text-muted-foreground">OK</span>}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(asset)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir ativo?</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir {asset.ticker}? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(asset.id)}>Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
