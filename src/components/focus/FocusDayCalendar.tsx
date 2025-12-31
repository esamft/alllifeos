import { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFocusTasks, FocusTask } from '@/hooks/useFocusTasks';
import { TaskCard } from './TaskCard';

interface FocusDayCalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

// Generate time slots from 06:00 to 23:00
const TIME_SLOTS = Array.from({ length: 18 }, (_, i) => {
  const hour = i + 6;
  return {
    hour,
    label: `${hour.toString().padStart(2, '0')}:00`,
  };
});

const SLOT_HEIGHT = 60; // pixels per 30 minutes
const POMODORO_HEIGHT = SLOT_HEIGHT; // 1 pomodoro = 30min = 60px

interface TimeSlotProps {
  slot: { hour: number; label: string };
  tasks: FocusTask[];
  onComplete: (taskId: string) => void;
}

function TimeSlot({ slot, tasks, onComplete }: TimeSlotProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `slot-${slot.hour}`,
    data: { hour: slot.hour },
  });

  const slotTasks = tasks.filter((task) => {
    if (!task.scheduled_time) return false;
    const taskHour = parseInt(task.scheduled_time.split(':')[0], 10);
    return taskHour === slot.hour;
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative border-t border-border/50 transition-colors min-h-[60px]',
        isOver && 'bg-primary/10 border-primary/50'
      )}
    >
      {/* Hour Label */}
      <div className="absolute -top-3 left-0 text-xs text-muted-foreground bg-background px-1">
        {slot.label}
      </div>

      {/* Tasks */}
      <div className="ml-14 pr-2 py-1 space-y-1">
        {slotTasks.map((task) => (
          <div
            key={task.id}
            style={{
              minHeight: task.pomodoro_estimate * POMODORO_HEIGHT - 8,
            }}
          >
            <TaskCard
              task={task}
              showCheckbox
              onComplete={onComplete}
              compact
            />
          </div>
        ))}
      </div>

      {/* Drop indicator when empty */}
      {slotTasks.length === 0 && isOver && (
        <div className="ml-14 mr-2 mt-1 h-12 border-2 border-dashed border-primary/50 rounded-lg flex items-center justify-center">
          <span className="text-xs text-primary">Soltar aqui</span>
        </div>
      )}
    </div>
  );
}

export function FocusDayCalendar({ selectedDate, onDateChange }: FocusDayCalendarProps) {
  const { scheduledTasks, completeTask } = useFocusTasks();

  const formattedDate = format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR });

  const todayTasks = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return scheduledTasks.filter((task) => task.scheduled_date === dateStr);
  }, [scheduledTasks, selectedDate]);

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const handleComplete = (taskId: string) => {
    completeTask.mutate(taskId);
  };

  return (
    <div className="flex flex-col h-full bg-card/50 rounded-xl border">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold">Planejamento do Dia</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goToPreviousDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hoje
          </Button>
          
          <Button variant="ghost" size="icon" onClick={goToNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Date Display */}
      <div className="px-4 py-2 bg-muted/30 border-b">
        <p className="text-sm font-medium capitalize">{formattedDate}</p>
        <p className="text-xs text-muted-foreground">
          {todayTasks.length} tarefa{todayTasks.length !== 1 ? 's' : ''} agendada{todayTasks.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Time Grid */}
      <ScrollArea className="flex-1">
        <div className="p-4 pt-6 space-y-0">
          {TIME_SLOTS.map((slot) => (
            <TimeSlot
              key={slot.hour}
              slot={slot}
              tasks={todayTasks}
              onComplete={handleComplete}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Legend */}
      <div className="p-3 border-t bg-muted/30 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded border-l-2 border-l-primary bg-card" />
          <span>Deep Work</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-card border" />
          <span>Shallow Work</span>
        </div>
      </div>
    </div>
  );
}
