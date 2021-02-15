
var BlockPlace;

BlockPlace = class BlockPlace {
  constructor(game) {
    this.game = game;
  }

  placeBlock() {
    var pos, vector;
    pos = this.game.world.getRayBlock();
    vector = [pos.posPlace[0] - pos.posBreak[0], pos.posPlace[1] - pos.posBreak[1], pos.posPlace[2] - pos.posBreak[2]];
    pos.posBreak[1] -= 16;
    return this.game.socket.emit("blockPlace", pos.posBreak, vector);
  }

};

export {
  BlockPlace
};
