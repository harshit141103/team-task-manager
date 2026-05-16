from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.projects.models import ProjectMember
from apps.projects.models import Project
from apps.projects.services import ProjectService
from apps.tasks.models import Task
from apps.tasks.services import TaskService


User = get_user_model()


class Command(BaseCommand):
    help = "Create demo users, projects, tasks, comments, and activity logs."

    def handle(self, *args, **options):
        admin, _ = User.objects.get_or_create(
            email="admin@teamtask.dev",
            defaults={"username": "admin@teamtask.dev", "name": "Avery Stone", "job_title": "Product Lead"},
        )
        admin.set_password("ChangeMe123!")
        admin.save()

        member, _ = User.objects.get_or_create(
            email="member@teamtask.dev",
            defaults={"username": "member@teamtask.dev", "name": "Mina Patel", "job_title": "Frontend Engineer"},
        )
        member.set_password("ChangeMe123!")
        member.save()

        analyst, _ = User.objects.get_or_create(
            email="analyst@teamtask.dev",
            defaults={"username": "analyst@teamtask.dev", "name": "Noah Kim", "job_title": "Data Analyst"},
        )
        analyst.set_password("ChangeMe123!")
        analyst.save()

        project = Project.objects.filter(name="Launch Operations Hub", owner=admin).first()
        if not project:
            project = ProjectService.create_project(
                actor=admin,
                data={
                    "name": "Launch Operations Hub",
                    "description": "Cross-functional launch plan for onboarding, activation, and analytics workflows.",
                    "color": "#14b8a6",
                    "due_date": (timezone.now() + timedelta(days=28)).date(),
                },
            )
        ProjectService.invite_member(actor=admin, project=project, email=member.email, role=ProjectMember.Role.MEMBER)
        ProjectService.invite_member(actor=admin, project=project, email=analyst.email, role=ProjectMember.Role.ADMIN)

        tasks = [
            ("Design onboarding checklist", Task.Priority.HIGH, Task.Status.IN_PROGRESS, member, 3),
            ("Implement workspace analytics query", Task.Priority.URGENT, Task.Status.REVIEW, analyst, 1),
            ("Finalize billing handoff notes", Task.Priority.MEDIUM, Task.Status.TODO, admin, 8),
            ("QA drag-and-drop task transitions", Task.Priority.HIGH, Task.Status.TODO, member, 5),
            ("Publish launch retro dashboard", Task.Priority.LOW, Task.Status.COMPLETED, analyst, -1),
        ]

        for title, priority, status, assignee, days in tasks:
            if Task.objects.filter(project=project, title=title).exists():
                continue
            task = TaskService.create_task(
                actor=admin,
                data={
                    "project": project,
                    "title": title,
                    "description": f"Demo task for {title.lower()} with realistic activity history.",
                    "priority": priority,
                    "status": status,
                    "assigned_user": assignee,
                    "due_date": timezone.now() + timedelta(days=days),
                },
            )
            TaskService.add_comment(actor=assignee, task=task, body=f"Progress noted for {title}.")

        self.stdout.write(self.style.SUCCESS("Demo data created. Login: admin@teamtask.dev / ChangeMe123!"))
