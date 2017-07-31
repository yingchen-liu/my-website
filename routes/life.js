const path = require('path');

const express = require('express');
const router = express.Router();

const f = require('../includes/functions');
const db = require('../includes/db');

/**
 * Index
 */
router.get('/travels', (req, res, next) => {
  db.travels
    .merge((travel) => {
      return {
        people: db.users.filter((user) => {
          return travel('people').contains(user('id'));
        }).coerceTo('array')
      }
    })
    .orderBy(db.r.desc('to'))
    .run(db.conn, (err, results) => {
      if (err) throw(err);
      results.toArray((err, records) => {
        if (err) throw(err);

        res.render('life/travels/index', f.data({ 
          title: f.title('Travel', 'Life'),
          travels: records
        }));
      });
    });

  
});

module.exports = router;
