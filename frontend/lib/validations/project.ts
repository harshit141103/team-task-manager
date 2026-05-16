import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(2).max(180),
  description: z.string().max(1200).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#14b8a6"),
  due_date: z.string().optional().nullable()
});

export const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member"])
});

export type ProjectInput = z.infer<typeof projectSchema>;
export type InviteInput = z.infer<typeof inviteSchema>;
