FROM node:alpine

WORKDIR /app

COPY . .

RUN npm install
RUN npm install babel-cli -g

EXPOSE 3000
EXPOSE 8000
EXPOSE 1337

CMD [ "babel-node", "bin/www" ]