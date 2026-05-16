import { apiFetch, buildQuery } from "@/lib/api/client";
import type { Attachment, PaginatedResponse, Priority, Task, TaskComment, TaskStatus, UUID } from "@/lib/types/domain";

export interface TaskQuery {
  [key: string]: UUID | TaskStatus | Priority | string | number | boolean | undefined;
  project?: UUID;
  status?: TaskStatus;
  priority?: Priority;
  assigned_to_me?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
}

export function listTasks(params: TaskQuery = {}) {
  return apiFetch<PaginatedResponse<Task>>(`/tasks/${buildQuery(params)}`);
}

export function getTask(taskId: UUID) {
  return apiFetch<Task>(`/tasks/${taskId}/`);
}

export function createTask(payload: {
  project: UUID;
  title: string;
  description?: string;
  priority: Priority;
  status?: TaskStatus;
  due_date?: string | null;
  assigned_user_id?: UUID | null;
}) {
  return apiFetch<Task>("/tasks/", { method: "POST", body: JSON.stringify(payload) });
}

export function updateTask(taskId: UUID, payload: Partial<Omit<Task, "assigned_user">> & { assigned_user_id?: UUID | null }) {
  return apiFetch<Task>(`/tasks/${taskId}/`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function deleteTask(taskId: UUID) {
  return apiFetch<null>(`/tasks/${taskId}/`, { method: "DELETE" });
}

export function createComment(payload: { task: UUID; body: string }) {
  return apiFetch<TaskComment>("/comments/", { method: "POST", body: JSON.stringify(payload) });
}

export function uploadAttachment(payload: { task: UUID; file: File }) {
  const form = new FormData();
  form.append("task", payload.task);
  form.append("file", payload.file);
  return apiFetch<Attachment>("/attachments/", { method: "POST", body: form });
}
