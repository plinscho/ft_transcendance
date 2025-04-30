# 🏓 ft_transcendance

A full-stack multiplayer Pong game built with vanilla Javascript, PostgreSQL and WebSockets. 
Developed as the final project at [42 Barcelona](https://42barcelona.com/), this project simulates an end-to-end modern web app with **authentication**, **real-time gameplay**, and **user interaction**.

## 🔧 Tech Stack

**Backend:**
- **Django (Python)** – Implementation for API endpoints and Django Channels for Websockets
- **PostgreSQL** –  Object-relational database system
- **Authentication** – 2FA authentication using JWT (JSON Web Tokens)
- **DevOps & tools** – Docker compose with nginx reverse proxy, pgadmin and redis cache.
- **Frontend** – Javascript with ThreeJS and Bootstrap
- **CI/CD** - Git and Github.

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

SOURCES:

Back:   
https://www.dj4e.com/lessons   
https://docs.djangoproject.com/en/5.1/topics/install/#database-installation     
https://nginx.org/en/docs/  
https://medium.com/django-unleashed/serving-static-and-media-files-using-nginx-in-django-a4a125af95d    
https://www.w3schools.com/django/   
https://es.wikipedia.org/wiki/Modelo%E2%80%93vista%E2%80%93controlador  

