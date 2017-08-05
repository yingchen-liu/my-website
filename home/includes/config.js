const process = require('process');

const env = typeof process.env.NODE_ENV === 'undefined' ? 'development' : process.env.NODE_ENV;
console.log(`uses config for environment ${env}`);

var config = {
  all: {
    title: {
      tail: 'Yingchen Liu\'s Official Website',
      connector: ' - '
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
    }
  }
};

module.exports = Object.assign({}, config.all, config[env]);