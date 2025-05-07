title = " T PUNCH";
description = "\n[Tap]  Punch\n[Hold] Roll\n";
characters = ["\n bbbb\nppbbbb\nppprrr\n prrr\n", "\nc   c\n ccc\nccbcc\n ccc\nc   c\n", "\n lll\nlyyyl\nl   l\nl b l\n lll\n"];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  isDrawingScoreFront: true,
  seed: 90
};
var arm;
var enemies;
var nextEnemyTicks;
var bonuses;
var multiplier;
function update() {
  if (!ticks) {
    arm = {
      angle: 0,
      av: 0,
      length: 0,
      targetLength: 9,
      isAttacking: false,
      isAlive: times(6, function () {
        return true;
      })
    };
    enemies = [];
    nextEnemyTicks = 0;
    bonuses = [];
    multiplier = 1;
  }
  var sd = sqrt(difficulty);
  var an = arm.isAlive.length;
  color("black");
  char("c", 49, 49);
  if (input.isJustPressed) {
    if (arm.length < 5) {
      play("select");
      arm.isAttacking = true;
    } else {
      play("laser");
    }
    multiplier = 1;
  }
  if (!input.isPressed || arm.length > 30) {
    arm.isAttacking = false;
  }
  arm.length += ((input.isPressed ? 36 : 0) - arm.length) * 0.1 * sqrt(difficulty);
  if (input.isPressed) {
    arm.av += sqrt(difficulty) * 0.001;
  } else {
    arm.av += (0.03 * sqrt(difficulty) - arm.av) * 0.2;
  }
  arm.angle += arm.av;
  var sz = sqrt(arm.length) * 0.5 + 3;
  var p = vec();
  var a = arm.angle;
  arm.isAlive.forEach(function (ia) {
    a += PI * 2 / arm.isAlive.length;
    if (!ia) {
      return;
    }
    var r = 5;
    var ri = arm.length / 4;
    times(5, function (i) {
      var s = sz;
      if (i === 4 && arm.isAttacking) {
        color("red");
        s *= 1.5;
      } else {
        color("cyan");
      }
      box(p.set(50, 50).addWithAngle(a, r), s);
      r += ri;
    });
  });
  if (enemies.length === 0) {
    nextEnemyTicks = 0;
  }
  nextEnemyTicks--;
  if (nextEnemyTicks < 0) {
    var pos = vec(rnd(99), rnd() < 0.5 ? -3 : 3);
    if (rnd() < 0.5) {
      pos.swapXy();
    }
    enemies.push({
      pos: pos,
      vel: vec(rnds(sd) * 0.3, rnds(sd) * 0.3)
    });
    nextEnemyTicks = rnd(60, 99) / difficulty;
  }
  var cp = vec(50, 50);
  remove(bonuses, function (b) {
    b.vel.addWithAngle(cp.angleTo(b.pos), sd * 0.002);
    b.vel.mul(0.98);
    b.pos.add(b.vel);
    var t = 60 / sd;
    color(b.ticks > t ? "black" : "light_blue");
    var c = char("b", b.pos).isColliding.rect;
    if (b.ticks > t && (c.red || c.cyan)) {
      play("coin");
      addScore(multiplier, b.pos);
      multiplier++;
      return true;
    }
    b.ticks++;
    return !b.pos.isInRect(-3, -3, 106, 106);
  });
  color("black");
  remove(enemies, function (e) {
    if (e.pos.distanceTo(50, 50) > 30) {
      e.vel.addWithAngle(e.pos.angleTo(50, 50), sd * 0.005);
      e.vel.mul(0.99);
    }
    e.pos.add(e.vel);
    var c = char("a", e.pos, {
      mirror: {
        x: e.vel.x > 0 ? 1 : -1
      }
    }).isColliding;
    if (c.rect.red) {
      play("powerUp");
      var _a = rnd(PI * 2);
      times(16, function (i) {
        bonuses.push({
          pos: vec(e.pos),
          vel: vec(i * 0.05).rotate(i),
          ticks: 0
        });
      });
      var ai = rndi(an);
      for (var i = 0; i < an; i++) {
        if (!arm.isAlive[ai]) {
          arm.isAlive[ai] = true;
          break;
        }
        ai = wrap(ai + 1, 0, an);
      }
      return true;
    }
    if (c.rect.cyan) {
      play("explosion");
      return true;
    }
    if (c["char"].c) {
      play("lucky");
      end();
    }
  });
  var ac = 0;
  a = arm.angle;
  arm.isAlive.forEach(function (ia, j) {
    a += PI * 2 / an;
    if (!ia) {
      return;
    }
    ac++;
    var r = 5;
    var ri = arm.length / 4;
    times(5, function (i) {
      if (i === 4 && arm.isAttacking) {
        return;
      }
      color("transparent");
      if (box(p.set(50, 50).addWithAngle(a, r), sz).isColliding["char"].a) {
        color("cyan");
        particle(p, 9, 2);
        arm.isAlive[j] = false;
      }
      r += ri;
    });
  });
  if (ac === 0) {
    play("lucky");
    end();
  }
}

