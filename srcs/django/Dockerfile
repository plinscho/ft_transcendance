FROM python:3.12-slim-bullseye

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

WORKDIR /app

COPY ./requirements.txt /app/

RUN pip install -r requirements.txt

COPY . /app/
RUN chmod +x ./scripts/start.sh

ENTRYPOINT [ "sh", "-c", "./scripts/start.sh" ]