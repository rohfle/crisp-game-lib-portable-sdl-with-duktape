title = "SLIME STRETCHER";
description = "\n[Hold] Stretch\n[Release] Contract\n";
characters = ["\n llll\nl  lll\nl llll\nl llll\nllll l\n llll\n"];
options = {
  viewSize: {
    x: 200,
    y: 100
  },
  isPlayingBgm: true,
  isReplayEnabled: true,
  audioSeed: 3
};
var slime;
var walls;
var collectibles;
var scrollVelocity;
var nextWallDistance;
var nextCollectibleDistance;
var multiplier;
function update() {
  if (!ticks) {
    slime = {
      pos: vec(50, 90),
      width: 20,
      height: 20,
      baseWidth: 20,
      baseHeight: 20,
      maxHeight: 80,
      velocity: 1,
      isOnGround: true
    };
    walls = [];
    collectibles = [];
    scrollVelocity = 1;
    nextWallDistance = 50;
    nextCollectibleDistance = 30;
    multiplier = 1;
  }
  if (input.isPressed) {
    slime.height = Math.min(slime.height + 2, slime.maxHeight);
    slime.width = Math.max(slime.width - 0.5, slime.baseWidth / 2);
    slime.velocity = 0.5 * difficulty;
    slime.pos.y = Math.max(slime.pos.y - 2, 10);
  } else {
    slime.height = Math.max(slime.height - 4, slime.baseHeight);
    slime.width = Math.min(slime.width + 1, slime.baseWidth);
    slime.velocity = 1.5 * difficulty;
  }
  slime.pos.x += slime.velocity;
  if (slime.pos.x < 50) {
    slime.pos.x++;
  }
  if (slime.pos.x < -slime.width) {
    play("explosion");
    end();
  }
  nextWallDistance -= slime.velocity;
  if (nextWallDistance <= 0) {
    var width = rnd(20, 60);
    walls.push({
      pos: vec(200, rnd(0, 70)),
      width: width,
      height: rnd(20, 40)
    });
    nextWallDistance = rndi(35, 55) + width;
  }
  nextCollectibleDistance -= slime.velocity;
  if (nextCollectibleDistance <= 0) {
    collectibles.push({
      pos: vec(203, rnd(20, 80))
    });
    nextCollectibleDistance = rndi(30, 60);
  }
  slime.isOnGround = false;
  walls.forEach(function (wall) {
    if (slime.pos.x + slime.width > wall.pos.x && slime.pos.x < wall.pos.x + wall.width && slime.pos.y + slime.height > wall.pos.y && slime.pos.y < wall.pos.y + wall.height) {
      if (slime.pos.y + slime.height < wall.pos.y + 10) {
        slime.height--;
        slime.pos.y = wall.pos.y - slime.height;
        slime.isOnGround = true;
      } else if (slime.pos.y > wall.pos.y + wall.height - 10) {
        slime.pos.y = wall.pos.y + wall.height;
        slime.height -= 2;
      } else if (slime.pos.x + slime.width < wall.pos.x + 5) {
        slime.pos.x = wall.pos.x - slime.width;
        slime.width--;
      } else {
        slime.pos.y = wall.pos.y - slime.height;
        slime.isOnGround = true;
      }
    }
  });
  if (!slime.isOnGround) {
    slime.pos.y = Math.min(slime.pos.y + 1, 90);
  }
  if (slime.pos.y + slime.height >= 90) {
    slime.pos.y = 90 - slime.height;
    slime.isOnGround = true;
  }
  color("green");
  rect(slime.pos, slime.width, slime.height);
  color("black");
  walls.forEach(function (obstacle) {
    rect(obstacle.pos, obstacle.width, obstacle.height);
  });
  rect(0, 90, 200, 10);
  scrollVelocity = slime.velocity;
  slime.pos.x -= scrollVelocity;
  remove(walls, function (w) {
    w.pos.x -= scrollVelocity;
    return w.pos.x < -w.width;
  });
  color("yellow");
  remove(collectibles, function (c) {
    var cl = char("a", c.pos).isColliding.rect;
    if (cl.black) {
      return true;
    }
    if (cl.green) {
      play("coin");
      addScore(multiplier, c.pos);
      multiplier++;
      return true;
    }
    c.pos.x -= scrollVelocity;
    if (c.pos.x < -3) {
      multiplier--;
      if (multiplier < 1) {
        multiplier = 1;
      }
      return true;
    }
  });
  color("black");
  text("x".concat(multiplier), 2, 10, {
    isSmallText: true
  });
}

