FROM node:alpine

WORKDIR /app

COPY . .

RUN npm install
RUN npm install babel-cli -g

EXPOSE 3000

CMD [ "babel-node", "bin/www" ]