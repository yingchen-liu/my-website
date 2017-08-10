FROM nginx

RUN mkdir /etc/nginx/logs && \
    touch /etc/nginx/logs/static.log && \
    mkdir /etc/nginx/ssl && \
    mkdir /etc/nginx/auth

ADD ./default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
EXPOSE 443
