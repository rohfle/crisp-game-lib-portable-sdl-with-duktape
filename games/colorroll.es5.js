function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
title = "COLOR ROLL";
description = "\n[Tap] Shoot\n";
characters = [];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  isDrawingScoreFront: true,
  seed: 9
};
var lanes;
var laneY;
var shotY;
var hitColor;
var laneCount;
var baseMultiplier;
var multiplier;
var penalty;
var colors = ["red", "green", "blue", "yellow"];
var laneHeight = 7;
function update() {
  if (!ticks) {
    lanes = [];
    shotY = undefined;
    hitColor = undefined;
    laneCount = 2;
    times(laneCount, function () {
      return addLane();
    });
    baseMultiplier = 0;
    multiplier = 1;
    penalty = 1;
  }
  var sy = 97;
  if (shotY != null) {
    shotY -= sqrt(difficulty) * 3;
    sy = shotY;
  } else {
    hitColor = undefined;
    if (input.isJustPressed) {
      play("laser");
      multiplier = 1;
      shotY = sy;
      laneY += 2 * penalty * sqrt(sqrt(difficulty));
    }
  }
  color(hitColor == null ? "black" : hitColor);
  rect(49, sy, 3, 99 - sy);
  var my = laneHeight * laneCount;
  laneY += sqrt(difficulty) * 0.005;
  if (laneY < my) {
    laneY += (my - laneY) * 0.2;
  }
  var ly = laneY;
  remove(lanes, function (l) {
    l.x = wrap(l.x + l.vx, 0, 99);
    l.y += (ly - l.y) * 0.2;
    var x = l.x;
    var isRemoved = false;
    var isShotRemoved = false;
    l.bars.forEach(function (b) {
      color(b.color);
      var c;
      if (x + b.width < 99) {
        c = rect(x, l.y, b.width - 1, -laneHeight + 1).isColliding.rect;
      } else {
        c = rect(x, l.y, 99 - x, -laneHeight + 1).isColliding.rect;
        c = _objectSpread(_objectSpread({}, c), rect(0, l.y, b.width - (99 - x) - 1, -laneHeight + 1).isColliding.rect);
      }
      if (c.black) {
        hitColor = b.color;
        isRemoved = true;
      } else if (hitColor != null) {
        if (c[b.color]) {
          isRemoved = true;
        } else if (c.red || c.green || c.blue || c.yellow) {
          isShotRemoved = true;
        }
      }
      x = wrap(x + b.width, 0, 99);
    });
    ly -= laneHeight;
    if (isShotRemoved) {
      play("hit");
      shotY = undefined;
      penalty = clamp(penalty * (3 / multiplier), 1, 4);
    } else if (isRemoved) {
      play("coin");
      addScore(multiplier * pow(2, baseMultiplier), 50, l.y);
      laneY -= multiplier;
      multiplier *= 2;
      return true;
    }
  });
  if (lanes.length === 0) {
    play("powerUp");
    shotY = undefined;
    laneCount++;
    if (laneCount > clamp(5 + baseMultiplier, 1, 10)) {
      baseMultiplier = clamp(baseMultiplier + 1, 1, 9);
      laneCount = 2;
    }
  }
  if (shotY == null) {
    times(laneCount - lanes.length, function () {
      return addLane();
    });
    if (shotY == null && lanes[0].y > 97) {
      play("explosion");
      end();
    }
  }
  function addLane() {
    play("select");
    var x = rnd(99);
    var vx = rnds(0.5, 1) * sqrt(difficulty);
    if (lanes.length === 0) {
      laneY = 0;
      lanes.push({
        x: x,
        y: 0,
        vx: vx,
        bars: addBars()
      });
    } else {
      lanes.push({
        x: x,
        y: -lanes.length * laneHeight,
        vx: vx,
        bars: addBars(lanes[lanes.length - 1].bars)
      });
    }
  }
  function addBars(prevBars) {
    var cs = prevBars != null ? prevBars.map(function (b) {
      return b.color;
    }) : [colors[rndi(colors.length)]];
    if (cs.length === 1 || cs.length < 4 && rnd() < 0.5) {
      cs.push(colors[rndi(colors.length)]);
    } else {
      cs.splice(rndi(colors.length), 1);
    }
    var lx = 99;
    var x = rnd(99);
    var cc = cs.length;
    return cs.map(function (c, i) {
      var width = i === cc - 1 ? lx : 99 / cc * rnd(0.8, 1.2);
      lx -= width;
      x = wrap(x + width, 0, 99);
      return {
        x: x,
        width: width,
        color: c
      };
    });
  }
}

