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
      this.downButton = game.input.keyboard.addKey(Phaser.Keyboard.S);
      this.upButton = game.input.keyboard.addKey(Phaser.Keyboard.W);
    } else {
      super(game, x, y, 'player');
      this.jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      this.leftButton = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
      this.rightButton = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
      this.downButton = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
      this.upButton = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    }
    this.stance = StateMachine.create({
      initial: 'normal',
      events: [
        { name: 'rise', from: 'normal', to: 'ladder' },
        { name: 'drop', from: 'ladder', to: 'normal' },
        { name: 'drop', from: 'normal', to: 'crouching' },
        { name: 'normal', from: 'crouching', to: 'normal' }
      ],
      callbacks: {
        onentercrouching: this.onCrouch.bind(this)
      }
    });
    this.defaultGravity = 2500;
    this.speed = 200;
    this.jumpSpeed = 625;
    this.superJumpSpeed = 470;
    this.superJumpGravity = 1000;
    this.slamSpeed = 600;
    this.crouchSpeedBoost = 1.8;
    this.anchor.setTo(0.5, 1);
    this.animations.add('walkingRight', [0, 1, 2, 3, 4, 5, 6, 7], 20, true);
    this.animations.add('walkingLeft', [8, 9, 10, 11, 12, 13, 14, 15], 20, true);
    this.animations.add('crouching', [16]);
    this.animations.add('normal', [17]);
    this.animations.add('ladder', [20]);

    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.gravity.y = this.defaultGravity;
  }
  introducePlayer(player) {
    this.nearbyPlayers.push(player);
  }
  onCrouch() {
    // crouch speed bonus
    this.body.velocity.x *= this.crouchSpeedBoost;

    // slam when in the air
    if (this.inAir) {
      this.body.velocity.y = this.slamSpeed;
    }
  }
  crouch() {
    if (this.inAir) {
      this.body.drag.x = 0.5 * this.speed;
    }

    if (this.onGround) {
      this.body.drag.x = 1.5 * this.speed;
    }
  }
  climb() {
    this.body.velocity.y = -200;
  }
  onEnterLadder() {
    this.body.gravity.y = 0;
    this.body.drag.y = 2000;
  }
  onLeaveLadder() {
    this.climbing = false;
    this.body.gravity.y = this.defaultGravity;
    this.body.drag.y = 0;
  }
  jump() {
    this.body.velocity.y = -this.jumpSpeed;
  }
  superJump() {
    this.body.velocity.y = -this.superJumpSpeed;
    this.body.gravity.y = this.superJumpGravity;
  }
  walkLeft() {
    if (this.inAir && this.body.velocity.x < -this.speed) {
      this.body.velocity.x = this.body.velocity.x;
    } else {
      this.body.velocity.x = -this.speed;
    }
  }
  walkRight() {
    if (this.inAir && this.body.velocity.x > this.speed) {
      this.body.velocity.x = this.body.velocity.x;
    } else {
      this.body.velocity.x = this.speed;
    }
  }
  evaluateState() {
    this.was = {
      inAir: this.inAir,
      onGround: this.onGround,
      moving: this.moving,
      onLadder: this.onLadder
    };

    this.ladder = this.nearbyPlayers
                  .filter(player => player.stance.is('ladder') && Math.abs(player.x - this.x) < 15)
                  .sort((a, b) => {
                    return Math.abs(a.x - this.x) - Math.abs(a.x - this.x);
                  })[0];

    this.inAir = !this.body.touching.down;
    this.onGround = this.body.touching.down;
    this.moving = this.body.velocity.x !== 0;
    this.onLadder = this.onLadder && this.ladder && this.inAir;
  }
  preUpdate() {
    super.preUpdate.apply(this, arguments);
    this.nearbyPlayers = [];
  }
  update() {
    this.evaluateState();

    if (this.onGround) {
      this.body.gravity.y = this.defaultGravity;
      this.body.drag.x = 8 * this.speed;
      this.body.drag.y = 0;
    }

    this.processInput();
    this.processActions();
    this.playAnimation();
  }
  processActions() {
    if (this.jumping && this.stance.is('crouching')) {
      this.superJump();
    } else if (this.jumping) {
      this.jump();
    }

    if (this.stance.is('crouching')) {
      this.crouch();
    }

    if (this.walkingLeft) {
      this.walkLeft();
    }

    if (this.walkingRight) {
      this.walkRight();
    }

    if (!this.was.onLadder && this.onLadder) {
      this.onEnterLadder();
    } else if (this.was.onLadder && !this.onLadder) {
      this.onLeaveLadder();
    }

    if (this.climbing) {
      this.climb();
    }
  }
  playAnimation() {
    if (this.walkingLeft) {
      this.animations.play('walkingLeft');
    } else if (this.walkingRight) {
      this.animations.play('walkingRight');
    } else {
      this.animations.play(this.stance.current);
    }
  }
  processInput() {
    if (this.downButton.isDown) {
      if (this.stance.can('drop')) {
        this.stance.drop();
      }
    } else if (this.stance.can('normal')) {
      this.stance.normal();
    }

    if (this.leftButton.isDown && this.stance.is('normal')) {
      this.walkingLeft = true;
    } else {
      this.walkingLeft = false;
    }

    if (this.rightButton.isDown && this.stance.is('normal')) {
      this.walkingRight = true;
    } else {
      this.walkingRight = false;
    }

    if (this.upButton.isDown) {
      if (this.ladder) {
        this.onLadder = true;
        this.climbing = true;
      } else if (this.onGround && !this.moving && this.stance.can('rise')) {
        this.stance.rise();
      }
    } else {
      this.climbing = false;
    }

    if (this.jumpButton.isDown && this.onGround) {
      this.jumping = true;
      if (this.stance.is('ladder')) {
        this.stance.drop();
      }
    } else {
      this.jumping = false;
    }

    if (!(this.upButton.isDown || this.downButton.isDown || this.leftButton.isDown || this.rightButton.isDown)) {
      if (this.stance.can('normal')) {
        this.stance.normal();
      }
    }
  }
}

export default Player;