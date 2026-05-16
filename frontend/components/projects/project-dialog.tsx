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
import { Textarea } from "@/components/ui/textarea";
import { createProject } from "@/lib/api/projects";
import { projectSchema, type ProjectInput } from "@/lib/validations/project";

const colorOptions = ["#14b8a6", "#f59e0b", "#ec4899", "#22c55e", "#8b5cf6"];

export function ProjectDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: "", description: "", color: "#14b8a6", due_date: "" }
  });

  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created");
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
          New project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>Set up a focused workspace with admins, members, tasks, and activity tracking.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate({ ...values, due_date: values.due_date || null }))}>
          <Input placeholder="Project name" {...form.register("name")} />
          <Textarea placeholder="Project description" {...form.register("description")} />
          <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
            <Input type="date" {...form.register("due_date")} />
            <div className="flex items-center gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Use color ${color}`}
                  onClick={() => form.setValue("color", color)}
                  className="h-8 w-8 rounded-full border-2 border-background ring-1 ring-border"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <Button className="w-full" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create project
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
