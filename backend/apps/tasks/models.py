import uuid
from pathlib import Path

from django.conf import settings
from django.db import models
from django.utils import timezone

from apps.common.validators import validate_attachment


class Task(models.Model):
    class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"
        URGENT = "urgent", "Urgent"

    class Status(models.TextChoices):
        TODO = "todo", "Todo"
        IN_PROGRESS = "in_progress", "In Progress"
        REVIEW = "review", "Review"
        COMPLETED = "completed", "Completed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey("projects.Project", on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=220)
    description = models.TextField(blank=True)
    priority = models.CharField(max_length=16, choices=Priority.choices, default=Priority.MEDIUM)
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.TODO)
    due_date = models.DateTimeField(null=True, blank=True)
    assigned_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_tasks")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="created_tasks")
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["due_date", "-updated_at"]
        indexes = [
            models.Index(fields=["project", "status"]),
            models.Index(fields=["project", "priority"]),
            models.Index(fields=["assigned_user", "status"]),
            models.Index(fields=["due_date"]),
            models.Index(fields=["created_at"]),
        ]

    def save(self, *args, **kwargs):
        if self.status == self.Status.COMPLETED and not self.completed_at:
            self.completed_at = timezone.now()
        if self.status != self.Status.COMPLETED:
            self.completed_at = None
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.title


class TaskComment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="task_comments")
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["task", "created_at"]),
            models.Index(fields=["author", "created_at"]),
        ]


def task_attachment_path(instance, filename: str) -> str:
    safe_name = Path(filename).name
    return f"projects/{instance.task.project_id}/tasks/{instance.task_id}/{uuid.uuid4()}-{safe_name}"


class Attachment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="attachments")
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="task_attachments")
    file = models.FileField(upload_to=task_attachment_path, validators=[validate_attachment])
    original_name = models.CharField(max_length=255)
    content_type = models.CharField(max_length=120, blank=True)
    size = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["task", "created_at"]),
            models.Index(fields=["uploaded_by", "created_at"]),
        ]

    def save(self, *args, **kwargs):
        if self.file and not self.original_name:
            self.original_name = Path(self.file.name).name
        if self.file and not self.size:
            self.size = self.file.size
        super().save(*args, **kwargs)


class ActivityLog(models.Model):
    class Verb(models.TextChoices):
        PROJECT_CREATED = "project_created", "Project created"
        PROJECT_UPDATED = "project_updated", "Project updated"
        MEMBER_INVITED = "member_invited", "Member invited"
        MEMBER_REMOVED = "member_removed", "Member removed"
        TASK_CREATED = "task_created", "Task created"
        TASK_UPDATED = "task_updated", "Task updated"
        TASK_DELETED = "task_deleted", "Task deleted"
        TASK_STATUS_CHANGED = "task_status_changed", "Task status changed"
        TASK_ASSIGNED = "task_assigned", "Task assigned"
        COMMENT_CREATED = "comment_created", "Comment created"
        ATTACHMENT_UPLOADED = "attachment_uploaded", "Attachment uploaded"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey("projects.Project", on_delete=models.CASCADE, related_name="activity_logs")
    task = models.ForeignKey(Task, on_delete=models.SET_NULL, null=True, blank=True, related_name="activity_logs")
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="activity_logs")
    verb = models.CharField(max_length=48, choices=Verb.choices)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["project", "-created_at"]),
            models.Index(fields=["task", "-created_at"]),
            models.Index(fields=["actor", "-created_at"]),
            models.Index(fields=["verb", "-created_at"]),
        ]
