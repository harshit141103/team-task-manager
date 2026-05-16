import type { Metadata, Viewport } from "next";

import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "TeamTask - Team Task Manager",
    template: "%s | TeamTask"
  },
  description: "A polished SaaS team task manager for project planning, role-based collaboration, Kanban work, and analytics.",
  openGraph: {
    title: "TeamTask",
    description: "Modern team task management with projects, roles, Kanban, and analytics.",
    type: "website"
  }
};

export const viewport: Viewport = {
  themeColor: "#0f141f",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <body>
        <QueryProvider>{children}</QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
