const express = require('express');
const router = express.Router();

const fs = require('fs');
const uuid = require('uuid/v4');
const path = require('path');
const mkdirp = require('mkdirp');
const busboy = require('connect-busboy');
const jimp = require('jimp');
const imageMagick = require('imagemagick');

const c = require('../includes/config');
const f = require('../includes/functions');
const imageProcessor = require('../includes/image-processor');


router.post('/', f.wrap(async (req, res, next) => {
  req.pipe(req.busboy);
  const db = req.db;

  if (!req.session.user) return next(new f.AppError('Permission denied.', 403));

  req.busboy.on('file', f.wrap(async (fieldname, file, filename) => {

    const dir = `${req.query.type}/${uuid().substring(0, 1)}`;
    mkdirp.sync(`${c.upload.dir}/${dir}`);

    const newFilename = `${uuid()}${path.extname(filename)}`;

    const results = await db.uploads
      .insert({
        name: filename,
        path: `${dir}/${newFilename}`,
        type: req.query.type,
        uploadedAt: new Date(),
        uploadedBy: req.session.user.id
      })
      .run(db.conn).catch((err) => {
        return res.status(500).json({
          success: 0,
          message: err.message
        });
      });

    const key = results.generated_keys[0];

    const fstream = fs.createWriteStream(`${c.upload.dir}/${dir}/${newFilename}`);
    file.pipe(fstream);
    fstream.on('close', () => {

      let imageMagickParams = [`${c.upload.dir}/${dir}/${newFilename}`, '-strip'];
      if (req.query.resizeW && req.query.resizeH) {
        imageMagickParams.push('-resize');
        imageMagickParams.push(`${req.query.resizeW}x${req.query.resizeH}`);
      }
      imageMagickParams.push(`${c.upload.dir}/${dir}/${newFilename}`);

      imageMagick.convert(imageMagickParams, function (err, stdout) {
        if (err) return res.status(500).json({
          success: 0,
          message: err.message
        });

        res.json({
          success: 1,
          message: 'File uploaded.',
          url: `${c.base}/uploads/${key}`,
          path: `uploads/${key}`,
        });
      });
    });
  }));
}));

router.get('/:id', f.wrap(async (req, res, next) => {
  const db = req.db;

  const result = await db.uploads.get(req.params.id).run(db.conn).catch(new f.AppError('File not found.', 404));

  const filename = `${c.upload.dir}/${result.path.replace(/\..+$/, '')}${req.query.p ? '-' + req.query.p : ''}${path.extname(result.path)}`;

  if (fs.existsSync(filename)) return res.sendFile(filename);

  const processors = req.query.p.split('-');
  jimp.read(`${c.upload.dir}/${result.path}`).then((image) => {
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
}));

module.exports = router;