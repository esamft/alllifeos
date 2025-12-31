import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Minus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFocusTasks, TaskArea, TaskPriority, TaskEnergyType } from '@/hooks/useFocusTasks';

const formSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
  area: z.enum(['work', 'personal', 'study', 'health']),
  priority: z.enum(['high', 'medium', 'low']),
  energy_type: z.enum(['deep', 'shallow']),
  pomodoro_estimate: z.number().min(1).max(12),
});

type FormData = z.infer<typeof formSchema>;

interface AddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTaskModal({ open, onOpenChange }: AddTaskModalProps) {
  const { createTask } = useFocusTasks();
  const [pomodoroCount, setPomodoroCount] = useState(1);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      area: 'work',
      priority: 'medium',
      energy_type: 'shallow',
      pomodoro_estimate: 1,
    },
  });

  const onSubmit = async (data: FormData) => {
    await createTask.mutateAsync({
      title: data.title,
      area: data.area,
      priority: data.priority,
      energy_type: data.energy_type,
      pomodoro_estimate: pomodoroCount,
    });
    form.reset();
    setPomodoroCount(1);
    onOpenChange(false);
  };

  const handlePomodoroChange = (delta: number) => {
    const newValue = Math.max(1, Math.min(12, pomodoroCount + delta));
    setPomodoroCount(newValue);
    form.setValue('pomodoro_estimate', newValue);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="O que você precisa fazer?" 
                      {...field} 
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Área</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="work">💼 Trabalho</SelectItem>
                        <SelectItem value="personal">👤 Pessoal</SelectItem>
                        <SelectItem value="study">📚 Estudo</SelectItem>
                        <SelectItem value="health">💚 Saúde</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">🔴 Alta</SelectItem>
                        <SelectItem value="medium">🟡 Média</SelectItem>
                        <SelectItem value="low">🟢 Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="energy_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Energia</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="deep">
                        🔥 Deep Work (Foco Total)
                      </SelectItem>
                      <SelectItem value="shallow">
                        ⚡ Shallow Work (Rotina)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Estimativa de Pomodoros (25min cada)</FormLabel>
              <div className="flex items-center gap-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handlePomodoroChange(-1)}
                  disabled={pomodoroCount <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <div className="flex-1 text-center">
                  <span className="text-3xl font-bold">{pomodoroCount}</span>
                  <span className="text-muted-foreground ml-2">
                    = {pomodoroCount * 25}min
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handlePomodoroChange(1)}
                  disabled={pomodoroCount >= 12}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createTask.isPending}>
                {createTask.isPending ? 'Criando...' : 'Criar Tarefa'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
