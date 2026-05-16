from apps.projects.selectors import user_project_ids
from apps.tasks.models import ActivityLog, Task


def visible_tasks_for(user):
    if user.is_staff:
        return Task.objects.all()
    return Task.objects.filter(project_id__in=user_project_ids(user)).distinct()


def visible_activity_for(user):
    if user.is_staff:
        return ActivityLog.objects.all()
    return ActivityLog.objects.filter(project_id__in=user_project_ids(user)).distinct()
