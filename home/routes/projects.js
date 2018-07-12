const express = require('express');
const router = express.Router();

const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

const c = require('../includes/config');
const f = require('../includes/functions');
const db = require('../includes/db');

const projects = require('../models/projects');


const validateProjectType = [
  check('id')
    .custom(f.wrap(async (id, { req, location, path }) => {
      const db = req.db;

      if (id) {
        // for update only

        const typeRecord = await db.projectTypes.get(req.params.id).run(db.conn).catch((err) => {
          throw err;
        });

        if (!typeRecord) throw new Error('No such project type.');
      }
    })),
  check('name').exists().trim().not().isEmpty().withMessage('Project type should have a name.'),
  check('slug')
    .exists().trim().not().isEmpty().withMessage('Project must have a slug.')
    .custom(f.wrap(async (slug, { req, location, path }) => {
      const db = req.db;

      const slugResults = await db.projectTypes.filter({
        slug: req.body.slug
      }).run(db.conn).catch((err) => {
        throw err;
      });
      const slugRecords = await slugResults.toArray().catch((err) => {
        throw err;
      });
    
      if (req.params.id) {
        // for update
        if (slugRecords.length > 0 && slugRecords[0].id !== req.params.id) throw new Error('The slug has already existed.');
      } else {
        // for insert
        if (slugRecords.length > 0) throw new Error('The slug has already existed.');
      }
    })),
  check('icon').exists().trim().not().isEmpty().withMessage('Choose an icon please.'),
  check('sort').optional().isInt({ min: 0 }).withMessage('Sort should be a positive integer or zero.'),
  check('experienceType').exists().trim().not().isEmpty().withMessage('Choose an experience type please.'),
];

const validateProject = [
  check('id')
    .custom(f.wrap(async (id, { req, location, path }) => {
      const db = req.db;

      if (id) {
        // for update only

        const projectRecord = await db.projects.get(req.params.id).run(db.conn).catch((err) => {
          throw err;
        });

        if (!projectRecord) throw new Error('No such project.');
      }
    })),
  check('name')
    .exists().trim().not().isEmpty().withMessage('Project must have a name.'),
  check('brief')
    .exists().trim().not().isEmpty().withMessage('Brief description must be provided.'),
  check('fromMonth')
    .exists().isInt().withMessage('From month must be an integer.').toInt(),
  check('fromYear')
    .exists().isInt().withMessage('From year must be an integer.').toInt(),
  check('toMonth')
    .exists().isInt().withMessage('To month must be an integer.').toInt(),
  check('toYear')
    .exists().isInt().withMessage('To year must be an integer.').toInt(),
  check('cover')
    .exists().not().isEmpty().withMessage('You must upload a cover image for this project.'),
  check('type')
    .exists().trim().not().isEmpty().withMessage('Project must have a type.')
    .custom(f.wrap(async (type, { req, location, path }) => {
      const db = req.db;

      const typeRecord = await db.projectTypes.get(type).run(db.conn).catch((err) => {
        throw err;
      });

      if (!typeRecord) throw new Error('No such project type.');
    })),
  check('slug')
    .exists().trim().not().isEmpty().withMessage('Project must have a slug.')
    .custom(f.wrap(async (slug, { req, location, path }) => {
      const db = req.db;

      const slugResults = await db.projects.filter({
        type: req.body.type,
        slug: req.body.slug
      }).run(db.conn).catch((err) => {
        throw err;
      });
      const slugRecords = await slugResults.toArray().catch((err) => {
        throw err;
      });
    
      if (req.params.id) {
        // for update
        if (slugRecords.length > 0 && slugRecords[0].id !== req.params.id) throw new Error('The slug has already existed.');
      } else {
        // for insert
        if (slugRecords.length > 0) throw new Error('The slug has already existed.');
      }
    }))
];


/**
 * Get project list
 */
router.get('/', f.wrap(async (req, res, next) => {
  const db = req.db;

  const records = await projects.getProjects(db);

  res.render('projects/index', f.data({ 
    title: f.title('Projects'),
    projectTypes: records,
    meta: {
      description: `View Yingchen\'s Projects - ${c.meta.description}`
    },
  }, req));
}));

/**
 * Add new project page
 */
router.get('/:type/new-project', f.wrap(async (req, res, next) => {
  const db = req.db;

  if (!req.session.user) return next(new f.AppError('Permission denied.', 403));

  const typeResults = await db.projectTypes.filter({
    slug: req.params.type
  }).run(db.conn).catch(next);
  const typeRecords = await typeResults.toArray().catch(next);

  if (typeRecords.length === 0) return next(new f.AppError('No such project type.', 404));

  res.render('projects/detail', f.data({ 
    title: f.title('Add a Project', 'Projects'),
    type: typeRecords[0],
    project: {
      responsibilities: [],
      technologies: []
    }
  }, req));
}));

/**
 * Add project
 */
