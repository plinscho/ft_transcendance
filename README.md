# USE WEBSITE:
To use the website go to https://localhost:8443

___________________________________________________________________________________________________
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

___________________________________________________________________________________________________
# DJANGO 

1. Start by running "django-admin startproject <project_name>"
2. To run the service, cd inside the project and run "python3 manage.py runserver"
3. Create apps with "python3 manage.py startapp <app_name>"

Each App has its own views and urls.
Views.py processes the resquests from the web, and it is mapped in the urls.py.
Later we have to configure the globals urls.py from the project

project/app/views.py:
    -   Take http requests and return a http response.

project/app/urls.py
    -   Executes de view. It can allocate multiple urls for different
        views, so it can redirect to a certain urls depending on the view.

___________________________________________________________________________________________________
# DJANGO/API/USER

This appication is meant to manage the user data.
Creating a user, getting the authentication token and changing some fields from the user
will be managed by this application.

The url for those api is https://localhost/api/user.
You can access the correspondant API by addind /signup or /login.

___________________________________________________________________________________________________

SOURCES:

Back:   
https://www.dj4e.com/lessons   
https://docs.djangoproject.com/en/5.1/topics/install/#database-installation     
https://nginx.org/en/docs/  
https://medium.com/django-unleashed/serving-static-and-media-files-using-nginx-in-django-a4a125af95d    
https://www.w3schools.com/django/   
https://es.wikipedia.org/wiki/Modelo%E2%80%93vista%E2%80%93controlador  

