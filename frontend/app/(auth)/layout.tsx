import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="dashboard-grid flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <Link href="/" className="text-sm font-semibold">
          TeamTask
        </Link>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          Back home
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-10">{children}</div>
    </main>
  );
}
