title = "PLASMA SPLITTER";
description = "\n[Hold] Stop\n";
characters = [];
options = {
  theme: "pixel",
  isPlayingBgm: true,
  isReplayEnabled: true,
  audioSeed: 50
};
var player;
var walls;
var nextWallDist;
var scrollingY;
var scrollingBaseSpeed = 0.2;
function update() {
  if (!ticks) {
    player = {
      pos: vec(50, 96),
      size: 8,
      isSplit: false,
      splitPos: 0,
      vx: 1
    };
    walls = [];
    nextWallDist = 0;
    scrollingY = scrollingBaseSpeed;
  }
  var sd = sqrt(difficulty);
  if (input.isPressed) {
    if (input.isJustPressed) {
      play("laser");
    }
    scrollingY += sd * 0.01;
  } else {
    if (input.isJustReleased) {
      play("hit");
      player.splitPos = player.pos.x;
    }
    scrollingY += (sd * scrollingBaseSpeed - scrollingY) * 0.1;
    player.pos.x += player.vx * sd;
    if (player.pos.x < player.size / 2 || player.pos.x > 100 - player.size / 2) {
      player.vx *= -1;
    }
  }
  color("light_blue");
  rect(player.pos.x, player.pos.y - 2, player.splitPos - player.pos.x, 2);
  color("yellow");
  times(2, function () {
    drawLightning(player.pos.x, player.pos.y, player.splitPos, player.pos.y, 2);
  });
  color("cyan");
  box(player.splitPos, player.pos.y, player.size);
  box(player.pos.x, player.pos.y, player.size);
  nextWallDist -= scrollingY;
  if (nextWallDist < 0) {
    var gapCount = [1, 2, 2, 3, 3, 3][rndi(6)];
    var gaps = [];
    var gx = 0;
    for (var i = 0; i < gapCount; i++) {
      var gw = player.size * 3;
      gx += rnd(i > 0 ? 10 : 0, 100 - gx - gw - (gapCount - i - 1) * (gw + 10));
      gaps.push({
        start: gx,
        end: gx + gw
      });
      gx += gw;
    }
    walls.push({
      pos: vec(0, -3),
      gaps: gaps
    });
    nextWallDist = rnd(50, 80);
  }
  color("blue");
  remove(walls, function (w) {
    w.pos.y += scrollingY;
    var wx = 0;
    var isDestroyed = false;
    w.gaps.forEach(function (g) {
      var c = rect(wx, w.pos.y, g.start - wx, 3).isColliding.rect;
      if (c.cyan) {
        play("explosion");
        end();
      } else if (c.light_blue) {
        isDestroyed = true;
        var dw = g.start - wx;
        var dx = wx + dw / 2;
        play("powerUp");
        particle(dx, w.pos.y, {
          count: 9,
          speed: 2
        });
        addScore(floor(scrollingY / scrollingBaseSpeed * dw), dx, w.pos.y);
      }
      wx = g.end;
    });
    if (rect(wx, w.pos.y, 100 - wx, 3).isColliding.rect.cyan) {
      play("explosion");
      end();
    }
    if (isDestroyed) {
      return true;
    }
    return w.pos.y > 103;
  });
}
function drawLightning(x1, y1, x2, y2, divisionCount) {
  if (divisionCount === 0) {
    line(x1, y1, x2, y2, 2);
    return;
  }
  var midX = (x1 + x2) / 2 + rnds(3);
  var midY = (y1 + y2) / 2 + rnds(3);
  drawLightning(x1, y1, midX, midY, divisionCount - 1);
  drawLightning(midX, midY, x2, y2, divisionCount - 1);
}

