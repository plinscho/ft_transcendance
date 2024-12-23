FROM python:3.12-slim-bullseye

# setting workdir
WORKDIR /usr/srcs/app

# env variables
# prevents python from writing pyc files to disk
ENV PYTHONUNBUFFERED 1

# Prevents python from buffering stdout and stderr
ENV PYTHONDONTWEITEBYTECODE 1

# install dependencies
RUN pip install --upgrade pip pipenv flake8
COPY Pipfile* ./
RUN pipenv install --system --ignore-pipfile

COPY . .

# lint
RUN flake8 --ignore=E501,F401 .