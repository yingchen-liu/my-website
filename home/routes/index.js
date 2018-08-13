const path = require('path');
const fs = require('fs');

const express = require('express');
const router = express.Router();

const jimp = require('jimp');

const f = require('../includes/functions');
const imageProcessor = require('../includes/image-processor');

const skills = require('../models/skills');
const projects = require('../models/projects');


router.get('/', f.wrap(async (req, res, next) => {
  const db = req.db;

  const indexRecord = await db.index.get('06d6d96f-7ce7-41ff-a863-def950968c83').run(db.conn).catch(next);

  const featuredProjectRecord = await db.projects.get(indexRecord.featuredProject).run(db.conn).catch(next);

  res.render('index', f.data({
    title: f.title(),
    index: indexRecord,
    featuredProject: featuredProjectRecord,
    skillTypes: await skills.getSkills(db),
    projectTypes: await projects.getProjects((project) => {
      return project('right').hasFields('slug');
    }, db)
  }, req));
}));

router.post('/', f.wrap(async (req, res, next) => {
  const db = req.db;

  const result = await db.index.get('06d6d96f-7ce7-41ff-a863-def950968c83').update({
    introduction: req.body.introduction,
    featuredProject: req.body.featuredProject
  }).run(db.conn).catch(next);

  const featuredProjectResult = db.projects.get(req.body.featuredProject).update({
    featuredProjectShowOriginalCover: req.body.featuredProjectShowOriginalCover === 'true',
    featuredProjectBanner: req.body.featuredProjectBanner,
    featuredProjectTextColor: req.body.featuredProjectTextColor
  }).run(db.conn).catch(next);

  res.json({});
}));

router.get('/resume*', f.wrap(async (req, res, next) => {
  const db = req.db;

  const resumeResults = await db.resume.limit(1).run(db.conn).catch(next);
  const resumeRecords = await resumeResults.toArray().catch(next);

  const projectRecords = await projects.getProjects((project) => {
    return project('right')('showInResume').eq(true).and(project('right')('isDraft').eq(false));
  }, db);

  res.render('resume', f.data({
    title: f.title('Yingchen Liu\'s Resume'),
    resume: resumeRecords[0],
    skillTypes: await skills.getSkills(db),
    projectTypes: projectRecords
  }, req));
}));

router.get('/py-resume', f.wrap(async (req, res, next) => {
  const db = req.db;

  const resumeResults = await db.resume.limit(1).run(db.conn).catch(next);
  const resumeRecords = await resumeResults.toArray().catch(next);

  const projectRecords = await projects.getProjects((project) => {
    return project('right')('showInResume').eq(true).and(project('right')('isDraft').eq(false));
  }, db);

  res.render('py-resume', f.data({
    title: f.title('Yingchen Liu\'s Resume'),
    resume: resumeRecords[0],
    skillTypes: await skills.getSkills(db),
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
  }, req));
}));

module.exports = router;
