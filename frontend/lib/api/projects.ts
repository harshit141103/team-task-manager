import { apiFetch, buildQuery } from "@/lib/api/client";
import type { PaginatedResponse, Project, ProjectMember, Role, UUID } from "@/lib/types/domain";

export function listProjects(params: { search?: string; ordering?: string; page?: number; archived?: boolean } = {}) {
  return apiFetch<PaginatedResponse<Project>>(`/projects/${buildQuery(params)}`);
}

export function getProject(projectId: UUID) {
  return apiFetch<Project>(`/projects/${projectId}/`);
}

export function createProject(payload: { name: string; description?: string; color?: string; due_date?: string | null }) {
  return apiFetch<Project>("/projects/", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateProject(projectId: UUID, payload: Partial<Project>) {
  return apiFetch<Project>(`/projects/${projectId}/`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteProject(projectId: UUID) {
  return apiFetch<null>(`/projects/${projectId}/`, { method: "DELETE" });
}

export function listProjectMembers(projectId: UUID) {
  return apiFetch<ProjectMember[]>(`/projects/${projectId}/members/`);
}

export function inviteProjectMember(projectId: UUID, payload: { email: string; role: Role }) {
  return apiFetch<ProjectMember>(`/projects/${projectId}/invite/`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function removeProjectMember(projectId: UUID, memberId: UUID) {
  return apiFetch<null>(`/projects/${projectId}/members/${memberId}/`, { method: "DELETE" });
}
