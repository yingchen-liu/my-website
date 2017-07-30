const express = require('express');
const router = express.Router();

const mdc = require('../includes/mdc');

const f = require('../includes/functions');
const db = require('../includes/db');


/**
 * Index
 */
router.get('/', f.wrap(async (req, res, next) => {
  const results = await db.projectTypes
    .innerJoin(db.projects, (type, project) => {
      return project('type').eq(type('id'));
    })
    .orderBy(
      db.r.row('left')('sort'),
      db.r.desc(db.r.row('right')('to')('year')),
      db.r.desc(db.r.row('right')('to')('month'))
    )
    .run(db.conn).catch(next);
  const records = await results.toArray().catch(next);

  const projectTypes = [];
  records.forEach((record) => {
    let indexOf = -1;
    for (let i = 0; i < projectTypes.length; i++) {
      if (projectTypes[i].id === record.left.id) {
        indexOf = i;
        break;
      }
    }

    if (indexOf === -1) {
      projectTypes.push(Object.assign({}, record.left, { projects: [] }));
      indexOf = projectTypes.length - 1;
    }

    projectTypes[indexOf].projects.push(record.right);
  });

  res.render('projects/index', f.data({ 
    title: f.title('Projects'),
    projectTypes
  }));
}));

router.get('/:slug', f.wrap(async (req, res, next) => {
  const results = await db.projects
    .filter({ slug: req.params.slug })
    .run(db.conn).catch(next);
  const records = await results.toArray().catch(next);

  if (records.length === 0) return res.status(404).end();

  const project = records[0];
  if (project.content) {
    project.content = mdc.render(project.content);
  }

  res.render('projects/detail', f.data({ 
    title: f.title(project.name, 'Projects'),
    project
  }));
}));

module.exports = router;
