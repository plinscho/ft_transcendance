# PGADMIN CONNECTION:
1) go to localhost:5050
2) Insert the email provided in the .env
3) Click in "add new server"
4) In the "General" tab, enter a name for the server
5) In the "Connection" tab, enter the following details (also found in .env):
        Hostname/address: db (service name)
        Port: 5432
        Maintenance database: postgres
        Username: postgres
        Password: postgres

SOURCES:

Back:
https://www.w3schools.com/django/
https://es.wikipedia.org/wiki/Modelo%E2%80%93vista%E2%80%93controlador


Building Django

1. Start by running "django-admin startproject <project_name>"
2. To run the service, cd inside the project and run "python3 manage.py runserver"
3. Create apps with "python3 manage.py startapp <app_name>"

project/app/views.py:
    -   Take http requests and return a htp response.

project/app/urls.py
    -   Executes de view. It can allocate multiple urls for different
        views, so it can redirect to a certain urls depending on the view.

