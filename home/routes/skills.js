const express = require('express');
const router = express.Router();

const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

const c = require('../includes/config');
const f = require('../includes/functions');
const db = require('../includes/db');

const skills = require('../models/skills');


const validateSkillType = [
  check('id')
    .custom(f.wrap(async (id, { req, location, path }) => {
      const db = req.db;

      if (id) {
        // for update only

        const typeRecord = await db.skillTypes.get(req.params.id).run(db.conn).catch((err) => {
          throw err;
        });

        if (!typeRecord) throw new Error('No such skill type.');
      }
    })),
  check('name').exists().trim().not().isEmpty().withMessage('Skill type should have a name.'),
  check('icon').exists().trim().not().isEmpty().withMessage('Choose an icon please.'),
  check('sort').optional().isInt({ min: 0 }).withMessage('Sort should be a positive integer or zero.'),
];

const validateSkill = [
  check('id')
    .custom(f.wrap(async (id, { req, location, path }) => {
      const db = req.db;

      if (id) {
        // for update only

        const skillRecord = await db.skills.get(req.params.id).run(db.conn).catch((err) => {
          throw err;
        });

        if (!skillRecord) throw new Error('No such skill.');
      }
    })),
  check('name')
    .exists().trim().not().isEmpty().withMessage('Skill must have a name.'),
  check('type')
    .custom(f.wrap(async (type, { req, location, path }) => {
      const db = req.db;

      if (!req.params.id) {
        const typeRecord = await db.skillTypes.get(type).run(db.conn).catch((err) => {
          throw err;
        });

        if (!typeRecord) throw new Error('No such skill type.');
      }
    })),
  check('icon').exists().trim().not().isEmpty().withMessage('Choose an icon please.'),
];

/**
 * Add skill
 */
router.post('/', validateSkill, f.wrap(async (req, res, next) => {
  const db = req.db;

  if (!req.session.user) return next(new f.AppError('Permission denied.', 403));

  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new f.AppError('Invalid data.', 422, errors.array()));

  // get the sort
  var sort = 0;
  const sortResults = await db.skills.orderBy(db.r.desc('sort')).limit(1).run(db.conn).catch(next);
  const sortRecords = await sortResults.toArray().catch(next);
  if (sortRecords.length > 0) sort = sortRecords[0].sort + 1;

  // insert
  const result = await db.skills
    .insert({
      name: req.body.name,
      website: req.body.website,
      icon: req.body.icon,
      type: req.body.type,
      fluency: req.body.fluency,
      sort
    })
    .run(db.conn).catch(next);

  const key = result.generated_keys[0];
  const insertedRecord = await db.skills.get(key).run(db.conn).catch(next);

  res.json({
    skill: insertedRecord
  });
}));

/**
 * Add skill type
 */
router.post('/types', validateSkillType, f.wrap(async (req, res, next) => {
  const db = req.db;

  if (!req.session.user) return next(new f.AppError('Permission denied.', 403));

  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new f.AppError('Invalid data.', 422, errors.array()));

  // get the sort
  var sort = 0;
  const sortResults = await db.skillTypes.orderBy(db.r.desc('sort')).limit(1).run(db.conn).catch(next);
  const sortRecords = await sortResults.toArray().catch(next);
  if (sortRecords.length > 0) sort = sortRecords[0].sort + 1;

  // insert
  const results = await db.projectTypes
    .insert({
      name: req.body.name,
      subtitle: req.body.subtitle,
      icon: req.body.icon,
      sort
    })
    .run(db.conn).catch(next);

  const key = results.generated_keys[0];
  const insertedRecord = await db.skillTypes.get(key).run(db.conn).catch(next);

  res.json({
    skillType: insertedRecord
  });
}));

/**
 * Sort skill type
 */
router.post('/types/sort', f.wrap(async (req, res, next) => {
  const db = req.db;

  if (!req.session.user) return next(new f.AppError('Permission denied.', 403));

  const sort = JSON.parse(req.body.sort);
  for (let i = 0; i < sort.length; i++) {
    const result = await db.skillTypes.get(sort[i])
      .update({
        sort: i
      })
      .run(db.conn).catch(next);
  }

  res.json({});
}));

/**
 * Sort skill
 */
router.post('/sort', f.wrap(async (req, res, next) => {
  const db = req.db;

  if (!req.session.user) return next(new f.AppError('Permission denied.', 403));

  const sort = JSON.parse(req.body.sort);
  for (let i = 0; i < sort.length; i++) {
    const result = await db.skills.get(sort[i])
      .update({
        sort: i
      })
      .run(db.conn).catch(next);
  }

  res.json({});
}));

/**
 * Update skill type
 */
router.post('/types/:id', validateSkillType, f.wrap(async (req, res, next) => {
  const db = req.db;

  if (!req.session.user) return next(new f.AppError('Permission denied.', 403));

  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new f.AppError('Invalid data.', 422, errors.array()));

  // update
  const result = await db.skillTypes.get(req.params.id)
    .update({
      name: req.body.name,
      subtitle: req.body.subtitle,
      icon: req.body.icon
    })
    .run(db.conn).catch(next);

  const updatedRecord = await db.skillTypes.get(req.params.id).run(db.conn).catch(next);

  res.json({
    skillType: updatedRecord
  });
}));

/**
 * Delete skill
 */
router.delete('/:id', f.wrap(async (req, res, next) => {
  const db = req.db;

  if (!req.session.user) return next(new f.AppError('Permission denied.', 403));

  // check if the skill exists
  const skillRecord = await db.skills.get(req.params.id).run(db.conn).catch(next);

  if (!skillRecord) return next(new f.AppError('No such skill.', 404));

  // delete
  const results = await db.skills.get(req.params.id).delete().run(db.conn).catch(next);

  res.json({});
}));

/**
 * Delete skill type
 */
router.delete('/types/:id', f.wrap(async (req, res, next) => {
  const db = req.db;

  if (!req.session.user) return next(new f.AppError('Permission denied.', 403));

  // check if the type exists
  const typeRecord = await db.skillTypes.get(req.params.id).run(db.conn).catch(next);

  if (!typeRecord) return res.status(404).send({
    err: {
      msg: 'No such skill type.'
    }
  }).end();
 
  // check if there is any projects in it
  const skillResults = await db.projects.filter({
    type: req.params.id
  }).run(db.conn).catch(next);
  const skillRecords = await skillResults.toArray().catch(next);

  if (skillRecords.length !== 0) return next(new f.AppError('I can only delete a skill type without any skill in it.'));

  // delete
  const results = await db.skillTypes.get(req.params.id).delete().run(db.conn).catch(next);

  res.json({});
}));

/**
 * Update skill
 */
router.post('/:id', validateSkill, f.wrap(async (req, res, next) => {
  const db = req.db;

  if (!req.session.user) return next(new f.AppError('Permission denied.', 403));

  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new f.AppError('Invalid data.', 422, errors.array()));

  // update
  const result = await db.skills.get(req.params.id)
    .update({
      name: req.body.name,
      website: req.body.website,
      icon: req.body.icon,
      fluency: req.body.fluency
    })
    .run(db.conn).catch(next);

  const updatedRecord = await db.skills.get(req.params.id).run(db.conn).catch(next);

  res.json({
    skill: updatedRecord
  });
}));

module.exports = router;
