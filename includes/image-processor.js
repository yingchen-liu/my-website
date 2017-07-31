var jimp = require("jimp");

const crop = (image, ratio) => {
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
  
  return image.crop(x, y, width, height);
};

const width = (image, width) => {
  return image.resize(width, jimp.AUTO, jimp.RESIZE_BICUBIC);
};

module.exports = {
  crop,
  width
}