# TeamTask - SaaS Team Task Manager

TeamTask is a production-style full-stack task management platform with project workspaces, admin/member RBAC, Kanban task flow, analytics, comments, attachments, JWT auth, Docker, and Railway-ready deployment config.

## Tech Stack

- Frontend: Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn/ui-style components, Framer Motion, TanStack Query, Zustand, Recharts, dnd-kit, Lucide icons
- Backend: Django 5, Django REST Framework, SimpleJWT, django-filter, drf-spectacular, PostgreSQL via Supabase-compatible `DATABASE_URL`
- Deployment: Dockerized frontend/backend, `docker-compose.yml`, Railway Dockerfile configuration, environment-variable driven settings

## Architecture

```text
frontend/
  app/                  Next.js route groups for public, auth, and protected app pages
  components/           UI primitives, layout, dashboard, projects, tasks, team, Kanban
  lib/api/              Typed API abstraction with JWT refresh retry
  lib/stores/           Zustand auth/session state
  lib/validations/      Zod schemas for forms

backend/
  config/               Django settings, URLs, ASGI/WSGI
  apps/users/           Custom user, JWT cookie/header auth, auth endpoints
  apps/projects/        Projects, memberships, RBAC selectors, project services
  apps/tasks/           Tasks, comments, attachments, activity logs, services
  apps/analytics/       Dashboard and project analytics read models
  apps/common/          Pagination, validation, health check, seed command
```

## Features

- Signup/login with JWT access and refresh tokens
- Admin/member project roles with strict backend permission checks
- Project creation, deletion, settings, member invite/remove services
- Task CRUD for admins; members can update only their own task status
- Comments and secure attachment uploads with size/type validation
- Activity logging for project, task, assignment, comment, and upload events
- Debounced project search, filtering, sorting, pagination-ready APIs
- Dashboard analytics: completion rate, overdue tasks, activity, deadlines, status/priority charts
- Kanban board with drag-and-drop and optimistic status updates
- Responsive dark SaaS UI with skeletons, empty states, toasts, modals, and protected routes
- Swagger/OpenAPI at `/api/docs/` and Postman collection in `docs/`

## Environment

Copy the examples and adjust values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Important backend variables:

- `DATABASE_URL`: Supabase PostgreSQL URL, for example `postgres://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres?sslmode=require`
- `SECRET_KEY`: long random Django secret
- `ALLOWED_HOSTS`: API hostnames
- `CORS_ALLOWED_ORIGINS`: frontend URLs
- `JWT_COOKIE_SECURE`: `True` in HTTPS production
- `MAX_UPLOAD_SIZE`: byte limit for attachments

Important frontend variables:

- `NEXT_PUBLIC_API_URL`: backend API root, for example `https://api.example.com/api`
- `NEXT_PUBLIC_APP_URL`: frontend public URL

## Local Docker Setup

```bash
docker-compose up --build
```

The stack starts:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api`
- Swagger docs: `http://localhost:8000/api/docs/`

Demo data is seeded automatically in Docker. Login with:

```text
admin@teamtask.dev / ChangeMe123!
member@teamtask.dev / ChangeMe123!
```

## Manual Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

## Manual Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## API Documentation

- Swagger UI: `/api/docs/`
- OpenAPI schema: `/api/schema/`
- Postman collection: `docs/team-task-manager.postman_collection.json`

Core endpoints:

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `GET/PATCH /api/auth/me/`
- `GET/POST /api/projects/`
- `GET/POST /api/projects/{id}/invite/`
- `GET/POST/PATCH/DELETE /api/tasks/`
- `GET/POST /api/comments/`
- `GET/POST /api/attachments/`
- `GET /api/analytics/dashboard/`
- `GET /api/analytics/projects/{project_id}/`
- `GET /api/health/`

## RBAC Summary

Admins can create/delete projects, invite/remove members, create/edit/delete/assign tasks, change any task status, and view analytics. Members can view projects they belong to, view assigned work, update their own task status, comment, and upload attachments. Backend service and permission classes enforce these rules even if the UI is bypassed.

## Railway Deployment

Create two Railway services from this repo:

1. Backend service with root directory `backend`
2. Frontend service with root directory `frontend`

Backend variables:

```text
DJANGO_ENV=production
DEBUG=False
SECRET_KEY=<secure random secret>
DATABASE_URL=<Supabase PostgreSQL URL with sslmode=require>
ALLOWED_HOSTS=<backend railway domain>,<custom api domain>
CORS_ALLOWED_ORIGINS=<frontend railway/custom domain>
CSRF_TRUSTED_ORIGINS=<frontend railway/custom domain>
JWT_COOKIE_SECURE=True
```

Frontend variables:

```text
NEXT_PUBLIC_API_URL=https://<backend-domain>/api
NEXT_PUBLIC_APP_URL=https://<frontend-domain>
```

Both services include `railway.json` and Dockerfiles. The backend container runs migrations and static collection on startup. Run `python manage.py createsuperuser` or `python manage.py seed_demo` from a Railway shell when you want demo accounts.

## Screenshots

Add portfolio screenshots here after first deployment:

- Landing page
- Dashboard analytics
- Kanban board
- Task detail with comments and attachments
- Team management

## Future Improvements

- Email-based invitation acceptance flow
- Supabase Storage or S3-backed media storage
- WebSocket activity stream
- Per-project custom roles
- Audit log export
- Notification preferences
