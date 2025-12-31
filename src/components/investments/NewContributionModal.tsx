import { useState, useMemo } from 'react';
import { Calculator } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InvestmentBucket } from '@/hooks/useInvestmentBuckets';
import { Asset } from '@/hooks/useAssets';

interface NewContributionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buckets: InvestmentBucket[];
  assets: Asset[];
  getAssetValue: (asset: Asset) => number;
  totalPortfolioValue: number;
}

interface Suggestion {
  bucketName: string;
  assetTicker: string;
  assetName: string | null;
  amount: number;
}

export function NewContributionModal({
  open,
  onOpenChange,
  buckets,
  assets,
  getAssetValue,
  totalPortfolioValue,
}: NewContributionModalProps) {
  const [contributionAmount, setContributionAmount] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [calculated, setCalculated] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calculateSuggestions = () => {
    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) return;

    const newTotalValue = totalPortfolioValue + amount;
    const result: Suggestion[] = [];
    let remainingAmount = amount;

    // Calculate bucket deficits
    const bucketData = buckets.map(bucket => {
      const bucketAssets = assets.filter(a => a.bucket_id === bucket.id);
      const bucketValue = bucketAssets.reduce((sum, a) => sum + getAssetValue(a), 0);
      const targetValue = (Number(bucket.target_percentage) / 100) * newTotalValue;
      const deficit = targetValue - bucketValue;

      return {
        bucket,
        bucketAssets,
        bucketValue,
        targetValue,
        deficit,
      };
    });

    // Sort buckets by deficit (largest first)
    bucketData.sort((a, b) => b.deficit - a.deficit);

    for (const data of bucketData) {
      if (remainingAmount <= 0) break;
      if (data.deficit <= 0) continue;

      const bucketContribution = Math.min(data.deficit, remainingAmount);
      
      if (data.bucketAssets.length === 0) {
        // No assets in bucket, suggest adding to bucket
        result.push({
          bucketName: data.bucket.name,
          assetTicker: '(novo ativo)',
          assetName: null,
          amount: bucketContribution,
        });
        remainingAmount -= bucketContribution;
        continue;
      }

      // Calculate asset deficits within this bucket
      const newBucketValue = data.bucketValue + bucketContribution;
      const assetData = data.bucketAssets.map(asset => {
        const assetValue = getAssetValue(asset);
        const targetValue = (Number(asset.target_percentage_in_bucket) / 100) * newBucketValue;
        const deficit = targetValue - assetValue;
        return { asset, assetValue, targetValue, deficit };
      });

      // Sort assets by deficit
      assetData.sort((a, b) => b.deficit - a.deficit);

      let bucketRemaining = bucketContribution;
      for (const aData of assetData) {
        if (bucketRemaining <= 0) break;
        if (aData.deficit <= 0) continue;

        const assetContribution = Math.min(aData.deficit, bucketRemaining);
        result.push({
          bucketName: data.bucket.name,
          assetTicker: aData.asset.ticker,
          assetName: aData.asset.name,
          amount: assetContribution,
        });
        bucketRemaining -= assetContribution;
      }

      remainingAmount -= (bucketContribution - bucketRemaining);
    }

    // If there's still remaining amount, distribute proportionally
    if (remainingAmount > 0 && result.length > 0) {
      const lastSuggestion = result[result.length - 1];
      lastSuggestion.amount += remainingAmount;
    }

    setSuggestions(result.filter(s => s.amount > 0.01));
    setCalculated(true);
  };

  const handleClose = () => {
    setContributionAmount('');
    setSuggestions([]);
    setCalculated(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Simulador de Aporte
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor do Aporte (R$)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0,00"
              value={contributionAmount}
              onChange={(e) => {
                setContributionAmount(e.target.value);
                setCalculated(false);
              }}
              step="0.01"
              min="0"
            />
          </div>

          <Button onClick={calculateSuggestions} className="w-full">
            Calcular Sugestão
          </Button>

          {calculated && suggestions.length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              <p className="text-sm font-medium text-foreground">
                Para rebalancear sua carteira, sugerimos:
              </p>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-primary/10 rounded-lg"
                  >
                    <div>
                      <span className="font-medium text-foreground">
                        {suggestion.assetTicker}
                      </span>
                      {suggestion.assetName && (
                        <span className="text-sm text-muted-foreground ml-1">
                          ({suggestion.assetName})
                        </span>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {suggestion.bucketName}
                      </p>
                    </div>
                    <span className="font-bold text-primary">
                      {formatCurrency(suggestion.amount)}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Total: {formatCurrency(suggestions.reduce((sum, s) => sum + s.amount, 0))}
              </p>
            </div>
          )}

          {calculated && suggestions.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <p>Sua carteira já está balanceada!</p>
              <p className="text-sm">Você pode investir em qualquer ativo.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
