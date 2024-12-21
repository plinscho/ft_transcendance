# Dockerfile for home_service

FROM python:3.10-slim


COPY . .
COPY ./requirements.txt .

RUN pip install -r requirements.txt
# WORKDIR /home
# RUN python manage.py migrate


CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
