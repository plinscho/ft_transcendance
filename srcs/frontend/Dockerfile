# Dockerfile
FROM nginx:latest

# Copiar el archivo de configuración de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar las plantillas y archivos estáticos al directorio de Nginx
COPY ./templates /usr/share/nginx/html
COPY ./static /usr/share/nginx/html/static