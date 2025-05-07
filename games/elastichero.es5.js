title = "ELASTIC HERO";
description = "\n[Hold] Stretch & Aim\n[Release] Launch\n";
characters = [];
options = {
  viewSize: {
    x: 100,
    y: 150
  },
  isPlayingBgm: true,
  isReplayEnabled: true,
  audioSeed: 4
};
var hero;
var platforms;
var waterY;
var ARENA_WIDTH = 100;
var ARENA_HEIGHT = 150;
var GRAVITY = 0.1;
var MAX_STRETCH = 20;
function update() {
  if (!ticks) {
    hero = {
      pos: vec(ARENA_WIDTH / 2, ARENA_HEIGHT - 20),
      vel: vec(0, -1),
      angle: 0,
      stretchLength: 0
    };
    platforms = generatePlatforms();
    waterY = ARENA_HEIGHT;
  }
  hero.pos.add(hero.vel);
  hero.vel.y += GRAVITY;
  hero.vel.mul(hero.pos.y < waterY ? 0.99 : 0.9);
  if (input.isPressed) {
    hero.stretchLength = Math.min(hero.stretchLength + 1, MAX_STRETCH);
    hero.angle = (hero.angle + 0.1) % (2 * Math.PI);
  } else if (input.isJustReleased) {
    play("powerUp");
    hero.vel = vec(hero.stretchLength * 0.5, 0).rotate(hero.angle);
    hero.stretchLength = 0;
  } else {
    hero.stretchLength = 0;
  }
  if (hero.pos.x < 3 && hero.vel.x < 0 || hero.pos.x > ARENA_WIDTH - 3 && hero.vel.x > 0) {
    hero.vel.x *= -0.8;
  }
  if (hero.pos.y < 3) {
    hero.pos.y += 150;
    addScore(floor(waterY), hero.pos);
    waterY += ARENA_HEIGHT;
    platforms = generatePlatforms();
    play("coin");
  }
  if (hero.pos.y > ARENA_HEIGHT - 3 && hero.vel.y > 0) {
    hero.vel.y *= -0.8;
  }
  if (waterY > 140) {
    waterY += (140 - waterY) * 0.05;
  }
  waterY -= difficulty * 0.1;
  color("light_cyan");
  rect(0, waterY, ARENA_WIDTH, ARENA_HEIGHT - waterY);
  if (waterY < 0) {
    play("explosion");
    end();
  }
  drawHero();
  drawWalls();
  color("blue");
  platforms.forEach(function (platform) {
    var c = box(platform.pos, platform.width, platform.height).isColliding.rect;
    if (c.green) {
      if (hero.vel.y > 0 && hero.pos.y < platform.pos.y) {
        hero.vel.y *= -0.8;
        hero.pos.y = platform.pos.y - platform.height / 2 - 3;
        play("click");
      } else if (hero.vel.y < 0 && hero.pos.y > platform.pos.y) {
        hero.vel.y *= -0.8;
        hero.pos.y = platform.pos.y + platform.height / 2 + 3;
        play("click");
      }
    }
  });
}
function drawHero() {
  color("green");
  arc(hero.pos, 5);
  if (hero.stretchLength > 0) {
    color("black");
    line(hero.pos, vec(hero.pos).add(vec(hero.stretchLength, 0).rotate(hero.angle)));
  }
}
function drawWalls() {
  color("light_black");
  rect(0, 0, 3, ARENA_HEIGHT);
  rect(ARENA_WIDTH - 3, 0, 3, ARENA_HEIGHT);
  rect(0, ARENA_HEIGHT - 3, ARENA_WIDTH, 3);
}
function generatePlatforms() {
  var platforms = [];
  for (var y = ARENA_HEIGHT - 40; y > 20; y -= 20) {
    var width = rnd(20, 30);
    platforms.push({
      pos: vec(rnd(width / 2, ARENA_WIDTH - width / 2), y),
      width: width,
      height: 7
    });
  }
  return platforms;
}

