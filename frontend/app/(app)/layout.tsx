import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/providers/auth-guard";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
