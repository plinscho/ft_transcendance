FROM python:3.12-slim-bullseye

# setting workdir
WORKDIR /usr/srcs/app

RUN mkdir -p /home/app
RUN groupadd -r app && useradd --no-log-init -r -g app app
ENV HOME=/home/app
ENV APP_HOME=/home/app/web
RUN mkdir $APP_HOME
WORKDIR $APP_HOME

# env variables
# prevents python from writing pyc files to disk
ENV PYTHONUNBUFFERED 1

# Prevents python from buffering stdout and stderr
ENV PYTHONDONTWEITEBYTECODE 1

# psycopg dependencies (for postgres)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# install dependencies
RUN pip install --upgrade pip flake8
COPY requirements.txt ./
RUN pip install -r requirements.txt

COPY . .

# lint
RUN flake8 --ignore=E501,F401 .

CMD ["guicorn", "--bind", "0.0.0.0:8000", "config.wsgi:application"]