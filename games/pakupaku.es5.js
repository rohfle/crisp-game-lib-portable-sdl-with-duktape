title = "PAKU PAKU";
description = "\n[Tap] Turn\n";
characters = ["\n  llll\n lll\nlll\nlll\n lll\n  llll\n", "\n  lll\n lllll\nlll\nlll\n lllll\n  lll\n", "\n  ll\n llll\nllllll\nllllll\n llll\n  ll\n", "\n  lll\n l l l\n llll\n llll\nllll\nl l l\n", "\n  lll\n l l l\n llll\n llll\n llll\n l l\n", "\nll\nll\n", "\n ll\nllll\nllll\n ll\n", "\n  l l\n\n\n\n"];
options = {
  theme: "dark",
  viewSize: {
    x: 100,
    y: 50
  },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 9
};
var player;
var enemy;
var dots;
var powerTicks;
var animTicks;
var multiplier;
function update() {
  if (!ticks) {
    player = {
      x: 40,
      vx: 1
    };
    enemy = {
      x: 100,
      eyeVx: 0
    };
    multiplier = 0;
    addDots();
    powerTicks = animTicks = 0;
  }
  animTicks += difficulty;
  color("black");
  text("x".concat(multiplier), 3, 9);
  if (input.isJustPressed) {
    player.vx *= -1;
  }
  player.x += player.vx * 0.5 * difficulty;
  if (player.x < -3) {
    player.x = 103;
  } else if (player.x > 103) {
    player.x = -3;
  }
  color("blue");
  rect(0, 23, 100, 1);
  rect(0, 25, 100, 1);
  rect(0, 34, 100, 1);
  rect(0, 36, 100, 1);
  color("green");
  var ai = floor(animTicks / 7) % 4;
  char(addWithCharCode("a", ai === 3 ? 1 : ai), player.x, 30, {
    mirror: {
      x: player.vx
    }
  });
  remove(dots, function (d) {
    color(d.isPower && floor(animTicks / 7) % 2 === 0 ? "transparent" : "yellow");
    var c = char(d.isPower ? "g" : "f", d.x, 30).isColliding["char"];
    if (c.a || c.b || c.c) {
      if (d.isPower) {
        play("jump");
        if (enemy.eyeVx === 0) {
          powerTicks = 120;
        }
      } else {
        play("hit");
      }
      addScore(multiplier);
      return true;
    }
  });
  var evx = enemy.eyeVx !== 0 ? enemy.eyeVx : (player.x > enemy.x ? 1 : -1) * (powerTicks > 0 ? -1 : 1);
  enemy.x = clamp(enemy.x + evx * (powerTicks > 0 ? 0.25 : enemy.eyeVx !== 0 ? 0.75 : 0.55) * difficulty, 0, 100);
  if (enemy.eyeVx < 0 && enemy.x < 1 || enemy.eyeVx > 0 && enemy.x > 99) {
    enemy.eyeVx = 0;
  }
  color(powerTicks > 0 ? powerTicks < 30 && powerTicks % 10 < 5 ? "black" : "blue" : enemy.eyeVx !== 0 ? "black" : "red");
  var c = char(enemy.eyeVx !== 0 ? "h" : addWithCharCode("d", floor(animTicks / 7) % 2), enemy.x, 30, {
    mirror: {
      x: evx
    }
  }).isColliding["char"];
  if (enemy.eyeVx === 0 && (c.a || c.b || c.c)) {
    if (powerTicks > 0) {
      play("powerUp");
      addScore(10 * multiplier, enemy.x, 30);
      enemy.eyeVx = player.x > 50 ? -1 : 1;
      powerTicks = 0;
      multiplier++;
    } else {
      play("explosion");
      end();
    }
  }
  powerTicks -= difficulty;
  if (dots.length === 0) {
    play("coin");
    addDots();
  }
}
function addDots() {
  var pi = player.x > 50 ? rndi(1, 6) : rndi(10, 15);
  dots = times(16, function (i) {
    return {
      x: i * 6 + 5,
      isPower: i === pi
    };
  });
  multiplier++;
}

