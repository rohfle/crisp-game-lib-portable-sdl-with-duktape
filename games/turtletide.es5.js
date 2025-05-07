title = "TURTLE TIDE";
description = "\n[Hold] Dive & Speed up\n";
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  audioSeed: 1
};
var turtle;
var water;
var obstacles;
var nextObstacleDist;
var TURTLE_SIZE = 2;
var WATER_COLOR = "light_blue";
var TURTLE_COLOR = "green";
var OBSTACLE_COLOR_ABOVE = "red";
var OBSTACLE_COLOR_BELOW = "purple";
var SCROLL_SPEED = 1;
function update() {
  if (!ticks) {
    initGame();
  }
  updateWater();
  updateTurtle();
  updateObstacles();
}
function initGame() {
  turtle = {
    pos: vec(20, 50),
    isUnderwater: false,
    speed: 1
  };
  water = {
    waterLevel: 50,
    waveAmplitude: 10,
    waveFrequency: 0.05
  };
  obstacles = [];
  nextObstacleDist = 60;
  ticks = 0;
  score = 0;
}
function updateWater() {
  water.waveFrequency = clamp(water.waveFrequency + rnds(0.0001 * sqrt(difficulty)), 0, 0.05 * sqrt(difficulty));
  water.waveAmplitude = clamp(water.waveAmplitude + rnds(0.01 * sqrt(difficulty)), 0, 10 * sqrt(difficulty));
  var wl = 50 + Math.sin(ticks * water.waveFrequency) * water.waveAmplitude;
  water.waterLevel += (wl - water.waterLevel) * 0.1;
  color(WATER_COLOR);
  rect(0, water.waterLevel, 100, 100 - water.waterLevel);
}
function updateTurtle() {
  if (input.isJustPressed) {
    play("powerUp");
  }
  if (input.isJustReleased) {
    play("jump");
  }
  if (input.isPressed) {
    turtle.isUnderwater = true;
    turtle.speed = clamp(turtle.speed + 0.01, 1, 9);
  } else {
    turtle.isUnderwater = false;
    turtle.speed += (1 - turtle.speed) * 0.1;
  }
  var targetY = turtle.isUnderwater ? water.waterLevel + 15 : water.waterLevel - 5;
  turtle.pos.y += (targetY - turtle.pos.y) * 0.1 * difficulty;
  color(TURTLE_COLOR);
  var turtleCollision = box(turtle.pos, TURTLE_SIZE * turtle.speed, TURTLE_SIZE);
  if (turtleCollision.isColliding.rect[WATER_COLOR] && !turtle.isUnderwater) {
    turtle.pos.y = water.waterLevel - TURTLE_SIZE / 2;
  }
}
function updateObstacles() {
  var ss = SCROLL_SPEED * difficulty * turtle.speed;
  addScore(ss * 0.1);
  obstacles.forEach(function (o) {
    o.pos.x -= ss;
  });
  remove(obstacles, function (o) {
    return o.pos.x < -10;
  });
  nextObstacleDist -= ss;
  if (nextObstacleDist < 0) {
    play("click");
    var isUnderwater = rnd() < 0.5;
    obstacles.push({
      pos: vec(110, isUnderwater ? rnd(water.waterLevel + 5, 95) : rnd(5, water.waterLevel - 5)),
      isUnderwater: isUnderwater,
      size: vec(rnd(5, 10), rnd(5, 10))
    });
    nextObstacleDist = rnd(99, 120);
  }
  obstacles.forEach(function (o) {
    color(o.isUnderwater ? OBSTACLE_COLOR_BELOW : OBSTACLE_COLOR_ABOVE);
    if (box(o.pos, o.size).isColliding.rect[TURTLE_COLOR]) {
      play("explosion");
      end();
    }
  });
}

