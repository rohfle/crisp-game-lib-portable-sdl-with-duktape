function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
title = "TT FENCE";
description = "\n[Tap] Place\n";
characters = [];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  isDrawingScoreFront: true,
  seed: 1
};
var grid;
var tmpGrid;
var bombEdgeGrid;
var bombAnimGrid;
var block;
var blockPatterns = [[0, 0, 0], [0, 1, 0], [0, 3, 0], [0, 0, 1], [0, 0, 3], [1, 0, 0], [3, 0, 0]];
var angleOfs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
var pos;
var angle;
var prevAngle;
var type;
var bombAnimTicks;
var damage;
var damageTarget;
var isDamageShown;
var nextRotationTicks;
var gridSize = 15;
function update() {
  if (!ticks) {
    grid = times(gridSize, function () {
      return times(gridSize, function () {
        return false;
      });
    });
    tmpGrid = times(gridSize, function () {
      return times(gridSize, function () {
        return false;
      });
    });
    bombEdgeGrid = times(gridSize, function () {
      return times(gridSize, function () {
        return false;
      });
    });
    bombAnimGrid = times(gridSize, function () {
      return times(gridSize, function () {
        return false;
      });
    });
    pos = vec();
    angle = prevAngle = 0;
    type = rndi(blockPatterns.length);
    bombAnimTicks = 0;
    damage = damageTarget = 0;
    isDamageShown = true;
    nextRotationTicks = 0;
    setBlock(vec(7, 7), rndi(blockPatterns.length), rndi(4));
  }
  bombAnimTicks--;
  times(gridSize, function (x) {
    return times(gridSize, function (y) {
      if (grid[x][y] && tmpGrid[x][y]) {
        color("purple");
        drawGrid(x, y);
      } else if (grid[x][y]) {
        color("blue");
        drawGrid(x, y);
      } else if (tmpGrid[x][y]) {
        color("light_blue");
        drawGrid(x, y);
      } else if (bombAnimTicks > 0 && bombAnimGrid[x][y]) {
        color("red");
        drawGrid(x, y, sin(bombAnimTicks / 30 * PI) * 6);
      }
    });
  });
  if (input.isJustPressed) {
    play("select");
    setBlock(pos, type, angle);
    checkBomb();
    type = rndi(blockPatterns.length);
    nextRotationTicks = 0;
    damageTarget += sqrt(difficulty) * 2;
  }
  nextRotationTicks--;
  if (nextRotationTicks < 0) {
    var canPlacing = false;
    for (var i = 0; i < 4; i++) {
      angle = wrap(angle + 1, 0, 4);
      if (checkBlock(pos, type, angle)) {
        canPlacing = true;
        break;
      }
    }
    tmpGrid = times(gridSize, function () {
      return times(gridSize, function () {
        return false;
      });
    });
    if (!canPlacing) {
      for (var _i = 0; _i < 4; _i++) {
        angle = wrap(angle + 1, 0, 4);
        if (checkBlockInGrid(pos, type, angle)) {
          canPlacing = true;
          break;
        }
      }
    }
    if (!canPlacing) {
      damageTarget = 100;
    } else {
      setBlock(pos, type, angle, tmpGrid);
    }
    if (angle !== prevAngle) {
      play("laser");
    }
    prevAngle = angle;
    nextRotationTicks = 30 / sqrt(sqrt(difficulty));
  }
  damageTarget += sqrt(difficulty) * 0.01;
  damage += (damageTarget - damage) * 0.1;
  color("red");
  if (damage > 99) {
    rect(0, 98, 100, 2);
    play("lucky");
    end();
  } else if (damage < 80 || ticks % ceil(109 - damage) < (109 - damage) * 0.8) {
    if (!isDamageShown) {
      play("coin");
    }
    rect(0, 98, damage, 2);
    rect(99, 98, 1, 2);
    isDamageShown = true;
  } else {
    isDamageShown = false;
  }
  function setBlock(rp, type, angle) {
    var g = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : grid;
    var hitCount = 0;
    var p = vec(rp);
    addAngle(p, angle);
    if (!g[p.x][p.y]) {
      g[p.x][p.y] = true;
    } else {
      hitCount++;
    }
    blockPatterns[type].forEach(function (ba) {
      addAngle(p, wrap(angle + ba, 0, 4));
      if (!g[p.x][p.y]) {
        g[p.x][p.y] = true;
      } else {
        hitCount++;
      }
    });
    if (g === grid) {
      if (hitCount > 0) {
        play("hit");
        damageTarget += hitCount * 9 * sqrt(difficulty);
      }
      pos.set(p);
    }
  }
  function checkBlock(rp, type, angle) {
    var p = vec(rp);
    addAngle(p, angle);
    var canPlacing = canPlaceGrid(p);
    blockPatterns[type].forEach(function (ba) {
      addAngle(p, wrap(angle + ba, 0, 4));
      canPlacing = canPlacing && canPlaceGrid(p);
    });
    return canPlacing;
  }
  function checkBlockInGrid(rp, type, angle) {
    var p = vec(rp);
    addAngle(p, angle);
    var canPlacing = p.isInRect(0, 0, gridSize, gridSize);
    blockPatterns[type].forEach(function (ba) {
      addAngle(p, wrap(angle + ba, 0, 4));
      canPlacing = canPlacing && p.isInRect(0, 0, gridSize, gridSize);
    });
    return canPlacing;
  }
  function checkBomb() {
    bombEdgeGrid = times(gridSize, function () {
      return times(gridSize, function () {
        return false;
      });
    });
    for (var _i2 = 0; _i2 < gridSize; _i2++) {
      bombEdgeGrid[_i2][0] = bombEdgeGrid[_i2][gridSize - 1] = bombEdgeGrid[0][_i2] = bombEdgeGrid[gridSize - 1][_i2] = true;
    }
    for (var _i3 = 0; _i3 < 99; _i3++) {
      if (fillBombDown() + fillBombUp() === 0) {
        break;
      }
    }
    bomb();
  }
  function fillBombDown() {
    var bc = 0;
    var p = vec();
    for (var y = 0; y < gridSize; y++) {
      for (var x = 0; x < gridSize; x++) {
        p.set(x, y);
        if (canPlaceGrid(p) && bombEdgeGrid[x][y]) {
          addAngle(p, 0);
          if (canPlaceGrid(p) && !bombEdgeGrid[p.x][p.y]) {
            bombEdgeGrid[p.x][p.y] = true;
            bc++;
          }
          p.set(x, y);
          addAngle(p, 1);
          if (canPlaceGrid(p) && !bombEdgeGrid[p.x][p.y]) {
            bombEdgeGrid[p.x][p.y] = true;
            bc++;
          }
        }
      }
    }
    return bc;
  }
  function fillBombUp() {
    var bc = 0;
    var p = vec();
    for (var y = gridSize - 1; y >= 0; y--) {
      for (var x = gridSize - 1; x >= 0; x--) {
        p.set(x, y);
        if (canPlaceGrid(p) && bombEdgeGrid[x][y]) {
          addAngle(p, 2);
          if (canPlaceGrid(p) && !bombEdgeGrid[p.x][p.y]) {
            bombEdgeGrid[p.x][p.y] = true;
            bc++;
          }
          p.set(x, y);
          addAngle(p, 3);
          if (canPlaceGrid(p) && !bombEdgeGrid[p.x][p.y]) {
            bombEdgeGrid[p.x][p.y] = true;
            bc++;
          }
        }
      }
    }
    return bc;
  }
  function bomb() {
    var bc = 0;
    var bp = vec();
    bombAnimGrid = times(gridSize, function () {
      return times(gridSize, function () {
        return false;
      });
    });
    var p = vec();
    var _loop = function _loop(y) {
      var _loop4 = function _loop4(_x2) {
        p.set(_x2, y);
        if (canPlaceGrid(p) && !bombEdgeGrid[_x2][y]) {
          angleOfs.forEach(function (_ref3) {
            var _ref4 = _slicedToArray(_ref3, 2),
              ox = _ref4[0],
              oy = _ref4[1];
            if (!bombAnimGrid[_x2 + ox][y + oy]) {
              bombAnimGrid[_x2 + ox][y + oy] = true;
              bc++;
              bp.add(_x2 + ox, y + oy);
            }
          });
        }
      };
      for (var _x2 = 0; _x2 < gridSize; _x2++) {
        _loop4(_x2);
      }
    };
    for (var y = 0; y < gridSize; y++) {
      _loop(y);
    }
    for (var _i4 = 0; _i4 < floor(sqrt(bc) * 0.5); _i4++) {
      var pbc = bc;
      var _loop2 = function _loop2(_y) {
        var _loop3 = function _loop3(x) {
          if (bombAnimGrid[x][_y]) {
            angleOfs.forEach(function (_ref) {
              var _ref2 = _slicedToArray(_ref, 2),
                ox = _ref2[0],
                oy = _ref2[1];
              p.set(x + ox, _y + oy);
              if (existsGrid(p) && !bombAnimGrid[p.x][p.y]) {
                bombAnimGrid[p.x][p.y] = true;
                bc++;
                bp.add(p);
              }
            });
          }
        };
        for (var x = 0; x < gridSize; x++) {
          _loop3(x);
        }
      };
      for (var _y = 0; _y < gridSize; _y++) {
        _loop2(_y);
      }
      if (pbc === bc) {
        break;
      }
    }
    for (var _y2 = 0; _y2 < gridSize; _y2++) {
      for (var x = 0; x < gridSize; x++) {
        if (bombAnimGrid[x][_y2]) {
          grid[x][_y2] = false;
        }
      }
    }
    bombAnimTicks = 30;
    if (bc > 0) {
      play("explosion");
      bp.div(bc);
      var sc = ceil(bc * sqrt(bc));
      addScore(sc, (bp.x - gridSize / 2) * 6 + 53, (bp.y - gridSize / 2) * 6 + 56);
      damageTarget = clamp(damageTarget - sc * 0.1, 0, 99);
    }
  }
  function addAngle(p, angle) {
    var ao = angleOfs[angle];
    p.add(ao[0], ao[1]);
  }
  function canPlaceGrid(p) {
    if (!p.isInRect(0, 0, gridSize, gridSize)) {
      return false;
    }
    return !grid[p.x][p.y];
  }
  function existsGrid(p) {
    if (!p.isInRect(0, 0, gridSize, gridSize)) {
      return false;
    }
    return grid[p.x][p.y];
  }
  function drawGrid(x, y) {
    var size = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 6;
    box((x - gridSize / 2) * 6 + 53, (y - gridSize / 2) * 6 + 56, size);
  }
}

