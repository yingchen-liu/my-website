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
      keywords: 'yingchen,yingchen liu,刘盈琛,geek,fullstack,frontend,backend,programmer,developer,website,mobile,app,iot,robotic'
    },
    base: '',
    auth: {
      md5Prefix: '$T%HE%T@C$D#T%TC#$34t@#4d234d24r1x34',
      md5Suffix: '!@$r14x4r124!@4r1d2421!@$sr2#123x12e',
      sessionSecret: 'TW$v45#$56v5T2x5tv5K69OM78*0./+.900,C3$!X4x@35 t34ybn7in568MI8ibv345C@5td234d3F#4vb35yV#'
    }
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

module.exports = Object.assign({}, config.all, config[env], { env });