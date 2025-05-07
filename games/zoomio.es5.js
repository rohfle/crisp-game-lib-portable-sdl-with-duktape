function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
title = "ZOOM IO";
description = "\n[Hold]\n Zoom &\n Go forward\n";
characters = [];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  isDrawingScoreFront: true,
  isDrawingParticleFront: true,
  seed: 3
};
var arrows;
var nextArrowTicks;
var nextArrowCount;
var nextAngles;
var zoom;
var lines;
var scr;
var multiplier;
var cp = vec(50, 50);
function update() {
  if (!ticks) {
    arrows = [{
      pos: vec(50, 50),
      angle: -PI / 2,
      speed: 0,
      type: "player"
    }];
    nextArrowTicks = nextArrowCount = 0;
    nextAngles = times(2, function () {
      return rnd(PI * 2);
    });
    zoom = 1;
    lines = times(20, function (i) {
      return i % 10 * 10;
    });
    scr = vec();
    multiplier = 1;
  }
  color("light_cyan");
  for (var i = 0; i < 20; i++) {
    if (i < 10) {
      lines[i] = wrap(lines[i] + scr.x, 0, 100);
      rect((lines[i] - 50) * zoom + 50, 0, 1, 100);
    } else {
      lines[i] = wrap(lines[i] + scr.y, 0, 100);
      rect(0, (lines[i] - 50) * zoom + 50, 100, 1);
    }
  }
  nextArrowTicks--;
  if (nextArrowTicks < 0) {
    if (rnd() < 0.1) {
      var na = rnd(PI * 2);
      if (nextArrowCount % 2 === 1 && zoom > 5) {
        na = arrows[0].angle;
      }
      nextAngles[nextArrowCount % 2] = na;
    }
    var pos = vec(50, 50).addWithAngle(nextAngles[nextArrowCount % 2], 70);
    var tp = vec(50, 50).addWithAngle(rnd(PI * 2), rnd(20, 40));
    arrows.push({
      pos: pos,
      angle: pos.angleTo(tp),
      speed: rnd(1, difficulty + 0.1) * 0.1,
      type: nextArrowCount % 2 === 0 ? "bonus" : "enemy"
    });
    nextArrowTicks = 20 / sqrt(difficulty);
    nextArrowCount++;
  }
  if (input.isJustPressed || input.isJustReleased) {
    play("laser");
  }
  if (input.isPressed) {
    zoom = clamp(zoom + 0.05 * sqrt(difficulty), 1, 9);
    multiplier += zoom * 0.1 * sqrt(difficulty);
  } else {
    zoom += (1 - zoom) * (0.03 * sqrt(difficulty));
  }
  if (zoom < 2) {
    multiplier += (0.5 - multiplier) * 0.02;
  }
  remove(arrows, function (a) {
    if (a.type === "player") {
      a.angle += input.isPressed ? 0 : sqrt(difficulty) * 0.1 / zoom;
      a.speed += (sqrt(difficulty) * (zoom - 1) * 0.1 - a.speed) * 0.05;
      scr.set().addWithAngle(a.angle, -a.speed);
      color("cyan");
    } else {
      a.pos.addWithAngle(a.angle, a.speed);
      a.pos.add(scr);
      color(a.type === "enemy" ? "red" : "yellow");
    }
    var p = vec(a.pos).sub(cp).mul(zoom).add(cp);
    var d = a.pos.distanceTo(cp);
    if (a.type === "player" || sqrt(zoom) > 0.5 + d * 0.03 && p.isInRect(0, 0, 99, 99)) {
      var bp = vec(p).addWithAngle(a.angle, -1 * zoom);
      var c = bar(p, 5 * zoom, 3 * zoom, a.angle).isColliding.rect;
      c = _objectSpread(_objectSpread({}, c), box(vec(bp).addWithAngle(a.angle + PI / 2, 2 * zoom), 2 * zoom).isColliding.rect);
      c = _objectSpread(_objectSpread({}, c), box(vec(bp).addWithAngle(a.angle - PI / 2, 2 * zoom), 2 * zoom).isColliding.rect);
      if (a.type !== "player" && c.cyan) {
        if (a.type === "bonus") {
          play("powerUp");
          particle(p, 5 * zoom, sqrt(zoom));
          addScore(ceil(multiplier), 50, 50);
          return true;
        } else {
          play("explosion");
          end();
        }
      }
    } else {
      bar(50, 50, 30, 1, cp.angleTo(p), 0);
    }
    return d > 70;
  });
  color("black");
  text("+".concat(ceil(multiplier)), 3, 9);
}

