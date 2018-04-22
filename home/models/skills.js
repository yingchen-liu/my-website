const f = require('../includes/functions');

const getSkills = f.wrap(async (db, next) => {
  const results = await db.skills
    .innerJoin(db.skillTypes, (skill, type) => {
      return skill('type').eq(type('id'));
    })
    .orderBy(db.r.row('left')('sort')) // order by skill sort
    .group((record) => {
      return record.pluck('right') // group by right (skill type)
    }).map((skill) => {
      return skill('left');
    })
    .ungroup()
    .orderBy(db.r.row('group')('right')('sort')) // order by skill type sort 
    .map((group) => {
      return db.r.object(
        'id', group('group')('right')('id'),
        'name', group('group')('right')('name'),
        'icon', group('group')('right')('icon'),
        'subtitle', group('group')('right')('subtitle'),
        'sort', group('group')('right')('sort'),
        'skills', group('reduction')
      );
    }).run(db.conn).catch(next);
  const records = await results.toArray().catch(next);

  return records;
});

module.exports = { getSkills };