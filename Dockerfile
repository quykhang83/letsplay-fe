FROM nginx:latest

# Copy the template configuration for nginx
# This template is later changed to default.conf when the container is started
# COPY default.conf.template etc/nginx/conf.d/default.conf.template	
RUN rm /etc/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./mime.types /etc/nginx/mime.types

# Copy fe source code to image
COPY src ./var/www/letsplay/html

EXPOSE 80/tcp
EXPOSE 443/tcp

# CMD /bin/bash -c "envsubst < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'" 