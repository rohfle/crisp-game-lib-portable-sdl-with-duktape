title = "SQUARE BAR";
description = "\n[Hold] Grow\n";
characters = [];
options = {
  theme: "dark",
  isPlayingBgm: true,
  isReplayEnabled: true,
  isDrawingScoreFront: true,
  seed: 3
};
var bars;
var items;
var squareSize = 40;
var angleToXy = [[1, 0], [0, 1], [-1, 0], [0, -1]];
var cp = vec(50, 50);
var multiplier;
function update() {
  if (!ticks) {
    bars = [{
      pos: vec(50, 50 - squareSize / 2 - 1),
      length: 9,
      spRatio: 0,
      angle: 3,
      tAngle: 0,
      type: "player"
    }, {
      pos: vec(50, 50 + squareSize / 2 + 1),
      length: 12,
      spRatio: 0,
      angle: 1,
      tAngle: 2,
      type: "enemy"
    }];
    items = [];
    times(3, function () {
      addItem("spike");
    });
    times(7, function () {
      addItem("gold");
    });
    multiplier = 1;
  }
  color("light_black");
  box(cp, squareSize);
  var isChased = false;
  if (wrap(cp.angleTo(bars[0].pos) - cp.angleTo(bars[1].pos), -PI, PI) > 0) {
    isChased = true;
  }
  if (input.isJustPressed) {
    play("select");
  }
  remove(bars, function (b) {
    if (b.type === "player") {
      if (input.isPressed) {
        b.length += (20 + sqrt(difficulty) * 9 - b.length) * 0.1;
      } else {
        b.length += (9 - b.length) * 0.2;
      }
    } else {
      b.length = 11 + sqrt(difficulty) * 4;
    }
    b.angle = wrap(b.angle + 0.03 * difficulty, 0, 4);
    if (b.angle >= b.tAngle && b.angle < b.tAngle + PI / 4) {
      play("hit");
      b.angle = b.tAngle;
      var xy = angleToXy[b.angle];
      var np = vec(xy[0], xy[1]).mul(b.length * (1 - b.spRatio)).add(b.pos);
      switch (b.angle) {
        case 0:
          if (np.x > 50 + squareSize / 2 + 1) {
            b.tAngle = 1;
            b.spRatio = 1 - (np.x - (50 + squareSize / 2 + 1)) / b.length;
            b.pos.set(50 + squareSize / 2 + 1, 50 - squareSize / 2 - 1);
          } else {
            b.angle = 2;
            b.spRatio = 0;
            b.pos.set(np);
          }
          break;
        case 1:
          if (np.y > 50 + squareSize / 2 + 1) {
            b.tAngle = 2;
            b.spRatio = 1 - (np.y - (50 + squareSize / 2 + 1)) / b.length;
            b.pos.set(50 + squareSize / 2 + 1, 50 + squareSize / 2 + 1);
          } else {
            b.angle = 3;
            b.spRatio = 0;
            b.pos.set(np);
          }
          break;
        case 2:
          if (np.x < 50 - squareSize / 2 - 1) {
            b.tAngle = 3;
            b.spRatio = 1 - (50 - squareSize / 2 - 1 - np.x) / b.length;
            b.pos.set(50 - squareSize / 2 - 1, 50 + squareSize / 2 + 1);
          } else {
            b.angle = 0;
            b.spRatio = 0;
            b.pos.set(np);
          }
          break;
        case 3:
          if (np.y < 50 - squareSize / 2 - 1) {
            b.tAngle = 0;
            b.spRatio = 1 - (50 - squareSize / 2 - 1 - np.y) / b.length;
            b.pos.set(50 - squareSize / 2 - 1, 50 - squareSize / 2 - 1);
          } else {
            b.angle = 1;
            b.spRatio = 0;
            b.pos.set(np);
          }
          break;
      }
    }
    color(b.type === "player" ? "green" : isChased ? "red" : "yellow");
    var c = bar(b.pos, b.length, 3, b.angle * PI / 2, b.spRatio).isColliding.rect;
    if (b.type === "enemy" && c.green) {
      if (isChased) {
        play("explosion");
        end();
      } else {
        play("powerUp");
        addScore(10 * multiplier, b.pos);
        multiplier++;
        var ps = [vec(50, 50 - squareSize / 2 - 1), vec(50 + squareSize / 2 + 1, 50), vec(50, 50 + squareSize / 2 - 1), vec(50 - squareSize / 2 + 1, 50)];
        var ta = wrap(bars[0].tAngle + 2, 0, 4);
        bars.push({
          pos: ps[ta],
          length: 12,
          spRatio: 0,
          angle: wrap(ta - 1, 0, 4),
          tAngle: ta,
          type: "enemy"
        });
        return true;
      }
    }
  });
  remove(items, function (i) {
    if (i.ticks < 60) {
      if (i.ticks % 15 === 0) {
        i.size--;
      }
    } else if (i.size < 4 && i.ticks % 15 === 0) {
      i.size++;
    }
    color(i.type === "spike" ? "red" : "yellow");
    var c = box(i.pos, i.size).isColliding.rect;
    if (c.green) {
      if (i.type === "spike") {
        if (i.size === 4) {
          play("explosion");
          end();
        }
      } else {
        play("coin");
        addScore(multiplier, i.pos);
        addItem("gold");
        return true;
      }
    }
    i.ticks--;
    if (i.ticks < 0 || c.red || c.yellow) {
      addItem(i.type);
      return true;
    }
  });
  function addItem(type) {
    var pos;
    for (var i = 0; i < 99; i++) {
      pos = vec(rnd(50 - squareSize / 2 - 1 - 20, 50 + squareSize / 2), rnd(50 - squareSize / 2 - 1 - 20, 50 - squareSize / 2 - (type === "spike" ? 15 : 4))).sub(cp).rotate(rndi(4) * PI / 2).add(cp);
      if (pos.distanceTo(bars[0].pos) > 36) {
        break;
      }
    }
    items.push({
      pos: pos,
      type: type,
      ticks: floor(rnd(777, 999) / sqrt(difficulty)),
      size: 0
    });
  }
}

