import { apiFetch } from "@/lib/api/client";
import type { DashboardAnalytics, ProjectAnalytics, UUID } from "@/lib/types/domain";

export function getDashboardAnalytics() {
  return apiFetch<DashboardAnalytics>("/analytics/dashboard/");
}

export function getProjectAnalytics(projectId: UUID) {
  return apiFetch<ProjectAnalytics>(`/analytics/projects/${projectId}/`);
}
