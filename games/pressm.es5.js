title = "PRESS M";
description = "\n[Slide] Move\n";
characters = ["\nllllll\nll l l\nllllll\n l  l\n l  l\n  ", "\nllllll\nll l l\nllllll\nll  ll\n  "];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 7
};
var walls;
var wallMode;
var wallTicks;
var wallModeInterval;
var wallSpeed;
var hitWallIndex;
var px;
var pmx;
var coins;
var inhalingCoins;
var multiplier;
function update() {
  if (!ticks) {
    walls = times(20, function (i) {
      var xi = i % 10;
      var yi = floor(i / 10);
      var ey = yi === 0 ? 40 : 60;
      return {
        pos: vec(xi * 10, ey),
        sy: 0,
        ey: ey,
        ney: 0
      };
    });
    wallTicks = 0;
    wallMode = "press";
    px = 50;
    pmx = 1;
    hitWallIndex = -1;
    inhalingCoins = [];
    multiplier = 1;
  }
  color(wallMode === "press" && wallTicks < 5 ? "red" : "purple");
  if (wallTicks === 0) {
    if (wallMode == "press") {
      if (multiplier > 1) {
        multiplier--;
      }
      if (hitWallIndex >= 0) {
        play("explosion");
        particle(walls[hitWallIndex].pos, 30, 2);
      }
      var i = 0;
      for (var yi = 0; yi < 2; yi++) {
        var a = rnd(PI * 2);
        var av = rnds(0.4, 1);
        var r = rnd(10, 20);
        var cy = yi === 0 ? rnd(15, 25) : rnd(75, 85);
        for (var xi = 0; xi < 10; xi++, i++) {
          var w = walls[i];
          w.sy = clamp(sin(a) * r + cy, 2, 97);
          av += rnds(0.1);
          r += rnds(1);
          a += av;
          cy += rnds(1);
        }
      }
      var mw = 99;
      for (var _xi = 0; _xi < 10; _xi++) {
        var _w = walls[_xi + 10].sy - walls[_xi].sy;
        if (_w < mw) {
          mw = _w;
          hitWallIndex = _xi;
        }
      }
      mw /= 2;
      walls.forEach(function (w, i) {
        w.ney = w.sy + (i < 10 ? mw : -mw);
      });
      var hasSpace = false;
      for (var _xi2 = 0; _xi2 < 10; _xi2++) {
        var w1 = walls[_xi2];
        var w2 = walls[_xi2 + 10];
        if (w1.ney < 40 && w2.ney > 60) {
          hasSpace = true;
        }
      }
      if (!hasSpace) {
        for (var _xi3 = 0; _xi3 < 10; _xi3++) {
          if (_xi3 !== hitWallIndex) {
            var _w2 = walls[_xi3];
            var _w3 = walls[_xi3 + 10];
            if (_w2.ney > 40) {
              var _w4 = _w2.ney - 40;
              _w2.ney -= _w4;
              _w2.sy -= _w4;
            }
            if (_w3.ney < 60) {
              var _w5 = 60 - _w3.ney;
              _w3.ney += _w5;
              _w3.sy += _w5;
            }
          }
        }
      }
      coins = [];
      walls.forEach(function (w, i) {
        if (rnd() < 0.2) {
          coins.push({
            pos: vec(),
            wall: w,
            wallOy: i < 10 ? 4 : -4
          });
        }
      });
      wallMode = "return";
      wallModeInterval = wallTicks = ceil(60 / sqrt(difficulty));
    } else {
      walls.forEach(function (w) {
        w.ey = w.ney;
      });
      wallMode = "press";
      wallModeInterval = wallTicks = ceil(20 / sqrt(difficulty));
    }
  }
  wallTicks--;
  walls.forEach(function (w, i) {
    w.pos.y = wallMode === "press" ? w.sy + (w.ey - w.sy) * (wallTicks < 5 ? 1 - wallTicks / 5 : (1 - wallTicks / wallModeInterval) * 0.2) : w.ey + (w.sy - w.ey) * (1 - (wallTicks + 1) / wallModeInterval);
    if (i < 10) {
      rect(w.pos.x, 0, 9, w.pos.y);
    } else {
      rect(w.pos.x, w.pos.y, 9, 99 - w.pos.y);
    }
  });
  var p = vec(clamp(input.pos.x, 3, 96), 50);
  if (p.x < px - 2) {
    pmx = -1;
  } else if (p.x > px + 2) {
    pmx = 1;
  }
  px = p.x;
  color("black");
  if (char(addWithCharCode("a", floor(ticks % 60 / 30)), p, {
    mirror: {
      x: pmx
    }
  }).isColliding.rect.red) {
    play("lucky");
    end();
  }
  color(wallMode === "press" ? "yellow" : "light_yellow");
  coins = coins.filter(function (c) {
    c.pos.set(c.wall.pos.x + 5, c.wall.pos.y + c.wallOy);
    if (wallMode === "press" && c.pos.distanceTo(p) < 30) {
      inhalingCoins.push({
        pos: c.pos,
        speed: rnd(0.1, 0.3)
      });
      return false;
    }
    text("o", c.pos);
    return true;
  });
  color("yellow");
  inhalingCoins = inhalingCoins.filter(function (c) {
    c.pos.x += (p.x - c.pos.x) * c.speed;
    c.pos.y += (p.y - c.pos.y) * c.speed;
    var cl = text("o", c.pos).isColliding["char"];
    if (cl.a || cl.b) {
      play("coin");
      addScore(multiplier, c.pos);
      multiplier++;
      return false;
    }
    return true;
  });
}

