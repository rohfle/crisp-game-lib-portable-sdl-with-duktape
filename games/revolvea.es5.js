function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
title = "REVOLVE A";
description = "\n[Tap]\n Go forward\n";
characters = ["\n rrr\nrrRrr\nrRrLr\nrrLLr\n rrr\n"];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 2
};
var arrow;
var enemies;
var nextEnemyTicks;
var multiplier;
var lineDist = 30;
function update() {
  if (!ticks) {
    arrow = {
      pos: vec(50, 50),
      vel: vec(1).rotate(PI / 4),
      angle: -PI / 2
    };
    enemies = [];
    nextEnemyTicks = 0;
    multiplier = 1;
  }
  nextEnemyTicks--;
  if (nextEnemyTicks < 0) {
    var pos = vec(rnd(99), rnd() < 0.5 ? -3 : 103);
    if (rnd() < 0.5) {
      pos.swapXy();
    }
    enemies.push({
      pos: pos,
      vel: vec(rnd(1, sqrt(difficulty))).mul(0.3).rotate(pos.angleTo(rnd(10, 90), rnd(10, 90))),
      isRemoved: false
    });
    nextEnemyTicks = rnd(30, 40) / difficulty;
  }
  multiplier = 1;
  remove(enemies, function (e) {
    color("green");
    if (e.isRemoved) {
      particle(e.pos);
      addScore(multiplier, e.pos);
      multiplier++;
      return true;
    }
    e.pos.add(e.vel);
    enemies.forEach(function (ae) {
      if (e === ae || e.pos.distanceTo(ae.pos) >= lineDist) {
        return;
      }
      line(e.pos, ae.pos);
    });
    return !e.pos.isInRect(-5, -5, 110, 110);
  });
  color("black");
  enemies.forEach(function (e) {
    char("a", e.pos);
  });
  if (input.isJustPressed) {
    play("laser");
    arrow.vel.set(1).rotate(arrow.angle);
  }
  if (arrow.pos.x < 3 && arrow.vel.x < 0 || arrow.pos.x > 97 && arrow.vel.x > 0) {
    arrow.vel.x *= -1;
  }
  if (arrow.pos.y < 3 && arrow.vel.y < 0 || arrow.pos.y > 97 && arrow.vel.y > 0) {
    arrow.vel.y *= -1;
  }
  arrow.pos.add(vec(arrow.vel).mul(sqrt(difficulty) * 0.4));
  arrow.angle += 0.08 * sqrt(difficulty);
  color(input.isJustPressed ? "red" : "blue");
  var p = vec(arrow.pos).addWithAngle(arrow.angle, 2);
  var c = line(p, vec(arrow.pos).addWithAngle(arrow.angle + PI, 2), 2).isColliding;
  c = _objectSpread(_objectSpread({}, c), line(p, vec(arrow.pos).addWithAngle(arrow.angle + PI / 2, 2), 2).isColliding);
  c = _objectSpread(_objectSpread({}, c), line(p, vec(arrow.pos).addWithAngle(arrow.angle - PI / 2, 2), 2).isColliding);
  if (c["char"].a) {
    play("explosion");
    end();
  } else if (c.rect.green) {
    play("powerUp");
    removeAroundEnemy(arrow.pos);
  }
  function removeAroundEnemy(p) {
    enemies.forEach(function (e) {
      if (!e.isRemoved && e.pos.distanceTo(p) < lineDist) {
        e.isRemoved = true;
        removeAroundEnemy(e.pos);
      }
    });
  }
}

