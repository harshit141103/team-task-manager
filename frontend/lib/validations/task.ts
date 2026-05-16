import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(2).max(220),
  description: z.string().max(5000).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["todo", "in_progress", "review", "completed"]).default("todo"),
  due_date: z.string().optional().nullable(),
  assigned_user_id: z.string().uuid().optional().nullable()
});

export const commentSchema = z.object({
  body: z.string().min(1).max(4000)
});

export type TaskInput = z.infer<typeof taskSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
