const path = require('path');
const fs = require('fs');

const express = require('express');
const router = express.Router();

var jimp = require("jimp");

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
  let filename = req.path.split('..').join(); // clean the path
  filename = path.join(__dirname, '..', filename);

  // already exists
  if (fs.existsSync(filename)) return res.sendFile(filename);

  // process image
  const info = f.fileInfo(filename),
    regex = /^.*-jimp-(.+)\.(?:jpg|jpeg|png)$/,
    match = regex.exec(info.name);
  if (match) {
    let processors = match[1];
    const oriFilename = filename.replace(`-jimp-${processors}`, '');

    processors = processors.split('-');
    jimp.read(oriFilename).then((image) => {
      image = image.quality(80);

      processors.map((processor) => {
        if (processor.startsWith('w')) {
          const width = parseInt(processor.replace('w', ''));
          
          image = image.resize(width, jimp.AUTO);
        } else if (processor.startsWith('c')) {
          const ratio = parseFloat(processor.replace('c', ''));

          let _width = image.bitmap.width,
            _height = image.bitmap.height,
            width = _width,
            height = _height,
            x = 0,
            y = 0;

          if (_width / _height > ratio) {
            width = _height * ratio;
            x = (_width - width) / 2;
          } else {
            height = _width / ratio;
            y = (_height - height) / 2;
          }
          
          image = image.crop(x, y, width, height);
        }
      });
      
      console.log('save')
      image.write(filename, () => {
        console.log('done')
        res.sendFile(filename);
      });
      
    }).catch(next);
  } else {
    res.sendFile(filename);
  }
});

module.exports = router;
