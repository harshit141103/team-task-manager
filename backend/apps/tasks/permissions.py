from rest_framework import permissions

from apps.projects.selectors import belongs_to_project, is_project_admin


class TaskPermission(permissions.BasePermission):
    message = "You do not have permission to perform this task action."

    def has_object_permission(self, request, view, obj) -> bool:
        if not belongs_to_project(request.user, obj.project):
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        if is_project_admin(request.user, obj.project):
            return True
        if request.method in {"PATCH", "PUT"}:
            allowed_fields = {"status"}
            request_fields = set(request.data.keys())
            return obj.assigned_user_id == request.user.id and request_fields.issubset(allowed_fields)
        return False


class CommentPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj) -> bool:
        if not belongs_to_project(request.user, obj.task.project):
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author_id == request.user.id or is_project_admin(request.user, obj.task.project)


class AttachmentPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj) -> bool:
        if not belongs_to_project(request.user, obj.task.project):
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.uploaded_by_id == request.user.id or is_project_admin(request.user, obj.task.project)
