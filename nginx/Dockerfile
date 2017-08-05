FROM nginx

RUN mkdir /etc/nginx/logs && touch /etc/nginx/logs/static.log

ADD ./default.conf /etc/nginx/conf.d/default.conf

RUN mkdir /etc/nginx/ssl
RUN mkdir /etc/nginx/auth

EXPOSE 80
EXPOSE 443
