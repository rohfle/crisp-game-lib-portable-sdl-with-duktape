title = "MARUSANSI";
description = "\n   Tap\nto start\n";
characters = ["\n rrr\nrRRRr\nrRRRr\nrRRRr\n rrr\n", "\n  g\n gGg\n gGg\ngGGGg\nggggg\n", "\nbbbbb\nbBBBb\nbBBBb\nbBBBb\nbbbbb\n", "\n RRR\nR   R\nR   R\nR   R\n RRR\n", "\n  G\n G G\n G G\nG   G\nGGGGG\n", "\nBBBBB\nB   B\nB   B\nB   B\nBBBBB\n", "\n  l\n lll\nl l l\n  l\n  l\n", "\n  l\n  l\nl l l\n lll\n  l\n"];
options = {
  viewSize: {
    x: 80,
    y: 80
  },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 9
};
var gridSize = vec(6, 12);
var grid;
var gridHeight;
var hGrid;
var vGrid;
var sGrid;
var blocks;
var nextRow;
var nextRowTicks;
var chainingTicks;
var fallingTicks;
var multiplier;
var message;
var messageTicks;
var startTicks;
function update() {
  if (!ticks) {
    grid = times(gridSize.x, function () {
      return times(gridSize.y, function () {
        return 0;
      });
    });
    gridHeight = times(gridSize.x, function () {
      return 0;
    });
    hGrid = times(gridSize.x, function () {
      return times(gridSize.y, function () {
        return 0;
      });
    });
    vGrid = times(gridSize.x, function () {
      return times(gridSize.y, function () {
        return 0;
      });
    });
    sGrid = times(gridSize.x, function () {
      return times(gridSize.y, function () {
        return false;
      });
    });
    blocks = times(2, function (i) {
      return i + 1;
    });
    nextRow = times(gridSize.x, function () {
      return 0;
    });
    nextRowTicks = 0;
    calcGridHeight();
    setNextRow();
    chainingTicks = fallingTicks = 0;
    multiplier = 1;
    message = "";
    messageTicks = 0;
    startTicks = isReplaying ? 0 : 270;
  }
  color("light_black");
  rect(20, gridSize.y * 6, 40, 1);
  color("black");
  var chainingIndex = chainingTicks > 0 ? floor(chainingTicks / 5) : 0;
  times(gridSize.x, function (x) {
    return times(gridSize.y, function (y) {
      var g = grid[x][y];
      if (g === 0) {
        return;
      }
      var p = calcPixelPosition(x, y);
      var vh = vGrid[x][y] > 0 ? vGrid[x][y] : hGrid[x][y];
      if (sGrid[x][y] || vh > 0) {
        color("yellow");
        box(p.x, p.y, 6, 6);
        color("black");
      }
      if (vh > 0) {
        if (vh === chainingIndex) {
          play("coin");
        } else if (vh < chainingIndex) {
          var cg = (vh - 1) % 3 + 1;
          char(addWithCharCode("a", cg - 1), p.x, p.y);
        } else {
          char(addWithCharCode("d", g - 1), p.x, p.y);
        }
      } else {
        char(addWithCharCode("a", g - 1), p.x, p.y);
      }
    });
  });
  if (messageTicks > 0) {
    messageTicks--;
    text(message, 3, 9);
  }
  if (fallingTicks > 0) {
    fallingTicks++;
    if (fallingTicks % 5 === 0) {
      if (!fallBlocks()) {
        fallingTicks = 0;
        nextRowTicks = 0;
        calcGridHeight();
        checkGridSequence();
        setNextRow();
      }
    }
    return;
  }
  if (chainingTicks > 0) {
    chainingTicks++;
    if (chainingTicks > 50) {
      chainingTicks = 0;
      changeSequence();
      checkGridSequence();
      if (chainingTicks === 0 || multiplier >= 32) {
        chainingTicks = 0;
        clearSequence();
      }
    }
    return;
  }
  var bx = -1;
  var hasPlace = false;
  times(gridSize.x, function (x) {
    var h = gridHeight[x];
    if (h < gridSize.y - 1) {
      hasPlace = true;
      var p = calcPixelPosition(x, h + 1);
      var isSelected = input.pos.x >= p.x - 3 && input.pos.x < p.x + 3 && input.pos.y >= p.y - 3 && input.pos.y < p.y + 9;
      blocks.forEach(function (b, i) {
        if (!isSelected) {
          color("light_black");
        }
        char(addWithCharCode("d", b - 1), p.x, p.y + i * 6);
        color("black");
      });
      if (isSelected) {
        bx = x;
      }
    }
  });
  if (!hasPlace) {
    play("explosion");
    color("white");
    rect(20, 0, 40, 6);
    rect(20, 30, 40, 20);
    color("black");
    end();
    return;
  }
  var isNextRowSelected = input.pos.y >= gridSize.y * 6;
  color("light_purple");
  nextRowTicks += sqrt(sqrt(difficulty));
  rect(20, 80, 40, -nextRowTicks / 50);
  color("black");
  times(gridSize.x, function (x) {
    var p = calcPixelPosition(x, -1);
    char(addWithCharCode(isNextRowSelected ? "a" : "d", nextRow[x] - 1), p.x, p.y);
  });
  if (nextRowTicks > 400) {
    addNextRow();
    return;
  }
  if (input.isJustPressed) {
    if (isNextRowSelected) {
      addNextRow();
    } else if (bx >= 0) {
      play("select");
      var y = gridHeight[bx];
      grid[bx][y + 1] = blocks[0];
      grid[bx][y] = blocks[1];
      multiplier = 1;
      setNextBlock();
      calcGridHeight();
      checkGridSequence();
    } else {
      play("click");
      var tb = blocks[0];
      blocks[0] = blocks[1];
      blocks[1] = tb;
    }
  }
  startTicks--;
  if (startTicks > 0) {
    text("Tap\nto", 3, 40);
    text("rotate", 26, 30);
    text("place", 26, 66);
    text("add", 26, 76);
    text("blo\ncks", 65, 40);
  }
}
function setNextBlock() {
  var pbs = [blocks[0], blocks[1]];
  times(2, function (i) {
    blocks[i] = rndi(1, 4);
  });
  if (blocks[0] === pbs[0] && blocks[1] === pbs[1]) {
    blocks[0] = blocks[0] % 3 + 1;
  }
}
function calcGridHeight() {
  times(gridSize.x, function (x) {
    var y = 0;
    for (; y < gridSize.y; y++) {
      if (grid[x][y] === 0) {
        break;
      }
    }
    gridHeight[x] = y;
  });
}
function checkGridSequence() {
  var existsSequence = false;
  var count = 0;
  times(gridSize.x, function (x) {
    return times(gridSize.y, function (y) {
      var g = grid[x][y];
      if (g === 0) {
        return;
      }
      if (hGrid[x][y] === 0 && x < gridSize.x - 2 && grid[x + 1][y] === g && grid[x + 2][y] === g) {
        existsSequence = true;
        var i = g;
        for (var gx = x; gx < gridSize.x; gx++) {
          i++;
          if ((i - 1) % 3 === g - 1) {
            i++;
          }
          if (grid[gx][y] !== g) {
            break;
          }
          hGrid[gx][y] = i;
          count++;
        }
      }
      if (vGrid[x][y] === 0 && y < gridSize.y - 2 && grid[x][y + 1] === g && grid[x][y + 2] === g) {
        existsSequence = true;
        var _i = g;
        for (var gy = y; gy < gridSize.y; gy++) {
          _i++;
          if ((_i - 1) % 3 === g - 1) {
            _i++;
          }
          if (grid[x][gy] !== g) {
            break;
          }
          vGrid[x][gy] = _i;
          count++;
        }
      }
    });
  });
  if (existsSequence) {
    var sc = count * multiplier;
    message = "".concat(count, "x").concat(multiplier, "=").concat(sc);
    messageTicks = 60;
    addScore(sc);
    chainingTicks = 1;
    multiplier++;
    play("powerUp");
  }
}
function changeSequence() {
  times(gridSize.x, function (x) {
    return times(gridSize.y, function (y) {
      var vh = vGrid[x][y] > 0 ? vGrid[x][y] : hGrid[x][y];
      if (vh > 0) {
        grid[x][y] = (vh - 1) % 3 + 1;
        sGrid[x][y] = true;
        vGrid[x][y] = hGrid[x][y] = 0;
      }
    });
  });
}
function clearSequence() {
  play("jump");
  var cs = ["", "red", "green", "blue"];
  times(gridSize.x, function (x) {
    return times(gridSize.y, function (y) {
      if (sGrid[x][y]) {
        color(cs[grid[x][y]]);
        var p = calcPixelPosition(x, y);
        particle(p.x, p.y);
        grid[x][y] = 0;
      }
    });
  });
  color("black");
  fallingTicks = 1;
}
function fallBlocks() {
  var isFalling = false;
  times(gridSize.x, function (x) {
    return times(gridSize.y, function (y) {
      if (sGrid[x][y]) {
        isFalling = true;
        for (var gy = y; gy < gridSize.y - 1; gy++) {
          grid[x][gy] = grid[x][gy + 1];
          sGrid[x][gy] = sGrid[x][gy + 1];
        }
        grid[x][gridSize.y - 1] = 0;
        sGrid[x][gridSize.y - 1] = false;
      }
    });
  });
  return isFalling;
}
function setNextRow() {
  play("laser");
  times(gridSize.x, function (x) {
    var cs = [];
    times(3, function (i) {
      var c = i + 1;
      if (grid[x][0] === c && grid[x][1] === c) {
        return;
      }
      if (x > 1 && nextRow[x - 1] === c && nextRow[x - 2] === c) {
        return;
      }
      cs.push(c);
    });
    if (cs.length === 0) {
      cs.push(rndi(1, 4));
    }
    nextRow[x] = cs[rndi(cs.length)];
  });
}
function addNextRow() {
  times(gridSize.x, function (x) {
    for (var y = gridSize.y - 1; y > 0; y--) {
      grid[x][y] = grid[x][y - 1];
    }
    grid[x][0] = nextRow[x];
  });
  setNextRow();
  calcGridHeight();
  nextRowTicks = 0;
}
var pixelPos = vec();
function calcPixelPosition(x, y) {
  pixelPos.set(40 - gridSize.x * 6 / 2 + x * 6 + 3, gridSize.y * 6 - y * 6 - 3);
  return pixelPos;
}
function drawLineRect(x, y, width, height) {
  rect(x, y, width, 1);
  rect(x, y + height - 1, width, 1);
  rect(x, y, 1, height);
  rect(x + width - 1, y, 1, height);
}

