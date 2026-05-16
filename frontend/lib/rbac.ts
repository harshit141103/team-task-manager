import type { Project, User } from "@/lib/types/domain";

export function isProjectAdmin(project?: Project | null, user?: User | null) {
  if (!project || !user) return false;
  if (project.owner?.id === user.id) return true;
  return project.members?.some((member) => member.user.id === user.id && member.role === "admin" && member.is_active) ?? false;
}
