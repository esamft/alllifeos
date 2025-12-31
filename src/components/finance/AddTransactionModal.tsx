import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { CalendarIcon, Check, ChevronsUpDown, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Category, useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { toast } from '@/hooks/use-toast';

interface AddTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTransactionModal({ open, onOpenChange }: AddTransactionModalProps) {
  const { categories, createCategory } = useCategories();
  const { createTransaction } = useTransactions();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [categoryId, setCategoryId] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [transactionType, setTransactionType] = useState<'pix' | 'credit_card' | 'debit_card'>('pix');
  const [isInstallment, setIsInstallment] = useState(false);
  const [installments, setInstallments] = useState('2');
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCategories = useMemo(() => {
    if (!categorySearch) return categories;
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  const canCreateNewCategory = categorySearch.trim() !== '' && 
    !categories.some((cat) => cat.name.toLowerCase() === categorySearch.toLowerCase());

  const selectedCategory = categories.find((cat) => cat.id === categoryId);

  const handleCreateCategory = async () => {
    if (!categorySearch.trim()) return;
    try {
      const newCategory = await createCategory.mutateAsync({ name: categorySearch.trim() });
      setCategoryId(newCategory.id);
      setCategorySearch('');
      setCategoryPopoverOpen(false);
      toast({
        title: 'Categoria criada',
        description: `"${newCategory.name}" foi criada com teto R$0. Você pode ajustar depois.`,
      });
    } catch (error) {
      toast({
        title: 'Erro ao criar categoria',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !categoryId) {
      toast({
        title: 'Preencha todos os campos',
        description: 'Descrição, valor e categoria são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createTransaction.mutateAsync({
        description,
        amount: parseFloat(amount),
        date: format(date, 'yyyy-MM-dd'),
        category_id: categoryId,
        transaction_type: transactionType,
        installments: isInstallment && transactionType === 'credit_card' ? parseInt(installments) : 1,
      });

      toast({
        title: 'Gasto registrado!',
        description: isInstallment && transactionType === 'credit_card' 
          ? `${installments} parcelas de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(amount) / parseInt(installments))} foram criadas.`
          : 'Transação salva com sucesso.',
      });

      // Reset form
      setDescription('');
      setAmount('');
      setDate(new Date());
      setCategoryId('');
      setTransactionType('pix');
      setIsInstallment(false);
      setInstallments('2');
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Gasto</DialogTitle>
          <DialogDescription>Registre uma nova despesa rapidamente.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Almoço, Uber, Netflix..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoFocus
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Data</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP', { locale: ptBR }) : 'Selecione uma data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => {
                    if (d) setDate(d);
                    setCalendarOpen(false);
                  }}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Category with search and inline creation */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Popover open={categoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    'w-full justify-between',
                    !categoryId && 'text-muted-foreground'
                  )}
                >
                  {selectedCategory?.name || 'Selecione ou crie uma categoria'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Buscar ou criar categoria..."
                    value={categorySearch}
                    onValueChange={setCategorySearch}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {canCreateNewCategory && (
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={handleCreateCategory}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Criar "{categorySearch}"
                        </Button>
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      {filteredCategories.map((category) => (
                        <CommandItem
                          key={category.id}
                          value={category.name}
                          onSelect={() => {
                            setCategoryId(category.id);
                            setCategoryPopoverOpen(false);
                            setCategorySearch('');
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              categoryId === category.id ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          {category.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    {canCreateNewCategory && filteredCategories.length > 0 && (
                      <CommandGroup heading="Criar nova">
                        <CommandItem onSelect={handleCreateCategory}>
                          <Plus className="mr-2 h-4 w-4" />
                          Criar "{categorySearch}"
                        </CommandItem>
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Transaction Type */}
          <div className="space-y-2">
            <Label>Tipo de Pagamento</Label>
            <Select value={transactionType} onValueChange={(v) => setTransactionType(v as typeof transactionType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">Pix</SelectItem>
                <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                <SelectItem value="debit_card">Cartão de Débito</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Installments (only for credit card) */}
          {transactionType === 'credit_card' && (
            <div className="space-y-3 p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="installment"
                  checked={isInstallment}
                  onCheckedChange={(c) => setIsInstallment(!!c)}
                />
                <Label htmlFor="installment" className="text-sm font-normal cursor-pointer">
                  Parcelado?
                </Label>
              </div>
              {isInstallment && (
                <div className="space-y-2">
                  <Label htmlFor="installments">Número de Parcelas</Label>
                  <Select value={installments} onValueChange={setInstallments}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}x de {amount ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(amount) / n) : 'R$ 0,00'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar Gasto'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}