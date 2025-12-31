import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Smartphone, Banknote, Trash2 } from 'lucide-react';
import { TransactionWithCategory } from '@/hooks/useTransactions';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

interface RecentTransactionsProps {
  transactions: TransactionWithCategory[];
  onDelete?: (id: string) => void;
}

export function RecentTransactions({ transactions, onDelete }: RecentTransactionsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
        return <CreditCard className="h-4 w-4" />;
      case 'debit_card':
        return <Banknote className="h-4 w-4" />;
      case 'pix':
        return <Smartphone className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'credit_card':
        return 'Cartão';
      case 'debit_card':
        return 'Débito';
      case 'pix':
        return 'Pix';
      default:
        return type;
    }
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Nenhuma transação registrada ainda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.slice(0, 5).map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background">
                  {getTypeIcon(tx.transaction_type)}
                </div>
                <div>
                  <p className="font-medium text-sm">{tx.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{tx.categories?.name || 'Sem categoria'}</span>
                    <span>•</span>
                    <span>{format(parseISO(tx.date), 'dd MMM', { locale: ptBR })}</span>
                    {tx.installment_total > 1 && (
                      <>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs px-1.5 py-0">
                          {tx.installment_current}/{tx.installment_total}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="font-semibold text-destructive">
                    -{formatCurrency(tx.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">{getTypeLabel(tx.transaction_type)}</p>
                </div>
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(tx.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}