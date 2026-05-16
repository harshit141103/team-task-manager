"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { KanbanBoard } from "@/components/kanban/kanban-board";
import { PageHeader } from "@/components/layout/page-header";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getProject, listProjectMembers } from "@/lib/api/projects";
import { useAuthStore } from "@/lib/stores/auth-store";
import { isProjectAdmin } from "@/lib/rbac";

export default function KanbanPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const user = useAuthStore((state) => state.user);
  const project = useQuery({ queryKey: ["project", projectId], queryFn: () => getProject(projectId) });
  const members = useQuery({ queryKey: ["project-members", projectId], queryFn: () => listProjectMembers(projectId) });

  if (project.isLoading) return <Skeleton className="h-[680px]" />;
  if (!project.data) return null;

  const canManage = isProjectAdmin(project.data, user);

  return (
    <div>
      <PageHeader
        eyebrow="Kanban"
        title={project.data.name}
        description="Drag tasks between statuses. Updates are applied optimistically and reconciled with backend permissions."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={`/projects/${projectId}`}>
                <ArrowLeft className="h-4 w-4" />
                Project
              </Link>
            </Button>
            {canManage && <TaskDialog projectId={projectId} members={members.data ?? project.data.members} />}
          </>
        }
      />
      <KanbanBoard project={project.data} />
    </div>
  );
}
