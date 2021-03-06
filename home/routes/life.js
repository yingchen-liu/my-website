const path = require('path');

const express = require('express');
const router = express.Router();

const f = require('../includes/functions');
const db = require('../includes/db');

/**
 * Index
 */
router.get('/travels', f.wrap(async (req, res, next) => {
  const db = req.db;
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
    travels: records,
    meta: {
      description: `View Yingchen\'s Travels - In his leisure time, he loves travelling to different places, taking photos and enjoying the local delicious.`
    },
  }, req));
}));

router.get('/travels/:id/like', f.wrap(async (req, res, next) => {
  
}));

router.get('/travels/:id/unlike', f.wrap(async (req, res, next) => {
  
}));

module.exports = router;
