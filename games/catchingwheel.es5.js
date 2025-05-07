title = "CATCHING WHEEL";
description = "\n[Hold] Rotate wheel\n";
characters = ["\nlllll\n lll\n lll\n", "\n  ll\nl l  l\n llll \n  l\n l l\nl   l\n"];
options = {
  theme: "dark",
  isPlayingBgm: true,
  isReplayEnabled: true,
  isDrawingParticleFront: true,
  audioSeed: 8
};
var wheel;
var humans;
var nextHumanTicks;
var obstacles;
var nextObstacleTicks;
var multiplier;
var baseHumanSpawnInterval = 40;
var baseObstacleSpawnInterval = 99;
var basketScale = 3;
var gravity = 0.02;
function update() {
  if (!ticks) {
    var spokeCount = 6;
    wheel = {
      center: vec(50, 90),
      radius: 40,
      angle: 0,
      spokeCount: spokeCount,
      rotationSpeed: 0.05,
      isAlive: times(spokeCount, function () {
        return true;
      })
    };
    humans = [];
    nextHumanTicks = baseHumanSpawnInterval;
    obstacles = [];
    nextObstacleTicks = baseObstacleSpawnInterval;
    multiplier = 1;
  }
  nextObstacleTicks -= difficulty;
  if (nextObstacleTicks <= 0) {
    obstacles.push({
      pos: vec(rnd(20, 80), 0),
      vel: vec(0, 0)
    });
    nextObstacleTicks = baseObstacleSpawnInterval * rnd(0.8, 1.2);
  }
  color("red");
  remove(obstacles, function (o) {
    o.vel.y += gravity;
    o.pos.y += o.vel.y * difficulty;
    text("*", o.pos);
    return o.pos.y > 95;
  });
  color("blue");
  arc(wheel.center, wheel.radius);
  if (input.isPressed) {
    wheel.angle += wheel.rotationSpeed * difficulty;
  }
  for (var i = 0; i < wheel.spokeCount; i++) {
    var spokeAngle = wheel.angle + i * 2 * PI / wheel.spokeCount;
    var spokeEnd = vec(wheel.center).addWithAngle(spokeAngle, wheel.radius);
    color("black");
    line(wheel.center, spokeEnd);
    if (wheel.isAlive[i]) {
      var basketPos = vec(spokeEnd);
      color("yellow");
      if (char("a", basketPos, {
        scale: {
          x: basketScale,
          y: basketScale
        }
      }).isColliding.text["*"]) {
        destroyBasket(i);
      }
    }
  }
  nextHumanTicks -= difficulty;
  if (nextHumanTicks <= 0) {
    humans.push({
      pos: vec(rnd(10, 90), 0),
      vel: vec(0, 0)
    });
    nextHumanTicks = baseHumanSpawnInterval * rnd(0.7, 1);
  }
  color("yellow");
  remove(humans, function (human) {
    human.vel.y += gravity;
    human.pos.add(human.vel);
    var humanObj = char("b", human.pos);
    if (humanObj.isColliding.text["*"]) {
      return true;
    }
    for (var _i = 0; _i < wheel.spokeCount; _i++) {
      if (humanObj.isColliding["char"].a) {
        play("coin");
        addScore(multiplier, human.pos);
        multiplier++;
        var bi = rndi(wheel.spokeCount);
        for (var _i2 = 0; _i2 < wheel.spokeCount; _i2++) {
          if (!wheel.isAlive[bi]) {
            wheel.isAlive[bi] = true;
            break;
          }
          bi = (bi + 1) % wheel.spokeCount;
        }
        return true;
      }
    }
    if (human.pos.y > 100) {
      var _bi = rndi(wheel.spokeCount);
      for (var _i3 = 0; _i3 < wheel.spokeCount; _i3++) {
        if (wheel.isAlive[_bi]) {
          destroyBasket(_bi);
          break;
        }
        _bi = (_bi + 1) % wheel.spokeCount;
      }
      play("explosion");
      return true;
    }
  });
  var isAlive = false;
  for (var _i4 = 0; _i4 < wheel.spokeCount; _i4++) {
    if (wheel.isAlive[_i4]) {
      isAlive = true;
      break;
    }
  }
  if (!isAlive) {
    end();
  }
}
function destroyBasket(i) {
  play("explosion");
  wheel.isAlive[i] = false;
  color("red");
  var spokeAngle = wheel.angle + i * 2 * PI / wheel.spokeCount;
  var spokeEnd = vec(wheel.center).addWithAngle(spokeAngle, wheel.radius);
  particle(spokeEnd.x, clamp(spokeEnd.y, 0, 95), {
    count: 20,
    speed: 2
  });
  multiplier = 1;
}

