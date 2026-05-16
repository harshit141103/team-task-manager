from drf_spectacular.utils import OpenApiParameter, OpenApiTypes, extend_schema
from rest_framework import decorators, permissions, response, status, viewsets
from rest_framework.exceptions import PermissionDenied

from apps.projects.models import Project, ProjectMember
from apps.projects.selectors import is_project_admin, visible_projects_for
from apps.projects.serializers import ProjectInviteSerializer, ProjectMemberSerializer, ProjectSerializer
from apps.projects.services import ProjectService
from apps.tasks.models import ActivityLog


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ["name", "description"]
    filterset_fields = ["archived"]
    ordering_fields = ["name", "created_at", "updated_at", "due_date"]
    ordering = ["-updated_at"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Project.objects.none()
        return visible_projects_for(self.request.user).select_related("owner").prefetch_related("memberships__user", "tasks")

    def perform_create(self, serializer):
        self.instance = ProjectService.create_project(actor=self.request.user, data=serializer.validated_data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return response.Response(self.get_serializer(self.instance).data, status=status.HTTP_201_CREATED)

    def perform_update(self, serializer):
        project = self.get_object()
        if not is_project_admin(self.request.user, project):
            raise PermissionDenied("Only project admins can update settings.")
        serializer.save()
        ActivityLog.objects.create(project=project, actor=self.request.user, verb=ActivityLog.Verb.PROJECT_UPDATED, metadata={"name": project.name})

    def destroy(self, request, *args, **kwargs):
        project = self.get_object()
        if not is_project_admin(request.user, project):
            raise PermissionDenied("Only project admins can delete projects.")
        return super().destroy(request, *args, **kwargs)

    @decorators.action(detail=True, methods=["get"])
    def members(self, request, pk=None):
        project = self.get_object()
        memberships = project.memberships.filter(is_active=True).select_related("user", "invited_by").order_by("user__name")
        return response.Response(ProjectMemberSerializer(memberships, many=True).data)

    @decorators.action(detail=True, methods=["post"], url_path="invite")
    def invite(self, request, pk=None):
        project = self.get_object()
        serializer = ProjectInviteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        membership = ProjectService.invite_member(actor=request.user, project=project, **serializer.validated_data)
        return response.Response(ProjectMemberSerializer(membership).data, status=status.HTTP_201_CREATED)

    @extend_schema(parameters=[OpenApiParameter("member_id", OpenApiTypes.UUID, OpenApiParameter.PATH)])
    @decorators.action(detail=True, methods=["delete"], url_path=r"members/(?P<member_id>[^/.]+)")
    def remove_member(self, request, pk=None, member_id=None):
        project = self.get_object()
        ProjectService.remove_member(actor=request.user, project=project, member_id=member_id)
        return response.Response(status=status.HTTP_204_NO_CONTENT)
