"use client";

import { motion } from "framer-motion";
import { ArrowRight, BarChart3, CheckCircle2, LayoutDashboard, Lock, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const readinessItems = [
    "JWT auth",
    "Admin/member RBAC",
    "Projects + tasks",
    "Railway ready"
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <section className="dashboard-grid relative flex min-h-screen flex-col">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <span className="font-semibold">TeamTask</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Start free</Link>
            </Button>
          </div>
        </nav>

        <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-8 px-4 pb-10 pt-8 md:px-6 lg:grid-cols-[0.92fr_1.08fr]">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <Badge variant="outline" className="mb-5 border-primary/30 text-primary">
              Full-stack assignment build
            </Badge>
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-balance md:text-7xl">TeamTask</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              Plan launches, assign ownership, move work across a fast Kanban board, and keep every decision traceable with role-based project controls.
            </p>
            <div className="mt-6 grid max-w-2xl grid-cols-2 gap-2 sm:grid-cols-4">
              {readinessItems.map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-md border bg-card/80 px-3 py-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Create workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">View demo</Link>
              </Button>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                RBAC
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-amber-300" />
                Analytics
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-pink-300" />
                Team flow
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="relative"
            aria-label="TeamTask product dashboard preview"
          >
            <div className="rounded-lg border bg-card shadow-glow">
              <div className="flex h-12 items-center justify-between border-b px-4">
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Launch Operations Hub</span>
                </div>
                <Badge variant="success">76%</Badge>
              </div>
              <div className="grid gap-3 border-b p-4 sm:grid-cols-3">
                {[
                  ["Overdue", "3", "text-amber-200"],
                  ["Assigned", "18", "text-primary"],
                  ["Members", "7", "text-pink-200"]
                ].map(([label, value, tone]) => (
                  <div key={label} className="rounded-md border bg-background px-3 py-2">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className={`mt-1 text-2xl font-semibold ${tone}`}>{value}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-4 p-4 md:grid-cols-[0.7fr_1.3fr]">
                <div className="space-y-3">
                  {["Activation", "QA", "Analytics", "Billing"].map((item, index) => (
                    <div key={item} className="rounded-md border bg-background p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{item}</span>
                        <span className="text-xs text-muted-foreground">{index + 3} tasks</span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${72 - index * 10}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Todo", "Finalize copy", "Medium"],
                    ["In Progress", "Onboarding checklist", "High"],
                    ["Review", "Analytics SQL", "Urgent"],
                    ["Completed", "QA smoke plan", "Low"]
                  ].map(([status, title, priority]) => (
                    <div key={title} className="min-h-36 rounded-md border bg-background p-3">
                      <p className="text-xs text-muted-foreground">{status}</p>
                      <p className="mt-3 text-sm font-medium">{title}</p>
                      <div className="mt-5 flex items-center justify-between">
                        <Badge variant={priority === "Urgent" ? "danger" : priority === "High" ? "warning" : "secondary"}>{priority}</Badge>
                        <div className="flex -space-x-2">
                          <span className="h-7 w-7 rounded-full border bg-primary" />
                          <span className="h-7 w-7 rounded-full border bg-amber-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
