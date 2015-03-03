'use strict';

let pixelPainter = function(context) {
  return function fill(color, x, y) {
    let scale = pixelPainter.scale;
    x *= scale;
    y *= scale;
    context.fillStyle = color;
    context.fillRect(x, y, scale, scale);
  };
};

pixelPainter.scale = 2;

export default pixelPainter;