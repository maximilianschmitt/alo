'use strict';

import Phaser from 'phaser';

class GameObjectFactory extends Phaser.GameObjectFactory {
  register(entity, ec) {
    this[entity] = function() {
      let args = Array.prototype.slice.call(arguments);
      return this.existing(new (ec.bind.apply(ec, [null, this.game].concat(args)))());
    };
  }
}

export default GameObjectFactory;