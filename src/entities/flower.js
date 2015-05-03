'use strict';

import Phaser from 'phaser';
import pixelPainter from '../util/pixel-painter';

let pedalColors = ['#c15b90', '#73adc4', '#dbd172', '#eb915e'];

class Flower extends Phaser.Sprite {
  constructor(game, x, y) {
    super(game, x, y, bmd(game));
    this.anchor.setTo(0.5, 1);
  }
}

function bmd(game) {
  var scale      = pixelPainter.scale;
  var stemHeight = game.rnd.integerInRange(1, 4);
  var height     = stemHeight + 3; // 3 = pixels for blossom
  var width      = 3; // 3 = pixels for blossom
  var pedalColor = game.rnd.pick(pedalColors);
  var stemColor  = '#a8c5ae';

  var bitmapData = game.add.bitmapData(scale * width, scale * height);
  var paint = pixelPainter(bitmapData.context);

  // paint stem
  // pixels start at 0
  for (var i = height - 1; i >= 3; i--) {
    paint(stemColor, 1, i);
  }

  // paint pedals
  paint(pedalColor, 0, 0);
  paint(pedalColor, 0, 1);
  paint(pedalColor, 0, 2);
  paint(pedalColor, 1, 0);
  paint(pedalColor, 1, 2);
  paint(pedalColor, 2, 0);
  paint(pedalColor, 2, 1);
  paint(pedalColor, 2, 2);

  return bitmapData;
}

export default Flower;