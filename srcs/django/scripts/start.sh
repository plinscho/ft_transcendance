#!/bin/sh

# exit if a command is not succesfull
set -e

echo "DJANGO_SUPERUSER_USERNAME: $DJANGO_SUPERUSER_USERNAME"
echo "DJANGO_SUPERUSER_EMAIL: $DJANGO_SUPERUSER_EMAIL"
echo "DJANGO_SUPERUSER_PASSWORD: $DJANGO_SUPERUSER_PASSWORD"

python manage.py makemigrations
python manage.py migrate

# save the static files in STATIC from setting.py
python manage.py collectstatic --noinput

# Create the first superuser to log into localhost/admin
python manage.py create_first_superuser

# Where "config" is, its just the name of the django project (config in this case)
gunicorn config.wsgi -b 0.0.0.0:8000

