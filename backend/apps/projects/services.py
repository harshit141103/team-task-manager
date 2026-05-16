from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError

from apps.projects.models import Project, ProjectMember
from apps.projects.selectors import is_project_admin
from apps.tasks.models import ActivityLog


User = get_user_model()


class ProjectService:
    @staticmethod
    @transaction.atomic
    def create_project(*, actor, data: dict) -> Project:
        project = Project.objects.create(owner=actor, **data)
        ProjectMember.objects.create(project=project, user=actor, role=ProjectMember.Role.ADMIN, invited_by=actor)
        ActivityLog.objects.create(project=project, actor=actor, verb=ActivityLog.Verb.PROJECT_CREATED, metadata={"name": project.name})
        return project

    @staticmethod
    @transaction.atomic
    def invite_member(*, actor, project: Project, email: str, role: str) -> ProjectMember:
        if not is_project_admin(actor, project):
            raise PermissionDenied("Only project admins can invite members.")
        user = User.objects.filter(email=email.lower().strip(), is_active=True).first()
        if not user:
            raise NotFound("No active user exists with that email. Ask them to sign up first.")
        membership, created = ProjectMember.objects.update_or_create(
            project=project,
            user=user,
            defaults={"role": role, "invited_by": actor, "is_active": True},
        )
        ActivityLog.objects.create(
            project=project,
            actor=actor,
            verb=ActivityLog.Verb.MEMBER_INVITED,
            metadata={"email": user.email, "role": role, "created": created},
        )
        return membership

    @staticmethod
    @transaction.atomic
    def remove_member(*, actor, project: Project, member_id) -> None:
        if not is_project_admin(actor, project):
            raise PermissionDenied("Only project admins can remove members.")
        membership = ProjectMember.objects.filter(id=member_id, project=project, is_active=True).select_related("user").first()
        if not membership:
            raise NotFound("Project member not found.")
        if membership.user_id == project.owner_id:
            raise ValidationError("The project owner cannot be removed.")
        membership.is_active = False
        membership.save(update_fields=["is_active"])
        ActivityLog.objects.create(
            project=project,
            actor=actor,
            verb=ActivityLog.Verb.MEMBER_REMOVED,
            metadata={"email": membership.user.email},
        )
