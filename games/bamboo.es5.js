function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
title = "BAMBOO";
description = "\n[Tap]  Turn\n[Hold] Through\n";
characters = ["\n  ll\n  l  l\nlpppp\n  prrr\n r\nr\n", "\n   ll\n   l  \nlpppp\n rp  l\nr  r\n    r\n"];
options = {
  viewSize: {
    x: 200,
    y: 100
  },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 1
};
var bamboos;
var nextBambooTicks;
var x;
var vx;
var avx;
var animTicks;
var speedBambooTicks;
function update() {
  if (!ticks) {
    bamboos = [];
    nextBambooTicks = 0;
    x = 190;
    vx = 1;
    avx = 0;
    animTicks = 0;
    speedBambooTicks = 5;
  }
  color("black");
  if (input.isJustPressed) {
    play("select");
    vx *= -1;
  }
  x = wrap(x + vx * difficulty * (1 + avx), -3, 203);
  avx *= 0.9;
  animTicks += difficulty;
  char(input.isPressed ? "b" : addWithCharCode("a", floor(animTicks / 20) % 2), x, 87, {
    mirror: {
      x: vx
    }
  });
  nextBambooTicks--;
  if (nextBambooTicks < 0) {
    speedBambooTicks--;
    bamboos.push({
      x: rnd(5, 195),
      height: 0,
      speed: speedBambooTicks < 0 ? 2 : 1
    });
    nextBambooTicks = rnd(70, 100) / difficulty;
    speedBambooTicks = rndi(4, 7);
  }
  remove(bamboos, function (b) {
    b.height += b.speed * difficulty * 0.14;
    var h = b.height / 4;
    var y = 90 - h / 2;
    if (h < 1) {
      y += (1 - h) * 3;
      h = 1;
    }
    var c = {};
    times(4, function (i) {
      color(b.height < 5 ? "light_yellow" : b.height > 50 ? "green" : b.height > 25 ? i % 2 === 0 ? "green" : "light_green" : b.height > 23 ? "yellow" : i % 2 === 0 ? "yellow" : "light_yellow");
      c = _objectSpread(_objectSpread({}, c), box(b.x, y, (4 - i) * 2, ceil(h)).isColliding["char"]);
      y -= h;
    });
    if ((c.a || c.b) && !input.isPressed) {
      if (b.height < 5) {} else if (b.height <= 25) {
        var s = ceil((b.height - 5) / 3);
        if (s === 7) {
          s = 10;
          play("powerUp");
        } else {
          play("coin");
        }
        addScore(s * s, b.x, 90 - b.height);
        return true;
      } else {
        play("hit");
        b.speed *= 0.6;
        b.height *= 0.7;
        avx++;
        if (avx > 5) {
          avx = 5;
        }
        vx *= -1;
        particle(b.x, 87, 9, difficulty * (1 + avx) * 0.5, vx > 0 ? 0 : PI, 0.4);
        if (b.height <= 25) {
          play("explosion");
          return true;
        }
      }
    }
    if (b.height > 50) {
      b.speed *= 0.997;
    }
    if (b.height >= 89) {
      color("red");
      text("X", b.x, 3);
      play("lucky");
      end();
    }
  });
  color("purple");
  rect(0, 90, 200, 10);
}

