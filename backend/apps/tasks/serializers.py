from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from apps.projects.models import Project
from apps.projects.selectors import belongs_to_project, is_project_admin
from apps.tasks.models import ActivityLog, Attachment, Task, TaskComment
from apps.users.serializers import PublicUserSerializer


User = get_user_model()


class AttachmentSerializer(serializers.ModelSerializer):
    uploaded_by = PublicUserSerializer(read_only=True)
    url = serializers.SerializerMethodField()

    class Meta:
        model = Attachment
        fields = ("id", "task", "uploaded_by", "file", "url", "original_name", "content_type", "size", "created_at")
        read_only_fields = ("id", "uploaded_by", "url", "original_name", "content_type", "size", "created_at")

    @extend_schema_field(serializers.URLField(allow_null=True))
    def get_url(self, obj):
        request = self.context.get("request")
        if not obj.file:
            return None
        url = obj.file.url
        return request.build_absolute_uri(url) if request else url


class TaskCommentSerializer(serializers.ModelSerializer):
    author = PublicUserSerializer(read_only=True)

    class Meta:
        model = TaskComment
        fields = ("id", "task", "author", "body", "created_at", "updated_at")
        read_only_fields = ("id", "author", "created_at", "updated_at")

    def validate_task(self, task):
        if not belongs_to_project(self.context["request"].user, task.project):
            raise serializers.ValidationError("You do not have access to this task.")
        return task


class TaskSerializer(serializers.ModelSerializer):
    assigned_user = PublicUserSerializer(read_only=True)
    assigned_user_id = serializers.PrimaryKeyRelatedField(
        source="assigned_user",
        queryset=User.objects.filter(is_active=True),
        required=False,
        allow_null=True,
        write_only=True,
    )
    created_by = PublicUserSerializer(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    attachments_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Task
        fields = (
            "id",
            "project",
            "title",
            "description",
            "priority",
            "status",
            "due_date",
            "assigned_user",
            "assigned_user_id",
            "created_by",
            "comments_count",
            "attachments_count",
            "completed_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_by", "completed_at", "created_at", "updated_at", "comments_count", "attachments_count")

    def validate_project(self, project: Project):
        request = self.context["request"]
        if not is_project_admin(request.user, project):
            raise serializers.ValidationError("Only project admins can create tasks.")
        return project

    def validate(self, attrs):
        request = self.context["request"]
        task = self.instance
        project = attrs.get("project") or (task.project if task else None)
        assigned_user = attrs.get("assigned_user")

        if task and not is_project_admin(request.user, task.project):
            allowed_fields = {"status"}
            if not set(self.initial_data.keys()).issubset(allowed_fields):
                raise serializers.ValidationError("Members can only update the status of their own assigned tasks.")
            if task.assigned_user_id != request.user.id:
                raise serializers.ValidationError("You can only update tasks assigned to you.")

        if assigned_user and project and not belongs_to_project(assigned_user, project):
            raise serializers.ValidationError("Assigned user must be an active project member.")

        return attrs


class TaskDetailSerializer(TaskSerializer):
    comments = TaskCommentSerializer(many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta(TaskSerializer.Meta):
        fields = TaskSerializer.Meta.fields + ("comments", "attachments")


class ActivityLogSerializer(serializers.ModelSerializer):
    actor = PublicUserSerializer(read_only=True)
    task_title = serializers.CharField(source="task.title", read_only=True)
    project_name = serializers.CharField(source="project.name", read_only=True)

    class Meta:
        model = ActivityLog
        fields = ("id", "project", "project_name", "task", "task_title", "actor", "verb", "metadata", "created_at")
