import { formatDistanceToNow } from "date-fns";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ActivityLog } from "@/lib/types/domain";
import { initials } from "@/lib/utils";

const verbLabels: Record<string, string> = {
  project_created: "created a project",
  project_updated: "updated project settings",
  member_invited: "invited a member",
  member_removed: "removed a member",
  task_created: "created a task",
  task_updated: "updated a task",
  task_deleted: "deleted a task",
  task_status_changed: "changed task status",
  task_assigned: "assigned a task",
  comment_created: "commented",
  attachment_uploaded: "uploaded an attachment"
};

export function ActivityFeed({ items }: { items: ActivityLog[] }) {
  return (
    <div className="space-y-4">
      {items.slice(0, 8).map((item) => (
        <div key={item.id} className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={item.actor?.avatar_url} alt={item.actor?.name} />
            <AvatarFallback>{initials(item.actor?.name, item.actor?.email)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm">
              <span className="font-medium">{item.actor?.name ?? "System"}</span>{" "}
              <span className="text-muted-foreground">{verbLabels[item.verb] ?? item.verb}</span>
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {item.task_title || item.project_name} · {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
