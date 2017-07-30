const c = require('./config.js');
const moment = require('moment');

/**
 * Generate page title
 * @param {Array|String} title An array of title elements or one title element
 */
const title = (...title) => {
  title = title.constructor === Array ? title : [title];
  title.push(c.title.tail);
  return title.join(c.title.connector);
};

const data = (data) => {
  const system = {
    moment,
    base: c.modes[c.mode].base
  };
  return Object.assign(data, system);
};

const wrap = fn => (...args) => fn(...args).catch(args[2]);

module.exports = { title, data, wrap };