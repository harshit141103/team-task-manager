import django_filters

from apps.tasks.models import Task


class TaskFilter(django_filters.FilterSet):
    due_before = django_filters.IsoDateTimeFilter(field_name="due_date", lookup_expr="lte")
    due_after = django_filters.IsoDateTimeFilter(field_name="due_date", lookup_expr="gte")
    assigned_to_me = django_filters.BooleanFilter(method="filter_assigned_to_me")

    class Meta:
        model = Task
        fields = ["project", "status", "priority", "assigned_user", "due_before", "due_after", "assigned_to_me"]

    def filter_assigned_to_me(self, queryset, name, value):
        if value:
            return queryset.filter(assigned_user=self.request.user)
        return queryset
