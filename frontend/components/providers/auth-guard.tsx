"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { getMe } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, accessToken, hasHydrated, updateUser, clearAuth } = useAuthStore();

  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    enabled: hasHydrated && Boolean(accessToken),
    retry: false
  });

  useEffect(() => {
    if (meQuery.data) updateUser(meQuery.data);
  }, [meQuery.data, updateUser]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!accessToken || meQuery.isError) {
      clearAuth();
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [accessToken, clearAuth, hasHydrated, meQuery.isError, pathname, router]);

  if (!hasHydrated || (!user && !meQuery.data)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
