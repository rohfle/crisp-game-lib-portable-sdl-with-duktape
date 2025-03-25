function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
title = "CHARGE BEAM";
description = "\n[Tap]     Shot\n[Hold]    Charge\n[Release] Fire\n";
characters = ["\nrllbb\nlllccb\nllyl b\n", "\n  r rr\nrrrrrr\n  grr\n  grr\nrrrrrr\n  r rr\n", "\n LLLL\nLyyyyL\nLyyyyL\nLyyyyL\nLyyyyL\n LLLL\n", "\n   bbb\n  bccb\nbbllcb\nbcllcb\n  bccb\n   bbb\n", "\nl llll\nl llll\n"];
options = {
  viewSize: {
    x: 200,
    y: 60
  },
  theme: "pixel",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 1
};
var objs;
var nextObjDist;
var inhalingCoins;
var coinMultiplier;
var coinPenaltyMultiplier;
var enemyMultiplier;
var shotX;
var shotSize;
var charge;
var penaltyVx;
var prevType;
function update() {
  if (!ticks) {
    objs = [{
      x: 150,
      size: 1,
      type: "enemy"
    }];
    for (var i = 0; i < 3; i++) {
      objs.push({
        x: 160 + i * 10,
        size: 1,
        type: "coin"
      });
    }
    nextObjDist = 30;
    inhalingCoins = [];
    coinMultiplier = enemyMultiplier = coinPenaltyMultiplier = 1;
    shotX = shotSize = undefined;
    charge = 0;
    penaltyVx = 0;
    prevType = "coin";
  }
  if (shotX == null) {
    text("BEAM", 30, 55);
    if (input.isPressed && charge < 99) {
      play("hit");
      charge += difficulty * 1.5;
      color("cyan");
      var c = charge;
      var x = 60;
      if (c < 25) {
        rect(x, 53, c, 5);
        shotSize = 1;
      } else {
        rect(x, 53, 25, 5);
        c -= 25;
        x += 27;
        shotSize = 1;
        while (c > 9) {
          rect(x, 53, 9, 5);
          x += 11;
          c -= 9;
          shotSize++;
        }
        rect(x, 53, c, 5);
        shotSize++;
      }
      color("black");
    } else if (charge > 0) {
      play("laser");
      shotX = 10;
      charge = 0;
      coinMultiplier = enemyMultiplier = coinPenaltyMultiplier = 1;
    }
  }
  if (shotX != null) {
    shotX += difficulty * 2.5;
    var _x = shotX;
    if (shotSize === 1) {
      char("e", shotX, 30);
    } else {
      for (var _i = 0; _i < shotSize; _i++) {
        if (shotSize % 2 === 1 && _i === 0) {
          char("d", _x, 30);
          _x += 6;
        } else {
          if (_i % 2 === shotSize % 2) {
            char("d", _x, 27);
          } else {
            char("d", _x, 33);
            _x += 6;
          }
        }
      }
    }
    if (shotX > 203) {
      shotX = undefined;
    }
  }
  penaltyVx -= 0.02;
  if (penaltyVx < 0) {
    penaltyVx = 0;
  }
  var vx = (-difficulty - penaltyVx) * 0.5;
  color("red");
  for (var _i2 = 0; _i2 < ceil(penaltyVx * 2 + 0.1); _i2++) {
    text("<", _i2 * 6 + 3, 48);
  }
  color("black");
  nextObjDist += vx;
  if (nextObjDist < 0) {
    var type = prevType !== "coin" && rnd() < 0.5 ? "coin" : "enemy";
    prevType = type;
    var _c = rndi(3, 9);
    var _x2 = 200;
    if (type === "coin") {
      for (var _i3 = 0; _i3 < _c; _i3++) {
        objs.push({
          x: _x2,
          size: 1,
          type: "coin"
        });
        _x2 += 10;
      }
    } else {
      for (var _i4 = 0; _i4 < _c; _i4++) {
        var size = rnd() < 0.3 ? rndi(2, 6) : 1;
        objs.push({
          x: _x2,
          size: size,
          type: "enemy"
        });
        _x2 += 10 + ceil((size - 1) / 2) * 6;
      }
    }
    _x2 += 10;
    nextObjDist = _x2 - 200;
  }
  var minCoinX = 999;
  var minEnemyX = 999;
  objs = objs.filter(function (o) {
    o.x += vx;
    if (o.type === "coin") {
      if (o.x < minCoinX) {
        minCoinX = o.x;
      }
    } else {
      if (o.x < minEnemyX) {
        minEnemyX = o.x;
      }
    }
    if (o.type === "coin") {
      var _c2 = char("c", o.x, 30).isColliding["char"];
      if (_c2.d || _c2.e) {
        addCoinPenalty(o, _c2);
        return false;
      }
      if (_c2.b || _c2.c) {
        return false;
      }
    } else {
      var _x3 = o.x;
      var _c3 = {};
      for (var _i5 = 0; _i5 < o.size; _i5++) {
        if (o.size % 2 === 1 && _i5 === 0) {
          _c3 = _objectSpread(_objectSpread({}, _c3), char("b", _x3, 30).isColliding["char"]);
          _x3 += 6;
        } else {
          if (_i5 % 2 === o.size % 2) {
            _c3 = _objectSpread(_objectSpread({}, _c3), char("b", _x3, 27).isColliding["char"]);
          } else {
            _c3 = _objectSpread(_objectSpread({}, _c3), char("b", _x3, 33).isColliding["char"]);
            _x3 += 6;
          }
        }
      }
      if (_c3.d || _c3.e) {
        play("explosion");
        if (_c3.e) {
          shotX = undefined;
        }
        if (o.size <= shotSize) {
          particle(o.x, 30, o.size * 3);
          addScore(enemyMultiplier * o.size, o.x, 30);
          enemyMultiplier++;
          if (o.size > 1) {
            shotSize -= o.size;
            if (shotSize <= 0) {
              shotX = undefined;
            }
          }
          return false;
        } else {
          o.size -= shotSize;
          shotX = undefined;
        }
      }
      if (_c3.b || _c3.c) {
        return false;
      }
    }
    return true;
  });
  if (minCoinX > 200 && minEnemyX > 200) {
    nextObjDist = 0;
  }
  if (minCoinX < minEnemyX) {
    objs = objs.filter(function (o) {
      if (o.type === "coin" && o.x < minEnemyX) {
        inhalingCoins.push({
          x: o.x,
          vx: -1
        });
        return false;
      }
      return true;
    });
  }
  if (char("a", 10, 30).isColliding["char"].b) {
    play("lucky");
    end();
  }
  inhalingCoins = inhalingCoins.filter(function (o) {
    o.x += o.vx;
    o.vx -= 0.1;
    var c = char("c", o.x, 30).isColliding["char"];
    if (c.d || c.e) {
      addCoinPenalty(o, c);
      return false;
    }
    if (o.x < 10) {
      play("coin");
      addScore(coinMultiplier, 10 + sqrt(coinMultiplier) * 4, 30);
      if (coinMultiplier < 64) {
        coinMultiplier *= 2;
      }
      return false;
    }
    return true;
  });
  function addCoinPenalty(o, c) {
    play("powerUp");
    particle(o.x, 30, 9, 5);
    if (c.e) {
      shotX = undefined;
    }
    addScore(-coinPenaltyMultiplier, o.x + sqrt(coinPenaltyMultiplier) * 4, 50);
    if (coinPenaltyMultiplier < 64) {
      coinPenaltyMultiplier *= 2;
    }
    penaltyVx += 0.5;
  }
}

