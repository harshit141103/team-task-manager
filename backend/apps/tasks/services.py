from django.db import transaction
from rest_framework.exceptions import PermissionDenied

from apps.common.validators import validate_attachment
from apps.projects.selectors import belongs_to_project, is_project_admin
from apps.tasks.models import ActivityLog, Attachment, Task, TaskComment


class TaskService:
    @staticmethod
    @transaction.atomic
    def create_task(*, actor, data: dict) -> Task:
        project = data["project"]
        if not is_project_admin(actor, project):
            raise PermissionDenied("Only project admins can create tasks.")
        task = Task.objects.create(created_by=actor, **data)
        ActivityLog.objects.create(project=project, task=task, actor=actor, verb=ActivityLog.Verb.TASK_CREATED, metadata={"title": task.title})
        if task.assigned_user_id:
            ActivityLog.objects.create(
                project=project,
                task=task,
                actor=actor,
                verb=ActivityLog.Verb.TASK_ASSIGNED,
                metadata={"assigned_user_id": str(task.assigned_user_id)},
            )
        return task

    @staticmethod
    @transaction.atomic
    def update_task(*, actor, task: Task, data: dict) -> Task:
        if not is_project_admin(actor, task.project):
            if set(data.keys()) != {"status"} or task.assigned_user_id != actor.id:
                raise PermissionDenied("Members can only update their own task status.")
        old_status = task.status
        old_assignee = task.assigned_user_id
        for field, value in data.items():
            setattr(task, field, value)
        task.save()
        if old_status != task.status:
            ActivityLog.objects.create(
                project=task.project,
                task=task,
                actor=actor,
                verb=ActivityLog.Verb.TASK_STATUS_CHANGED,
                metadata={"from": old_status, "to": task.status},
            )
        elif old_assignee != task.assigned_user_id:
            ActivityLog.objects.create(
                project=task.project,
                task=task,
                actor=actor,
                verb=ActivityLog.Verb.TASK_ASSIGNED,
                metadata={"assigned_user_id": str(task.assigned_user_id) if task.assigned_user_id else None},
            )
        else:
            ActivityLog.objects.create(project=task.project, task=task, actor=actor, verb=ActivityLog.Verb.TASK_UPDATED, metadata={"title": task.title})
        return task

    @staticmethod
    @transaction.atomic
    def delete_task(*, actor, task: Task) -> None:
        if not is_project_admin(actor, task.project):
            raise PermissionDenied("Only project admins can delete tasks.")
        ActivityLog.objects.create(project=task.project, task=task, actor=actor, verb=ActivityLog.Verb.TASK_DELETED, metadata={"title": task.title})
        task.delete()

    @staticmethod
    @transaction.atomic
    def add_comment(*, actor, task: Task, body: str) -> TaskComment:
        if not belongs_to_project(actor, task.project):
            raise PermissionDenied("You do not have access to this task.")
        comment = TaskComment.objects.create(task=task, author=actor, body=body)
        ActivityLog.objects.create(project=task.project, task=task, actor=actor, verb=ActivityLog.Verb.COMMENT_CREATED, metadata={"preview": body[:120]})
        return comment

    @staticmethod
    @transaction.atomic
    def add_attachment(*, actor, task: Task, file) -> Attachment:
        if not belongs_to_project(actor, task.project):
            raise PermissionDenied("You do not have access to this task.")
        validate_attachment(file)
        attachment = Attachment.objects.create(
            task=task,
            uploaded_by=actor,
            file=file,
            original_name=file.name,
            content_type=getattr(file, "content_type", ""),
            size=file.size,
        )
        ActivityLog.objects.create(project=task.project, task=task, actor=actor, verb=ActivityLog.Verb.ATTACHMENT_UPLOADED, metadata={"filename": file.name})
        return attachment
