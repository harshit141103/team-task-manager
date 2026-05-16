export type UUID = string;

export type Role = "admin" | "member";
export type Priority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "review" | "completed";

export interface PaginatedResponse<T> {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface User {
  id: UUID;
  email: string;
  username?: string;
  name: string;
  avatar_url?: string;
  job_title?: string;
  timezone?: string;
  initials?: string;
  date_joined?: string;
}

export interface ProjectMember {
  id: UUID;
  user: User;
  role: Role;
  invited_by?: User | null;
  is_active: boolean;
  joined_at: string;
}

export interface Project {
  id: UUID;
  name: string;
  slug: string;
  description: string;
  color: string;
  owner: User;
  due_date?: string | null;
  archived: boolean;
  members: ProjectMember[];
  task_counts: Record<TaskStatus, number>;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: UUID;
  project: UUID;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  due_date?: string | null;
  assigned_user?: User | null;
  created_by?: User;
  comments_count?: number;
  attachments_count?: number;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  comments?: TaskComment[];
  attachments?: Attachment[];
}

export interface TaskComment {
  id: UUID;
  task: UUID;
  author: User;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: UUID;
  task: UUID;
  uploaded_by: User;
  file: string;
  url: string;
  original_name: string;
  content_type: string;
  size: number;
  created_at: string;
}

export interface ActivityLog {
  id: UUID;
  project: UUID;
  project_name: string;
  task?: UUID | null;
  task_title?: string | null;
  actor?: User | null;
  verb: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AnalyticsSummary {
  projects: number;
  tasks: number;
  completed_tasks: number;
  completion_rate: number;
  overdue_tasks: number;
  active_memberships: number;
  members?: number;
}

export interface ChoiceCount {
  key: string;
  label: string;
  count: number;
}

export interface ProductivityPoint {
  date: string;
  completed: number;
  created: number;
}

export interface DashboardAnalytics {
  summary: AnalyticsSummary;
  tasks_by_status: ChoiceCount[];
  tasks_by_priority: ChoiceCount[];
  productivity: ProductivityPoint[];
  assigned_tasks: Task[];
  upcoming_deadlines: Task[];
  recent_activity: ActivityLog[];
  team_activity: Array<{ actor__name: string; actor__email: string; count: number }>;
}

export interface ProjectAnalytics {
  project: Project;
  summary: AnalyticsSummary;
  tasks_by_status: ChoiceCount[];
  tasks_by_priority: ChoiceCount[];
  recent_activity: ActivityLog[];
}
