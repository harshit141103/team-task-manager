"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, AlertCircle, CheckCircle2, FolderKanban } from "lucide-react";

import { ChoiceBarChart, ChoicePieChart, ProductivityChart } from "@/components/dashboard/analytics-charts";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardAnalytics } from "@/lib/api/analytics";

export default function AnalyticsPage() {
  const analytics = useQuery({ queryKey: ["analytics", "dashboard"], queryFn: getDashboardAnalytics });

  if (analytics.isLoading) return <Skeleton className="h-[680px]" />;
  if (!analytics.data) return null;

  return (
    <div>
      <PageHeader
        eyebrow="Insights"
        title="Analytics"
        description="Track delivery flow, priority mix, and completion velocity across projects you can access."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard title="Tasks" value={analytics.data.summary.tasks} icon={Activity} />
        <MetricCard title="Projects" value={analytics.data.summary.projects} icon={FolderKanban} tone="pink" />
        <MetricCard title="Completed" value={analytics.data.summary.completed_tasks} icon={CheckCircle2} tone="green" />
        <MetricCard title="Overdue" value={analytics.data.summary.overdue_tasks} icon={AlertCircle} tone="amber" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader>
            <CardTitle>Completion velocity</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductivityChart data={analytics.data.productivity} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Status distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChoicePieChart data={analytics.data.tasks_by_status} />
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Priority load</CardTitle>
          </CardHeader>
          <CardContent>
            <ChoiceBarChart data={analytics.data.tasks_by_priority} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
