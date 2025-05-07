title = "BLOCK STACKER";
description = "\n[Tap] Release block\n";
characters = [];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  audioSeed: 9
};
var pendulum;
var currentBlock;
var placedBlocks;
var scrX;
function update() {
  if (!ticks) {
    pendulum = {
      angle: 0,
      speed: 0.05
    };
    currentBlock = createNewBlock();
    placedBlocks = [{
      pos: vec(50, 99),
      size: vec(99, 10)
    }];
    scrX = 0;
  }
  pendulum.angle += pendulum.speed * difficulty;
  color("black");
  var pendulumEnd = vec(0, 20).rotate(sin(pendulum.angle)).add(50, 0);
  line(vec(50, 0), pendulumEnd);
  if (!currentBlock.isPlaced) {
    currentBlock.pos = vec(pendulumEnd).add(0, 5);
    if (input.isJustPressed) {
      play("select");
      currentBlock.isPlaced = true;
      currentBlock.velocity = vec(-Math.cos(pendulum.angle), 0);
    }
  } else {
    currentBlock.pos.add(vec(currentBlock.velocity).mul(difficulty));
    currentBlock.velocity.y += 0.1;
    if (currentBlock.pos.y > 105) {
      play("explosion");
      end();
    }
  }
  color("light_blue");
  box(currentBlock.pos, currentBlock.size);
  var minY = 99;
  color("blue");
  var isStacked = false;
  placedBlocks.forEach(function (block) {
    block.pos.x = wrap(block.pos.x + scrX, 0, 100);
    var c1 = box(block.pos.x - 100, block.pos.y, block.size).isColliding.rect.light_blue;
    var c2 = box(block.pos.x, block.pos.y, block.size).isColliding.rect.light_blue;
    var c3 = box(block.pos.x + 100, block.pos.y, block.size).isColliding.rect.light_blue;
    if (!isStacked && (c1 || c2 || c3)) {
      currentBlock.pos.y = block.pos.y - currentBlock.size.y;
      play("hit");
      placedBlocks.push({
        pos: vec(currentBlock.pos),
        size: vec(currentBlock.size)
      });
      currentBlock = createNewBlock();
      addScore(1);
      isStacked = true;
    }
    if (block.pos.y < minY) {
      minY = block.pos.y;
    }
  });
  var vy = difficulty * 0.01;
  if (minY < 70) {
    vy += (70 - minY) * 0.1;
  }
  remove(placedBlocks, function (b) {
    b.pos.y += vy;
    return b.pos.y > 106;
  });
  if (placedBlocks.length === 0) {
    play("explosion");
    end();
  }
}
function createNewBlock() {
  scrX = rnds(difficulty - 1);
  return {
    pos: vec(0, 20).rotate(sin(pendulum.angle)).add(50, 0),
    size: vec(rnd(10, 30), 10),
    isPlaced: false,
    velocity: vec(0, 0)
  };
}

