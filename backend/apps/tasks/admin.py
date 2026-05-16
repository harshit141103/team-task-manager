from django.contrib import admin

from apps.tasks.models import ActivityLog, Attachment, Task, TaskComment


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "project", "assigned_user", "priority", "status", "due_date")
    search_fields = ("title", "description", "project__name", "assigned_user__email")
    list_filter = ("priority", "status", "project")
    autocomplete_fields = ("project", "assigned_user", "created_by")


@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ("task", "author", "created_at")
    search_fields = ("body", "task__title", "author__email")
    autocomplete_fields = ("task", "author")


@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ("original_name", "task", "uploaded_by", "size", "created_at")
    search_fields = ("original_name", "task__title", "uploaded_by__email")
    autocomplete_fields = ("task", "uploaded_by")


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ("verb", "project", "task", "actor", "created_at")
    search_fields = ("verb", "project__name", "task__title", "actor__email")
    list_filter = ("verb",)
    autocomplete_fields = ("project", "task", "actor")
