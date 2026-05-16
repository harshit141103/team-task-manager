from rest_framework import serializers

from apps.projects.serializers import ProjectSerializer
from apps.tasks.serializers import ActivityLogSerializer, TaskSerializer


class ChoiceCountSerializer(serializers.Serializer):
    key = serializers.CharField()
    label = serializers.CharField()
    count = serializers.IntegerField()


class ProductivityPointSerializer(serializers.Serializer):
    date = serializers.DateField()
    completed = serializers.IntegerField()
    created = serializers.IntegerField()


class DashboardAnalyticsSerializer(serializers.Serializer):
    summary = serializers.DictField()
    tasks_by_status = ChoiceCountSerializer(many=True)
    tasks_by_priority = ChoiceCountSerializer(many=True)
    productivity = ProductivityPointSerializer(many=True)
    assigned_tasks = TaskSerializer(many=True)
    upcoming_deadlines = TaskSerializer(many=True)
    recent_activity = ActivityLogSerializer(many=True)
    team_activity = serializers.ListField()


class ProjectAnalyticsSerializer(serializers.Serializer):
    project = ProjectSerializer()
    summary = serializers.DictField()
    tasks_by_status = ChoiceCountSerializer(many=True)
    tasks_by_priority = ChoiceCountSerializer(many=True)
    recent_activity = ActivityLogSerializer(many=True)
