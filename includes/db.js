const r = require('rethinkdb');

const db = {
  connect: () => {
    r.connect({ host: 'localhost', port: 28015 }, (err, conn) => {
      if (err) throw err;
      db.conn = conn;
      db.r = r;
      db.projects = r.db('mywebsite').table('projects');
      db.projectTypes = r.db('mywebsite').table('project_types');
      db.travels = r.db('mywebsite').table('travels');
      db.users = r.db('mywebsite').table('users');
      db.skills = r.db('mywebsite').table('skills');
      db.skillTypes = r.db('mywebsite').table('skill_types');
    });
  }
};

module.exports = db;