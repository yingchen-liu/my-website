const http = require('http');
const cloudcmd = require('cloudcmd');
const io = require('socket.io');
const app = require('express')();
const path = require('path');

const c = require('./config');

const port = 1337;

const server = http.createServer(app);
const socket = io.listen(server, {
  path: '/codecmd/socket.io'
});

app.use(cloudcmd({
  socket,
  config: {
    prefix: '/codecmd',
    root: path.join(__dirname, '../uploads')
  }
}));

server.listen(port);