from apps.projects.models import Project, ProjectMember


def user_project_ids(user):
    return ProjectMember.objects.filter(user=user, is_active=True).values_list("project_id", flat=True)


def visible_projects_for(user):
    if user.is_staff:
        return Project.objects.all()
    return Project.objects.filter(id__in=user_project_ids(user), archived=False).distinct()


def membership_for(user, project: Project) -> ProjectMember | None:
    return ProjectMember.objects.filter(user=user, project=project, is_active=True).first()


def is_project_admin(user, project: Project) -> bool:
    if user.is_staff or project.owner_id == user.id:
        return True
    return ProjectMember.objects.filter(
        user=user,
        project=project,
        role=ProjectMember.Role.ADMIN,
        is_active=True,
    ).exists()


def belongs_to_project(user, project: Project) -> bool:
    if user.is_staff:
        return True
    return ProjectMember.objects.filter(user=user, project=project, is_active=True).exists()
