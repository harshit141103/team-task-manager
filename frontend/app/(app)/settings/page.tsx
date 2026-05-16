"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { updateMe } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth-store";

const profileSchema = z.object({
  name: z.string().min(2).max(160),
  job_title: z.string().max(120).optional(),
  avatar_url: z.string().url().optional().or(z.literal("")),
  timezone: z.string().min(2).max(64)
});

type ProfileInput = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name ?? "",
      job_title: user?.job_title ?? "",
      avatar_url: user?.avatar_url ?? "",
      timezone: user?.timezone ?? "UTC"
    }
  });

  const mutation = useMutation({
    mutationFn: updateMe,
    onSuccess: (updated) => {
      updateUser(updated);
      toast.success("Profile updated");
    },
    onError: (error) => toast.error(error.message)
  });

  return (
    <div>
      <PageHeader eyebrow="Account" title="Profile settings" description="Keep your workspace identity and timezone accurate for team activity." />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <Input placeholder="Full name" {...form.register("name")} />
            <Input placeholder="Job title" {...form.register("job_title")} />
            <Input placeholder="Avatar URL" {...form.register("avatar_url")} />
            <Input placeholder="Timezone" {...form.register("timezone")} />
            <Button disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
