from datetime import timedelta

from django.db.models import Count
from django.shortcuts import get_object_or_404
from django.utils import timezone

from apps.projects.selectors import visible_projects_for
from apps.tasks.models import ActivityLog, Task
from apps.tasks.selectors import visible_activity_for, visible_tasks_for


def _choice_counts(queryset, field: str, choices) -> list[dict]:
    counts = {key: 0 for key, _ in choices}
    labels = dict(choices)
    for row in queryset.values(field).annotate(count=Count("id")):
        counts[row[field]] = row["count"]
    return [{"key": key, "label": labels[key], "count": value} for key, value in counts.items()]


class AnalyticsService:
    @staticmethod
    def dashboard_for(user) -> dict:
        now = timezone.now()
        tasks = visible_tasks_for(user)
        projects = visible_projects_for(user)
        completed = tasks.filter(status=Task.Status.COMPLETED).count()
        total = tasks.count()
        overdue = tasks.exclude(status=Task.Status.COMPLETED).filter(due_date__lt=now).count()
        upcoming = tasks.exclude(status=Task.Status.COMPLETED).filter(due_date__gte=now, due_date__lte=now + timedelta(days=7)).order_by("due_date")[:8]
        assigned = tasks.filter(assigned_user=user).exclude(status=Task.Status.COMPLETED).order_by("due_date")[:8]
        recent_activity = visible_activity_for(user).select_related("actor", "task", "project")[:20]

        last_14_days = []
        for day_offset in range(13, -1, -1):
            day = (now - timedelta(days=day_offset)).date()
            last_14_days.append(
                {
                    "date": day.isoformat(),
                    "completed": tasks.filter(completed_at__date=day).count(),
                    "created": tasks.filter(created_at__date=day).count(),
                }
            )

        return {
            "summary": {
                "projects": projects.count(),
                "tasks": total,
                "completed_tasks": completed,
                "completion_rate": round((completed / total) * 100, 1) if total else 0,
                "overdue_tasks": overdue,
                "active_memberships": projects.filter(memberships__is_active=True).values("memberships__user").distinct().count(),
            },
            "tasks_by_status": _choice_counts(tasks, "status", Task.Status.choices),
            "tasks_by_priority": _choice_counts(tasks, "priority", Task.Priority.choices),
            "productivity": last_14_days,
            "assigned_tasks": assigned,
            "upcoming_deadlines": upcoming,
            "recent_activity": recent_activity,
            "team_activity": list(
                visible_activity_for(user)
                .filter(created_at__gte=now - timedelta(days=14), actor__isnull=False)
                .values("actor__name", "actor__email")
                .annotate(count=Count("id"))
                .order_by("-count")[:8]
            ),
        }

    @staticmethod
    def project_for(user, project_id) -> dict:
        project = get_object_or_404(visible_projects_for(user), id=project_id)
        tasks = visible_tasks_for(user).filter(project=project)
        now = timezone.now()
        return {
            "project": project,
            "summary": {
                "tasks": tasks.count(),
                "completed_tasks": tasks.filter(status=Task.Status.COMPLETED).count(),
                "overdue_tasks": tasks.exclude(status=Task.Status.COMPLETED).filter(due_date__lt=now).count(),
                "members": project.memberships.filter(is_active=True).count(),
            },
            "tasks_by_status": _choice_counts(tasks, "status", Task.Status.choices),
            "tasks_by_priority": _choice_counts(tasks, "priority", Task.Priority.choices),
            "recent_activity": ActivityLog.objects.filter(project=project).select_related("actor", "task", "project")[:20],
        }
