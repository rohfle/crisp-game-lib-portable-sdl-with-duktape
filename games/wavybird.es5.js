title = "WAVY BIRD";
description = "\n[Tap] Flap\n";
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  audioSeed: 3
};
var bird;
var pillars;
var nextPillarDist;
var shockwaves;
var multiplier;
var GRAVITY = 0.1;
var JUMP_FORCE = 1.5;
var SHOCKWAVE_SPEED = 2;
var MAX_SHOCKWAVE_RADIUS = 30;
var PILLAR_SPAWN_RATE = 20;
var PILLAR_WIDTH = 8;
var MIN_PILLAR_HEIGHT = 20;
var MAX_PILLAR_HEIGHT = 60;
function update() {
  if (!ticks) {
    bird = {
      pos: vec(20, 50),
      vel: vec(0, 0),
      size: vec(5, 3),
      angle: 0
    };
    pillars = [];
    nextPillarDist = 0;
    shockwaves = [];
    multiplier = 1;
  }
  color("purple");
  remove(shockwaves, function (s) {
    s.radius += SHOCKWAVE_SPEED * difficulty;
    arc(s.pos, s.radius, 3, s.angle - 0.3, s.angle + 0.3);
    return s.radius >= s.maxRadius;
  });
  bird.pos.y += bird.vel.y * difficulty;
  bird.vel.y += GRAVITY;
  bird.angle += (1.2 - bird.angle) * 0.02 * difficulty;
  if (input.isJustPressed) {
    play("click");
    shockwaves.push({
      pos: vec(bird.pos),
      radius: 0,
      maxRadius: MAX_SHOCKWAVE_RADIUS,
      angle: bird.angle - 0.4 * difficulty
    });
    bird.vel.y = -JUMP_FORCE;
    bird.angle -= 0.6 * difficulty;
  }
  bird.angle = clamp(bird.angle, -1.2, 1.2);
  if (bird.pos.y < 0 || bird.pos.y > 99) {
    play("explosion");
    end();
  }
  color("red");
  bar(bird.pos, bird.size.x, bird.size.y, bird.angle);
  color("cyan");
  remove(pillars, function (p) {
    p.pos.x -= difficulty;
    var c = box(p.pos, p.size).isColliding.rect;
    if (c.purple) {
      play("powerUp");
      addScore(floor(multiplier), p.pos.x, p.pos.y);
      multiplier += 1;
      return true;
    } else if (c.red) {
      play("explosion");
      end();
    }
    return p.pos.x < -PILLAR_WIDTH;
  });
  nextPillarDist -= difficulty;
  if (nextPillarDist < 0) {
    play("laser");
    var height = rnd(MIN_PILLAR_HEIGHT, MAX_PILLAR_HEIGHT);
    var y = rnd(0, 110 - height);
    for (var i = 0; i < floor(height / PILLAR_WIDTH); i++) {
      pillars.push({
        pos: vec(100 + PILLAR_WIDTH, y),
        size: vec(PILLAR_WIDTH, PILLAR_WIDTH)
      });
      y += PILLAR_WIDTH;
    }
    nextPillarDist += rnd(10, 40);
  }
  multiplier = clamp(multiplier - 0.03 * difficulty, 1, 99);
  color("black");
  text("x".concat(floor(multiplier)), 2, 9);
}

