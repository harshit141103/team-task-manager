#!/usr/bin/env sh
set -e

python manage.py migrate --noinput
python manage.py collectstatic --noinput

if [ "$SEED_DEMO" = "True" ] || [ "$SEED_DEMO" = "true" ]; then
  python manage.py seed_demo
fi

exec gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000}
