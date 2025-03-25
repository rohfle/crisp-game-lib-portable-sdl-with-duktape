title = "GRENADIER";
description = "\n[Tap]  Climb out\n[Hold] Throw\n";
characters = ["\n  ll\n  l\n llll\n ll\n  llll\nll   l\n", "\nll\nl  ll\n ll\nll\n  llll\nll   \n", "\n  ll\n  l\n lllll\nl l\n  llll\nll \n", "\n   ll\nll l\n  lll\n   l l\nllll\n    l\n", "\n  ll\nllll\n  lll\n llll\nl l ll\n llll\n", "\n llll\nllll\n llll\n"];
options = {
  viewSize: {
    x: 200,
    y: 80
  },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 5
};
var holes;
var tanks;
var tankAddTicks;
var bullets;
var px;
var pState;
var pAngle;
var grenades;
var speedRatio;
function update() {
  if (!ticks) {
    holes = [{
      x: 10
    }];
    tanks = [];
    bullets = [];
    grenades = [];
    px = 10;
    pState = "in_hole";
    tankAddTicks = 0;
    speedRatio = 1;
  }
  var scr = (px - 10) * 0.05;
  color("black");
  rect(0, 70, 200, 9);
  color("white");
  holes = holes.filter(function (h) {
    h.x -= scr;
    if (box(h.x, 70, 6, 10).isColliding["char"].e) {
      return false;
    }
    return h.x > -4;
  });
  color("red");
  tanks.forEach(function (t) {
    char("e", t.x, 67);
  });
  color("black");
  grenades = grenades.filter(function (g) {
    g.pos.add(g.vel);
    g.vel.y += 0.1 * difficulty;
    if (text("o", g.pos).isColliding["char"].e) {
      return false;
    }
    if (g.pos.y > 68) {
      play("hit");
      particle(g.pos, 10, 1, -PI / 2, PI * 0.7);
      holes.push({
        x: g.pos.x
      });
      return false;
    }
    return true;
  });
  tankAddTicks--;
  if (tankAddTicks < 0) {
    var sd = rnd(sqrt(difficulty) - 1) + 1;
    var fi = 300 / (rnd(sqrt(difficulty)) + 1);
    var fs = rnd(sqrt(sqrt(difficulty)) - 1) + 1;
    tanks.push({
      x: 203,
      vx: 0.08 * sd,
      fireTicks: rnd(fi),
      fireInterval: fi,
      fireSpeed: 0.4 * fs
    });
    tankAddTicks = 200 / (rnd(sqrt(difficulty)) + 1);
  }
  tanks = tanks.filter(function (t) {
    t.x -= t.vx * speedRatio + scr;
    color("transparent");
    if (box(t.x, 67, 6, 6).isColliding.text.o) {
      play("explosion");
      color("red");
      particle(t.x, 67, 20, 2, -PI / 2, PI * 1.2);
      addScore(t.x, t.x, 67);
      return false;
    }
    t.fireTicks--;
    if (t.x > 150 && pState !== "in_hole" && t.fireTicks < 0) {
      play("laser");
      t.fireTicks = t.fireInterval;
      bullets.push({
        x: t.x - 5,
        vx: t.fireSpeed
      });
    }
    return t.x > -4;
  });
  color("red");
  bullets = bullets.filter(function (b) {
    b.x -= b.vx * speedRatio + scr;
    char("f", b.x, 65);
    return b.x > -4;
  });
  if (tanks.length === 0) {
    tankAddTicks *= 0.7;
  }
  color("transparent");
  holes = holes.filter(function (h) {
    return !box(h.x, 70, 7, 10).isColliding["char"].e;
  });
  color("black");
  px -= scr;
  if (pState === "in_hole") {
    speedRatio += 0.05;
    if (input.isJustPressed) {
      pState = "running";
      px += 6;
    } else {
      if (char("a", px, 72).isColliding["char"].e) {
        play("lucky");
        end();
      }
      color("transparent");
      if (box(px + 5, 72, 6, 6).isColliding.rect.white) {
        px++;
      }
    }
  } else if (pState === "running") {
    speedRatio += (1 - speedRatio) * 0.1;
    px += 0.8 * sqrt(difficulty);
    var c = char(addWithCharCode("c", floor(ticks / 30) % 2), px, 67).isColliding;
    if (c["char"].e || c["char"].f) {
      play("lucky");
      end();
    }
    if (c.rect.white) {
      pState = "in_hole";
    } else if (input.isJustPressed) {
      pState = "throwing";
      pAngle = 0;
    }
  } else if (pState === "throwing") {
    speedRatio += (1 - speedRatio) * 0.1;
    var p = vec(px, 67);
    if (input.isJustReleased || pAngle < -1) {
      play("powerUp");
      grenades.push({
        pos: vec(p),
        vel: vec((4 - pAngle * 0.5) * sqrt(difficulty), 0).rotate(pAngle)
      });
      pState = "running";
    } else {
      var _c = char("b", p).isColliding["char"];
      if (_c.e || _c.f) {
        play("lucky");
        end();
      }
      line(p, vec(p).add(vec(10, 0).rotate(pAngle)), 2);
      pAngle -= 0.02 * sqrt(difficulty);
    }
  }
}

