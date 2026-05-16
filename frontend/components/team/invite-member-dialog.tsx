"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { inviteProjectMember } from "@/lib/api/projects";
import type { UUID } from "@/lib/types/domain";
import { inviteSchema, type InviteInput } from "@/lib/validations/project";

export function InviteMemberDialog({ projectId }: { projectId: UUID }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<InviteInput>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", role: "member" }
  });

  const mutation = useMutation({
    mutationFn: (values: InviteInput) => inviteProjectMember(projectId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-members", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Member added");
      form.reset();
      setOpen(false);
    },
    onError: (error) => toast.error(error.message)
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <UserPlus className="h-4 w-4" />
          Invite
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>Add an existing user to this project with the right level of access.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <Input type="email" placeholder="teammate@company.com" {...form.register("email")} />
          <Select value={form.watch("role")} onValueChange={(value) => form.setValue("role", value as InviteInput["role"])}>
            <SelectTrigger>
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Add member
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
