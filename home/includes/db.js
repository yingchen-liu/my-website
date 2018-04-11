const r = require('rethinkdb');
const async = require('async');

const c = require('./config');

console.log(c);

const tables = [
  'projects',
  'project_types',
  'links',
  'link_types',
  'travels',
  'users',
  'skills',
  'skill_types',
  'resume',
  'uploads'
]

const connect = (req, res, next) => {
  r.connect({ host: c.db.host, port: c.db.port }, (err, conn) => {
    if (err) return next(err);

    r.dbCreate('mywebsite').run(conn, (err, result) => {
      async.forEach(tables, (table, callback) => {
        r.tableCreate(table).run(conn, (err) => {
          callback();
        });
      }, (err) => {

        req.db = {
          conn,
          r,
          projects: r.db('mywebsite').table('projects'),
          projectTypes: r.db('mywebsite').table('project_types'),
          links: r.db('mywebsite').table('links'),
          linkTypes: r.db('mywebsite').table('link_types'),
          travels: r.db('mywebsite').table('travels'),
          users: r.db('mywebsite').table('users'),
          skills: r.db('mywebsite').table('skills'),
          skillTypes: r.db('mywebsite').table('skill_types'),
          resume: r.db('mywebsite').table('resume'),
          uploads: r.db('mywebsite').table('uploads')
        };

        next();
      });
    });
  });
};

module.exports = connect;