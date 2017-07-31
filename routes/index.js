const path = require('path');
const fs = require('fs');

const express = require('express');
const router = express.Router();

var jimp = require("jimp");

const f = require('../includes/functions');
const db = require('../includes/db');
const imageProcessor = require('../includes/image-processor')


router.get('/', f.wrap(async function (req, res, next) {
  
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
        'subtitle', group('group')('right')('subtitle'),
        'sort', group('group')('right')('sort'),
        'skills', group('reduction')
      );
    }).run(db.conn).catch(next);
  const records = await results.toArray().catch(next);

  res.render('index', f.data({
    title: f.title(),
    skillTypes: records
  }));
}));

router.get(/uploads\/.*/, (req, res, next) => {
  let filename = req.path.split('..').join(); // clean the path
  filename = path.join(__dirname, '..', filename);

  // already exists
  if (fs.existsSync(filename)) return res.sendFile(filename);

  // process image
  const info = f.fileInfo(filename),
    regex = /^.*-jimp-(.+)\.(?:jpg|jpeg|png)$/i,
    match = regex.exec(info.name);
  if (match) {
    let processors = match[1];
    const oriFilename = filename.replace(`-jimp-${processors}`, '');

    // loop through processors
    processors = processors.split('-');
    jimp.read(oriFilename).then((image) => {
      image = image.quality(80);

      processors.map((processor) => {
        if (processor.startsWith('w')) {
          // with
          const width = parseInt(processor.replace('w', ''));
          image = imageProcessor.width(image, width);
        } else if (processor.startsWith('c')) {
          // crop
          const ratio = parseFloat(processor.replace('c', ''));
          image = imageProcessor.crop(image, ratio);
        }
      });
      
      image.write(filename, () => {
        res.sendFile(filename);
      });
      
    }).catch(next);
  } else {
    res.sendFile(filename);
  }
});

module.exports = router;
