title = "SUM TEN";
description = "\n[Tap] Forward\n";
characters = [];
options = {
  viewSize: {
    x: 150,
    y: 100
  },
  isPlayingBgm: true,
  isReplayEnabled: true,
  isDrawingScoreFront: true,
  seed: 8
};
var grid;
var gridPos;
var cursor;
var numbers;
var showingSumTicks;
var gridCount = 10;
var gridSize = 11;
var angleOfs = [vec(-1, 0), vec(0, -1)];
function update() {
  if (!ticks) {
    grid = times(gridCount, function (x) {
      return times(gridCount, function (y) {
        var iw = x > 6 || x > 0 && y !== 6;
        return {
          v: iw ? undefined : rndi(1, 10),
          isFilled: iw
        };
      });
    });
    [6, 5, 8, 1, 7, 3].forEach(function (v, i) {
      grid[1 + i][6].v = v;
    });
    gridPos = vec(100, 0);
    cursor = {
      pos: vec(7, 6),
      angle: 0,
      ticks: 0
    };
    numbers = [[]];
    showingSumTicks = 0;
  }
  var np = vec();
  cursor.ticks++;
  if (cursor.ticks >= 30) {
    var pa = cursor.angle;
    cursor.angle = wrap(cursor.angle + 1, 0, 2);
    np.set(cursor.pos).add(angleOfs[cursor.angle]);
    if (grid[np.x][np.y].v == null) {
      cursor.angle = pa;
    }
    cursor.ticks = 0;
  }
  np.set(cursor.pos).add(angleOfs[cursor.angle]);
  times(gridCount, function (x) {
    return times(gridCount, function (y) {
      var g = grid[x][y];
      var c = x === cursor.pos.x && y === cursor.pos.y ? "cyan" : x === np.x && y === np.y ? "red" : "blue";
      color(c);
      var rx = gridPos.x - x * gridSize;
      var ry = gridPos.y + y * gridSize + 1;
      rect(rx, ry, gridSize - 1, gridSize - 1);
      color("white");
      if (!g.isFilled) {
        rect(rx + 1, ry + 1, gridSize - 3, gridSize - 3);
        color(c);
      }
      if (g.v != null) {
        text("".concat(g.v), round(gridPos.x - (x - 0.5) * gridSize) - 1, round(gridPos.y + (y + 0.5) * gridSize));
      }
      if (c === "cyan" && (rx < 0 || ry > 91)) {
        play("explosion");
        end();
      }
    });
  });
  color("white");
  rect(0, 0, 100, 10);
  rect(100, 0, 50, 100);
  if (input.isJustPressed) {
    play("select");
    cursor.pos.set(np);
    grid[np.x][np.y].isFilled = true;
    cursor.ticks = 0;
    var ns = numbers[numbers.length - 1];
    ns.push(grid[np.x][np.y].v);
    var _s = 0;
    ns.forEach(function (v) {
      _s += v;
    });
    if (_s % 10 === 0) {
      play("powerUp");
      numbers.push([]);
      var sc = _s / 10;
      addScore(sc * sc * 10, 133, 20 + ns.length * 8);
      if (showingSumTicks <= 0) {
        showingSumTicks = 60;
      }
    } else if (ns.length >= 10) {
      showingSumTicks = 60;
      while (numbers.length > 1) {
        numbers.shift();
      }
      play("explosion");
      end();
    }
    np.set(cursor.pos).add(angleOfs[cursor.angle]);
    if (grid[np.x][np.y].v == null) {
      cursor.angle = wrap(cursor.angle + 1, 0, 2);
    }
  }
  var sum = 0;
  var y = 12;
  color("black");
  numbers[0].forEach(function (n) {
    text("".concat(n), 135, y);
    sum += n;
    y += 8;
  });
  if (sum > 0) {
    text("+)", 110, y - 8);
    rect(115, y - 5, 30, 1);
  }
  if (showingSumTicks > 0) {
    text("".concat(sum), 135 - 6, y);
    showingSumTicks--;
    if (showingSumTicks === 0) {
      numbers.shift();
      if (numbers.length > 1) {
        showingSumTicks = 60;
      }
    }
  }
  if (cursor.pos.x < 7) {
    gridPos.x -= (7 - cursor.pos.x) * 0.5;
  }
  if (cursor.pos.y < 6) {
    gridPos.y += (6 - cursor.pos.y) * 0.5;
  }
  var s = sqrt(difficulty) * 0.01;
  gridPos.sub(s, -s);
  if (gridPos.x <= 90) {
    for (var x = gridCount - 1; x >= 0; x--) {
      var wi = rndi(1, gridCount * 1.5);
      for (var _y = 0; _y < gridCount; _y++) {
        if (x > 0) {
          grid[x][_y] = grid[x - 1][_y];
        } else {
          var isFilled = _y === wi && !grid[x + 1][_y - 1].isFilled;
          grid[x][_y] = {
            v: isFilled ? undefined : rndi(1, 10),
            isFilled: isFilled
          };
        }
      }
    }
    gridPos.x += 10;
    cursor.pos.x++;
  }
  if (gridPos.y >= 10) {
    for (var _y2 = gridCount - 1; _y2 >= 0; _y2--) {
      var _wi = rndi(1, gridCount * 1.5);
      for (var _x = 0; _x < gridCount; _x++) {
        if (_y2 > 0) {
          grid[_x][_y2] = grid[_x][_y2 - 1];
        } else {
          var _isFilled = _x === _wi && !grid[_x - 1][_y2 + 1].isFilled;
          grid[_x][_y2] = {
            v: _isFilled ? undefined : rndi(1, 10),
            isFilled: _isFilled
          };
        }
      }
    }
    gridPos.y -= 10;
    cursor.pos.y++;
  }
}

