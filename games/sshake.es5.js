title = "S SHAKE";
description = "\n[Tap] Shake\n";
characters = ["\n  lll\nll l l\n llll\n l  l\nll  ll\n", "\n  lll\nll l l\n llll\n  ll\n l  l\n l  l\n"];
options = {
  viewSize: {
    x: 200,
    y: 100
  },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 7
};
var grounds;
var heightRatio;
var enemies;
var nextEnemyTicks;
var multiplier;
function update() {
  if (!ticks) {
    var angle = 0;
    grounds = times(22, function (i) {
      angle += PI * 4 / 20;
      return {
        pos: vec(i * 10),
        angle: angle,
        height: 9
      };
    });
    heightRatio = 1;
    enemies = [];
    nextEnemyTicks = 0;
    multiplier = 1;
  }
  var scr = difficulty * 0.3;
  if (input.isJustPressed) {
    play("jump");
    heightRatio = 3;
    multiplier = 1;
  }
  heightRatio += (1 - heightRatio) * 0.05;
  var maxY = 0;
  grounds.forEach(function (g, i) {
    g.pos.x += scr;
    if (g.pos.x > 210) {
      g.pos.x -= 220;
      var ng = grounds[wrap(i + 1, 0, 22)];
      g.angle = ng.angle - PI * 4 / 20 * rnd(0.5, 1.5);
      g.height = ng.height + rnds(1);
      g.height += (9 - g.height) * 0.05;
    }
    g.pos.y = sin(g.angle) * g.height;
    if (g.pos.y > maxY) {
      maxY = g.pos.y;
    }
  });
  var pp;
  grounds.forEach(function (g) {
    g.pos.y = (g.pos.y - maxY) * heightRatio + 99;
    if (pp != null && pp.x < g.pos.x) {
      line(pp, g.pos);
    }
    pp = g.pos;
  });
  var fp = grounds[0].pos;
  var lp = grounds[grounds.length - 1].pos;
  if (lp.x < fp.x) {
    line(lp, fp);
  }
  nextEnemyTicks--;
  if (nextEnemyTicks < 0) {
    enemies.push({
      pos: vec(203, 50),
      vel: vec(-rnd(1, sqrt(difficulty)) * 0.3 * sqrt(difficulty)),
      isOnGround: true,
      ticks: 0
    });
    nextEnemyTicks = rnd(120) / difficulty / difficulty;
  }
  remove(enemies, function (e) {
    e.pos.add(e.vel);
    e.ticks -= e.vel.x;
    color("transparent");
    if (e.isOnGround) {
      if (input.isJustPressed) {
        var vy = 0;
        for (var i = 0; i < 99; i++) {
          e.pos.y--;
          vy--;
          if (box(e.pos, 6).isColliding.rect.black) {
            e.vel.y = vy * sqrt(difficulty) * 0.3;
            e.isOnGround = false;
            break;
          }
        }
      }
      if (box(e.pos, 6).isColliding.rect.black) {
        for (var _i = 0; _i < 99; _i++) {
          e.pos.y--;
          if (!box(e.pos, 6).isColliding.rect.black) {
            break;
          }
        }
      } else {
        for (var _i2 = 0; _i2 < 99; _i2++) {
          e.pos.y++;
          if (box(e.pos, 6).isColliding.rect.black) {
            e.pos.y--;
            break;
          }
        }
      }
    } else {
      e.vel.y += 0.03 * difficulty;
      if (box(e.pos, 6).isColliding.rect.black) {
        e.isOnGround = true;
        e.vel.y = 0;
      } else if (e.vel.y > 0) {
        var ey = e.pos.y;
        for (var _i3 = 0; _i3 < 9; _i3++) {
          ey -= 3;
          if (box(e.pos.x, ey, 6).isColliding.rect.black) {
            e.pos.y = ey - 5;
            e.isOnGround = true;
            e.vel.y = 0;
            break;
          }
        }
      }
    }
    color("black");
    char(addWithCharCode("a", floor(e.ticks / 9) % 2), e.pos, {
      mirror: {
        x: -1
      }
    });
    if (e.pos.y < -3) {
      play("coin");
      addScore(multiplier, e.pos.x, clamp(9 + multiplier * 3, 9, 60));
      multiplier++;
      return true;
    }
    if (e.pos.x < 3) {
      play("explosion");
      end();
    }
    return e.pos.y > 103;
  });
}

