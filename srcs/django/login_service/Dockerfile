# Dockerfile for appentication services. 
# Login and registration
FROM python:3.12-slim-bullseye

WORKDIR /usr/srcs/app
RUN mkdir -p /home/app
RUN groupadd -r app && useradd --no-log-init -r -g app app
ENV HOME=/home/app
ENV APP_HOME=/home/app/web
RUN mkdir $APP_HOME
WORKDIR $APP_HOME

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD [ "gunicorn", "--bind", "0.0.0.0:8000", "config.wsgi.application"]