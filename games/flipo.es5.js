function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
title = "FLIP O";
description = "\n[Tap] Flip\n";
characters = [];
options = {
  theme: "shapeDark",
  isPlayingBgm: true,
  isReplayEnabled: true,
  isDrawingScoreFront: true,
  seed: 6
};
var balls;
var flipCount;
var blocks;
var nextBlockDist;
var ballRadius = 2;
var flipperLength = 12;
var blockSize = vec(9, 5);
var blockCount = 8;
function update() {
  if (!ticks) {
    balls = [{
      pos: vec(80, 10),
      pp: vec(80, 10),
      vel: vec(1, 0),
      angle: rnd(PI * 2),
      multiplier: 1
    }];
    flipCount = 0;
    blocks = [];
    nextBlockDist = 0;
  }
  var maxBlockY = 0;
  blocks.forEach(function (b) {
    color(b.hasBall ? "red" : "cyan");
    box(b.pos, blockSize);
    if (b.pos.y > maxBlockY) {
      maxBlockY = b.pos.y;
    }
  });
  var scr = maxBlockY < 29 ? (30 - maxBlockY) * 0.1 : sqrt(difficulty) * 0.02;
  if (input.isJustPressed) {
    play("laser");
    scr += sqrt(difficulty) * 0.3 * balls.length;
    flipCount = (flipCount + 1) % 2;
  }
  color("light_cyan");
  rect(5, 0, 90, 5);
  color("light_blue");
  rect(0, 0, 5, 99);
  rect(95, 0, 5, 99);
  color("blue");
  var c = bar(7, 75, 25, 3, 0.5, 0).isColliding.rect;
  c = _objectSpread(_objectSpread({}, c), bar(101 - 7, 75, 25, 3, PI - 0.5, 0).isColliding.rect);
  color("purple");
  var f1a = flipCount === 0 ? 0.5 : -0.5;
  c = _objectSpread(_objectSpread({}, c), bar(50 - 17, 88, flipperLength, 3, f1a, 0).isColliding.rect);
  var f2a = flipCount === 0 ? PI + 0.5 : PI - 0.5;
  c = _objectSpread(_objectSpread({}, c), bar(51 + 17, 88, flipperLength, 3, f2a, 0).isColliding.rect);
  if (c.cyan || c.red) {
    color("red");
    bar(7, 75, 25, 3, 0.5, 0);
    bar(101 - 7, 75, 25, 3, PI - 0.5, 0);
    play("explosion");
    end();
  }
  if (input.isJustPressed) {
    if (flipCount === 0) {
      bar(51 + 17, 88, flipperLength, 3, PI, 0);
    } else {
      bar(50 - 17, 88, flipperLength, 3, 0, 0);
    }
  }
  remove(balls, function (b) {
    b.pp.set(b.pos);
    b.pp.y += scr;
    b.vel.y += 0.1;
    b.vel.mul(0.99);
    b.pos.add(vec(b.vel).mul(sqrt(difficulty) * 0.5));
    b.pos.y += scr;
    b.angle += b.vel.x * 0.03 + b.vel.y * 0.02;
    color("black");
    var c = arc(b.pos, ballRadius, 3, b.angle, b.angle + PI * 2).isColliding.rect;
    if (c.red || c.cyan) {
      addScore(b.multiplier * balls.length, b.pos);
      b.multiplier++;
      color("transparent");
      var cx = arc(b.pp.x, b.pos.y, ballRadius).isColliding.rect;
      var cy = arc(b.pos.x, b.pp.y, ballRadius).isColliding.rect;
      if (!(cx.red || cx.cyan)) {
        reflect(b, b.vel.x > 0 ? -PI : 0);
      }
      if (!(cy.red || cy.cyan)) {
        reflect(b, b.vel.y > 0 ? -PI / 2 : PI / 2);
      }
    }
    if (c.light_cyan) {
      play("hit");
      reflect(b, PI / 2, "light_cyan");
    }
    if (c.light_blue) {
      play("hit");
      reflect(b, b.pos.x < 50 ? 0 : PI, "light_blue");
    }
    if (c.blue) {
      reflect(b, b.pos.x < 50 ? 0.5 - PI / 2 : PI - 0.5 + PI / 2, "blue");
    }
    if (c.purple) {
      if (input.isJustPressed) {
        play("jump");
        var pp = vec(b.pos);
        var pf1a = flipCount === 1 ? 0.5 : -0.5;
        var pf2a = flipCount === 1 ? PI + 0.5 : PI - 0.5;
        reflect(b, b.pos.x < 50 ? pf1a - PI / 2 : pf2a + PI / 2, "purple");
        reflect(b, -PI / 2, "purple");
        reflect(b, b.pos.x < 50 ? f1a - PI / 2 : f2a + PI / 2, "purple");
        b.vel.add(vec(b.pos).sub(pp));
        b.multiplier = 1;
      } else {
        reflect(b, b.pos.x < 50 ? f1a - PI / 2 : f2a + PI / 2, "purple");
      }
    }
    if (b.pos.y > 99 + ballRadius) {
      play("select");
      return true;
    }
  });
  if (balls.length === 0) {
    play("explosion");
    end();
  }
  balls.forEach(function (b) {
    balls.forEach(function (ab) {
      if (ab === b || ab.pos.distanceTo(b.pos) > ballRadius * 2) {
        return;
      }
      reflect(b, ab.pos.angleTo(b.pos));
    });
  });
  color("transparent");
  remove(blocks, function (b) {
    b.pos.y += scr;
    if (box(b.pos, blockSize).isColliding.rect.black) {
      if (b.hasBall) {
        play("powerUp");
        balls.push({
          pos: vec(b.pos),
          pp: vec(b.pos),
          vel: vec(1, 0).rotate(PI * 2),
          angle: rnd(PI * 2),
          multiplier: 1
        });
      } else {
        play("coin");
      }
      return true;
    }
  });
  nextBlockDist -= scr;
  while (nextBlockDist < 0) {
    var x = (blockSize.x + 1) / 2;
    var y = -nextBlockDist;
    var br = 0.1 / balls.length;
    for (var i = 0; i < blockCount / 2; i++) {
      if (rnd() < 0.5) {
        blocks.push({
          pos: vec(50 - x, y),
          hasBall: rnd() < br
        });
        blocks.push({
          pos: vec(50 + x, y),
          hasBall: rnd() < br
        });
      }
      x += blockSize.x + 1;
    }
    nextBlockDist += blockSize.y + 1;
  }
  function reflect(b, a, c) {
    var oa = wrap(b.vel.angle - a - PI, -PI, PI);
    if (abs(oa) < PI / 2) {
      b.vel.addWithAngle(a, b.vel.length * cos(oa) * 1.7);
    }
    if (c != null) {
      color("transparent");
      for (var _i = 0; _i < 9; _i++) {
        b.pos.addWithAngle(a, 1);
        if (!arc(b.pos, ballRadius).isColliding.rect[c]) {
          break;
        }
      }
    }
  }
}

