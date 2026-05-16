"use client";

import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CalendarDays, MessageSquare, Paperclip } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PriorityBadge, statusLabels } from "@/components/tasks/task-badges";
import { listTasks, updateTask } from "@/lib/api/tasks";
import type { PaginatedResponse, Project, Task, TaskStatus } from "@/lib/types/domain";
import { cn, formatCompactDate, initials, isOverdue } from "@/lib/utils";

const statuses: TaskStatus[] = ["todo", "in_progress", "review", "completed"];

function TaskCardContent({ task }: { task: Task }) {
  return (
    <Link href={`/projects/${task.project}/tasks/${task.id}`} className="block">
      <div className="flex items-start justify-between gap-3">
        <p className="line-clamp-2 text-sm font-medium">{task.title}</p>
        <PriorityBadge priority={task.priority} />
      </div>
      {task.description && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>}
      <div className="mt-4 flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className={cn("inline-flex items-center gap-1", isOverdue(task.due_date) && task.status !== "completed" && "text-red-300")}>
          <CalendarDays className="h-3.5 w-3.5" />
          {formatCompactDate(task.due_date)}
        </span>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            {task.comments_count ?? 0}
          </span>
          <span className="inline-flex items-center gap-1">
            <Paperclip className="h-3.5 w-3.5" />
            {task.attachments_count ?? 0}
          </span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <Badge variant={task.status === "completed" ? "success" : "outline"}>{statusLabels[task.status]}</Badge>
        {task.assigned_user && (
          <Avatar className="h-7 w-7">
            <AvatarImage src={task.assigned_user.avatar_url} alt={task.assigned_user.name} />
            <AvatarFallback>{initials(task.assigned_user.name, task.assigned_user.email)}</AvatarFallback>
          </Avatar>
        )}
      </div>
    </Link>
  );
}

function KanbanCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id, data: { task } });
  const style = { transform: CSS.Translate.toString(transform) };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      {...listeners}
      {...attributes}
      className={cn("touch-none rounded-lg border bg-background p-3 shadow-sm transition-colors hover:bg-secondary/60", isDragging && "opacity-35")}
    >
      <TaskCardContent task={task} />
    </motion.div>
  );
}

function KanbanColumn({ status, tasks }: { status: TaskStatus; tasks: Task[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status, data: { status } });

  return (
    <section ref={setNodeRef} className={cn("flex min-h-[520px] flex-col rounded-lg border bg-card", isOver && "border-primary/60 bg-primary/5")}>
      <div className="flex h-12 items-center justify-between border-b px-3">
        <h2 className="text-sm font-semibold">{statusLabels[status]}</h2>
        <Badge variant="secondary">{tasks.length}</Badge>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-3">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} />
        ))}
      </div>
    </section>
  );
}

export function KanbanBoard({ project }: { project: Project }) {
  const queryClient = useQueryClient();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const queryKey = ["tasks", project.id, "kanban"];
  const tasksQuery = useQuery({
    queryKey,
    queryFn: () => listTasks({ project: project.id, ordering: "due_date", page: 1 })
  });

  const mutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) => updateTask(taskId, { status }),
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<PaginatedResponse<Task>>(queryKey);
      queryClient.setQueryData<PaginatedResponse<Task>>(queryKey, (old) =>
        old ? { ...old, results: old.results.map((task) => (task.id === taskId ? { ...task, status } : task)) } : old
      );
      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
      toast.error(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    }
  });

  const tasksByStatus = useMemo(() => {
    const grouped = Object.fromEntries(statuses.map((status) => [status, [] as Task[]])) as Record<TaskStatus, Task[]>;
    for (const task of tasksQuery.data?.results ?? []) grouped[task.status].push(task);
    return grouped;
  }, [tasksQuery.data?.results]);

  const handleDragEnd = (event: DragEndEvent) => {
    const task = activeTask;
    setActiveTask(null);
    const overId = event.over?.id as TaskStatus | string | undefined;
    if (!task || !overId) return;
    const nextStatus = statuses.includes(overId as TaskStatus)
      ? (overId as TaskStatus)
      : tasksQuery.data?.results.find((candidate) => candidate.id === overId)?.status;
    if (nextStatus && nextStatus !== task.status) mutation.mutate({ taskId: task.id, status: nextStatus });
  };

  if (tasksQuery.isLoading) {
    return (
      <div className="grid gap-4 xl:grid-cols-4">
        {statuses.map((status) => (
          <Skeleton key={status} className="h-[620px]" />
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(event) => setActiveTask(event.active.data.current?.task as Task)}
      onDragCancel={() => setActiveTask(null)}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-4 xl:grid-cols-4">
        {statuses.map((status) => (
          <KanbanColumn key={status} status={status} tasks={tasksByStatus[status]} />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="rounded-lg border bg-background p-3 shadow-glow">
            <TaskCardContent task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
