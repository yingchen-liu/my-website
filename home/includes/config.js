const process = require('process');

const env = typeof process.env.NODE_ENV === 'undefined' ? 'development' : process.env.NODE_ENV;
console.log(`uses config for environment ${env}`);

var config = {
  all: {
    title: {
      tail: 'Yingchen Liu\'s Official Website',
      connector: ' - '
    },
    meta: {
      description: 'Yingchen Liu (刘盈琛) - a geek who is keen on programming. He enjoys experimenting to find intersections in technology and daily life. His interests include website, mobile APP development, IoT and robotics.',
      keywords: 'yingchen,yingchen liu,刘盈琛,geek,programmer,developer,website,mobile,app,iot,robotic'
    },
    base: ''
  },
  development: {
    db: {
      host: '127.0.0.1',
      port: 28015
    }
  },
  production: {
    db: {
      host: 'db',
      port: 28015
    },
    ga: {
      trackingId: 'UA-76013614-1'
    }
  }
};

module.exports = Object.assign({}, config.all, config[env]);