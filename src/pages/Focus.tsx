import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, pointerWithin } from '@dnd-kit/core';
import { format } from 'date-fns';
import { FocusInbox } from '@/components/focus/FocusInbox';
import { FocusDayCalendar } from '@/components/focus/FocusDayCalendar';
import { TaskCard } from '@/components/focus/TaskCard';
import { useFocusTasks, FocusTask } from '@/hooks/useFocusTasks';

export default function Focus() {
  const { scheduleTask, inboxTasks } = useFocusTasks();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTask, setActiveTask] = useState<FocusTask | null>(null);

  const handleDragStart = (event: any) => {
    const task = inboxTasks.find(t => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);

    const { active, over } = event;
    
    if (!over) return;

    const taskId = active.id as string;
    const droppableId = over.id as string;

    // Check if dropped on a time slot
    if (droppableId.startsWith('slot-')) {
      const hour = parseInt(droppableId.split('-')[1], 10);
      const scheduledTime = `${hour.toString().padStart(2, '0')}:00:00`;
      const scheduledDate = format(selectedDate, 'yyyy-MM-dd');

      scheduleTask.mutate({
        id: taskId,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 h-[calc(100vh-4rem)]">
      {/* Breadcrumb */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-1">Início / Agenda</p>
        <h1 className="text-2xl font-bold">Agenda & Foco</h1>
        <p className="text-muted-foreground">Planeje seu dia com blocos de tempo</p>
      </div>

      {/* Split View with DnD Context */}
      <DndContext
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-4 h-[calc(100%-5rem)]">
          {/* Left Column - Inbox (30%) */}
          <FocusInbox />

          {/* Right Column - Day Calendar (70%) */}
          <FocusDayCalendar
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask && (
            <div className="opacity-80">
              <TaskCard task={activeTask} isDragging />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
