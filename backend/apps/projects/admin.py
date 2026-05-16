from django.contrib import admin

from apps.projects.models import Project, ProjectMember


class ProjectMemberInline(admin.TabularInline):
    model = ProjectMember
    extra = 0
    autocomplete_fields = ("user", "invited_by")


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "archived", "updated_at")
    search_fields = ("name", "description", "owner__email")
    list_filter = ("archived",)
    inlines = [ProjectMemberInline]


@admin.register(ProjectMember)
class ProjectMemberAdmin(admin.ModelAdmin):
    list_display = ("project", "user", "role", "is_active", "joined_at")
    search_fields = ("project__name", "user__email", "user__name")
    list_filter = ("role", "is_active")
