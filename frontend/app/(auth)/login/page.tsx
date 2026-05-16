"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "admin@teamtask.dev", password: "ChangeMe123!" }
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth({ user: data.user, access: data.access, refresh: data.refresh });
      toast.success("Welcome back");
      router.replace(params.get("next") || "/dashboard");
    },
    onError: (error) => toast.error(error.message)
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Use the demo credentials or your own workspace account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <div>
            <Input type="email" placeholder="Email" autoComplete="email" {...form.register("email")} />
            {form.formState.errors.email && <p className="mt-1 text-xs text-red-300">{form.formState.errors.email.message}</p>}
          </div>
          <div>
            <Input type="password" placeholder="Password" autoComplete="current-password" {...form.register("password")} />
            {form.formState.errors.password && <p className="mt-1 text-xs text-red-300">{form.formState.errors.password.message}</p>}
          </div>
          <Button className="w-full" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Continue
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link className="text-primary hover:underline" href="/signup">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
