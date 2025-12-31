import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export type TaskStatus = 'inbox' | 'scheduled' | 'completed';
export type TaskArea = 'work' | 'personal' | 'study' | 'health';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskEnergyType = 'deep' | 'shallow';

export interface FocusTask {
  id: string;
  user_id: string;
  title: string;
  status: TaskStatus;
  area: TaskArea;
  priority: TaskPriority;
  energy_type: TaskEnergyType;
  pomodoro_estimate: number;
  scheduled_date: string | null;
  scheduled_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  area: TaskArea;
  priority: TaskPriority;
  energy_type: TaskEnergyType;
  pomodoro_estimate: number;
}

export interface ScheduleTaskInput {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
}

export function useFocusTasks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['focus-tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('focus_tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FocusTask[];
    },
    enabled: !!user?.id,
  });

  const createTask = useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('focus_tasks')
        .insert({
          user_id: user.id,
          title: input.title,
          area: input.area,
          priority: input.priority,
          energy_type: input.energy_type,
          pomodoro_estimate: input.pomodoro_estimate,
          status: 'inbox',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus-tasks'] });
      toast({
        title: 'Tarefa criada',
        description: 'A tarefa foi adicionada ao Inbox.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar tarefa',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const scheduleTask = useMutation({
    mutationFn: async (input: ScheduleTaskInput) => {
      const { data, error } = await supabase
        .from('focus_tasks')
        .update({
          status: 'scheduled',
          scheduled_date: input.scheduled_date,
          scheduled_time: input.scheduled_time,
        })
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus-tasks'] });
      toast({
        title: 'Tarefa agendada',
        description: 'A tarefa foi adicionada ao calendário.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao agendar tarefa',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const completeTask = useMutation({
    mutationFn: async (taskId: string) => {
      const task = tasks.find(t => t.id === taskId);
      const newStatus = task?.status === 'completed' ? 'scheduled' : 'completed';

      const { data, error } = await supabase
        .from('focus_tasks')
        .update({ status: newStatus })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['focus-tasks'] });
      toast({
        title: data.status === 'completed' ? 'Tarefa concluída!' : 'Tarefa reaberta',
      });
    },
  });

  const unscheduleTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { data, error } = await supabase
        .from('focus_tasks')
        .update({
          status: 'inbox',
          scheduled_date: null,
          scheduled_time: null,
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus-tasks'] });
      toast({
        title: 'Tarefa movida para Inbox',
      });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('focus_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus-tasks'] });
      toast({
        title: 'Tarefa excluída',
      });
    },
  });

  const inboxTasks = tasks.filter(t => t.status === 'inbox');
  const scheduledTasks = tasks.filter(t => t.status === 'scheduled' || t.status === 'completed');

  return {
    tasks,
    inboxTasks,
    scheduledTasks,
    isLoading,
    createTask,
    scheduleTask,
    completeTask,
    unscheduleTask,
    deleteTask,
  };
}
