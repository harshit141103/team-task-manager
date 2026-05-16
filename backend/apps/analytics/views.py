from rest_framework import permissions
from rest_framework.generics import RetrieveAPIView

from apps.analytics.serializers import DashboardAnalyticsSerializer, ProjectAnalyticsSerializer
from apps.analytics.services import AnalyticsService


class DashboardAnalyticsView(RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DashboardAnalyticsSerializer

    def get_object(self):
        return AnalyticsService.dashboard_for(self.request.user)


class ProjectAnalyticsView(RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProjectAnalyticsSerializer

    def get_object(self):
        return AnalyticsService.project_for(self.request.user, self.kwargs["project_id"])
