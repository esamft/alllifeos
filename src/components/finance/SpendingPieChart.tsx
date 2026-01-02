import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CategorySpending {
  name: string;
  spent: number;
  group: 'essenciais' | 'estilo_de_vida';
}

interface SpendingPieChartProps {
  categories: CategorySpending[];
}

const COLORS_ESSENCIAIS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];
const COLORS_ESTILO = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

export function SpendingPieChart({ categories }: SpendingPieChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Filter categories with spending > 0
  const dataWithSpending = categories.filter(c => c.spent > 0);

  if (dataWithSpending.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Gastos por Categoria</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground text-sm">Nenhum gasto registrado</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = dataWithSpending.map((cat, index) => ({
    name: cat.name,
    value: cat.spent,
    fill: cat.group === 'essenciais' 
      ? COLORS_ESSENCIAIS[index % COLORS_ESSENCIAIS.length]
      : COLORS_ESTILO[index % COLORS_ESTILO.length],
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="bg-popover border rounded-lg shadow-lg p-3">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(data.value)} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Gastos por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-2 flex flex-wrap gap-2 justify-center text-xs">
          {chartData.slice(0, 5).map((item, index) => (
            <div key={index} className="flex items-center gap-1">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-muted-foreground truncate max-w-[80px]">{item.name}</span>
            </div>
          ))}
          {chartData.length > 5 && (
            <span className="text-muted-foreground">+{chartData.length - 5}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
