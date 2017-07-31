const express = require('express');
const router = express.Router();

const mdc = require('../includes/mdc');

const f = require('../includes/functions');
const db = require('../includes/db');


/**
 * Index
 */
router.get('/', f.wrap(async (req, res, next) => {
  
  const results = await db.projects
    .innerJoin(db.projectTypes, (project, type) => {
      return project('type').eq(type('id'));
    })
    .orderBy(db.r.desc(db.r.row('right')('to')('year')),
      db.r.desc(db.r.row('right')('to')('month'))) // order by skill sort
    .group((record) => {
      return record.pluck('right') // group by right (skill type)
    }).map((project) => {
      return project('left');
    })
    .ungroup()
    .orderBy(db.r.row('group')('right')('sort')) // order by skill sort 
    .map((group) => {
      return db.r.object(
        'id', group('group')('right')('id'),
        'name', group('group')('right')('name'),
        'subtitle', group('group')('right')('subtitle'),
        'slug', group('group')('right')('slug'),
        'icon', group('group')('right')('icon'),
        'sort', group('group')('right')('sort'),
        'projects', group('reduction')
      );
    }).run(db.conn).catch(next);
  const records = await results.toArray().catch(next);

  res.render('projects/index', f.data({ 
    title: f.title('Projects'),
    projectTypes: records
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
