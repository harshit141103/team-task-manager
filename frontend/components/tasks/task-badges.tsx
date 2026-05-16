import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { Priority, TaskStatus } from "@/lib/types/domain";

export const statusLabels: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  review: "Review",
  completed: "Completed"
};

export const priorityLabels: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent"
};

const priorityVariant: Record<Priority, BadgeProps["variant"]> = {
  low: "secondary",
  medium: "default",
  high: "warning",
  urgent: "danger"
};

const statusVariant: Record<TaskStatus, BadgeProps["variant"]> = {
  todo: "outline",
  in_progress: "default",
  review: "pink",
  completed: "success"
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge variant={priorityVariant[priority]}>{priorityLabels[priority]}</Badge>;
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <Badge variant={statusVariant[status]}>{statusLabels[status]}</Badge>;
}
