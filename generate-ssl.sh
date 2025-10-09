#!/bin/bash

# Create SSL directory
mkdir -p ./docker/nginx/ssl

# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ./docker/nginx/ssl/selfsigned.key \
    -out ./docker/nginx/ssl/selfsigned.crt \
    -subj "/C=ID/ST=WestJava/L=Karawang/O=Local/OU=Dev/CN=localhost"

echo "Self-signed certificate generated successfully!"
echo "Files created:"
echo "- ./docker/nginx/ssl/selfsigned.key"
echo "- ./docker/nginx/ssl/selfsigned.crt"
