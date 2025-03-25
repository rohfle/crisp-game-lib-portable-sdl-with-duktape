function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
title = "UP DOWN PRESS";
description = "\n[Tap]  Jump\n[Hold] Speed up\n";
characters = [];
options = {
  viewSize: {
    x: 200,
    y: 100
  },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 600
};
var roads;
var nextRoadDist;
var cars;
var nextCarDist;
var scr;
var myCar;
var multiplier;
var myCarSize = 5;
var myCarSpeed = 1;
function update() {
  if (!ticks) {
    roads = [{
      from: vec(0, 50),
      to: vec(100, 50),
      angle: 0
    }];
    nextRoadDist = -250;
    cars = [];
    nextCarDist = 0;
    scr = vec();
    myCar = {
      pos: vec(20, 50),
      vy: 0,
      vx: 0,
      angle: 0,
      speed: 1,
      state: "ground"
    };
    multiplier = 1;
  }
  scr.set(difficulty * 0.1);
  if (myCar.pos.x > 50) {
    scr.x += (myCar.pos.x - 50) * 0.1;
  }
  var _calcRoad = calcRoad(myCar.pos.x + 50),
    _calcRoad2 = _slicedToArray(_calcRoad, 2),
    ry = _calcRoad2[0],
    _ = _calcRoad2[1];
  if (ry < 60) {
    scr.y += (ry - 60) * 0.1;
  } else if (ry > 90) {
    scr.y += (ry - 90) * 0.1;
  }
  nextRoadDist -= scr.x;
  while (nextRoadDist < 0) {
    var lr = roads[roads.length - 1];
    var from = vec(lr.to);
    var to = vec(lr.to);
    var w = rnd(20, 60);
    to.x += w;
    if (lr.from.y - lr.to.y === 0) {
      to.y += rnds(0.4, 1.1) * w;
    }
    roads.push({
      from: from,
      to: to,
      angle: from.angleTo(to)
    });
    nextRoadDist += w;
  }
  color("light_black");
  remove(roads, function (r) {
    r.from.sub(scr);
    r.to.sub(scr);
    line(r.from, r.to);
    return r.to.x < -50;
  });
  myCar.pos.x += myCar.speed * sqrt(difficulty) - scr.x + myCar.vx;
  myCar.vx *= 0.9;
  if (myCar.pos.x < 0) {
    play("lucky");
    end();
  }
  var _calcRoad3 = calcRoad(myCar.pos.x),
    _calcRoad4 = _slicedToArray(_calcRoad3, 2),
    y = _calcRoad4[0],
    a = _calcRoad4[1];
  if (myCar.state === "jump" && myCar.pos.y > y) {
    myCar.state = "ground";
  }
  if (myCar.state === "ground") {
    myCar.pos.y = y;
    myCar.speed += myCarSize * myCar.angle * 0.02;
    myCar.angle += (a - myCar.angle) * 0.025;
    if (input.isJustPressed) {
      play("jump");
      myCar.state = "jump";
      myCar.vy = -2;
      multiplier = 1;
    }
  }
  if (myCar.state === "jump") {
    myCar.pos.y += myCar.vy * sqrt(difficulty);
    myCar.vy += input.isPressed ? 0.05 : 0.2;
    myCar.angle += (atan2(myCar.vy, myCar.speed) - myCar.angle) * 0.05;
  }
  myCar.speed += (myCarSpeed * (input.isPressed ? 2.5 : 0.5) - myCar.speed) * 0.1;
  var p = vec(myCar.pos);
  p.addWithAngle(myCar.angle, myCarSize * 0.6);
  var ts = myCarSize;
  color("blue");
  box(p.x, p.y - ts / 2, ts);
  p.addWithAngle(myCar.angle, myCarSize * -1.2);
  box(p.x, p.y - ts / 2, ts);
  color("cyan");
  p.set(myCar.pos);
  p.addWithAngle(myCar.angle - PI / 2, ts);
  bar(p, myCarSize, myCarSize, myCar.angle);
  p.addWithAngle(myCar.angle - PI / 4 * 3, ts * 0.5);
  bar(p, myCarSize / 2, myCarSize, myCar.angle);
  nextCarDist -= scr.x;
  if (nextCarDist < 0) {
    var _lr = roads[roads.length - 1];
    var speed = rnd(0.3, 1 + sqrt(difficulty));
    var x = speed > 2.5 ? -5 : 205;
    cars.push({
      x: x,
      vx: 0,
      size: rnd(5, 8),
      speed: speed,
      currentSpeed: 0,
      angle: 0,
      color: ["red", "yellow", "green", "purple"][rndi(4)]
    });
    nextCarDist += rnd(100, 120) / sqrt(difficulty);
  }
  remove(cars, function (c) {
    c.x += c.currentSpeed * sqrt(difficulty) - scr.x;
    var _calcRoad5 = calcRoad(c.x),
      _calcRoad6 = _slicedToArray(_calcRoad5, 2),
      y = _calcRoad6[0],
      a = _calcRoad6[1];
    c.currentSpeed += c.size * c.angle * 0.02;
    c.currentSpeed += (c.speed - c.currentSpeed) * 0.1;
    if (y == null) {
      return true;
    }
    c.angle += (a - c.angle) * 0.025;
    var p = vec(c.x, y);
    p.addWithAngle(c.angle, c.size * 0.6);
    var ts = c.size;
    color("black");
    box(p.x, p.y - ts / 2, ts);
    p.addWithAngle(c.angle, c.size * -1.2);
    box(p.x, p.y - ts / 2, ts);
    color(c.color);
    p.set(c.x, y);
    p.addWithAngle(c.angle - PI / 2, ts);
    var cl = bar(p, c.size, c.size, c.angle).isColliding.rect;
    p.addWithAngle(c.angle - PI / 4 * 3, ts * 0.5);
    cl = _objectSpread(_objectSpread({}, cl), bar(p, c.size / 2, c.size, c.angle).isColliding.rect);
    var isPressing = myCar.state === "jump" && myCar.vy >= 0;
    if (isPressing && (cl.cyan || cl.blue)) {
      play("powerUp");
      addScore(multiplier, p);
      if (multiplier < 16) {
        multiplier *= 2;
      }
      particle(p);
      myCar.vy = -2;
      return true;
    }
    if (!isPressing && cl.cyan) {
      myCar.vx = -c.size - myCar.speed * 1.5;
      play("explosion");
      color("cyan");
      particle(myCar.pos, 9, 2, 0, 1);
    }
  });
  function calcRoad(x) {
    var road = [undefined, undefined];
    roads.forEach(function (r) {
      if (r.from.x <= x && x < r.to.x) {
        road = [(r.from.y - r.to.y) * (x - r.to.x) / (r.from.x - r.to.x) + r.to.y, r.angle];
      }
    });
    return road;
  }
}

