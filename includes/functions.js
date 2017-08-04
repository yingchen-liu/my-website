const path = require('path');

const moment = require('moment');

const c = require('./config.js');


/**
 * Generate page title
 * @param {Array|String} title An array of title elements or one title element
 */
const title = (...title) => {
  title = title.constructor === Array ? title : [title];
  title.push(c.title.tail);
  return title.join(c.title.connector);
};

const data = (data, req) => {
  const system = {
    moment,
    base: c.base,
    process,
    req
  };
  return Object.assign(data, system);
};

const wrap = fn => (...args) => fn(...args).catch(args[2]);

const fileInfo = (filename) => {
  return {
    ext: path.extname(filename),
    base: path.basename(filename, path.extname(filename)),
    name: path.basename(filename),
    dir: path.dirname(filename)
  };
};

const process = (base, ...processors) => {
  const info = fileInfo(base);
  return `${info.base}-jimp-${processors.join('-')}${info.ext}`;
}

module.exports = { title, data, wrap, fileInfo };