import { useState } from 'react';
import { Plus, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useFocusTasks } from '@/hooks/useFocusTasks';
import { DraggableTaskCard } from './TaskCard';
import { AddTaskModal } from './AddTaskModal';

export function FocusInbox() {
  const { inboxTasks, isLoading } = useFocusTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-full bg-card/50 rounded-xl border">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Inbox className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold">Inbox</h2>
          {inboxTasks.length > 0 && (
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
              {inboxTasks.length}
            </span>
          )}
        </div>
        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Nova Tarefa
        </Button>
      </div>

      {/* Task List */}
      <ScrollArea className="flex-1 p-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : inboxTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-center">
            <Inbox className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground text-sm">
              Nenhuma tarefa no inbox
            </p>
            <p className="text-muted-foreground/70 text-xs mt-1">
              Crie uma tarefa para começar
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {inboxTasks.map((task) => (
              <DraggableTaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Hint */}
      {inboxTasks.length > 0 && (
        <div className="p-3 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            Arraste as tarefas para o calendário →
          </p>
        </div>
      )}

      <AddTaskModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
