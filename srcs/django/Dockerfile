FROM python:3.12-slim-bullseye

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libpq-dev gcc && apt-get clean

RUN pip install --upgrade pip

EXPOSE 8080
EXPOSE 8443

COPY ./requirements.txt /app/

RUN pip install -r requirements.txt

COPY . /app/
RUN chmod +x ./scripts/start.sh

ENTRYPOINT [ "sh", "-c", "./scripts/start.sh" ]
#Asegúrate de que el archivo Dockerfile ejecute el servidor ASGI en lugar del servidor WSGI
#ENTRYPOINT [ "sh", "-c", "daphne -b 0.0.0.0 -p 8000 config.asgi:application" ]