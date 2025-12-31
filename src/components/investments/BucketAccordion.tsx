import { Plus } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InvestmentBucket } from '@/hooks/useInvestmentBuckets';
import { Asset } from '@/hooks/useAssets';
import { AssetRow } from './AssetRow';

interface BucketAccordionProps {
  buckets: InvestmentBucket[];
  assets: Asset[];
  totalPortfolioValue: number;
  getAssetValue: (asset: Asset) => number;
  onUpdateAssetPrice: (id: string, price: number) => void;
  onEditAsset: (asset: Asset) => void;
  onDeleteAsset: (id: string) => void;
  onAddAsset: (bucketId: string) => void;
}

export function BucketAccordion({
  buckets,
  assets,
  totalPortfolioValue,
  getAssetValue,
  onUpdateAssetPrice,
  onEditAsset,
  onDeleteAsset,
  onAddAsset,
}: BucketAccordionProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (buckets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Carteira</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma classe de ativos cadastrada.</p>
            <p className="text-sm mt-1">Clique em "Configurar Carteira" para começar.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Carteira</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="space-y-2">
          {buckets.map((bucket) => {
            const bucketAssets = assets.filter(a => a.bucket_id === bucket.id);
            const bucketValue = bucketAssets.reduce((sum, asset) => sum + getAssetValue(asset), 0);
            const currentPercentage = totalPortfolioValue > 0 
              ? (bucketValue / totalPortfolioValue) * 100 
              : 0;
            const targetPercentage = Number(bucket.target_percentage);
            const difference = currentPercentage - targetPercentage;
            const isBelowTarget = difference < -5;

            return (
              <AccordionItem 
                key={bucket.id} 
                value={bucket.id}
                className={`border rounded-lg px-4 ${isBelowTarget ? 'border-destructive/50 bg-destructive/5' : 'border-border'}`}
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-foreground">{bucket.name}</span>
                      <span className={`text-sm ${isBelowTarget ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                        {currentPercentage.toFixed(1)}% / {targetPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <span className="font-medium text-foreground">
                      {formatCurrency(bucketValue)}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-2">
                    {bucketAssets.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        Nenhum ativo nesta classe
                      </div>
                    ) : (
                      bucketAssets.map((asset) => (
                        <AssetRow
                          key={asset.id}
                          asset={asset}
                          assetValue={getAssetValue(asset)}
                          bucketValue={bucketValue}
                          onUpdatePrice={onUpdateAssetPrice}
                          onEdit={onEditAsset}
                          onDelete={onDeleteAsset}
                        />
                      ))
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => onAddAsset(bucket.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Ativo
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
