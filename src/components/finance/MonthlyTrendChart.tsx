import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { parseISO, getWeek, startOfMonth, getDate } from 'date-fns';

interface Transaction {
  date: string;
  amount: number;
}

interface MonthlyTrendChartProps {
  transactions: Transaction[];
}

export function MonthlyTrendChart({ transactions }: MonthlyTrendChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Group transactions by week of month
  const weeklyData = transactions.reduce((acc, tx) => {
    const txDate = parseISO(tx.date);
    const dayOfMonth = getDate(txDate);
    const weekOfMonth = Math.ceil(dayOfMonth / 7);
    
    const weekKey = `Semana ${weekOfMonth}`;
    if (!acc[weekKey]) {
      acc[weekKey] = 0;
    }
    acc[weekKey] += Number(tx.amount);
    return acc;
  }, {} as Record<string, number>);

  // Create chart data for 4 weeks
  const chartData = [1, 2, 3, 4, 5].map(week => ({
    name: `S${week}`,
    fullName: `Semana ${week}`,
    value: weeklyData[`Semana ${week}`] || 0,
  })).filter((_, index) => index < 5);

  const hasData = chartData.some(item => item.value > 0);

  if (!hasData) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Evolução Semanal</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground text-sm">Nenhum gasto registrado</p>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border rounded-lg shadow-lg p-3">
          <p className="font-medium">{data.fullName}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Evolução Semanal</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis 
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              className="text-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
