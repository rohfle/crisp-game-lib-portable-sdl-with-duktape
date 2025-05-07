title = "R RING";
description = "\n[Slide] Move\n";
characters = ["\n c c\nblblb\nlblbl\n lbl\n l l\n l l\n", "\n bb\nbccb\ncllc\ncllc\nbccb\n bb\n", "\n lrl\nr   r\n lrl \nL L L\n LLL\n"];
options = {
  theme: "dark",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 7
};
var ship;
var optionCount;
var rings;
var stars;
var multiplier;
var nextPowerUpTicks;
var maxOptionCount;
function update() {
  if (!ticks) {
    ship = {
      pos: vec(20, 20),
      angle: 0,
      posHistory: [],
      targetPos: vec(20, 20),
      stopTicks: 0,
      moveTicks: 0,
      fireTicks: 0
    };
    optionCount = 0;
    rings = [];
    stars = times(20, function () {
      return {
        pos: vec(rnd(99), rnd(99)),
        vy: rnd(0.5, 1),
        color: ["light_cyan", "light_purple", "light_black"][rndi(3)]
      };
    });
    multiplier = 1;
    nextPowerUpTicks = 60;
    maxOptionCount = 1;
  }
  var sd = sqrt(difficulty);
  stars.forEach(function (s) {
    s.pos.y += s.vy;
    if (s.pos.y > 99) {
      s.pos.x = rnd(99);
      s.pos.y = 0;
    }
    color(s.color);
    rect(s.pos, 1, 1);
  });
  ship.stopTicks--;
  if (ship.stopTicks < 0) {
    ship.moveTicks = rnd(120, 180) / sd;
    ship.stopTicks = ship.moveTicks + rnd(40, 60) / sd;
  }
  ship.moveTicks--;
  if (ship.moveTicks > 0) {
    if (ship.pos.distanceTo(ship.targetPos) < 5) {
      ship.targetPos.set(rnd(10, 90), rnd(3, 30));
    }
    var ta = ship.pos.angleTo(ship.targetPos);
    var oa = wrap(ta - ship.angle, -PI, PI);
    var va = 0.1 * difficulty;
    if (abs(oa) < va) {
      ship.angle = ta;
    } else {
      ship.angle += oa > 0 ? va : -va;
    }
    ship.pos.addWithAngle(ship.angle, 0.5 * difficulty).clamp(0, 99, 0, 50);
    ship.posHistory.unshift(vec(ship.pos));
    if (ship.posHistory.length > 99) {
      ship.posHistory.pop();
    }
  }
  color("black");
  char("a", ship.pos);
  ship.fireTicks--;
  if (ship.fireTicks < 0) {
    play("hit");
    fire(ship.pos);
  }
  nextPowerUpTicks--;
  if (nextPowerUpTicks < 0) {
    play("powerUp");
    optionCount++;
    if (optionCount > maxOptionCount) {
      optionCount = 0;
      maxOptionCount = clamp(maxOptionCount + 1, 1, 4);
    }
    nextPowerUpTicks = (optionCount === 0 ? 60 : 300 / optionCount) / sd;
  }
  times(optionCount, function (i) {
    var p = ship.posHistory[(i + 1) * 24];
    var s = sin(ticks % 40 * PI * 2 / 40) * 0.2 + 1;
    char("b", p, {
      scale: {
        x: s,
        y: s
      }
    });
    if (ship.fireTicks < 0) {
      fire(p);
    }
  });
  if (ship.fireTicks < 0) {
    ship.fireTicks = 60 / difficulty;
  }
  color("purple");
  remove(rings, function (r) {
    r.pos.y += r.vy;
    r.radius += r.vy * 0.5;
    arc(r.pos.x, r.pos.y - r.radius * 0.3, r.radius * 0.6, 3, PI / 4, PI / 4 * 3);
  });
  color("red");
  remove(rings, function (r) {
    arc(r.pos.x - r.radius * 0.32, r.pos.y, r.radius * 0.2, 3, PI / 6 * 5, PI / 6 * 7);
    arc(r.pos.x + r.radius * 0.32, r.pos.y, r.radius * 0.2, 3, -(PI / 6), PI / 6);
  });
  color("black");
  if (char("c", clamp(input.pos.x, 0, 99), 95).isColliding.rect.red) {
    play("explosion");
    end();
  }
  remove(rings, function (r) {
    color(r.isHit ? "light_purple" : "purple");
    if (arc(r.pos.x, r.pos.y + r.radius * 0.3, r.radius * 0.6, 3, -PI / 4, -(PI / 4) * 3).isColliding["char"].c && !r.isHit) {
      play("coin");
      addScore(multiplier, r.pos);
      multiplier++;
      r.isHit = true;
    }
    if (r.pos.y > 110) {
      if (!r.isHit && multiplier > 1) {
        multiplier--;
      }
      return true;
    }
  });
  color("black");
  text("+".concat(multiplier), 3, 9);
  function fire(p) {
    rings.push({
      pos: vec(p),
      vy: sd,
      radius: 1,
      isHit: false
    });
  }
}

