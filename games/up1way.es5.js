title = "UP 1 WAY";
description = "\n[Tap] Go up\n";
characters = ["\nllllll\nll l l\nll l l\nllllll\n l  l\n l  l\n    ", "\nllllll\nll l l\nll l l\nllllll\nll  ll\n    ", "\n  yy\n  YY\n yyyy\n YYYY\nyyyyyy\nYYYYYY\n    ", "\n  rr\n  rr\n  rr\n  rr\n  rr\n  rr\n  ", "\n  rr\n rRRr\n r  r\n rRRr\n rRRr\n  rr\n  ", "\n  rr\n rRRr\nr RR r\nrRRRRr\n rRRr\n  rr\n  ", "\n  rr\n rRRr\n r  r\n rRRr\n rRRr\n  rr\n  ", "\nyyyy\ny  y\nyyyy\ny Y YY\ny Y YY\ny Y YY\n"];
options = {
  viewSize: {
    x: 200,
    y: 100
  },
  isPlayingBgm: true,
  isReplayEnabled: true,
  isDrawingScoreFront: true,
  seed: 12
};
var floors;
var nextBambooDist;
var nextBambooFloorIndex;
var nextSkullDist;
var nextPowDist;
var player;
var animTicks;
var floorIndexToY = function floorIndexToY(i) {
  return 16 + i * 15;
};
function update() {
  if (!ticks) {
    floors = times(6, function (i) {
      return {
        y: floorIndexToY(i),
        holeXs: i === 5 ? [] : [rnd(99, 180)],
        nextHoleDist: i === 5 ? 999999999 : rnd(99),
        bambooXs: [],
        nextBamBooDist: 0,
        skullXs: [],
        powXs: []
      };
    });
    nextBambooDist = 0;
    nextBambooFloorIndex = rndi(floors.length);
    nextSkullDist = rnd(49, 99);
    nextPowDist = 999;
    var floorIndex = 5;
    player = {
      pos: vec(20, floorIndexToY(floorIndex)),
      floorIndex: floorIndex,
      targetFi: undefined
    };
    animTicks = 0;
  }
  animTicks += difficulty;
  if (player.targetFi != null) {
    var ty = floorIndexToY(player.targetFi);
    var vy = ty > player.pos.y ? 1 : -1;
    player.pos.y += vy * difficulty * 3;
    if ((player.pos.y - ty) * vy > 0) {
      player.pos.y = ty;
      player.floorIndex = player.targetFi;
      player.targetFi = undefined;
    }
  }
  if (player.targetFi == null) {
    if (input.isJustPressed && player.floorIndex > 0) {
      play("jump");
      player.targetFi = player.floorIndex - 1;
    } else if (checkHole(player.floorIndex, player.pos.x)) {
      play("click");
      player.targetFi = player.floorIndex + 1;
    }
  }
  char(addWithCharCode("a", floor(animTicks / 20) % 2), player.pos.x, player.pos.y - 5);
  var scr = difficulty;
  nextBambooDist -= scr;
  if (nextBambooDist < 0) {
    if (floors[nextBambooFloorIndex].nextHoleDist < 9) {
      nextBambooFloorIndex = rndi(floors.length);
    } else {
      floors[nextBambooFloorIndex].bambooXs.push(209);
      if (rnd() < 0.3) {
        nextBambooDist = 6;
      } else {
        nextBambooDist = rnd(200, 300);
        nextBambooFloorIndex = rndi(floors.length);
      }
    }
  }
  nextSkullDist -= scr;
  if (nextSkullDist < 0) {
    var fi = rndi(floors.length);
    if (floors[fi].nextHoleDist > 9 && nextBambooDist > 9) {
      floors[fi].skullXs.push(209);
    }
    nextSkullDist += rnd(30, 50);
  }
  nextPowDist -= scr;
  if (nextPowDist < 0) {
    var _fi = rndi(floors.length);
    floors[_fi].powXs.push(209);
    nextPowDist = 999;
  }
  color("light_blue");
  rect(0, 97, 200, 3);
  floors.forEach(function (f) {
    f.nextHoleDist -= scr;
    if (f.nextHoleDist < 0) {
      f.holeXs.push(200);
      f.nextHoleDist = rnd(32, 99);
    }
    var fx = 0;
    f.holeXs.forEach(function (x, i) {
      if (x > fx) {
        color("green");
        rect(fx, f.y - 2, x - fx, 2);
        color("light_black");
        rect(fx, f.y, x - fx, 3);
      }
      fx = x + 9;
      f.holeXs[i] -= scr;
    });
    if (fx < 200) {
      color("green");
      rect(fx, f.y - 2, 200 - fx, 2);
      color("light_black");
      rect(fx, f.y, 200 - fx, 3);
    }
    color("black");
    remove(f.holeXs, function (x) {
      return x < -9;
    });
    f.bambooXs.forEach(function (x, i) {
      var c = char("c", x, f.y - 5).isColliding["char"];
      if (c.a || c.b) {
        play("coin");
        addScore(1, x, f.y - 5);
        f.bambooXs[i] = -9;
      }
      f.bambooXs[i] -= scr;
    });
    remove(f.bambooXs, function (x) {
      return x < -3;
    });
    f.powXs.forEach(function (x, i) {
      var c = char("h", x, f.y - 5).isColliding["char"];
      if (c.a || c.b) {
        play("powerUp");
        floors.forEach(function (f) {
          f.skullXs.forEach(function (x) {
            f.bambooXs.push(x);
          });
          f.skullXs = [];
        });
        f.powXs[i] = -9;
      }
      f.powXs[i] -= scr;
    });
    remove(f.powXs, function (x) {
      return x < -3;
    });
    f.skullXs.forEach(function (x, i) {
      var c = char(addWithCharCode("d", floor(animTicks / 15) % 4), x, f.y - 5).isColliding["char"];
      if (c.c || c.h) {
        f.skullXs[i] = -9;
      }
      if (c.a || c.b) {
        play("explosion");
        end();
      }
      f.skullXs[i] -= scr;
    });
    remove(f.skullXs, function (x) {
      return x < -3;
    });
  });
}
function checkHole(fi, x) {
  var hasHole = false;
  floors[fi].holeXs.forEach(function (hx) {
    if (x > hx + 3 && x < hx + 6) {
      hasHole = true;
    }
  });
  return hasHole;
}

