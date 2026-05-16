from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter

from apps.analytics.views import DashboardAnalyticsView, ProjectAnalyticsView
from apps.common.views import HealthCheckView
from apps.projects.views import ProjectViewSet
from apps.tasks.views import AttachmentViewSet, TaskCommentViewSet, TaskViewSet
from apps.users.views import CookieTokenRefreshView, LoginView, LogoutView, RegisterView, UserMeView, UserViewSet

router = DefaultRouter()
router.register("users", UserViewSet, basename="users")
router.register("projects", ProjectViewSet, basename="projects")
router.register("tasks", TaskViewSet, basename="tasks")
router.register("comments", TaskCommentViewSet, basename="comments")
router.register("attachments", AttachmentViewSet, basename="attachments")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", HealthCheckView.as_view(), name="health-check"),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/auth/register/", RegisterView.as_view(), name="auth-register"),
    path("api/auth/login/", LoginView.as_view(), name="auth-login"),
    path("api/auth/refresh/", CookieTokenRefreshView.as_view(), name="token-refresh"),
    path("api/auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("api/auth/me/", UserMeView.as_view(), name="auth-me"),
    path("api/analytics/dashboard/", DashboardAnalyticsView.as_view(), name="analytics-dashboard"),
    path("api/analytics/projects/<uuid:project_id>/", ProjectAnalyticsView.as_view(), name="analytics-project"),
    path("api/", include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
