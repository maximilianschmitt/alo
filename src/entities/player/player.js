'use strict';

import Phaser from 'phaser';
import StateMachine from 'javascript-state-machine';

class Player extends Phaser.Sprite {
  constructor(game, x, y, second) {
    if (second) {
      super(game, x, y, 'player-2');
      this.jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
      this.leftButton = game.input.keyboard.addKey(Phaser.Keyboard.A);
      this.rightButton = game.input.keyboard.addKey(Phaser.Keyboard.D);
      this.crouchButton = game.input.keyboard.addKey(Phaser.Keyboard.S);
      this.growButton = game.input.keyboard.addKey(Phaser.Keyboard.W);
    } else {
      super(game, x, y, 'player');
      this.jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      this.leftButton = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
      this.rightButton = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
      this.crouchButton = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
      this.growButton = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    }
    this.state = StateMachine.create({
      initial: 'default',
      events: [
        { name: 'crouch', from: 'grow3', to: 'grow2' },
        { name: 'crouch', from: 'grow2', to: 'grow1' },
        { name: 'crouch', from: 'grow1', to: 'default' },
        { name: 'crouch', from: 'default', to: 'crouched' },
        { name: 'grow', from: 'default', to: 'grow1' },
        { name: 'grow', from: 'grow1', to: 'grow2' },
        { name: 'grow', from: 'grow2', to: 'grow3' },
        { name: 'walkRight', from: ['default', 'walkingLeft'], to: 'walkingRight' },
        { name: 'walkLeft', from: ['default', 'walkingRight'], to: 'walkingLeft' }
      ]
    });
    this.speed = 200;
    this.jumpSpeed = 625;
    this.jumpGravity = 2500;
    this.chargedJumpSpeed = 470;
    this.chargedJumpGravity = 1000;
    this.slamSpeed = 600;
    this.crouchSpeedBoost = 1.8;
    this.anchor.setTo(0.5, 1);
    this.animations.add('walk-right', [0, 1, 2, 3, 4, 5, 6, 7], 20, true);
    this.animations.add('walk-left', [8, 9, 10, 11, 12, 13, 14, 15], 20, true);
    this.animations.add('crouched', [16]);
    this.animations.add('default', [17]);
    this.animations.add('grow-1', [18]);
    this.animations.add('grow-2', [19]);
    this.animations.add('grow-3', [20]);
    this.animations.play('default');

    game.physics.enable(this, Phaser.Physics.ARCADE);
    console.log(this.state);
    this.body.gravity.y = this.jumpGravity;
  }
  canWalk() {
    return ['default', 'walkingLeft', 'walkingRight', 'crouched'].indexOf(this.state.current) !== -1;
  }
  crouch() {
    if (this.state.can('crouch')) {
      this.state.crouch();
    }

    var canWalk = ['default', 'walk-left', 'walk-right', 'crouched'].indexOf(this.animations.currentAnim.name) !== -1;
    if (canWalk) {
      this.animations.play('crouched');
      if (this.lastTickState !== 'crouched') {
        this.body.velocity.x *= this.crouchSpeedBoost;
        if (!this.body.touching.down) {
          this.body.velocity.y = this.slamSpeed;
        }
      }
      // drag on floor
      if (this.body.touching.down) {
        this.body.drag.setTo(this.speed * 1.5, 0);
      } else {
        this.body.drag.setTo(0.5 * this.speed, 0);
      }
    } else if (currentState === 'grow-3') {
      this.animations.play('grow-2');
    } else if (currentState === 'grow-2') {
      this.animations.play('grow-1');
    } else if (currentState === 'grow-1') {
      this.animations.play('default');
    }
  }
  update() {
    var canWalk = ['default', 'walk-left', 'walk-right', 'crouched'].indexOf(this.animations.currentAnim.name) !== -1;
    // reset stuff
    if (this.body.touching.down) {
      this.body.gravity.y = this.jumpGravity;
      this.body.drag.setTo(this.speed * 8, 0);
    }

    if (this.crouchButton.isDown) {
      this.crouch();
    } else if (this.leftButton.isDown && canWalk) {
      // keep momentum in the air
      this.body.velocity.x = this.body.touching.down && this.body.velocity.x < -this.speed ? this.body.velocity.x : -this.speed;
      this.animations.play('walk-left');
    } else if (this.rightButton.isDown && canWalk) {
      // keep momentum in the air
      this.body.velocity.x = this.body.touching.down && this.body.velocity.x > this.speed ? this.body.velocity.x : this.speed;
      this.animations.play('walk-right');
    } else if (canWalk) {
      this.animations.play('default');
    }

    if (this.growButton.isDown) {
      var currentState = this.animations.currentAnim.name;
      if (currentState === 'grow-1') {
        this.animations.play('grow-2');
      } else if (currentState === 'grow-2') {
        this.animations.play('grow-3');
      } else if (currentState === 'default') {
        this.animations.play('grow-1');
      } else if (currentState === 'crouched') {
        this.animations.play('default');
      }
    }

    if (canWalk && this.jumpButton.isDown && this.body.touching.down) {
      this.body.velocity.y = -this.jumpSpeed;
      if (this.lastTickState === 'crouched') {
        this.body.velocity.y = -this.chargedJumpSpeed;
        this.body.gravity.y = this.chargedJumpGravity;
      }
    }

    if (!(this.growButton.isDown || this.crouchButton.isDown || this.leftButton.isDown || this.rightButton.isDown)) {
      if (this.lastTickState === 'crouched') {
        this.animations.play('default');
      }
    }

    var newState = this.animations.currentAnim.name;

    if (newState === 'walk-left' || newState === 'walk-right') {
      if (this.lastTickState !== 'walk-left' && this.lastTickState !== 'walk-right') {
        // steps.play();
      }
    } else {
      // steps.stop();
    }

    this.lastTickState = newState;
  }
}

export default Player;