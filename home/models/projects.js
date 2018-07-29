const f = require('../includes/functions');

const getProjects = f.wrap(async (db, next) => {
  const results = await db.projectTypes
    .outerJoin(db.projects, (type, project) => {
      return type('id').eq(project('type'));
    })
    .orderBy(
      db.r.desc(db.r.row('right')('from')('year')),
      db.r.desc(db.r.row('right')('from')('month'))
    ) // order by project finish time
    .group((record) => {
      return record.pluck('left') // group by right (project type)
    })
    .ungroup()
    .orderBy(db.r.row('group')('left')('sort')) // order by project type sort 
    .map((group) => {
      return db.r.object(
        'id', group('group')('left')('id'),
        'name', group('group')('left')('name'),
        'subtitle', group('group')('left')('subtitle'),
        'experienceType', group('group')('left')('experienceType'),
        'slug', group('group')('left')('slug'),
        'icon', group('group')('left')('icon'),
        'sort', group('group')('left')('sort'),
        'projects', group('reduction')('right')
      );
    }).run(db.conn).catch(next);
  const records = await results.toArray().catch(next);

  return records;
});

module.exports = { getProjects };