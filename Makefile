# Transcendance Makefile
#

# Docker compose file location
COMPOSE = srcs/docker-compose.yaml
COMPOSE_CMD = docker compose -f ${COMPOSE}
DOCKER_DATA_ROOT=/home/$(USER)/sgoinfre

# Basic build commands
all: ip
	$(COMPOSE_CMD) up --detach --build

ip:
	@mkdir -p srcs/ssl/
	chmod +x ip.sh
	./ip.sh

stop:
	@if [ ! -z "$$(docker ps -aq)" ]; then \
		$(COMPOSE_CMD) stop; \
	fi

down: stop
	${COMPOSE_CMD} down

ps:
	@if [ ! -z "$$(docker ps -aq)" ]; then \
		docker ps ;\
	fi

clean: down
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
	rm -rf srcs/ssl
	rm -rf $(DOCKER_DATA_ROOT)/ft_transcendance
	@docker system prune -a

test:
	$(COMPOSE_CMD) run --rm home_service python manage.py test
	$(COMPOSE_CMD) run --rm login_service python manage.py test

logs:
	$(COMPOSE_CMD) logs -f

re: clean all

.PHONY: all stop down ps clean fclean test logs re ip