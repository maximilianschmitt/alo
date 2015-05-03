'use strict';

import Phaser from 'phaser';
import Player from './entities/player';
import NightSky from './entities/night-sky';
import Flower from './entities/flower';
import GameObjectFactory from './engine/game-object-factory';

var game = new Phaser.Game(568, 320, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render });
  var player, player2, stars, floor, tree, text, framerate = 20, pixelScale = 2;

function preload() {
  game.load.spritesheet('player', 'images/player.png', 32, 128);
  game.load.spritesheet('player-2', 'images/player-2.png', 32, 128);
  game.load.spritesheet('tree', 'images/tree.png', 128, 128);
  game.load.image('grass-floor', 'images/grass-floor.png');
  game.load.image('stars', 'images/stars.png');
}

function create() {
  let gof = new GameObjectFactory(game);
  gof.register('player', Player);
  gof.register('flower', Flower);
  gof.register('nightSky', NightSky);
  game.add = gof;
  game.stage.backgroundColor = '#443a4f';
  game.world.setBounds(0, 0, 5*568, 320);

  // text = game.add.text(game.world.width/2, 30, 'You don\'t remember this world the way you left it.', {
  //   font: '16px Helvetica',
  //   fill: 'rgba(255, 255, 255, 0.7)',
  //   align: 'center'
  // });
  // text.anchor.setTo(0.5);
  stars = game.add.nightSky(0, 10, game.world.width, Math.round(game.world.height * 2/5));

  floor = game.add.tileSprite(0, game.world.height - 36, game.world.width, 36, 'grass-floor');
  game.physics.enable(floor, Phaser.Physics.ARCADE);
  floor.body.setSize(game.world.width, 32, 0, 4);
  floor.body.immovable = true;

  tree = game.add.sprite(game.world.width / 2 - 64, game.world.height - 128 - 32, 'tree');
  tree.animations.add('grow', undefined, framerate, false);
  tree.animations.play('grow');

  player = game.add.player(game.world.width/2 + 100, game.world.height - 32, false);
  // player = game.add.player(24, game.world.height - 32, false);
  game.camera.follow(player, Phaser.Camera.FOLLOW_PLATFORMER);
  // player2 = game.add.player(game.world.width - 24, game.world.height - 32, true);

  for (var i = 0; i < game.world.width / 10; i++) {
    if (Math.random() <= 0.05) {
      game.add.flower(i * 6 + i * 4, game.world.height - 32);
    }
  }
}

function update(time) {
  game.physics.arcade.collide(player, floor);
  // game.physics.arcade.collide(player2, floor);
  // game.physics.arcade.overlap(player, player2, introducePlayers);
}

function render() {
  // game.debug.bodyInfo(player, 20, 20, '#ffffff');
}

function introducePlayers(player1, player2) {
  player1.introducePlayer(player2);
  player2.introducePlayer(player1);
}