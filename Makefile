# Transcendance Makefile
#

# Docker compose file location
COMPOSE = srcs/docker-compose.yaml
PYCACHE = srcs/back_end/django/app/__pycache__/

COMPOSE_CMD = docker compose -f ${COMPOSE}

# Basic build commands
build:
	$(COMPOSE_CMD) up --build

up:
	${COMPOSE_CMD} up

clean_pycache:
	@if [ -d "${PYCACHE}" ] && [ "$(ls -A ${PYCACHE})" ]; then \
		rm ${PYCACHE}/*; \
	fi

down:
	
	${COMPOSE_CMD} down

prune: down clean_pycache
	@docker system prune -a

.PHONY: all build up down clean fclean clean_pycache prune
	
