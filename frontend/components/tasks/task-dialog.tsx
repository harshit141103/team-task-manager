"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createTask } from "@/lib/api/tasks";
import type { ProjectMember, UUID } from "@/lib/types/domain";
import { taskSchema, type TaskInput } from "@/lib/validations/task";

export function TaskDialog({ projectId, members }: { projectId: UUID; members: ProjectMember[] }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "todo",
      due_date: "",
      assigned_user_id: null
    }
  });

  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Task created");
      form.reset();
      setOpen(false);
    },
    onError: (error) => toast.error(error.message)
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          New task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create task</DialogTitle>
          <DialogDescription>Assign ownership, priority, and a target date.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) =>
            mutation.mutate({
              ...values,
              project: projectId,
              due_date: values.due_date ? new Date(values.due_date).toISOString() : null,
              assigned_user_id: values.assigned_user_id || null
            })
          )}
        >
          <Input placeholder="Task title" {...form.register("title")} />
          <Textarea placeholder="Task description" {...form.register("description")} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Select value={form.watch("priority")} onValueChange={(value) => form.setValue("priority", value as TaskInput["priority"])}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={form.watch("status")} onValueChange={(value) => form.setValue("status", value as TaskInput["status"])}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">Todo</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input type="datetime-local" {...form.register("due_date")} />
            <Select value={form.watch("assigned_user_id") ?? "unassigned"} onValueChange={(value) => form.setValue("assigned_user_id", value === "unassigned" ? null : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {members.map((member) => (
                  <SelectItem key={member.user.id} value={member.user.id}>
                    {member.user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create task
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
