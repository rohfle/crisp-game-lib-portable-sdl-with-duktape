title = "ROTATION ROD";
description = "\n[Tap] Turn\n";
characters = [];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  audioSeed: 7
};
var player;
var obstacles;
var nextObstacleTicks;
var lastObstacleSpawn;
var collectibles;
var nextCollectibleTicks;
var multiplier;
function update() {
  if (!ticks) {
    player = {
      center: vec(50, 50),
      length: 48,
      angle: 0,
      rotationSpeed: 0.05
    };
    obstacles = [];
    nextObstacleTicks = 0;
    collectibles = [];
    nextCollectibleTicks = 0;
    multiplier = 1;
  }
  var sd = sqrt(difficulty);
  if (input.isJustPressed) {
    player.rotationSpeed *= -1;
    play("select");
  }
  if (!input.isPressed) {
    player.angle += player.rotationSpeed * sd;
  }
  color("blue");
  bar(player.center, player.length, 2, player.angle);
  var ap1 = vec(player.center).addWithAngle(player.angle, player.length * 0.48);
  var ap2 = vec(player.center).addWithAngle(player.angle + 0.2 * (player.rotationSpeed > 0 ? 1 : -1), player.length * 0.42);
  line(ap1, ap2);
  nextObstacleTicks -= sd;
  if (nextObstacleTicks < 0) {
    play("laser");
    lastObstacleSpawn = spawnAtEdge(0.5 * sd);
    obstacles.push({
      pos: vec(lastObstacleSpawn.pos),
      vel: vec(lastObstacleSpawn.vel)
    });
    nextObstacleTicks = 99;
    nextCollectibleTicks = 9;
  }
  color("red");
  remove(obstacles, function (o) {
    o.pos.add(o.vel);
    var isColliding = box(o.pos, 5).isColliding.rect.blue;
    if (isColliding) {
      play("explosion");
      end();
    }
    return !o.pos.isInRect(-5, -5, 110, 110);
  });
  nextCollectibleTicks -= difficulty;
  if (nextCollectibleTicks < 0) {
    collectibles.push({
      pos: vec(lastObstacleSpawn.pos),
      vel: vec(lastObstacleSpawn.vel)
    });
    nextCollectibleTicks = 9;
  }
  color("yellow");
  remove(collectibles, function (c) {
    c.pos.add(c.vel);
    var isColliding = box(c.pos, 3).isColliding.rect.blue;
    if (isColliding) {
      play("coin");
      addScore(ceil(multiplier), c.pos);
      multiplier += 10;
    }
    return isColliding || !c.pos.isInRect(-5, -5, 110, 110);
  });
  multiplier *= 0.99;
  color("black");
  text("x".concat(ceil(multiplier)), 2, 10, {
    isSmallText: true
  });
}
function spawnAtEdge(speed) {
  var side = rndi(4);
  var pos, vel;
  switch (side) {
    case 0:
      pos = vec(rnd() < 0.5 ? rnd(20, 40) : rnd(60, 80), -3);
      vel = vec(0, speed);
      break;
    case 1:
      pos = vec(103, rnd() < 0.5 ? rnd(20, 40) : rnd(60, 80));
      vel = vec(-speed, 0);
      break;
    case 2:
      pos = vec(rnd() < 0.5 ? rnd(20, 40) : rnd(60, 80), 103);
      vel = vec(0, -speed);
      break;
    case 3:
      pos = vec(-3, rnd() < 0.5 ? rnd(20, 40) : rnd(60, 80));
      vel = vec(speed, 0);
      break;
  }
  return {
    pos: pos,
    vel: vel
  };
}

