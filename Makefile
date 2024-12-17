# Transcendance Makefile
#

# Docker compose file location
COMPOSE = srcs/docker-compose.yaml

COMPOSE_CMD = docker compose -f ${COMPOSE}

# Basic build commands
build:
	$(COMPOSE_CMD) up --build

up:
	${COMPOSE_CMD} up

down:
	${COMPOSE_CMD} down

prune: down
	@docker system prune -a

.PHONY: all build up down clean fclean prune
	
