'use strict';

import Phaser from 'phaser';
import Player from './entities/player/player';
import GameObjectFactory from './engine/game-object-factory';
import Flower from './entities/flower/flower';

var game = new Phaser.Game(568, 320, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });
  var player, player2, steps, stars, floor, tree, text, framerate = 20, pixelScale = 2;


  function preload() {
    game.load.spritesheet('player', 'images/player.png', 32, 128);
    game.load.spritesheet('player-2', 'images/player-2.png', 32, 128);
    game.load.spritesheet('tree', 'images/tree.png', 128, 128);
    game.load.image('grass-floor', 'images/grass-floor.png');
    game.load.image('stars', 'images/stars.png');
    game.load.audio('player-steps', 'sounds/player-steps.wav');
  }

  function create() {
    let gof = new GameObjectFactory(game);
    gof.register('player', Player);
    gof.register('flower', Flower);
    game.add = gof;
    game.stage.backgroundColor = '#443a4f';

    game.sound.mute = true;
    steps = game.add.audio('player-steps', 1, true);

    // text = game.add.text(game.world.width/2, 30, 'You don\'t remember this world the way you left it.', {
    //   font: '16px Helvetica',
    //   fill: 'rgba(255, 255, 255, 0.7)',
    //   align: 'center'
    // });
    // text.anchor.setTo(0.5);
    stars = game.add.sprite(0, 0, generateNightSky(game.world.width, Math.round(game.world.height * 2/5)));

    floor = game.add.tileSprite(0, game.world.height - 36, game.world.width, 36, 'grass-floor');
    game.physics.enable(floor, Phaser.Physics.ARCADE);
    floor.body.setSize(game.world.width, 32, 0, 4);
    floor.body.immovable = true;

    tree = game.add.sprite(game.world.width / 2 - 64, game.world.height - 128 - 32, 'tree');
    tree.animations.add('grow', undefined, framerate, false);
    tree.animations.play('grow');

    player = game.add.player(24, game.world.height - 32, false);
    player2 = game.add.player(game.world.width - 24, game.world.height - 32, true);
    

    for (var i = 0; i < game.world.width / 10; i++) {
      if (Math.random() <= 0.05) {
        game.add.flower(i * 6 + i * 4, game.world.height - 32);
      }
    }
  }

  function update(time) {
    game.physics.arcade.collide(player, floor);
    game.physics.arcade.collide(player2, floor);
    // game.physics.arcade.overlap(player, player2, function(player1, player2) {
    //   player1.meetInteractable(player2);
    //   player2.meetInteractable(player1);
    // });
    player.update(time);
    player2.update(time);
  }

  function generateNightSky(width, height) {
    var bmd = game.add.bitmapData(width, height);
    var fill = pixelFiller(bmd.context);

    var nWidth = width / pixelScale;
    var nHeight = height / pixelScale;
    var numberStars = game.rnd.integerInRange(10, 40);

    for (var i = 0; i < numberStars; i++) {
      bmd.context.globalAlpha = i === 0 ? 0.5 : game.rnd.realInRange(0.2, 0.3);
      var starColor = game.rnd.pick(['#ffffff', '#fff373', '#fff8b0']);
      var x = game.rnd.integerInRange(1, nWidth - 1);
      var y = game.rnd.integerInRange(1, nHeight - 1);
      fill(starColor, x, y);
    }

    return bmd;
  }

  function pixelFiller(context) {
    return function fill(color, x, y) {
      x *= pixelScale;
      y *= pixelScale;
      context.fillStyle = color;
      context.fillRect(x, y, pixelScale, pixelScale);
    };
  }

  function render() {
    // game.debug.bodyInfo(player, 20, 20, '#ffffff');
  }