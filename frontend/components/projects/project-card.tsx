import { ArrowRight, CalendarDays, Users } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Project } from "@/lib/types/domain";
import { formatCompactDate, initials } from "@/lib/utils";

export function ProjectCard({ project }: { project: Project }) {
  const totalTasks = Object.values(project.task_counts ?? {}).reduce((sum, count) => sum + count, 0);
  const completed = project.task_counts?.completed ?? 0;
  const progress = totalTasks ? Math.round((completed / totalTasks) * 100) : 0;

  return (
    <Card className="transition-colors hover:bg-card/80">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
              <h3 className="truncate text-base font-semibold">{project.name}</h3>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{project.description || "No description yet."}</p>
          </div>
          <Badge variant={progress >= 80 ? "success" : progress >= 40 ? "default" : "warning"}>{progress}%</Badge>
        </div>

        <div className="mt-5 h-2 rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            {formatCompactDate(project.due_date)}
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {project.members.length}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex -space-x-2">
            {project.members.slice(0, 4).map((member) => (
              <Avatar key={member.id} className="h-8 w-8 border-2 border-card">
                <AvatarImage src={member.user.avatar_url} alt={member.user.name} />
                <AvatarFallback>{initials(member.user.name, member.user.email)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <Link href={`/projects/${project.id}`} className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
            Open
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
