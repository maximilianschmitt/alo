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
        { name: 'crouch', from: ['default', 'walkingLeft', 'walkingRight'], to: 'crouched' },
        { name: 'grow', from: 'default', to: 'grow1' },
        { name: 'grow', from: 'grow1', to: 'grow2' },
        { name: 'grow', from: 'grow2', to: 'grow3' },
        { name: 'walkRight', from: ['default', 'walkingLeft', 'crouched'], to: 'walkingRight' },
        { name: 'walkLeft', from: ['default', 'walkingRight', 'crouched'], to: 'walkingLeft' },
        { name: 'idle', from: ['walkingLeft', 'walkingRight', 'crouched'], to: 'default' }
      ]
    });
    this.speed = 200;
    this.jumpSpeed = 625;
    this.defaultGravity = 2500;
    this.chargedJumpSpeed = 470;
    this.chargedJumpGravity = 1000;
    this.slamSpeed = 600;
    this.crouchSpeedBoost = 1.8;
    this.anchor.setTo(0.5, 1);
    this.animations.add('walkingRight', [0, 1, 2, 3, 4, 5, 6, 7], 20, true);
    this.animations.add('walkingLeft', [8, 9, 10, 11, 12, 13, 14, 15], 20, true);
    this.animations.add('crouched', [16]);
    this.animations.add('default', [17]);
    this.animations.add('grow1', [18]);
    this.animations.add('grow2', [19]);
    this.animations.add('grow3', [20]);

    game.physics.enable(this, Phaser.Physics.ARCADE);
    console.log(this.state);
    this.body.gravity.y = this.defaultGravity;
  }
  canWalk() {
    return ['default', 'walkingLeft', 'walkingRight', 'crouched'].indexOf(this.state.current) !== -1;
  }
  crouch() {
    if (this.state.is('crouched') && !this.onGround) {
      this.body.drag.x = 0.5 * this.speed;
    }

    if (this.state.is('crouched') && this.onGround) {
      this.body.drag.x = 1.5 * this.speed;
    }

    if (this.state.cannot('crouch')) {
      return;
    }
    
    this.state.crouch();

    // crouch speed bonus
    if (this.state.is('crouched')) {
      this.body.velocity.x *= this.crouchSpeedBoost;
    }

    // slam when in the air
    if (this.state.is('crouched') && !this.onGround) {
      this.body.velocity.y = this.slamSpeed;
    }
  }
  grow() {
    if (this.state.is('default') && this.climbable) {
      this.onLadder = !this.onGround;
      this.body.gravity.y = 0;
      this.body.drag.y = 2000;
      this.body.velocity.y = -200;
      return;
    }

    if (this.state.cannot('grow')) {
      return;
    }

    this.state.grow();
  }
  jump() {
    if (this.onGround) {
      this.body.velocity.y = -this.jumpSpeed;

      if (this.state.is('crouched')) {
        this.body.velocity.y = -this.chargedJumpSpeed;
        this.body.gravity.y = this.chargedJumpGravity;
      }
    }
  }
  walkLeft() {
    if (this.inAir && this.body.velocity.x < -this.speed) {
      this.body.velocity.x = -this.body.velocity.x;
    } else {
      this.body.velocity.x = -this.speed;
    }

    if (this.state.can('walkLeft')) {
      this.state.walkLeft();
    }
  }
  walkRight() {
    if (this.inAir && this.body.velocity.x > this.speed) {
      this.body.velocity.x = this.body.velocity.x;
    } else {
      this.body.velocity.x = this.speed;
    }

    if (this.state.can('walkRight')) {
      this.state.walkRight();
    }
  }
  idle() {
    if (this.state.cannot('idle')) {
      return;
    }

    this.state.idle();
  }
  noButtonPressed() {
    return !(this.growButton.isDown || this.crouchButton.isDown || this.leftButton.isDown || this.rightButton.isDown);
  }
  evaluateState() {
    this.was = {
      inAir: this.inAir,
      onGround: this.onGround,
      moving: this.moving,
      onLadder: this.onLadder
    };

    this.onLadder = this.onLadder && this.climbable && this.canClimb(this.climbable);
    this.inAir = !this.body.touching.down;
    this.onGround = this.body.touching.down;
    this.moving = this.body.velocity.x !== 0;
  }
  canClimb(gameObject) {
    return Math.abs(this.x - gameObject.x) < 10 && gameObject.state.is('grow3');
  }
  meetInteractable(gameObject) {
    if (this.canClimb(gameObject)) {
      this.climbable = gameObject;
      return;
    }

    this.climbable = null;
  }
  update() {
    this.evaluateState();

    if (this.onGround) {
      this.body.gravity.y = this.defaultGravity;
      this.body.drag.x = 8 * this.speed;
    }

    if (this.crouchButton.isDown) {
      this.crouch();
    } else if (this.leftButton.isDown) {
      this.walkLeft();
    } else if (this.rightButton.isDown) {
      this.walkRight();
    } else if (this.growButton.isDown) {
      this.grow();
    }

    if (this.jumpButton.isDown) {
      this.jump();
    }

    if (this.noButtonPressed()) {
      this.idle();
    }

    this.animations.play(this.state.current);
  }
}

export default Player;