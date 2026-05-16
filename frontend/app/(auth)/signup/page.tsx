"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { register } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";

export default function SignupPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" }
  });

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      setAuth({ user: data.user, access: data.access, refresh: data.refresh });
      toast.success("Workspace account created");
      router.replace("/dashboard");
    },
    onError: (error) => toast.error(error.message)
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>Start a focused workspace for your team.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <Input placeholder="Full name" autoComplete="name" {...form.register("name")} />
          <Input type="email" placeholder="Email" autoComplete="email" {...form.register("email")} />
          <Input type="password" placeholder="Password" autoComplete="new-password" {...form.register("password")} />
          <Button className="w-full" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create account
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have access?{" "}
          <Link className="text-primary hover:underline" href="/login">
            Login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
