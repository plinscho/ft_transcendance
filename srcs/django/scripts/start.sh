#!/bin/sh

# exit if a command is not succesfull
set -e

python manage.py makemigrations
python manage.py migrate

# save the static files in STATIC from setting.py
python manage.py collectstatic --noinput

# Where "config" is, its just the name of the django project (config in this case)
gunicorn config.wsgi -b 0.0.0.0:8000
