import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InvestmentBucket } from '@/hooks/useInvestmentBuckets';
import { Asset } from '@/hooks/useAssets';

interface AllocationChartProps {
  buckets: InvestmentBucket[];
  assets: Asset[];
  getAssetValue: (asset: Asset) => number;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function AllocationChart({ buckets, assets, getAssetValue }: AllocationChartProps) {
  const totalValue = assets.reduce((sum, asset) => sum + getAssetValue(asset), 0);

  const chartData = buckets.map((bucket, index) => {
    const bucketAssets = assets.filter(a => a.bucket_id === bucket.id);
    const bucketValue = bucketAssets.reduce((sum, asset) => sum + getAssetValue(asset), 0);
    const currentPercentage = totalValue > 0 ? (bucketValue / totalValue) * 100 : 0;

    return {
      name: bucket.name,
      atual: Number(currentPercentage.toFixed(1)),
      meta: Number(bucket.target_percentage),
      value: bucketValue,
      color: COLORS[index % COLORS.length],
    };
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof chartData[0] }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            Atual: {data.atual.toFixed(1)}% ({formatCurrency(data.value)})
          </p>
          <p className="text-sm text-muted-foreground">
            Meta: {data.meta.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (buckets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alocação da Carteira</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Adicione classes de ativos para visualizar a alocação
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Alocação da Carteira</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="atual"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value, entry) => {
                  const data = chartData.find(d => d.name === value);
                  return (
                    <span className="text-sm text-foreground">
                      {value}: {data?.atual.toFixed(1)}% (Meta: {data?.meta}%)
                    </span>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
