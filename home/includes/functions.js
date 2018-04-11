const path = require('path');

const moment = require('moment');
const deepAssign = require('deep-assign');

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
    c,
    base: c.base,
    process,
    user: req.session ? req.session.user: null,
    session: req.session,
    req,
    meta: c.meta
  };
  return deepAssign({}, system, data);
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
  // const info = fileInfo(base);
  // return `${info.base}-jimp-${processors.join('-')}${info.ext}`;
  return `${base}?p=${processors.join('-')}`;
};

const arrayFromString = (string) => {
  var results = string.split(/\s*,\s*/);
  return results.filter((a) => {
    return a !== '';
  });
};

class AppError extends Error {
  constructor(message, status, fields, err) {
    super(message);
    this.status = status;
    this.fields = fields;
    this.stack = (err ? err : new Error()).stack;
  }
}

module.exports = { title, data, wrap, arrayFromString, fileInfo, AppError };