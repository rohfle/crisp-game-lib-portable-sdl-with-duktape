title = "MAGNET BLOCKS";
description = "\n[Drag]\nPlace magnet\n";
characters = [];
options = {
  isShowingTime: true,
  isPlayingBgm: true,
  seed: 7
};
var grid;
var blockGrid;
var blocks;
var blockIndex;
var blockBeginPos;
var blockEndPos;
var gridSize;
var isValidBeginPos;
var isValidEndPos;
var stageCount;
var solvedTicks;
var totalStageCount = 10;
var gridPos = vec();
var angleOffset = [vec(1, 0), vec(0, 1), vec(-1, 0), vec(0, -1)];
function update() {
  if (!ticks) {
    blockBeginPos = vec();
    blockEndPos = vec();
    stageCount = 0;
    goToNextStage();
  }
  color("light_black");
  rect(gridPos.x - 3, gridPos.y - 3, gridSize * 6 + 6, gridSize * 6 + 6);
  color("white");
  rect(gridPos.x - 1, gridPos.y - 1, gridSize * 6 + 2, gridSize * 6 + 2);
  times(gridSize, function (x) {
    return times(gridSize, function (y) {
      color(blockGrid[x][y] >= 0 ? "blue" : "black");
      text(grid[x][y], x * 6 + 3 + gridPos.x, y * 6 + 3 + gridPos.y);
    });
  });
  color("black");
  text("".concat(stageCount, "/").concat(totalStageCount), 3, 96);
  if (solvedTicks > 0) {
    solvedTicks++;
    text("SOLVED", 40, 96);
    if (solvedTicks > 60) {
      if (stageCount >= totalStageCount) {
        color("white");
        rect(0, 40, 100, 20);
        complete();
      } else {
        goToNextStage();
      }
    }
    return;
  }
  if (input.isJustPressed) {
    blockBeginPos.set(floor((input.pos.x - gridPos.x) / 6), floor((input.pos.y - gridPos.y) / 6));
    if (!blockBeginPos.isInRect(0, 0, gridSize, gridSize)) {
      blockBeginPos.x = -1;
      isValidBeginPos = false;
    } else if (grid[blockBeginPos.x][blockBeginPos.y] !== " ") {
      var bi = blockGrid[blockBeginPos.x][blockBeginPos.y];
      if (bi >= 0) {
        var b = blocks[bi];
        var tp = vec(b.p);
        times(b.l, function () {
          grid[tp.x][tp.y] = " ";
          tp.add(b.ao);
        });
        blockBeginPos.x = -1;
        play("click");
      }
      isValidBeginPos = false;
    } else {
      isValidBeginPos = !checkAroundPolars(blockBeginPos, "N", grid);
      if (isValidBeginPos) {
        play("select");
      }
    }
  }
  if (input.isPressed && blockBeginPos.x >= 0 && !isValidBeginPos) {
    color("red");
    text("X", blockBeginPos.x * 6 + 3 + gridPos.x, blockBeginPos.y * 6 + 3 + gridPos.y);
  }
  if (input.isPressed && blockBeginPos.x >= 0 && isValidBeginPos) {
    color("cyan");
    text("N", blockBeginPos.x * 6 + 3 + gridPos.x, blockBeginPos.y * 6 + 3 + gridPos.y);
    blockEndPos.set(floor((input.pos.x - gridPos.x) / 6), floor((input.pos.y - gridPos.y) / 6));
    if (!blockEndPos.isInRect(0, 0, gridSize, gridSize)) {
      blockEndPos.x = -1;
      isValidEndPos = false;
    } else if (blockBeginPos.x !== blockEndPos.x && blockBeginPos.y !== blockEndPos.y || blockBeginPos.distanceTo(blockEndPos) < 2 || checkGrid(blockEndPos, grid) !== " ") {
      isValidEndPos = false;
    } else {
      isValidEndPos = !checkAroundPolars(blockEndPos, "S", grid);
    }
    if (blockEndPos.x >= 0 && (blockBeginPos.x !== blockEndPos.x || blockBeginPos.y !== blockEndPos.y)) {
      color(isValidEndPos ? "cyan" : "red");
      text(isValidEndPos ? "S" : "X", blockEndPos.x * 6 + 3 + gridPos.x, blockEndPos.y * 6 + 3 + gridPos.y);
    }
  }
  if (input.isJustReleased && blockBeginPos.x >= 0 && blockEndPos.x >= 0 && isValidBeginPos && isValidEndPos) {
    var ao = vec(blockEndPos).sub(blockBeginPos);
    var l = ao.length + 1;
    ao.normalize();
    var p = vec(blockBeginPos);
    var existsBlock = false;
    times(l - 2, function () {
      p.add(ao);
      if (checkGrid(p, grid) !== " ") {
        existsBlock = true;
      }
    });
    if (!existsBlock) {
      play("hit");
      p.set(blockBeginPos);
      grid[p.x][p.y] = "N";
      blockGrid[p.x][p.y] = blockIndex;
      times(l - 2, function () {
        p.add(ao);
        grid[p.x][p.y] = ao.x === 0 ? "|" : "-";
        blockGrid[p.x][p.y] = blockIndex;
      });
      p.add(ao);
      grid[p.x][p.y] = "S";
      blockGrid[p.x][p.y] = blockIndex;
      blocks.push({
        p: vec(blockBeginPos),
        ao: ao,
        l: l
      });
      blockIndex++;
      var hasEmptyGrid = false;
      times(gridSize, function (x) {
        return times(gridSize, function (y) {
          if (grid[x][y] === " ") {
            hasEmptyGrid = true;
          }
        });
      });
      if (!hasEmptyGrid) {
        play("powerUp");
        solvedTicks = 1;
      }
    }
  }
}
function createStage() {
  var grid = times(gridSize, function () {
    return times(gridSize, function () {
      return " ";
    });
  });
  var blocks = [];
  var a = rndi(4);
  var p = vec();
  var tp = vec();
  times(gridSize * gridSize * 9, function (i) {
    p.set(rndi(gridSize), rndi(gridSize));
    var l = rndi(3, gridSize + 1);
    tp.set(p);
    var isEmpty = true;
    for (var _i = 0; _i < l - 1; _i++) {
      if (checkGrid(tp, grid) !== " ") {
        isEmpty = false;
        break;
      }
      tp.add(angleOffset[a]);
    }
    if (!isEmpty) {
      return;
    }
    if (checkGrid(tp, grid) !== " " || checkAroundPolars(p, "N", grid) || checkAroundPolars(tp, "S", grid)) {
      return;
    }
    tp.set(p);
    grid[tp.x][tp.y] = "N";
    times(l - 2, function () {
      tp.add(angleOffset[a]);
      grid[tp.x][tp.y] = a % 2 === 0 ? "-" : "|";
    });
    tp.add(angleOffset[a]);
    grid[tp.x][tp.y] = "S";
    blocks.push({
      p: vec(p),
      a: a,
      l: l
    });
    a = wrap(a + 1, 0, 4);
  });
  var evaluatedValue = 0;
  times(gridSize, function (x) {
    return times(gridSize, function (y) {
      if (grid[x][y] === " ") {
        grid[x][y] = "#";
        evaluatedValue--;
      } else if (grid[x][y] === "N") {
        angleOffset.forEach(function (o) {
          aroundPos.set(x, y).add(o);
          if (checkGrid(aroundPos, grid) === "S") {
            evaluatedValue++;
          }
        });
      }
    });
  });
  times(floor(blocks.length * 0.66), function () {
    var bi = rndi(blocks.length);
    var b = blocks[bi];
    tp.set(b.p);
    times(b.l, function () {
      grid[tp.x][tp.y] = " ";
      tp.add(angleOffset[b.a]);
    });
    blocks.splice(bi, 1);
  });
  return {
    grid: grid,
    evaluatedValue: evaluatedValue
  };
}
var aroundPos = vec();
function checkAroundPolars(p, polar, grid) {
  var hasSamePolar = false;
  angleOffset.forEach(function (o) {
    aroundPos.set(p).add(o);
    if (checkGrid(aroundPos, grid) === polar) {
      hasSamePolar = true;
    }
  });
  return hasSamePolar;
}
function checkGrid(p, grid) {
  if (!p.isInRect(0, 0, gridSize, gridSize)) {
    return "#";
  }
  return grid[p.x][p.y];
}
function goToNextStage() {
  play("coin");
  stageCount++;
  gridSize = round(sqrt(stageCount * 2.1) + 4);
  var maxEvaluatedValue = -99;
  for (var i = 0; i < 999; i++) {
    var stage = createStage();
    if (stage.evaluatedValue > maxEvaluatedValue) {
      maxEvaluatedValue = stage.evaluatedValue;
      grid = stage.grid;
    }
  }
  var o = floor((100 - gridSize * 6) / 2);
  gridPos.set(o, o);
  blockGrid = times(gridSize, function (x) {
    return times(gridSize, function (y) {
      return -1;
    });
  });
  blocks = [];
  blockIndex = 0;
  blockBeginPos.set(-1);
  blockEndPos.set(-1);
  isValidBeginPos = isValidEndPos = false;
  solvedTicks = 0;
}

