# Generated for the Team Task Manager reference implementation.
import apps.common.validators
import apps.tasks.models
import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("projects", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Task",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("title", models.CharField(max_length=220)),
                ("description", models.TextField(blank=True)),
                ("priority", models.CharField(choices=[("low", "Low"), ("medium", "Medium"), ("high", "High"), ("urgent", "Urgent")], default="medium", max_length=16)),
                ("status", models.CharField(choices=[("todo", "Todo"), ("in_progress", "In Progress"), ("review", "Review"), ("completed", "Completed")], default="todo", max_length=24)),
                ("due_date", models.DateTimeField(blank=True, null=True)),
                ("completed_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("assigned_user", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="assigned_tasks", to=settings.AUTH_USER_MODEL)),
                ("created_by", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="created_tasks", to=settings.AUTH_USER_MODEL)),
                ("project", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="tasks", to="projects.project")),
            ],
            options={"ordering": ["due_date", "-updated_at"]},
        ),
        migrations.CreateModel(
            name="TaskComment",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("body", models.TextField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("author", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="task_comments", to=settings.AUTH_USER_MODEL)),
                ("task", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="comments", to="tasks.task")),
            ],
            options={"ordering": ["created_at"]},
        ),
        migrations.CreateModel(
            name="Attachment",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("file", models.FileField(upload_to=apps.tasks.models.task_attachment_path, validators=[apps.common.validators.validate_attachment])),
                ("original_name", models.CharField(max_length=255)),
                ("content_type", models.CharField(blank=True, max_length=120)),
                ("size", models.PositiveIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("task", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="attachments", to="tasks.task")),
                ("uploaded_by", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="task_attachments", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="ActivityLog",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("verb", models.CharField(choices=[("project_created", "Project created"), ("project_updated", "Project updated"), ("member_invited", "Member invited"), ("member_removed", "Member removed"), ("task_created", "Task created"), ("task_updated", "Task updated"), ("task_deleted", "Task deleted"), ("task_status_changed", "Task status changed"), ("task_assigned", "Task assigned"), ("comment_created", "Comment created"), ("attachment_uploaded", "Attachment uploaded")], max_length=48)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("actor", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="activity_logs", to=settings.AUTH_USER_MODEL)),
                ("project", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="activity_logs", to="projects.project")),
                ("task", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="activity_logs", to="tasks.task")),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.AddIndex(model_name="task", index=models.Index(fields=["project", "status"], name="tasks_task_project_616d9d_idx")),
        migrations.AddIndex(model_name="task", index=models.Index(fields=["project", "priority"], name="tasks_task_project_d86a37_idx")),
        migrations.AddIndex(model_name="task", index=models.Index(fields=["assigned_user", "status"], name="tasks_task_assigne_292d18_idx")),
        migrations.AddIndex(model_name="task", index=models.Index(fields=["due_date"], name="tasks_task_due_dat_9e6958_idx")),
        migrations.AddIndex(model_name="task", index=models.Index(fields=["created_at"], name="tasks_task_created_4eac44_idx")),
        migrations.AddIndex(model_name="taskcomment", index=models.Index(fields=["task", "created_at"], name="tasks_taskc_task_id_a5f7cd_idx")),
        migrations.AddIndex(model_name="taskcomment", index=models.Index(fields=["author", "created_at"], name="tasks_taskc_author__8572bd_idx")),
        migrations.AddIndex(model_name="attachment", index=models.Index(fields=["task", "created_at"], name="tasks_attac_task_id_dae80e_idx")),
        migrations.AddIndex(model_name="attachment", index=models.Index(fields=["uploaded_by", "created_at"], name="tasks_attac_uploade_e78e51_idx")),
        migrations.AddIndex(model_name="activitylog", index=models.Index(fields=["project", "-created_at"], name="tasks_activ_project_bc6e61_idx")),
        migrations.AddIndex(model_name="activitylog", index=models.Index(fields=["task", "-created_at"], name="tasks_activ_task_id_ef5ef7_idx")),
        migrations.AddIndex(model_name="activitylog", index=models.Index(fields=["actor", "-created_at"], name="tasks_activ_actor_i_36a8bb_idx")),
        migrations.AddIndex(model_name="activitylog", index=models.Index(fields=["verb", "-created_at"], name="tasks_activ_verb_741d69_idx")),
    ]
