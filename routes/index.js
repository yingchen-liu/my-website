const path = require('path');

const express = require('express');
const router = express.Router();

const f = require('../includes/functions');
const db = require('../includes/db');


router.get('/', f.wrap(async function (req, res, next) {
  const langResults = await db.skills
    .filter({ type: 'programming language' })
    .orderBy('sort')
    .run(db.conn).catch(next);

  const langRecords = await langResults.toArray().catch(next);

  const frameworkResults = await db.skills
    .filter({ type: 'framework' })
    .orderBy('sort')
    .run(db.conn).catch(next);

  const frameworkRecords = await frameworkResults.toArray().catch(next);
              
  const dbResults = await db.skills
    .filter({ type: 'database' })
    .orderBy('sort')
    .run(db.conn).catch(next);
  
  const dbRecords = await dbResults.toArray().catch(next);

  res.render('index', f.data({ 
    title: f.title(),
    programmingLanguages: langRecords,
    frameworks: frameworkRecords,
    databases: dbRecords
  }));
}));

router.get(/uploads\/.*/, (req, res, next) => {
  let file = req.path.split('..').join();
  file = path.join(__dirname, '..', file);
  res.sendFile(file);
});

module.exports = router;
