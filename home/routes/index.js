const path = require('path');
const fs = require('fs');

const express = require('express');
const router = express.Router();

const jimp = require('jimp');

const f = require('../includes/functions');
const imageProcessor = require('../includes/image-processor')


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

router.get('/', f.wrap(async (req, res, next) => {
  const db = req.db;

  res.render('index', f.data({
    title: f.title(),
    skillTypes: await getSkills(db)
  }, req));
}));

router.get('/resume*', f.wrap(async (req, res, next) => {
  const db = req.db;

  const resumeResults = await db.resume.limit(1).run(db.conn).catch(next);
  const resumeRecords = await resumeResults.toArray().catch(next);

  const projectResults = await db.projects
    .filter({
      showInResume: true,
      isDraft: false
    })
    .innerJoin(db.projectTypes, (project, type) => {
      return project('type').eq(type('id'));
    })
    .orderBy(
      db.r.desc(db.r.row('left')('to')('year')),
      db.r.desc(db.r.row('left')('to')('month'))
    ) // order by project finish time
    .group((record) => {
      return record.pluck('right') // group by right (project type)
    }).map((project) => {
      return project('left');
    })
    .ungroup()
    .orderBy(db.r.row('group')('right')('sort')) // order by project type sort 
    .map((group) => {
      return db.r.object(
        'id', group('group')('right')('id'),
        'name', group('group')('right')('name'),
        'subtitle', group('group')('right')('subtitle'),
        'slug', group('group')('right')('slug'),
        'icon', group('group')('right')('icon'),
        'sort', group('group')('right')('sort'),
        'projects', group('reduction')
      );
    }).run(db.conn).catch(next);
  const projectRecords = await projectResults.toArray().catch(next);

  res.render('resume', f.data({
    title: f.title('Yingchen Liu\'s Resume'),
    resume: resumeRecords[0],
    skillTypes: await getSkills(db),
    projectTypes: projectRecords
  }, req));
}));

// router.get(/uploads\/.*/, (req, res, next) => {
//   let filename = req.path.split('..').join(); // clean the path
//   filename = path.join(__dirname, '..', filename);

//   // already exists
//   if (fs.existsSync(filename)) return res.sendFile(filename);

//   // process image
//   const info = f.fileInfo(filename),
//     regex = /^.*-jimp-(.+)\.(?:jpg|jpeg|png)$/i,
//     match = regex.exec(info.name);
//   if (match) {
//     let processors = match[1];
//     const oriFilename = filename.replace(`-jimp-${processors}`, '');

//     // loop through processors
//     processors = processors.split('-');
//     jimp.read(oriFilename).then((image) => {
//       image = image.quality(80);

//       processors.map((processor) => {
//         if (processor.startsWith('w')) {
//           // with
//           const width = parseInt(processor.replace('w', ''));
//           image = imageProcessor.width(image, width);
//         } else if (processor.startsWith('c')) {
//           // crop
//           const ratio = parseFloat(processor.replace('c', ''));
//           image = imageProcessor.crop(image, ratio);
//         }
//       });
      
//       image.write(filename, () => {
//         res.sendFile(filename);
//       });
      
//     }).catch(next);
//   } else {
//     res.sendFile(filename);
//   }
// });

router.get('/404', f.wrap(async (req, res, next) => {
  const db = req.db;
  
  res.render('404', f.data({
    title: f.title('404'),
    skillTypes: getSkills(db)
  }, req));
}));

module.exports = router;
