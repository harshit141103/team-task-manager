from django.db.models import Count
from rest_framework import parsers, permissions, response, status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.throttling import ScopedRateThrottle

from apps.projects.selectors import is_project_admin
from apps.tasks.filters import TaskFilter
from apps.tasks.models import Attachment, Task, TaskComment
from apps.tasks.permissions import AttachmentPermission, CommentPermission, TaskPermission
from apps.tasks.selectors import visible_tasks_for
from apps.tasks.serializers import AttachmentSerializer, TaskCommentSerializer, TaskDetailSerializer, TaskSerializer
from apps.tasks.services import TaskService


class TaskViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, TaskPermission]
    filterset_class = TaskFilter
    search_fields = ["title", "description", "assigned_user__name", "assigned_user__email"]
    ordering_fields = ["due_date", "created_at", "updated_at", "priority", "status", "title"]
    ordering = ["due_date", "-updated_at"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Task.objects.none()
        return (
            visible_tasks_for(self.request.user)
            .select_related("project", "assigned_user", "created_by")
            .annotate(comments_count=Count("comments", distinct=True), attachments_count=Count("attachments", distinct=True))
        )

    def get_serializer_class(self):
        if self.action == "retrieve":
            return TaskDetailSerializer
        return TaskSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task = TaskService.create_task(actor=request.user, data=serializer.validated_data)
        return response.Response(TaskSerializer(task, context=self.get_serializer_context()).data, status=status.HTTP_201_CREATED)

    def perform_update(self, serializer):
        task = self.get_object()
        TaskService.update_task(actor=self.request.user, task=task, data=serializer.validated_data)

    def destroy(self, request, *args, **kwargs):
        TaskService.delete_task(actor=request.user, task=self.get_object())
        return response.Response(status=status.HTTP_204_NO_CONTENT)


class TaskCommentViewSet(viewsets.ModelViewSet):
    serializer_class = TaskCommentSerializer
    permission_classes = [permissions.IsAuthenticated, CommentPermission]
    filterset_fields = ["task"]
    search_fields = ["body", "author__name"]
    ordering_fields = ["created_at", "updated_at"]
    ordering = ["created_at"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return TaskComment.objects.none()
        return TaskComment.objects.filter(task__in=visible_tasks_for(self.request.user)).select_related("author", "task", "task__project")

    def perform_create(self, serializer):
        task = serializer.validated_data["task"]
        comment = TaskService.add_comment(actor=self.request.user, task=task, body=serializer.validated_data["body"])
        serializer.instance = comment


class AttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated, AttachmentPermission]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "uploads"
    filterset_fields = ["task"]
    ordering_fields = ["created_at", "size"]
    ordering = ["-created_at"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Attachment.objects.none()
        return Attachment.objects.filter(task__in=visible_tasks_for(self.request.user)).select_related("uploaded_by", "task", "task__project")

    def create(self, request, *args, **kwargs):
        task_id = request.data.get("task")
        file = request.FILES.get("file")
        if not task_id or not file:
            return response.Response({"detail": "task and file are required."}, status=status.HTTP_400_BAD_REQUEST)
        task = visible_tasks_for(request.user).filter(id=task_id).select_related("project").first()
        if not task:
            return response.Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)
        attachment = TaskService.add_attachment(actor=request.user, task=task, file=file)
        return response.Response(self.get_serializer(attachment).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        attachment = self.get_object()
        if attachment.uploaded_by_id != request.user.id and not is_project_admin(request.user, attachment.task.project):
            raise PermissionDenied("You can only remove your own uploads.")
        return super().destroy(request, *args, **kwargs)
