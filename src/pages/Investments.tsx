import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInvestmentBuckets } from '@/hooks/useInvestmentBuckets';
import { useAssets, Asset } from '@/hooks/useAssets';
import { PatrimonyDashboard } from '@/components/investments/PatrimonyDashboard';
import { AllocationChart } from '@/components/investments/AllocationChart';
import { BucketAccordion } from '@/components/investments/BucketAccordion';
import { NewContributionModal } from '@/components/investments/NewContributionModal';
import { BucketManagement } from '@/components/investments/BucketManagement';
import { AssetManagement } from '@/components/investments/AssetManagement';

export default function Investments() {
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [isBucketManagementOpen, setIsBucketManagementOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [defaultBucketId, setDefaultBucketId] = useState<string | undefined>();

  const {
    buckets,
    isLoading: bucketsLoading,
    createBucket,
    updateBucket,
    deleteBucket,
    totalTargetPercentage,
    isValidAllocation,
  } = useInvestmentBuckets();

  const {
    assets,
    isLoading: assetsLoading,
    createAsset,
    updateAsset,
    deleteAsset,
    getAssetValue,
    getTotalValue,
  } = useAssets();

  const totalValue = getTotalValue();
  const isLoading = bucketsLoading || assetsLoading;

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setDefaultBucketId(undefined);
    setIsAssetModalOpen(true);
  };

  const handleAddAsset = (bucketId: string) => {
    setEditingAsset(null);
    setDefaultBucketId(bucketId);
    setIsAssetModalOpen(true);
  };

  const handleUpdateAssetPrice = (id: string, price: number) => {
    updateAsset.mutate({ id, manual_price: price });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-32 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Investimentos</h1>
          <p className="text-muted-foreground">
            Gerencie e rebalanceie sua carteira de investimentos
          </p>
        </div>
        <Button variant="outline" onClick={() => setIsBucketManagementOpen(true)}>
          <Settings className="h-4 w-4 mr-2" />
          Configurar Carteira
        </Button>
      </div>

      {/* Dashboard */}
      <PatrimonyDashboard
        totalValue={totalValue}
        isValidAllocation={isValidAllocation}
        onNewContribution={() => setIsContributionModalOpen(true)}
      />

      {/* Chart */}
      <AllocationChart
        buckets={buckets}
        assets={assets}
        getAssetValue={getAssetValue}
      />

      {/* Portfolio List */}
      <BucketAccordion
        buckets={buckets}
        assets={assets}
        totalPortfolioValue={totalValue}
        getAssetValue={getAssetValue}
        onUpdateAssetPrice={handleUpdateAssetPrice}
        onEditAsset={handleEditAsset}
        onDeleteAsset={(id) => deleteAsset.mutate(id)}
        onAddAsset={handleAddAsset}
      />

      {/* Modals */}
      <NewContributionModal
        open={isContributionModalOpen}
        onOpenChange={setIsContributionModalOpen}
        buckets={buckets}
        assets={assets}
        getAssetValue={getAssetValue}
        totalPortfolioValue={totalValue}
      />

      <BucketManagement
        open={isBucketManagementOpen}
        onOpenChange={setIsBucketManagementOpen}
        buckets={buckets}
        totalTargetPercentage={totalTargetPercentage}
        isValidAllocation={isValidAllocation}
        onCreateBucket={(data) => createBucket.mutate(data)}
        onUpdateBucket={(data) => updateBucket.mutate(data)}
        onDeleteBucket={(id) => deleteBucket.mutate(id)}
      />

      <AssetManagement
        open={isAssetModalOpen}
        onOpenChange={setIsAssetModalOpen}
        buckets={buckets}
        editingAsset={editingAsset}
        defaultBucketId={defaultBucketId}
        onCreateAsset={(data) => createAsset.mutate(data)}
        onUpdateAsset={(data) => updateAsset.mutate(data)}
      />
    </div>
  );
}
