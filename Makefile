# Transcendance Makefile
#
#

# Docker compose file location
COMPOSE = docker-compose.yaml

COMPOSE_CMD = docker compose -f ${COMPOSE}

# Basic build commands
build:
	${COMPOSE_CMD} up --build
up:
	${COMPOSE_CMD} up
down:
	${COMPOSE_CMD} down

# CLEAN
#
dbclean: down
	docker volume prune -f
clean: dbclean
	# rm -rf back/... back/... front/...

fclean: down clean
	docker system prune -af

.PHONY: all build up down clean fclean
	
