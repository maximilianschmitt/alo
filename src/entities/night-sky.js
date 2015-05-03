'use strict';

import Phaser from 'phaser';
import pixelPainter from '../util/pixel-painter';

class NightSky extends Phaser.Sprite {
  constructor(game, x, y, width, height) {
    super(game, x, y, bmd(game, width, height));
  }
}

function bmd(game, width, height) {
  let bitmapData = game.add.bitmapData(width, height);
  let fill = pixelPainter(bitmapData.context);
  let scale = pixelPainter.scale;

  let nWidth = width / scale;
  let nHeight = height / scale;
  let numberStars = game.rnd.integerInRange((10/568) * width, (40/568) * width);

  for (let i = 0; i < numberStars; i++) {
    bitmapData.context.globalAlpha = i === 0 ? 0.5 : game.rnd.realInRange(0.2, 0.3);
    let starColor = game.rnd.pick(['#ffffff', '#fff373', '#fff8b0']);
    let x = game.rnd.integerInRange(1, nWidth - 1);
    let y = game.rnd.integerInRange(1, nHeight - 1);
    fill(starColor, x, y);
  }

  return bitmapData;
}

export default NightSky;