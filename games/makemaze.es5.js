title = "MAKE MAZE";
description = "\n[Tap][Slide]\n Add/Remove wall\n";
characters = ["\nllll l\nllll l\n\nll lll\nll lll\n\n", "\n  ll\n  lll\nllllll\nllllll\n  lll\n  ll\n", "\n  ll\n l ll\nl llll\nllllll\n llll\n  ll\n"];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  isDrawingScoreFront: true,
  seed: 30
};
var walls;
var wallOfs;
var wallFills;
var pwp;
var enemies;
var nextEnemyTicks;
var golds;
var goldMinY;
var missScr;
var multiplier;
var wallSize = vec(16, 18);
var angleOfs = [vec(1, 0), vec(1, 1), vec(0, 1), vec(-1, 1), vec(-1, 0), vec(-1, -1), vec(0, -1), vec(1, -1)];
function update() {
  if (!ticks) {
    walls = times(wallSize.x, function (x) {
      return times(wallSize.y, function (y) {
        return x === 0 || x === 15 || y === 10 && (x === 1 || x === 14) || y === 12 && x > 1 && x < 14 || y === 14 && (x < 7 || x > 8);
      });
    });
    wallOfs = vec(5, -2);
    wallFills = times(wallSize.x, function (x) {
      return times(wallSize.y, function (y) {
        return false;
      });
    });
    pwp = vec();
    enemies = [];
    nextEnemyTicks = 0;
    golds = [];
    goldMinY = 99;
    missScr = 0;
    multiplier = 1;
  }
  var scr = 0.01 * sqrt(difficulty) + missScr;
  missScr *= 0.9;
  var gy = goldMinY * 6 + wallOfs.y;
  if (gy > 50) {
    scr += (gy - 50) * 0.02 * sqrt(difficulty);
  }
  wallOfs.y -= scr;
  enemies.forEach(function (e) {
    e.scPos.y -= scr;
  });
  if (wallOfs.y < -2) {
    for (var y = 1; y < wallSize.y; y++) {
      for (var x = 0; x < wallSize.x; x++) {
        walls[x][y - 1] = walls[x][y];
      }
    }
    for (var _x = 0; _x < wallSize.x; _x++) {
      walls[_x][wallSize.y - 1] = _x === 0 || _x === 15;
    }
    golds.push(vec(rndi(1, wallSize.x - 1), wallSize.y - 1));
    wallOfs.y += 6;
    enemies.forEach(function (e) {
      e.pos.y--;
    });
    golds.forEach(function (g) {
      g.y--;
    });
    pwp.y--;
  }
  if (input.isPressed) {
    var wp = vec(input.pos).sub(wallOfs.x - 3, wallOfs.y - 3).div(6).floor();
    if (wp.x > 0 && wp.x < wallSize.x - 1 && wp.y >= 0 && wp.y < wallSize.y && !wp.equals(pwp) && !checkGold(wp)) {
      play("select");
      walls[wp.x][wp.y] = !walls[wp.x][wp.y];
      pwp.set(wp);
    }
  } else {
    pwp.set();
  }
  color("light_purple");
  for (var _y = 0; _y < wallSize.y; _y++) {
    for (var _x2 = 0; _x2 < wallSize.x; _x2++) {
      if (walls[_x2][_y]) {
        char("a", wallOfs.x + _x2 * 6, wallOfs.y + _y * 6);
      }
    }
  }
  nextEnemyTicks--;
  if (nextEnemyTicks < 0) {
    var _x3;
    for (var i = 0; i < 99; i++) {
      _x3 = rndi(1, wallSize.x - 1);
      if (!walls[_x3][0]) {
        break;
      }
    }
    var pos = vec(_x3, 0);
    enemies.push({
      pos: pos,
      angle: 2,
      angleVel: rndi(2) * 2 - 1,
      scPos: vec(wallOfs.x + pos.x * 6, wallOfs.y + pos.y * 6),
      moveInterval: ceil(60 / sqrt(difficulty)),
      ticks: 0,
      isAngry: false
    });
    nextEnemyTicks = 150 / sqrt(difficulty);
  }
  remove(enemies, function (e) {
    e.ticks--;
    if (e.ticks < 0) {
      var pp = vec(e.pos);
      removeGold(e.pos);
      var isMoving = false;
      if (!checkDownExit(e.pos)) {
        e.isAngry = true;
        e.angle = 2;
        e.pos.y++;
        removeGold(e.pos);
        if (walls[e.pos.x][e.pos.y]) {
          play("powerUp");
          walls[e.pos.x][e.pos.y] = false;
        }
      } else {
        e.isAngry = false;
        for (var _i = 0; _i < 99; _i++) {
          if (getWall(e.pos, e.angle) || getWall(e.pos, e.angle + e.angleVel * 2) || getWall(e.pos, e.angle + e.angleVel * 3) || getWall(e.pos, e.angle + e.angleVel * 4) || e.pos.y < 0 || e.pos.y >= wallSize.y) {
            break;
          }
          e.pos.add(angleOfs[e.angle]);
          removeGold(e.pos);
          isMoving = true;
        }
        if (e.pos.y < 0 || e.pos.y >= wallSize.y) {
          isMoving = true;
        }
        for (var _i2 = 0; _i2 < (isMoving ? 0 : 99); _i2++) {
          var a = wrap(e.angle + e.angleVel * 2, 0, 8);
          for (var j = 0; j < 4; j++) {
            if (!getWall(e.pos, a)) {
              if (_i2 > 0 && a !== e.angle) {
                break;
              }
              e.pos.add(angleOfs[a]);
              removeGold(e.pos);
              e.angle = a;
              break;
            }
            a = wrap(a - e.angleVel * 2, 0, 8);
          }
          if (a !== e.angle || e.pos.y < 0 || e.pos.y >= wallSize.y) {
            break;
          }
        }
      }
      if (pp.distanceTo(e.pos) > 1) {
        play("hit");
      }
      e.ticks = e.moveInterval;
    }
    e.scPos.add(vec(wallOfs.x + e.pos.x * 6, wallOfs.y + e.pos.y * 6).sub(e.scPos).mul(0.1));
    color(e.isAngry ? "red" : e.angleVel < 0 ? "blue" : "purple");
    char("b", e.scPos, {
      rotation: wrap(e.angle / 2, 0, 4)
    });
    if (e.pos.y >= wallSize.y) {
      play("explosion");
      missScr++;
      if (multiplier > 1) {
        multiplier--;
      }
      addScore(-multiplier, e.scPos.x, 99);
      particle(e.scPos.x, 110, 19, 2, -PI / 2, -PI / 8);
    }
    return e.pos.y < 0 || e.pos.y >= wallSize.y;
  });
  goldMinY = 99;
  golds.forEach(function (g) {
    walls[g.x][g.y] = false;
    var x = wallOfs.x + g.x * 6;
    var y = wallOfs.y + g.y * 6;
    color(y < 30 ? "red" : "yellow");
    char("c", x, y);
    if (g.y < goldMinY) {
      goldMinY = g.y;
    }
    if (y < 0) {
      play("lucky");
      text("X", x, 3);
      end();
    }
  });
}
function getWall(cp, ta) {
  var p = vec(cp).add(angleOfs[wrap(ta, 0, 8)]);
  if (p.y < 0 || p.y >= wallSize.y) {
    return false;
  }
  return walls[p.x][p.y];
}
function removeGold(p) {
  color("yellow");
  remove(golds, function (g) {
    if (p.equals(g)) {
      play("coin");
      addScore(multiplier, wallOfs.x + g.x * 6, wallOfs.y + g.y * 6);
      particle(wallOfs.x + g.x * 6, wallOfs.y + g.y * 6);
      multiplier++;
      return true;
    }
  });
}
function checkGold(p) {
  var exists = false;
  golds.forEach(function (g) {
    if (p.equals(g)) {
      exists = true;
    }
  });
  return exists;
}
function checkDownExit(p) {
  for (var x = 1; x < wallSize.x - 1; x++) {
    for (var y = 0; y < wallSize.y; y++) {
      wallFills[x][y] = false;
    }
  }
  wallFills[p.x][p.y] = true;
  for (var i = 0; i < 9; i++) {
    for (var _x4 = 1; _x4 < wallSize.x - 1; _x4++) {
      for (var _y2 = 1; _y2 < wallSize.y; _y2++) {
        if (!walls[_x4][_y2] && !wallFills[_x4][_y2] && (wallFills[_x4 - 1][_y2] || wallFills[_x4][_y2 - 1])) {
          if (_y2 === wallSize.y - 1) {
            return true;
          }
          wallFills[_x4][_y2] = true;
        }
      }
    }
    for (var _x5 = wallSize.x - 2; _x5 > 0; _x5--) {
      for (var _y3 = wallSize.y - 2; _y3 >= 0; _y3--) {
        if (!walls[_x5][_y3] && !wallFills[_x5][_y3] && (wallFills[_x5 + 1][_y3] || wallFills[_x5][_y3 + 1])) {
          wallFills[_x5][_y3] = true;
        }
      }
    }
  }
  return false;
}

