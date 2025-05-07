title = "UD CAVE";
description = "\n[Hold] Go right\n";
characters = ["\n l\nlll\n l\nl l\n"];
options = {
  theme: "dark",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 5
};
var playerX;
var walls;
var nextWallDist;
var caves;
var golds;
var nextGoldDist;
var multiplier;
var wallHeight = 10;
function update() {
  if (!ticks) {
    playerX = 0;
    walls = [];
    nextWallDist = -50;
    caves = times(3, function (i) {
      return {
        x: 0,
        vx: 0,
        w: i > 0 ? 15 : 20,
        vw: 0
      };
    });
    golds = [];
    nextGoldDist = 5;
    multiplier = 1;
  }
  var vy = difficulty;
  nextWallDist -= vy;
  if (nextWallDist < 0) {
    addScore(multiplier);
    var c0 = caves[0];
    caves.forEach(function (c, i) {
      c.vx += rnds(2) * sqrt(difficulty);
      c.vw += rnds(1) * sqrt(difficulty);
      c.x += c.vx;
      c.w += c.vw;
      var minX = i === 0 ? -(17 - 7 / sqrt(difficulty)) : c0.x - c0.w;
      var maxX = i === 0 ? 17 - 7 / sqrt(difficulty) : c0.x + c0.w;
      if (c.x - c.w < minX && c.vx < 0 || c.x + c.w > maxX && c.vx > 0) {
        c.vx *= -0.5;
        c.x += c.vx;
      }
      var minW = i === 0 ? 5 + 5 / sqrt(difficulty) : caves[0].w;
      var maxW = i === 0 ? 7 + 7 / sqrt(difficulty) : 9 + 9 / sqrt(difficulty);
      if (c.w < minW && c.vw < 0 || c.w > maxW && c.vw > 0) {
        c.vw *= -0.5;
        c.w += c.vw;
      }
    });
    var _c = caves[1];
    var x11 = _c.x - _c.w + 25;
    var x12 = _c.x + _c.w + 25;
    if (x11 > 0) {
      walls.push({
        pos: vec(x11, -nextWallDist),
        width: -x11,
        vy: 1
      });
    }
    if (x12 < 50) {
      walls.push({
        pos: vec(x12, -nextWallDist),
        width: 50 - x12,
        vy: 1
      });
    }
    var _c2 = caves[2];
    var x21 = 75 - _c2.x - _c2.w;
    var x22 = 75 - _c2.x + _c2.w;
    if (x21 > 50) {
      walls.push({
        pos: vec(x21, 100 + nextWallDist),
        width: 50 - x21,
        vy: -1
      });
    }
    if (x22 < 100) {
      walls.push({
        pos: vec(x22, 100 + nextWallDist),
        width: 100 - x22,
        vy: -1
      });
    }
    nextGoldDist--;
    if (nextGoldDist < 0) {
      if (rnd() < 0.5) {
        golds.push({
          pos: vec(caves[1].x + rnds(caves[1].w * 0.8) + 25, -nextWallDist - wallHeight / 2),
          vy: 1
        });
      } else {
        golds.push({
          pos: vec(75 - caves[2].x + rnds(caves[2].w * 0.8), 100 + nextWallDist + wallHeight / 2),
          vy: -1
        });
      }
      nextGoldDist = rnd(3, 9);
    }
    nextWallDist += wallHeight;
  }
  color("red");
  remove(walls, function (w) {
    w.pos.y += w.vy * vy;
    rect(w.pos, w.width, (wallHeight - 1) * -w.vy);
    return w.vy > 0 ? w.pos.y > 100 + wallHeight : w.pos.y < -wallHeight;
  });
  playerX = clamp(playerX + (input.isPressed ? 1 : -1) * difficulty * 0.5, -25, 25);
  if (input.isJustPressed) {
    play("select");
  } else if (input.isJustReleased) {
    play("laser");
  }
  color("black");
  var c1 = char("a", playerX + 25, 90).isColliding.rect;
  var c2 = char("a", 75 - playerX, 10).isColliding.rect;
  if (c1.red || c2.red) {
    play("explosion");
    end();
  }
  color("yellow");
  remove(golds, function (g) {
    g.pos.y += g.vy * vy;
    var c = char("$", g.pos).isColliding;
    if (c.rect.red) {
      return true;
    }
    if (c["char"].a) {
      play("powerUp");
      multiplier++;
      return true;
    }
    return g.vy > 0 ? g.pos.y > 103 : g.pos.y < -3;
  });
  color("black");
  text("x".concat(multiplier), 3, 9);
}

