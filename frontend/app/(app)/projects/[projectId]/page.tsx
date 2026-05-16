"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3, KanbanSquare } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ChoiceBarChart, ChoicePieChart } from "@/components/dashboard/analytics-charts";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { PriorityBadge, StatusBadge } from "@/components/tasks/task-badges";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProjectAnalytics } from "@/lib/api/analytics";
import { getProject, listProjectMembers } from "@/lib/api/projects";
import { listTasks } from "@/lib/api/tasks";
import { useAuthStore } from "@/lib/stores/auth-store";
import { isProjectAdmin } from "@/lib/rbac";
import { formatCompactDate, initials } from "@/lib/utils";

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const user = useAuthStore((state) => state.user);

  const project = useQuery({ queryKey: ["project", projectId], queryFn: () => getProject(projectId) });
  const members = useQuery({ queryKey: ["project-members", projectId], queryFn: () => listProjectMembers(projectId) });
  const tasks = useQuery({ queryKey: ["tasks", projectId, "list"], queryFn: () => listTasks({ project: projectId, ordering: "due_date" }) });
  const analytics = useQuery({ queryKey: ["analytics", "project", projectId], queryFn: () => getProjectAnalytics(projectId) });

  if (project.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-80" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!project.data) return null;
  const canManage = isProjectAdmin(project.data, user);

  return (
    <div>
      <PageHeader
        eyebrow="Project"
        title={project.data.name}
        description={project.data.description}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={`/projects/${projectId}/kanban`}>
                <KanbanSquare className="h-4 w-4" />
                Board
              </Link>
            </Button>
            {canManage && <TaskDialog projectId={projectId} members={members.data ?? project.data.members} />}
          </>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Project analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <ChoicePieChart data={analytics.data?.tasks_by_status ?? []} />
                <ChoiceBarChart data={analytics.data?.tasks_by_priority ?? []} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityFeed items={analytics.data?.recent_activity ?? []} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="tasks">
          {tasks.data?.results.length ? (
            <div className="overflow-hidden rounded-lg border">
              {tasks.data.results.map((task) => (
                <Link
                  key={task.id}
                  href={`/projects/${projectId}/tasks/${task.id}`}
                  className="grid gap-3 border-b bg-card p-4 transition-colors last:border-b-0 hover:bg-secondary/60 md:grid-cols-[1fr_160px_140px_120px]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{task.description}</p>
                  </div>
                  <div>{task.assigned_user?.name ?? "Unassigned"}</div>
                  <div>
                    <PriorityBadge priority={task.priority} />
                  </div>
                  <div>
                    <StatusBadge status={task.status} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={KanbanSquare} title="No tasks yet" description="Create the first task for this project." action={canManage && <TaskDialog projectId={projectId} members={members.data ?? []} />} />
          )}
        </TabsContent>
        <TabsContent value="members">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(members.data ?? project.data.members).map((member) => (
              <Card key={member.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.user.avatar_url} alt={member.user.name} />
                      <AvatarFallback>{initials(member.user.name, member.user.email)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.user.name}</p>
                      <p className="text-xs text-muted-foreground">{member.user.email}</p>
                    </div>
                  </div>
                  <span className="text-xs capitalize text-primary">{member.role}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Due date</p>
            <p className="mt-2 font-medium">{formatCompactDate(project.data.due_date)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Members</p>
            <p className="mt-2 font-medium">{(members.data ?? project.data.members).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Admin controls</p>
            <p className="mt-2 flex items-center gap-2 text-sm">{canManage ? "Available" : "Member access"}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
