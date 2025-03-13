#!/bin/bash
#
# NGINX ssl configuration script
#
key_file='/etc/letsencrypt/live/pong_server/privkey.key';
cert_file='/etc/letsencrypt/live/pong_server/fullchain.crt';

if [ -e $key_file ] && [ -e $cert_file ]; then
    echo "SSL certification already done."
else
    mkdir -p /etc/letsencrypt/live/pong_server
    openssl req -x509 -nodes -days 365 -newkey rsa:4096 -keyout $key_file -out $cert_file -subj "/C=ES/ST=Barcelona/L=Barcelona/O=42/OU=Education/CN=plinscho.42.fr"
fi

exec nginx -g "daemon off;";