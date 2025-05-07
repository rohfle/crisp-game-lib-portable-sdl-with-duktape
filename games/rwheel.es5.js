function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
title = "R WHEEL";
description = "\n[Tap] \n Multiple jumps\n";
characters = ["\nllllll\nll l l\nll l l\nllllll\n l  l\n l  l\n  ", "\nllllll\nll l l\nll l l\nllllll\nll  ll\n  ", "\n llll\n  ll\n\n llll\n\nllllll\n"];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 5
};
var spikes;
var angleOfs;
var bonuses;
var player;
var bars;
var multiplier;
var validSpikeCount;
var wheelRadius = 40;
var spikeCount = 32;
function update() {
  if (!ticks) {
    spikes = times(spikeCount, function () {
      return {
        height: 0,
        isHit: false
      };
    });
    angleOfs = 0;
    bonuses = [];
    player = {
      y: 0,
      vy: 0
    };
    bars = [];
    multiplier = 1;
    validSpikeCount = 0;
  }
  var sd = sqrt(difficulty);
  if (input.isJustPressed) {
    play("jump");
    player.vy = -2 * sd;
    spikes.forEach(function (s) {
      s.isHit = false;
    });
    if (player.y === 0) {
      player.y += player.vy;
      multiplier = 0;
      addBonus();
    }
  }
  if (player.y < 0) {
    var pvy = player.vy;
    player.vy += (input.isPressed ? 1 : 3) * 0.03 * difficulty;
    player.vy *= 0.98;
    if (player.y < -wheelRadius * 2 + 6 && player.vy < 0) {
      player.vy *= -0.5;
    }
    if (pvy * player.vy <= 0) {
      play("laser");
      bars.push({
        pos: vec(50, 50 + wheelRadius + player.y),
        width: 0,
        isSpike: true
      });
    }
    player.y += player.vy;
    if (player.y > 0) {
      player.y = player.vy = 0;
    }
  }
  color("black");
  char(player.y > 0 ? "a" : addWithCharCode("a", floor(ticks / 10) % 2), 50, 50 + wheelRadius + player.y - 3);
  var va = 0.03 * sd;
  color("yellow");
  remove(bonuses, function (b) {
    var p = vec(50, 50).addWithAngle(b.angle, b.radius);
    b.angle += va;
    var c = char("c", p).isColliding["char"];
    if (c.a || c.b) {
      play("coin");
      bars.push({
        pos: vec(50, 50 + wheelRadius + player.y),
        width: 0,
        isSpike: false
      });
      return true;
    }
  });
  remove(bars, function (b) {
    if (b.isSpike) {
      b.width += sd;
      b.pos.y += sd * 3;
      color("purple");
    } else {
      b.width += sd * 2;
      b.pos.y += sd * 2;
      color("yellow");
    }
    box(b.pos, b.width, 3);
    return b.pos.y > 103;
  });
  angleOfs += va;
  color("black");
  arc(50, 50, wheelRadius + 3, 3, angleOfs, angleOfs + PI * 2);
  var a = angleOfs;
  validSpikeCount = 0;
  spikes.forEach(function (s) {
    color(s.height > 0 ? "red" : "transparent");
    var p = vec(50, 50).addWithAngle(a, wheelRadius * (1 - s.height * 0.1));
    var bp = vec(50, 50).addWithAngle(a, wheelRadius);
    var l = 0.05 + s.height * 0.1;
    var c = line(p, vec(bp).addWithAngle(a - PI / 2, 50 / spikeCount)).isColliding;
    c = _objectSpread(_objectSpread({}, c), line(p, vec(bp).addWithAngle(a + PI / 2, 50 / spikeCount)).isColliding);
    if (!s.isHit && c.rect.purple) {
      play("hit");
      s.height++;
      s.isHit = true;
    }
    if (s.height > 0) {
      if (c.rect.yellow) {
        play("select");
        multiplier += s.height;
        addScore(multiplier, p);
        s.height = 0;
      } else if (c["char"].a || c["char"].b) {
        play("explosion");
        end();
      }
    }
    a += PI * 2 / spikeCount;
    if (s.height > 0) {
      validSpikeCount++;
    }
  });
  if (validSpikeCount === 0) {
    spikes[wrap(floor((-angleOfs - PI / 4) / (PI * 2 / spikeCount)), 0, spikeCount)].height = 1;
    spikes[wrap(floor((-angleOfs - PI / 4 * 3) / (PI * 2 / spikeCount)), 0, spikeCount)].height = 1;
    addBonus();
  }
  function addBonus() {
    times(ceil(validSpikeCount / 9), function () {
      bonuses.push({
        angle: -PI / 3 * 2 + rnds(PI / 4 * 3),
        radius: rnd(10, 30)
      });
    });
  }
}

