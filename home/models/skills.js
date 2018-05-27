const f = require('../includes/functions');

const getSkills = f.wrap(async (db, next) => {
  const results = await db.skillTypes
    .outerJoin(db.skills, (type, skill) => {
      return type('id').eq(skill('type'));
    })
    .orderBy(
      db.r.desc(db.r.row('right')('sort'))
    ) // order by skill sort
    .group((record) => {
      return record.pluck('left') // group by right (skill type)
    })
    .ungroup()
    .orderBy(db.r.row('group')('left')('sort')) // order by skill type sort 
    .map((group) => {
      return db.r.object(
        'id', group('group')('left')('id'),
        'name', group('group')('left')('name'),
        'subtitle', group('group')('left')('subtitle'),
        'icon', group('group')('left')('icon'),
        'sort', group('group')('left')('sort'),
        'skills', group('reduction')('right')
      );
    }).run(db.conn).catch(next);
  const records = await results.toArray().catch(next);

  return records;
});

module.exports = { getSkills };