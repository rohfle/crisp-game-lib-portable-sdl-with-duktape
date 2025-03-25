title = "LIE DOWN";
description = "\n[Hold] Lie down\n";
characters = ["\n    ll\n   l \n llll\nl l\nll l\n    l\n", "\n    ll\n   l\n lll\n  l  \n ll\n ll \n", "\nl   ll\nllllll\n", "\n ll l\n  l l\n  ll \n  l\nll l\n    l\n", "\nll\n l \n lll \nl l\n l l\n l  l\n", "\n l\nlll\n l\n"];
options = {
  viewSize: {
    x: 200,
    y: 50
  },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 2
};
var holes;
var nextHoleTicks;
var enemies;
var nextEnemyTicks;
var rocks;
var player;
var separateLine;
var multiplier;
function update() {
  if (!ticks) {
    holes = [];
    nextHoleTicks = 0;
    enemies = [];
    nextEnemyTicks = 60;
    rocks = [];
    player = {
      x: 20,
      vx: 0,
      y: 0
    };
    separateLine = 100;
    multiplier = 1;
  }
  var scr = difficulty * 0.1;
  if (player.x > 30) {
    scr += (player.x - 30) * 0.1;
  }
  if (player.y > 0) {
    scr = 0;
  }
  color("black");
  rect(0, 40, 200, 10);
  color("light_black");
  separateLine = wrap(separateLine - scr, 0, 200);
  rect(separateLine, 40, 1, 10);
  color("black");
  nextEnemyTicks--;
  if (nextEnemyTicks < 0) {
    play("laser");
    enemies.push({
      x: rnd(100, 250),
      height: 0,
      speed: (0.1 + rnd(2) * rnd(2) * 0.1) * difficulty
    });
    nextEnemyTicks = 50 / sqrt(difficulty);
  }
  color("red");
  remove(rocks, function (r) {
    r.x -= scr + r.vx;
    r.vx += (r.targetVx - r.vx) * 0.1;
    if (r.vx > r.targetVx * 0.5) {
      char("f", r.x, 34);
    }
    return r.x < -3 || r.x > 203;
  });
  nextHoleTicks--;
  if (nextHoleTicks < 0) {
    holes.push({
      x: rnd(300),
      height: 0,
      speed: rnd(0.1, 0.2) * difficulty
    });
    nextHoleTicks = 100 / sqrt(difficulty);
  }
  color("white");
  remove(holes, function (h) {
    h.x -= scr;
    h.height += h.speed;
    if (h.height > 11 && h.speed > 0) {
      h.speed *= -1;
    }
    var hg = clamp(h.height, 0, 10);
    rect(h.x, 50 - hg, 9, hg + 1);
    return h.height < 0;
  });
  color("black");
  if (player.y > 0) {
    player.y++;
    char("a", player.x, 37 + player.y, {
      mirror: {
        y: -1
      }
    });
    if (37 + player.y > 45) {
      play("explosion");
      end();
    }
  } else {
    if (input.isJustPressed) {
      play("select");
      if (multiplier > 1) {
        multiplier--;
      }
    }
    if (!input.isPressed) {
      player.vx += difficulty * 0.02;
    }
    player.vx *= 0.99;
    player.x += player.vx - scr;
    if (player.x < 0) {
      play("explosion");
      end();
    }
    if (char(input.isPressed ? "c" : addWithCharCode("a", floor(ticks / 20) % 2), player.x, input.isPressed ? 39 : 37).isColliding["char"].f) {
      play("explosion");
      end();
    }
    color("transparent");
    if (char("a", player.x - 5, 38).isColliding.rect.white && char("a", player.x + 5, 38).isColliding.rect.white) {
      player.vx = 0;
      if (input.isPressed) {
        player.x -= 5;
      } else {
        player.y = 1;
      }
    }
  }
  remove(enemies, function (e) {
    e.x -= scr;
    e.height += e.speed > 0 ? sqrt(e.speed * 10) / 10 : e.speed;
    if (e.height > 15 && e.speed > 0) {
      play("powerUp");
      rocks.push({
        x: e.x,
        vx: 0,
        targetVx: e.speed * 3
      });
      e.speed *= -1;
    }
    var hg = 10 - clamp(e.height, 0, 10);
    var y = 37 + hg * hg / 10;
    color(e.height > 12 && e.speed > 0 ? "red" : "black");
    var c = char(addWithCharCode("d", e.speed > 0 ? 0 : 1), e.x, y).isColliding["char"];
    if (c.a || c.b || c.c) {
      play("coin");
      addScore(multiplier, e.x, y);
      multiplier++;
      particle(e.x, y);
      return true;
    }
    return e.height < 0;
  });
}

