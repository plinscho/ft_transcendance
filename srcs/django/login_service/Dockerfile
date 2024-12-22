# Dockerfile for login_service

FROM python:3.10-slim


COPY . .
COPY ./requirements.txt .

# WORKDIR /login
RUN pip install -r requirements.txt

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
