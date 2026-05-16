"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      toastOptions={{
        classNames: {
          toast: "border border-border bg-popover text-foreground",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground"
        }
      }}
    />
  );
}
