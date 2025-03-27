# Dockerfile for nginx webserver
FROM nginx:latest

# Copiar el archivo de configuración de Nginx
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Copy the gen_openssl.sh script and make it executable
COPY nginx/gen_openssl.sh /usr/local/bin/gen_openssl.sh

# Copy HTML, JS files
COPY frontend/ /usr/share/nginx/html/

EXPOSE 8080
EXPOSE 8443

RUN mkdir -p /etc/letsencrypt/live/pong_server && \
    mkdir -p /vol/static && \
    mkdir -p /vol/media && \
    chmod 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chmod +x /usr/local/bin/gen_openssl.sh

ENTRYPOINT [ "/usr/local/bin/gen_openssl.sh" ]
