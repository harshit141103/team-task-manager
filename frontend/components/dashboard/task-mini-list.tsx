import Link from "next/link";

import { PriorityBadge, StatusBadge } from "@/components/tasks/task-badges";
import type { Task } from "@/lib/types/domain";
import { formatCompactDate, isOverdue } from "@/lib/utils";

export function TaskMiniList({ tasks }: { tasks: Task[] }) {
  if (!tasks.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No tasks here right now.</p>;
  }

  return (
    <div className="space-y-3">
      {tasks.slice(0, 7).map((task) => (
        <Link
          key={task.id}
          href={`/projects/${task.project}/tasks/${task.id}`}
          className="block rounded-md border bg-background p-3 transition-colors hover:bg-secondary/70"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{task.title}</p>
              <p className={isOverdue(task.due_date) ? "mt-1 text-xs text-red-300" : "mt-1 text-xs text-muted-foreground"}>
                {formatCompactDate(task.due_date)}
              </p>
            </div>
            <PriorityBadge priority={task.priority} />
          </div>
          <div className="mt-3">
            <StatusBadge status={task.status} />
          </div>
        </Link>
      ))}
    </div>
  );
}
