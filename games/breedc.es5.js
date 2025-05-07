title = "BREED C";
description = "\n[Tap] \n Erase blocks\n (4 or more \n  linked)\n";
characters = [];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  isDrawingScoreFront: true,
  seed: 1
};
var grid;
var prevGrid;
var erasingGrid;
var erasingTicks;
var erasingCount;
var nextGridTicks;
var nextGridCount;
var pressedTicks;
var multiplier;
var gridSize = 15;
var colorCount = 4;
var colors = ["red", "green", "blue", "yellow"];
function update() {
  var cgp = floor(gridSize / 2);
  if (!ticks) {
    grid = times(gridSize, function () {
      return times(gridSize, function () {
        return -1;
      });
    });
    prevGrid = times(gridSize, function () {
      return times(gridSize, function () {
        return -1;
      });
    });
    erasingGrid = times(gridSize, function () {
      return times(gridSize, function () {
        return false;
      });
    });
    nextGridTicks = 0;
    nextGridCount = 0;
    erasingTicks = 0;
    multiplier = 1;
  }
  var ip = vec(floor((input.pos.x - 50) / 6 + gridSize / 2), floor((input.pos.y - 53) / 6 + gridSize / 2));
  if (ip.isInRect(0, 0, gridSize, gridSize)) {
    color("light_black");
    box((ip.x - gridSize / 2) * 6 + 53, (ip.y - gridSize / 2) * 6 + 56, 7);
  }
  erasingTicks--;
  if (erasingTicks >= 0) {
    if (erasingTicks === 0) {
      for (var i = 0; i < 99; i++) {
        var dc = erasingCount % 2 === 0 ? downHorizontal() + downVertical() : downVertical() + downHorizontal();
        if (dc === 0) {
          break;
        }
      }
      nextGridTicks = 120 / sqrt(difficulty);
      erasingCount++;
    }
    drawGrid();
    return;
  }
  if (grid[cgp][cgp] < 0) {
    grid[cgp][cgp] = rndi(colorCount);
  }
  if (input.isJustPressed) {
    if (ip.isInRect(0, 0, gridSize, gridSize) && grid[ip.x][ip.y] >= 0) {
      times(gridSize, function (x) {
        return times(gridSize, function (y) {
          erasingGrid[x][y] = false;
        });
      });
      erasingGrid[ip.x][ip.y] = true;
      var tec = 1;
      for (var _i = 0; _i < 99; _i++) {
        var ec = checkErasingDown() + checkErasingUp();
        tec += ec;
        if (ec === 0) {
          break;
        }
      }
      if (tec < 4) {
        play("hit");
        addScore(-tec, input.pos);
        addGrid();
        addGrid();
      } else {
        play("powerUp");
        addScore(tec * multiplier, input.pos);
        multiplier++;
        for (var x = 0; x < gridSize; x++) {
          for (var y = 0; y < gridSize; y++) {
            if (erasingGrid[x][y]) {
              grid[x][y] = -1;
            }
          }
        }
        erasingTicks = ceil(60 / sqrt(difficulty));
        drawGrid();
        return;
      }
    } else {
      addGrid();
      addGrid();
    }
  }
  nextGridTicks--;
  if (nextGridTicks < 0) {
    addGrid();
  }
  if (drawGrid() >= gridSize * gridSize) {
    play("explosion");
    end();
  }
  function drawGrid() {
    color("black");
    text("x".concat(multiplier), 3, 9);
    var gc = 0;
    times(gridSize, function (x) {
      return times(gridSize, function (y) {
        var c = grid[x][y];
        if (c >= 0) {
          color(colors[c]);
          box(53 + (x - gridSize / 2) * 6, 56 + (y - gridSize / 2) * 6, 5);
          gc++;
        }
      });
    });
    return gc;
  }
  function addGrid() {
    play("coin");
    multiplier = 1;
    times(gridSize, function (x) {
      return times(gridSize, function (y) {
        prevGrid[x][y] = grid[x][y];
      });
    });
    if (nextGridCount % 2 === 0) {
      addHorizontal();
    } else {
      addVertical();
    }
    nextGridCount++;
    nextGridTicks = 120 / sqrt(difficulty);
  }
  function addHorizontal() {
    var cx = floor(gridSize / 2);
    var _loop = function _loop(_x) {
      times(gridSize, function (y) {
        grid[_x][y] = prevGrid[_x + 1][y];
      });
    };
    for (var _x = 0; _x < cx - 1; _x++) {
      _loop(_x);
    }
    var _loop2 = function _loop2(_x2) {
      times(gridSize, function (y) {
        grid[_x2][y] = prevGrid[_x2 - 1][y];
      });
    };
    for (var _x2 = gridSize - 1; _x2 > cx + 1; _x2--) {
      _loop2(_x2);
    }
    times(gridSize, function (y) {
      var c = prevGrid[cx][y];
      if (c >= 0) {
        var nx = rnd() < 0.5 ? -1 : 1;
        var nc = wrap(c + rndi(colorCount - 1), 0, colorCount);
        grid[cx + nx][y] = nc;
        grid[cx][y] = nc;
        grid[cx - nx][y] = c;
      }
    });
  }
  function addVertical() {
    var cy = floor(gridSize / 2);
    var _loop3 = function _loop3(_y) {
      times(gridSize, function (x) {
        grid[x][_y] = prevGrid[x][_y + 1];
      });
    };
    for (var _y = 0; _y < cy - 1; _y++) {
      _loop3(_y);
    }
    var _loop4 = function _loop4(_y2) {
      times(gridSize, function (x) {
        grid[x][_y2] = prevGrid[x][_y2 - 1];
      });
    };
    for (var _y2 = gridSize - 1; _y2 > cy + 1; _y2--) {
      _loop4(_y2);
    }
    times(gridSize, function (x) {
      var c = prevGrid[x][cy];
      if (c >= 0) {
        var ny = rnd() < 0.5 ? -1 : 1;
        var nc = wrap(c + rndi(colorCount - 1), 0, colorCount);
        grid[x][cy + ny] = nc;
        grid[x][cy] = nc;
        grid[x][cy - ny] = c;
      }
    });
  }
  function downHorizontal() {
    var dc = 0;
    var cx = floor(gridSize / 2);
    var _loop5 = function _loop5(_x3) {
      times(gridSize, function (y) {
        if (grid[_x3][y] === -1 && grid[_x3 - 1][y] >= 0) {
          grid[_x3][y] = grid[_x3 - 1][y];
          grid[_x3 - 1][y] = -1;
          dc++;
        }
      });
    };
    for (var _x3 = cx; _x3 >= 1; _x3--) {
      _loop5(_x3);
    }
    var _loop6 = function _loop6(_x4) {
      times(gridSize, function (y) {
        if (grid[_x4][y] === -1 && grid[_x4 + 1][y] >= 0) {
          grid[_x4][y] = grid[_x4 + 1][y];
          grid[_x4 + 1][y] = -1;
          dc++;
        }
      });
    };
    for (var _x4 = cx; _x4 <= gridSize - 2; _x4++) {
      _loop6(_x4);
    }
    return dc;
  }
  function downVertical() {
    var dc = 0;
    var cy = floor(gridSize / 2);
    var _loop7 = function _loop7(_y3) {
      times(gridSize, function (x) {
        if (grid[x][_y3] === -1 && grid[x][_y3 - 1] >= 0) {
          grid[x][_y3] = grid[x][_y3 - 1];
          grid[x][_y3 - 1] = -1;
          dc++;
        }
      });
    };
    for (var _y3 = cy; _y3 > -1; _y3--) {
      _loop7(_y3);
    }
    var _loop8 = function _loop8(_y4) {
      times(gridSize, function (x) {
        if (grid[x][_y4] === -1 && grid[x][_y4 + 1] >= 0) {
          grid[x][_y4] = grid[x][_y4 + 1];
          grid[x][_y4 + 1] = -1;
          dc++;
        }
      });
    };
    for (var _y4 = cy; _y4 <= gridSize - 2; _y4++) {
      _loop8(_y4);
    }
    return dc;
  }
  function checkErasingDown() {
    var ec = 0;
    for (var _x5 = 0; _x5 < gridSize; _x5++) {
      for (var _y5 = 0; _y5 < gridSize; _y5++) {
        if (!erasingGrid[_x5][_y5]) {
          continue;
        }
        var c = grid[_x5][_y5];
        if (_x5 < gridSize - 1 && !erasingGrid[_x5 + 1][_y5] && grid[_x5 + 1][_y5] === c) {
          erasingGrid[_x5 + 1][_y5] = true;
          ec++;
        }
        if (_y5 < gridSize - 1 && !erasingGrid[_x5][_y5 + 1] && grid[_x5][_y5 + 1] === c) {
          erasingGrid[_x5][_y5 + 1] = true;
          ec++;
        }
      }
    }
    return ec;
  }
  function checkErasingUp() {
    var ec = 0;
    for (var _x6 = gridSize - 1; _x6 >= 0; _x6--) {
      for (var _y6 = gridSize - 1; _y6 >= 0; _y6--) {
        if (!erasingGrid[_x6][_y6]) {
          continue;
        }
        var c = grid[_x6][_y6];
        if (_x6 > 0 && !erasingGrid[_x6 - 1][_y6] && grid[_x6 - 1][_y6] === c) {
          erasingGrid[_x6 - 1][_y6] = true;
          ec++;
        }
        if (_y6 > 0 && !erasingGrid[_x6][_y6 - 1] && grid[_x6][_y6 - 1] === c) {
          erasingGrid[_x6][_y6 - 1] = true;
          ec++;
        }
      }
    }
    return ec;
  }
}

