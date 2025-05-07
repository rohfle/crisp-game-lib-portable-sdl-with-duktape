title = "SCREEN";
description = "\n[Tap] Fire\n";
characters = ["\nllllll\nll l l\nll l l\nllllll\n l  l\n l  l\n  ", "\nllllll\nll l l\nll l l\nllllll\nll  ll\n  ", "\n  lll\nll l l\n llll\n l  l\nll  ll\n", "\n  lll\nll l l\n llll\n  ll\n l  l\n l  l\n"];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 500
};
var enemies;
var nextEnemyTicks;
var player;
var shots;
var multiplier;
function update() {
  if (!ticks) {
    enemies = [];
    nextEnemyTicks = 0;
    player = {
      pos: vec(55, 95),
      tx: 55,
      angle: 0,
      shotCount: 3
    };
    shots = [];
    multiplier = 1;
  }
  player.angle += 0.01 * difficulty;
  if (player.angle >= PI / 2) {
    player.angle -= PI / 2;
  }
  var sa = player.pos.x > 50 ? -player.angle : PI + player.angle;
  if (player.shotCount > 0 && abs(player.pos.x - player.tx) < 1 && input.isJustPressed) {
    play("coin");
    shots.push({
      pos: vec(player.pos),
      angle: sa,
      speed: difficulty
    });
    player.shotCount--;
  }
  if (player.shotCount <= 0) {
    player.tx = player.tx === 55 ? 45 : 55;
  }
  var pp = player.pos.x;
  player.pos.x += (player.tx - player.pos.x) * 0.2;
  if (abs(player.pos.x - player.tx) < 1) {
    player.pos.x = player.tx;
  }
  if ((pp - 50) * (player.pos.x - 50) <= 0) {
    play("select");
    player.shotCount = 3;
  }
  color("light_black");
  bar(player.pos, 99, 2, sa, 0);
  color("black");
  char(addWithCharCode("a", floor(ticks / 20) % 2), player.pos, {
    mirror: {
      x: player.tx < 50 ? -1 : 1
    }
  });
  color("blue");
  var bx = player.pos.x < 50 ? 39 : 61;
  times(player.shotCount, function () {
    box(bx, 97, 4, 2);
    bx += player.pos.x < 50 ? -5 : 5;
  });
  remove(shots, function (s) {
    s.pos.addWithAngle(s.angle, s.speed);
    bar(s.pos, 2, 3, s.angle);
    if (!s.pos.isInRect(-5, -5, 110, 110)) {
      if (multiplier > 1) {
        multiplier--;
      }
      return true;
    }
  });
  nextEnemyTicks--;
  if (nextEnemyTicks < 0) {
    enemies.push({
      pos: vec(50 + rnds(15, 40), -3),
      vy: rnd(1, difficulty) * 0.1
    });
    nextEnemyTicks = rnd(60, 90) / difficulty;
  }
  color("black");
  rect(49, 0, 2, 100);
  color("red");
  var isEnd = false;
  remove(enemies, function (e) {
    e.pos.y += e.vy;
    if (char(addWithCharCode("c", floor(abs(ticks) / 20) % 2), e.pos, {
      mirror: {
        x: e.pos.x < 50 ? 1 : -1
      }
    }).isColliding.rect.blue) {
      play("powerUp");
      addScore(multiplier, e.pos);
      multiplier++;
      particle(e.pos);
      return true;
    }
    if (e.pos.y > 99) {
      play("explosion");
      text("X", e.pos.x, 96);
      end();
      isEnd = true;
    }
  });
  color("transparent");
  remove(shots, function (s) {
    var c = bar(s.pos, 2, 3, s.angle).isColliding["char"];
    return c.c || c.d;
  });
  if (!isEnd) {
    color("light_black");
    rect(player.pos.x < 50 ? 51 : 0, 0, 49, 100);
  }
  color("black");
  text("+".concat(multiplier), 3, 9);
}

