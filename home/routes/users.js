const express = require('express');
const router = express.Router();

const md5 = require('md5');

const f = require('../includes/functions');
const c = require('../includes/config');


router.post('/login', f.wrap(async (req, res, next) => {
  const db = req.db;

  const results = await db.users.filter({
    email: req.body.email
  }).run(db.conn).catch(next);
  const records = await results.toArray().catch(next);

  // user not found
  if (records.length === 0) return next(new f.AppError('We can\'t find you in our system.', 404, 'email'));

  const user = records[0];

  // wrong password
  if (md5(md5(c.auth.md5Prefix + '_' + req.body.password + '_' + c.auth.md5Suffix)) !== user.password) {
    return next(new f.AppError('Wrong password. We can\'t let you in.', 403, 'password'));
  }

  // success
  req.session.user = user;

  res.json({
    user: user
  });
}));

router.post('/editing-mode', f.wrap(async (req, res, next) => {
  req.session.editingMode = req.session.editingMode ? false : true;
  res.json({});
}));

module.exports = router;