# Transcendance Makefile
#

# Docker compose file location
COMPOSE = srcs/docker-compose.yaml
PYCACHE = srcs/back_end/django/project/__pycache__/

COMPOSE_CMD = docker compose -f ${COMPOSE}

# Basic build commands
all: 
	$(COMPOSE_CMD) up --detach --build

stop:
	@if [ ! -z "$$(docker ps -aq)" ]; then \
		docker compose stop; \
	fi

down:
	${COMPOSE_CMD} down

clean:
	@if [ ! -z "$$(docker ps -aq)" ]; then \
		docker stop $$(docker ps -aq); \
		docker rm $$(docker ps -aq); \
	fi
	@if [ ! -z "$$(docker images -aq)" ]; then \
		docker rmi $$(docker images -aq); \
	fi	
	@if [ ! -z "$$(docker volume ls -q)" ]; then \
		docker volume rm $$(docker volume ls -q); \
	fi
	@if [ ! -z "$$(docker network ls -q --filter type=custom)" ]; then \
		docker network rm $$(docker network ls -q --filter type=custom); \
	fi
	@echo "Deleted all docker containers, volumes, networks, and images succesfully"

fclean: clean
	@docker system prune -a

re: clean all

.PHONY: all stop down clean fclean re 
	
