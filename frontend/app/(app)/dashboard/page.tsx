"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Clock, FolderKanban, Users } from "lucide-react";

import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ChoiceBarChart, ChoicePieChart, ProductivityChart } from "@/components/dashboard/analytics-charts";
import { MetricCard } from "@/components/dashboard/metric-card";
import { TaskMiniList } from "@/components/dashboard/task-mini-list";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardAnalytics } from "@/lib/api/analytics";

export default function DashboardPage() {
  const analytics = useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: getDashboardAnalytics
  });

  if (analytics.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-80" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const data = analytics.data;
  if (!data) return null;

  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title="Dashboard"
        description="A live overview of project health, assigned work, deadlines, and team momentum."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Active projects" value={data.summary.projects} icon={FolderKanban} detail="Visible to your account" />
        <MetricCard title="Completion rate" value={`${data.summary.completion_rate}%`} icon={CheckCircle2} tone="green" detail={`${data.summary.completed_tasks} completed tasks`} />
        <MetricCard title="Overdue" value={data.summary.overdue_tasks} icon={AlertCircle} tone="amber" detail="Needs attention today" />
        <MetricCard title="Collaborators" value={data.summary.active_memberships} icon={Users} tone="pink" detail="Across active projects" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <CardHeader>
            <CardTitle>Productivity overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductivityChart data={data.productivity} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed items={data.recent_activity} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Tasks by status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChoicePieChart data={data.tasks_by_status} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tasks by priority</CardTitle>
          </CardHeader>
          <CardContent>
            <ChoiceBarChart data={data.tasks_by_priority} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Upcoming deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TaskMiniList tasks={data.upcoming_deadlines} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assigned to you</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskMiniList tasks={data.assigned_tasks} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Team activity insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.team_activity.length ? (
              data.team_activity.map((person) => (
                <div key={person.actor__email} className="flex items-center justify-between rounded-md border bg-background p-3">
                  <div>
                    <p className="text-sm font-medium">{person.actor__name}</p>
                    <p className="text-xs text-muted-foreground">{person.actor__email}</p>
                  </div>
                  <span className="text-sm text-primary">{person.count} updates</span>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No activity yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
