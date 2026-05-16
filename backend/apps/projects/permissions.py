from rest_framework import permissions

from apps.projects.selectors import belongs_to_project, is_project_admin


class IsProjectMember(permissions.BasePermission):
    def has_object_permission(self, request, view, obj) -> bool:
        project = getattr(obj, "project", obj)
        return belongs_to_project(request.user, project)


class IsProjectAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj) -> bool:
        project = getattr(obj, "project", obj)
        return is_project_admin(request.user, project)
