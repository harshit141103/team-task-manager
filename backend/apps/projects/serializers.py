from django.contrib.auth import get_user_model
from django.db.models import Count
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from apps.projects.models import Project, ProjectMember
from apps.tasks.models import Task
from apps.users.serializers import PublicUserSerializer


User = get_user_model()


class ProjectMemberSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer(read_only=True)
    invited_by = PublicUserSerializer(read_only=True)

    class Meta:
        model = ProjectMember
        fields = ("id", "user", "role", "invited_by", "is_active", "joined_at")
        read_only_fields = ("id", "user", "invited_by", "joined_at")


class ProjectInviteSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=ProjectMember.Role.choices, default=ProjectMember.Role.MEMBER)


class ProjectSerializer(serializers.ModelSerializer):
    owner = PublicUserSerializer(read_only=True)
    members = serializers.SerializerMethodField()
    task_counts = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "color",
            "owner",
            "due_date",
            "archived",
            "members",
            "task_counts",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "slug", "owner", "created_at", "updated_at", "members", "task_counts")

    @extend_schema_field(ProjectMemberSerializer(many=True))
    def get_members(self, obj):
        memberships = obj.memberships.filter(is_active=True).select_related("user", "invited_by")[:8]
        return ProjectMemberSerializer(memberships, many=True).data

    @extend_schema_field(serializers.DictField(child=serializers.IntegerField()))
    def get_task_counts(self, obj):
        counts = {status: 0 for status, _ in Task.Status.choices}
        for row in obj.tasks.values("status").annotate(count=Count("id")):
            counts[row["status"]] = row["count"]
        return counts
