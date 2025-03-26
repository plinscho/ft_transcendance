FROM python:3.12-slim-bullseye

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libpq-dev gcc && apt-get clean

RUN pip install --upgrade pip

COPY ./requirements.txt /app/

RUN pip install -r requirements.txt

COPY . /app/
RUN chmod +x ./scripts/start.sh

ENTRYPOINT [ "sh", "-c", "./scripts/start.sh" ]