router.post('/', validateProject, f.wrap(async (req, res, next) => {
  const db = req.db;

  if (!req.session.user) return next(new f.AppError('Permission denied.', 403));

  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new f.AppError('Invalid data.', 422, errors.array()));


  // insert
  const result = await db.projects
    .insert({
      name: req.body.name,
      brief: req.body.brief,
      label: req.body.label,
      responsibilities: f.arrayFromString(req.body.responsibilities),
      from: {
        year: req.body.fromYear,
        month: req.body.fromMonth
      },
      to: {
        year: req.body.toYear,
        month: req.body.toMonth
      },
      link: req.body.link,
      content: req.body.content,
      showInResume: req.body.showInResume === 'true',
      isDraft: req.body.isDraft === 'true',
      technologies: f.arrayFromString(req.body.technologies),
      cover: req.body.cover,
      type: req.body.type,
      slug: req.body.slug
    })
    .run(db.conn).catch(next);

  const key = result.generated_keys[0];
  const insertedRecord = await db.projects.get(key).run(db.conn).catch(next);

  res.json({
    project: insertedRecord
  });
}));

/**
 * Get project
 */
router.get('/:slug', f.wrap(async (req, res, next) => {
  const db = req.db;

  const results = await db.projects
    .filter({ slug: req.params.slug })
    .run(db.conn).catch(next);
  const records = await results.toArray().catch(next);

  if (records.length === 0) return next();

  const project = records[0];

  if (project.isDraft && !req.session.user) return next(new f.AppError('Permission denied.', 403));

  res.render('projects/detail', f.data({ 
    title: f.title(project.name, 'Projects'),
    meta: {
      description: `${project.name} - ${project.brief}`
    },
    project
  }, req));
}));

/**
 * Add project type
 */
router.post('/types', validateProjectType, f.wrap(async (req, res, next) => {
  const db = req.db;

  if (!req.session.user) return next(new f.AppError('Permission denied.', 403));

  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new f.AppError('Invalid data.', 422, errors.array()));

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
      slug: req.body.slug,
      experienceType: req.body.experienceType
    })
    .run(db.conn).catch(next);

  const key = results.generated_keys[0];
  const insertedRecord = await db.projectTypes.get(key).run(db.conn).catch(next);

  res.json({
    projectType: insertedRecord
  });
}));

/**
 * Sort project type
 */
router.post('/types/sort', f.wrap(async (req, res, next) => {
  const db = req.db;

  if (!req.session.user) return next(new f.AppError('Permission denied.', 403));

  const sort = JSON.parse(req.body.sort);
  for (let i = 0; i < sort.length; i++) {
    const result = await db.projectTypes.get(sort[i])
      .update({
        sort: i
      })
      .run(db.conn).catch(next);
  }

  res.json({});
}));

/**
 * Update project type
 */
router.post('/types/:id', validateProjectType, f.wrap(async (req, res, next) => {
  const db = req.db;

  if (!req.session.user) return next(new f.AppError('Permission denied.', 403));

  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new f.AppError('Invalid data.', 422, errors.array()));

  // update
  const result = await db.projectTypes.get(req.params.id)
    .update({
      name: req.body.name,
      subtitle: req.body.subtitle,
      icon: req.body.icon,
      slug: req.body.slug,
      experienceType: req.body.experienceType
    })
    .run(db.conn).catch(next);

  const updatedRecord = await db.projectTypes.get(req.params.id).run(db.conn).catch(next);

  res.json({
    projectType: updatedRecord
  });
}));

/**
 * Delete project type
 */
router.delete('/types/:id', f.wrap(async (req, res, next) => {
  const db = req.db;

  if (!req.session.user) return next(new f.AppError('Permission denied.', 403));

  // check if the type exists
  const typeRecord = await db.projectTypes.get(req.params.id).run(db.conn).catch(next);

  if (!typeRecord) return next(new f.AppError('No such project type.', 404));
 
  // check if there is any projects in it
  const projectResults = await db.projects.filter({
    type: req.params.id
  }).run(db.conn).catch(next);
  const projectRecords = await projectResults.toArray().catch(next);

  if (projectRecords.length !== 0) return next(new f.AppError('I can only delete a project type without any project in it.'));

  // delete
  const results = await db.projectTypes.get(req.params.id).delete().run(db.conn).catch(next);

  res.json({});
}));

/**
 * Update project
 */
router.post('/:id', validateProject, f.wrap(async (req, res, next) => {
  const db = req.db;

  if (!req.session.user) return next(new f.AppError('Permission denied.', 403));

  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new f.AppError('Invalid data.', 422, errors.array()));

  // update
  const result = await db.projects.get(req.params.id)
    .update({
      name: req.body.name,
      brief: req.body.brief,
      label: req.body.label,
      responsibilities: f.arrayFromString(req.body.responsibilities),
      from: {
        year: req.body.fromYear,
        month: req.body.fromMonth
      },
      to: {
        year: req.body.toYear,
        month: req.body.toMonth
      },
      link: req.body.link,
      content: req.body.content,
      showInResume: req.body.showInResume === 'true',
      isDraft: req.body.isDraft === 'true',
      technologies: f.arrayFromString(req.body.technologies),
      cover: req.body.cover,
      slug: req.body.slug,
      type: req.body.type
    })
    .run(db.conn).catch(next);

  const updatedRecord = await db.projects.get(req.params.id).run(db.conn).catch(next);

  res.json({
    project: updatedRecord
  });
}));

module.exports = router;
