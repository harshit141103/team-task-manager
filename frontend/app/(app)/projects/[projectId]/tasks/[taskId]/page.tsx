"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Loader2, Paperclip, Send, Upload } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { PriorityBadge, StatusBadge } from "@/components/tasks/task-badges";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { createComment, getTask, updateTask, uploadAttachment } from "@/lib/api/tasks";
import type { TaskStatus } from "@/lib/types/domain";
import { commentSchema, type CommentInput } from "@/lib/validations/task";
import { formatCompactDate, initials } from "@/lib/utils";

export default function TaskDetailPage() {
  const params = useParams<{ projectId: string; taskId: string }>();
  const queryClient = useQueryClient();
  const task = useQuery({ queryKey: ["task", params.taskId], queryFn: () => getTask(params.taskId) });
  const form = useForm<CommentInput>({ resolver: zodResolver(commentSchema), defaultValues: { body: "" } });

  const statusMutation = useMutation({
    mutationFn: (status: TaskStatus) => updateTask(params.taskId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", params.taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks", params.projectId] });
      toast.success("Status updated");
    },
    onError: (error) => toast.error(error.message)
  });

  const commentMutation = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", params.taskId] });
      form.reset();
    },
    onError: (error) => toast.error(error.message)
  });

  const uploadMutation = useMutation({
    mutationFn: uploadAttachment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", params.taskId] });
      toast.success("Attachment uploaded");
    },
    onError: (error) => toast.error(error.message)
  });

  if (task.isLoading) return <Skeleton className="h-[620px]" />;
  if (!task.data) return null;

  return (
    <div>
      <PageHeader
        eyebrow="Task"
        title={task.data.title}
        description={task.data.description || "No description provided."}
        actions={
          <Button variant="outline" asChild>
            <Link href={`/projects/${params.projectId}`}>
              <ArrowLeft className="h-4 w-4" />
              Project
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Discussion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {task.data.comments?.length ? (
                task.data.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 rounded-lg border bg-background p-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author.avatar_url} alt={comment.author.name} />
                      <AvatarFallback>{initials(comment.author.name, comment.author.email)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{comment.author.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{comment.body}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">No comments yet.</p>
              )}
              <form className="space-y-3" onSubmit={form.handleSubmit((values) => commentMutation.mutate({ task: params.taskId, body: values.body }))}>
                <Textarea placeholder="Write a comment" {...form.register("body")} />
                <Button disabled={commentMutation.isPending}>
                  {commentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Comment
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-primary" />
                Attachments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {task.data.attachments?.map((attachment) => (
                <a key={attachment.id} href={attachment.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-md border bg-background p-3 text-sm hover:bg-secondary">
                  <span className="truncate">{attachment.original_name}</span>
                  <span className="text-xs text-muted-foreground">{Math.ceil(attachment.size / 1024)} KB</span>
                </a>
              ))}
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed bg-background p-5 text-sm text-muted-foreground hover:bg-secondary">
                <Upload className="h-4 w-4" />
                Upload attachment
                <Input
                  type="file"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) uploadMutation.mutate({ task: params.taskId, file });
                  }}
                />
              </label>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <StatusBadge status={task.data.status} />
              </div>
              <Select value={task.data.status} onValueChange={(value) => statusMutation.mutate(value as TaskStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Todo</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Priority</span>
                <PriorityBadge priority={task.data.priority} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Due</span>
                <span className="inline-flex items-center gap-1 text-sm">
                  <CalendarDays className="h-4 w-4" />
                  {formatCompactDate(task.data.due_date)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Assignee</span>
                <span className="text-sm">{task.data.assigned_user?.name ?? "Unassigned"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created by</span>
                <span className="text-sm">{task.data.created_by?.name ?? "Unknown"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
