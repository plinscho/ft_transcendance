#!/bin/sh

python manage.py makemigrations
python manage.py migrate

python manage.py collectstatic --noinput

# Where "config" is, its just the name of the django project (config in this case)
gunicorn config.wsgi -b 0.0.0.0:8000
