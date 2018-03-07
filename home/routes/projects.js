const express = require('express');
const router = express.Router();

const mdc = require('../includes/mdc');

const c = require('../includes/config');
const f = require('../includes/functions');
const db = require('../includes/db');


/**
 * Index
 */
router.get('/', f.wrap(async (req, res, next) => {
  const db = req.db;
  const results = await db.projectTypes
    .outerJoin(db.projects, (type, project) => {
      return type('id').eq(project('type'));
    })
    .orderBy(
      db.r.desc(db.r.row('right')('to')('year')),
      db.r.desc(db.r.row('right')('to')('month'))
    ) // order by project finish time
    .group((record) => {
      return record.pluck('left') // group by right (project type)
    })
    .ungroup()
    .orderBy(db.r.row('group')('left')('sort')) // order by project type sort 
    .map((group) => {
      return db.r.object(
        'id', group('group')('left')('id'),
        'name', group('group')('left')('name'),
        'subtitle', group('group')('left')('subtitle'),
        'slug', group('group')('left')('slug'),
        'icon', group('group')('left')('icon'),
        'sort', group('group')('left')('sort'),
        'projects', group('reduction')('right')
      );
    }).run(db.conn).catch(next);
  const records = await results.toArray().catch(next);

  res.render('projects/index', f.data({ 
    title: f.title('Projects'),
    projectTypes: records,
    meta: {
      description: `View Yingchen\'s Projects - ${c.meta.description}`
    },
  }, req));
}));

router.get('/:slug', f.wrap(async (req, res, next) => {
  const db = req.db;
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
    meta: {
      description: `${project.name} - ${project.brief}`
    },
    project
  }, req));
}));

router.post('/types', f.wrap(async (req, res, next) => {
  const db = req.db;

  // check if the slug exists
  const slugResults = await db.projectTypes.filter({
    slug: req.body.slug
  }).run(db.conn).catch(next);
  const slugRecords = await slugResults.toArray().catch(next);

  if (slugRecords.length > 0) return res.status(500).send({
    err: {
      msg: 'The slug already exists.'
    }
  }).end();

  // get the sort
  var sort = 0;
  const sortResults = await db.projectTypes.orderBy(db.r.desc('sort')).limit(1).run(db.conn).catch(next);
  const sortRecords = await sortResults.toArray().catch(next);
  if (sortRecords.length > 0) sort = sortRecords[0].sort + 1;

  // insert
  const results = await db.projectTypes
    .insert({
      name: req.body.name,
      subtitle: req.body.subtitle,
      icon: req.body.icon,
      sort,
      slug: req.body.slug
    })
    .run(db.conn).catch(next);

  const key = results.generated_keys[0];
  const insertedRecord = await db.projectTypes.get(key).run(db.conn).catch(next);

  res.json({
    projectType: insertedRecord
  });
}));

router.post('/types/:id', f.wrap(async (req, res, next) => {
  const db = req.db;

  // check if the type exists
  const typeRecord = await db.projectTypes.get(req.params.id).run(db.conn).catch(next);

  if (!typeRecord) return res.status(404).send({
    err: {
      msg: 'No such project type.'
    }
  }).end();

  // check if the slug exists
  const slugResults = await db.projectTypes.filter({
    slug: req.body.slug
  }).run(db.conn).catch(next);
  const slugRecords = await slugResults.toArray().catch(next);

  if (slugRecords.length > 0 && slugRecords[0].id !== req.params.id) return res.status(500).send({
    err: {
      msg: 'The slug already exists.'
    }
  }).end();

  const results = await db.projectTypes.get(req.params.id)
    .update({
      name: req.body.name,
      subtitle: req.body.subtitle,
      icon: req.body.icon,
      slug: req.body.slug
    })
    .run(db.conn).catch(next);

  const insertedRecord = await db.projectTypes.get(req.params.id).run(db.conn).catch(next);

  res.json({
    projectType: insertedRecord
  });
}));

router.delete('/types/:id', f.wrap(async (req, res, next) => {
  const db = req.db;

  // check if the type exists
  const typeRecord = await db.projectTypes.get(req.params.id).run(db.conn).catch(next);

  if (!typeRecord) return res.status(404).send({
    err: {
      msg: 'No such project type.'
    }
  }).end();

  // check if there is any projects in it
  const projectResults = await db.projects.filter({
    type: req.params.id
  }).run(db.conn).catch(next);
  const projectRecords = await projectResults.toArray().catch(next);

  if (projectRecords.length !== 0) return res.status(500).send({
    err: {
      msg: 'I can only delete a project type without any project in it.'
    }
  }).end();

  // delete
  const results = await db.projectTypes.get(req.params.id).delete().run(db.conn).catch(next);

  res.json({});
}));

module.exports = router;
