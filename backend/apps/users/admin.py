from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from apps.users.models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Profile", {"fields": ("name", "avatar_url", "job_title", "timezone")}),
    )
    list_display = ("email", "name", "is_staff", "is_active", "date_joined")
    search_fields = ("email", "name")
    ordering = ("email",)
