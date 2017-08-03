const path = require('path');

const express = require('express');
const router = express.Router();

const f = require('../includes/functions');
const db = require('../includes/db');

/**
 * Index
 */
router.get('/travels', f.wrap(async (req, res, next) => {
  const results = await db.travels
    .merge((travel) => {
      return {
        people: db.users.filter((user) => {
          return travel('people').contains(user('id'));
        }).coerceTo('array')
      }
    })
    .orderBy(db.r.desc('to'))
    .run(db.conn).catch(next);
  const records = await results.toArray().catch(next);

  res.render('life/travels/index', f.data({ 
    title: f.title('Travel', 'Life'),
    travels: records
  }, req));
}));

module.exports = router;
