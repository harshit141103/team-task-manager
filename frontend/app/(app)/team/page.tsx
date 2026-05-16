"use client";

import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { InviteMemberDialog } from "@/components/team/invite-member-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { listProjects } from "@/lib/api/projects";
import { useAuthStore } from "@/lib/stores/auth-store";
import { isProjectAdmin } from "@/lib/rbac";
import { initials } from "@/lib/utils";

export default function TeamPage() {
  const user = useAuthStore((state) => state.user);
  const projects = useQuery({ queryKey: ["projects", "team"], queryFn: () => listProjects({ ordering: "name", page: 1 }) });

  return (
    <div>
      <PageHeader
        eyebrow="People"
        title="Team management"
        description="Review active project memberships and add teammates where you have admin access."
      />

      {projects.isLoading ? (
        <Skeleton className="h-96" />
      ) : projects.data?.results.length ? (
        <div className="space-y-5">
          {projects.data.results.map((project) => {
            const canInvite = isProjectAdmin(project, user);
            return (
              <Card key={project.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle>{project.name}</CardTitle>
                  {canInvite && <InviteMemberDialog projectId={project.id} />}
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {project.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between rounded-md border bg-background p-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.user.avatar_url} alt={member.user.name} />
                          <AvatarFallback>{initials(member.user.name, member.user.email)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{member.user.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{member.user.email}</p>
                        </div>
                      </div>
                      <Badge variant={member.role === "admin" ? "default" : "secondary"}>{member.role}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={Users} title="No team memberships" description="Create or join a project to see collaborators here." />
      )}
    </div>
  );
}
