title = "TORNADO TWISTER";
description = "\n[Tap] Change direction\n[Hold] Shrink & slow down\n";
characters = [];
options = {
  theme: "shapeDark",
  viewSize: {
    x: 150,
    y: 100
  },
  isPlayingBgm: true,
  isReplayEnabled: true,
  audioSeed: 6
};
var tornado;
var suckableObjects;
var obstacles;
var nextObstacleTicks;
var scrollSpeed;
var growthRate;
var spawnTimer;
function update() {
  if (!ticks) {
    tornado = {
      pos: vec(20, 75),
      size: 7,
      currentSize: 7,
      direction: 1,
      speed: 1,
      particles: times(20, function () {
        return vec(rnds(10), rnds(10));
      })
    };
    suckableObjects = [];
    obstacles = [];
    nextObstacleTicks = 0;
    scrollSpeed = 1;
    growthRate = 0.01;
    spawnTimer = 0;
    score = 0;
  }
  var sd = sqrt(difficulty);
  scrollSpeed = sd;
  if (input.isJustPressed) {
    tornado.direction *= -1;
    play("laser");
  }
  if (input.isPressed) {
    tornado.currentSize += (3 - tornado.currentSize) * 0.1;
    tornado.speed += (0.1 - tornado.speed) * 0.1;
  } else {
    tornado.currentSize += (tornado.size - tornado.currentSize) * 0.03;
    tornado.speed += (1 - tornado.speed) * 0.1;
  }
  tornado.pos.y += tornado.direction * tornado.speed * sd;
  if (tornado.pos.y <= tornado.currentSize && tornado.direction < 0) {
    tornado.direction = 1;
  }
  if (tornado.pos.y >= 100 - tornado.currentSize && tornado.direction > 0) {
    tornado.direction = -1;
  }
  color("cyan");
  tornado.particles.forEach(function (p, i) {
    p.rotate(0.15 * (1 - i / tornado.particles.length) * sd);
    var pos = vec(tornado.pos).add(vec(p).mul(tornado.currentSize / 10));
    box(pos, sqrt(tornado.currentSize));
  });
  spawnTimer -= sd;
  if (spawnTimer <= 0) {
    var type = rnd() < 0.5 ? "tree" : rnd() < 0.7 ? "house" : "car";
    var size = type === "tree" ? 3 : type === "house" ? 5 : 4;
    suckableObjects.push({
      pos: vec(160, rnd(10, 90)),
      type: type,
      size: size,
      angle: 0,
      distance: 0
    });
    spawnTimer = rnd(30, 50);
  }
  remove(suckableObjects, function (obj) {
    if (obj.distance > 0) {
      obj.distance -= 1;
      obj.angle += 0.2;
      var offset = vec(obj.distance, 0).rotate(obj.angle);
      obj.pos = vec(tornado.pos).add(offset);
      if (obj.distance <= 0) {
        tornado.size += obj.size * 0.05;
        addScore(floor(obj.size * tornado.currentSize), tornado.pos);
        play("powerUp");
        return true;
      }
    } else {
      obj.pos.x -= scrollSpeed;
    }
    color(obj.type === "tree" ? "green" : obj.type === "house" ? "yellow" : "red");
    var isCollidingTornado = box(obj.pos, obj.size).isColliding.rect.cyan;
    if (isCollidingTornado && obj.distance === 0) {
      obj.distance = obj.pos.distanceTo(tornado.pos) * 1.5;
      obj.angle = tornado.pos.angleTo(obj.pos);
    }
    return obj.pos.x < -obj.size;
  });
  nextObstacleTicks -= sd;
  if (nextObstacleTicks < 0) {
    var width = rnd(20, 30);
    obstacles.push({
      pos: vec(150 + width / 2, rnd(10, 90)),
      width: width,
      height: rnd(10, 20)
    });
    nextObstacleTicks += rnd(50, 150);
  }
  obstacles = obstacles.filter(function (obs) {
    obs.pos.x -= scrollSpeed;
    color("black");
    var isCollidingTornado = box(obs.pos, obs.width, obs.height).isColliding.rect.cyan;
    if (isCollidingTornado) {
      play("explosion");
      end();
    }
    return obs.pos.x > -obs.width;
  });
}

