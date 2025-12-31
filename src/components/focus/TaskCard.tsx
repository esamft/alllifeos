import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Clock, Flame, Zap, Briefcase, User, BookOpen, Heart, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FocusTask } from '@/hooks/useFocusTasks';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface TaskCardProps {
  task: FocusTask;
  isDragging?: boolean;
  showCheckbox?: boolean;
  onComplete?: (taskId: string) => void;
  compact?: boolean;
}

const areaConfig = {
  work: { label: 'Trabalho', icon: Briefcase, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  personal: { label: 'Pessoal', icon: User, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  study: { label: 'Estudo', icon: BookOpen, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  health: { label: 'Saúde', icon: Heart, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
};

const priorityConfig = {
  high: { label: 'Alta', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  medium: { label: 'Média', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  low: { label: 'Baixa', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
};

export function TaskCard({ task, isDragging, showCheckbox, onComplete, compact }: TaskCardProps) {
  const area = areaConfig[task.area];
  const priority = priorityConfig[task.priority];
  const isDeepWork = task.energy_type === 'deep';
  const isCompleted = task.status === 'completed';
  const AreaIcon = area.icon;

  return (
    <div
      className={cn(
        'rounded-lg border p-3 transition-all',
        'bg-card hover:bg-accent/50',
        isDeepWork && 'border-l-4 border-l-primary',
        isCompleted && 'opacity-60',
        isDragging && 'shadow-lg ring-2 ring-primary/50 rotate-2',
        compact && 'p-2'
      )}
    >
      <div className="flex items-start gap-2">
        {showCheckbox && (
          <Checkbox
            checked={isCompleted}
            onCheckedChange={() => onComplete?.(task.id)}
            className="mt-0.5"
          />
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab flex-shrink-0" />
            <span className={cn(
              'font-medium truncate',
              isCompleted && 'line-through text-muted-foreground'
            )}>
              {task.title}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {/* Area Badge */}
            <Badge variant="outline" className={cn('text-xs gap-1', area.color)}>
              <AreaIcon className="h-3 w-3" />
              {!compact && area.label}
            </Badge>

            {/* Energy Type Badge */}
            <Badge 
              variant="outline" 
              className={cn(
                'text-xs gap-1',
                isDeepWork 
                  ? 'bg-primary/20 text-primary border-primary/30' 
                  : 'bg-muted text-muted-foreground border-muted-foreground/30'
              )}
            >
              {isDeepWork ? <Flame className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
              {!compact && (isDeepWork ? 'Deep Work' : 'Shallow')}
            </Badge>

            {/* Priority Badge - only on non-compact */}
            {!compact && (
              <Badge variant="outline" className={cn('text-xs', priority.color)}>
                {priority.label}
              </Badge>
            )}

            {/* Pomodoro Estimate */}
            <Badge variant="outline" className="text-xs gap-1 bg-muted/50 text-muted-foreground">
              <Clock className="h-3 w-3" />
              {task.pomodoro_estimate}x 25min
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DraggableTaskCard({ task, ...props }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: task,
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : undefined,
  } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <TaskCard task={task} isDragging={isDragging} {...props} />
    </div>
  );
}
