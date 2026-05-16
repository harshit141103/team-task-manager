# Generated for the Team Task Manager reference implementation.
import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Project",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=180)),
                ("slug", models.SlugField(blank=True, max_length=210, unique=True)),
                ("description", models.TextField(blank=True)),
                ("color", models.CharField(default="#14b8a6", max_length=24)),
                ("due_date", models.DateField(blank=True, null=True)),
                ("archived", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("owner", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="owned_projects", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-updated_at"]},
        ),
        migrations.CreateModel(
            name="ProjectMember",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("role", models.CharField(choices=[("admin", "Admin"), ("member", "Member")], default="member", max_length=16)),
                ("is_active", models.BooleanField(default=True)),
                ("joined_at", models.DateTimeField(auto_now_add=True)),
                ("invited_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="sent_project_invites", to=settings.AUTH_USER_MODEL)),
                ("project", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="memberships", to="projects.project")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="project_memberships", to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddIndex(model_name="project", index=models.Index(fields=["slug"], name="projects_pr_slug_95c4b5_idx")),
        migrations.AddIndex(model_name="project", index=models.Index(fields=["owner", "archived"], name="projects_pr_owner_i_aa7b86_idx")),
        migrations.AddIndex(model_name="project", index=models.Index(fields=["created_at"], name="projects_pr_created_c5c7da_idx")),
        migrations.AddIndex(model_name="projectmember", index=models.Index(fields=["project", "role", "is_active"], name="projects_pr_project_a4b4b8_idx")),
        migrations.AddIndex(model_name="projectmember", index=models.Index(fields=["user", "is_active"], name="projects_pr_user_id_5e921d_idx")),
        migrations.AddConstraint(model_name="projectmember", constraint=models.UniqueConstraint(fields=("project", "user"), name="unique_project_member")),
    ]
