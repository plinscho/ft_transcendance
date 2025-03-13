#!/bin/sh

# exit if a command is not succesfull
set -e

echo "DJANGO_SUPERUSER_USERNAME: $DJANGO_SUPERUSER_USERNAME"
echo "DJANGO_SUPERUSER_EMAIL: $DJANGO_SUPERUSER_EMAIL"
echo "DJANGO_SUPERUSER_PASSWORD: $DJANGO_SUPERUSER_PASSWORD"

# The migrate command looks at the INSTALLED_APPS setting and 
# creates any necessary database tables according to the database 
# settings in your mysite/settings.py
python manage.py makemigrations
python manage.py migrate

# save the static files in STATIC from setting.py
python manage.py collectstatic --noinput

# Create the first superuser to log into localhost/admin
python manage.py create_first_superuser

# Where "config" is, its just the name of the django project (config in this case)
#gunicorn config.wsgi -b 0.0.0.0:8000

# Where "config" is, its just the name of the django project (config in this case)

daphne -e ssl:8000:/etc/letsencrypt/live/pong_server/fullchain.crt:/etc/letsencrypt/live/pong_server/privkey.key config.asgi:application

#daphne -b 0.0.0.0 -p 8000 config.asgi:application
#gunicorn config.wsgi --bind 0.0.0.0:8000 --reload & daphne -b 0.0.0.0 -p 8089 config.asgi:application &