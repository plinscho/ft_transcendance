# Dockerfile for nginx webserver
FROM nginx:latest

# Copiar el archivo de configuración de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the gen_openssl.sh script and make it executable
COPY gen_openssl.sh /usr/local/bin/gen_openssl.sh

RUN mkdir -p /etc/letsencrypt/live/pong_server
RUN chown 777 /etc/letsencrypt/live/pong_server

# Make directories for the volumes
RUN mkdir -p /usr/share/nginx/html/static
RUN mkdir -p /usr/share/nginx/html/templates


RUN chmod +x /usr/local/bin/gen_openssl.sh

# Copiar las plantillas y archivos estáticos al directorio de Nginx
ENTRYPOINT [ "/usr/local/bin/gen_openssl.sh" ]
#CMD ["nginx -g 'daemon off;'"]