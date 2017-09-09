const express = require('express');
const router = express.Router();

const c = require('../includes/config');
const f = require('../includes/functions');
const db = require('../includes/db');


/**
 * Index
 */
router.get('/tools', f.wrap(async (req, res, next) => {
  const db = req.db;
  const results = await db.links
    .innerJoin(db.linkTypes, (link, type) => {
      return link('type').eq(type('id'));
    })
    .orderBy(
      db.r.asc(db.r.row('left')('sort'))
    ) // order by link sort
    .group((record) => {
      return record.pluck('right') // group by right (link type)
    }).map((link) => {
      return link('left');
    })
    .ungroup()
    .orderBy(db.r.row('group')('right')('sort')) // order by link type sort 
    .map((group) => {
      return db.r.object(
        'id', group('group')('right')('id'),
        'name', group('group')('right')('name'),
        'subtitle', group('group')('right')('subtitle'),
        'slug', group('group')('right')('slug'),
        'sort', group('group')('right')('sort'),
        'links', group('reduction')
      );
    }).run(db.conn).catch(next);
  const records = await results.toArray().catch(next);

  res.render('collections/tools/index', f.data({ 
    title: f.title('Tools'),
    linkTypes: records,
    meta: {
      description: `View all useful websites collected by Yingchen - ${c.meta.description}`
    },
  }, req));
}));

router.get('/tools/types', f.wrap(async (req, res, next) => {
  const db = req.db;
  const results = await db.linkTypes.run(db.conn).catch(next);
  const records = await results.toArray().catch(next);

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");

  res.json(records);
}));

// router.post('/tools', f.wrap(async (req, res, next) => {
//   console.log(req.body);
//   const result = await db.links.insert(req.body).run(db.conn).catch(next);
//   console.log(result);
//   res.json(result);
// }));

module.exports = router;
