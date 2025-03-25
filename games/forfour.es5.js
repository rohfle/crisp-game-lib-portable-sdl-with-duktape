function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
title = "FORFOUR";
description = "\n[Tap] Roll\n";
characters = ["\n llll\nllllll\nll  ll\nll  ll\nllllll\n llll\n"];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 2
};
var circles;
var tmpCircles;
var flying;
var flyingColor;
var flyingAngle;
var flyingCount;
function update() {
  var circleCount = 13;
  var circlesOffset = vec(12, 18);
  var cc = floor(circleCount / 2);
  var colors = ["black", "red", "green", "blue", "yellow"];
  var lightColors = ["light_black", "light_red", "light_green", "light_blue", "light_yellow"];
  if (!ticks) {
    circles = times(circleCount, function () {
      return times(circleCount, function () {
        return -1;
      });
    });
    tmpCircles = times(circleCount, function () {
      return times(circleCount, function () {
        return -1;
      });
    });
    circles[cc][cc] = 0;
    for (var i = cc + 1; i < circleCount - 1; i++) {
      circles[i][cc] = rndi(1, 5);
    }
    flying = vec();
    flyingCount = -999;
  }
  if (flyingCount < -900) {
    flyingCount = 60 / difficulty;
    flyingAngle = rndi(4);
    flyingColor = rndi(1, 5);
    var sz = checkSize();
    if (rnd() < sqrt(sz) * 0.1) {
      flyingColor = 0;
      sz = ceil(sz * 0.7);
    }
    var min = cc - sz + 1;
    var max = cc + sz - 1;
    switch (flyingAngle) {
      case 0:
        flying.set(-1, rndi(min, max + 1));
        break;
      case 1:
        flying.set(rndi(min, max + 1), -1);
        break;
      case 2:
        flying.set(circleCount, rndi(min, max + 1));
        break;
      case 3:
        flying.set(rndi(min, max + 1), circleCount);
        break;
    }
    flying.set(flying.x * 6 + circlesOffset.x, flying.y * 6 + circlesOffset.y);
  }
  flyingCount--;
  color(lightColors[flyingColor]);
  if (flyingAngle % 2 === 0) {
    rect(0, flying.y - 1, 99, 2);
  } else {
    rect(flying.x - 1, 0, 2, 99);
  }
  if (flyingCount < 0) {
    flying.addWithAngle(flyingAngle * PI / 2, difficulty);
    var c = vec(round((flying.x - circlesOffset.x) / 6), round((flying.y - circlesOffset.y) / 6));
    if (c.isInRect(0, 0, circleCount, circleCount) && circles[c.x][c.y] >= 0) {
      if (flyingColor === 0) {
        flyingColor = circles[c.x][c.y];
        if (flyingColor === 0) {
          flyingColor = rndi(1, 5);
        }
      }
      for (var _i = 0; _i < 99; _i++) {
        c.addWithAngle(flyingAngle * PI / 2 + PI, 1);
        c.round();
        if (!c.isInRect(0, 0, circleCount, circleCount)) {
          play("explosion");
          color("red");
          text("X", circlesOffset.x + c.x * 6, circlesOffset.y + c.y * 6);
          end();
          break;
        }
        if (circles[c.x][c.y] < 0) {
          play("laser");
          circles[c.x][c.y] = flyingColor;
          flyingCount = -999;
          var _checkConnection = checkConnection(c, flyingColor),
            _checkConnection2 = _slicedToArray(_checkConnection, 2),
            ic = _checkConnection2[0],
            cnt = _checkConnection2[1];
          if (cnt >= 4) {
            play("coin");
            var dcc = 0;
            for (var y = 0; y < circleCount; y++) {
              for (var x = 0; x < circleCount; x++) {
                if (ic[x][y]) {
                  color(colors[circles[x][y]]);
                  particle(circlesOffset.x + x * 6, circlesOffset.y + y * 6, 4, 1);
                  circles[x][y] = -1;
                  dcc++;
                }
              }
            }
            var _checkConnection3 = checkConnection(vec(cc, cc)),
              _checkConnection4 = _slicedToArray(_checkConnection3, 2),
              icc = _checkConnection4[0],
              _ = _checkConnection4[1];
            for (var _y = 0; _y < circleCount; _y++) {
              for (var _x = 0; _x < circleCount; _x++) {
                if (!icc[_x][_y] && circles[_x][_y] > 0) {
                  color(lightColors[circles[_x][_y]]);
                  particle(circlesOffset.x + _x * 6, circlesOffset.y + _y * 6, 4, 1);
                  circles[_x][_y] = -1;
                  dcc++;
                }
              }
            }
            dcc -= 3;
            addScore(dcc * dcc, flying);
          }
          break;
        }
      }
    }
  }
  if (!flying.isInRect(-3, -3, 103, 103)) {
    flyingCount = -999;
  }
  color(colors[flyingColor]);
  char("a", flying);
  if (input.isJustPressed) {
    play("select");
    for (var _y2 = 0; _y2 < circleCount; _y2++) {
      for (var _x2 = 0; _x2 < circleCount; _x2++) {
        tmpCircles[_x2][_y2] = circles[_x2][_y2];
      }
    }
    for (var _y3 = 0; _y3 < circleCount; _y3++) {
      for (var _x3 = 0; _x3 < circleCount; _x3++) {
        circles[circleCount - 1 - _y3][_x3] = tmpCircles[_x3][_y3];
      }
    }
  }
  for (var _y4 = 0; _y4 < circleCount; _y4++) {
    for (var _x4 = 0; _x4 < circleCount; _x4++) {
      var _c = circles[_x4][_y4];
      if (_c >= 0) {
        color(colors[_c]);
        char("a", circlesOffset.x + _x4 * 6, circlesOffset.y + _y4 * 6);
      }
    }
  }
  function checkConnection(pos) {
    var cl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;
    var c = 1;
    var ic = times(circleCount, function () {
      return times(circleCount, function () {
        return false;
      });
    });
    ic[pos.x][pos.y] = true;
    for (var _i2 = 0; _i2 < 9; _i2++) {
      var pc = c;
      for (var _y5 = 0; _y5 < circleCount - 1; _y5++) {
        for (var _x5 = 0; _x5 < circleCount - 1; _x5++) {
          if (!ic[_x5][_y5]) {
            continue;
          }
          if ((cl > 0 && circles[_x5 + 1][_y5] === cl || cl < 0 && circles[_x5 + 1][_y5] >= 0) && !ic[_x5 + 1][_y5]) {
            ic[_x5 + 1][_y5] = true;
            c++;
          }
          if ((cl > 0 && circles[_x5][_y5 + 1] === cl || cl < 0 && circles[_x5][_y5 + 1] >= 0) && !ic[_x5][_y5 + 1]) {
            ic[_x5][_y5 + 1] = true;
            c++;
          }
        }
      }
      for (var _y6 = circleCount - 1; _y6 > 0; _y6--) {
        for (var _x6 = circleCount - 1; _x6 > 0; _x6--) {
          if (!ic[_x6][_y6]) {
            continue;
          }
          if ((cl > 0 && circles[_x6 - 1][_y6] === cl || cl < 0 && circles[_x6 - 1][_y6] >= 0) && !ic[_x6 - 1][_y6]) {
            ic[_x6 - 1][_y6] = true;
            c++;
          }
          if ((cl > 0 && circles[_x6][_y6 - 1] === cl || cl < 0 && circles[_x6][_y6 - 1] >= 0) && !ic[_x6][_y6 - 1]) {
            ic[_x6][_y6 - 1] = true;
            c++;
          }
        }
      }
      if (pc === c) {
        break;
      }
    }
    return [ic, c];
  }
  function checkSize() {
    var minX = circleCount - 1,
      maxX = 0;
    var minY = circleCount - 1,
      maxY = 0;
    for (var _y7 = 0; _y7 < circleCount; _y7++) {
      for (var _x7 = 0; _x7 < circleCount; _x7++) {
        if (circles[_x7][_y7] >= 0) {
          if (minX > _x7) {
            minX = _x7;
          }
          if (maxX < _x7) {
            maxX = _x7;
          }
          if (minY > _y7) {
            minY = _y7;
          }
          if (maxY < _y7) {
            maxY = _y7;
          }
        }
      }
    }
    minX = cc - minX + 1;
    maxX = maxX - cc + 1;
    minY = cc - minY + 1;
    maxY = maxY - cc + 1;
    return Math.max(minX, maxX, minY, maxY);
  }
}

